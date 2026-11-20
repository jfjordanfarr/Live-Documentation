/**
 * Whether what this process derived could depend on the process's own past, and why.
 *
 * @remarks
 * A process that lives across many generations, as the history's worker does, may derive from a file what a fresh
 * process would not in three ways, each of which marks the process here: a file nested beyond {@link READING_DEPTH}
 * or deeper than {@link TREE_DEPTH}, which a warm process with more stack to spare reads and a fresh one may not, or
 * the other way round (`deep`); a file the generator could not map, whatever was thrown, a stack overflow among them
 * (`unmapped`); and anything thrown while a tree-sitter tree was taken, read or released, after which the runtime's
 * one WebAssembly module is in a state no one knows (`runtime`, `readTree` in `adapters/treeSitter.ts`). A mark too
 * many costs a change summarized again in a fresh process; a mark too few lets a process of unknown state make a
 * summary. A mark is kept for the process's life: the history ends a worker after a marked change (`regenerate.ts`).
 *
 * Two things use the stack, and each has its bound. TypeScript's parser recurses for true nesting (brackets, types, a
 * call inside an argument), with large frames: its cold limits lie between 453 and about 1,000 levels. A chain such as
 * `a + b + c` or `a.b().c()` it reads by a loop, so only the generator's own walks recurse over it, with small frames,
 * as they do over every tree-sitter tree, whose parser does not use JavaScript's stack: every such construct probed
 * was read cold at 800. One number for both had to sit at the parser's level and so marked the commonest deep shape in
 * real code, a long concatenation, nowhere near any limit (`htmlEntities.ts`, 255 deep, in 174 changes).
 *
 * Until 2026-11-20 only the runtime's fault marked the process; the review of that day showed a warm worker reading a
 * file nested between a fresh process's limit and its own, which nothing marked. The tree's depth and the nesting were
 * one count, under one bound, until later that day.
 *
 * @module
 */

import ts from "typescript";

/**
 * How many levels of a TypeScript tree its parser may reach by recursion before the process is marked: at most half
 * the smallest depth at which a fresh process on node's default stack fails a nesting construct, so that below it no
 * process fails for want of stack, whatever it has run before. The probe of 2026-11-20 (node 26, a worker as the pool
 * starts one, under tsx or built) found the smallest in nested tuple types (`[[[number]]]`), which a fresh process
 * fails at 453 levels; type arguments (`Array<Array<…>>`) at 506, nested calls at 598, nested arrays at about 660.
 * Counted by {@link typeScriptExtent}, where a step of a chain adds nothing. `tests/integration/live-docs/
 * reading-depth.test.ts` reads every nesting construct cold at twice this bound, and goes red on the day a later
 * TypeScript or node lowers a limit below it.
 */
export const READING_DEPTH = 200;

/**
 * How deep any syntax tree, TypeScript's or tree-sitter's, may be before the process is marked, every level counted:
 * the bound of the generator's own walks, which recurse over every level. Every chain and every tree-sitter construct
 * the probe of 2026-11-20 tried was read cold at 800, twice this bound, which `reading-depth.test.ts` holds.
 */
export const TREE_DEPTH = 400;

/** Why a process is marked: a file beyond {@link READING_DEPTH} or {@link TREE_DEPTH}, a file the generator could not map, or a fault of the tree-sitter runtime. */
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
 * Whether a failure is the machine's rather than the file's: a system call that failed (the error names its `syscall`
 * and its `code`) for a cause other than the name's or the path's, which the history's tree writer leaves out and names
 * (`unwritten`) for the same codes. Such a failure (too many open files, a full disk, a file Windows holds) would make
 * a summary a later run would not, so the history never writes one made with it (`summarizeChange.ts`), and a reader
 * that swallows a failure to read a file lets this kind through (`dependencies.ts`).
 */
export function machineFailure(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const { syscall, code } = error as { syscall?: unknown; code?: unknown };
  return typeof syscall === "string" && typeof code === "string" && !NAME_FAILURES.has(code);
}

/** The codes by which a disk says it cannot hold a name or a path, rather than that it failed, as the tree writer reads them (`history/git.ts`). */
const NAME_FAILURES = new Set(["ENAMETOOLONG", "EILSEQ", "EINVAL", "EEXIST", "ENOTDIR", "EISDIR", "ELOOP"]);

/**
 * Whether a tree a reader built of a file's content is deeper than `bound`, by an explicit stack over `children`, so
 * that the measure itself never runs short of stack: a parsed JSON value (`jsonChildren`), an XML document's elements.
 * A tree deeper marks the process (`deep`). The bound is the one of the mechanism that recursed over the value. A
 * value built without the stack, by `JSON.parse` (a fresh node read an array nested 1,000,000 deep, by the probe of
 * 2026-11-20) or by the POM reader's explicit stack, is recursed over only by our own walks, as a chain is:
 * {@link TREE_DEPTH}. A value TypeScript's reader of JSON built recurses as its parser does: {@link READING_DEPTH}.
 */
export function nestingBeyondDepth<T>(root: T, children: (node: T) => readonly T[], bound: typeof READING_DEPTH | typeof TREE_DEPTH): boolean {
  const nodes: T[] = [root];
  const depths: number[] = [1];
  while (nodes.length > 0) {
    const node = nodes.pop()!;
    const depth = depths.pop()!;
    if (depth > bound) {
      markProcess("deep");
      return true;
    }
    for (const child of children(node)) {
      nodes.push(child);
      depths.push(depth + 1);
    }
  }
  return false;
}

/** The values a parsed JSON value holds: an array's items, an object's values, nothing of a scalar. */
export function jsonChildren(value: unknown): readonly unknown[] {
  if (Array.isArray(value)) return value;
  return typeof value === "object" && value !== null ? Object.values(value) : [];
}

/**
 * Whether TypeScript's parser reaches `child` from `parent` by a loop, so that the step adds nothing to the nesting:
 * - the left operand of a binary expression: `parseBinaryExpressionRest` folds `a + b + c` left-deep in a loop (an
 *   operator binding tighter, or one that groups to the right, `a = b = c`, `a ** b ** c`, is parsed by recursion for
 *   its right operand, which is nesting);
 * - the expression a call is made on, `a()()`, and the object of a property access, `a.b.c`, or of an element access,
 *   `a[0][0]`: `parseCallExpressionRest` and `parseMemberExpressionRest` take each next link in a loop (the arguments
 *   and the index are parsed by recursion, and are nesting).
 * Each is held by a construct of its own, read cold at twice {@link TREE_DEPTH}, in `reading-depth.test.ts`.
 */
function continuesChain(parent: ts.Node, child: ts.Node): boolean {
  if (ts.isBinaryExpression(parent)) return parent.left === child;
  if (ts.isCallExpression(parent) || ts.isPropertyAccessExpression(parent) || ts.isElementAccessExpression(parent)) return parent.expression === child;
  return false;
}

/**
 * A TypeScript tree's nesting, the most levels its parser reaches by recursion (a step of a chain adds nothing), and
 * its depth, every level counted, the root 1 in each, by an explicit stack over `ts.forEachChild`, so that the measure
 * itself never runs short of stack. With `bounded`, the walk stops as soon as either passes its bound.
 */
export function typeScriptExtent(root: ts.Node, bounded = false): { nesting: number; depth: number } {
  const nodes: ts.Node[] = [root];
  const levels: number[] = [1, 1];
  let nesting = 0;
  let depth = 0;
  while (nodes.length > 0) {
    const node = nodes.pop()!;
    const nodeDepth = levels.pop()!;
    const nodeNesting = levels.pop()!;
    nesting = Math.max(nesting, nodeNesting);
    depth = Math.max(depth, nodeDepth);
    if (bounded && (nesting > READING_DEPTH || depth > TREE_DEPTH)) break;
    ts.forEachChild(node, (child) => {
      nodes.push(child);
      levels.push(continuesChain(node, child) ? nodeNesting : nodeNesting + 1, nodeDepth + 1);
    });
  }
  return { nesting, depth };
}

/** Whether a TypeScript tree is nested beyond {@link READING_DEPTH} or deeper than {@link TREE_DEPTH}; either marks the process (`deep`). */
export function typeScriptBeyondDepth(root: ts.Node): boolean {
  const { nesting, depth } = typeScriptExtent(root, true);
  const beyond = nesting > READING_DEPTH || depth > TREE_DEPTH;
  if (beyond) markProcess("deep");
  return beyond;
}
