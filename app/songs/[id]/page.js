import { getSongForPage } from '@/lib/song-data';
import { lyricsOnly } from '@/lib/chordbora';
import SongClient from './SongClient';

export const dynamic = 'force-dynamic';

// Per-song page metadata — this is what search engines and social shares read.
export async function generateMetadata({ params }) {
  const data = await getSongForPage(params.id);
  if (!data) {
    return { title: 'Song not found — Worship na Marafiki' };
  }
  const { song, versions } = data;
  const original = versions.find((v) => v.is_original) || versions[0];
  const lang = original?.language || '';
  const langs = [...new Set(versions.map((v) => v.language))];
  const artist = song.artist ? ` by ${song.artist}` : '';

  const title = `${song.title} — ${lang} Worship Song, Lyrics & Chords${artist}`;
  const description = `Lyrics and chords for "${song.title}"${artist}, a ${lang} worship song${
    langs.length > 1 ? `, with translations in ${langs.join(', ')}` : ''
  }. Transpose to any key and download. Free on Worship na Marafiki.`;

  return {
    title,
    description,
    keywords: [
      song.title, `${song.title} lyrics`, `${song.title} chords`,
      `${lang} worship song`, `${lang} praise song`, song.artist,
      ...langs.map((l) => `${l} worship`),
    ].filter(Boolean),
    alternates: { canonical: `https://worshipnamarafiki.org/songs/${song.id}` },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://worshipnamarafiki.org/songs/${song.id}`,
      siteName: 'Worship na Marafiki',
    },
    twitter: { card: 'summary', title, description },
  };
}

export default async function SongPage({ params }) {
  const data = await getSongForPage(params.id);

  if (!data) {
    return (
      <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', color: 'var(--navy)' }}>Song not found</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>This song may have been removed or isn&apos;t published yet.</p>
        <a href="/library" className="btn-primary" style={{ marginTop: 20, display: 'inline-block' }}>Browse the library</a>
      </div>
    );
  }

  const { song, versions } = data;
  const original = versions.find((v) => v.is_original) || versions[0];

  // Structured data (Schema.org MusicComposition) for rich search results.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicComposition',
    name: song.title,
    inLanguage: original?.language,
    ...(song.artist ? { composer: { '@type': 'Person', name: song.artist } } : {}),
    ...(song.country ? { countryOfOrigin: { '@type': 'Country', name: song.country } } : {}),
    lyrics: {
      '@type': 'CreativeWork',
      text: lyricsOnly(original?.lyrics_with_chords || original?.lyrics || ''),
    },
    url: `https://worshipnamarafiki.org/songs/${song.id}`,
  };

  return (
    <>
      {/* Structured data for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hidden-but-crawlable plain lyrics so every language version is in the HTML.
          Visually hidden; present for search engines and screen readers. */}
      <div style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
        <h1>{song.title} — {original?.language} worship song lyrics and chords</h1>
        {versions.map((v) => (
          <section key={v.id}>
            <h2>{v.title} ({v.language})</h2>
            <pre>{lyricsOnly(v.lyrics_with_chords || v.lyrics || '')}</pre>
          </section>
        ))}
      </div>

      {/* Interactive client UI */}
      <SongClient data={data} />
    </>
  );
}
