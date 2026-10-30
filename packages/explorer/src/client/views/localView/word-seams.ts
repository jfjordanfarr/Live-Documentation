/**
 * Where a name may break across lines (2026-10-30): after a slash, a dot, a hyphen or an underscore, and at a camel
 * hump, before a capital that follows a small letter or a digit, or that starts a word after an acronym. A name too
 * wide for its box then wraps at a seam of its own rather than at whatever letter the box ran out at, which left
 * "LiveDocGeneratorResul" with its "t" on the next line in the October 23 review (finding 14). A segment is at least
 * two characters and the last at least three, so that neither a leading dot nor a short extension stands on a line of its
 * own.
 */
const SEPARATORS = new Set(["/", ".", "-", "_"]);
const isUpper = (character: string): boolean => character !== character.toLowerCase() && character === character.toUpperCase();
const isLower = (character: string): boolean => character !== character.toUpperCase() && character === character.toLowerCase();
const isDigit = (character: string): boolean => character >= "0" && character <= "9";

/** The name cut at its seams, in order; joined, the segments are the name again. An empty name has no segments. */
export function seamsOf(name: string): string[] {
  if (!name) return [];
  const segments: string[] = [];
  let start = 0;
  for (let i = 2; i < name.length; i++) {
    const previous = name[i - 1], current = name[i];
    const afterSeparator = SEPARATORS.has(previous) && !SEPARATORS.has(current) && !/\s/.test(current);
    const hump = isUpper(current) && (isLower(previous) || isDigit(previous)
      || (isUpper(previous) && i + 1 < name.length && isLower(name[i + 1])));
    if ((afterSeparator || hump) && i - start >= 2) { segments.push(name.slice(start, i)); start = i; }
  }
  segments.push(name.slice(start));
  // A short tail, an extension such as "ts" or a final letter, stays with the segment before it rather than standing
  // on a line of its own.
  if (segments.length > 1 && segments[segments.length - 1].length < 3) segments.splice(-2, 2, segments[segments.length - 2] + segments[segments.length - 1]);
  return segments;
}

/** Whether a line may begin at this index of the name: at a seam, or after a space the browser breaks at anyway. */
export function seamBefore(name: string, index: number): boolean {
  if (index <= 0 || index >= name.length) return false;
  if (/\s/.test(name[index - 1])) return true;
  let at = 0;
  for (const segment of seamsOf(name)) { if (at === index) return true; at += segment.length; }
  return false;
}

/**
 * A count and its unit as one word, joined by a no-break space so that "+33 files" never breaks between the number
 * and the word (capture 15 of the October 23 review), the unit agreeing with the count: "1 symbol", "2 symbols".
 */
export function countOf(count: number, singular: string, plural = `${singular}s`): string {
  return `${count}\u00a0${count === 1 ? singular : plural}`;
}
