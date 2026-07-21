import { sql } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/manage — full song list (published AND hidden), for the panel
// GET /api/manage?id=123 — one song with ALL details for editing
export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'You must be signed in.' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const editId = searchParams.get('id');

    if (editId) {
      const id = Number(editId);
      const [song] = await sql`
        SELECT s.id, s.title, s.is_published, s.rights_status, s.rights_notes,
               s.year_written, a.name AS artist, c.name AS country,
               l.name AS original_language,
               (SELECT array_agg(t.label) FROM song_tags st JOIN tags t ON t.id = st.tag_id
                  WHERE st.song_id = s.id AND t.category='theme') AS themes,
               (SELECT t.label FROM song_tags st JOIN tags t ON t.id = st.tag_id
                  WHERE st.song_id = s.id AND t.category='song_type' LIMIT 1) AS song_type,
               (SELECT t.label FROM song_tags st JOIN tags t ON t.id = st.tag_id
                  WHERE st.song_id = s.id AND t.category='tempo_feel' LIMIT 1) AS tempo
        FROM songs s
        LEFT JOIN artists a ON a.id = s.artist_id
        LEFT JOIN countries c ON c.id = s.country_id
        LEFT JOIN languages l ON l.id = s.original_language_id
        WHERE s.id = ${id}
      `;
      if (!song) return Response.json({ error: 'Song not found.' }, { status: 404 });

      const versions = await sql`
        SELECT v.id, v.title, v.lyrics_with_chords, v.lyrics, v.original_key,
               v.is_original, v.status, v.translated_by, l.name AS language
        FROM song_versions v
        JOIN languages l ON l.id = v.language_id
        WHERE v.song_id = ${id}
        ORDER BY v.is_original DESC, l.name
      `;
      const media = await sql`
        SELECT m.id, m.version_id, m.instrument, m.url
        FROM media_links m
        JOIN song_versions v ON v.id = m.version_id
        WHERE v.song_id = ${id}
      `;
      return Response.json({ song, versions, media });
    }

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

// PUT /api/manage — full update of a song and its versions/media
export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'You must be signed in.' }, { status: 401 });

    const b = await request.json();
    if (!b.id) return Response.json({ error: 'Missing song id.' }, { status: 400 });

    // 1) update song core fields + resolve/create artist
    let artistId = null;
    if (b.artist?.trim()) {
      const found = await sql`SELECT id FROM artists WHERE name = ${b.artist}`;
      artistId = found[0]?.id ??
        (await sql`INSERT INTO artists (name, country_id) VALUES (${b.artist}, (SELECT id FROM countries WHERE name = ${b.country})) RETURNING id`)[0].id;
    }
    await sql`
      UPDATE songs SET
        title = ${b.title},
        artist_id = ${artistId},
        original_language_id = (SELECT id FROM languages WHERE name = ${b.originalLanguage}),
        country_id = (SELECT id FROM countries WHERE name = ${b.country}),
        year_written = ${b.year || null},
        rights_status = ${b.rightsStatus},
        rights_notes = ${b.rightsNotes || null},
        updated_at = now()
      WHERE id = ${b.id}
    `;

    // 2) rewrite tags (themes[] + one song_type + one tempo)
    await sql`DELETE FROM song_tags WHERE song_id = ${b.id}`;
    const slugs = [
      ...(b.themes || []).map((t) => ['theme', t]),
      ...(b.songType ? [['song_type', b.songType]] : []),
      ...(b.tempo ? [['tempo_feel', b.tempo]] : []),
    ];
    for (const [category, label] of slugs) {
      await sql`
        INSERT INTO song_tags (song_id, tag_id)
        SELECT ${b.id}, id FROM tags WHERE category = ${category}::tag_category AND label = ${label}
        ON CONFLICT DO NOTHING
      `;
    }

    // 3) update each version + its media
    for (const v of b.versions || []) {
      const publishVersion = v.status === 'original' || v.status === 'translation_verified';
      if (v.id) {
        // existing version
        await sql`
          UPDATE song_versions SET
            language_id = (SELECT id FROM languages WHERE name = ${v.language}),
            title = ${v.title},
            lyrics_with_chords = ${v.chordbora},
            lyrics = ${(v.chordbora || '').replace(/\[[^\]]+\]/g, '').replace(/^[LR]:\s?/gm, '').replace(/\*\*/g,'').replace(/[*_]/g,'')},
            original_key = ${v.key || null},
            is_original = ${v.status === 'original'},
            status = ${v.status},
            translated_by = ${v.translatedBy || null},
            is_published = ${publishVersion},
            updated_at = now()
          WHERE id = ${v.id}
        `;
        await sql`DELETE FROM media_links WHERE version_id = ${v.id}`;
        for (const m of v.media || []) {
          if (!m.url?.trim()) continue;
          await sql`INSERT INTO media_links (version_id, type, instrument, url) VALUES (${v.id}, 'youtube_tutorial', ${m.instrument}, ${m.url})`;
        }
      } else {
        // brand-new version added during editing
        const [nv] = await sql`
          INSERT INTO song_versions (song_id, language_id, title, lyrics, lyrics_with_chords, original_key, is_original, status, translated_by, is_published)
          VALUES (
            ${b.id},
            (SELECT id FROM languages WHERE name = ${v.language}),
            ${v.title},
            ${(v.chordbora || '').replace(/\[[^\]]+\]/g, '').replace(/^[LR]:\s?/gm, '').replace(/\*\*/g,'').replace(/[*_]/g,'')},
            ${v.chordbora},
            ${v.key || null},
            ${v.status === 'original'},
            ${v.status},
            ${v.translatedBy || null},
            ${publishVersion}
          ) RETURNING id
        `;
        for (const m of v.media || []) {
          if (!m.url?.trim()) continue;
          await sql`INSERT INTO media_links (version_id, type, instrument, url) VALUES (${nv.id}, 'youtube_tutorial', ${m.instrument}, ${m.url})`;
        }
      }
    }

    // 4) delete versions the editor removed
    if (Array.isArray(b.deletedVersionIds)) {
      for (const vid of b.deletedVersionIds) {
        await sql`DELETE FROM media_links WHERE version_id = ${vid}`;
        await sql`DELETE FROM song_versions WHERE id = ${vid}`;
      }
    }

    // 5) publish state of the song — a song can only be live when its rights
    // are cleared (public domain or permission granted). Otherwise it stays a
    // hidden draft, regardless of version status.
    const rightsCleared = b.rightsStatus === 'public_domain' || b.rightsStatus === 'permission_granted';
    const [{ any_eligible }] = await sql`
      SELECT bool_or(status IN ('original','translation_verified')) AS any_eligible
      FROM song_versions WHERE song_id = ${b.id}
    `;
    // Default: keep it live if rights are cleared and something is eligible,
    // unless the editor explicitly asked to keep it a draft (publish === false).
    const shouldPublish = rightsCleared && !!any_eligible && b.publish !== false;
    await sql`UPDATE song_versions SET is_published = ${shouldPublish} WHERE song_id = ${b.id} AND status IN ('original','translation_verified')`;
    if (!shouldPublish) {
      await sql`UPDATE song_versions SET is_published = FALSE WHERE song_id = ${b.id}`;
    }
    await sql`UPDATE songs SET is_published = ${shouldPublish} WHERE id = ${b.id}`;

    return Response.json({ ok: true, published: shouldPublish });
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
