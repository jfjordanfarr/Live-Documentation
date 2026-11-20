/**
 * Whether what this process derived could depend on the process's own past, and why.
 *
 * @remarks
 * A process that lives across many generations, as the history's worker does, may derive from a file what a fresh
 * process would not in three ways, each of which marks the process here: a file nested deeper than
 * {@link READING_DEPTH}, which a warm process with more stack to spare reads and a fresh one may not, or the other way
 * round (`deep`); a file the generator could not map, whatever was thrown, a stack overflow among them (`unmapped`);
 * and anything thrown while a tree-sitter tree was taken, read or released, after which the runtime's one WebAssembly
 * module is in a state no one knows (`runtime`, `readTree` in `adapters/treeSitter.ts`). A mark too many costs a
 * change summarized again in a fresh process; a mark too few lets a process of unknown state make a summary. A mark
 * is kept for the process's life: the history ends a worker after a marked change (`regenerate.ts`).
 *
 * Until 2026-11-20 only the runtime's fault marked the process; the review of that day showed a warm worker reading a
 * file nested between a fresh process's limit and its own, which nothing marked.
 *
 * @module
 */

import ts from "typescript";

/**
 * How deep a file's syntax tree may be before the process is marked: well under the depth at which a fresh process
 * on node's default stack fails to read a construct the readers meet, so that below it no process fails for want of
 * stack, whatever it has run before. At most half of the smallest cold limit the probe of 2026-11-20 found (node 26,
 * a worker as the pool starts one, under tsx or built): TypeScript's nested tuple types (`[[[number]]]`), which a fresh
 * process fails at 450 levels, 453 deep by this measure; type arguments (`Array<Array<…>>`) at 506 deep, nested calls
 * at 598, nested arrays at about 660. Every other kind of nesting the readers meet, in TypeScript and in each
 * tree-sitter grammar, is read cold at twice this depth, which `tests/integration/live-docs/reading-depth.test.ts`
 * holds: it goes red on the day a later TypeScript, grammar or node lowers a limit below twice the depth. It was 300,
 * provisional, set from three constructs, until the probe of all of them the same day found three below 600.
 */
export const READING_DEPTH = 200;

/** Why a process is marked: a file beyond {@link READING_DEPTH}, a file the generator could not map, or a fault of the tree-sitter runtime. */
export type ProcessMark = "deep" | "unmapped" | "runtime";

const marks = new Set<ProcessMark>();

/** Marks the process: what it derives from now on may depend on its past. */
export function markProcess(reason: ProcessMark): void {
  marks.add(reason);
}

/** Every reason the process was marked for, in a fixed order; none when it was not. */
export function processMarks(): ProcessMark[] {
  return (["deep", "unmapped", "runtime"] as const).filter((reason) => marks.has(reason));
}

/**
 * Whether a TypeScript tree is deeper than {@link READING_DEPTH}, by an explicit stack over `ts.forEachChild`, so that
 * the measure itself never runs short of stack. A tree deeper marks the process (`deep`).
 */
export function typeScriptBeyondDepth(root: ts.Node): boolean {
  const nodes: ts.Node[] = [root];
  const depths: number[] = [1];
  while (nodes.length > 0) {
    const node = nodes.pop()!;
    const depth = depths.pop()!;
    if (depth > READING_DEPTH) {
      markProcess("deep");
      return true;
    }
    ts.forEachChild(node, (child) => {
      nodes.push(child);
      depths.push(depth + 1);
    });
  }
  return false;
}
