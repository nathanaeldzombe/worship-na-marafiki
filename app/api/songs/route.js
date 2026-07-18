import { sql } from '@/lib/db';

// GET /api/songs  — public library, reads from the publish-gated view
// Supports ?q= &lang= &country= &theme= &type= &tempo=
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const lang = searchParams.get('lang');
  const country = searchParams.get('country');
  const theme = searchParams.get('theme');
  const type = searchParams.get('type');
  const tempo = searchParams.get('tempo');

  try {
    // Base: one row per published version, with joined labels + inherited tags
    const rows = await sql`
      SELECT
        v.id            AS version_id,
        v.song_id,
        v.title,
        v.original_key,
        v.status,
        l.name          AS language,
        c.name          AS country,
        a.name          AS artist,
        s.rights_status,
        LEFT(regexp_replace(v.lyrics, E'\\[[^\\]]*\\]', '', 'g'), 90) AS excerpt,
        COALESCE(
          (SELECT array_agg(t.label ORDER BY t.label)
           FROM song_tags st JOIN tags t ON t.id = st.tag_id
           WHERE st.song_id = s.id AND t.category = 'theme'), '{}'
        ) AS themes,
        (SELECT t.label FROM song_tags st JOIN tags t ON t.id = st.tag_id
           WHERE st.song_id = s.id AND t.category = 'song_type' LIMIT 1) AS song_type,
        (SELECT t.label FROM song_tags st JOIN tags t ON t.id = st.tag_id
           WHERE st.song_id = s.id AND t.category = 'tempo_feel' LIMIT 1) AS tempo
      FROM public_song_versions v
      JOIN songs s      ON s.id = v.song_id
      JOIN languages l  ON l.id = v.language_id
      LEFT JOIN countries c ON c.id = s.country_id
      LEFT JOIN artists a   ON a.id = s.artist_id
      ORDER BY v.updated_at DESC
    `;

    // Filter in JS (dataset is small at launch; move to SQL when it grows)
    let out = rows;
    if (q) {
      const needle = q.toLowerCase();
      out = out.filter(
        (r) =>
          r.title?.toLowerCase().includes(needle) ||
          r.artist?.toLowerCase().includes(needle) ||
          r.excerpt?.toLowerCase().includes(needle)
      );
    }
    if (lang) out = out.filter((r) => r.language === lang);
    if (country) out = out.filter((r) => r.country === country);
    if (type) out = out.filter((r) => r.song_type === type);
    if (tempo) out = out.filter((r) => r.tempo === tempo);
    if (theme) out = out.filter((r) => (r.themes || []).includes(theme));

    return Response.json({ songs: out });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/songs — panel creates a song (the work) + its tags
// Body: { title, artistName, countryName, originalLanguageName, year,
//         rightsStatus, rightsNotes, themes:[], songType, tempo }
export async function POST(request) {
  try {
    const b = await request.json();

    // resolve or create artist
    let artistId = null;
    if (b.artistName?.trim()) {
      const country = await sql`SELECT id FROM countries WHERE name = ${b.countryName}`;
      const cid = country[0]?.id ?? null;
      const found = await sql`SELECT id FROM artists WHERE name = ${b.artistName}`;
      artistId =
        found[0]?.id ??
        (await sql`INSERT INTO artists (name, country_id) VALUES (${b.artistName}, ${cid}) RETURNING id`)[0]
          .id;
    }

    const [song] = await sql`
      INSERT INTO songs (title, artist_id, original_language_id, country_id, year_written, rights_status, rights_notes)
      VALUES (
        ${b.title},
        ${artistId},
        (SELECT id FROM languages WHERE name = ${b.originalLanguageName}),
        (SELECT id FROM countries WHERE name = ${b.countryName}),
        ${b.year || null},
        ${b.rightsStatus},
        ${b.rightsNotes || null}
      )
      RETURNING id
    `;

    // attach tags (themes[] + one song_type + one tempo)
    const slugs = [
      ...(b.themes || []).map((t) => ['theme', t]),
      ...(b.songType ? [['song_type', b.songType]] : []),
      ...(b.tempo ? [['tempo_feel', b.tempo]] : []),
    ];
    for (const [category, label] of slugs) {
      await sql`
        INSERT INTO song_tags (song_id, tag_id)
        SELECT ${song.id}, id FROM tags WHERE category = ${category}::tag_category AND label = ${label}
        ON CONFLICT DO NOTHING
      `;
    }

    return Response.json({ songId: song.id });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
