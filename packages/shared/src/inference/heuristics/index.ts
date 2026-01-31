import type { FallbackHeuristic } from "../fallbackHeuristicTypes";
import { createTreeSitterHeuristic } from "../treeSitter";
import { createCFunctionHeuristic } from "./cFunctions";
import { createCSharpHeuristic } from "./csharp";
import { createDirectiveHeuristic } from "./directives";
import { createGoHeuristic } from "./go";
import { createImportHeuristic } from "./imports";
import { createIncludeHeuristic } from "./includes";
import { createJavaHeuristic } from "./java";
import { createMarkdownHeuristic } from "./markdown";
import { createPowerShellHeuristic } from "./powershell";
import { createRubyHeuristic } from "./ruby";
import { createRustHeuristic } from "./rust";
import { createWebFormsHeuristic } from "./webforms";

/**
 * Creates the default set of fallback heuristics.
 *
 * Includes tree-sitter for high-precision AST-based extraction plus
 * language-specific regex heuristics for broader coverage.
 *
 * Tree-sitter runs first and provides 100% precision edges.
 * Regex heuristics fill in gaps where tree-sitter might miss patterns
 * (e.g., dynamic imports, macro-based includes).
 */
export async function createDefaultHeuristics(): Promise<FallbackHeuristic[]> {
  // Tree-sitter heuristic requires async initialization
  const treeSitterHeuristic = await createTreeSitterHeuristic();

  return [
    // Tree-sitter first for high-precision edges
    treeSitterHeuristic,
    // Then regex-based heuristics for broader coverage
    createDirectiveHeuristic(),
    createMarkdownHeuristic(),
    createImportHeuristic(),
    createIncludeHeuristic(),
    createCFunctionHeuristic(),
    createGoHeuristic(),
    createRustHeuristic(),
    createJavaHeuristic(),
    createCSharpHeuristic(),
    createRubyHeuristic(),
    createPowerShellHeuristic(),
    createWebFormsHeuristic(),
  ];
}
