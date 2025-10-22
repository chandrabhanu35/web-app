import express from 'express';
import pool from '../db/connection.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Rule-based chatbot responses
const chatbotRules = {
  likedPaper: {
    yes: "Great! We're glad you enjoyed the paper. Your feedback helps us improve!",
    no: "We appreciate your honesty. Could you tell us what could be improved?"
  },
  hasQuestions: {
    yes: "We'd love to help! Please describe the questions you faced.",
    no: "Excellent! You seem comfortable with the content."
  },
  hasProblem: {
    yes: "Sorry to hear that! Please share what problem you encountered so we can fix it.",
    no: "Perfect! Everything worked smoothly for you."
  }
};

// POST: Submit review with chatbot responses
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { rating, liked_paper, questions_faced, problems_faced, feedback, chatbot_responses } = req.body;

    console.log('📝 Submitting review for user:', req.userId);

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Insert review
    const result = await pool.query(
      `INSERT INTO reviews (user_id, rating, liked_paper, questions_faced, problems_faced, feedback, chatbot_responses)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at, rating`,
      [req.userId, rating, liked_paper, questions_faced, problems_faced, feedback, JSON.stringify(chatbot_responses)]
    );

    console.log('✅ Review submitted:', result.rows[0]);

    res.status(201).json({
      message: 'Thank you for your feedback!',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Review submission error:', error.message);
    res.status(500).json({ 
      error: 'Failed to submit review',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// GET: Get chatbot response based on rule
router.get('/chatbot-response/:question', (req, res) => {
  try {
    const { question } = req.params;
    const { answer } = req.query;

    console.log('🤖 Chatbot question:', question, 'answer:', answer);

    // Check against rules
    if (question === 'likedPaper' && chatbotRules.likedPaper[answer]) {
      return res.json({ response: chatbotRules.likedPaper[answer] });
    }

    if (question === 'hasQuestions' && chatbotRules.hasQuestions[answer]) {
      return res.json({ response: chatbotRules.hasQuestions[answer] });
    }

    if (question === 'hasProblem' && chatbotRules.hasProblem[answer]) {
      return res.json({ response: chatbotRules.hasProblem[answer] });
    }

    res.json({ response: 'Thank you for your feedback!' });
  } catch (error) {
    console.error('❌ Chatbot error:', error.message);
    res.status(500).json({ error: 'Chatbot processing error' });
  }
});

// GET: Get all reviews (admin only)
router.get('/all', verifyToken, async (req, res) => {
  try {
    // Check if admin (you can add admin check later)
    console.log('📊 Fetching all reviews...');

    const result = await pool.query(`
      SELECT 
        r.id,
        r.user_id,
        u.name,
        u.email,
        r.rating,
        r.liked_paper,
        r.questions_faced,
        r.problems_faced,
        r.feedback,
        r.created_at
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
      LIMIT 100
    `);

    console.log('✅ Retrieved', result.rows.length, 'reviews');

    res.json({
      count: result.rows.length,
      reviews: result.rows
    });
  } catch (error) {
    console.error('❌ Review fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// GET: Get review statistics (admin only)
router.get('/stats', verifyToken, async (req, res) => {
  try {
    console.log('📊 Fetching review statistics...');

    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating,
        COUNT(CASE WHEN liked_paper = true THEN 1 END) as liked_count,
        COUNT(CASE WHEN liked_paper = false THEN 1 END) as disliked_count,
        COUNT(CASE WHEN problems_faced IS NOT NULL THEN 1 END) as problem_reports
      FROM reviews
    `);

    const stats = statsResult.rows[0];

    console.log('✅ Stats retrieved:', stats);

    res.json({
      total_reviews: parseInt(stats.total_reviews),
      avg_rating: parseFloat(stats.avg_rating || 0).toFixed(2),
      liked_count: parseInt(stats.liked_count),
      disliked_count: parseInt(stats.disliked_count),
      problem_reports: parseInt(stats.problem_reports)
    });
  } catch (error) {
    console.error('❌ Stats fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET: Get reviews by rating (admin only)
router.get('/by-rating/:rating', verifyToken, async (req, res) => {
  try {
    const { rating } = req.params;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid rating' });
    }

    console.log('⭐ Fetching reviews with rating:', rating);

    const result = await pool.query(`
      SELECT 
        r.id,
        u.name,
        u.email,
        r.rating,
        r.feedback,
        r.created_at
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.rating = $1
      ORDER BY r.created_at DESC
    `, [rating]);

    res.json({
      rating,
      count: result.rows.length,
      reviews: result.rows
    });
  } catch (error) {
    console.error('❌ Rating filter error:', error.message);
    res.status(500).json({ error: 'Failed to fetch reviews by rating' });
  }
});

export default router;
