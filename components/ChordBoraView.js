'use client';

// Renders parsed ChordBora sections consistently in the editor preview
// and the public song page. Handles chords, formatting, and leader/response.

function Segments({ segments }) {
  return segments.map((seg, i) => {
    let el = seg.text;
    const style = {};
    if (seg.bold) style.fontWeight = 700;
    if (seg.italic) style.fontStyle = 'italic';
    if (seg.underline) style.textDecoration = 'underline';
    return <span key={i} style={style}>{el}</span>;
  });
}

const ROLE_STYLE = {
  leader: { color: 'var(--burgundy)', borderLeft: '3px solid var(--burgundy)', paddingLeft: 10 },
  response: { color: 'var(--navy)', fontStyle: 'italic', borderLeft: '3px solid var(--gold)', paddingLeft: 10, marginLeft: 8 },
  normal: {},
};

const ROLE_TAG = {
  leader: 'Leader',
  response: 'All',
  normal: null,
};

export default function ChordBoraView({
  sections,
  showChords = true,
  chordColor = 'var(--burgundy)',
  lyricSize = '1.05rem',
  lyricColor = 'var(--text-dark)',
}) {
  return (
    <>
      {sections.map((sec, i) => (
        <div key={i} style={{ marginBottom: '1.6rem' }}>
          {sec.label && (
            <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 500, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              {sec.label}<span style={{ flex: 1, height: 1, background: 'var(--border-gold)' }} />
            </div>
          )}
          {sec.lines.map((ln, j) =>
            ln.blank ? (
              <div key={j} style={{ height: '0.6rem' }} />
            ) : (
              <div key={j} style={{ marginBottom: '0.25rem', ...(ROLE_STYLE[ln.role] || {}) }}>
                {ROLE_TAG[ln.role] && (
                  <span style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: ln.role === 'leader' ? 'var(--burgundy)' : 'var(--gold)', fontWeight: 600, marginRight: 8, opacity: 0.8 }}>
                    {ROLE_TAG[ln.role]}
                  </span>
                )}
                {showChords && ln.hasChords && (
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', fontWeight: 500, color: chordColor, whiteSpace: 'pre', lineHeight: 1.4 }}>{ln.chordRow}</div>
                )}
                <div style={{ fontSize: lyricSize, color: lyricColor, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {ln.segments && ln.segments.length ? <Segments segments={ln.segments} /> : (ln.lyricRow || '\u00A0')}
                </div>
              </div>
            )
          )}
        </div>
      ))}
    </>
  );
}
