-- ============================================================
-- Add a view counter to songs, for "Songs the Community Loves"
-- Run this in the Neon SQL Editor after schema.sql.
-- ============================================================

ALTER TABLE songs ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

-- (Optional) index to fetch the most-viewed quickly as the library grows
CREATE INDEX IF NOT EXISTS idx_songs_views ON songs(view_count DESC);
