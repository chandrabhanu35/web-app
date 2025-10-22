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
    console.log('🔐 Setting up admin user...');
    
    // Check if admin already exists
    let existingAdmin;
    try {
      existingAdmin = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [DEFAULT_ADMIN.email]
      );
    } catch (queryError) {
      console.warn('⚠️ Could not query users table:', queryError.message);
      return { success: true };
    }

    let userId;

    if (existingAdmin.rows.length > 0) {
      userId = existingAdmin.rows[0].id;
      console.log('✅ Admin account already exists (user_id: ' + userId + ')');
    } else {
      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);

        // Create admin user
        const userResult = await pool.query(
          'INSERT INTO users (name, email, mobile, password_hash, is_active, is_verified) VALUES ($1, $2, $3, $4, true, true) RETURNING id',
          [DEFAULT_ADMIN.name, DEFAULT_ADMIN.email, DEFAULT_ADMIN.mobile, hashedPassword]
        );

        userId = userResult.rows[0].id;
        console.log('✅ New admin account created (user_id: ' + userId + ')');
        console.log('   📧 Email:', DEFAULT_ADMIN.email);
        console.log('   🔐 Password:', DEFAULT_ADMIN.password);
      } catch (createError) {
        console.warn('⚠️ Could not create admin user:', createError.message);
        return { success: true };
      }
    }

    // Always ensure admin role exists (even if user already existed)
    let adminRoleExists;
    try {
      adminRoleExists = await pool.query(
        'SELECT id FROM admin_users WHERE user_id = $1',
        [userId]
      );
    } catch (roleQueryError) {
      console.warn('⚠️ Could not query admin_users table:', roleQueryError.message);
      return { success: true };
    }

    if (adminRoleExists.rows.length === 0) {
      try {
        // Create admin role
        await pool.query(
          'INSERT INTO admin_users (user_id, role, permissions) VALUES ($1, $2, $3)',
          [userId, 'admin', JSON.stringify(['all'])]
        );
        console.log('✅ Admin role created');
      } catch (roleCreateError) {
        console.warn('⚠️ Could not create admin role:', roleCreateError.message);
        return { success: true };
      }
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
