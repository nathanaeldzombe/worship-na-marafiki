'use client';

import { useState, useMemo } from 'react';
import { Nav, Footer } from '@/components/Chrome';
import { parseChordBora } from '@/lib/chordbora';

import { ALL_LANGUAGES as LANGUAGES } from '@/lib/languages';
const COUNTRIES = ['Tanzania','Kenya','Uganda','Rwanda','Burundi','DR Congo','Nigeria','Ghana','South Africa','Zimbabwe','Botswana','Malawi','Ethiopia','Eritrea'];
const THEMES = ['Praise','Adoration','Thanksgiving','Surrender','Repentance','Faith & Trust','Hope','Healing','Deliverance','Holy Spirit','The Cross','Resurrection','Second Coming','Communion','Prayer & Intercession','Unity & Community','Mission & Evangelism','Christmas','Easter','Wedding','Funeral & Comfort'];
const SONG_TYPES = ['Hymn','Chorus','Contemporary','Traditional','Call and Response','Medley'];
const TEMPOS = ['Fast','Mid-tempo','Slow','Celebration','Reflective'];
const RIGHTS = [['public_domain','Public domain'],['owner_contacted','Owner contacted'],['permission_pending','Permission pending'],['permission_granted','Permission granted']];
const STATUSES = [['original','Original'],['translation_in_progress','Translation in progress'],['translation_review','In panel review'],['translation_verified','Verified by panel']];
const KEYS = ['C','C#','Db','D','D#','Eb','E','F','F#','Gb','G','G#','Ab','A','A#','Bb','B'];

const input = { width: '100%', padding: '10px 12px', fontSize: 14, color: 'var(--text-dark)', background: 'white', border: '1px solid var(--border-gold)', borderRadius: 3, outline: 'none', fontFamily: "'Crimson Pro', serif" };
const lbl = { fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500, display: 'block' };

export default function UploadPage() {
  const [tab, setTab] = useState('song');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [song, setSong] = useState({ title: '', artist: '', country: 'Tanzania', originalLanguage: 'Swahili', year: '', rights: 'owner_contacted', rightsNotes: '' });
  const [versions, setVersions] = useState([]);
  const [draft, setDraft] = useState({ language: 'Swahili', title: '', chordbora: '', key: 'G', status: 'original', translatedBy: '', media: [] });
  const [mediaDraft, setMediaDraft] = useState({ instrument: 'Guitar', url: '' });
  const [steps, setSteps] = useState(0);
  const [flats, setFlats] = useState(false);
  const [themes, setThemes] = useState([]);
  const [songType, setSongType] = useState('');
  const [tempo, setTempo] = useState('');

  const preview = useMemo(() => parseChordBora(draft.chordbora, steps, flats), [draft.chordbora, steps, flats]);

  const toggleTheme = (t) => setThemes((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  const addVersion = () => {
    if (!draft.title.trim() || !draft.chordbora.trim()) return;
    setVersions((v) => [...v, { ...draft }]);
    setDraft({ language: 'Swahili', title: '', chordbora: '', key: 'G', status: 'translation_in_progress', translatedBy: '', media: [] });
    setSteps(0);
  };
  const addMedia = () => {
    if (!mediaDraft.url.trim()) return;
    setDraft((d) => ({ ...d, media: [...d.media, { ...mediaDraft }] }));
    setMediaDraft({ instrument: 'Guitar', url: '' });
  };

  const rightsOk = song.rights === 'public_domain' || song.rights === 'permission_granted';
  const hasVerified = versions.some((v) => v.status === 'original' || v.status === 'translation_verified');
  const hasTags = themes.length > 0 && songType && tempo;
  const canPublish = song.title && rightsOk && hasVerified && hasTags;

  async function publish() {
    setSaving(true);
    setMessage(null);
    try {
      const sRes = await fetch('/api/songs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: song.title, artistName: song.artist, countryName: song.country,
          originalLanguageName: song.originalLanguage, year: song.year ? Number(song.year) : null,
          rightsStatus: song.rights, rightsNotes: song.rightsNotes,
          themes, songType, tempo,
        }),
      });
      const sData = await sRes.json();
      if (sData.error) throw new Error(sData.error);
      const songId = sData.songId;

      for (const v of versions) {
        const isOriginal = v.status === 'original';
        const publishVersion = isOriginal || v.status === 'translation_verified';
        const vRes = await fetch('/api/versions', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            songId, languageName: v.language, title: v.title,
            lyrics: v.chordbora.replace(/\[[^\]]+\]/g, ''), lyricsWithChords: v.chordbora,
            originalKey: v.key, isOriginal, status: v.status, translatedBy: v.translatedBy, media: v.media,
          }),
        });
        const vData = await vRes.json();
        if (vData.error) throw new Error(vData.error);
        await fetch('/api/versions', {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ versionId: vData.versionId, status: v.status, verifiedBy: v.translatedBy, publish: publishVersion, publishSong: publishVersion, songId }),
        });
      }
      setMessage({ ok: true, text: `Published "${song.title}" to worshipnamarafiki.org.` });
    } catch (e) {
      setMessage({ ok: false, text: e.message });
    } finally {
      setSaving(false);
    }
  }

  const tabs = [['song','1 · Song'],['versions','2 · Versions & ChordBora'],['tags','3 · Tags'],['review','4 · Review']];

  return (
    <>
      <Nav active="submit" />
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '2.5rem 2rem 4rem' }}>
        <span style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 500 }}>Worship na Marafiki · Panel</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.4rem', fontWeight: 600, color: 'var(--navy)', margin: '6px 0 2px' }}>Upload a Song</h1>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1.5rem' }}>"…present your bodies as a living sacrifice, holy and acceptable to God." — Romans 12:1</div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: '1px solid var(--border-gold)', marginBottom: '1.5rem' }}>
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ padding: '9px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: 'transparent', color: tab === id ? 'var(--navy)' : 'var(--text-muted)', borderBottom: tab === id ? '2px solid var(--gold)' : '2px solid transparent', marginBottom: -1, fontFamily: "'Crimson Pro', serif" }}>{label}</button>
          ))}
        </div>

        {tab === 'song' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '0 24px' }}>
            <Field label="Song title (original language)"><input style={input} value={song.title} placeholder="e.g. Shangilia" onChange={(e) => setSong({ ...song, title: e.target.value })} /></Field>
            <Field label="Artist / composer"><input style={input} value={song.artist} placeholder="e.g. Essence of Worship" onChange={(e) => setSong({ ...song, artist: e.target.value })} /></Field>
            <Field label="Country of origin"><select style={input} value={song.country} onChange={(e) => setSong({ ...song, country: e.target.value })}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Original language"><select style={input} value={song.originalLanguage} onChange={(e) => setSong({ ...song, originalLanguage: e.target.value })}>{LANGUAGES.map((l) => <option key={l}>{l}</option>)}</select></Field>
            <Field label="Year written (optional)"><input style={input} value={song.year} placeholder="2019" onChange={(e) => setSong({ ...song, year: e.target.value })} /></Field>
            <Field label="Rights status"><select style={input} value={song.rights} onChange={(e) => setSong({ ...song, rights: e.target.value })}>{RIGHTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
            <div style={{ gridColumn: '1 / -1' }}><Field label="Rights notes (who was contacted, when, outcome)"><textarea style={{ ...input, minHeight: 70, resize: 'vertical' }} value={song.rightsNotes} onChange={(e) => setSong({ ...song, rightsNotes: e.target.value })} /></Field></div>
          </div>
        )}

        {tab === 'versions' && (
          <div>
            {versions.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <span style={lbl}>Versions added</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {versions.map((v, i) => <span key={i} style={{ padding: '6px 12px', borderRadius: 3, background: 'var(--cream-dark)', fontSize: 13, fontWeight: 500 }}>{v.language} — {v.title} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({STATUSES.find((s) => s[0] === v.status)?.[1]})</span></span>)}
                </div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0 20px' }}>
              <Field label="Language of this version"><select style={input} value={draft.language} onChange={(e) => setDraft({ ...draft, language: e.target.value })}>{LANGUAGES.map((l) => <option key={l}>{l}</option>)}</select></Field>
              <Field label="Title in this language"><input style={input} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
              <Field label="Original key"><select style={input} value={draft.key} onChange={(e) => setDraft({ ...draft, key: e.target.value })}>{KEYS.map((k) => <option key={k}>{k}</option>)}</select></Field>
              <Field label="Translation status"><select style={input} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>{STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
              <Field label="Translated by (panel member)"><input style={input} value={draft.translatedBy} onChange={(e) => setDraft({ ...draft, translatedBy: e.target.value })} /></Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
              <div>
                <span style={lbl}>Lyrics in ChordBora — chords in brackets: [G]Shangi[C]lia · sections in braces: {'{Verse 1}'}</span>
                <textarea style={{ ...input, fontFamily: 'ui-monospace, Consolas, monospace', minHeight: 260, resize: 'vertical', fontSize: 13.5, lineHeight: 1.7 }} value={draft.chordbora} placeholder={'{Verse 1}\n[G]Shangilia, [C]shangilia\n[Em]Bwana yu [D]mwema'} onChange={(e) => setDraft({ ...draft, chordbora: e.target.value })} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={lbl}>Live preview · test transpose</span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <MiniBtn onClick={() => setSteps((s) => s - 1)}>−1</MiniBtn>
                    <span style={{ fontSize: 13, fontWeight: 600, minWidth: 26, textAlign: 'center', color: 'var(--navy)' }}>{steps > 0 ? `+${steps}` : steps}</span>
                    <MiniBtn onClick={() => setSteps((s) => s + 1)}>+1</MiniBtn>
                    <MiniBtn active={flats} onClick={() => setFlats((f) => !f)}>♭</MiniBtn>
                  </div>
                </div>
                <div style={{ background: 'var(--cream)', border: '1px solid var(--border-gold)', borderRadius: 3, padding: 16, minHeight: 260, fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 13.5, lineHeight: 1.35, whiteSpace: 'pre', overflowX: 'auto' }}>
                  {preview.map((sec, i) => (
                    <div key={i} style={{ marginBottom: 10 }}>
                      {sec.label && <div style={{ color: 'var(--gold)', fontWeight: 600, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{sec.label}</div>}
                      {sec.lines.map((ln, j) => ln.blank ? <div key={j} style={{ height: 8 }} /> : (
                        <div key={j} style={{ marginBottom: 2 }}>
                          {ln.hasChords && <div style={{ color: 'var(--burgundy)', fontWeight: 600 }}>{ln.chordRow}</div>}
                          <div style={{ color: 'var(--text-dark)' }}>{ln.lyricRow || '\u00A0'}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <span style={lbl}>How-to-play videos for this version (optional)</span>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <select style={{ ...input, width: 140 }} value={mediaDraft.instrument} onChange={(e) => setMediaDraft({ ...mediaDraft, instrument: e.target.value })}>{['Guitar','Keyboard','Bass','Drums','Vocals','Full band'].map((i) => <option key={i}>{i}</option>)}</select>
                <input style={{ ...input, flex: 1, minWidth: 200 }} value={mediaDraft.url} placeholder="https://youtube.com/…" onChange={(e) => setMediaDraft({ ...mediaDraft, url: e.target.value })} />
                <button className="btn-ghost" onClick={addMedia} style={{ padding: '9px 18px' }}>Add link</button>
              </div>
              {draft.media.map((m, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{m.instrument} · {m.url}</div>)}
            </div>

            <button className="btn-primary" onClick={addVersion} style={{ marginTop: 18 }}>Add this version</button>
          </div>
        )}

        {tab === 'tags' && (
          <div>
            <Field label="Themes (choose all that apply)"><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{THEMES.map((t) => <Chip key={t} active={themes.includes(t)} onClick={() => toggleTheme(t)}>{t}</Chip>)}</div></Field>
            <Field label="Song type (choose one)"><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{SONG_TYPES.map((t) => <Chip key={t} active={songType === t} onClick={() => setSongType(t)}>{t}</Chip>)}</div></Field>
            <Field label="Tempo / feel (choose one)"><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{TEMPOS.map((t) => <Chip key={t} active={tempo === t} onClick={() => setTempo(t)}>{t}</Chip>)}</div></Field>
          </div>
        )}

        {tab === 'review' && (
          <div style={{ maxWidth: 560 }}>
            <span style={lbl}>Publish checklist — a song only goes live when every gate is cleared</span>
            <Gate ok={!!song.title}>Song details entered {song.title && `— "${song.title}"`}</Gate>
            <Gate ok={rightsOk}>Rights cleared (public domain or permission granted)</Gate>
            <Gate ok={versions.length > 0}>{versions.length} version{versions.length !== 1 && 's'} added</Gate>
            <Gate ok={hasVerified}>At least one version is original or panel-verified</Gate>
            <Gate ok={hasTags}>Tags complete (themes, song type, tempo)</Gate>
            <button className="btn-primary" disabled={!canPublish || saving} onClick={publish} style={{ marginTop: 24, opacity: canPublish && !saving ? 1 : 0.5, cursor: canPublish && !saving ? 'pointer' : 'not-allowed' }}>
              {saving ? 'Publishing…' : canPublish ? 'Publish to worshipnamarafiki.org' : 'Complete the gates above'}
            </button>
            {message && <div style={{ marginTop: 14, fontSize: 14, color: message.ok ? 'var(--success)' : 'var(--error)' }}>{message.text}</div>}
            {!rightsOk && song.title && <div style={{ marginTop: 12, fontSize: 13, color: 'var(--burgundy)' }}>Rights are still {RIGHTS.find((r) => r[0] === song.rights)?.[1].toLowerCase()} — the song stays private until permission is granted.</div>}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

function Field({ label, children }) { return <div style={{ marginBottom: 16 }}><span style={lbl}>{label}</span>{children}</div>; }
function Chip({ active, onClick, children }) {
  return <button onClick={onClick} style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, cursor: 'pointer', border: `1.5px solid ${active ? 'var(--gold)' : 'var(--border-gold)'}`, background: active ? 'rgba(201,151,74,0.12)' : 'white', color: active ? 'var(--navy)' : 'var(--text-muted)', fontWeight: active ? 600 : 400, fontFamily: "'Crimson Pro', serif" }}>{children}</button>;
}
function MiniBtn({ active, onClick, children }) {
  return <button onClick={onClick} style={{ padding: '4px 10px', borderRadius: 3, fontSize: 12, cursor: 'pointer', border: `1px solid ${active ? 'var(--gold)' : 'var(--border-gold)'}`, background: active ? 'var(--navy)' : 'white', color: active ? 'var(--gold-light)' : 'var(--text-mid)' }}>{children}</button>;
}
function Gate({ ok, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px dashed var(--border-gold)' }}>
      <span style={{ width: 22, height: 22, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, background: ok ? 'var(--navy)' : 'white', color: ok ? 'var(--gold-light)' : 'var(--text-muted)', border: `1.5px solid ${ok ? 'var(--navy)' : 'var(--border-gold)'}` }}>{ok ? '✓' : '·'}</span>
      <span style={{ fontSize: 14, color: ok ? 'var(--text-dark)' : 'var(--text-muted)' }}>{children}</span>
    </div>
  );
}
