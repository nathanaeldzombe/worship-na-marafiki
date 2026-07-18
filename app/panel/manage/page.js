'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Nav, Footer } from '@/components/Chrome';

const RIGHTS = [
  ['public_domain', 'Public domain'],
  ['owner_contacted', 'Owner contacted'],
  ['permission_pending', 'Permission pending'],
  ['permission_granted', 'Permission granted'],
];
const input = { padding: '8px 10px', fontSize: 14, border: '1px solid var(--border-gold)', borderRadius: 3, background: 'white', fontFamily: "'Crimson Pro', serif", outline: 'none' };

export default function ManagePage() {
  const [songs, setSongs] = useState(null);
  const [msg, setMsg] = useState(null);
  const [editing, setEditing] = useState(null); // song id being edited
  const [draft, setDraft] = useState({ title: '', rightsStatus: '' });
  const [confirmDelete, setConfirmDelete] = useState(null); // song id pending delete
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const r = await fetch('/api/manage');
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setSongs(d.songs || []);
    } catch (e) {
      setMsg({ ok: false, text: e.message });
      setSongs([]);
    }
  }
  useEffect(() => { load(); }, []);

  async function toggle(id) {
    setBusy(true);
    try {
      const r = await fetch('/api/manage', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'toggle' }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, is_published: d.is_published } : s)));
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally { setBusy(false); }
  }

  function startEdit(s) {
    setEditing(s.id);
    setDraft({ title: s.title, rightsStatus: s.rights_status });
    setMsg(null);
  }

  async function saveEdit(id) {
    setBusy(true);
    try {
      const r = await fetch('/api/manage', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'edit', title: draft.title, rightsStatus: draft.rightsStatus }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, title: draft.title, rights_status: draft.rightsStatus } : s)));
      setEditing(null);
      setMsg({ ok: true, text: 'Saved.' });
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally { setBusy(false); }
  }

  async function doDelete(id) {
    setBusy(true);
    try {
      const r = await fetch(`/api/manage?id=${id}`, { method: 'DELETE' });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setSongs((prev) => prev.filter((s) => s.id !== id));
      setConfirmDelete(null);
      setMsg({ ok: true, text: 'Song deleted.' });
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally { setBusy(false); }
  }

  return (
    <>
      <Nav active="submit" />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '2.5rem 2rem 4rem' }}>
        <span style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 500 }}>Panel</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.2rem', fontWeight: 600, color: 'var(--navy)', margin: '6px 0 0.4rem' }}>Manage Songs</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: '1.5rem' }}>
          Hide a song from the public, edit its title or rights, or delete it permanently. Hidden songs stay in the database but don't appear in the library.
        </p>

        {msg && <div style={{ marginBottom: 16, fontSize: 14, color: msg.ok ? 'var(--success)' : 'var(--error)' }}>{msg.text}</div>}

        {songs === null ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
        ) : songs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No songs in the database yet. <Link href="/panel/upload" style={{ color: 'var(--gold)' }}>Add one →</Link></p>
        ) : (
          <div style={{ border: '1px solid var(--border-gold)', borderRadius: 6, background: 'white', overflow: 'hidden' }}>
            {songs.map((s, i) => (
              <div key={s.id} style={{ padding: '14px 16px', borderTop: i ? '1px solid var(--border-gold)' : 'none' }}>
                {editing === s.id ? (
                  /* ---- edit mode ---- */
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input style={{ ...input, flex: 1, minWidth: 180 }} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                    <select style={input} value={draft.rightsStatus} onChange={(e) => setDraft({ ...draft, rightsStatus: e.target.value })}>
                      {RIGHTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <button className="btn-primary" style={{ padding: '8px 16px' }} disabled={busy} onClick={() => saveEdit(s.id)}>Save</button>
                    <button className="btn-ghost" style={{ padding: '8px 16px' }} onClick={() => setEditing(null)}>Cancel</button>
                  </div>
                ) : (
                  /* ---- normal row ---- */
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', fontWeight: 600, color: 'var(--navy)' }}>
                        {s.title}
                        {!s.is_published && <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', background: 'var(--cream-dark)', padding: '2px 8px', borderRadius: 2, marginLeft: 10, verticalAlign: 'middle' }}>Hidden</span>}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {s.artist || '—'} · {s.original_language} · {s.version_count} version{s.version_count !== 1 ? 's' : ''} · <span style={{ textTransform: 'capitalize' }}>{s.rights_status?.replace(/_/g, ' ')}</span>
                      </div>
                    </div>

                    {confirmDelete === s.id ? (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: 'var(--error)' }}>Delete permanently?</span>
                        <button onClick={() => doDelete(s.id)} disabled={busy} style={{ padding: '7px 14px', border: 'none', borderRadius: 3, background: 'var(--error)', color: 'white', cursor: 'pointer', fontFamily: "'Crimson Pro', serif", fontSize: 13 }}>Yes, delete</button>
                        <button className="btn-ghost" style={{ padding: '7px 14px' }} onClick={() => setConfirmDelete(null)}>Cancel</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => toggle(s.id)} disabled={busy} className="btn-ghost" style={{ padding: '7px 14px', fontSize: 12 }}>
                          {s.is_published ? 'Hide' : 'Show'}
                        </button>
                        <button onClick={() => startEdit(s)} className="btn-ghost" style={{ padding: '7px 14px', fontSize: 12 }}>Edit</button>
                        <button onClick={() => { setConfirmDelete(s.id); setMsg(null); }} className="btn-ghost" style={{ padding: '7px 14px', fontSize: 12, borderColor: 'rgba(139,26,26,0.3)', color: 'var(--error)' }}>Delete</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <p style={{ marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          Need to change lyrics or chords? For now, delete and re-add the song through the <Link href="/panel/upload" style={{ color: 'var(--gold)' }}>upload form</Link>. Full lyric editing can be added later.
        </p>
      </div>
      <Footer />
    </>
  );
}
