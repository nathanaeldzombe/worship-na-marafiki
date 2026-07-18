import { sql } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/manage — full song list (published AND hidden), for the panel
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'You must be signed in.' }, { status: 401 });

    const songs = await sql`
      SELECT
        s.id,
        s.title,
        s.is_published,
        s.rights_status,
        a.name AS artist,
        c.name AS country,
        l.name AS original_language,
        (SELECT COUNT(*) FROM song_versions v WHERE v.song_id = s.id)::int AS version_count,
        s.created_at
      FROM songs s
      LEFT JOIN artists a   ON a.id = s.artist_id
      LEFT JOIN countries c ON c.id = s.country_id
      LEFT JOIN languages l ON l.id = s.original_language_id
      ORDER BY s.created_at DESC
    `;
    return Response.json({ songs });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

// PATCH /api/manage — hide/show a song, or edit its basic details
// Body: { id, action: 'toggle' | 'edit', ...fields }
export async function PATCH(request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'You must be signed in.' }, { status: 401 });

    const b = await request.json();
    if (!b.id) return Response.json({ error: 'Missing song id.' }, { status: 400 });

    if (b.action === 'toggle') {
      // flip published state on the song AND its versions together
      const [row] = await sql`SELECT is_published FROM songs WHERE id = ${b.id}`;
      if (!row) return Response.json({ error: 'Song not found.' }, { status: 404 });
      const next = !row.is_published;
      await sql`UPDATE songs SET is_published = ${next}, updated_at = now() WHERE id = ${b.id}`;
      await sql`UPDATE song_versions SET is_published = ${next}, updated_at = now() WHERE song_id = ${b.id}`;
      return Response.json({ ok: true, is_published: next });
    }

    if (b.action === 'edit') {
      await sql`
        UPDATE songs
        SET title = COALESCE(${b.title ?? null}, title),
            rights_status = COALESCE(${b.rightsStatus ?? null}, rights_status),
            updated_at = now()
        WHERE id = ${b.id}
      `;
      return Response.json({ ok: true });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/manage?id=123 — permanently delete a song (+ its versions/tags/media via cascade)
export async function DELETE(request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'You must be signed in.' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));
    if (!id) return Response.json({ error: 'Missing song id.' }, { status: 400 });

    // media_links references versions; remove them first to be safe,
    // then versions, tags, and the song. (schema cascades cover most of this,
    // but we do it explicitly so it works regardless of FK setup.)
    await sql`DELETE FROM media_links WHERE version_id IN (SELECT id FROM song_versions WHERE song_id = ${id})`;
    await sql`DELETE FROM song_versions WHERE song_id = ${id}`;
    await sql`DELETE FROM song_tags WHERE song_id = ${id}`;
    await sql`DELETE FROM songs WHERE id = ${id}`;

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
