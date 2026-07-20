'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Nav, Footer } from '@/components/Chrome';
import { parseChordBora, transposeKey } from '@/lib/chordbora';

export default function SongPage({ params }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [activeVersion, setActiveVersion] = useState(0);
  const [view, setView] = useState('chords'); // 'chords' | 'lyrics'
  const [steps, setSteps] = useState(0);
  const [flats, setFlats] = useState(false);

  useEffect(() => {
    fetch(`/api/songs/${params.id}`)
      .then((r) => r.json())
      .then((d) => (d.error ? setErr(d.error) : setData(d)))
      .catch((e) => setErr(e.message));
    // Record a view (fire-and-forget; failure is harmless)
    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId: Number(params.id) }),
    }).catch(() => {});
  }, [params.id]);

  if (err) return <Shell><p style={{ padding: '4rem 2rem', textAlign: 'center' }}>Song not found.</p></Shell>;
  if (!data) return <Shell><p style={{ padding: '4rem 2rem', textAlign: 'center' }}>Loading…</p></Shell>;

  const { song, versions, media } = data;
  const v = versions[activeVersion] || versions[0];
  if (!v) return <Shell><p style={{ padding: '4rem 2rem', textAlign: 'center' }}>No published versions yet.</p></Shell>;

  const source = view === 'chords' ? (v.lyrics_with_chords || v.lyrics) : v.lyrics;
  const sections = parseChordBora(source, steps, flats);
  const currentKey = v.original_key ? transposeKey(v.original_key, steps, flats) : null;
  const versionMedia = media.filter((m) => m.version_id === v.id);

  return (
    <Shell>
      <div style={{ padding: '1rem 2rem', fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: 1100, margin: '0 auto' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link> ›{' '}
        <Link href="/library" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Songs</Link> ›{' '}
        <span>{song.title}</span>
      </div>

      {/* Hero */}
      <div style={{ background: 'var(--navy)', padding: '2.5rem 2rem 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'rgba(201,151,74,0.15)', color: 'var(--gold-light)', padding: '4px 12px', borderRadius: 2 }}>{v.language}</span>
            <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(29,158,117,0.2)', color: '#5dcaa5', padding: '4px 12px', borderRadius: 2 }}>{v.is_original ? 'Original' : 'Verified'}</span>
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 600, color: 'var(--gold-light)', lineHeight: 1.1 }}>{v.title}</div>
          <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.45)', marginBottom: '1.8rem' }}>{song.artist || '—'}{song.country ? ` · ${song.country}` : ''}</div>
          <div style={{ display: 'flex', borderTop: '1px solid rgba(201,151,74,0.15)' }}>
            <InfoChip label="Key" value={currentKey || '—'} />
            <InfoChip label="Tempo" value={song.tempo || '—'} />
            <InfoChip label="Type" value={song.song_type || '—'} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem', alignItems: 'start' }}>
        <div>
          {/* View toggle + transpose */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-gold)' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <ToggleBtn active={view === 'chords'} onClick={() => setView('chords')}>Chords + Lyrics</ToggleBtn>
              <ToggleBtn active={view === 'lyrics'} onClick={() => setView('lyrics')}>Lyrics Only</ToggleBtn>
            </div>
            {view === 'chords' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Transpose</span>
                <CtrlBtn onClick={() => setSteps((s) => s - 1)}>−</CtrlBtn>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", minWidth: 32, textAlign: 'center', color: 'var(--navy)', fontWeight: 500 }}>{steps > 0 ? `+${steps}` : steps}</span>
                <CtrlBtn onClick={() => setSteps((s) => s + 1)}>+</CtrlBtn>
                <CtrlBtn onClick={() => setSteps(0)}>Reset</CtrlBtn>
                <CtrlBtn active={flats} onClick={() => setFlats((f) => !f)}>♭</CtrlBtn>
              </div>
            )}
          </div>

          {/* Song content */}
          {sections.map((sec, i) => (
            <div key={i} style={{ marginBottom: '2.2rem' }}>
              {sec.label && (
                <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 500, marginBottom: '0.7rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {sec.label}<span style={{ flex: 1, height: 1, background: 'var(--border-gold)' }} />
                </div>
              )}
              {sec.lines.map((ln, j) =>
                ln.blank ? (
                  <div key={j} style={{ height: '0.6rem' }} />
                ) : (
                  <div key={j} style={{ marginBottom: '0.2rem' }}>
                    {view === 'chords' && ln.hasChords && (
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', fontWeight: 500, color: 'var(--burgundy)', whiteSpace: 'pre', lineHeight: 1.4 }}>{ln.chordRow}</div>
                    )}
                    <div style={{ fontSize: view === 'lyrics' ? '1.1rem' : '1.05rem', color: 'var(--text-dark)', lineHeight: view === 'lyrics' ? 1.9 : 1.6, whiteSpace: 'pre-wrap' }}>{ln.lyricRow || '\u00A0'}</div>
                  </div>
                )
              )}
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <aside>
          <SidebarCard title="This Song">
            {song.themes && <MetaRow k="Themes" val={(song.themes || []).join(', ')} />}
            <MetaRow k="Rights" val={song.rights_status?.replace(/_/g, ' ')} />
            {song.year_written && <MetaRow k="Year" val={song.year_written} />}
          </SidebarCard>

          {versions.length > 1 && (
            <SidebarCard title="Translations">
              {versions.map((ver, i) => (
                <div key={ver.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(201,151,74,0.1)', fontSize: '0.88rem' }}>
                  <span style={{ color: i === activeVersion ? 'var(--burgundy)' : 'var(--text-mid)', fontWeight: i === activeVersion ? 600 : 400 }}>{ver.language}</span>
                  <button onClick={() => { setActiveVersion(i); setSteps(0); }} style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer' }}>View →</button>
                </div>
              ))}
            </SidebarCard>
          )}

          {versionMedia.length > 0 && (
            <SidebarCard title="How to Play">
              {versionMedia.map((m) => (
                <a key={m.url} href={m.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(201,151,74,0.1)', fontSize: '0.88rem', textDecoration: 'none', color: 'var(--text-mid)' }}>
                  <span>{m.instrument || 'Tutorial'}</span>
                  <span style={{ color: 'var(--gold)' }}>Watch →</span>
                </a>
              ))}
            </SidebarCard>
          )}
        </aside>
      </div>

      <Footer />
    </Shell>
  );
}

function Shell({ children }) {
  return <><Nav active="songs" />{children}</>;
}
function InfoChip({ label, value }) {
  return (
    <div style={{ padding: '1rem 1.5rem', borderRight: '1px solid rgba(201,151,74,0.12)', textAlign: 'center' }}>
      <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 3 }}>{label}</span>
      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 600, color: 'var(--gold-light)' }}>{value}</span>
    </div>
  );
}
function ToggleBtn({ active, onClick, children }) {
  return <button onClick={onClick} style={{ padding: '6px 14px', border: '1px solid var(--border-gold)', borderRadius: 3, background: active ? 'var(--navy)' : 'transparent', color: active ? 'var(--gold-light)' : 'var(--text-muted)', fontFamily: "'Crimson Pro', serif", fontSize: '0.82rem', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>{children}</button>;
}
function CtrlBtn({ active, onClick, children }) {
  return <button onClick={onClick} style={{ padding: '6px 12px', border: '1px solid var(--border-gold)', borderRadius: 3, background: active ? 'var(--navy)' : 'transparent', color: active ? 'var(--gold-light)' : 'var(--text-mid)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', cursor: 'pointer' }}>{children}</button>;
}
function SidebarCard({ title, children }) {
  return (
    <div style={{ border: '1px solid var(--border-gold)', borderRadius: 4, background: 'white', padding: '1.4rem', marginBottom: '1.2rem' }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '1rem', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-gold)' }}>{title}</div>
      {children}
    </div>
  );
}
function MetaRow({ k, val }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(201,151,74,0.1)', fontSize: '0.88rem' }}>
      <span style={{ color: 'var(--text-muted)' }}>{k}</span>
      <span style={{ color: 'var(--text-mid)', fontWeight: 500, textAlign: 'right', textTransform: 'capitalize' }}>{val}</span>
    </div>
  );
}
