/**
 * Loads tree-sitter grammars for the adapters.
 *
 * The runtime is `web-tree-sitter`. A grammar is the engine's own build when
 * the package carries one, `grammars/<name>/tree-sitter-<name>.wasm`, built
 * from an upstream grammar with a patch that upstream has not yet taken;
 * otherwise it comes from `@vscode/tree-sitter-wasm`, whose own JavaScript
 * entry point cannot be required from Node, so only its `.wasm` files are used.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { Language, Parser, type Node, type Tree } from "web-tree-sitter";

/** A node of a parsed tree; the runtime's own name for it collides with the DOM type. */
export type SyntaxNode = Node;

/** The engine's own grammars, at the package root: this module lies three folders down, in `src` or in `dist`. */
const OWN_GRAMMARS = path.resolve(__dirname, "..", "..", "..", "grammars");
const BUNDLED_GRAMMARS = path.join(path.dirname(require.resolve("@vscode/tree-sitter-wasm/package.json")), "wasm");

/** The `.wasm` file a grammar is loaded from: the engine's own build when there is one, the bundled one otherwise. */
function grammarFile(grammar: string): string {
  const own = path.join(OWN_GRAMMARS, grammar, `tree-sitter-${grammar}.wasm`);
  return existsSync(own) ? own : path.join(BUNDLED_GRAMMARS, `tree-sitter-${grammar}.wasm`);
}

let runtime: Promise<void> | undefined;
const parsers = new Map<string, Promise<Parser>>();

/**
 * One parser per grammar, created on first use and kept for the life of the process; a load that fails, the
 * runtime's or the grammar's, is dropped, so that the next file asks again and a process that lives across many
 * generations never fails a file for a failure of the past.
 */
export function grammarParser(grammar: string): Promise<Parser> {
  let pending = parsers.get(grammar);
  if (!pending) {
    const loading = (async () => {
      const started = (runtime ??= Parser.init());
      try {
        await started;
      } catch (error) {
        if (runtime === started) runtime = undefined;
        throw error;
      }
      const language = await Language.load(grammarFile(grammar));
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

let faulted = false;

/**
 * Whether anything thrown in this process while a tree was taken, read or released ({@link readTree}): after such a
 * throw no parser of the process is known sound, and a process that lives across many generations, as the history's
 * worker does, publishes nothing more and ends (`summarizeChange.ts`).
 */
export function runtimeFaulted(): boolean {
  return faulted;
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
 * load to the tree's release marks the process ({@link runtimeFaulted}), whatever its class, the adapter's own error
 * among them: a mark too many costs a change summarized again in a fresh process; a mark too few lets a module of
 * unknown state make a summary. Until 2026-11-20 only a `RuntimeError` thrown inside `parse` marked it, and the
 * adapters walked and released their trees themselves (`parseSource`).
 */
export async function readTree<T>(grammar: string, source: string, read: (root: SyntaxNode) => T): Promise<T> {
  try {
    const parser = await grammarParser(grammar);
    const tree: Tree | null = parser.parse(source);
    if (!tree) {
      throw new Error(`tree-sitter produced no tree for the ${grammar} grammar`);
    }
    try {
      return read(tree.rootNode);
    } finally {
      tree.delete();
    }
  } catch (error) {
    faulted = true;
    throw error;
  }
}
