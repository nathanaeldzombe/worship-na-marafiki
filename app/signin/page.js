'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SignInPage() {
  const [tab, setTab] = useState('signin');

  const input = { width: '100%', padding: '12px 14px', border: '1px solid var(--border-gold)', borderRadius: 3, background: 'white', fontFamily: "'Crimson Pro', serif", fontSize: '1rem', color: 'var(--text-dark)', outline: 'none' };
  const label = { display: 'block', fontSize: '0.82rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' };

  return (
    <>
      <nav className="nav">
        <Link className="nav-logo" href="/">Worship <span>na Marafiki</span></Link>
        <Link href="/library" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>← Back to songs</Link>
      </nav>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        {/* Side panel */}
        <div style={{ width: 420, flexShrink: 0, background: 'var(--navy)', padding: '3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} className="auth-side">
          <div>
            <svg width="36" height="44" viewBox="0 0 36 44" fill="none" style={{ marginBottom: '2rem' }}>
              <rect x="15" y="2" width="6" height="40" rx="2" fill="#c9974a" opacity="0.9" />
              <rect x="4" y="14" width="28" height="6" rx="2" fill="#c9974a" opacity="0.9" />
            </svg>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 600, color: 'var(--gold-light)', lineHeight: 1.2, marginBottom: '1rem' }}>Join the <em style={{ color: 'rgba(232,194,122,0.7)' }}>Marafiki</em> Community</div>
            <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, fontWeight: 300, marginBottom: '2rem' }}>Access the full library, save your favourite songs, and submit worship music from across the continent.</div>
            <blockquote style={{ borderLeft: '2px solid rgba(201,151,74,0.4)', paddingLeft: '1rem', fontStyle: 'italic', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.05rem', color: 'rgba(255,255,255,0.5)' }}>
              "Sing to him a new song; play skillfully, and shout for joy."
              <cite style={{ display: 'block', fontStyle: 'normal', fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginTop: 4, opacity: 0.7 }}>— Psalm 33:3</cite>
            </blockquote>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)' }}>© {new Date().getFullYear()} Worship na Marafiki</div>
        </div>

        {/* Form */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem' }}>
          <div style={{ width: '100%', maxWidth: 440 }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-gold)', marginBottom: '2.5rem' }}>
              {[['signin', 'Sign In'], ['register', 'Register']].map(([id, t]) => (
                <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: '0.8rem', textAlign: 'center', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: tab === id ? 'var(--navy)' : 'var(--text-muted)', cursor: 'pointer', borderBottom: tab === id ? '2px solid var(--gold)' : '2px solid transparent', marginBottom: -1, background: 'none', border: 'none', fontFamily: "'Crimson Pro', serif" }}>{t}</button>
              ))}
            </div>

            {tab === 'signin' ? (
              <div>
                <div style={{ marginBottom: '1.4rem' }}><label style={label}>Email</label><input style={input} type="email" placeholder="you@example.com" /></div>
                <div style={{ marginBottom: '1.4rem' }}><label style={label}>Password</label><input style={input} type="password" placeholder="Your password" /></div>
                <button className="btn-primary" style={{ width: '100%' }}>Sign In</button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.4rem' }}>
                  <div><label style={label}>First name</label><input style={input} /></div>
                  <div><label style={label}>Last name</label><input style={input} /></div>
                </div>
                <div style={{ marginBottom: '1.4rem' }}><label style={label}>Email</label><input style={input} type="email" placeholder="you@example.com" /></div>
                <div style={{ marginBottom: '1.4rem' }}><label style={label}>Password</label><input style={input} type="password" placeholder="Create a strong password" /></div>
                <button className="btn-primary" style={{ width: '100%' }}>Create Account</button>
              </div>
            )}

            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
              Panel members: sign in here to access the upload form.
            </p>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:780px){.auth-side{display:none !important;}}`}</style>
    </>
  );
}
