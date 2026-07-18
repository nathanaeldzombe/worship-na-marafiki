import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Where recommendation emails are sent, and the verified sender.
// Set these in Vercel → Settings → Environment Variables.
const TO = process.env.SUGGESTIONS_TO || 'hello@worshipnamarafiki.org';
const FROM = process.env.SUGGESTIONS_FROM || 'Worship na Marafiki <onboarding@resend.dev>';

export async function POST(request) {
  try {
    const b = await request.json();

    if (!b.yourName?.trim() || !b.songTitle?.trim()) {
      return Response.json({ error: 'Name and song title are required.' }, { status: 400 });
    }

    // 1) Save a backup row (best-effort — never blocks the submission)
    try {
      await sql`
        INSERT INTO song_suggestions
          (submitter_name, submitter_email, song_title, artist, language, translated, links, lyrics, note)
        VALUES (
          ${b.yourName}, ${b.yourEmail || null}, ${b.songTitle}, ${b.artist || null},
          ${b.language || null}, ${b.translated || null}, ${b.links || null},
          ${b.lyrics || null}, ${b.note || null}
        )
      `;
    } catch (e) {
      console.error('Could not save suggestion backup:', e.message);
    }

    // 2) Email the team (only if Resend is configured)
    if (process.env.RESEND_API_KEY) {
      const text = [
        `New song recommendation from ${b.yourName}${b.yourEmail ? ` (${b.yourEmail})` : ''}`,
        ``,
        `Song: ${b.songTitle}`,
        `Artist: ${b.artist || '—'}`,
        `Language: ${b.language || '—'}`,
        `Translated: ${b.translated || '—'}`,
        ``,
        `Links:`,
        b.links || '—',
        ``,
        `Lyrics:`,
        b.lyrics || '—',
        ``,
        `Note:`,
        b.note || '—',
      ].join('\n');

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM,
          to: [TO],
          reply_to: b.yourEmail || undefined,
          subject: `Song recommendation: ${b.songTitle}`,
          text,
        }),
      });

      if (!res.ok) {
        const detail = await res.text();
        console.error('Resend error:', detail);
        // The backup row is saved, so we still report success to the user.
      }
    }

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
