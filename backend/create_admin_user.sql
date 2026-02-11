-- Create admin user directly via SQL
-- Password: admin123 (already hashed with bcrypt)
-- This is a workaround for bcrypt compatibility issues

INSERT INTO users (
    username, 
    email, 
    hashed_password, 
    full_name, 
    role, 
    is_active,
    created_at,
    updated_at
) VALUES (
    'admin',
    'admin@polda.id',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTEuR8m',  -- admin123
    'Administrator',
    'admin',
    1,
    NOW(),
    NOW()
);

-- To verify, run:
-- SELECT username, email, role FROM users;
