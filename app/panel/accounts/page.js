'use client';

import { useEffect, useState } from 'react';
import { Nav, Footer } from '@/components/Chrome';

const input = { width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid var(--border-gold)', borderRadius: 3, background: 'white', outline: 'none', fontFamily: "'Crimson Pro', serif" };
const lbl = { fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6, display: 'block' };

export default function AccountsPage() {
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const r = await fetch('/api/auth?list=users');
    const d = await r.json();
    setMe(d.user);
    setUsers(d.users || []);
  }
  useEffect(() => { load(); }, []);

  async function createAccount() {
    setSaving(true); setMsg(null);
    try {
      const r = await fetch('/api/auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', ...form }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setMsg({ ok: true, text: `Account created for ${d.created}.` });
      setForm({ name: '', email: '', password: '' });
      load();
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setSaving(false);
    }
  }

  const isAdmin = me?.role === 'admin';

  return (
    <>
      <Nav active="submit" />
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '2.5rem 2rem 4rem' }}>
        <span style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 500 }}>Panel Administration</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.2rem', fontWeight: 600, color: 'var(--navy)', margin: '6px 0 1.5rem' }}>Panel Accounts</h1>

        {!isAdmin ? (
          <p style={{ color: 'var(--text-muted)' }}>Only an admin can manage accounts.</p>
        ) : (
          <>
            <div style={{ border: '1px solid var(--border-gold)', borderRadius: 4, background: 'white', padding: '1.6rem', marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: 'var(--navy)', marginBottom: '1.2rem' }}>Add a panel member</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '0 20px' }}>
                <div style={{ marginBottom: 16 }}><span style={lbl}>Name</span><input style={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div style={{ marginBottom: 16 }}><span style={lbl}>Email</span><input style={input} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div style={{ marginBottom: 16 }}><span style={lbl}>Temporary password (min 8 chars)</span><input style={input} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              </div>
              <button className="btn-primary" disabled={saving} onClick={createAccount} style={{ opacity: saving ? 0.6 : 1 }}>{saving ? 'Creating…' : 'Create account'}</button>
              {msg && <div style={{ marginTop: 12, fontSize: 14, color: msg.ok ? 'var(--success)' : 'var(--error)' }}>{msg.text}</div>}
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>Share the email and temporary password with the member so they can sign in. They can use it right away.</p>
            </div>

            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: 'var(--navy)', marginBottom: '1rem' }}>Current members ({users.length})</h2>
            <div style={{ border: '1px solid var(--border-gold)', borderRadius: 4, background: 'white', overflow: 'hidden' }}>
              {users.map((u, i) => (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderTop: i ? '1px solid var(--border-gold)' : 'none', fontSize: 14 }}>
                  <span><strong>{u.name}</strong> <span style={{ color: 'var(--text-muted)' }}>· {u.email}</span></span>
                  <span style={{ textTransform: 'capitalize', color: u.role === 'admin' ? 'var(--burgundy)' : 'var(--text-muted)', fontWeight: u.role === 'admin' ? 600 : 400 }}>{u.role}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}
