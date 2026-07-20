'use client';

import { useRef } from 'react';

// A textarea with a toolbar that inserts ChordBora markers:
// bold **, italic *, underline _, section {}, chord [], and L:/R: line prefixes.
export default function ChordBoraEditor({ value, onChange, isCallResponse = false }) {
  const ref = useRef(null);

  // Wrap the current selection with before/after markers (or insert at cursor).
  function wrap(before, after = before) {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = value.slice(start, end);
    const next = value.slice(0, start) + before + sel + after + value.slice(end);
    onChange(next);
    // restore selection around the wrapped text
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = start + before.length;
      ta.selectionEnd = end + before.length;
    });
  }

  // Prefix the current line(s) with a marker like "L: " or "R: ".
  function prefixLine(prefix) {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    // find start of the current line
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    // strip any existing L:/R: prefix first
    const rest = value.slice(lineStart);
    const cleaned = rest.replace(/^[LR]:\s?/, '');
    const next = value.slice(0, lineStart) + prefix + cleaned;
    onChange(next);
    requestAnimationFrame(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = lineStart + prefix.length; });
  }

  function insertAtCursor(text) {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const next = value.slice(0, start) + text + value.slice(start);
    onChange(next);
    requestAnimationFrame(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = start + text.length; });
  }

  const btn = {
    padding: '5px 10px', border: '1px solid var(--border-gold)', borderRadius: 3,
    background: 'white', cursor: 'pointer', fontSize: 13, fontFamily: "'Crimson Pro', serif",
    color: 'var(--text-mid)', lineHeight: 1,
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        <button type="button" style={{ ...btn, fontWeight: 700 }} onClick={() => wrap('**')} title="Bold">B</button>
        <button type="button" style={{ ...btn, fontStyle: 'italic' }} onClick={() => wrap('*')} title="Italic">I</button>
        <button type="button" style={{ ...btn, textDecoration: 'underline' }} onClick={() => wrap('_')} title="Underline">U</button>
        <span style={{ width: 1, background: 'var(--border-gold)', margin: '0 2px' }} />
        <button type="button" style={btn} onClick={() => insertAtCursor('[G]')} title="Insert chord">[chord]</button>
        <button type="button" style={btn} onClick={() => insertAtCursor('\n{Verse 1}\n')} title="Section header">{'{section}'}</button>
        {isCallResponse && (
          <>
            <span style={{ width: 1, background: 'var(--border-gold)', margin: '0 2px' }} />
            <button type="button" style={{ ...btn, color: 'var(--burgundy)', fontWeight: 600 }} onClick={() => prefixLine('L: ')} title="Mark as leader line">Leader</button>
            <button type="button" style={{ ...btn, color: 'var(--gold)', fontWeight: 600 }} onClick={() => prefixLine('R: ')} title="Mark as response line">Response</button>
          </>
        )}
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', padding: '10px 12px', fontSize: 13.5, color: 'var(--text-dark)', background: 'white', border: '1px solid var(--border-gold)', borderRadius: 3, outline: 'none', fontFamily: 'ui-monospace, Consolas, monospace', minHeight: 260, resize: 'vertical', lineHeight: 1.7 }}
        placeholder={isCallResponse
          ? 'L: [G]Leader sings this line\nR: [C]Congregation responds\n\n{Chorus}\nAll sing together'
          : '{Verse 1}\n[G]Shangilia, [C]shangilia\n[Em]Bwana yu [D]mwema'}
      />
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
        Select text then click <strong>B</strong>/<strong>I</strong>/<strong>U</strong> to format. Chords go in [brackets]. Sections in {'{braces}'}.
        {isCallResponse && ' Use Leader/Response on a line to mark who sings it.'}
      </div>
    </div>
  );
}
