-- Add new columns for enhanced tracking
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_active_date DATE,
ADD COLUMN IF NOT EXISTS completion_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS rank INT;

-- Add new columns for test results
ALTER TABLE test_results
ADD COLUMN IF NOT EXISTS answer_pattern JSONB,
ADD COLUMN IF NOT EXISTS completion_time INT,
ADD COLUMN IF NOT EXISTS review_needed BOOLEAN DEFAULT false;

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_user_stats ON users (experience_points, streak_count, total_tests);
CREATE INDEX IF NOT EXISTS idx_test_results_user ON test_results (user_id, exam_type);
CREATE INDEX IF NOT EXISTS idx_test_results_date ON test_results (created_at);

-- Create view for quick stats access
CREATE OR REPLACE VIEW user_stats_view AS
SELECT 
    u.id,
    u.name,
    u.experience_points,
    u.streak_count,
    u.total_tests,
    u.best_score,
    u.avg_score,
    u.completion_rate,
    u.rank,
    COUNT(tr.id) as recent_tests,
    COALESCE(AVG(tr.percentage), 0) as recent_avg_score
FROM users u
LEFT JOIN test_results tr ON u.id = tr.user_id 
    AND tr.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id;