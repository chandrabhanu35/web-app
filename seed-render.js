#!/usr/bin/env node

/**
 * Seed Questions to Render PostgreSQL
 * This script connects to your Render PostgreSQL database and inserts questions
 * 
 * Usage:
 * 1. Get your DATABASE_URL from Render PostgreSQL dashboard
 * 2. Run: DATABASE_URL="your_url_here" node seed-render.js
 */

import pkg from 'pg';
const { Pool } = pkg;
import { generateBulkQuestions } from './db/questionGenerator.js';

// Get DATABASE_URL from environment or use default
const DATABASE_URL = process.env.DATABASE_URL || process.env.RENDER_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set!');
  console.error('\n📋 To use this script:');
  console.error('1. Go to https://dashboard.render.com/');
  console.error('2. Click your PostgreSQL database');
  console.error('3. Copy the "External Database URL"');
  console.error('4. Run: DATABASE_URL="paste_url_here" node seed-render.js');
  process.exit(1);
}

console.log('🔗 Connecting to Render PostgreSQL...');
console.log('📍 Database URL:', DATABASE_URL.substring(0, 30) + '...');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Render
});

async function seedQuestions() {
  try {
    console.log('\n🌱 Starting seed process...');
    
    // Test connection
    const testResult = await pool.query('SELECT NOW()');
    console.log('✅ Connected to database at:', testResult.rows[0].now);
    
    // Generate questions
    const questionCount = 10000;
    console.log(`\n📝 Generating ${questionCount} questions...`);
    const questions = generateBulkQuestions(questionCount);
    console.log(`✅ Generated ${questions.length} questions`);
    
    // Start transaction
    await pool.query('BEGIN');
    console.log('\n📥 Starting database insertion...');
    
    let inserted = 0;
    let skipped = 0;
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      try {
        await pool.query(
          `INSERT INTO questions (exam_type, category, topic, difficulty, question_text, options, correct_answer, explanation)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [q.examType, q.category, q.topic, q.difficulty, q.question_text, q.options, q.correct_answer, q.explanation]
        );
        inserted++;
        
        // Show progress every 500 questions
        if ((i + 1) % 500 === 0) {
          console.log(`  ✅ Inserted ${inserted} questions (${Math.round((i + 1) / questions.length * 100)}%)`);
        }
      } catch (error) {
        // Skip duplicate or constraint errors
        if (error.code === '23505') {
          skipped++;
        } else {
          throw error;
        }
      }
    }
    
    // Commit transaction
    await pool.query('COMMIT');
    
    // Get final counts
    const countResult = await pool.query('SELECT COUNT(*) FROM questions');
    const totalQuestions = parseInt(countResult.rows[0].count);
    
    // Get counts by exam type
    const byExamType = await pool.query(
      `SELECT exam_type, COUNT(*) as count FROM questions GROUP BY exam_type ORDER BY exam_type`
    );
    
    console.log('\n✅ DATABASE SEEDING COMPLETE!');
    console.log('═══════════════════════════════════════');
    console.log(`📊 Total Questions in Database: ${totalQuestions}`);
    console.log('\n📋 Questions by Exam Type:');
    
    for (const row of byExamType.rows) {
      const icons = {
        'it': '💼',
        'banking': '🏦',
        'government': '🏛️'
      };
      console.log(`   ${icons[row.exam_type] || '📝'} ${row.exam_type.toUpperCase()}: ${row.count} questions`);
    }
    
    console.log('\n🎉 Your quiz modules are now ready!');
    console.log('═══════════════════════════════════════');
    console.log('\n📱 Test it out:');
    console.log('1. Go to: https://web-app-kljr.onrender.com');
    console.log('2. Click on a quiz module');
    console.log('3. Start taking the test!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR during seeding:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('- Check that DATABASE_URL is correct');
    console.error('- Verify the database tables exist (run server.js first)');
    console.error('- Check database connection string format');
    
    try {
      await pool.query('ROLLBACK');
    } catch (e) {
      // Ignore rollback errors
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedQuestions();
