'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Nav, Footer } from '@/components/Chrome';

const LANGUAGES = ['Swahili','Zulu','Kinyarwanda','Shona','Igbo','Yoruba','Hausa','Xhosa','Setswana','Kirundi','Luganda','Kikuyu','Dholuo','Chichewa','Amharic','Tigrinya','Lingala','Tshiluba'];
const THEMES = ['Praise','Adoration','Thanksgiving','Surrender','Faith & Trust','Hope','Healing','Holy Spirit','The Cross','Communion','Prayer & Intercession','Unity & Community','Christmas','Easter'];
const TEMPOS = ['Fast','Mid-tempo','Slow','Celebration','Reflective'];

function LibraryInner() {
  const params = useSearchParams();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [lang, setLang] = useState(params.get('lang') || '');
  const [theme, setTheme] = useState('');
  const [tempo, setTempo] = useState('');

  useEffect(() => {
    const sp = new URLSearchParams();
    if (q) sp.set('q', q);
    if (lang) sp.set('lang', lang);
    if (theme) sp.set('theme', theme);
    if (tempo) sp.set('tempo', tempo);
    setLoading(true);
    fetch(`/api/songs?${sp.toString()}`)
      .then((r) => r.json())
      .then((d) => setSongs(d.songs || []))
      .catch(() => setSongs([]))
      .finally(() => setLoading(false));
  }, [q, lang, theme, tempo]);

  return (
    <>
      <Nav active="songs" />

      <div style={{ background: 'var(--navy)', padding: '3rem 2rem 2.5rem', textAlign: 'center' }}>
        <span style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.6rem', display: 'block' }}>Song Library</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 600, color: 'var(--gold-light)', marginBottom: '0.8rem' }}>Browse All Songs</h1>
        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>Lyrics, ChordBora chords, and translations across Africa</p>
      </div>

      <div style={{ background: 'var(--navy)', padding: '0 2rem 2rem' }}>
        <div style={{ display: 'flex', background: 'white', border: '1px solid var(--border-gold)', borderRadius: 3, overflow: 'hidden', maxWidth: 640, margin: '0 auto' }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, artist, or keyword…"
            style={{ flex: 1, border: 'none', padding: '13px 16px', fontFamily: "'Crimson Pro', serif", fontSize: '1rem', outline: 'none', background: 'transparent' }} />
          <span style={{ background: 'var(--burgundy)', color: 'var(--gold-light)', padding: '13px 22px', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Search</span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 2rem', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2.5rem', alignItems: 'start' }}>
        <aside style={{ border: '1px solid var(--border-gold)', borderRadius: 4, background: 'white', padding: '1.5rem', position: 'sticky', top: 80 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '1.2rem', paddingBottom: '0.7rem', borderBottom: '1px solid var(--border-gold)' }}>Filters</div>

          <FilterSelect label="Language" value={lang} setValue={setLang} options={LANGUAGES} />
          <FilterSelect label="Theme" value={theme} setValue={setTheme} options={THEMES} />
          <FilterSelect label="Tempo" value={tempo} setValue={setTempo} options={TEMPOS} />

          <button onClick={() => { setQ(''); setLang(''); setTheme(''); setTempo(''); }}
            style={{ width: '100%', padding: 8, border: '1px solid var(--border-gold)', borderRadius: 3, background: 'transparent', fontFamily: "'Crimson Pro', serif", fontSize: '0.85rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', cursor: 'pointer', marginTop: '0.5rem' }}>
            Clear filters
          </button>
        </aside>

        <main>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {loading ? 'Loading…' : <><strong style={{ color: 'var(--text-dark)' }}>{songs.length}</strong> song{songs.length !== 1 ? 's' : ''} found</>}
          </div>

          {!loading && songs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.3 }}>♪</div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: 'var(--text-mid)' }}>No songs match yet — try clearing filters, or be the first to add one.</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
            {songs.map((s) => (
              <Link key={s.version_id} href={`/songs/${s.song_id}`} style={{ textDecoration: 'none', border: '1px solid var(--border-gold)', borderRadius: 4, padding: '1.4rem', background: 'white', display: 'block' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--cream-dark)', color: 'var(--text-muted)', padding: '3px 8px', borderRadius: 2 }}>{s.language}</span>
                  {s.original_key && <span style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 500 }}>Key of {s.original_key}</span>}
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', fontWeight: 600, color: 'var(--navy)' }}>{s.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>{s.artist || '—'}</div>
                {s.excerpt && <div style={{ fontSize: '0.88rem', color: 'var(--text-mid)', fontStyle: 'italic', borderLeft: '2px solid var(--border-gold)', paddingLeft: '0.7rem', marginBottom: '0.9rem' }}>{s.excerpt}…</div>}
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {(s.themes || []).slice(0, 3).map((t) => (
                    <span key={t} style={{ fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--burgundy)', background: 'rgba(107,26,42,0.06)', padding: '2px 7px', borderRadius: 2 }}>{t}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}

function FilterSelect({ label, value, setValue, options }) {
  return (
    <div style={{ marginBottom: '1.4rem' }}>
      <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 500, marginBottom: '0.6rem', display: 'block' }}>{label}</span>
      <select value={value} onChange={(e) => setValue(e.target.value)}
        style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--border-gold)', borderRadius: 3, fontFamily: "'Crimson Pro', serif", fontSize: '0.9rem', color: 'var(--text-mid)', background: 'var(--cream)', cursor: 'pointer' }}>
        <option value="">All</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading…</div>}>
      <LibraryInner />
    </Suspense>
  );
}
