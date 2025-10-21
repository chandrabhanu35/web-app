import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../db/connection.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_change_in_production';

// ⚠️ SECURITY: Fail if using weak default secret
if (JWT_SECRET === 'your_secret_key_change_in_production') {
  console.warn('⚠️ WARNING: Using default JWT_SECRET. This is unsafe for production!');
  console.warn('📝 Set JWT_SECRET in .env file with a strong random value (min 32 characters)');
}

// Helper function to hash token for storage
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// 🆕 FIXED: Update session activity on each request
export const updateSessionActivity = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const tokenHash = hashToken(token);
      try {
        await pool.query(
          `UPDATE sessions SET last_activity = CURRENT_TIMESTAMP 
           WHERE token_hash = $1 AND is_active = true`,
          [tokenHash]
        );
      } catch (sessionError) {
        // Silently ignore if sessions table doesn't exist
        if (!sessionError.message.includes('does not exist')) {
          console.warn('Session update warning:', sessionError.message);
        }
      }
    }
    next();
  } catch (error) {
    // Don't block request if session update fails
    next();
  }
};

export const verifyToken = (req, res, next) => {
  try {
    console.log('Auth header:', req.headers.authorization);
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }

    console.log('Token:', token.substring(0, 20) + '...');
    console.log('JWT_SECRET:', JWT_SECRET.substring(0, 5) + '...');
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ error: `Token verification failed: ${error.message}` });
  }
};

// ✅ FIXED: Actually verify admin from database
export const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token first
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;

    // Check if user is admin in admin_users table
    const adminCheck = await pool.query(
      'SELECT role, permissions FROM admin_users WHERE user_id = $1 AND role = $2',
      [req.userId, 'admin']
    );

    if (adminCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Admin access required - User is not an admin' });
    }

    req.isAdmin = true;
    req.permissions = adminCheck.rows[0].permissions;
    next();
  } catch (error) {
    console.error('Admin verification error:', error.message);
    res.status(403).json({ error: 'Admin access required' });
  }
};
