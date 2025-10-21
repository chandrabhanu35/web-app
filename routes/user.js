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

// Get comprehensive stats
router.get('/stats', verifyToken, async (req, res) => {
  try {
    // Get user stats
    const userResult = await pool.query(
      `SELECT 
        id, name, email, 
        total_tests, best_score, avg_score, 
        experience_points, streak_count,
        updated_at
       FROM users WHERE id = $1`,
      [req.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get exam type breakdown
    const examStatsResult = await pool.query(
      `SELECT 
        exam_type,
        COUNT(*) as attempts,
        AVG(percentage) as avg_score,
        MAX(percentage) as best_score,
        MIN(percentage) as worst_score
       FROM test_results 
       WHERE user_id = $1 AND is_suspicious = false
       GROUP BY exam_type`,
      [req.userId]
    );

    // Get recent tests
    const recentTestsResult = await pool.query(
      `SELECT 
        id, exam_type, score, total_questions, percentage, time_taken, created_at
       FROM test_results 
       WHERE user_id = $1 AND is_suspicious = false
       ORDER BY created_at DESC 
       LIMIT 5`,
      [req.userId]
    );

    // Get category performance
    const categoryStatsResult = await pool.query(
      `SELECT 
        category_scores
       FROM test_results 
       WHERE user_id = $1 AND is_suspicious = false
       ORDER BY created_at DESC 
       LIMIT 10`,
      [req.userId]
    );

    // Calculate category averages
    const categoryPerformance = {};
    categoryStatsResult.rows.forEach(row => {
      if (row.category_scores) {
        Object.entries(row.category_scores).forEach(([category, stats]) => {
          if (!categoryPerformance[category]) {
            categoryPerformance[category] = { total: 0, scores: [] };
          }
          if (stats.total > 0) {
            const percentage = (stats.correct / stats.total) * 100;
            categoryPerformance[category].scores.push(percentage);
          }
        });
      }
    });

    // Calculate averages
    const categoryAverage = {};
    Object.entries(categoryPerformance).forEach(([category, data]) => {
      if (data.scores.length > 0) {
        const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
        categoryAverage[category] = parseFloat(avg.toFixed(2));
      }
    });

    // Ensure numeric values and convert nulls to 0
    const statsPayload = {
      totalTests: parseInt(user.total_tests) || 0,
      bestScore: parseFloat(user.best_score) || 0,
      avgScore: parseFloat(user.avg_score) || 0,
      experiencePoints: parseInt(user.experience_points) || 0,
      streakCount: parseInt(user.streak_count) || 0,
      level: Math.floor(((parseInt(user.experience_points) || 0) / 1000)) + 1
    };

    console.log('User row from DB:', user);
    console.log('Processed stats:', statsPayload);

    res.json({
      stats: statsPayload,
      examStats: examStatsResult.rows.map(row => ({
        examType: row.exam_type,
        attempts: row.attempts,
        avgScore: parseFloat(row.avg_score || 0),
        bestScore: parseFloat(row.best_score || 0),
        worstScore: parseFloat(row.worst_score || 0)
      })),
      recentTests: recentTestsResult.rows.map(row => ({
        id: row.id,
        examType: row.exam_type,
        score: row.score,
        totalQuestions: row.total_questions,
        percentage: parseFloat(row.percentage || 0),
        timeTaken: row.time_taken,
        date: row.created_at
      })),
      categoryPerformance: categoryAverage
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
