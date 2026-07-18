-- ============================================================
-- WORSHIP NA MARAFIKI — Database Schema v2
-- worshipnamarafiki.africa
-- Romans 12:1 — "present your bodies as a living sacrifice,
-- holy and acceptable to God"
--
-- Target: Vercel Postgres (Neon)
-- ============================================================

-- ---------- ENUM TYPES (workflow states, enforced by the DB) ----------

CREATE TYPE translation_status AS ENUM (
    'original',
    'translation_in_progress',
    'translation_review',
    'translation_verified'
);

CREATE TYPE rights_status AS ENUM (
    'public_domain',
    'owner_contacted',
    'permission_pending',
    'permission_granted'
);

CREATE TYPE tag_category AS ENUM (
    'theme',
    'song_type',
    'tempo_feel',
    'resource'
);

CREATE TYPE media_type AS ENUM (
    'youtube_tutorial',
    'youtube_official',
    'audio'
);

-- ---------- REFERENCE TABLES ----------

CREATE TABLE languages (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(10) UNIQUE NOT NULL,   -- ISO 639 where possible
    name        VARCHAR(60) NOT NULL,          -- English name
    native_name VARCHAR(60)                    -- e.g. 'Kiswahili'
);

CREATE TABLE countries (
    id   SERIAL PRIMARY KEY,
    code CHAR(2) UNIQUE NOT NULL,              -- ISO 3166-1 alpha-2
    name VARCHAR(60) NOT NULL
);

CREATE TABLE artists (
    id        SERIAL PRIMARY KEY,
    name      VARCHAR(120) NOT NULL,
    country_id INTEGER REFERENCES countries(id),
    website   VARCHAR(255),
    notes     TEXT,                            -- contact / permissions notes
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- CORE: SONGS & VERSIONS ----------

-- One row per song as a work (Shangilia = one row)
CREATE TABLE songs (
    id                   SERIAL PRIMARY KEY,
    title                VARCHAR(200) NOT NULL,      -- original-language title
    artist_id            INTEGER REFERENCES artists(id),
    original_language_id INTEGER NOT NULL REFERENCES languages(id),
    country_id           INTEGER REFERENCES countries(id),
    year_written         SMALLINT,
    rights_status        rights_status NOT NULL DEFAULT 'owner_contacted',
    rights_notes         TEXT,
    is_published         BOOLEAN NOT NULL DEFAULT FALSE,  -- master publish gate
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per language version (original + each translation)
CREATE TABLE song_versions (
    id                 SERIAL PRIMARY KEY,
    song_id            INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    language_id        INTEGER NOT NULL REFERENCES languages(id),
    title              VARCHAR(200) NOT NULL,        -- title in this language
    lyrics             TEXT NOT NULL,                -- plain lyrics
    lyrics_with_chords TEXT,                         -- ChordPro-style: [G]Shangi[C]lia
    original_key       VARCHAR(6),                   -- e.g. 'G', 'F#m'
    is_original        BOOLEAN NOT NULL DEFAULT FALSE,
    status             translation_status NOT NULL DEFAULT 'translation_in_progress',
    translated_by      VARCHAR(120),                 -- panel member(s)
    verified_by        VARCHAR(120),                 -- panel sign-off
    verified_at        TIMESTAMPTZ,
    is_published       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (song_id, language_id)                    -- one version per language
);

-- YouTube tutorials & other media, per version
CREATE TABLE media_links (
    id         SERIAL PRIMARY KEY,
    version_id INTEGER NOT NULL REFERENCES song_versions(id) ON DELETE CASCADE,
    type       media_type NOT NULL,
    instrument VARCHAR(40),          -- 'guitar', 'keyboard', 'vocals', 'full band'
    url        VARCHAR(500) NOT NULL,
    label      VARCHAR(120),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- TAG SYSTEM ----------

CREATE TABLE tags (
    id       SERIAL PRIMARY KEY,
    category tag_category NOT NULL,
    slug     VARCHAR(50) NOT NULL,
    label    VARCHAR(80) NOT NULL,
    UNIQUE (category, slug)
);

-- Tags attach at song level (themes/type/tempo describe the work itself,
-- so every translation inherits them automatically)
CREATE TABLE song_tags (
    song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    tag_id  INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (song_id, tag_id)
);

-- ---------- INDEXES FOR SEARCH ----------

CREATE INDEX idx_songs_artist    ON songs(artist_id);
CREATE INDEX idx_songs_country   ON songs(country_id);
CREATE INDEX idx_versions_song   ON song_versions(song_id);
CREATE INDEX idx_versions_lang   ON song_versions(language_id);
CREATE INDEX idx_versions_status ON song_versions(status);
CREATE INDEX idx_song_tags_tag   ON song_tags(tag_id);

-- Full-text search on titles + lyrics
CREATE INDEX idx_versions_search ON song_versions
    USING GIN (to_tsvector('simple', title || ' ' || lyrics));

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO languages (code, name, native_name) VALUES
    ('sw',  'Swahili',     'Kiswahili'),
    ('zu',  'Zulu',        'isiZulu'),
    ('rw',  'Kinyarwanda', 'Ikinyarwanda'),
    ('sn',  'Shona',       'chiShona'),
    ('ig',  'Igbo',        'Igbo'),
    ('yo',  'Yoruba',      'Yorùbá'),
    ('ha',  'Hausa',       'Hausa'),
    ('xh',  'Xhosa',       'isiXhosa'),
    ('tn',  'Setswana',    'Setswana'),
    ('rn',  'Kirundi',     'Ikirundi'),
    ('lg',  'Luganda',     'Luganda'),
    ('ki',  'Kikuyu',      'Gĩkũyũ'),
    ('luo', 'Dholuo',      'Dholuo'),
    ('ny',  'Chichewa',    'Chichewa'),
    ('am',  'Amharic',     'አማርኛ'),
    ('ti',  'Tigrinya',    'ትግርኛ'),
    ('ln',  'Lingala',     'Lingála'),
    ('lua', 'Tshiluba',    'Tshiluba');

INSERT INTO countries (code, name) VALUES
    ('TZ', 'Tanzania'), ('KE', 'Kenya'), ('UG', 'Uganda'),
    ('RW', 'Rwanda'),   ('BI', 'Burundi'), ('CD', 'DR Congo'),
    ('NG', 'Nigeria'),  ('GH', 'Ghana'),   ('ZA', 'South Africa'),
    ('ZW', 'Zimbabwe'), ('BW', 'Botswana'),('MW', 'Malawi'),
    ('ET', 'Ethiopia'), ('ER', 'Eritrea');

-- THEME tags
INSERT INTO tags (category, slug, label) VALUES
    ('theme', 'praise',              'Praise'),
    ('theme', 'adoration',           'Adoration'),
    ('theme', 'thanksgiving',        'Thanksgiving'),
    ('theme', 'surrender',           'Surrender'),
    ('theme', 'repentance',          'Repentance'),
    ('theme', 'faith-trust',         'Faith & Trust'),
    ('theme', 'hope',                'Hope'),
    ('theme', 'healing',             'Healing'),
    ('theme', 'deliverance',         'Deliverance'),
    ('theme', 'holy-spirit',         'Holy Spirit'),
    ('theme', 'the-cross',           'The Cross'),
    ('theme', 'resurrection',        'Resurrection'),
    ('theme', 'second-coming',       'Second Coming'),
    ('theme', 'communion',           'Communion'),
    ('theme', 'prayer-intercession', 'Prayer & Intercession'),
    ('theme', 'unity-community',     'Unity & Community'),
    ('theme', 'mission-evangelism',  'Mission & Evangelism'),
    ('theme', 'christmas',           'Christmas'),
    ('theme', 'easter',              'Easter'),
    ('theme', 'wedding',             'Wedding'),
    ('theme', 'funeral-comfort',     'Funeral & Comfort');

-- SONG TYPE tags
INSERT INTO tags (category, slug, label) VALUES
    ('song_type', 'hymn',              'Hymn'),
    ('song_type', 'chorus',            'Chorus'),
    ('song_type', 'contemporary',      'Contemporary'),
    ('song_type', 'traditional',       'Traditional'),
    ('song_type', 'call-and-response', 'Call and Response'),
    ('song_type', 'medley',            'Medley');

-- TEMPO / FEEL tags
INSERT INTO tags (category, slug, label) VALUES
    ('tempo_feel', 'fast',        'Fast'),
    ('tempo_feel', 'mid-tempo',   'Mid-tempo'),
    ('tempo_feel', 'slow',        'Slow'),
    ('tempo_feel', 'celebration', 'Celebration'),
    ('tempo_feel', 'reflective',  'Reflective');

-- RESOURCE tags (can be auto-applied by the app when content exists)
INSERT INTO tags (category, slug, label) VALUES
    ('resource', 'chords-available', 'Chords Available'),
    ('resource', 'video-tutorial',   'Video Tutorial'),
    ('resource', 'pdf-ready',        'PDF Ready');

-- ============================================================
-- PUBLISH GATE (what the public actually sees)
-- ============================================================
-- A version is publicly visible only when ALL are true:
--   songs.is_published = TRUE
--   songs.rights_status IN ('public_domain', 'permission_granted')
--   song_versions.is_published = TRUE
--   song_versions.status IN ('original', 'translation_verified')
-- Handy view for the frontend:

CREATE VIEW public_song_versions AS
SELECT sv.*, s.rights_status, s.artist_id, s.country_id
FROM song_versions sv
JOIN songs s ON s.id = sv.song_id
WHERE s.is_published = TRUE
  AND s.rights_status IN ('public_domain', 'permission_granted')
  AND sv.is_published = TRUE
  AND sv.status IN ('original', 'translation_verified');

-- ============================================================
-- EXAMPLE: Shangilia — Essence of Worship (Tanzania)
-- ============================================================
-- INSERT INTO artists (name, country_id)
--   VALUES ('Essence of Worship', (SELECT id FROM countries WHERE code='TZ'));
-- INSERT INTO songs (title, artist_id, original_language_id, country_id, rights_status)
--   VALUES ('Shangilia',
--           (SELECT id FROM artists WHERE name='Essence of Worship'),
--           (SELECT id FROM languages WHERE code='sw'),
--           (SELECT id FROM countries WHERE code='TZ'),
--           'permission_pending');
-- INSERT INTO song_versions (song_id, language_id, title, lyrics, is_original, status)
--   VALUES (1, (SELECT id FROM languages WHERE code='sw'),
--           'Shangilia', '...lyrics...', TRUE, 'original');
-- INSERT INTO song_tags (song_id, tag_id)
--   SELECT 1, id FROM tags WHERE (category,slug) IN
--     (('theme','praise'), ('song_type','contemporary'), ('tempo_feel','fast'));
