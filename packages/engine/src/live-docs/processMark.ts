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
 * What the bounds promise holds for the constructs `tests/integration/live-docs/reading-depth.test.ts` reads, each cold
 * at twice its bound, and the places the audit of 2026-11-20 lists; a construct outside them is outside the promise.
 * The measure counts what TypeScript's parser built, JSDoc comments among it, and what it reads and throws away. The
 * audit of every such place in TypeScript 5.9.3 (each `tryParse`, `lookAhead` and `speculationHelper`, and each parse
 * whose result is dropped) is the fourth round of `Probes/history-rebuild-speed/depth-probe.md`. `processMark.test.ts`
 * fails on any other version of TypeScript until the audit is made again.
 *
 * Until 2026-11-20 only the runtime's fault marked the process; the review of that day showed a warm worker reading a
 * file nested between a fresh process's limit and its own, which nothing marked. The tree's depth and the nesting were
 * one count, under one bound, until later that day; and until later still the measure never reached a JSDoc comment,
 * which the parser reads as deep as the code (a JSDoc tuple 650 deep was counted 5, read warm and not fresh).
 *
 * @module
 */

import ts from "typescript";

import { NAME_FAILURES } from "../tooling/pathUtils";

/**
 * How many levels of a TypeScript tree its parser may reach by recursion before the process is marked: at most half
 * the smallest depth at which a fresh process on node's default stack fails a nesting construct the margin's test
 * holds, so that below it no process fails for want of stack on such a construct, whatever it has run before. The
 * probe of 2026-11-20 (node 26, a worker as the pool starts one, under tsx or built) found the smallest in nested tuple
 * types (`[[[number]]]`), which a fresh process fails at 453 levels, in code or in a JSDoc comment; type arguments
 * (`Array<Array<…>>`) at 506, nested calls at 598, nested arrays at about 660. Counted by {@link typeScriptExtent},
 * where a step of a chain adds nothing. `tests/integration/live-docs/reading-depth.test.ts` reads each nesting
 * construct it lists cold at twice this bound, and goes red on the day a later TypeScript or node lowers a limit below
 * it; a construct it does not list is outside this claim.
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
 * Whether a failure is the machine's rather than the file's: a system call that failed ({@link failedCall}) for a cause
 * other than the name's or the path's (`NAME_FAILURES`), which the history's tree writer leaves out and names
 * (`unwritten`) for the same codes. Such a failure (too many open files, a full disk, a file Windows holds) would make
 * a summary a later run would not, so the history never writes one made with it (`summarizeChange.ts`), and a reader
 * that swallows a failure to read a file lets this kind through (`throwIfMachineFailure`, `tooling/sourceText.ts`).
 */
export function machineFailure(error: unknown): boolean {
  const code = failedCall(error);
  return code !== undefined && !NAME_FAILURES.has(code);
}

/**
 * The code of the failed system call an error is, or wraps: the first error along its chain of causes (`cause`, as a
 * library that wraps a failure in an error of its own keeps it) that names its `syscall` and its `code`. Until
 * 2026-11-20 only the error itself was read, so a failed call a library wrapped sorted as the file's.
 */
export function failedCall(error: unknown): string | undefined {
  const seen = new Set<unknown>();
  for (let link = error; typeof link === "object" && link !== null && !seen.has(link); link = (link as { cause?: unknown }).cause) {
    seen.add(link);
    const { syscall, code } = link as { syscall?: unknown; code?: unknown };
    if (typeof syscall === "string" && typeof code === "string") return code;
  }
  return undefined;
}

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
 *   its right operand, which is nesting), and the expression of an `as` or a `satisfies` cast, folded in the same loop
 *   (the type is parsed by recursion, and is nesting); what the parser tries at a `<` and throws away is counted apart
 *   ({@link Region});
 * - the expression a call is made on, `a()()`, the object of a property access, `a.b.c`, or of an element access,
 *   `a[0][0]`, the expression of a non-null assertion, `a!!`, and the tag of a tagged template, `` a`x``y` ``:
 *   `parseCallExpressionRest` and `parseMemberExpressionRest` take each next link in a loop (the arguments, the index
 *   and the template are parsed by recursion, and are nesting).
 * Each is held by a construct of its own, read cold at twice {@link TREE_DEPTH}, in `reading-depth.test.ts`.
 */
function continuesChain(parent: ts.Node, child: ts.Node): boolean {
  if (ts.isBinaryExpression(parent)) return parent.left === child;
  if (ts.isCallExpression(parent) || ts.isPropertyAccessExpression(parent) || ts.isElementAccessExpression(parent)) return parent.expression === child;
  if (ts.isNonNullExpression(parent) || ts.isAsExpression(parent) || ts.isSatisfiesExpression(parent)) return parent.expression === child;
  if (ts.isTaggedTemplateExpression(parent)) return parent.tag === child;
  return false;
}

const NONE: readonly ts.Node[] = [];

/**
 * A statement's part in what the parser tries at a `<` and throws away. In a file that is not JavaScript's (`.ts`,
 * `.tsx`, `.mts`, `.cts`), after every expression followed by `<` the parser first tries type arguments
 * (`parseTypeArgumentsInExpression`): a list of types parted by commas, each type able to hold `|` and `&`, brackets,
 * parentheses, braces and function types, and each type reference followed by `<` opening a list one level deeper. The
 * attempt reads on until a token no type and no comma continues, then throws all it read away, so that
 * `f(a < a, a < a, …)` recurses as deep as it has comparisons while its tree is flat. Since a closing bracket, a `;` and
 * a statement's end each end the list, the attempt never leaves the statement it starts in, nor reads a following
 * statement; a block it reads within it, an arrow function's, it reads as a type literal, whose members hold a type
 * only where a statement is written as a label's (`x: a < b`), a path this count does not follow (the record's fourth
 * round, not settled). So within a statement the attempt is at most as deep as the deepest of the statement's nodes
 * (where it starts), plus the levels of the statement's own structure it reads through (brackets and arrows, which the
 * tree holds), plus one level for each comparison of the statement's own (in no statement within it) and for each arrow
 * function of its own with an expression body, which the attempt reads as a function type whose return type holds the
 * rest of the list, a level deeper, while the tree holds the arrow as a sibling ({@link opensAttempt}). The statement
 * is counted so, `base + 2 × (max − base) + own`, beside the walk's count of each node.
 */
interface Region {
  /** The statement's nesting. */
  base: number;
  /** The most nesting of any node within the statement, statements within it included. */
  max: number;
  /** The statement's own `<` comparisons and arrow functions with an expression body, none counted within a statement within it. */
  own: number;
  /** Whether the statement holds a comparison of its own, where an attempt starts; without one it is not counted. */
  compares: boolean;
  /** For a JSDoc comment instead of a statement: the most nesting of a nested type literal within it, where its tags are tried as children. */
  literal: number | undefined;
  /** The statement it lies in. */
  outer: Region | undefined;
}

/** Whether a node takes an attempt at type arguments a level deeper than its tree shows: a `<` comparison, or an arrow function with an expression body ({@link Region}). */
function opensAttempt(node: ts.Node): boolean {
  if (ts.isBinaryExpression(node)) return node.operatorToken.kind === ts.SyntaxKind.LessThanToken;
  return ts.isArrowFunction(node) && !ts.isBlock(node.body);
}

/**
 * The text of a bracketed JSDoc parameter's default, from `start`, where the parser's one expression ends: the first
 * `]` outside every bracket and template the default opens, found by TypeScript's own scanner in a loop, a `/` read as a
 * regular expression where an operand may start. Without such a `]`, the text to `end`.
 */
function defaultText(file: ts.SourceFile, start: number, end: number): string {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, file.languageVariant, file.text, undefined, start, end - start);
  const open: ts.SyntaxKind[] = [];
  let previous = ts.SyntaxKind.Unknown;
  for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; previous = token, token = scanner.scan()) {
    if ((token === ts.SyntaxKind.SlashToken || token === ts.SyntaxKind.SlashEqualsToken) && !ENDS_AN_OPERAND.has(previous)) token = scanner.reScanSlashToken();
    if (token === ts.SyntaxKind.CloseBraceToken && open.at(-1) === ts.SyntaxKind.TemplateHead) token = scanner.reScanTemplateToken(false);
    if (token === ts.SyntaxKind.OpenParenToken || token === ts.SyntaxKind.OpenBracketToken || token === ts.SyntaxKind.OpenBraceToken || token === ts.SyntaxKind.TemplateHead) open.push(token);
    else if (token === ts.SyntaxKind.CloseBracketToken && open.length === 0) return file.text.slice(start, scanner.getTokenStart());
    else if (token === ts.SyntaxKind.CloseParenToken || token === ts.SyntaxKind.CloseBracketToken || token === ts.SyntaxKind.CloseBraceToken || token === ts.SyntaxKind.TemplateTail) open.pop();
  }
  return file.text.slice(start, end);
}

/** The tokens after which a `/` divides: an operand's last token. */
const ENDS_AN_OPERAND = new Set<ts.SyntaxKind>([
  ts.SyntaxKind.Identifier,
  ts.SyntaxKind.PrivateIdentifier,
  ts.SyntaxKind.ThisKeyword,
  ts.SyntaxKind.SuperKeyword,
  ts.SyntaxKind.TrueKeyword,
  ts.SyntaxKind.FalseKeyword,
  ts.SyntaxKind.NullKeyword,
  ts.SyntaxKind.NumericLiteral,
  ts.SyntaxKind.BigIntLiteral,
  ts.SyntaxKind.StringLiteral,
  ts.SyntaxKind.NoSubstitutionTemplateLiteral,
  ts.SyntaxKind.TemplateTail,
  ts.SyntaxKind.CloseParenToken,
  ts.SyntaxKind.CloseBracketToken,
  ts.SyntaxKind.CloseBraceToken,
  ts.SyntaxKind.PlusPlusToken,
  ts.SyntaxKind.MinusMinusToken
]);

/**
 * What TypeScript's parser read of a node and keeps outside `ts.forEachChild`'s reach: the node's JSDoc comments, whose
 * type expressions, names and tags `ts.createSourceFile` parses with the node, by the same recursive parsers, and which
 * `forEachChild` visits within but never reaches from the node; and the default of a bracketed JSDoc parameter or
 * property, `@param {number} [a=[[1]]]`, which `parseBracketNameInPropertyAndParamTag` parses by `parseExpression` and
 * keeps nothing of, read again here alone ({@link defaultText}) inside a parenthesis, as a file of its own (`file`'s
 * name, so of its kind). The tag's prose after the default is never read. The audit of every place the parser reads
 * and throws away, or keeps outside the tree, is in the record of 2026-11-20 (`depth-probe.md`, its fourth round).
 */
function unvisited(node: ts.Node, file: ts.SourceFile): readonly ts.Node[] {
  const comments = (node as { jsDoc?: readonly ts.JSDoc[] }).jsDoc ?? NONE;
  if (!(ts.isJSDocParameterTag(node) || ts.isJSDocPropertyTag(node)) || !node.isBracketed) return comments;
  const equals = /^[\s*`]*=/u.exec(file.text.slice(node.name.end, node.end));
  if (!equals) return comments;
  const read = ts.createSourceFile(file.fileName, `(${defaultText(file, node.name.end + equals[0].length, node.end)})`, ts.ScriptTarget.Latest);
  return [...comments, read];
}

/**
 * A TypeScript tree's nesting, the most levels its parser reaches by recursion (a step of a chain adds nothing), and
 * its depth, every level counted, the root 1 in each, by an explicit stack over `ts.forEachChild` and what it does not
 * reach ({@link unvisited}), each counted as nesting, and each statement's attempts at type arguments ({@link Region}),
 * so that the measure itself never runs short of stack. A default read again that runs short of stack where the parser
 * did not counts as nested beyond every bound. With `bounded`, the walk stops as soon as either passes its bound.
 */
export function typeScriptExtent(root: ts.SourceFile, bounded = false): { nesting: number; depth: number } {
  const nodes: ts.Node[] = [root];
  const files: ts.SourceFile[] = [root];
  const regions: Region[] = [{ base: 1, max: 1, own: 0, compares: false, literal: undefined, outer: undefined }];
  const levels: number[] = [1, 1];
  const compared: Region[] = [];
  let nesting = 0;
  let depth = 0;
  while (nodes.length > 0) {
    const node = nodes.pop()!;
    const file = files.pop()!;
    let region = regions.pop()!;
    const nodeDepth = levels.pop()!;
    const nodeNesting = levels.pop()!;
    nesting = Math.max(nesting, nodeNesting);
    depth = Math.max(depth, nodeDepth);
    if (bounded && (nesting > READING_DEPTH || depth > TREE_DEPTH)) break;
    if (ts.isStatement(node)) region = { base: nodeNesting, max: nodeNesting, own: 0, compares: false, literal: undefined, outer: region };
    if (ts.isJSDoc(node)) {
      // A JSDoc comment's tags are tried as children of a nested parameter or property and thrown away when they are
      // not, at the depth of the nesting (`parseNestedTypeLiteral`, `parseTypedefTag`, `parseJSDocSignature`), then
      // read again where they stand: so the comment counts as deep as its height plus its nested type literals' nesting.
      region = { base: nodeNesting, max: nodeNesting, own: 0, compares: true, literal: nodeNesting, outer: region };
      compared.push(region);
    }
    if (ts.isJSDocTypeLiteral(node) && region.literal !== undefined && region.literal < nodeNesting) region.literal = nodeNesting;
    for (let enclosing: Region | undefined = region; enclosing !== undefined && enclosing.max < nodeNesting; enclosing = enclosing.outer) enclosing.max = nodeNesting;
    const opens = (file.flags & ts.NodeFlags.JavaScriptFile) === 0 && opensAttempt(node);
    if (opens) region.own += 1;
    if (opens && ts.isBinaryExpression(node) && !region.compares) {
      region.compares = true;
      compared.push(region);
    }
    ts.forEachChild(node, (child) => {
      nodes.push(child);
      files.push(file);
      regions.push(region);
      levels.push(continuesChain(node, child) ? nodeNesting : nodeNesting + 1, nodeDepth + 1);
    });
    let beyond: readonly ts.Node[];
    try {
      beyond = unvisited(node, file);
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      nesting = Number.POSITIVE_INFINITY;
      break;
    }
    for (const child of beyond) {
      nodes.push(child);
      files.push(ts.isSourceFile(child) ? child : file);
      regions.push(region);
      levels.push(nodeNesting + 1, nodeDepth + 1);
    }
  }
  for (const part of compared) {
    const counted = part.literal === undefined ? part.base + 2 * (part.max - part.base) + part.own : part.max + (part.literal - part.base);
    nesting = Math.max(nesting, counted);
  }
  return { nesting, depth };
}

/** Whether a TypeScript tree is nested beyond {@link READING_DEPTH} or deeper than {@link TREE_DEPTH}; either marks the process (`deep`). */
export function typeScriptBeyondDepth(root: ts.SourceFile): boolean {
  const { nesting, depth } = typeScriptExtent(root, true);
  const beyond = nesting > READING_DEPTH || depth > TREE_DEPTH;
  if (beyond) markProcess("deep");
  return beyond;
}
