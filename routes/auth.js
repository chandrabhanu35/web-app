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

    console.log('📝 Signup attempt for email:', email);

    // ✅ FIXED: Input validation
    let validation = validateInput.name(name);
    if (!validation.valid) {
      console.log('❌ Name validation failed:', name);
      return res.status(400).json({ error: validation.error });
    }

    validation = validateInput.email(email);
    if (!validation.valid) {
      console.log('❌ Email validation failed:', email);
      return res.status(400).json({ error: validation.error });
    }

    validation = validateInput.mobile(mobile);
    if (!validation.valid) {
      console.log('❌ Mobile validation failed:', mobile);
      return res.status(400).json({ error: validation.error });
    }

    validation = validateInput.password(password);
    if (!validation.valid) {
      console.log('❌ Password validation failed');
      return res.status(400).json({ error: validation.error });
    }

    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match');
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check if user exists
    let existingUser;
    try {
      existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1 OR mobile = $2',
        [email, mobile]
      );
    } catch (dbError) {
      console.error('❌ Database query failed (checking existing user):', dbError.message);
      return res.status(500).json({ error: 'Database connection error' });
    }

    if (existingUser.rows.length > 0) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ error: 'Email or mobile already registered' });
    }

    console.log('✓ Validation passed, hashing password...');

    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (bcryptError) {
      console.error('❌ Password hashing failed:', bcryptError.message);
      return res.status(500).json({ error: 'Authentication processing error' });
    }

    console.log('✓ Creating user in database...');

    // Create user
    let result;
    try {
      result = await pool.query(
        'INSERT INTO users (name, email, mobile, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
        [name, email, mobile, hashedPassword]
      );
    } catch (createUserError) {
      console.error('❌ User creation failed:', {
        message: createUserError.message,
        code: createUserError.code,
        detail: createUserError.detail
      });
      return res.status(500).json({ 
        error: 'Failed to create user',
        details: process.env.NODE_ENV !== 'production' ? createUserError.message : undefined
      });
    }

    const user = result.rows[0];
    console.log('✓ User created with ID:', user.id);

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
      console.log('✓ Session created');
    } catch (sessionError) {
      // If sessions table doesn't exist yet, just log and continue
      console.warn('⚠️ Session creation warning:', sessionError.message);
    }

    console.log('✅ Signup successful for:', email);
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('❌ Signup error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      error: 'Server error during signup',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
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

    console.log('🔐 Admin login attempt for:', email);

    // ✅ FIXED: Input validation
    let validation = validateInput.email(email);
    if (!validation.valid) {
      console.log('❌ Email validation failed:', email);
      return res.status(400).json({ error: validation.error });
    }

    validation = validateInput.password(password);
    if (!validation.valid) {
      console.log('❌ Password validation failed');
      return res.status(400).json({ error: validation.error });
    }

    // First check if user exists
    let userResult;
    try {
      userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    } catch (dbError) {
      console.error('❌ Database query failed:', dbError.message);
      return res.status(500).json({ error: 'Database connection error' });
    }

    if (userResult.rows.length === 0) {
      console.log('❌ Admin user not found:', email);
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const user = userResult.rows[0];
    console.log('✓ User found:', email);

    // Verify password
    let isPasswordValid;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password_hash);
    } catch (bcryptError) {
      console.error('❌ Password comparison failed:', bcryptError.message);
      return res.status(500).json({ error: 'Authentication processing error' });
    }

    if (!isPasswordValid) {
      console.log('❌ Invalid password for admin:', email);
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    console.log('✓ Password verified');

    // Check if user is an admin
    let adminCheck;
    try {
      adminCheck = await pool.query(
        'SELECT role FROM admin_users WHERE user_id = $1 AND role = $2',
        [user.id, 'admin']
      );
    } catch (adminCheckError) {
      console.error('❌ Admin check query failed:', adminCheckError.message);
      // Don't fail - try to continue
    }

    if (!adminCheck || adminCheck.rows.length === 0) {
      console.log('❌ Admin privileges not found for user:', email);
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    console.log('✓ Admin privileges confirmed');

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
      console.warn('⚠️ Session record failed:', sessionError.message);
    }

    console.log('✅ Admin login successful for:', email);
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
    console.error('❌ Admin login error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      error: 'Server error during admin login',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
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
