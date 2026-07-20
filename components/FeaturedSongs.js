'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function FeaturedSongs() {
  const [songs, setSongs] = useState(null);

  useEffect(() => {
    fetch('/api/views')
      .then((r) => r.json())
      .then((d) => setSongs(d.songs || []))
      .catch(() => setSongs([]));
  }, []);

  return (
    <section style={{ padding: '5rem 2rem', background: 'var(--cream)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 500 }}>Featured Songs</span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 600, color: 'var(--navy)', marginTop: '0.4rem' }}>Songs the Community Loves</h2>
          </div>
          <Link href="/library" className="btn-ghost" style={{ fontSize: 13 }}>View All Songs →</Link>
        </div>

        {songs === null ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
        ) : songs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', border: '1px dashed var(--border-gold)', borderRadius: 6, color: 'var(--text-muted)' }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: 'var(--text-mid)', marginBottom: '0.6rem' }}>The most-loved songs will appear here soon.</p>
            <p style={{ fontSize: '0.95rem' }}>As the community explores the library, the songs opened most often rise to the top.</p>
            <Link href="/library" className="btn-primary" style={{ marginTop: '1.4rem', fontSize: 13 }}>Explore the Library</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {songs.map((s) => (
              <Link key={s.song_id} href={`/songs/${s.song_id}`} style={{ textDecoration: 'none', border: '1px solid var(--border-gold)', borderRadius: 4, padding: '1.8rem', background: 'white', display: 'block' }} className="song-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'var(--cream-dark)', color: 'var(--text-muted)', padding: '3px 10px', borderRadius: 2 }}>{s.language}</span>
                  {s.original_key && <span style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 500 }}>Key of {s.original_key}</span>}
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 600, color: 'var(--navy)' }}>{s.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{s.artist || '—'}</div>
                {s.excerpt && <div style={{ fontSize: '0.95rem', color: 'var(--text-mid)', fontStyle: 'italic', borderLeft: '2px solid var(--border-gold)', paddingLeft: '0.8rem', marginBottom: '1.2rem' }}>{s.excerpt}…</div>}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(s.themes || []).slice(0, 3).map((t) => (
                    <span key={t} style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--burgundy)', background: 'rgba(107,26,42,0.06)', padding: '3px 9px', borderRadius: 2 }}>{t}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
