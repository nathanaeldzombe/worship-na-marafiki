// ============================================================
// ChordBora — Worship na Marafiki's chord+lyric format
//
// Chords:      [G]Shangi[C]lia [Em]Bwana yu [D]mwema
// Sections:    {Verse 1}, {Chorus}   (on their own line)
// Formatting:  *italic*  **bold**  _underline_
// Call/response line prefixes:
//    L: leader line       (styled as leader)
//    R: response line     (styled as response, e.g. congregation)
// Blank lines are preserved.
// ============================================================

const SHARPS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const FLATS  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
const NOTE_IX = { C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11 };

export function transposeChord(chord, steps, preferFlats = false) {
  if (!steps) return chord;
  return chord.replace(/([A-G](?:#|b)?)/g, (m) => {
    const ix = NOTE_IX[m];
    if (ix === undefined) return m;
    const scale = preferFlats ? FLATS : SHARPS;
    return scale[((ix + steps) % 12 + 12) % 12];
  });
}

export function transposeKey(key, steps, preferFlats = false) {
  return transposeChord(key, steps, preferFlats);
}

// Turn inline formatting markers into rich segments for React rendering.
// Returns an array of { text, bold, italic, underline }.
export function parseInline(text) {
  const segments = [];
  let i = 0;
  const state = { bold: false, italic: false, underline: false };
  let buf = '';
  const push = () => { if (buf) { segments.push({ text: buf, ...state }); buf = ''; } };
  while (i < text.length) {
    if (text.startsWith('**', i)) { push(); state.bold = !state.bold; i += 2; continue; }
    if (text[i] === '*') { push(); state.italic = !state.italic; i += 1; continue; }
    if (text[i] === '_') { push(); state.underline = !state.underline; i += 1; continue; }
    buf += text[i]; i += 1;
  }
  push();
  return segments;
}

// Strip formatting markers, for measuring/aligning chord positions.
function stripMarks(s) {
  return s.replace(/\*\*/g, '').replace(/[*_]/g, '');
}

// Parse one line into: role (leader/response/normal), aligned chord row,
// and lyric segments (with formatting) plus a plain lyric string.
export function parseLine(line, steps = 0, preferFlats = false) {
  let role = 'normal';
  let body = line;
  const roleMatch = line.match(/^([LR]):\s?(.*)$/);
  if (roleMatch) {
    role = roleMatch[1] === 'L' ? 'leader' : 'response';
    body = roleMatch[2];
  }

  let chordRow = '';
  let markedLyric = '';
  let plainLen = 0;
  const re = /\[([^\]]+)\]/g;
  let last = 0, m;
  while ((m = re.exec(body)) !== null) {
    const chunk = body.slice(last, m.index);
    markedLyric += chunk;
    plainLen += stripMarks(chunk).length;
    while (chordRow.length < plainLen) chordRow += ' ';
    chordRow += transposeChord(m[1], steps, preferFlats);
    last = re.lastIndex;
  }
  const tail = body.slice(last);
  markedLyric += tail;

  return {
    role,
    chordRow,
    segments: parseInline(markedLyric),
    lyricRow: stripMarks(markedLyric),
    hasChords: chordRow.trim().length > 0,
  };
}

export function parseChordBora(text, steps = 0, preferFlats = false) {
  const sections = [];
  let current = { label: '', lines: [] };
  (text || '').split('\n').forEach((raw) => {
    const line = raw.replace(/\s+$/, '');
    const header = line.match(/^\{(.+)\}$/);
    if (header) {
      if (current.lines.length || current.label) sections.push(current);
      current = { label: header[1].trim(), lines: [] };
      return;
    }
    if (line.trim() === '') {
      current.lines.push({ blank: true });
      return;
    }
    current.lines.push(parseLine(line, steps, preferFlats));
  });
  if (current.lines.length || current.label) sections.push(current);
  return sections;
}

// Plain lyrics (no chords, markers, headers, or role prefixes) for storage/search.
export function lyricsOnly(text) {
  return (text || '')
    .split('\n')
    .map((l) => {
      if (l.match(/^\{(.+)\}$/)) return '';
      const noRole = l.replace(/^[LR]:\s?/, '');
      return stripMarks(noRole.replace(/\[[^\]]+\]/g, ''));
    })
    .join('\n');
}
