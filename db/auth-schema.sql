-- ============================================================
-- Panel accounts for Worship na Marafiki
-- Run this in the Neon SQL Editor AFTER schema.sql.
-- ============================================================

CREATE TABLE IF NOT EXISTS panel_users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    name          VARCHAR(120) NOT NULL,
    password_hash TEXT NOT NULL,
    role          VARCHAR(20) NOT NULL DEFAULT 'member',  -- 'admin' | 'member'
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The very first person to register through the site becomes the admin
-- automatically (bootstrap). After that, only an admin can create accounts.
