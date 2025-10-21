import pool from './connection.js';
import dotenv from 'dotenv';
import { generateBulkQuestions } from './questionGenerator.js';

dotenv.config();

// ===== SAMPLE QUESTIONS FOR SEEDING DATABASE =====
const sampleQuestions = [
  // ===== IT JOBS - QUANTITATIVE APTITUDE (Easy) =====
  {
    examType: 'it',
    category: 'Quantitative Aptitude',
    topic: 'Basic Arithmetic',
    difficulty: 'easy',
    question_text: 'What is 15% of 200?',
    options: JSON.stringify(['30', '20', '25', '35']),
    correct_answer: '0',
    explanation: '15% of 200 = (15/100) × 200 = 30 (Option A)'
  },
  {
    examType: 'it',
    category: 'Quantitative Aptitude',
    topic: 'Basic Arithmetic',
    difficulty: 'easy',
    question_text: 'If a number is multiplied by 3 and then 5 is added, the result is 20. What is the number?',
    options: JSON.stringify(['5', '10', '15', '20']),
    correct_answer: '0',
    explanation: 'Let x be the number. 3x + 5 = 20, so 3x = 15, x = 5'
  },
  {
    examType: 'it',
    category: 'Quantitative Aptitude',
    topic: 'Basic Arithmetic',
    difficulty: 'easy',
    question_text: 'What is the average of 10, 20, 30, 40, 50?',
    options: JSON.stringify(['30', '25', '35', '40']),
    correct_answer: '0',
    explanation: 'Average = (10+20+30+40+50)/5 = 150/5 = 30'
  },
  {
    examType: 'it',
    category: 'Quantitative Aptitude',
    topic: 'Basic Arithmetic',
    difficulty: 'easy',
    question_text: 'A book costs Rs. 50. If there is a 20% discount, what is the final price?',
    options: JSON.stringify(['Rs. 40', 'Rs. 30', 'Rs. 35', 'Rs. 45']),
    correct_answer: '0',
    explanation: '20% of 50 = 10, so 50 - 10 = Rs. 40'
  },
  {
    examType: 'it',
    category: 'Quantitative Aptitude',
    topic: 'Basic Arithmetic',
    difficulty: 'easy',
    question_text: 'If 5 pens cost Rs. 50, how much do 12 pens cost?',
    options: JSON.stringify(['Rs. 120', 'Rs. 100', 'Rs. 110', 'Rs. 130']),
    correct_answer: '0',
    explanation: 'Cost per pen = 50/5 = 10, Cost of 12 pens = 12 × 10 = Rs. 120'
  },
  {
    examType: 'it',
    category: 'Quantitative Aptitude',
    topic: 'Basic Arithmetic',
    difficulty: 'easy',
    question_text: 'What is 25% of 80?',
    options: JSON.stringify(['20', '25', '30', '15']),
    correct_answer: '0',
    explanation: '25% of 80 = (25/100) × 80 = 20'
  },
  {
    examType: 'it',
    category: 'Quantitative Aptitude',
    topic: 'Basic Arithmetic',
    difficulty: 'easy',
    question_text: 'If x + 5 = 12, what is x?',
    options: JSON.stringify(['7', '6', '8', '5']),
    correct_answer: '0',
    explanation: 'x + 5 = 12, so x = 12 - 5 = 7'
  },
  {
    examType: 'it',
    category: 'Quantitative Aptitude',
    topic: 'Basic Arithmetic',
    difficulty: 'easy',
    question_text: 'What is 10% of 1000?',
    options: JSON.stringify(['100', '200', '50', '150']),
    correct_answer: '0',
    explanation: '10% of 1000 = (10/100) × 1000 = 100'
  },
  {
    examType: 'it',
    category: 'Quantitative Aptitude',
    topic: 'Basic Arithmetic',
    difficulty: 'easy',
    question_text: 'A shirt costs Rs. 300. If there is a 15% discount, what is the final price?',
    options: JSON.stringify(['Rs. 255', 'Rs. 250', 'Rs. 265', 'Rs. 245']),
    correct_answer: '0',
    explanation: '15% of 300 = 45, so 300 - 45 = Rs. 255'
  },
  {
    examType: 'it',
    category: 'Quantitative Aptitude',
    topic: 'Basic Arithmetic',
    difficulty: 'easy',
    question_text: 'If 3x = 18, what is x?',
    options: JSON.stringify(['6', '5', '7', '8']),
    correct_answer: '0',
    explanation: '3x = 18, so x = 18/3 = 6'
  },

  // ===== BANKING EXAM QUESTIONS =====
  {
    examType: 'banking',
    category: 'Quantitative Aptitude',
    topic: 'Simple Interest',
    difficulty: 'easy',
    question_text: 'What is the Simple Interest on Rs. 1000 at 5% per annum for 2 years?',
    options: JSON.stringify(['Rs. 100', 'Rs. 50', 'Rs. 150', 'Rs. 200']),
    correct_answer: '0',
    explanation: 'SI = (1000 × 5 × 2) / 100 = Rs. 100'
  },
  {
    examType: 'banking',
    category: 'Quantitative Aptitude',
    topic: 'Percentage',
    difficulty: 'medium',
    question_text: 'What is 12% of 500?',
    options: JSON.stringify(['60', '50', '70', '80']),
    correct_answer: '0',
    explanation: '12% of 500 = (12/100) × 500 = 60'
  },
  {
    examType: 'banking',
    category: 'Reasoning',
    topic: 'Series',
    difficulty: 'easy',
    question_text: 'Complete the series: 5, 10, 20, 40, ?',
    options: JSON.stringify(['80', '60', '70', '50']),
    correct_answer: '0',
    explanation: 'Each number is multiplied by 2. So 40 × 2 = 80'
  },
  {
    examType: 'banking',
    category: 'English Language',
    topic: 'Grammar',
    difficulty: 'easy',
    question_text: 'Choose the correct sentence:',
    options: JSON.stringify(['She go to school', 'She goes to school', 'She going to school', 'She gone to school']),
    correct_answer: '1',
    explanation: 'Third person singular uses "goes" not "go"'
  },
  {
    examType: 'banking',
    category: 'General Knowledge',
    topic: 'Banking',
    difficulty: 'easy',
    question_text: 'Which is the Reserve Bank of India?',
    options: JSON.stringify(['RBI', 'SBI', 'ICICI', 'HDFC']),
    correct_answer: '0',
    explanation: 'RBI (Reserve Bank of India) is the central bank of India'
  },

  // ===== GOVERNMENT EXAM QUESTIONS =====
  {
    examType: 'government',
    category: 'Quantitative Aptitude',
    topic: 'Percentage',
    difficulty: 'easy',
    question_text: 'What is 50% of 200?',
    options: JSON.stringify(['100', '50', '150', '200']),
    correct_answer: '0',
    explanation: '50% of 200 = (50/100) × 200 = 100'
  },
  {
    examType: 'government',
    category: 'General Knowledge',
    topic: 'Geography',
    difficulty: 'easy',
    question_text: 'What is the capital of India?',
    options: JSON.stringify(['New Delhi', 'Mumbai', 'Bangalore', 'Kolkata']),
    correct_answer: '0',
    explanation: 'New Delhi is the capital city of India'
  },
  {
    examType: 'government',
    category: 'General Knowledge',
    topic: 'History',
    difficulty: 'easy',
    question_text: 'In which year did India gain independence?',
    options: JSON.stringify(['1947', '1950', '1945', '1935']),
    correct_answer: '0',
    explanation: 'India became independent on August 15, 1947'
  },
  {
    examType: 'government',
    category: 'Reasoning',
    topic: 'Series',
    difficulty: 'easy',
    question_text: 'Complete: 1, 1, 2, 3, 5, 8, ?',
    options: JSON.stringify(['13', '11', '12', '10']),
    correct_answer: '0',
    explanation: 'Fibonacci series: each number is sum of previous two. 5+8=13'
  },
  {
    examType: 'government',
    category: 'English Language',
    topic: 'Vocabulary',
    difficulty: 'easy',
    question_text: 'Synonym of "Happy":',
    options: JSON.stringify(['Joyful', 'Sad', 'Angry', 'Tired']),
    correct_answer: '0',
    explanation: 'Joyful means full of joy, which is a synonym of happy'
  }
];

// ===== SEED DATABASE WITH QUESTIONS =====
export const seedQuestions = async (count = 1000) => {
  try {
    console.log(`🌱 Generating ${count} questions...`);
    const questionsToSeed = generateBulkQuestions(count);
    
    console.log(`📝 Starting to insert ${questionsToSeed.length} questions into database...`);
    
    let inserted = 0;
    for (const q of questionsToSeed) {
      try {
        await pool.query(
          `INSERT INTO questions (exam_type, category, topic, difficulty, question_text, options, correct_answer, explanation)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [q.examType, q.category, q.topic, q.difficulty, q.question_text, q.options, q.correct_answer, q.explanation]
        );
        inserted++;
        
        // Show progress every 100 questions
        if (inserted % 100 === 0) {
          console.log(`✅ Inserted ${inserted} questions...`);
        }
      } catch (error) {
        // Skip duplicate questions
        if (error.code !== '23505') {
          throw error;
        }
      }
    }
    
    console.log(`✅ Total inserted: ${inserted} questions`);
    return inserted;
  } catch (error) {
    console.error('❌ Error seeding questions:', error.message);
    throw error;
  }
};

// ===== RUN SEED =====
// Usage: node db/seed.js [count]
// Example: node db/seed.js 10000

(async () => {
  try {
    const count = parseInt(process.argv[2]) || 1000;
    const inserted = await seedQuestions(count);
    console.log(`\n✅ Database seeding complete!`);
    console.log(`📊 Total questions added: ${inserted}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
})();
