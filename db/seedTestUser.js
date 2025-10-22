import pool from './connection.js';
import bcrypt from 'bcryptjs';

// Test User for development/testing
const TEST_USER = {
  name: 'Bhanu Test',
  email: 'bhanu@gmail.com',
  mobile: '9999999999',
  password: '123456'
};

export const seedTestUser = async () => {
  try {
    // Check if test user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [TEST_USER.email]
    );

    if (existingUser.rows.length > 0) {
      console.log('✅ Test user already exists:', TEST_USER.email);
      return { success: true };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);

    // Create test user
    const userResult = await pool.query(
      'INSERT INTO users (name, email, mobile, password_hash, is_active, is_verified) VALUES ($1, $2, $3, $4, true, true) RETURNING id, name, email',
      [TEST_USER.name, TEST_USER.email, TEST_USER.mobile, hashedPassword]
    );

    console.log('✅ Test user created:', TEST_USER.email);
    console.log('   📧 Email: ' + TEST_USER.email);
    console.log('   🔐 Password: ' + TEST_USER.password);
    
    return { success: true };
  } catch (error) {
    console.warn('⚠️ Test user seed warning:', error.message);
    return { success: true }; // Don't fail startup
  }
};

export default seedTestUser;
