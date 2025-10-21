-- Update test_results table
ALTER TABLE test_results 
ADD COLUMN IF NOT EXISTS answer_pattern JSONB,
ADD COLUMN IF NOT EXISTS is_suspicious BOOLEAN DEFAULT false;

-- Update leaderboard table
ALTER TABLE leaderboard 
ADD COLUMN IF NOT EXISTS avg_percentage DECIMAL(5,2);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_test_results_suspicious 
ON test_results(is_suspicious);

-- Create functions for pattern analysis
CREATE OR REPLACE FUNCTION check_answer_pattern(answers JSONB)
RETURNS BOOLEAN AS $$
DECLARE
    total INT;
    max_same INT;
    pattern JSONB;
BEGIN
    -- Count total answers
    total := jsonb_array_length(answers);
    
    -- Get answer pattern
    pattern := jsonb_object_agg(
        key,
        value::int
    ) FROM jsonb_each(answers);
    
    -- Find maximum repeated answer
    SELECT MAX(value::int)
    INTO max_same
    FROM jsonb_each(pattern);
    
    -- Return true if pattern is suspicious (>70% same answer)
    RETURN (max_same::float / total::float) > 0.7;
END;
$$ LANGUAGE plpgsql;