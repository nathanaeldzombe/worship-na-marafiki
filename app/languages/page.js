'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Nav, Footer } from '@/components/Chrome';
import { LANGUAGE_REGIONS } from '@/lib/languages';

export default function LanguagesPage() {
  const [counts, setCounts] = useState(null); // { Swahili: 3, ... }

  useEffect(() => {
    fetch('/api/songs')
      .then((r) => r.json())
      .then((d) => {
        const c = {};
        (d.songs || []).forEach((s) => {
          if (s.language) c[s.language] = (c[s.language] || 0) + 1;
        });
        setCounts(c);
      })
      .catch(() => setCounts({}));
  }, []);

  return (
    <>
      <Nav active="languages" />

      <div style={{ background: 'var(--navy)', padding: '3rem 2rem 2.5rem', textAlign: 'center' }}>
        <span style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.6rem', display: 'block' }}>Explore by Language</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 600, color: 'var(--gold-light)', marginBottom: '0.8rem' }}>Every Tongue, One Worship</h1>
        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.55)', fontWeight: 300, maxWidth: 540, margin: '0 auto' }}>
          From the Horn of Africa to the Cape — find worship songs in the languages of the continent. Tap a language to see its songs.
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem 1rem' }}>
        {LANGUAGE_REGIONS.map((section, si) => (
          <section key={section.region} className="reveal" style={{ marginBottom: '3rem', animationDelay: `${si * 60}ms` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.4rem' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 600, color: 'var(--navy)', whiteSpace: 'nowrap' }}>{section.region}</h2>
              <span style={{ flex: 1, height: 1, background: 'var(--border-gold)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{section.languages.length} languages</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
              {section.languages.map((lang) => {
                const count = counts?.[lang.name] ?? 0;
                return (
                  <Link
                    key={lang.name}
                    href={`/library?lang=${encodeURIComponent(lang.name)}`}
                    className="lang-tile"
                  >
                    <span style={{ fontSize: '2.2rem', display: 'block', marginBottom: '0.6rem', lineHeight: 1 }}>{lang.flag}</span>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', fontWeight: 600, color: 'var(--navy)', display: 'block' }}>{lang.name}</span>
                    <span style={{ fontSize: 12, color: count ? 'var(--burgundy)' : 'var(--text-muted)', letterSpacing: '0.04em' }}>
                      {counts === null ? '…' : count === 0 ? 'Coming soon' : `${count} song${count !== 1 ? 's' : ''}`}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <Footer />
    </>
  );
}
