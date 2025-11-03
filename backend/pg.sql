-- Enable UUID generator
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(200),
    picture TEXT,
    provider VARCHAR(20) DEFAULT 'local',
    plan_type VARCHAR(50) DEFAULT 'free',
    allowed_queries INT DEFAULT 2,
    results_per_query INT DEFAULT 5,
    queries_used INT DEFAULT 0,
    number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SCRAPED QUERIES TABLE
CREATE TABLE scraped_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    result_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PAYMENTS TABLE
DROP TABLE IF EXISTS payments CASCADE;

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(50) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    platform VARCHAR(50) NOT NULL CHECK (platform IN (
        'credit_card',
        'credit-card',
        'upi',
        'Google Pay',
        'Paytm',
        'PhonePe',
        'Amazon Pay',
        'BHIM',
        'Other',
    )),
    upiid VARCHAR(100),
    queries INT DEFAULT 0,
    results_per_query INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    card_last4 VARCHAR(4),
    card_brand VARCHAR(20)
);

