import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST /api/views  { songId }  — record one view (public, no auth)
export async function POST(request) {
  try {
    const { songId } = await request.json();
    if (!songId) return Response.json({ error: 'Missing songId.' }, { status: 400 });
    await sql`UPDATE songs SET view_count = view_count + 1 WHERE id = ${songId} AND is_published = TRUE`;
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

// GET /api/views  — top 3 most-viewed published songs (with a graceful fallback)
export async function GET() {
  try {
    // Most-viewed first; if there are ties or no views yet, newest fills the gap.
    const rows = await sql`
      SELECT
        s.id            AS song_id,
        s.view_count,
        v.id            AS version_id,
        v.title,
        v.original_key,
        l.name          AS language,
        a.name          AS artist,
        LEFT(regexp_replace(v.lyrics, E'\\[[^\\]]*\\]', '', 'g'), 90) AS excerpt,
        COALESCE(
          (SELECT array_agg(t.label ORDER BY t.label)
           FROM song_tags st JOIN tags t ON t.id = st.tag_id
           WHERE st.song_id = s.id AND t.category = 'theme'), '{}'
        ) AS themes
      FROM songs s
      JOIN song_versions v ON v.song_id = s.id AND v.is_original = TRUE AND v.is_published = TRUE
      LEFT JOIN languages l ON l.id = v.language_id
      LEFT JOIN artists a   ON a.id = s.artist_id
      WHERE s.is_published = TRUE
        AND s.rights_status IN ('public_domain','permission_granted')
      ORDER BY s.view_count DESC, s.created_at DESC
      LIMIT 3
    `;
    return Response.json({ songs: rows });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
