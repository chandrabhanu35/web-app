import express from 'express';
import pool from '../db/connection.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Function to shuffle array
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Function to shuffle answer options and update correct_answer index
function shuffleQuestionOptions(question) {
    try {
        // Parse options if they're stored as JSON string
        let options = question.options;
        if (typeof options === 'string') {
            options = JSON.parse(options);
        }

        // Current correct answer index
        let correctAnswerIndex = question.correct_answer;
        if (typeof correctAnswerIndex === 'string') {
            correctAnswerIndex = parseInt(correctAnswerIndex);
        }

        // Create pairs of (option, isCorrect)
        const optionPairs = options.map((opt, idx) => ({
            text: opt,
            isCorrect: idx === correctAnswerIndex
        }));

        // Shuffle the pairs
        const shuffledPairs = shuffleArray(optionPairs);

        // Extract new options and find new correct answer index
        const newOptions = shuffledPairs.map(pair => pair.text);
        const newCorrectAnswerIndex = shuffledPairs.findIndex(pair => pair.isCorrect);

        // Return shuffled question
        return {
            ...question,
            options: newOptions,
            correct_answer: newCorrectAnswerIndex
        };
    } catch (error) {
        console.error('Error shuffling question options:', error);
        return question; // Return unmodified if error occurs
    }
}

// Get questions with balanced difficulty distribution and shuffled options
router.get('/questions/:examType', async (req, res) => {
    try {
        const { examType } = req.params;
        const { limit = 50 } = req.query;

        // Calculate number of questions for each difficulty level
        const easyCount = Math.floor(limit * 0.4); // 40% easy
        const mediumCount = Math.floor(limit * 0.35); // 35% medium
        const hardCount = Math.floor(limit * 0.25); // 25% hard

        // Get questions for each difficulty level
        const easyQuestions = await pool.query(
            'SELECT * FROM questions WHERE exam_type = $1 AND difficulty = $2 ORDER BY RANDOM() LIMIT $3',
            [examType, 'easy', easyCount]
        );

        const mediumQuestions = await pool.query(
            'SELECT * FROM questions WHERE exam_type = $1 AND difficulty = $2 ORDER BY RANDOM() LIMIT $3',
            [examType, 'medium', mediumCount]
        );

        const hardQuestions = await pool.query(
            'SELECT * FROM questions WHERE exam_type = $1 AND difficulty = $2 ORDER BY RANDOM() LIMIT $3',
            [examType, 'hard', hardCount]
        );

        // Combine all questions
        let questions = [
            ...easyQuestions.rows,
            ...mediumQuestions.rows,
            ...hardQuestions.rows
        ];

        // Shuffle the question order
        questions = shuffleArray(questions);

        // CRITICAL: Shuffle answer options for EACH question
        // This prevents gaming the system by always selecting A
        questions = questions.map(q => shuffleQuestionOptions(q));

        // Analyze answer distribution for verification
        const answerDistribution = {
            A: 0, B: 0, C: 0, D: 0
        };
        questions.forEach(q => {
            const pos = ['A', 'B', 'C', 'D'][q.correct_answer];
            if (pos) answerDistribution[pos]++;
        });

        res.json({ 
            questions,
            distribution: {
                easy: easyQuestions.rows.length,
                medium: mediumQuestions.rows.length,
                hard: hardQuestions.rows.length,
                answerDistribution: answerDistribution
            }
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ error: error.message });
    }
});

// Submit test result with answer pattern analysis
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { examType, score, totalQuestions, percentage, timeTaken, categoryScores, answers } = req.body;

    // Analyze answer patterns to detect gaming
    const answerPattern = {};
    answers.forEach(ans => {
        const pos = ['A', 'B', 'C', 'D'][ans.selected];
        answerPattern[pos] = (answerPattern[pos] || 0) + 1;
    });

    // Calculate pattern ratio (highest repeated answer)
    const maxSameAnswer = Math.max(...Object.values(answerPattern));
    const patternRatio = (maxSameAnswer / answers.length) * 100;

    // Flag if >75% answers are the same option
    const isSuspicious = patternRatio > 75;

    // Log suspicious activity
    if (isSuspicious) {
        console.warn(`⚠️  SUSPICIOUS PATTERN: User ${req.userId} answered ${patternRatio.toFixed(1)}% same option`, answerPattern);
    }

    console.log('Submitting test:', {
        userId: req.userId,
        examType,
        score,
        totalQuestions,
        percentage,
        timeTaken
    });

    const result = await pool.query(
      `INSERT INTO test_results 
       (user_id, exam_type, score, total_questions, percentage, time_taken, category_scores, answers, answer_pattern, is_suspicious)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [
          req.userId, 
          examType, 
          score, 
          totalQuestions, 
          percentage, 
          timeTaken, 
          JSON.stringify(categoryScores),
          JSON.stringify(answers),
          JSON.stringify(answerPattern),
          isSuspicious
      ]
    );

    console.log('Test result saved:', result.rows[0]);

    // Only update user stats if NOT suspicious
    if (!isSuspicious) {
        // Calculate XP rewards
        const XP_BASE = 100;
        const XP_PER_CORRECT = 10;
        const XP_PERFECT_BONUS = 200;
        
        let xpGained = XP_BASE + (score * XP_PER_CORRECT);
        if (score === totalQuestions) {
            xpGained += XP_PERFECT_BONUS;
        }

        // Check if streak should continue or reset
        const today = new Date().toISOString().split('T')[0];
        const userLastTest = await pool.query(
            `SELECT MAX(created_at::date) as last_test_date FROM test_results 
             WHERE user_id = $1 AND is_suspicious = false`,
            [req.userId]
        );

        let newStreak = 1;
        let longestStreak = 1;
        
        if (userLastTest.rows[0]?.last_test_date) {
            const lastDate = new Date(userLastTest.rows[0].last_test_date);
            const currentDate = new Date(today);
            const daysDiff = (currentDate - lastDate) / (1000 * 60 * 60 * 24);
            
            if (daysDiff === 1) {
                // Streak continues - get current streak
                const streakResult = await pool.query(
                    `SELECT streak_count FROM users WHERE id = $1`,
                    [req.userId]
                );
                newStreak = (streakResult.rows[0]?.streak_count || 0) + 1;
            }
        }

        // Calculate average score
        const avgResult = await pool.query(
            `SELECT AVG(percentage) as avg_percent FROM test_results WHERE user_id = $1 AND is_suspicious = false`,
            [req.userId]
        );
        const avgScore = parseFloat(avgResult.rows[0]?.avg_percent) || 0;

        // Update user stats with XP and streak
        const updateResult = await pool.query(
          `UPDATE users SET 
           total_tests = total_tests + 1, 
           experience_points = experience_points + $1,
           streak_count = $2,
           avg_score = $3,
           best_score = CASE WHEN $4 > best_score THEN $4 ELSE best_score END,
           updated_at = NOW()
           WHERE id = $5
           RETURNING id, name, experience_points, streak_count, total_tests, best_score, avg_score`,
          [xpGained, newStreak, avgScore, percentage, req.userId]
        );

        console.log('User stats updated:', updateResult.rows[0]);

        await updateLeaderboard(req.userId);
        
        // Get updated user stats to return
        const updatedUser = updateResult;

        res.status(201).json({ 
            message: 'Test result saved', 
            result: result.rows[0],
            status: 'normal',
            xpGained: xpGained,
            newStreak: newStreak,
            updatedStats: updatedUser.rows[0],
            answerPattern: answerPattern,
            patternRatio: patternRatio.toFixed(1)
        });
    } else {
        res.status(201).json({ 
            message: 'Test result saved but flagged as suspicious', 
            result: result.rows[0],
            status: 'flagged',
            answerPattern: answerPattern,
            patternRatio: patternRatio.toFixed(1)
        });
    }
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ error: error.message });
  }
});

const updateLeaderboard = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT SUM(score) as total_score, COUNT(*) as tests_completed FROM test_results WHERE user_id = $1`,
      [userId]
    );

    const { total_score, tests_completed } = result.rows[0];

    await pool.query(
      `INSERT INTO leaderboard (user_id, total_score, tests_completed) VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET total_score = $2, tests_completed = $3
       WHERE leaderboard.user_id = $1`,
      [userId, total_score, tests_completed]
    );
  } catch (error) {
    console.error('Error updating leaderboard:', error);
  }
};

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.profile_pic, l.total_score, l.tests_completed,
              ROW_NUMBER() OVER (ORDER BY l.total_score DESC) as rank
       FROM leaderboard l
       JOIN users u ON l.user_id = u.id
       ORDER BY l.total_score DESC LIMIT 100`
    );

    res.json({ leaderboard: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
