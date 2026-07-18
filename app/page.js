import Link from 'next/link';
import { Nav, Footer } from '@/components/Chrome';

const LANGUAGES = [
  ['🇹🇿', 'Swahili', 'East Africa'], ['🇿🇦', 'Zulu', 'South Africa'],
  ['🇷🇼', 'Kinyarwanda', 'Rwanda'], ['🇿🇼', 'Shona', 'Zimbabwe'],
  ['🇨🇩', 'Lingala', 'DR Congo'], ['🇳🇬', 'Yoruba', 'Nigeria'],
  ['🇿🇦', 'Xhosa', 'South Africa'], ['🇲🇼', 'Chichewa', 'Malawi'],
];

const FEATURED = [
  { title: 'Mungu Mkuu', artist: 'Worship Team · East Africa', lang: 'Swahili', key: 'G', tags: ['Praise', 'Chords'], excerpt: 'Mungu mkuu, sisi tunakuabudu, Mfalme wa milele…' },
  { title: 'Nkosi Yami', artist: 'Soweto Gospel Choir', lang: 'Zulu', key: 'D', tags: ['Worship', 'Prayer'], excerpt: 'Nkosi yami, ngiyakudumisa, Igama lakho…' },
  { title: 'Ishe Komborera', artist: 'Zimbabwe Church Music', lang: 'Shona', key: 'C', tags: ['Communion', 'Easter'], excerpt: 'Ishe komborera Africa, Inzwai miteuro yedu…' },
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
            <Link href="/panel/upload" className="btn-ghost">Submit a Song</Link>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1, border: '1px solid var(--border-gold)', borderRadius: 4, overflow: 'hidden', background: 'var(--border-gold)' }}>
            {LANGUAGES.map(([flag, name, region]) => (
              <Link key={name + region} href={`/library?lang=${name}`} className="lang-card" style={{ background: 'var(--cream)', padding: '2rem 1.2rem', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.7rem' }}>{flag}</span>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 600, color: 'var(--navy)', display: 'block' }}>{name}</span>
                <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{region}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured songs */}
      <section style={{ padding: '5rem 2rem', background: 'var(--cream)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 500 }}>Featured Songs</span>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 600, color: 'var(--navy)', marginTop: '0.4rem' }}>Songs the Community Loves</h2>
            </div>
            <Link href="/library" className="btn-ghost" style={{ fontSize: 13 }}>View All Songs →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {FEATURED.map((s) => (
              <div key={s.title} style={{ border: '1px solid var(--border-gold)', borderRadius: 4, padding: '1.8rem', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'var(--cream-dark)', color: 'var(--text-muted)', padding: '3px 10px', borderRadius: 2 }}>{s.lang}</span>
                  <span style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 500 }}>Key of {s.key}</span>
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 600, color: 'var(--navy)' }}>{s.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{s.artist}</div>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-mid)', fontStyle: 'italic', borderLeft: '2px solid var(--border-gold)', paddingLeft: '0.8rem', marginBottom: '1.2rem' }}>{s.excerpt}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {s.tags.map((t) => (
                    <span key={t} style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--burgundy)', background: 'rgba(107,26,42,0.06)', padding: '3px 9px', borderRadius: 2 }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
