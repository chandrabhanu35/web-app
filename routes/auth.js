import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../db/connection.js';
import { verifyToken } from '../middleware/auth.js';
import { validateInput } from '../middleware/validation.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_change_in_production';

// Helper function to hash token for storage
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { name, email, mobile, password, confirmPassword } = req.body;

    // ✅ FIXED: Input validation
    let validation = validateInput.name(name);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    validation = validateInput.email(email);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    validation = validateInput.mobile(mobile);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    validation = validateInput.password(password);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR mobile = $2',
      [email, mobile]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email or mobile already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (name, email, mobile, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
      [name, email, mobile, hashedPassword]
    );

    const user = result.rows[0];

    // Create token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    // 🆕 FIXED: Track login session (with error handling)
    const tokenHash = hashToken(token);
    try {
      await pool.query(
        `INSERT INTO sessions (user_id, token_hash, user_agent, ip_address, last_activity)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
        [user.id, tokenHash, req.get('user-agent') || '', req.ip || '']
      );
    } catch (sessionError) {
      // If sessions table doesn't exist yet, just log and continue
      console.warn('⚠️ Warning: Could not create session record:', sessionError.message);
    }

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    // Ensure proper JSON content type
    if (!req.is('application/json')) {
      return res.status(415).json({ error: 'Content-Type must be application/json' });
    }

    const { email, password } = req.body;

    // Check for missing required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // ✅ FIXED: Input validation
    let validation = validateInput.email(email);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    validation = validateInput.password(password);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    console.log('Attempting login for email:', email); // Debug log

    let result;
    try {
      result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    } catch (dbError) {
      console.error('Database query failed:', dbError.message);
      return res.status(500).json({ error: 'Database connection error' });
    }

    if (result.rows.length === 0) {
      console.log('No user found for email:', email); // Debug log
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    console.log('User found, verifying password for:', email);

    // Verify password
    let isPasswordValid;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password_hash);
    } catch (bcryptError) {
      console.error('Password comparison failed:', bcryptError.message);
      return res.status(500).json({ error: 'Authentication processing error' });
    }

    if (!isPasswordValid) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    // 🆕 FIXED: Track login session (with error handling)
    const tokenHash = hashToken(token);
    try {
      await pool.query(
        `INSERT INTO sessions (user_id, token_hash, user_agent, ip_address, last_activity)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
        [user.id, tokenHash, req.get('user-agent') || '', req.ip || '']
      );
    } catch (sessionError) {
      // If sessions table doesn't exist yet, just log and continue
      console.warn('⚠️ Warning: Could not create session record:', sessionError.message);
    }

    console.log('✅ Login successful for:', email);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        profilePic: user.profile_pic
      }
    });
  } catch (error) {
    console.error('❌ Login error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      error: 'Server error during login',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// ADMIN LOGIN - Only allows admin users
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ FIXED: Input validation
    let validation = validateInput.email(email);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    validation = validateInput.password(password);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    // First check if user exists
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const user = userResult.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Check if user is an admin
    const adminCheck = await pool.query(
      'SELECT role FROM admin_users WHERE user_id = $1 AND role = $2',
      [user.id, 'admin']
    );

    if (adminCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    // Create token with admin flag
    const token = jwt.sign(
      { userId: user.id, email: user.email, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Track admin session
    const tokenHash = hashToken(token);
    try {
      await pool.query(
        `INSERT INTO sessions (user_id, token_hash, user_agent, ip_address, last_activity)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
        [user.id, tokenHash, req.get('user-agent') || '', req.ip || '']
      );
    } catch (sessionError) {
      // If sessions table doesn't exist yet, just log and continue
      console.warn('⚠️ Warning: Could not create session record:', sessionError.message);
    }

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error during admin login' });
  }
});

// VERIFY TOKEN
router.get('/verify', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, mobile, profile_pic FROM users WHERE id = $1',
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

// LOGOUT - Remove session
router.post('/logout', verifyToken, async (req, res) => {
  try {
    // 🆕 FIXED: Remove session on logout
    await pool.query(
      'UPDATE sessions SET is_active = false WHERE user_id = $1 AND is_active = true',
      [req.userId]
    );
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
