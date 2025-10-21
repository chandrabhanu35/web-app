import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Use DATABASE_URL if available (Render), otherwise use individual env vars
const config = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // Required for Render's DB
    }
  : {
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'aptitude_hub'
    };

console.log('DB Config:', {
  ...config,
  password: '***hidden***'
});

const pool = new Pool(config);

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected at:', res.rows[0].now);
  }
});

export default pool;
