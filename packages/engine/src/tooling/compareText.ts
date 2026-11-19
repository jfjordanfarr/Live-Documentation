/**
 * The one order the engine sorts names, labels and paths by: alphabetical
 * without regard to case, then, between two texts that differ only in case,
 * by UTF-16 code unit, as JavaScript's `<` compares strings.
 *
 * @remarks
 * Until 2026-11-19 the engine sorted with `localeCompare`, whose order is the
 * runtime's collation: it depends on the ICU data Node was built with and on
 * the locale of the process, so that the same source could list its docs'
 * lines in another order on another machine or another Node, and the
 * history's summaries, which keep that order, could differ between two runs
 * of one generator. This order depends on the text and on the version of
 * Unicode the runtime lowers letters by, which the history's lens keys on.
 * Case is folded first so that a doc still reads alphabetically, `paymentForm`
 * before `PaymentsEnabled`, as it did; where the old collation ordered
 * punctuation, digits and letters by other rules, the order is now that of
 * their code units.
 *
 * @module
 */

/** Negative when `a` sorts before `b`, positive when after, 0 only when they are the same text. */
export function compareText(a: string, b: string): number {
  const foldedA = a.toLowerCase();
  const foldedB = b.toLowerCase();
  if (foldedA !== foldedB) return foldedA < foldedB ? -1 : 1;
  return a < b ? -1 : a > b ? 1 : 0;
}
