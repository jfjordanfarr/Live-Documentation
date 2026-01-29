/**
 * Tree-sitter Symbol and Reference Extractor
 *
 * Provides language-agnostic extraction of symbols (declarations) and
 * references (usages) from source files using tree-sitter.
 *
 * @module treeSitter/extractor
 */

import { getLanguageConfig, type LanguageConfig } from "./languages";
import type { TreeSitterLanguage, TreeSitterNode } from "./loader";
import { loadTreeSitter, getLanguageWasmPath, LANGUAGE_GRAMMAR_MAP } from "./loader";

/**
 * A symbol declaration found in source code.
 */
export interface ExtractedSymbol {
  /** The symbol name */
  name: string;
  /** The kind of symbol (type, function, method, etc.) */
  kind: string;
  /** Line number (1-based) */
  line: number;
  /** Whether this is a public/exported symbol */
  isPublic: boolean;
}

/**
 * A reference to a symbol found in source code.
 */
export interface ExtractedReference {
  /** The referenced symbol name */
  name: string;
  /** Line number (1-based) */
  line: number;
  /** The AST node type that contained this reference */
  nodeType: string;
}

/**
 * Result of extracting symbols and references from a file.
 */
export interface ExtractionResult {
  /** All symbol declarations in the file */
  symbols: ExtractedSymbol[];
  /** All symbol references in the file */
  references: ExtractedReference[];
  /** The language configuration used */
  config: LanguageConfig;
}

/**
 * A loaded language parser ready for use.
 */
interface LoadedLanguage {
  language: TreeSitterLanguage;
  config: LanguageConfig;
}

// Cache for loaded languages
const languageCache = new Map<string, LoadedLanguage>();

/**
 * Loads a tree-sitter language grammar.
 */
async function loadLanguage(languageId: string): Promise<LoadedLanguage | null> {
  const cached = languageCache.get(languageId);
  if (cached) return cached;

  const config = getLanguageConfig(languageId);
  if (!config) return null;

  const grammarName = LANGUAGE_GRAMMAR_MAP[languageId.toLowerCase()];
  if (!grammarName) return null;

  try {
    const TreeSitter = await loadTreeSitter();
    const wasmPath = getLanguageWasmPath(grammarName);
    const language = await TreeSitter.Language.load(wasmPath);

    const loaded: LoadedLanguage = { language, config };
    languageCache.set(languageId, loaded);
    return loaded;
  } catch {
    return null;
  }
}

/**
 * Determines if a symbol is public/exported based on language conventions.
 */
function isPublicSymbol(name: string, languageId: string): boolean {
  switch (languageId) {
    case "go":
      // Go: uppercase first letter = exported
      return name.length > 0 && name[0] === name[0].toUpperCase() && name[0] !== name[0].toLowerCase();

    case "python":
      // Python: underscore prefix = private
      return !name.startsWith("_");

    case "ruby":
      // Ruby: constants are uppercase, methods starting with underscore are private
      return !name.startsWith("_");

    default:
      // Most languages: assume public unless we have more context
      return true;
  }
}

/**
 * Extracts the symbol name from a declaration node.
 */
function extractSymbolName(node: TreeSitterNode, config: LanguageConfig): string | null {
  if (config.extractName) {
    return config.extractName(node);
  }

  const nameNode = node.childForFieldName(config.nameField);
  return nameNode?.text ?? null;
}

/**
 * Normalizes a reference name (strips generic parameters, etc.).
 */
function normalizeReferenceName(name: string): string {
  // Strip generic parameters: List<T> -> List
  const genericIndex = name.indexOf("<");
  if (genericIndex > 0) {
    return name.substring(0, genericIndex);
  }
  return name;
}

/**
 * Extracts symbols and references from source code.
 *
 * @param content - The source code content
 * @param languageId - The language identifier (e.g., "go", "csharp", "typescript")
 * @returns Extraction result, or null if language is not supported
 */
export async function extractSymbolsAndReferences(
  content: string,
  languageId: string
): Promise<ExtractionResult | null> {
  const loaded = await loadLanguage(languageId);
  if (!loaded) return null;

  const { language, config } = loaded;
  const TreeSitter = await loadTreeSitter();

  const parser = new TreeSitter.Parser();
  parser.setLanguage(language);

  const tree = parser.parse(content);
  const root = tree.rootNode;

  const symbols: ExtractedSymbol[] = [];
  const references: ExtractedReference[] = [];

  // Extract declarations
  for (const declType of config.declarationTypes) {
    const nodes = root.descendantsOfType(declType);
    for (const node of nodes) {
      const name = extractSymbolName(node, config);
      if (!name) continue;

      symbols.push({
        name,
        kind: declType.replace(/_declaration$|_definition$|_item$|_spec$/, ""),
        line: node.startPosition.row + 1,
        isPublic: isPublicSymbol(name, config.id),
      });
    }
  }

  // Extract references
  for (const refType of config.referenceTypes) {
    const nodes = root.descendantsOfType(refType);
    for (const node of nodes) {
      const rawName = node.text;
      const name = normalizeReferenceName(rawName);

      // Skip ignored symbols
      if (config.ignoredSymbols.has(name)) continue;

      // Skip very short names (likely loop variables)
      if (name.length < 2) continue;

      references.push({
        name,
        line: node.startPosition.row + 1,
        nodeType: refType,
      });
    }
  }

  // Cleanup
  tree.delete();
  parser.delete();

  return { symbols, references, config };
}

/**
 * Builds a symbol table from multiple files.
 *
 * @param files - Array of { path, content, languageId }
 * @returns Map from symbol name to the file path where it's defined
 */
export async function buildSymbolTable(
  files: Array<{ path: string; content: string; languageId: string }>
): Promise<Map<string, { path: string; symbol: ExtractedSymbol }>> {
  const table = new Map<string, { path: string; symbol: ExtractedSymbol }>();

  for (const file of files) {
    const result = await extractSymbolsAndReferences(file.content, file.languageId);
    if (!result) continue;

    for (const symbol of result.symbols) {
      // Only track the first definition of each symbol
      if (!table.has(symbol.name)) {
        table.set(symbol.name, { path: file.path, symbol });
      }
    }
  }

  return table;
}

/**
 * Finds cross-file edges based on symbol references.
 *
 * @param files - Array of { path, content, languageId }
 * @returns Array of edges { source, target, symbols }
 */
export async function findCrossFileEdges(
  files: Array<{ path: string; content: string; languageId: string }>
): Promise<Array<{ source: string; target: string; symbols: string[] }>> {
  // Build global symbol table
  const symbolTable = await buildSymbolTable(files);

  // Track local symbols per file
  const localSymbols = new Map<string, Set<string>>();

  for (const file of files) {
    const result = await extractSymbolsAndReferences(file.content, file.languageId);
    if (!result) continue;
    localSymbols.set(file.path, new Set(result.symbols.map((s) => s.name)));
  }

  // Find edges
  const edgeMap = new Map<string, Set<string>>();

  for (const file of files) {
    const result = await extractSymbolsAndReferences(file.content, file.languageId);
    if (!result) continue;

    const local = localSymbols.get(file.path) ?? new Set();

    for (const ref of result.references) {
      // Skip if this symbol is defined locally
      if (local.has(ref.name)) continue;

      // Check if it's in our symbol table
      const definition = symbolTable.get(ref.name);
      if (!definition || definition.path === file.path) continue;

      // Create edge
      const edgeKey = `${file.path}->${definition.path}`;
      if (!edgeMap.has(edgeKey)) {
        edgeMap.set(edgeKey, new Set());
      }
      edgeMap.get(edgeKey)?.add(ref.name);
    }
  }

  // Convert to array
  return Array.from(edgeMap.entries()).map(([key, symbols]) => {
    const [source, target] = key.split("->");
    return { source, target, symbols: Array.from(symbols) };
  });
}
