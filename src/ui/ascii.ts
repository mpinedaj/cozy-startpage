/**
 * Five-row ASCII digits. The clock is decorative for sighted users and mirrored
 * by a screen-reader-only text node in `main.ts`.
 */
const GLYPHS: Record<string, readonly string[]> = {
  '0': [' ___ ', '|   |', '|   |', '|   |', '|___|'],
  '1': ['  _  ', ' | | ', ' | | ', ' | | ', ' |_| '],
  '2': [' ___ ', '|   |', ' ___|', '|    ', '|___|'],
  '3': [' ___ ', '|   |', ' ___|', '    |', '|___|'],
  '4': ['|   |', '|   |', '|___|', '    |', '    |'],
  '5': ['|___ ', '|    ', '|___ ', '    |', '|___|'],
  '6': ['|___ ', '|    ', '|___ ', '|   |', '|___|'],
  '7': [' ___ ', '    |', '   / ', '  /  ', ' /   '],
  '8': [' ___ ', '|   |', '|___|', '|   |', '|___|'],
  '9': [' ___ ', '|   |', '|___|', '    |', '|___|'],
  ':': ['     ', '  .  ', '     ', '  .  ', '     '],
  ' ': ['     ', '     ', '     ', '     ', '     '],
};

/** Render `HH:MM` as five rows of printable ASCII. Unknown chars become spaces. */
export function asciiClock(value: string): string {
  const rows = ['', '', '', '', ''];
  for (const char of value) {
    const glyph = GLYPHS[char] ?? GLYPHS[' '];
    glyph.forEach((line, index) => {
      rows[index] += `${line} `;
    });
  }
  return rows.map((row) => row.replace(/\s+$/, '')).join('\n');
}
