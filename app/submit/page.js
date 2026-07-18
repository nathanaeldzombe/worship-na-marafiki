'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Nav } from '@/components/Chrome';

import { ALL_LANGUAGES } from '@/lib/languages';
const LANGUAGES = [...ALL_LANGUAGES, 'Other / not sure'];

const input = { width: '100%', padding: '11px 13px', fontSize: 15, color: 'var(--text-dark)', background: 'white', border: '1px solid var(--border-gold)', borderRadius: 3, outline: 'none', fontFamily: "'Crimson Pro', serif" };
const lbl = { fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500, display: 'block' };

export default function SubmitPage() {
  const [form, setForm] = useState({
    yourName: '', yourEmail: '', songTitle: '', artist: '', language: 'Swahili',
    translated: 'not_sure', links: '', lyrics: '', note: '',
  });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit() {
    if (!form.yourName.trim() || !form.songTitle.trim()) {
      setResult({ ok: false, text: 'Please share at least your name and the song title.' });
      return;
    }
    setBusy(true); setResult(null);
    try {
      const r = await fetch('/api/suggest', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setResult({ ok: true, text: 'Thank you! Your recommendation has been sent to the Worship na Marafiki team.' });
      setForm({ yourName: '', yourEmail: '', songTitle: '', artist: '', language: 'Swahili', translated: 'not_sure', links: '', lyrics: '', note: '' });
    } catch (e) {
      setResult({ ok: false, text: e.message || 'Something went wrong. Please try again.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Nav active="submit" />

      {/* Header */}
      <div style={{ background: 'var(--navy)', padding: '3rem 2rem 2.5rem', textAlign: 'center' }}>
        <span style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.6rem', display: 'block' }}>Share a Song</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 600, color: 'var(--gold-light)', marginBottom: '0.8rem' }}>Recommend a Song</h1>
        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.55)', fontWeight: 300, maxWidth: 520, margin: '0 auto' }}>
          Know a worship song in an African language that would bless the body of Christ? Tell us about it — our panel reviews every recommendation for the library.
        </p>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '2.5rem 2rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '0 24px' }}>
          <Field label="Your name *"><input style={input} value={form.yourName} onChange={set('yourName')} placeholder="So we can thank you" /></Field>
          <Field label="Your email (optional)"><input style={input} type="email" value={form.yourEmail} onChange={set('yourEmail')} placeholder="If you'd like a reply" /></Field>
          <Field label="Song title *"><input style={input} value={form.songTitle} onChange={set('songTitle')} placeholder="e.g. Shangilia" /></Field>
          <Field label="Artist / composer"><input style={input} value={form.artist} onChange={set('artist')} placeholder="If you know it" /></Field>
          <Field label="Language"><select style={input} value={form.language} onChange={set('language')}>{LANGUAGES.map((l) => <option key={l}>{l}</option>)}</select></Field>
          <Field label="Has it been translated?">
            <select style={input} value={form.translated} onChange={set('translated')}>
              <option value="not_sure">Not sure</option>
              <option value="no">No, original language only</option>
              <option value="yes">Yes, translations exist</option>
            </select>
          </Field>
        </div>

        <Field label="Links (YouTube, lyrics site, etc.)">
          <textarea style={{ ...input, minHeight: 70, resize: 'vertical' }} value={form.links} onChange={set('links')} placeholder="Paste any helpful links, one per line" />
        </Field>
        <Field label="Lyrics (if you have them)">
          <textarea style={{ ...input, minHeight: 120, resize: 'vertical' }} value={form.lyrics} onChange={set('lyrics')} placeholder="Paste the lyrics here if you can — it helps our panel a lot" />
        </Field>
        <Field label="Anything else?">
          <textarea style={{ ...input, minHeight: 70, resize: 'vertical' }} value={form.note} onChange={set('note')} placeholder="Why this song matters to you, or anything the panel should know" />
        </Field>

        <button className="btn-primary" onClick={submit} disabled={busy} style={{ marginTop: 8, opacity: busy ? 0.6 : 1 }}>
          {busy ? 'Sending…' : 'Send recommendation'}
        </button>
        {result && <div style={{ marginTop: 16, fontSize: 15, color: result.ok ? 'var(--success)' : 'var(--error)' }}>{result.text}</div>}
      </div>

      {/* Footer with discreet panel sign-in */}
      <footer style={{ marginTop: '3rem' }}>
        <div className="footer-brand">Worship <span>na Marafiki</span></div>
        <div style={{ opacity: 0.5, marginBottom: 12 }}>African Praise. Every Language. Every Friend.</div>
        <div style={{ fontSize: '0.78rem', opacity: 0.4, marginBottom: 14 }}>© {new Date().getFullYear()} Worship na Marafiki · worshipnamarafiki.org · Romans 12:1</div>
        <Link href="/signin" style={{ fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', textDecoration: 'none', opacity: 0.8 }}>
          Panel sign in →
        </Link>
      </footer>
    </>
  );
}

function Field({ label, children }) {
  return <div style={{ marginBottom: 18 }}><span style={lbl}>{label}</span>{children}</div>;
}
