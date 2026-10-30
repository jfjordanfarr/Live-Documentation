/**
 * A Live Doc's authored block in the reader's order. The grammar keeps the block verbatim; its sections are its
 * level-three headings, as the block a new doc starts with has them ("### Purpose", "### Notes") and as the docs'
 * lint reads them. The reader shows Purpose above the generated facts and every other authored section after them,
 * so that a long Notes no longer stands between a reader and the symbols and dependencies (the owner's choice,
 * 2026-10-30). Pure: the reader renders what this returns.
 */

import { fenceClosing, headingOf } from "./markdown";

/** One authored section: its heading's text, or null for words before the first heading, and its markdown, heading line included. */
export interface AuthoredSection {
  heading: string | null;
  markdown: string;
}

/** The authored sections in the reader's order: those above the generated facts and those after them. */
export interface ReaderOrder {
  /** Words before the first heading, then Purpose. */
  above: AuthoredSection[];
  /** Every other section, Notes among them, in the order the author wrote them. */
  below: AuthoredSection[];
}

/** The level of heading that starts an authored section. */
const SECTION_LEVEL = 3;

/**
 * The authored block cut at its level-three headings, outside fences, as the reader's renderer reads them. Nothing
 * is dropped or moved: the sections' markdown, joined with newlines, is the block.
 */
export function authoredSections(authored: string): AuthoredSection[] {
  const sections: AuthoredSection[] = [];
  let current: { heading: string | null; lines: string[] } = { heading: null, lines: [] };
  let closing: RegExp | null = null;
  for (const line of authored.split("\n")) {
    if (closing) {
      if (closing.test(line)) closing = null;
    } else {
      closing = fenceClosing(line);
      const heading = closing ? null : headingOf(line);
      if (heading?.level === SECTION_LEVEL) {
        if (current.heading !== null || current.lines.length > 0) sections.push({ heading: current.heading, markdown: current.lines.join("\n") });
        current = { heading: heading.text, lines: [] };
      }
    }
    current.lines.push(line);
  }
  if (current.heading !== null || current.lines.length > 0) sections.push({ heading: current.heading, markdown: current.lines.join("\n") });
  return sections;
}

/** Whether a section is the Purpose, whose heading the docs' lint reads without regard to case. */
function isPurpose(section: AuthoredSection): boolean {
  return section.heading?.toLowerCase() === "purpose";
}

/** Purpose, and any words before the first heading, above the generated facts; every other section after them, in order. */
export function readerOrder(sections: readonly AuthoredSection[]): ReaderOrder {
  return {
    above: sections.filter(section => section.heading === null || isPurpose(section)),
    below: sections.filter(section => section.heading !== null && !isPurpose(section))
  };
}
