/**
 * A symbol's name held to one line and cut with an ellipsis where it does not fit (2026-11-15, Descriptions Zoomed Out:
 * a described row keeps its description's first line under a name that holds to one line; the owner, of the trial that
 * let the name wrap instead: "the only reason it doesn't look quite as good ... is because the symbol name itself is
 * willing to wrap onto a new line"). Two cuts, since how a long name is cut is itself a thing to see: at its end, as a
 * browser cuts ("DocumentationLinkEnforc…"), and in its middle at a seam, the first and the last pieces kept and the
 * ellipsis between ("Documentation…Result"), since a card's names often share their beginning and differ at their end.
 * Nothing is drawn smaller to fit, and the whole name stays the row's accessible name and tooltip: only the drawing is
 * cut.
 *
 * Pure: the widths come from the caller's measure, in the name's own units.
 *
 * @module name-cut
 */

/** The mark of a cut. */
export const ELLIPSIS = "…";

/** How a name that does not fit its one line is cut. */
export type NameCut = "end" | "middle";

/**
 * The name cut at its end: as many of its first characters as fit before the ellipsis, one at least. A name that fits is
 * returned whole.
 */
export function cutAtEnd(name: string, width: number, measure: (text: string) => number): string {
  if (measure(name) <= width + 1e-6) return name;
  let kept = 1;
  while (kept + 1 < name.length && measure(name.slice(0, kept + 1).trimEnd() + ELLIPSIS) <= width + 1e-6) kept += 1;
  return name.slice(0, kept).trimEnd() + ELLIPSIS;
}

/**
 * The name cut in its middle, at its seams: some of its first segments and some of its last, whole, with the ellipsis
 * between in place of at least one. Of the cuts that fit, the one that keeps the most of the name; of equals, the one
 * that keeps more of its end, where the names of one card differ. It breaks only at the seams: where not even the first
 * and the last segment fit together with the ellipsis, or the name has no seam to cut between, the name is cut at its
 * end. A name that fits is returned whole. `segments` joined are the name.
 */
export function cutInMiddle(name: string, segments: readonly string[], width: number, measure: (text: string) => number): string {
  if (measure(name) <= width + 1e-6) return name;
  const fits = (text: string): boolean => measure(text) <= width + 1e-6;
  let best: { text: string; kept: number; tail: number } | null = null;
  for (let head = 1; head < segments.length; head += 1) {
    for (let tail = 1; head + tail < segments.length; tail += 1) {
      const first = segments.slice(0, head).join("").trimEnd(), last = segments.slice(segments.length - tail).join("");
      const text = first + ELLIPSIS + last;
      if (!fits(text)) continue;
      const kept = first.length + last.length;
      if (!best || kept > best.kept || (kept === best.kept && last.length > best.tail)) best = { text, kept, tail: last.length };
    }
  }
  return best ? best.text : cutAtEnd(name, width, measure);
}

/** The name on one line in a width: whole where it fits, else cut as asked. */
export function oneLineName(name: string, segments: readonly string[], width: number, measure: (text: string) => number, cut: NameCut): string {
  return cut === "middle" ? cutInMiddle(name, segments, width, measure) : cutAtEnd(name, width, measure);
}
