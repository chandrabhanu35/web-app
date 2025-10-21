import express from 'express';
import pool from '../db/connection.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import { validateInput } from '../middleware/validation.js';

const router = express.Router();

// ✅ FIXED: Use verifyAdmin
// Get currently online users (MUST be before /users/:userId)
router.get('/users/online', verifyAdmin, async (req, res) => {
  try {
    // 🆕 FIXED: Get users with active sessions in last 30 minutes
    let result;
    try {
      result = await pool.query(
        `SELECT DISTINCT u.id, u.name, u.email, u.profile_pic, MAX(s.last_activity) as last_seen
         FROM users u
         INNER JOIN sessions s ON u.id = s.user_id
         WHERE s.is_active = true AND s.last_activity > NOW() - INTERVAL '30 minutes'
         GROUP BY u.id, u.name, u.email, u.profile_pic
         ORDER BY last_seen DESC`
      );
    } catch (sessionError) {
      // If sessions table doesn't exist, return empty array
      console.warn('⚠️ Sessions table query failed:', sessionError.message);
      result = { rows: [] };
    }

    res.json({ onlineUsers: result.rows, totalOnline: result.rows.length });
  } catch (error) {
    console.error('Online users error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user login history (MUST be before /users/:userId)
router.get('/users/login-history', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, COUNT(DISTINCT DATE(tr.created_at)) as days_active,
              MAX(tr.created_at) as last_seen, COUNT(tr.id) as total_tests
       FROM users u
       LEFT JOIN test_results tr ON u.id = tr.user_id
       GROUP BY u.id, u.name, u.email
       ORDER BY last_seen DESC
       LIMIT 100`
    );

    res.json({ loginHistory: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ FIXED: Use verifyAdmin instead of just verifyToken
// Get all users (admin only)
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, mobile, profile_pic, total_tests, best_score, avg_score, 
              created_at, is_active FROM users WHERE is_active = true ORDER BY created_at DESC`
    );

    // ✅ FIXED: Filter out sensitive fields
    const safeUsers = result.rows.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      mobile: u.mobile,
      profile_pic: u.profile_pic,
      total_tests: u.total_tests,
      best_score: u.best_score,
      avg_score: u.avg_score,
      created_at: u.created_at,
      is_active: u.is_active
    }));

    res.json({ users: safeUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ FIXED: Use verifyAdmin
// Get user details (admin only) - MUST be AFTER specific routes
router.get('/users/:userId', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // ✅ FIXED: Validate userId is a number
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const testsResult = await pool.query('SELECT * FROM test_results WHERE user_id = $1', [userId]);
    const achievementsResult = await pool.query('SELECT * FROM achievements WHERE user_id = $1', [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    
    // ✅ FIXED: Don't expose password hash
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        profile_pic: user.profile_pic,
        total_tests: user.total_tests,
        best_score: user.best_score,
        avg_score: user.avg_score,
        created_at: user.created_at,
        is_active: user.is_active
      },
      tests: testsResult.rows,
      achievements: achievementsResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ FIXED: Use verifyAdmin
// Get dashboard stats (admin only)
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const totalUsersResult = await pool.query('SELECT COUNT(*) FROM users WHERE is_active = true');
    const registeredUsersResult = await pool.query('SELECT COUNT(*) FROM users');
    const totalTestsResult = await pool.query('SELECT COUNT(*) FROM test_results');
    const avgScoreResult = await pool.query('SELECT AVG(percentage) FROM test_results');
    const examStatsResult = await pool.query(
      'SELECT exam_type, COUNT(*) as count, AVG(percentage) as avg_percentage FROM test_results GROUP BY exam_type'
    );
    
    // 🆕 FIXED: Get currently online users (active sessions)
    let activeUsersResult;
    try {
      activeUsersResult = await pool.query(
        `SELECT COUNT(DISTINCT user_id) FROM sessions 
         WHERE is_active = true AND last_activity > NOW() - INTERVAL '30 minutes'`
      );
    } catch (sessionError) {
      // If sessions table doesn't exist, return 0
      console.warn('⚠️ Sessions table query failed:', sessionError.message);
      activeUsersResult = { rows: [{ count: '0' }] };
    }
    
    // Get daily new users
    const newUsersResult = await pool.query(
      `SELECT COUNT(*) FROM users 
       WHERE created_at > NOW() - INTERVAL '24 hours'`
    );

    res.json({
      totalRegisteredUsers: parseInt(registeredUsersResult.rows[0].count),
      totalActiveUsers: parseInt(totalUsersResult.rows[0].count),
      currentlyOnline: parseInt(activeUsersResult.rows[0].count),
      newUsersToday: parseInt(newUsersResult.rows[0].count),
      totalTests: parseInt(totalTestsResult.rows[0].count),
      avgScore: parseFloat(avgScoreResult.rows[0].avg) || 0,
      examStats: examStatsResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ FIXED: Use verifyAdmin and validate input
// Create/Update question (admin only)
router.post('/questions', verifyAdmin, async (req, res) => {
  try {
    const { examType, category, topic, difficulty, questionText, options, correctAnswer, explanation } = req.body;

    // ✅ FIXED: Input validation
    let validation = validateInput.examType(examType);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    validation = validateInput.difficulty(difficulty);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    if (!questionText || questionText.length < 10 || questionText.length > 5000) {
      return res.status(400).json({ error: 'Question text must be 10-5000 characters' });
    }

    if (!Array.isArray(options) || options.length < 2 || options.length > 10) {
      return res.status(400).json({ error: 'Options must be an array with 2-10 items' });
    }

    if (!correctAnswer || correctAnswer < 0 || correctAnswer >= options.length) {
      return res.status(400).json({ error: 'Invalid correct answer index' });
    }

    const result = await pool.query(
      `INSERT INTO questions (exam_type, category, topic, difficulty, question_text, options, correct_answer, explanation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [examType, category, topic, difficulty, questionText, JSON.stringify(options), correctAnswer, explanation]
    );

    res.status(201).json({ message: 'Question added', question: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ FIXED: Use verifyAdmin
// Deactivate user (admin only)
router.put('/users/:userId/deactivate', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    await pool.query('UPDATE users SET is_active = false WHERE id = $1', [userId]);

    res.json({ message: 'User deactivated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ FIXED: Use verifyAdmin
// Get activity report
router.get('/reports/activity', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as tests_taken, AVG(percentage) as avg_score
       FROM test_results GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 30`
    );

    res.json({ activityReport: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ FIXED: Use verifyAdmin
// Get registration trends (last 7 days)
router.get('/reports/registration-trends', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as new_users
       FROM users
       WHERE created_at > NOW() - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    );

    res.json({ registrationTrends: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
