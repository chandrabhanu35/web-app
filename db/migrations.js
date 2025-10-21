import pool from './connection.js';

/**
 * Database migrations to add missing columns to existing tables
 */
export const runMigrations = async () => {
  try {
    console.log('🔄 Running database migrations...');

    // Check if answer_pattern column exists in test_results
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='test_results' AND column_name='answer_pattern'
    `);

    if (columnCheck.rows.length === 0) {
      console.log('📝 Adding answer_pattern column to test_results...');
      await pool.query(`
        ALTER TABLE test_results 
        ADD COLUMN IF NOT EXISTS answer_pattern JSONB
      `);
      console.log('✅ Added answer_pattern column');
    }

    // Check if is_suspicious column exists
    const suspiciousCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='test_results' AND column_name='is_suspicious'
    `);

    if (suspiciousCheck.rows.length === 0) {
      console.log('📝 Adding is_suspicious column to test_results...');
      await pool.query(`
        ALTER TABLE test_results 
        ADD COLUMN IF NOT EXISTS is_suspicious BOOLEAN DEFAULT FALSE
      `);
      console.log('✅ Added is_suspicious column');
    }

    console.log('✅ All migrations completed successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    // Don't fail startup if migrations fail
    return { success: false, error: error.message };
  }
};

export default runMigrations;
