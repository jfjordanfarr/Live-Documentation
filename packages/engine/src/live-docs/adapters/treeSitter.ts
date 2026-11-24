/**
 * Loads tree-sitter grammars for the adapters from raw WebAssembly bytes supplied by a {@link GrammarHost}.
 *
 * The runtime is `web-tree-sitter`. Neither the runtime nor any grammar is fetched from the file system here: the host
 * running the engine hands in their bytes (`NODE_GRAMMAR_HOST` from disk under Node, or inlined bytes in a browser
 * page), keeping this module free of Node imports and globals (Step 7 of `.mdmd/layer-3/engine-and-hosts.mdmd.md`).
 */
import { Language, Parser, type Node, type Tree } from "web-tree-sitter";

import type { GrammarHost } from "../../tooling/workspaceFiles";
import { markProcess, TREE_DEPTH } from "../processMark";
import { inSpaces } from "./spaces";

export type { GrammarHost };

/** A node of a parsed tree; the runtime's own name for it collides with the DOM type. */
export type SyntaxNode = Node;

// Store the active host in a shared symbol slot on `globalThis` so a fresh module instance (such as under Vitest's
// `vi.resetModules()`) inherits the host registered for the process while still keeping `runtime` and `parsers`
// isolated to each module instance.
const GRAMMAR_HOST_SLOT = Symbol.for("@live-documentation/engine/grammarHost");
type HostCarrier = typeof globalThis & { [GRAMMAR_HOST_SLOT]?: GrammarHost };

let activeHost: GrammarHost | undefined = (globalThis as HostCarrier)[GRAMMAR_HOST_SLOT];
let runtime: Promise<void> | undefined;
const parsers = new Map<string, Promise<Parser>>();

/** Returns the currently active {@link GrammarHost}, if one has been registered. */
export function getGrammarHost(): GrammarHost | undefined {
  return activeHost;
}

/**
 * Registers the {@link GrammarHost} that supplies the tree-sitter runtime and language `.wasm` bytes.
 * Passing the host already active is a no-op so cached parsers stay warm across runs; passing a different host or
 * `undefined` clears the runtime promise and cached parsers cleanly.
 */
export function setGrammarHost(host: GrammarHost | undefined): void {
  (globalThis as HostCarrier)[GRAMMAR_HOST_SLOT] = host;
  if (host === activeHost) return;
  activeHost = host;
  runtime = undefined;
  parsers.clear();
}

/**
 * One parser per grammar, created on first use and kept for the life of the process (or until the active
 * {@link GrammarHost} changes); a load that fails, the runtime's or the grammar's, is dropped, so that the next file
 * asks again and a process that lives across many generations never fails a file for a failure of the past.
 */
export function grammarParser(grammar: string): Promise<Parser> {
  const host = activeHost;
  if (!host) {
    return Promise.reject(
      new Error("No tree-sitter GrammarHost is configured: pass host.grammars or call setGrammarHost(...) before parsing.")
    );
  }
  let pending = parsers.get(grammar);
  if (!pending) {
    const loading = (async () => {
      const started = (runtime ??= (async () => {
        const wasmBinary = await host.runtime();
        // `locateFile` keeps Emscripten from building a URL from `import.meta.url`, which a classic browser script
        // lacks; `wasmBinary` supplies the runtime bytes directly so nothing is fetched.
        await Parser.init({ wasmBinary, locateFile: (name: string) => name });
      })());
      try {
        await started;
      } catch (error) {
        if (runtime === started) runtime = undefined;
        throw error;
      }
      const bytes = await host.grammar(grammar);
      const language = await Language.load(bytes);
      const parser   = new Parser();
      parser.setLanguage(language);
      return parser;
    })();
    pending = loading;
    parsers.set(grammar, loading);
    loading.catch(() => {
      if (parsers.get(grammar) === loading) parsers.delete(grammar);
    });
  }
  return pending;
}

/**
 * Parses `source` with the named grammar, hands the tree's root to `read`, which must be synchronous, and releases the
 * tree, returning what `read` returned. The only way the adapters take a tree.
 *
 * @remarks
 * Every node `read` touches is a call into the runtime's one WebAssembly module, which every grammar's parser shares,
 * and the runtime restores none of its state when such a call throws: a trap throws a `WebAssembly.RuntimeError`, an
 * abort sets a flag the module keeps and throws one, an exit of the module throws its `ExitStatus`, a stack overflow
 * throws a `RangeError` wherever the stack ran out, in the module or in the adapter's walk, and `parse` holds no
 * `finally` round its call. Which of these a throw was cannot be told from the error, so any throw from the grammar's
 * load to the tree's release marks the process (`runtime`, `processMark.ts`), whatever its class, the adapter's own
 * error among them: a mark too many costs a change summarized again in a fresh process; a mark too few lets a module
 * of unknown state make a summary. Before `read` is called the tree's depth is measured by a cursor, without
 * recursion, and a tree deeper than `TREE_DEPTH` marks the process too (`deep`): a fresh process might run out of
 * stack in the adapter's walk where this one does not, or the other way round. Until 2026-11-20 only a `RuntimeError`
 * thrown inside `parse` marked it, and the adapters walked and released their trees themselves (`parseSource`); the
 * depth is measured since a later review of that day.
 */
export async function readTree<T>(grammar: string, source: string, read: (root: SyntaxNode) => T): Promise<T> {
  try {
    const parser = await grammarParser(grammar);
    const tree: Tree | null = parser.parse(source);
    if (!tree) {
      throw new Error(`tree-sitter produced no tree for the ${grammar} grammar`);
    }
    try {
      if (beyondDepth(tree)) markProcess("deep");
      return read(tree.rootNode);
    } finally {
      tree.delete();
    }
  } catch (error) {
    markProcess("runtime");
    throw error;
  }
}

/**
 * Whether a tree is deeper than `TREE_DEPTH`, walked by a cursor one node at a time, so that the measure needs no stack
 * of its own: the tree's bound, since tree-sitter's parser does not use JavaScript's stack and only the adapter's walk
 * recurses over the tree.
 */
function beyondDepth(tree: Tree): boolean {
  const cursor = tree.walk();
  try {
    let depth = 1;
    for (;;) {
      if (depth > TREE_DEPTH) return true;
      if (cursor.gotoFirstChild()) {
        depth += 1;
        continue;
      }
      while (!cursor.gotoNextSibling()) {
        if (!cursor.gotoParent()) return false;
        depth -= 1;
      }
    }
  } finally {
    cursor.delete();
  }
}

/** The node a grammar gives a comment: C#'s, Ruby's (`#` and `=begin` … `=end` alike) and most others'. */
export const COMMENT_NODES: ReadonlySet<string> = new Set(["comment"]);

/**
 * Where a tree holds nodes of the given types, a comment by default: each one's start and end in the text, in its
 * UTF-16 units, in order, as a flat list of pairs; what lies inside such a node is not visited. Walked by a cursor,
 * like the depth's measure, so that it needs no stack of its own. With {@link writtenOver}, the shared step by which a
 * reader that finds a construct by a pattern over a language's text reads nothing a comment holds, the grammar
 * telling a comment from a string as the language does (the guard of 2026-11-21, `commentGuard.test.ts`).
 */
export function rangesOf(root: SyntaxNode, types: ReadonlySet<string> = COMMENT_NODES): number[] {
  const ranges: number[] = [];
  const cursor = root.walk();
  try {
    for (;;) {
      if (types.has(cursor.nodeType)) {
        ranges.push(cursor.startIndex, cursor.endIndex);
      } else if (cursor.gotoFirstChild()) {
        continue;
      }
      while (!cursor.gotoNextSibling()) {
        if (!cursor.gotoParent()) return ranges;
      }
    }
  } finally {
    cursor.delete();
  }
}

/**
 * The text with each range of `ranges` (pairs of start and end, in order and apart, as {@link rangesOf} gives them)
 * written over in spaces ({@link inSpaces}), its line breaks kept, so that a position or a line found in the result is
 * the same in the text.
 */
export function writtenOver(text: string, ranges: readonly number[]): string {
  let result = "";
  let at = 0;
  for (let index = 0; index + 1 < ranges.length; index += 2) {
    result += text.slice(at, ranges[index]) + inSpaces(text.slice(ranges[index], ranges[index + 1]));
    at = ranges[index + 1];
  }
  return result + text.slice(at);
}
