import { sql } from '@/lib/db';
export const dynamic = 'force-dynamic';
// GET /api/songs/:id — full song with every published version + media
export async function GET(_request, { params }) {
  const id = Number(params.id);
  try {
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
      WHERE s.id = ${id} AND s.is_published = TRUE
    `;
    if (!song) return Response.json({ error: 'Not found' }, { status: 404 });

    const versions = await sql`
      SELECT v.id, v.title, v.lyrics, v.lyrics_with_chords, v.original_key,
             v.is_original, v.status, l.name AS language, l.code AS language_code
      FROM song_versions v
      JOIN languages l ON l.id = v.language_id
      WHERE v.song_id = ${id} AND v.is_published = TRUE
        AND v.status IN ('original','translation_verified')
      ORDER BY v.is_original DESC, l.name
    `;

    const media = await sql`
      SELECT m.version_id, m.type, m.instrument, m.url, m.label
      FROM media_links m
      JOIN song_versions v ON v.id = m.version_id
      WHERE v.song_id = ${id}
    `;

    return Response.json({ song, versions, media });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
