-- ============================================================
-- Public song recommendations (backup of what gets emailed to you)
-- Run this in the Neon SQL Editor AFTER schema.sql.
-- ============================================================

CREATE TABLE IF NOT EXISTS song_suggestions (
    id              SERIAL PRIMARY KEY,
    submitter_name  VARCHAR(160) NOT NULL,
    submitter_email VARCHAR(255),
    song_title      VARCHAR(200) NOT NULL,
    artist          VARCHAR(160),
    language        VARCHAR(60),
    translated      VARCHAR(20),
    links           TEXT,
    lyrics          TEXT,
    note            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
