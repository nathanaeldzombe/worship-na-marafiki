import { sql } from '@/lib/db';

// Server-side song fetch (used by the song page for SSR + metadata).
// Mirrors /api/songs/[id] but callable directly during server render.
export async function getSongForPage(id) {
  const numId = Number(id);
  if (!numId) return null;

  const [song] = await sql`
    SELECT s.id, s.title, s.rights_status, s.year_written,
           a.name AS artist, c.name AS country,
           (SELECT array_agg(t.label) FROM song_tags st JOIN tags t ON t.id = st.tag_id
              WHERE st.song_id = s.id AND t.category='theme') AS themes,
           (SELECT t.label FROM song_tags st JOIN tags t ON t.id = st.tag_id
              WHERE st.song_id = s.id AND t.category='song_type' LIMIT 1) AS song_type,
           (SELECT t.label FROM song_tags st JOIN tags t ON t.id = st.tag_id
              WHERE st.song_id = s.id AND t.category='tempo_feel' LIMIT 1) AS tempo
    FROM songs s
    LEFT JOIN artists a ON a.id = s.artist_id
    LEFT JOIN countries c ON c.id = s.country_id
    WHERE s.id = ${numId} AND s.is_published = TRUE
  `;
  if (!song) return null;

  const versions = await sql`
    SELECT v.id, v.title, v.lyrics, v.lyrics_with_chords, v.original_key,
           v.is_original, v.status, l.name AS language, l.code AS language_code
    FROM song_versions v
    JOIN languages l ON l.id = v.language_id
    WHERE v.song_id = ${numId} AND v.is_published = TRUE
      AND v.status IN ('original','translation_verified')
    ORDER BY v.is_original DESC, l.name
  `;
  if (!versions.length) return null;

  const media = await sql`
    SELECT m.version_id, m.type, m.instrument, m.url, m.label
    FROM media_links m
    JOIN song_versions v ON v.id = m.version_id
    WHERE v.song_id = ${numId}
  `;

  return { song, versions, media };
}

// For the sitemap: all published song ids + when they changed.
export async function getAllPublishedSongIds() {
  try {
    return await sql`
      SELECT id, updated_at FROM songs WHERE is_published = TRUE ORDER BY id
    `;
  } catch {
    return [];
  }
}
