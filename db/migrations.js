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

    // Check if reviews table exists
    const reviewsTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'reviews'
      )
    `);

    if (!reviewsTableCheck.rows[0].exists) {
      console.log('📝 Creating reviews table...');
      await pool.query(`
        CREATE TABLE reviews (
          id SERIAL PRIMARY KEY,
          user_id INTEGER,
          rating INTEGER CHECK (rating >= 1 AND rating <= 5),
          liked_paper BOOLEAN,
          questions_faced TEXT[],
          problems_faced TEXT,
          feedback TEXT,
          chatbot_responses JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        
        CREATE INDEX idx_reviews_user_id ON reviews(user_id);
        CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
        CREATE INDEX idx_reviews_rating ON reviews(rating);
      `);
      console.log('✅ Created reviews table');
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
