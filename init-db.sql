#!/bin/bash
# This script initializes the database for AptitudeHub

# Run this after creating the PostgreSQL database:
# psql -U postgres -d aptitude_hub -f init-db.sql

-- Create all tables
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  mobile VARCHAR(15) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  profile_pic VARCHAR(500),
  bio TEXT,
  experience_points INT DEFAULT 0,
  streak_count INT DEFAULT 0,
  total_tests INT DEFAULT 0,
  best_score DECIMAL(5,2) DEFAULT 0,
  avg_score DECIMAL(5,2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS test_results (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  exam_type VARCHAR(50) NOT NULL,
  score INT NOT NULL,
  total_questions INT NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  time_taken INT,
  category_scores JSONB,
  answers JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  badge_name VARCHAR(100),
  badge_icon VARCHAR(100),
  description TEXT,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leaderboard (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  rank INT,
  total_score INT,
  tests_completed INT,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_streaks (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_active_date DATE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  exam_type VARCHAR(50),
  category VARCHAR(100),
  topic VARCHAR(100),
  difficulty VARCHAR(20),
  question_text TEXT,
  options JSONB,
  correct_answer INT,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  message TEXT,
  type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'admin',
  permissions TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_test_results_user ON test_results(user_id);
CREATE INDEX idx_test_results_created ON test_results(created_at);
CREATE INDEX idx_achievements_user ON achievements(user_id);
CREATE INDEX idx_leaderboard_rank ON leaderboard(rank);
