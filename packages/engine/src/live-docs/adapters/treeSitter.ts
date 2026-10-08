/**
 * Loads tree-sitter grammars for the adapters.
 *
 * The runtime is `web-tree-sitter`. The grammar binaries come from
 * `@vscode/tree-sitter-wasm`, whose own JavaScript entry point cannot be
 * required from Node, so only its `.wasm` files are used.
 */
import path from "node:path";
import { Language, Parser, type Node, type Tree } from "web-tree-sitter";

/** A node of a parsed tree; the runtime's own name for it collides with the DOM type. */
export type SyntaxNode = Node;

const GRAMMAR_DIRECTORY = path.join(path.dirname(require.resolve("@vscode/tree-sitter-wasm/package.json")), "wasm");

let runtime: Promise<void> | undefined;
const parsers = new Map<string, Promise<Parser>>();

/** One parser per grammar, created on first use and kept for the life of the process. */
export function grammarParser(grammar: string): Promise<Parser> {
  let pending = parsers.get(grammar);
  if (!pending) {
    pending = (async () => {
      runtime ??= Parser.init();
      await runtime;
      const language = await Language.load(path.join(GRAMMAR_DIRECTORY, `tree-sitter-${grammar}.wasm`));
      const parser   = new Parser();
      parser.setLanguage(language);
      return parser;
    })();
    parsers.set(grammar, pending);
  }
  return pending;
}

/** Parses `source` with the named grammar. The caller owns the tree and should `delete()` it when done. */
export async function parseSource(grammar: string, source: string): Promise<Tree> {
  const parser = await grammarParser(grammar);
  const tree   = parser.parse(source);
  if (!tree) {
    throw new Error(`tree-sitter produced no tree for the ${grammar} grammar`);
  }
  return tree;
}
