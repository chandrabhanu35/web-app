import express from 'express';
import pool from '../db/connection.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Improved randomization function
function shuffleAnswers(question) {
    const options = question.options;
    const correctAnswer = question.correct_answer;
    
    // Create pairs of options and correct answer index
    let pairs = options.map((opt, idx) => ({
        option: opt,
        isCorrect: idx === correctAnswer
    }));
    
    // Shuffle the pairs
    for (let i = pairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    
    // Update question with new order
    question.options = pairs.map(p => p.option);
    question.correct_answer = pairs.findIndex(p => p.isCorrect);
    
    return question;
}

// Get questions with improved distribution
router.get('/questions/:examType', async (req, res) => {
    try {
        const { examType } = req.params;
        const { limit = 50 } = req.query;

        // Calculate balanced distribution
        const easyCount = Math.floor(limit * 0.4);    // 40% easy
        const mediumCount = Math.floor(limit * 0.35); // 35% medium
        const hardCount = Math.ceil(limit * 0.25);    // 25% hard

        // Get questions for each difficulty with answer distribution
        const getQuestionsForDifficulty = async (difficulty, count) => {
            // Get questions with even distribution of correct answers
            const result = await pool.query(`
                WITH AnswerCounts AS (
                    SELECT correct_answer, COUNT(*) as answer_count
                    FROM questions 
                    WHERE exam_type = $1 AND difficulty = $2
                    GROUP BY correct_answer
                ),
                RankedQuestions AS (
                    SELECT q.*,
                           ROW_NUMBER() OVER (
                               PARTITION BY q.correct_answer 
                               ORDER BY RANDOM()
                           ) as rn,
                           ac.answer_count
                    FROM questions q
                    JOIN AnswerCounts ac ON q.correct_answer = ac.correct_answer
                    WHERE q.exam_type = $1 AND q.difficulty = $2
                )
                SELECT *
                FROM RankedQuestions
                WHERE rn <= CEIL($3::float / answer_count)
                LIMIT $3
            `, [examType, difficulty, count]);

            return result.rows;
        };

        // Fetch questions for each difficulty level
        const [easyQuestions, mediumQuestions, hardQuestions] = await Promise.all([
            getQuestionsForDifficulty('easy', easyCount),
            getQuestionsForDifficulty('medium', mediumCount),
            getQuestionsForDifficulty('hard', hardCount)
        ]);

        // Combine all questions
        let questions = [
            ...easyQuestions,
            ...mediumQuestions,
            ...hardQuestions
        ];

        // Randomize answer options for each question
        questions = questions.map(q => shuffleAnswers(q));

        // Final shuffle of questions
        questions = questions.sort(() => Math.random() - 0.5);

        // Track distribution for verification
        const distribution = {
            easy: easyQuestions.length,
            medium: mediumQuestions.length,
            hard: hardQuestions.length,
            answerStats: questions.reduce((stats, q) => {
                stats[q.correct_answer] = (stats[q.correct_answer] || 0) + 1;
                return stats;
            }, {})
        };

        res.json({ questions, distribution });
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ error: error.message });
    }
});

// Enhanced submission endpoint with pattern detection
router.post('/submit', verifyToken, async (req, res) => {
    try {
        const { 
            examType, 
            score, 
            totalQuestions, 
            percentage, 
            timeTaken, 
            categoryScores, 
            answers 
        } = req.body;

        // Analyze answer patterns
        const answerPattern = answers.reduce((pattern, ans) => {
            pattern[ans.selected] = (pattern[ans.selected] || 0) + 1;
            return pattern;
        }, {});

        // Calculate pattern metrics
        const maxSameAnswer = Math.max(...Object.values(answerPattern));
        const patternRatio = maxSameAnswer / answers.length;
        
        // Flag suspicious patterns
        const isSuspicious = patternRatio > 0.7; // 70% same answer is suspicious

        // Insert result with pattern analysis
        const result = await pool.query(
            `INSERT INTO test_results 
             (user_id, exam_type, score, total_questions, percentage, time_taken, 
              category_scores, answers, answer_pattern, is_suspicious)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
             RETURNING *`,
            [
                req.userId, 
                examType, 
                score, 
                totalQuestions, 
                percentage, 
                timeTaken, 
                categoryScores, 
                answers,
                answerPattern,
                isSuspicious
            ]
        );

        // Only update stats if pattern is not suspicious
        if (!isSuspicious) {
            await pool.query(
                `UPDATE users SET 
                 total_tests = total_tests + 1,
                 avg_score = (SELECT AVG(percentage) 
                             FROM test_results 
                             WHERE user_id = $1 AND NOT is_suspicious),
                 best_score = CASE 
                     WHEN $2 > best_score THEN $2 
                     ELSE best_score 
                 END
                 WHERE id = $1`,
                [req.userId, percentage]
            );

            await updateLeaderboard(req.userId);
        }

        res.status(201).json({ 
            message: 'Test result saved',
            result: result.rows[0],
            status: isSuspicious ? 'flagged' : 'normal'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Updated leaderboard calculation
const updateLeaderboard = async (userId) => {
    try {
        const result = await pool.query(
            `SELECT 
                SUM(score) as total_score,
                COUNT(*) as tests_completed,
                AVG(percentage) as avg_percentage
             FROM test_results 
             WHERE user_id = $1 AND NOT is_suspicious`,
            [userId]
        );

        const { total_score, tests_completed, avg_percentage } = result.rows[0];

        await pool.query(
            `INSERT INTO leaderboard 
             (user_id, total_score, tests_completed, avg_percentage)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id) 
             DO UPDATE SET 
                total_score = $2,
                tests_completed = $3,
                avg_percentage = $4
             WHERE leaderboard.user_id = $1`,
            [userId, total_score, tests_completed, avg_percentage]
        );
    } catch (error) {
        console.error('Error updating leaderboard:', error);
    }
};

// Enhanced leaderboard with additional metrics
router.get('/leaderboard', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                u.id,
                u.name,
                u.profile_pic,
                l.total_score,
                l.tests_completed,
                l.avg_percentage,
                ROW_NUMBER() OVER (
                    ORDER BY l.avg_percentage DESC, 
                           l.tests_completed DESC
                ) as rank
             FROM leaderboard l
             JOIN users u ON l.user_id = u.id
             ORDER BY 
                l.avg_percentage DESC,
                l.tests_completed DESC
             LIMIT 100`
        );

        res.json({ leaderboard: result.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;