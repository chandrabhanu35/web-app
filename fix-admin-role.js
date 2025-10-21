import pool from './db/connection.js';

// This script fixes the admin role for the default admin user
async function fixAdminRole() {
  try {
    console.log('🔧 Fixing admin role...');
    
    // Get the admin user
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['bhanu@aptitude.com']
    );

    if (userResult.rows.length === 0) {
      console.error('❌ Admin user not found');
      process.exit(1);
    }

    const userId = userResult.rows[0].id;
    console.log(`✅ Found admin user with ID: ${userId}`);

    // Check if admin role already exists
    const adminCheck = await pool.query(
      'SELECT id FROM admin_users WHERE user_id = $1',
      [userId]
    );

    if (adminCheck.rows.length > 0) {
      console.log('✅ Admin role already exists');
    } else {
      // Add admin role
      await pool.query(
        'INSERT INTO admin_users (user_id, role, permissions) VALUES ($1, $2, $3)',
        [userId, 'admin', ['all']]
      );
      console.log('✅ Admin role added successfully');
    }

    // Verify the role was added
    const verifyResult = await pool.query(
      'SELECT role FROM admin_users WHERE user_id = $1',
      [userId]
    );

    console.log('✅ Verification - Admin role:', verifyResult.rows[0].role);
    console.log('✅ Fix complete! You can now login as admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing admin role:', error.message);
    process.exit(1);
  }
}

fixAdminRole();
