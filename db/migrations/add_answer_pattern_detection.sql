-- Add answer pattern detection columns to test_results
ALTER TABLE test_results
ADD COLUMN IF NOT EXISTS answer_pattern JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_suspicious BOOLEAN DEFAULT FALSE;

-- Create index for quick filtering
CREATE INDEX IF NOT EXISTS idx_test_results_suspicious ON test_results(is_suspicious);
CREATE INDEX IF NOT EXISTS idx_test_results_user_not_suspicious ON test_results(user_id) 
  WHERE is_suspicious = FALSE;

-- Update existing suspicious detection view
DROP VIEW IF EXISTS leaderboard_clean;

CREATE VIEW leaderboard_clean AS
SELECT 
    u.id,
    u.name,
    u.profile_pic,
    COUNT(tr.id) as tests_completed,
    SUM(tr.score) as total_score,
    AVG(tr.percentage) as avg_percentage,
    MAX(tr.percentage) as best_score,
    ROW_NUMBER() OVER (ORDER BY AVG(tr.percentage) DESC) as rank
FROM users u
LEFT JOIN test_results tr ON u.id = tr.user_id AND tr.is_suspicious = FALSE
GROUP BY u.id, u.name, u.profile_pic
ORDER BY avg_percentage DESC;