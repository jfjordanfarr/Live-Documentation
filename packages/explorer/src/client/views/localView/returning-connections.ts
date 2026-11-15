import { linksOf } from "./directory-flow";
import type { LocalEdge } from "./types";

/**
 * The connections a 2D picture draws against its left-to-right order: the references between two different files that
 * the ranking reads backward, each a cycle's feedback, drawn as laces at its two pins with its whole route on hover. A
 * card's foot says how many touch the card ("6 connections return in a cycle"), and the 3D button lights for the
 * picture's number of them (2026-11-15). Both come from here, so that the cards and the button cannot disagree.
 */
export interface ReturningConnections {
  /** Every returning reference the picture draws, once each. */
  edges: LocalEdge[];
  /** How many connections they are, a pair line counted by the links it stands for: the picture's number, the button's. */
  total: number;
  /** The returning references at each file, at either of their two ends: a card's foot. */
  byFile: Map<string, LocalEdge[]>;
}

/**
 * The returning references among `links`: each that runs between two different files, that `isBack` says the ranking
 * reads backward, and that `drawn` says the picture draws. A file's references to itself, its laces within one card,
 * join no two files and never count.
 */
export function returningConnections(
  links: readonly LocalEdge[],
  isBack: (edge: LocalEdge) => boolean,
  drawn: (edge: LocalEdge) => boolean = () => true
): ReturningConnections {
  const edges = links.filter(edge => edge.sourceId !== edge.targetId && isBack(edge) && drawn(edge));
  const byFile = new Map<string, LocalEdge[]>();
  for (const edge of edges) for (const id of [edge.sourceId, edge.targetId]) (byFile.get(id) ?? byFile.set(id, []).get(id)!).push(edge);
  return { edges, total: connectionCount(edges), byFile };
}

/** How many connections the given references are, a pair line counted by the links it stands for. */
export function connectionCount(edges: readonly LocalEdge[]): number {
  return edges.reduce((sum, edge) => sum + linksOf(edge), 0);
}

/** How strongly the 3D button calls: not at all, for some connections drawn against the order, or for many. */
export type BackwardStrength = "none" | "some" | "many";

/** The strengths, weakest first. */
export const BACKWARD_STRENGTHS: readonly BackwardStrength[] = ["none", "some", "many"];

/**
 * The fewest connections drawn against the order for which the 3D button calls at its stronger strength. Set on
 * 2026-11-15 from how often pictures light the cue: of 161 files each opened alone (every file of this repository's
 * Local Map folder, 59 spread over its packages, every file of the estate sample), 143 drew none, 14 drew one to four,
 * 4 drew five to nine (branch-renderer.ts and forceGraphScope.ts 8, core.ts 7, controller.ts 6) and none drew ten or
 * more. Five sets the stronger call on the few pictures that strain most, the owner's branch-renderer.ts among them.
 */
export const MANY_BACKWARD = 5;

/** The 3D button's strength for a picture's number of connections drawn against its left-to-right order. */
export function backwardStrength(count: number): BackwardStrength {
  return count >= MANY_BACKWARD ? "many" : count > 0 ? "some" : "none";
}
