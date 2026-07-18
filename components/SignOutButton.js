'use client';

export default function SignOutButton() {
  async function signOut() {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    window.location.href = '/signin';
  }
  return (
    <button
      onClick={signOut}
      style={{
        background: 'transparent',
        border: '1px solid var(--border-gold)',
        color: 'var(--gold-light)',
        padding: '6px 14px',
        borderRadius: 3,
        fontSize: 12,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        fontFamily: "'Crimson Pro', serif",
      }}
    >
      Sign out
    </button>
  );
}
