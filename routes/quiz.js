import express from 'express';
import pool from '../db/connection.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get questions with balanced difficulty distribution
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

        // Combine and shuffle all questions
        let questions = [
            ...easyQuestions.rows,
            ...mediumQuestions.rows,
            ...hardQuestions.rows
        ].sort(() => Math.random() - 0.5);

        res.json({ 
            questions,
            distribution: {
                easy: easyQuestions.rows.length,
                medium: mediumQuestions.rows.length,
                hard: hardQuestions.rows.length
            }
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ error: error.message });
    }
});

// Submit test result
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { examType, score, totalQuestions, percentage, timeTaken, categoryScores, answers } = req.body;

    const result = await pool.query(
      `INSERT INTO test_results (user_id, exam_type, score, total_questions, percentage, time_taken, category_scores, answers)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.userId, examType, score, totalQuestions, percentage, timeTaken, categoryScores, answers]
    );

    // Update user stats
    await pool.query(
      `UPDATE users SET total_tests = total_tests + 1, avg_score = 
       (SELECT AVG(percentage) FROM test_results WHERE user_id = $1),
       best_score = CASE WHEN $2 > best_score THEN $2 ELSE best_score END
       WHERE id = $1`,
      [req.userId, percentage]
    );

    // Update leaderboard
    await updateLeaderboard(req.userId);

    res.status(201).json({ message: 'Test result saved', result: result.rows[0] });
  } catch (error) {
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
