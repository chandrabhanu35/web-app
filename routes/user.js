import express from 'express';
import pool from '../db/connection.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, mobile, profile_pic, bio, experience_points, 
              streak_count, total_tests, best_score, avg_score FROM users WHERE id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, bio, profilePic } = req.body;

    const result = await pool.query(
      'UPDATE users SET name = $1, bio = $2, profile_pic = $3 WHERE id = $4 RETURNING *',
      [name, bio, profilePic, req.userId]
    );

    res.json({ message: 'Profile updated', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get test history
router.get('/test-history', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM test_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [req.userId]
    );

    res.json({ tests: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get achievements
router.get('/achievements', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM achievements WHERE user_id = $1',
      [req.userId]
    );

    res.json({ achievements: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stats
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT total_tests, best_score, avg_score, experience_points, streak_count FROM users WHERE id = $1',
      [req.userId]
    );

    const testsResult = await pool.query(
      'SELECT exam_type, COUNT(*) as count FROM test_results WHERE user_id = $1 GROUP BY exam_type',
      [req.userId]
    );

    res.json({
      stats: userResult.rows[0],
      examStats: testsResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
