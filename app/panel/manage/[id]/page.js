'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Nav, Footer } from '@/components/Chrome';
import { ALL_LANGUAGES } from '@/lib/languages';
import { parseChordBora } from '@/lib/chordbora';
import ChordBoraEditor from '@/components/ChordBoraEditor';
import ChordBoraView from '@/components/ChordBoraView';

const COUNTRIES = ['Tanzania','Kenya','Uganda','Rwanda','Burundi','DR Congo','Nigeria','Ghana','South Africa','Zimbabwe','Botswana','Malawi','Ethiopia','Eritrea','Somalia','Egypt','Senegal','Zambia'];
const THEMES = ['Praise','Adoration','Thanksgiving','Surrender','Repentance','Faith & Trust','Hope','Healing','Deliverance','Holy Spirit','The Cross','Resurrection','Second Coming','Communion','Prayer & Intercession','Unity & Community','Mission & Evangelism','Christmas','Easter','Wedding','Funeral & Comfort'];
const SONG_TYPES = ['Hymn','Chorus','Contemporary','Traditional','Call and Response','Medley'];
const TEMPOS = ['Fast','Mid-tempo','Slow','Celebration','Reflective'];
const RIGHTS = [['public_domain','Public domain'],['owner_contacted','Owner contacted'],['permission_pending','Permission pending'],['permission_granted','Permission granted']];
const STATUSES = [['original','Original'],['translation_in_progress','Translation in progress'],['translation_review','In panel review'],['translation_verified','Verified by panel']];
const KEYS = ['C','C#','Db','D','D#','Eb','E','F','F#','Gb','G','G#','Ab','A','A#','Bb','B'];
const INSTRUMENTS = ['Guitar','Keyboard','Bass','Drums','Vocals','Full band'];

const input = { width: '100%', padding: '10px 12px', fontSize: 14, color: 'var(--text-dark)', background: 'white', border: '1px solid var(--border-gold)', borderRadius: 3, outline: 'none', fontFamily: "'Crimson Pro', serif" };
const lbl = { fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500, display: 'block' };

export default function EditSongPage({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const [song, setSong] = useState(null);
  const [versions, setVersions] = useState([]);
  const [deletedVersionIds, setDeletedVersionIds] = useState([]);
  const [activeV, setActiveV] = useState(0);
  const [steps, setSteps] = useState(0);
  const [flats, setFlats] = useState(false);

  useEffect(() => {
    fetch(`/api/manage?id=${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setSong({
          id: d.song.id, title: d.song.title || '', artist: d.song.artist || '',
          country: d.song.country || 'Tanzania', originalLanguage: d.song.original_language || 'Swahili',
          year: d.song.year_written || '', rightsStatus: d.song.rights_status,
          rightsNotes: d.song.rights_notes || '',
          themes: d.song.themes || [], songType: d.song.song_type || '', tempo: d.song.tempo || '',
        });
        setVersions((d.versions || []).map((v) => ({
          id: v.id, language: v.language, title: v.title || '',
          chordbora: v.lyrics_with_chords || v.lyrics || '', key: v.original_key || 'G',
          status: v.status, translatedBy: v.translated_by || '',
          media: (d.media || []).filter((m) => m.version_id === v.id).map((m) => ({ instrument: m.instrument || 'Guitar', url: m.url })),
        })));
      })
      .catch((e) => setMsg({ ok: false, text: e.message }))
      .finally(() => setLoading(false));
  }, [params.id]);

  const v = versions[activeV];
  const isCallResponse = song?.songType === 'Call and Response';
  const preview = useMemo(() => (v ? parseChordBora(v.chordbora, steps, flats) : []), [v, steps, flats]);

  function setV(patch) {
    setVersions((prev) => prev.map((x, i) => (i === activeV ? { ...x, ...patch } : x)));
  }
  function toggleTheme(t) {
    setSong((s) => ({ ...s, themes: s.themes.includes(t) ? s.themes.filter((x) => x !== t) : [...s.themes, t] }));
  }
  function addVersion() {
    setVersions((prev) => [...prev, { language: 'Swahili', title: '', chordbora: '', key: 'G', status: 'translation_in_progress', translatedBy: '', media: [] }]);
    setActiveV(versions.length);
  }
  function removeVersion(i) {
    const target = versions[i];
    if (target.id) setDeletedVersionIds((d) => [...d, target.id]);
    setVersions((prev) => prev.filter((_, idx) => idx !== i));
    setActiveV(0);
  }
  function addMedia() {
    setV({ media: [...v.media, { instrument: 'Guitar', url: '' }] });
  }
  function setMedia(idx, patch) {
    setV({ media: v.media.map((m, i) => (i === idx ? { ...m, ...patch } : m)) });
  }
  function removeMedia(idx) {
    setV({ media: v.media.filter((_, i) => i !== idx) });
  }

  async function save() {
    setSaving(true); setMsg(null);
    try {
      const r = await fetch('/api/manage', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...song, versions, deletedVersionIds }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setMsg({ ok: true, text: 'Saved. Redirecting…' });
      setTimeout(() => router.push('/panel/manage'), 900);
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <><Nav active="submit" /><p style={{ padding: '3rem 2rem', textAlign: 'center' }}>Loading…</p></>;
  if (!song) return <><Nav active="submit" /><p style={{ padding: '3rem 2rem', textAlign: 'center' }}>{msg?.text || 'Song not found.'}</p></>;

  return (
    <>
      <Nav active="submit" />
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '2rem 2rem 4rem' }}>
        <Link href="/panel/manage" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>← Back to Manage Songs</Link>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.2rem', fontWeight: 600, color: 'var(--navy)', margin: '8px 0 1.5rem' }}>Edit Song</h1>

        {/* SONG DETAILS */}
        <h2 style={sectionH}>Song details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '0 20px' }}>
          <Field label="Title"><input style={input} value={song.title} onChange={(e) => setSong({ ...song, title: e.target.value })} /></Field>
          <Field label="Artist / composer"><input style={input} value={song.artist} onChange={(e) => setSong({ ...song, artist: e.target.value })} /></Field>
          <Field label="Country"><select style={input} value={song.country} onChange={(e) => setSong({ ...song, country: e.target.value })}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Original language"><select style={input} value={song.originalLanguage} onChange={(e) => setSong({ ...song, originalLanguage: e.target.value })}>{ALL_LANGUAGES.map((l) => <option key={l}>{l}</option>)}</select></Field>
          <Field label="Year (optional)"><input style={input} value={song.year} onChange={(e) => setSong({ ...song, year: e.target.value })} /></Field>
          <Field label="Rights status"><select style={input} value={song.rightsStatus} onChange={(e) => setSong({ ...song, rightsStatus: e.target.value })}>{RIGHTS.map(([val, l]) => <option key={val} value={val}>{l}</option>)}</select></Field>
        </div>
        <Field label="Rights notes"><textarea style={{ ...input, minHeight: 60, resize: 'vertical' }} value={song.rightsNotes} onChange={(e) => setSong({ ...song, rightsNotes: e.target.value })} /></Field>

        {/* TAGS */}
        <h2 style={sectionH}>Tags</h2>
        <Field label="Themes"><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{THEMES.map((t) => <Chip key={t} active={song.themes.includes(t)} onClick={() => toggleTheme(t)}>{t}</Chip>)}</div></Field>
        <Field label="Song type"><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{SONG_TYPES.map((t) => <Chip key={t} active={song.songType === t} onClick={() => setSong({ ...song, songType: t })}>{t}</Chip>)}</div></Field>
        {isCallResponse && <div style={{ fontSize: 13, color: 'var(--burgundy)', marginTop: -8, marginBottom: 16 }}>Call-and-response mode is on — use the Leader / Response buttons in the lyric editor to mark who sings each line.</div>}
        <Field label="Tempo"><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{TEMPOS.map((t) => <Chip key={t} active={song.tempo === t} onClick={() => setSong({ ...song, tempo: t })}>{t}</Chip>)}</div></Field>

        {/* VERSIONS */}
        <h2 style={sectionH}>Versions & lyrics</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {versions.map((ver, i) => (
            <button key={i} onClick={() => { setActiveV(i); setSteps(0); }} style={{ padding: '7px 14px', borderRadius: 3, border: `1.5px solid ${i === activeV ? 'var(--gold)' : 'var(--border-gold)'}`, background: i === activeV ? 'rgba(201,151,74,0.12)' : 'white', cursor: 'pointer', fontFamily: "'Crimson Pro', serif", fontSize: 13, color: 'var(--navy)' }}>
              {ver.language || 'New'}{ver.status === 'original' ? ' ★' : ''}
            </button>
          ))}
          <button onClick={addVersion} style={{ padding: '7px 14px', borderRadius: 3, border: '1px dashed var(--border-gold)', background: 'transparent', cursor: 'pointer', fontFamily: "'Crimson Pro', serif", fontSize: 13, color: 'var(--text-muted)' }}>+ Add version</button>
        </div>

        {v && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '0 16px' }}>
              <Field label="Language"><select style={input} value={v.language} onChange={(e) => setV({ language: e.target.value })}>{ALL_LANGUAGES.map((l) => <option key={l}>{l}</option>)}</select></Field>
              <Field label="Title in this language"><input style={input} value={v.title} onChange={(e) => setV({ title: e.target.value })} /></Field>
              <Field label="Key"><select style={input} value={v.key} onChange={(e) => setV({ key: e.target.value })}>{KEYS.map((k) => <option key={k}>{k}</option>)}</select></Field>
              <Field label="Translation status"><select style={input} value={v.status} onChange={(e) => setV({ status: e.target.value })}>{STATUSES.map(([val, l]) => <option key={val} value={val}>{l}</option>)}</select></Field>
              <Field label="Translated / verified by"><input style={input} value={v.translatedBy} onChange={(e) => setV({ translatedBy: e.target.value })} /></Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
              <div>
                <span style={lbl}>Lyrics & chords (ChordBora)</span>
                <ChordBoraEditor value={v.chordbora} onChange={(val) => setV({ chordbora: val })} isCallResponse={isCallResponse} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={lbl}>Live preview</span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <MiniBtn onClick={() => setSteps((s) => s - 1)}>−1</MiniBtn>
                    <span style={{ fontSize: 13, fontWeight: 600, minWidth: 26, textAlign: 'center', color: 'var(--navy)' }}>{steps > 0 ? `+${steps}` : steps}</span>
                    <MiniBtn onClick={() => setSteps((s) => s + 1)}>+1</MiniBtn>
                    <MiniBtn active={flats} onClick={() => setFlats((f) => !f)}>♭</MiniBtn>
                  </div>
                </div>
                <div style={{ background: 'var(--cream)', border: '1px solid var(--border-gold)', borderRadius: 3, padding: 16, minHeight: 260, overflowX: 'auto' }}>
                  <ChordBoraView sections={preview} lyricSize="0.95rem" />
                </div>
              </div>
            </div>

            {/* MEDIA LINKS */}
            <div style={{ marginTop: 18 }}>
              <span style={lbl}>Video / audio links</span>
              {v.media.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                  <select style={{ ...input, width: 140 }} value={m.instrument} onChange={(e) => setMedia(i, { instrument: e.target.value })}>{INSTRUMENTS.map((x) => <option key={x}>{x}</option>)}</select>
                  <input style={{ ...input, flex: 1, minWidth: 200 }} value={m.url} onChange={(e) => setMedia(i, { url: e.target.value })} placeholder="https://youtube.com/…" />
                  <button onClick={() => removeMedia(i)} style={{ padding: '8px 12px', border: '1px solid rgba(139,26,26,0.3)', borderRadius: 3, background: 'white', color: 'var(--error)', cursor: 'pointer', fontFamily: "'Crimson Pro', serif", fontSize: 13 }}>Remove</button>
                </div>
              ))}
              <button className="btn-ghost" onClick={addMedia} style={{ padding: '8px 16px', marginTop: 4 }}>+ Add link</button>
            </div>

            {versions.length > 1 && (
              <button onClick={() => removeVersion(activeV)} style={{ marginTop: 20, padding: '8px 16px', border: '1px solid rgba(139,26,26,0.3)', borderRadius: 3, background: 'white', color: 'var(--error)', cursor: 'pointer', fontFamily: "'Crimson Pro', serif", fontSize: 13 }}>
                Delete this version ({v.language})
              </button>
            )}
          </div>
        )}

        {/* SAVE */}
        <div style={{ marginTop: 30, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="btn-primary" onClick={save} disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving…' : 'Save all changes'}</button>
          <Link href="/panel/manage" className="btn-ghost">Cancel</Link>
          {msg && <span style={{ fontSize: 14, color: msg.ok ? 'var(--success)' : 'var(--error)' }}>{msg.text}</span>}
        </div>
      </div>
      <Footer />
    </>
  );
}

const sectionH = { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 600, color: 'var(--navy)', margin: '2rem 0 1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-gold)' };
function Field({ label, children }) { return <div style={{ marginBottom: 16 }}><span style={lbl}>{label}</span>{children}</div>; }
function Chip({ active, onClick, children }) {
  return <button onClick={onClick} style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, cursor: 'pointer', border: `1.5px solid ${active ? 'var(--gold)' : 'var(--border-gold)'}`, background: active ? 'rgba(201,151,74,0.12)' : 'white', color: active ? 'var(--navy)' : 'var(--text-muted)', fontWeight: active ? 600 : 400, fontFamily: "'Crimson Pro', serif" }}>{children}</button>;
}
function MiniBtn({ active, onClick, children }) {
  return <button onClick={onClick} style={{ padding: '4px 10px', borderRadius: 3, fontSize: 12, cursor: 'pointer', border: `1px solid ${active ? 'var(--gold)' : 'var(--border-gold)'}`, background: active ? 'var(--navy)' : 'white', color: active ? 'var(--gold-light)' : 'var(--text-mid)' }}>{children}</button>;
}
