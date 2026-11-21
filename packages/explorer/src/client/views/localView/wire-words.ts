/**
 * What a 2D wire says when it is asked (the Wire Answers trial, 2026-11-21, after strangers' top-ranked stumble, which
 * way a line runs): one sentence with the file that uses as its subject, "`PaymentService.cs` uses
 * `PaymentsContext.cs`", then what is used, a few of the symbols' names and a count of the rest, and how many references
 * the wire carries. A bundle's shared run, the wires of one offering pin that pass a column together, says the offering
 * and who uses it: "`PaymentsContext.cs` is used by `PaymentService.cs`, `Refunds.cs` +2". The only words of ours are
 * "uses", "is used by" and "references"; the rest are the scan's own names, as the cards show them. Pure: wires in,
 * words out; the page draws them (wire-answers.ts) and speaks the same sentence as the wire's name.
 *
 * @module wire-words
 */

import type { LocalEdge } from "./types";
import { NODE_HUB } from "./wire-gathering";

/** How many names a list shows before it counts the rest. */
export const NAMES_SHOWN = 3;

/** A list of names, the first few shown and the rest counted. */
export interface NameList {
  shown: string[];
  more: number;
}

/** What a wire says: its head, the files at its two ends joined by a verb, then what is used and its references. */
export interface WireWords {
  /** The file at the head of the sentence: the using file, or the offering file of a bundle's shared run. */
  subject: string;
  verb: "uses" | "is used by";
  /** The file or files at the far end: the offering file, or the using files of a bundle's run. */
  objects: NameList;
  /** The offering symbols the wire carries, by the names their rows show; an end with no symbol is the file's Internals. */
  used: NameList;
  /** How many references the wire carries. */
  references: number;
}

/** The name a row shows for a symbol at a wire's offering end. */
function symbolName(symbol: string | undefined): string {
  return !symbol || symbol === "__internals__" ? "Internals" : symbol;
}

/** The first few distinct names, in their order, and how many others there are. */
export function nameList(names: readonly string[], shown = NAMES_SHOWN): NameList {
  const distinct = [...new Set(names)];
  return { shown: distinct.slice(0, shown), more: Math.max(0, distinct.length - shown) };
}

/**
 * How many references one drawn wire carries: a pair line's count of the graph's links, else the references the scan
 * counted between its two ends, else one (the count the layout weighs a wire by, branch-scene.ts).
 */
export function referencesOf(edge: LocalEdge): number {
  return edge.gathered ?? edge.referenceCount ?? 1;
}

/** The offering ends a drawn wire stands for: a pair line's links, or the reference itself. */
function offeringSymbols(edge: LocalEdge): string[] {
  if (edge.standsFor?.length) return edge.standsFor.map(link => symbolName(link.targetSymbol));
  return edge.targetSymbol === NODE_HUB ? [] : [symbolName(edge.targetSymbol)];
}

/**
 * What a wire between two files says: an ordinary reference, a pair line of an opened directory, or the overview band's
 * gathered wire, whose members are given. Every member joins the same two files, the using one `sourceId`.
 */
export function wireWords(members: readonly LocalEdge[], nameOf: (nodeId: string) => string): WireWords {
  const first = members[0];
  return {
    subject: nameOf(first.sourceId),
    verb: "uses",
    objects: { shown: [nameOf(first.targetId)], more: 0 },
    used: nameList(members.flatMap(offeringSymbols)),
    references: members.reduce((sum, member) => sum + referencesOf(member), 0)
  };
}

/** What a bundle's shared run says: the offering file, who uses it, and the symbols its wires carry. */
export function runWords(members: readonly LocalEdge[], nameOf: (nodeId: string) => string): WireWords {
  const first = members[0];
  return {
    subject: nameOf(first.targetId),
    verb: "is used by",
    objects: nameList(members.map(member => nameOf(member.sourceId))),
    used: nameList(members.flatMap(offeringSymbols)),
    references: members.reduce((sum, member) => sum + referencesOf(member), 0)
  };
}

/** A list as it reads: its names joined by commas, the rest counted after them. */
export function listText(list: NameList): string {
  return list.shown.join(", ") + (list.more ? ` +${list.more}` : "");
}

/** The count of references, in the one plural the product uses. */
export function referencesText(count: number): string {
  return `${count} ${count === 1 ? "reference" : "references"}`;
}

/** The sentence's head: "`PaymentService.cs` uses `PaymentsContext.cs`". */
export function headText(words: WireWords): string {
  return `${words.subject} ${words.verb} ${listText(words.objects)}`;
}

/** The whole sentence as one line, the wire's spoken name: the head, what is used, and the references. */
export function sentence(words: WireWords): string {
  const used = listText(words.used);
  return `${headText(words)}${used ? `: ${used}` : ""}, ${referencesText(words.references)}`;
}
