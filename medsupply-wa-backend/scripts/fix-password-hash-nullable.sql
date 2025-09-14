-- Make password_hash column nullable since we're using Supabase Auth
-- This allows us to store user metadata without requiring password storage

ALTER TABLE users 
ALTER COLUMN password_hash DROP NOT NULL;

-- Add a comment to explain why password_hash can be null
COMMENT ON COLUMN users.password_hash IS 'Password hash - null when using Supabase Auth';
