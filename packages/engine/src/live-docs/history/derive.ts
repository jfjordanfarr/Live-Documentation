/**
 * What one step changed: derived from the shapes of two sampled changes and
 * from what the version control says happened between them.
 *
 * @remarks
 * The shapes say what was born, what died and what changed in size, kind,
 * entry mark, wiring and doc links; the version control says which files were renamed,
 * since a rename is invisible in two shapes alone, and whose content changed
 * in place, which the shapes cannot see when nothing of the shape moved
 * (the minor ticks of the plan's C3). A rename is believed only where both of
 * its ends are files of the shapes: a file renamed out of the documented set
 * is a death, one renamed into it a birth.
 *
 * @module
 */

import { directoryRenames } from "./directories";
import { edgeEnds, emptyChange, renameShape, type Shape, type ShapeChange } from "./shape";
import type { VersionChanges } from "./versionControl";

/**
 * The change from one shape to the next, every list sorted. Applying it to
 * `before` gives `after` exactly.
 *
 * @param before - The shape at the earlier change.
 * @param after - The shape at the later change.
 * @param version - What the version control says happened between them.
 */
export function deriveChange(before: Shape, after: Shape, version: VersionChanges): ShapeChange {
  const change = emptyChange();
  change.renamed = believedRenames(before, after, version.renamed);
  const moved = renameShape(before, change.renamed);

  for (const [path, file] of after.files) {
    const previous = moved.files.get(path);
    if (!previous) {
      change.born.push([path, { ...file }]);
      continue;
    }
    if (previous.symbols !== file.symbols) {
      change.resized.push([path, file.symbols]);
    }
    if (previous.archetype !== file.archetype) {
      change.rekinded.push([path, file.archetype]);
    }
    if (previous.entry !== file.entry) {
      change.entries.push([path, file.entry]);
    }
  }
  for (const path of moved.files.keys()) {
    if (!after.files.has(path)) {
      change.dead.push(path);
    }
  }

  for (const [key, count] of after.edges) {
    const previous = moved.edges.get(key);
    if (previous === undefined) {
      change.edgesAdded.push([...edgeEnds(key), count]);
    } else if (previous !== count) {
      change.edgesChanged.push([...edgeEnds(key), count]);
    }
  }
  for (const key of moved.edges.keys()) {
    if (!after.edges.has(key)) {
      change.edgesRemoved.push(edgeEnds(key));
    }
  }

  // A dead file's doc links go with it here, as its edges do above.
  for (const key of after.docLinks) {
    if (!moved.docLinks.has(key)) {
      change.docLinksAdded.push(edgeEnds(key));
    }
  }
  for (const key of moved.docLinks) {
    if (!after.docLinks.has(key)) {
      change.docLinksRemoved.push(edgeEnds(key));
    }
  }

  change.directoriesRenamed = directoryRenames(before.files.keys(), after.files.keys(), change.renamed);
  change.touched = touchedOnly(change, after, version.modified);
  return sorted(change);
}

/**
 * The renames both shapes can see: the old path a file before and not after,
 * the new path a file after and not before, each path in one rename only.
 */
function believedRenames(before: Shape, after: Shape, renamed: ReadonlyArray<readonly [string, string]>): Array<[string, string]> {
  const believed: Array<[string, string]> = [];
  const fromSeen = new Set<string>();
  const toSeen = new Set<string>();
  for (const [from, to] of renamed) {
    const visible = before.files.has(from) && !after.files.has(from) && after.files.has(to) && !before.files.has(to);
    if (visible && !fromSeen.has(from) && !toSeen.has(to)) {
      believed.push([from, to]);
      fromSeen.add(from);
      toSeen.add(to);
    }
  }
  return believed;
}

/** The files whose content changed while nothing of their shape did: no birth, rename, size, kind, entry mark, edge or doc link of theirs. */
function touchedOnly(change: ShapeChange, after: Shape, modified: readonly string[]): string[] {
  const shaped = new Set<string>([
    ...change.born.map(([path]) => path),
    ...change.renamed.map(([, to]) => to),
    ...change.resized.map(([path]) => path),
    ...change.rekinded.map(([path]) => path),
    ...change.entries.map(([path]) => path),
    ...[...change.edgesAdded, ...change.edgesRemoved, ...change.edgesChanged].flatMap(([from, to]) => [from, to]),
    ...[...change.docLinksAdded, ...change.docLinksRemoved].map(([from]) => from)
  ]);
  return [...new Set(modified)].filter((path) => after.files.has(path) && !shaped.has(path));
}

function sorted(change: ShapeChange): ShapeChange {
  // Every list names a file once, or an edge or a rename once by its two paths.
  const byPath = (a: readonly [string, ...unknown[]], b: readonly [string, ...unknown[]]): number => compare(a[0], b[0]);
  const byEnds = (a: readonly [string, string, ...unknown[]], b: readonly [string, string, ...unknown[]]): number => compare(a[0], b[0]) || compare(a[1], b[1]);
  change.born.sort(byPath);
  change.dead.sort(compare);
  change.renamed.sort(byEnds);
  change.resized.sort(byPath);
  change.rekinded.sort(byPath);
  change.entries.sort(byPath);
  change.edgesAdded.sort(byEnds);
  change.edgesRemoved.sort(byEnds);
  change.edgesChanged.sort(byEnds);
  change.docLinksAdded.sort(byEnds);
  change.docLinksRemoved.sort(byEnds);
  change.touched.sort(compare);
  return change;
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
