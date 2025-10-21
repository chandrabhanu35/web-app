import pool from './connection.js';
import bcrypt from 'bcryptjs';

// Default Admin Credentials
const DEFAULT_ADMIN = {
  name: 'bhanu',
  email: 'bhanu@aptitude.com',
  mobile: '7032151348',
  password: 'Ncb8008535@'
};

export const setupDefaultAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [DEFAULT_ADMIN.email]
    );

    let userId;

    if (existingAdmin.rows.length > 0) {
      userId = existingAdmin.rows[0].id;
      console.log('✅ Admin account already exists (user_id: ' + userId + ')');
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);

      // Create admin user
      const userResult = await pool.query(
        'INSERT INTO users (name, email, mobile, password_hash, is_active, is_verified) VALUES ($1, $2, $3, $4, true, true) RETURNING id',
        [DEFAULT_ADMIN.name, DEFAULT_ADMIN.email, DEFAULT_ADMIN.mobile, hashedPassword]
      );

      userId = userResult.rows[0].id;
      console.log('✅ New admin account created (user_id: ' + userId + ')');
    }

    // Always ensure admin role exists (even if user already existed)
    const adminRoleExists = await pool.query(
      'SELECT id FROM admin_users WHERE user_id = $1',
      [userId]
    );

    if (adminRoleExists.rows.length === 0) {
      // Create admin role
      await pool.query(
        'INSERT INTO admin_users (user_id, role, permissions) VALUES ($1, $2, $3)',
        [userId, 'admin', ['all']]
      );
      console.log('✅ Admin role created');
    } else {
      console.log('✅ Admin role already exists');
    }

    return { success: true };
  } catch (error) {
    console.error('⚠️ Admin setup warning:', error.message);
    return { success: true }; // Don't fail startup
  }
};

export default setupDefaultAdmin;
