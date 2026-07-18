import { sql } from '@/lib/db';

// POST /api/versions — panel adds a language version to an existing song
// Body: { songId, languageName, title, lyrics, lyricsWithChords, originalKey,
//         isOriginal, status, translatedBy, media:[{instrument,url}] }
export async function POST(request) {
  try {
    const b = await request.json();

    const [version] = await sql`
      INSERT INTO song_versions
        (song_id, language_id, title, lyrics, lyrics_with_chords, original_key,
         is_original, status, translated_by)
      VALUES (
        ${b.songId},
        (SELECT id FROM languages WHERE name = ${b.languageName}),
        ${b.title},
        ${b.lyrics},
        ${b.lyricsWithChords || null},
        ${b.originalKey || null},
        ${!!b.isOriginal},
        ${b.status},
        ${b.translatedBy || null}
      )
      RETURNING id
    `;

    for (const m of b.media || []) {
      if (!m.url?.trim()) continue;
      await sql`
        INSERT INTO media_links (version_id, type, instrument, url)
        VALUES (${version.id}, 'youtube_tutorial', ${m.instrument}, ${m.url})
      `;
    }

    return Response.json({ versionId: version.id });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/versions — panel verifies / publishes a version
// Body: { versionId, status, verifiedBy, publish, publishSong }
export async function PATCH(request) {
  try {
    const b = await request.json();
    await sql`
      UPDATE song_versions
      SET status = ${b.status},
          verified_by = ${b.verifiedBy || null},
          verified_at = ${b.status === 'translation_verified' ? new Date().toISOString() : null},
          is_published = ${!!b.publish},
          updated_at = now()
      WHERE id = ${b.versionId}
    `;
    if (b.publishSong && b.songId) {
      await sql`UPDATE songs SET is_published = TRUE, updated_at = now() WHERE id = ${b.songId}`;
    }
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
