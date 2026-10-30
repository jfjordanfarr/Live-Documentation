/**
 * A file-pair summary for a connectivity overview; the canonical symbol edges remain untouched. One pair stands for
 * both directions between two files, its endpoints in path order so that the pair's identity does not depend on which
 * way the references run: `forward` counts the references in which `source` uses `target`, `backward` those in which
 * `target` uses `source`, and `count` is their sum. The 3D map draws the pair as one wire coloured by its directions
 * (2026-10-30; before, the directions were merged away and no wire could say which file used which).
 */
export interface FileConnection<T extends string = string> {
  source: string;
  target: string;
  kind: T;
  /** Every documented reference between the two, in both directions. */
  count: number;
  /** The references in which `source` uses `target`. */
  forward: number;
  /** The references in which `target` uses `source`. */
  backward: number;
}

/** Collapse parallel and reciprocal references to one file-level relationship that remembers its directions. */
export function fileConnections<T extends string>(links: readonly { source: string; target: string; kind: T; referenceCount?: number }[]): FileConnection<T>[] {
  const pairs = new Map<string, FileConnection<T>>();
  for (const link of links) {
    if (link.source === link.target) continue; // Internal symbols do not connect two files.
    // The payload's link runs from the file that uses to the file that offers.
    const forward = link.source < link.target;
    const [source, target] = forward ? [link.source, link.target] : [link.target, link.source];
    const key = JSON.stringify([source, target]);
    const references = link.referenceCount ?? 1;
    const existing = pairs.get(key);
    if (existing) {
      existing.count += references;
      if (forward) existing.forward += references; else existing.backward += references;
    } else {
      pairs.set(key, { source, target, kind: link.kind, count: references, forward: forward ? references : 0, backward: forward ? 0 : references });
    }
  }
  return [...pairs.values()];
}
