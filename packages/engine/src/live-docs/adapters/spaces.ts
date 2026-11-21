/**
 * What every comment step of the readers writes in the place of what it takes out: the text in spaces, one for each
 * UTF-16 unit, its line breaks kept, so that each position and each line of the result is the same as in the text. The
 * engine counts positions in UTF-16 units, as JavaScript's strings do; a character outside the Basic Multilingual Plane
 * is two of them, and is written as two spaces (until 2026-11-21 a pattern with Unicode's flag wrote it as one, and
 * every position after it moved; an independent review found it).
 *
 * @module
 */

/** The text written over in spaces, one for each UTF-16 unit, its line breaks kept. */
export function inSpaces(text: string): string {
  // No `u` flag: each unit of a surrogate pair is matched on its own, so the length keeps.
  return text.replace(/[^\r\n]/g, " ");
}
