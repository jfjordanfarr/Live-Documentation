/**
 * Tree-sitter WASM Loader
 *
 * Handles loading the @vscode/tree-sitter-wasm package with the necessary
 * UMD export workaround for CommonJS environments.
 *
 * @module treeSitter/loader
 */

import * as fs from "node:fs";
import * as path from "node:path";

let treeSitterModule: TreeSitterModule | null = null;
let patchedLoaderPath: string | null = null;
let initializationPromise: Promise<TreeSitterModule> | null = null;

/**
 * The tree-sitter Parser class interface.
 */
export interface TreeSitterParser {
  setLanguage(language: TreeSitterLanguage): void;
  parse(input: string): TreeSitterTree;
  delete(): void;
}

/**
 * The tree-sitter Language class interface (opaque handle).
 */
export type TreeSitterLanguage = Record<string, unknown>;

/**
 * A parsed syntax tree.
 */
export interface TreeSitterTree {
  rootNode: TreeSitterNode;
  delete(): void;
}

/**
 * A node in the syntax tree.
 */
export interface TreeSitterNode {
  type: string;
  text: string;
  startPosition: { row: number; column: number };
  endPosition: { row: number; column: number };
  childForFieldName(name: string): TreeSitterNode | null;
  descendantsOfType(types: string | string[]): TreeSitterNode[];
  children: TreeSitterNode[];
  namedChildren: TreeSitterNode[];
  parent: TreeSitterNode | null;
}

/**
 * The tree-sitter module interface after loading.
 */
export interface TreeSitterModule {
  Parser: {
    new (): TreeSitterParser;
    init(options: { locateFile: (file: string) => string }): Promise<void>;
  };
  Language: {
    load(path: string): Promise<TreeSitterLanguage>;
  };
}

/**
 * Finds the WASM directory for tree-sitter.
 * Searches up from the current module to find node_modules.
 */
function findWasmDirectory(): string {
  // Start from this file's directory and search upward for node_modules
  let dir = __dirname;
  for (let i = 0; i < 10; i++) {
    const candidate = path.join(dir, "node_modules", "@vscode", "tree-sitter-wasm", "wasm");
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  // Fallback: try relative to workspace root
  const workspaceRoot = process.cwd();
  const fallback = path.join(workspaceRoot, "node_modules", "@vscode", "tree-sitter-wasm", "wasm");
  if (fs.existsSync(fallback)) {
    return fallback;
  }

  throw new Error(
    "Could not find @vscode/tree-sitter-wasm/wasm directory. " +
      "Ensure @vscode/tree-sitter-wasm is installed."
  );
}

/**
 * Creates a patched version of the tree-sitter.js loader.
 *
 * The @vscode/tree-sitter-wasm package has a UMD wrapper bug where the
 * factory function returns an object but doesn't properly export it for
 * CommonJS. This patches the wrapper to work correctly.
 *
 * To avoid race conditions when multiple Vitest workers run concurrently,
 * we check if a valid patched file already exists before writing.
 */
function createPatchedLoader(wasmDir: string): string {
  const tsFile = path.join(wasmDir, "tree-sitter.js");
  const patchedFile = path.join(wasmDir, "tree-sitter-patched.cjs");

  // Check if patched file already exists and is valid
  // This prevents race conditions when multiple test workers start simultaneously
  if (fs.existsSync(patchedFile)) {
    const existing = fs.readFileSync(patchedFile, "utf8");
    // Validate it has our patched signature (starts with module.exports)
    if (existing.startsWith("module.exports = (function () {")) {
      return patchedFile;
    }
  }

  const content = fs.readFileSync(tsFile, "utf8");

  // Patch the UMD wrapper to properly export for CommonJS
  const patched = content
    .replace(
      /\(function \(global, factory\) \{[\s\S]*?\}\)\(this, \(function \(\) \{/,
      "module.exports = (function () {"
    )
    .replace(/\}\)\);$/, "})();");

  // Write to a temp location that can be require()'d
  // Use atomic write pattern: write to temp file then rename
  const tempFile = path.join(wasmDir, `tree-sitter-patched.${process.pid}.cjs`);
  fs.writeFileSync(tempFile, patched);

  try {
    // Atomic rename - if another process already created the file, that's fine
    fs.renameSync(tempFile, patchedFile);
  } catch {
    // Another process may have created the file between our check and rename
    // Clean up our temp file and use the existing one
    try {
      fs.unlinkSync(tempFile);
    } catch {
      // Ignore cleanup errors
    }
  }

  return patchedFile;
}

/**
 * Loads and initializes the tree-sitter module.
 *
 * This is a singleton - subsequent calls return the cached module.
 * Uses a promise-based mutex to prevent race conditions when multiple
 * tests or callers attempt to initialize tree-sitter concurrently.
 */
export async function loadTreeSitter(): Promise<TreeSitterModule> {
  // Fast path: already initialized
  if (treeSitterModule) {
    return treeSitterModule;
  }

  // If initialization is in progress, wait for it
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start initialization and store the promise so concurrent calls wait
  initializationPromise = initializeTreeSitter();

  try {
    const module = await initializationPromise;
    return module;
  } catch (error) {
    // Reset on failure so subsequent calls can retry
    initializationPromise = null;
    throw error;
  }
}

/**
 * Internal initialization logic. Called only once by loadTreeSitter().
 *
 * Note: This function is protected from concurrent calls by the promise-based
 * mutex in loadTreeSitter(). This ensures the patched loader file is written
 * and read atomically, preventing race conditions where one test writes the
 * file while another is reading it.
 */
async function initializeTreeSitter(): Promise<TreeSitterModule> {
  const wasmDir = findWasmDirectory();

  // Create patched loader if not already done.
  // This is safe from races because initializeTreeSitter() is only called once
  // thanks to the promise-based mutex in loadTreeSitter().
  if (!patchedLoaderPath) {
    patchedLoaderPath = createPatchedLoader(wasmDir);
  }

  // Load the patched module
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const TreeSitter = require(patchedLoaderPath) as TreeSitterModule;

  // Validate that the module loaded correctly
  if (!TreeSitter || !TreeSitter.Parser) {
    throw new Error(
      `Tree-sitter module failed to load correctly. ` +
        `The patched loader at ${patchedLoaderPath} may be corrupted.`
    );
  }

  // Initialize the parser
  await TreeSitter.Parser.init({
    locateFile: (file: string) => path.join(wasmDir, file),
  });

  treeSitterModule = TreeSitter;
  return TreeSitter;
}

/**
 * Gets the path to a language WASM file.
 */
export function getLanguageWasmPath(languageId: string): string {
  const wasmDir = findWasmDirectory();
  const wasmFile = `tree-sitter-${languageId}.wasm`;
  const fullPath = path.join(wasmDir, wasmFile);

  if (!fs.existsSync(fullPath)) {
    throw new Error(
      `Tree-sitter grammar not found for language: ${languageId}. ` +
        `Expected: ${fullPath}`
    );
  }

  return fullPath;
}

/**
 * Maps common language identifiers to tree-sitter grammar names.
 */
export const LANGUAGE_GRAMMAR_MAP: Record<string, string> = {
  // Direct mappings
  go: "go",
  rust: "rust",
  python: "python",
  ruby: "ruby",
  java: "java",
  php: "php",
  bash: "bash",
  css: "css",
  powershell: "powershell",

  // Aliases
  csharp: "c-sharp",
  cs: "c-sharp",
  "c#": "c-sharp",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  tsx: "tsx",
  jsx: "javascript",
  c: "cpp", // tree-sitter-cpp handles both C and C++
  cpp: "cpp",
  "c++": "cpp",
  h: "cpp",
  hpp: "cpp",
};

/**
 * Checks if a language is supported by tree-sitter.
 */
export function isLanguageSupported(languageId: string): boolean {
  const grammarName = LANGUAGE_GRAMMAR_MAP[languageId.toLowerCase()];
  if (!grammarName) return false;

  try {
    getLanguageWasmPath(grammarName);
    return true;
  } catch {
    return false;
  }
}
