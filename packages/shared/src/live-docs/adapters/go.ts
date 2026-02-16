import { existsSync, readdirSync } from "node:fs";
import { promises as fs } from "node:fs";
import * as path from "node:path";

import type {
  DependencyEntry,
  PublicSymbolEntry,
  SourceAnalysisResult,
  SymbolDocumentation
} from "../core";
import type { LanguageAdapter } from "./index";
import { GO_STDLIB_PACKAGES } from "../../languages";

// Package declaration: package main
// Note: PACKAGE_PATTERN could be used for future package-level analysis
// const PACKAGE_PATTERN = /^package\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*$/m;

// Import patterns:
// - Single: import "fmt"
// - Grouped: import ( "fmt" \n "os" )
// - Aliased: import m "project/models"
const SINGLE_IMPORT_PATTERN = /^import\s+(?:([a-zA-Z_][a-zA-Z0-9_]*)\s+)?"([^"]+)"\s*$/gm;
const GROUPED_IMPORT_START = /^import\s*\(\s*$/m;
const GROUPED_IMPORT_LINE = /^\s*(?:([a-zA-Z_][a-zA-Z0-9_]*)\s+)?"([^"]+)"\s*$/;

// Public symbol patterns (capitalized identifiers are public in Go)
// func FunctionName(...)
// type TypeName struct/interface/...
// const ConstName = ...
// var VarName = ...
const FUNC_PATTERN = /((?:\/\/[^\n]*\n)*)\s*func\s+(?:\([^)]*\)\s+)?([A-Z][A-Za-z0-9_]*)\s*\(/g;
const TYPE_PATTERN = /((?:\/\/[^\n]*\n)*)\s*type\s+([A-Z][A-Za-z0-9_]*)\s+(struct|interface|[^\s{]+)/g;
const CONST_VAR_PATTERN = /((?:\/\/[^\n]*\n)*)\s*(?:const|var)\s+([A-Z][A-Za-z0-9_]*)\s+/g;
// Grouped const/var blocks: const ( ... ) or var ( ... )
const CONST_VAR_BLOCK_START = /(?:const|var)\s*\(\s*/g;
// Constants/vars inside blocks: Name Type = value (with optional preceding comment)
const CONST_VAR_BLOCK_ENTRY = /((?:\/\/[^\n]*\n)*)\s*([A-Z][A-Za-z0-9_]*)\s+[^=\s]+\s*=/g;

/**
 * Determines if a Go import path is from the standard library.
 * 
 * Standard library packages:
 * - Don't contain dots in the first segment (no domain)
 * - Match known stdlib package prefixes
 */
function isStdlibPackage(importPath: string): boolean {
  // Check direct match
  if (GO_STDLIB_PACKAGES.has(importPath)) {
    return true;
  }
  
  // Standard library packages don't have dots in the first segment
  const firstSlash = importPath.indexOf("/");
  const firstSegment = firstSlash === -1 ? importPath : importPath.slice(0, firstSlash);
  
  // External packages typically have domains: github.com/..., golang.org/...
  if (firstSegment.includes(".")) {
    return false;
  }
  
  // Check if it's a subpackage of a known stdlib package
  for (const stdlib of GO_STDLIB_PACKAGES) {
    if (importPath.startsWith(stdlib + "/")) {
      return true;
    }
  }
  
  // Single-segment packages without dots are likely stdlib
  if (!importPath.includes("/") && !importPath.includes(".")) {
    return true;
  }
  
  return false;
}

/**
 * Extracts the module name from go.mod if present.
 */
async function findModuleName(absolutePath: string): Promise<string | undefined> {
  let dir = path.dirname(absolutePath);
  const root = path.parse(dir).root;
  
  while (dir !== root) {
    const goModPath = path.join(dir, "go.mod");
    if (existsSync(goModPath)) {
      const content = await fs.readFile(goModPath, "utf8");
      const match = /^module\s+([^\s]+)/m.exec(content);
      return match?.[1];
    }
    dir = path.dirname(dir);
  }
  
  return undefined;
}

/**
 * Finds the directory containing go.mod.
 */
function findModuleRoot(absolutePath: string): string | undefined {
  let dir = path.dirname(absolutePath);
  const root = path.parse(dir).root;
  
  while (dir !== root) {
    const goModPath = path.join(dir, "go.mod");
    if (existsSync(goModPath)) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  
  return undefined;
}

/**
 * Resolves a Go import path to a workspace-relative file path.
 * 
 * Go packages can be resolved when:
 * 1. The import matches the module name from go.mod (e.g., "rosetta/models")
 * 2. The import is a relative path within the same module
 * 
 * Returns the path to the package directory's main .go file if found.
 */
function resolveGoImport(
  importPath: string,
  moduleName: string | undefined,
  moduleRoot: string | undefined,
  workspaceRoot: string
): string | undefined {
  if (!moduleName || !moduleRoot) {
    return undefined;
  }
  
  // Check if import starts with our module name
  if (!importPath.startsWith(moduleName)) {
    return undefined;
  }
  
  // Extract the relative package path: rosetta/models → models
  const relativePkg = importPath.slice(moduleName.length);
  const pkgPath = relativePkg.startsWith("/") ? relativePkg.slice(1) : relativePkg;
  
  // The package directory
  const pkgDir = pkgPath ? path.join(moduleRoot, pkgPath) : moduleRoot;
  
  if (!existsSync(pkgDir)) {
    return undefined;
  }
  
  // Find a .go file in the package directory (prefer one matching the package name)
  try {
    const files = readdirSync(pkgDir);
    const goFiles = files.filter((f) => f.endsWith(".go") && !f.endsWith("_test.go"));
    
    if (goFiles.length === 0) {
      return undefined;
    }
    
    // Prefer a file named after the package
    const baseName = path.basename(pkgDir);
    const preferredFile = goFiles.find((f) => f === `${baseName}.go`) ?? goFiles[0];
    
    const targetPath = path.join(pkgDir, preferredFile);
    return path.relative(workspaceRoot, targetPath).replace(/\\/g, "/");
  } catch {
    return undefined;
  }
}

/**
 * Extracts the package name from a Go import path for symbol resolution.
 * 
 * Import paths like "rosetta/models" import a package, and Go imports 
 * the package as a whole - you access symbols via packageName.Symbol.
 * 
 * This function scans the file content for `packageName.Symbol` usage patterns
 * to determine which specific symbols are actually used from the imported package.
 * 
 * @param importPath - The Go import path (e.g., "rosetta/models")
 * @param alias - Optional alias used for the import (e.g., "m" in `import m "rosetta/models"`)
 * @param content - The full source file content to scan for symbol usage
 * @returns Array of symbol names actually used from the package
 */
function extractImportedSymbols(importPath: string, alias: string | undefined, content: string): string[] {
  // Determine the package accessor name:
  // - If aliased: use the alias (e.g., `m.Record`)
  // - Otherwise: use the last segment of the import path (e.g., `models.Record`)
  const packageName = alias || importPath.split("/").pop() || "";
  
  if (!packageName) {
    return [];
  }
  
  // Scan for packageName.Symbol patterns
  // Go exported symbols start with uppercase letters
  const usagePattern = new RegExp(`\\b${escapeRegExp(packageName)}\\.([A-Z][a-zA-Z0-9_]*)`, "g");
  const symbols = new Set<string>();
  
  let match: RegExpExecArray | null;
  while ((match = usagePattern.exec(content)) !== null) {
    symbols.add(match[1]);
  }
  
  return Array.from(symbols).sort();
}

/**
 * Escapes special regex characters in a string.
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Language adapter for Go (`.go`). Extracts functions, types, constants, variables, and `import` dependencies. */
export const goAdapter: LanguageAdapter = {
  id: "go-basic",
  extensions: [".go"],
  
  async analyze({ absolutePath, workspaceRoot }): Promise<SourceAnalysisResult | null> {
    const content = await fs.readFile(absolutePath, "utf8");
    const isTestFile = absolutePath.endsWith("_test.go");
    
    // Test files export no public symbols but do have dependencies
    const symbols = isTestFile ? [] : extractSymbols(content);
    
    // Find module info for import resolution
    const moduleName = await findModuleName(absolutePath);
    const moduleRoot = findModuleRoot(absolutePath);
    
    // Extract cross-package import dependencies
    const importDependencies = extractDependencies(content, moduleName, moduleRoot, workspaceRoot);
    
    // Extract same-package symbol reference dependencies
    const samePackageDependencies = await extractSamePackageDependencies(
      absolutePath,
      content,
      workspaceRoot
    );
    
    // Merge dependencies, preferring import-based edges for duplicates
    const dependencyMap = new Map<string, DependencyEntry>();
    for (const dep of [...samePackageDependencies, ...importDependencies]) {
      const key = dep.resolvedPath || dep.specifier;
      const existing = dependencyMap.get(key);
      if (!existing) {
        dependencyMap.set(key, dep);
      } else {
        // Merge symbols
        const mergedSymbols = new Set([...existing.symbols, ...dep.symbols]);
        existing.symbols = Array.from(mergedSymbols).sort();
      }
    }
    
    const dependencies = Array.from(dependencyMap.values())
      .sort((a, b) => (a.resolvedPath || a.specifier).localeCompare(b.resolvedPath || b.specifier));
    
    return {
      symbols,
      dependencies
    };
  }
};

function extractSymbols(content: string): PublicSymbolEntry[] {
  const results: PublicSymbolEntry[] = [];
  let match: RegExpExecArray | null;
  
  // Extract functions (including methods)
  while ((match = FUNC_PATTERN.exec(content)) !== null) {
    const docComment = match[1]?.trim();
    const name = match[2];
    const declarationIndex = match.index + (match[1]?.length ?? 0);
    const { line, character } = computePosition(content, declarationIndex);
    
    results.push({
      name,
      kind: "function",
      location: { line, character },
      documentation: parseGoDoc(docComment)
    });
  }
  FUNC_PATTERN.lastIndex = 0;
  
  // Extract types (struct, interface, type aliases)
  while ((match = TYPE_PATTERN.exec(content)) !== null) {
    const docComment = match[1]?.trim();
    const name = match[2];
    const typeKind = match[3].trim();
    const declarationIndex = match.index + (match[1]?.length ?? 0);
    const { line, character } = computePosition(content, declarationIndex);
    
    let kind: string;
    if (typeKind === "struct") {
      kind = "struct";
    } else if (typeKind === "interface") {
      kind = "interface";
    } else {
      kind = "type";
    }
    
    results.push({
      name,
      kind,
      location: { line, character },
      documentation: parseGoDoc(docComment)
    });
  }
  TYPE_PATTERN.lastIndex = 0;
  
  // Extract constants and variables (standalone)
  while ((match = CONST_VAR_PATTERN.exec(content)) !== null) {
    const docComment = match[1]?.trim();
    const name = match[2];
    const declarationIndex = match.index + (match[1]?.length ?? 0);
    const { line, character } = computePosition(content, declarationIndex);
    
    results.push({
      name,
      kind: "constant",
      location: { line, character },
      documentation: parseGoDoc(docComment)
    });
  }
  CONST_VAR_PATTERN.lastIndex = 0;
  
  // Extract constants and variables from grouped blocks: const ( ... ) or var ( ... )
  let blockMatch: RegExpExecArray | null;
  while ((blockMatch = CONST_VAR_BLOCK_START.exec(content)) !== null) {
    const blockStartIndex = blockMatch.index + blockMatch[0].length;
    const blockEndIndex = content.indexOf(")", blockStartIndex);
    if (blockEndIndex === -1) continue;
    
    const blockContent = content.slice(blockStartIndex, blockEndIndex);
    // Offset for computing positions within the block
    const blockOffset = blockStartIndex;
    
    // Reset the entry pattern for each block
    CONST_VAR_BLOCK_ENTRY.lastIndex = 0;
    let entryMatch: RegExpExecArray | null;
    while ((entryMatch = CONST_VAR_BLOCK_ENTRY.exec(blockContent)) !== null) {
      const docComment = entryMatch[1]?.trim();
      const name = entryMatch[2];
      // Check if this name was already extracted (avoid duplicates)
      if (results.some(r => r.name === name)) continue;
      
      const declarationIndex = blockOffset + entryMatch.index + (entryMatch[1]?.length ?? 0);
      const { line, character } = computePosition(content, declarationIndex);
      
      results.push({
        name,
        kind: "constant",
        location: { line, character },
        documentation: parseGoDoc(docComment)
      });
    }
  }
  CONST_VAR_BLOCK_START.lastIndex = 0;
  
  // Sort by location
  results.sort((a, b) => {
    const lineDiff = (a.location?.line ?? 0) - (b.location?.line ?? 0);
    if (lineDiff !== 0) return lineDiff;
    return (a.location?.character ?? 0) - (b.location?.character ?? 0);
  });
  
  return results;
}

/**
 * Builds an index of exported symbols to their defining files within a package directory.
 * 
 * Go packages can span multiple files in the same directory. This function:
 * 1. Finds all .go files in the same directory (excluding _test.go)
 * 2. Extracts exported symbols (capitalized identifiers) from each
 * 3. Returns a map of symbol name → workspace-relative file path
 */
async function buildPackageSymbolIndex(
  packageDir: string,
  excludeFile: string,
  workspaceRoot: string
): Promise<Map<string, string>> {
  const index = new Map<string, string>();
  
  try {
    const entries = readdirSync(packageDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (!entry.name.endsWith(".go")) continue;
      if (entry.name.endsWith("_test.go")) continue;
      
      const filePath = path.join(packageDir, entry.name);
      if (filePath === excludeFile) continue;
      
      const content = await fs.readFile(filePath, "utf8");
      const symbols = extractSymbols(content);
      const relativePath = path.relative(workspaceRoot, filePath).replace(/\\/g, "/");
      
      for (const symbol of symbols) {
        // First definition wins (consistent with Go's single-package namespace)
        if (!index.has(symbol.name)) {
          index.set(symbol.name, relativePath);
        }
      }
    }
  } catch {
    // Directory read failed, return empty index
  }
  
  return index;
}

/**
 * Extracts dependencies from same-package symbol references.
 * 
 * In Go, files in the same directory share a package namespace. When file A
 * references an exported symbol defined in file B, we create a dependency edge.
 * 
 * @example
 * // bench_test.go contains: router := NewRouter()
 * // mux.go exports: func NewRouter() *Router
 * // → Edge: bench_test.go → mux.go (symbols: ["NewRouter"])
 */
async function extractSamePackageDependencies(
  absolutePath: string,
  content: string,
  workspaceRoot: string
): Promise<DependencyEntry[]> {
  const packageDir = path.dirname(absolutePath);
  const symbolIndex = await buildPackageSymbolIndex(packageDir, absolutePath, workspaceRoot);
  
  if (symbolIndex.size === 0) {
    return [];
  }
  
  // Build a map of target file → symbols referenced from this file
  const targetSymbols = new Map<string, Set<string>>();
  
  for (const [symbolName, targetPath] of symbolIndex) {
    // Check if this symbol is referenced in the current file
    // Match word boundaries to avoid partial matches
    const pattern = new RegExp(`\\b${escapeRegExp(symbolName)}\\b`);
    if (pattern.test(content)) {
      const existing = targetSymbols.get(targetPath) ?? new Set<string>();
      existing.add(symbolName);
      targetSymbols.set(targetPath, existing);
    }
  }
  
  // Convert to DependencyEntry array
  return Array.from(targetSymbols.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([targetPath, symbols]) => ({
      specifier: targetPath,
      resolvedPath: targetPath,
      symbols: Array.from(symbols).sort(),
      kind: "import" as const
    }));
}

function extractDependencies(
  content: string,
  moduleName: string | undefined,
  moduleRoot: string | undefined,
  workspaceRoot: string
): DependencyEntry[] {
  const imports = new Map<string, { alias?: string }>();
  
  // Handle single imports: import "fmt" or import m "pkg/models"
  let match: RegExpExecArray | null;
  while ((match = SINGLE_IMPORT_PATTERN.exec(content)) !== null) {
    const alias = match[1];
    const importPath = match[2];
    if (importPath && !isStdlibPackage(importPath)) {
      imports.set(importPath, { alias });
    }
  }
  SINGLE_IMPORT_PATTERN.lastIndex = 0;
  
  // Handle grouped imports: import ( ... )
  const groupedMatch = GROUPED_IMPORT_START.exec(content);
  if (groupedMatch) {
    const startIndex = groupedMatch.index + groupedMatch[0].length;
    const endIndex = content.indexOf(")", startIndex);
    if (endIndex !== -1) {
      const groupContent = content.slice(startIndex, endIndex);
      const lines = groupContent.split("\n");
      for (const line of lines) {
        const lineMatch = GROUPED_IMPORT_LINE.exec(line);
        if (lineMatch) {
          const alias = lineMatch[1];
          const importPath = lineMatch[2];
          if (importPath && !isStdlibPackage(importPath)) {
            imports.set(importPath, { alias });
          }
        }
      }
    }
  }
  
  // Convert to DependencyEntry array
  return Array.from(imports.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([importPath, { alias }]) => ({
      specifier: importPath,
      resolvedPath: resolveGoImport(importPath, moduleName, moduleRoot, workspaceRoot),
      symbols: extractImportedSymbols(importPath, alias, content),
      kind: "import" as const
    }));
}

function computePosition(content: string, index: number): { line: number; character: number } {
  let line = 1;
  let lastLineStart = 0;
  
  for (let i = 0; i < index; i++) {
    if (content[i] === "\n") {
      line++;
      lastLineStart = i + 1;
    }
  }
  
  return {
    line,
    character: index - lastLineStart + 1
  };
}

function parseGoDoc(raw?: string): SymbolDocumentation | undefined {
  if (!raw) {
    return undefined;
  }
  
  // Go doc comments are lines starting with //
  const lines = raw
    .split("\n")
    .map(line => line.replace(/^\/\/\s?/, "").trim())
    .filter(line => line.length > 0);
  
  if (lines.length === 0) {
    return undefined;
  }
  
  // First paragraph is the summary
  const summaryLines: string[] = [];
  const remarkLines: string[] = [];
  let inRemarks = false;
  
  for (const line of lines) {
    if (!inRemarks && line === "") {
      inRemarks = true;
      continue;
    }
    
    if (inRemarks) {
      remarkLines.push(line);
    } else {
      summaryLines.push(line);
    }
  }
  
  const summary = summaryLines.join(" ").trim();
  const remarks = remarkLines.join("\n").trim();
  
  if (!summary && !remarks) {
    return undefined;
  }
  
  return {
    source: "godoc",
    summary: summary || undefined,
    remarks: remarks || undefined
  };
}
