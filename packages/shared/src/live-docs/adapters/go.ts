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

// Standard library packages (partial list - major ones)
const GO_STDLIB_PACKAGES = new Set([
  "fmt", "os", "io", "bufio", "bytes", "strings", "strconv",
  "errors", "log", "time", "math", "rand", "sort", "sync",
  "context", "net", "http", "json", "xml", "html", "template",
  "regexp", "path", "filepath", "flag", "testing", "reflect",
  "runtime", "unsafe", "syscall", "encoding", "crypto", "hash",
  "compress", "archive", "database", "image", "text", "unicode",
  // Common subpackages
  "net/http", "net/url", "io/ioutil", "io/fs", "path/filepath",
  "encoding/json", "encoding/xml", "encoding/base64", "encoding/hex",
  "crypto/sha256", "crypto/md5", "crypto/tls", "crypto/rand",
  "database/sql", "html/template", "text/template", "log/slog"
]);

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
 * Since Go doesn't have selective imports (import { specific } from),
 * we return an empty array to indicate whole-package import.
 */
function extractImportedSymbols(_importPath: string, _alias: string | undefined): string[] {
  // Go imports entire packages, not individual symbols
  // If there's an alias, the code uses alias.Symbol
  // If no alias, the code uses packageName.Symbol
  // Either way, we can't determine which specific symbols are used from the import alone
  return [];
}

export const goAdapter: LanguageAdapter = {
  id: "go-basic",
  extensions: [".go"],
  
  async analyze({ absolutePath, workspaceRoot }): Promise<SourceAnalysisResult | null> {
    const content = await fs.readFile(absolutePath, "utf8");
    
    // Skip test files
    if (absolutePath.endsWith("_test.go")) {
      return null;
    }
    
    const symbols = extractSymbols(content);
    
    // Find module info for import resolution
    const moduleName = await findModuleName(absolutePath);
    const moduleRoot = findModuleRoot(absolutePath);
    
    const dependencies = extractDependencies(content, moduleName, moduleRoot, workspaceRoot);
    
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
  
  // Extract constants and variables
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
  
  // Sort by location
  results.sort((a, b) => {
    const lineDiff = (a.location?.line ?? 0) - (b.location?.line ?? 0);
    if (lineDiff !== 0) return lineDiff;
    return (a.location?.character ?? 0) - (b.location?.character ?? 0);
  });
  
  return results;
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
      symbols: extractImportedSymbols(importPath, alias),
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
