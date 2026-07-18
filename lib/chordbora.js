// ============================================================
// ChordBora — Worship na Marafiki's chord+lyric format
// Inline bracket syntax:  [G]Shangi[C]lia [Em]Bwana yu [D]mwema
// Section headers on their own line in braces: {Verse 1}, {Chorus}
// Blank lines are preserved.
// ============================================================

const SHARPS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const FLATS  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
const NOTE_IX = { C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11 };

export function transposeChord(chord, steps, preferFlats = false) {
  if (!steps) return chord;
  // transpose the root and any bass note (after '/'), leave quality suffixes alone
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

// Parse one ChordBora line into aligned chord row + lyric row.
export function parseLine(line, steps = 0, preferFlats = false) {
  let chordRow = '', lyricRow = '';
  const re = /\[([^\]]+)\]/g;
  let last = 0, m;
  while ((m = re.exec(line)) !== null) {
    lyricRow += line.slice(last, m.index);
    while (chordRow.length < lyricRow.length) chordRow += ' ';
    chordRow += transposeChord(m[1], steps, preferFlats);
    last = re.lastIndex;
  }
  lyricRow += line.slice(last);
  return { chordRow, lyricRow, hasChords: chordRow.trim().length > 0 };
}

// Parse a full ChordBora document into sections for rendering.
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

// Strip chords for lyrics-only view / plain text.
export function lyricsOnly(text) {
  return (text || '')
    .split('\n')
    .map((l) => (l.match(/^\{(.+)\}$/) ? '' : l.replace(/\[[^\]]+\]/g, '')))
    .join('\n');
}
