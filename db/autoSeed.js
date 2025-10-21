import pool from './connection.js';
import { generateBulkQuestions } from './questionGenerator.js';

/**
 * Auto-seed questions on first startup
 * This checks if questions exist, and if not, generates and inserts them
 */
export const autoSeedQuestions = async () => {
  try {
    // Check if questions already exist
    const countResult = await pool.query('SELECT COUNT(*) FROM questions');
    const questionCount = parseInt(countResult.rows[0].count);

    if (questionCount > 0) {
      console.log(`✅ Questions already exist in database (${questionCount} questions)`);
      return { success: true, action: 'skipped', count: questionCount };
    }

    console.log('🌱 No questions found. Auto-seeding 10,000 questions...');
    
    // Generate questions
    const questions = generateBulkQuestions(10000);
    console.log(`📝 Generated ${questions.length} questions`);
    
    // Insert questions in batches
    let inserted = 0;
    let batchSize = 100;
    
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);
      
      // Build multi-value insert query
      let query = 'INSERT INTO questions (exam_type, category, topic, difficulty, question_text, options, correct_answer, explanation) VALUES ';
      let values = [];
      let paramCount = 1;
      
      for (const q of batch) {
        const placeholders = [
          `$${paramCount++}`, `$${paramCount++}`, `$${paramCount++}`, `$${paramCount++}`,
          `$${paramCount++}`, `$${paramCount++}`, `$${paramCount++}`, `$${paramCount++}`
        ];
        query += `(${placeholders.join(', ')}),`;
        values.push(q.examType, q.category, q.topic, q.difficulty, q.question_text, q.options, q.correct_answer, q.explanation);
      }
      
      // Remove trailing comma
      query = query.slice(0, -1) + ' ON CONFLICT DO NOTHING';
      
      try {
        await pool.query(query, values);
        inserted += batch.length;
        
        const progress = Math.round((i / questions.length) * 100);
        if (progress % 20 === 0) {
          console.log(`  ✅ Progress: ${progress}%`);
        }
      } catch (batchError) {
        console.warn(`⚠️ Batch insert warning: ${batchError.message}`);
      }
    }
    
    // Verify
    const verifyResult = await pool.query('SELECT COUNT(*) FROM questions');
    const finalCount = parseInt(verifyResult.rows[0].count);
    
    // Get counts by exam type
    const byExamType = await pool.query(
      `SELECT exam_type, COUNT(*) as count FROM questions GROUP BY exam_type ORDER BY exam_type`
    );
    
    console.log('\n✅ AUTO-SEEDING COMPLETE!');
    console.log(`📊 Total questions in database: ${finalCount}`);
    console.log('📋 By exam type:');
    for (const row of byExamType.rows) {
      const icons = { 'it': '💼', 'banking': '🏦', 'government': '🏛️' };
      console.log(`   ${icons[row.exam_type] || '📝'} ${row.exam_type.toUpperCase()}: ${row.count}`);
    }
    console.log('');
    
    return { success: true, action: 'seeded', count: finalCount };
  } catch (error) {
    console.error('⚠️ Auto-seed warning:', error.message);
    // Don't fail startup if seeding fails
    return { success: false, error: error.message };
  }
};

export default autoSeedQuestions;
