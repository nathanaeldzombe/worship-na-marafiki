'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const input = { width: '100%', padding: '12px 14px', border: '1px solid var(--border-gold)', borderRadius: 3, background: 'white', fontFamily: "'Crimson Pro', serif", fontSize: '1rem', color: 'var(--text-dark)', outline: 'none' };
const label = { display: 'block', fontSize: '0.82rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' };

function SignInInner() {
  const params = useSearchParams();
  const next = params.get('next') || '/panel/upload';

  const [needsSetup, setNeedsSetup] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/auth')
      .then((r) => r.json())
      .then((d) => {
        setNeedsSetup(!!d.needsSetup);
        if (d.user) window.location.href = next;
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [next]);

  async function submit() {
    setBusy(true); setMsg(null);
    try {
      const action = needsSetup ? 'register' : 'login';
      const r = await fetch('/api/auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...form }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      window.location.href = next;
    } catch (e) {
      setMsg(e.message);
      setBusy(false);
    }
  }

  return (
    <>
      <nav className="nav">
        <Link className="nav-logo" href="/">Worship <span>na Marafiki</span></Link>
        <Link href="/library" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>← Back to songs</Link>
      </nav>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        <div className="auth-side" style={{ width: 420, flexShrink: 0, background: 'var(--navy)', padding: '3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <svg width="36" height="44" viewBox="0 0 36 44" fill="none" style={{ marginBottom: '2rem' }}>
              <rect x="15" y="2" width="6" height="40" rx="2" fill="#c9974a" opacity="0.9" />
              <rect x="4" y="14" width="28" height="6" rx="2" fill="#c9974a" opacity="0.9" />
            </svg>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 600, color: 'var(--gold-light)', lineHeight: 1.2, marginBottom: '1rem' }}>
              {needsSetup ? <>Set up the <em style={{ color: 'rgba(232,194,122,0.7)' }}>first admin</em></> : <>Panel <em style={{ color: 'rgba(232,194,122,0.7)' }}>Sign In</em></>}
            </div>
            <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, fontWeight: 300, marginBottom: '2rem' }}>
              {needsSetup
                ? 'This is the first account, so it becomes the admin. After this, only the admin can create new panel accounts.'
                : 'Sign in to add and verify songs. This area is for the translation panel only.'}
            </div>
            <blockquote style={{ borderLeft: '2px solid rgba(201,151,74,0.4)', paddingLeft: '1rem', fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.05rem', color: 'rgba(255,255,255,0.5)' }}>
              "Sing to him a new song; play skillfully, and shout for joy."
              <cite style={{ display: 'block', fontStyle: 'normal', fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginTop: 4, opacity: 0.7 }}>— Psalm 33:3</cite>
            </blockquote>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)' }}>© {new Date().getFullYear()} Worship na Marafiki</div>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem' }}>
          <div style={{ width: '100%', maxWidth: 400 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', color: 'var(--navy)', marginBottom: '1.8rem' }}>
              {!loaded ? 'Loading…' : needsSetup ? 'Create the first admin account' : 'Sign in'}
            </h2>

            {loaded && (
              <>
                {needsSetup && (
                  <div style={{ marginBottom: '1.4rem' }}>
                    <label style={label}>Your name</label>
                    <input style={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                )}
                <div style={{ marginBottom: '1.4rem' }}>
                  <label style={label}>Email</label>
                  <input style={input} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
                </div>
                <div style={{ marginBottom: '1.4rem' }}>
                  <label style={label}>Password{needsSetup ? ' (at least 8 characters)' : ''}</label>
                  <input style={input} type="password" value={form.password}
                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                    onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <button className="btn-primary" style={{ width: '100%', opacity: busy ? 0.6 : 1 }} disabled={busy} onClick={submit}>
                  {busy ? 'Please wait…' : needsSetup ? 'Create admin account' : 'Sign in'}
                </button>
                {msg && <div style={{ marginTop: 14, fontSize: 14, color: 'var(--error)' }}>{msg}</div>}
                <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <Link href="/submit" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>← Back to recommend a song</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`@media(max-width:780px){.auth-side{display:none !important;}}`}</style>
    </>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading…</div>}>
      <SignInInner />
    </Suspense>
  );
}
