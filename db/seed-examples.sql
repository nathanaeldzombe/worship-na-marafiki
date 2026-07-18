-- ============================================================
-- Optional seed: a couple of PUBLIC DOMAIN example songs so the
-- library isn't empty on first launch. Safe to run — everything
-- here is public domain, so it clears the rights gate immediately.
-- Run AFTER schema.sql.
-- ============================================================

-- Example 1: Ishe Komborera Africa (public-domain hymn, Shona)
WITH a AS (
  INSERT INTO artists (name, country_id)
  VALUES ('Traditional', (SELECT id FROM countries WHERE code='ZW'))
  RETURNING id
), s AS (
  INSERT INTO songs (title, artist_id, original_language_id, country_id, rights_status, is_published)
  VALUES ('Ishe Komborera Africa',
          (SELECT id FROM a),
          (SELECT id FROM languages WHERE code='sn'),
          (SELECT id FROM countries WHERE code='ZW'),
          'public_domain', TRUE)
  RETURNING id
)
INSERT INTO song_versions (song_id, language_id, title, lyrics, lyrics_with_chords, original_key, is_original, status, is_published)
VALUES (
  (SELECT id FROM s),
  (SELECT id FROM languages WHERE code='sn'),
  'Ishe Komborera Africa',
  E'{Verse}\nIshe komborera Africa\nInzwai miteuro yedu\nIshe komborera\nIsu mhuri yayo',
  E'{Verse}\n[G]Ishe kombo[C]rera [G]Africa\n[G]Inzwai mite[D]uro [G]yedu\n[G]Ishe kombo[C]rera\n[G]Isu mhuri [D]ya[G]yo',
  'G', TRUE, 'original', TRUE
);

INSERT INTO song_tags (song_id, tag_id)
SELECT (SELECT id FROM songs WHERE title='Ishe Komborera Africa'), id
FROM tags WHERE (category,label) IN
  (('theme','Prayer & Intercession'), ('theme','Unity & Community'), ('song_type','Hymn'), ('tempo_feel','Slow'));
