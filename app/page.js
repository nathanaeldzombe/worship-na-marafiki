import Link from 'next/link';
import { Nav, Footer } from '@/components/Chrome';
import FeaturedSongs from '@/components/FeaturedSongs';
import Flag from '@/components/Flag';

const LANGUAGES = [
  ['tz', 'Swahili', 'East Africa'], ['za', 'Zulu', 'South Africa'],
  ['rw', 'Kinyarwanda', 'Rwanda'], ['zw', 'Shona', 'Zimbabwe'],
  ['cd', 'Lingala', 'DR Congo'], ['ng', 'Yoruba', 'Nigeria'],
  ['za', 'Xhosa', 'South Africa'], ['mw', 'Chichewa', 'Malawi'],
];

export default function Home() {
  return (
    <>
      <Nav active="home" />

      {/* Hero */}
      <section style={{ position: 'relative', minHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '5rem 2rem 4rem', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(15,31,61,0.06) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 800 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.8rem', fontWeight: 500 }}>
            <span style={{ width: 32, height: 1, background: 'var(--gold)', opacity: 0.7 }} />
            African Worship, United
            <span style={{ width: 32, height: 1, background: 'var(--gold)', opacity: 0.7 }} />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(3rem, 6vw, 5.2rem)', fontWeight: 600, lineHeight: 1.1, color: 'var(--navy)', marginBottom: '0.4rem' }}>
            Sing His praise in <em style={{ fontStyle: 'italic', color: 'var(--burgundy)' }}>every tongue</em>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: 560, margin: '1.4rem auto 2.8rem', fontWeight: 300, lineHeight: 1.8 }}>
            A growing library of African worship songs — lyrics, chords, and translations across the continent, free for every church and every friend.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/library" className="btn-primary">Browse the Library</Link>
            <Link href="/submit" className="btn-ghost">Submit a Song</Link>
          </div>
        </div>
      </section>

      {/* Mission — Romans 12:1 */}
      <section id="about" style={{ padding: '5rem 2rem', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 500 }}>Our Foundation</span>
          <blockquote style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.7rem', fontStyle: 'italic', color: 'var(--navy)', lineHeight: 1.5, margin: '1.5rem 0 1rem' }}>
            "…present your bodies as a living sacrifice, holy and acceptable to God, which is your spiritual worship."
          </blockquote>
          <cite style={{ display: 'block', fontStyle: 'normal', fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)' }}>Romans 12:1</cite>
          <p style={{ color: 'var(--text-muted)', marginTop: '2rem', fontSize: '1.1rem', lineHeight: 1.9 }}>
            Worship na Marafiki exists so that Christians across Africa can live in community — sharing songs, chords, and resources so that worship carries across borders and languages, wherever God has placed us.
          </p>
        </div>
      </section>

      {/* Languages */}
      <section style={{ padding: '5rem 2rem', background: 'var(--cream-dark)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 500 }}>The Continent Sings</span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 600, color: 'var(--navy)', marginTop: '0.6rem' }}>Songs in Your Language</h2>
          </div>
          <div className="lang-grid" style={{ border: '1px solid var(--border-gold)', borderRadius: 4, overflow: 'hidden', background: 'var(--border-gold)' }}>
            {LANGUAGES.map(([cc, name, region]) => (
              <Link key={name + region} href={`/library?lang=${name}`} className="lang-card" style={{ background: 'var(--cream)', padding: '2rem 1.2rem', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                <span style={{ display: 'block', marginBottom: '0.7rem' }}><Flag cc={cc} size={44} /></span>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 600, color: 'var(--navy)', display: 'block' }}>{name}</span>
                <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{region}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured songs — real, most-viewed */}
      <FeaturedSongs />

      <Footer />
    </>
  );
}
