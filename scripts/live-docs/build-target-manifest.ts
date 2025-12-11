#!/usr/bin/env node
import { glob } from "glob";
import * as fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  normalizeLiveDocumentationConfig
} from "@live-documentation/shared/config/liveDocumentationConfig";
import { normalizeWorkspacePath } from "@live-documentation/shared/tooling/pathUtils";

const SUPPORTED_SCRIPT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs"
]);

const MODULE_RESOLUTION_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json"
];

type ManifestSuiteKind = "unit" | "integration";

interface ManifestTestEntry {
  path: string;
  targets: string[];
  fixtures: string[];
}

interface TestAccumulator {
  path: string;
  targets: Set<string>;
  fixtures: Set<string>;
}

interface SuiteAccumulator {
  suite: string;
  kind: ManifestSuiteKind;
  tests: TestAccumulator[];
}

interface PathAliasEntry {
  pattern: string;
  matcher: RegExp;
  targetPatterns: string[];
  wildcardCount: number;
}

interface ModuleResolutionContext {
  workspaceRoot: string;
  baseUrl: string;
  aliases: PathAliasEntry[];
}

function collectModuleSpecifiers(node: ts.Node, accumulator: Set<string>): void {
  if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
    accumulator.add(node.moduleSpecifier.text);
  } else if (
    ts.isExportDeclaration(node) &&
    node.moduleSpecifier &&
    ts.isStringLiteral(node.moduleSpecifier)
  ) {
    accumulator.add(node.moduleSpecifier.text);
  } else if (
    ts.isCallExpression(node) &&
    node.expression.kind === ts.SyntaxKind.ImportKeyword &&
    node.arguments.length > 0
  ) {
    const candidate = node.arguments[0];
    if (ts.isStringLiteralLike(candidate)) {
      accumulator.add(candidate.text);
    }
  }

  node.forEachChild((child) => collectModuleSpecifiers(child, accumulator));
}

async function main(): Promise<void> {
  const workspaceRoot = process.cwd();
  const config = normalizeLiveDocumentationConfig({
    ...DEFAULT_LIVE_DOCUMENTATION_CONFIG
  });

  const resolution = await createModuleResolutionContext(workspaceRoot);

  const candidates = await discoverTestFiles(workspaceRoot, config.glob);
  if (candidates.length === 0) {
    console.warn("[live-docs] No test files discovered for manifest generation.");
    await writeManifest(workspaceRoot, { version: 1, suites: [] });
    return;
  }

  const suites = new Map<string, SuiteAccumulator>();

  for (const absolutePath of candidates) {
    const relative = normalizeWorkspacePath(path.relative(workspaceRoot, absolutePath));
    const analysis = await analyzeTestFile({
      absolutePath,
      workspaceRoot,
      resolution
    });
    if (!analysis) {
      continue;
    }

    const { suite, kind } = classifyTest(relative);
    const key = `${kind}:${suite}`;
    const accumulator = suites.get(key) ?? { suite, kind, tests: [] };

    accumulator.tests.push({
      path: relative,
      targets: analysis.targets,
      fixtures: analysis.fixtures
    });

    suites.set(key, accumulator);
  }

  for (const suite of suites.values()) {
    for (const test of suite.tests) {
      if (test.targets.size === 0) {
        continue;
      }
      await expandTargetsWithDependencies({
        targets: test.targets,
        workspaceRoot,
        resolution
      });
    }
  }

  const manifest = {
    version: 1,
    suites: Array.from(suites.values())
      .map((suite) => ({
        suite: suite.suite,
        kind: suite.kind,
        tests: suite.tests
          .map((entry): ManifestTestEntry => ({
            path: entry.path,
            targets: Array.from(entry.targets).sort(),
            fixtures: Array.from(entry.fixtures).sort()
          }))
          .filter((entry) => entry.targets.length > 0 || entry.fixtures.length > 0)
          .sort((a, b) => a.path.localeCompare(b.path))
      }))
      .filter((suite) => suite.tests.length > 0)
      .sort((a, b) => a.suite.localeCompare(b.suite))
  };

  await writeManifest(workspaceRoot, manifest);
}

async function discoverTestFiles(workspaceRoot: string, globs: string[]): Promise<string[]> {
  const results = new Set<string>();

  const testGlobs = [
    ...globs,
    "packages/**/__tests__/**/*.{ts,tsx,js,jsx,mts,cts}",
    "packages/**/*.test.{ts,tsx,js,jsx,mts,cts}",
    "packages/**/*.spec.{ts,tsx,js,jsx,mts,cts}",
    "tests/**/*.{ts,tsx,js,jsx,mts,cts}",
    "scripts/**/*.test.{ts,tsx,js,jsx,mts,cts}"
  ];

  for (const pattern of testGlobs) {
    const matches = await glob(pattern, {
      cwd: workspaceRoot,
      absolute: true,
      nodir: true,
      windowsPathsNoEscape: true
    });
    for (const match of matches) {
      const normalized = path.resolve(workspaceRoot, match);
      if (isTestFile(normalized)) {
        results.add(normalized);
      }
    }
  }

  return Array.from(results).sort();
}

function isTestFile(absolutePath: string): boolean {
  const ext = path.extname(absolutePath).toLowerCase();
  if (!SUPPORTED_SCRIPT_EXTENSIONS.has(ext)) {
    return false;
  }
  const lowered = absolutePath.replace(/\\/g, "/");
  return (
    /(^|\/)__tests__\//.test(lowered) ||
    /\.(test|spec)\.[cm]?[jt]sx?$/.test(lowered)
  );
}

interface TestAnalysis {
  targets: Set<string>;
  fixtures: Set<string>;
}

async function analyzeTestFile(params: {
  absolutePath: string;
  workspaceRoot: string;
  resolution: ModuleResolutionContext;
}): Promise<TestAnalysis | undefined> {
  try {
    const { absolutePath, workspaceRoot, resolution } = params;
    const extension = path.extname(absolutePath).toLowerCase();
    if (!SUPPORTED_SCRIPT_EXTENSIONS.has(extension)) {
      return undefined;
    }

    const content = await fs.readFile(absolutePath, "utf8");
    const scriptKind = inferScriptKind(extension);
    const sourceFile = ts.createSourceFile(absolutePath, content, ts.ScriptTarget.Latest, true, scriptKind);

    const targets = new Set<string>();
    const fixtures = new Set<string>();

    const specifiers = new Set<string>();
    collectModuleSpecifiers(sourceFile, specifiers);
    for (const specifier of specifiers) {
      await ingestSpecifier({
        specifier,
        fromFile: absolutePath,
        workspaceRoot,
        targets,
        fixtures,
        resolution
      });
    }

    return { targets, fixtures };
  } catch (error) {
    console.warn(
      `[live-docs] Failed to analyze ${params.absolutePath}: ${(error as Error).message}`
    );
    return undefined;
  }
}

async function ingestSpecifier(params: {
  specifier: string;
  fromFile: string;
  workspaceRoot: string;
  targets: Set<string>;
  fixtures: Set<string>;
  resolution: ModuleResolutionContext;
}): Promise<void> {
  const resolved = await resolveModuleSpecifier({
    specifier: params.specifier,
    fromFile: params.fromFile,
    resolution: params.resolution
  });
  if (!resolved) {
    return;
  }

  if (!resolved.startsWith(params.resolution.workspaceRoot)) {
    return;
  }

  const normalized = normalizeWorkspacePath(path.relative(params.workspaceRoot, resolved));

  if (isFixturePath(normalized)) {
    params.fixtures.add(normalized);
    return;
  }

  if (isTestPath(normalized)) {
    return;
  }

  params.targets.add(normalized);
}

/**
 * Detects whether a source file is a "barrel" or "index" file.
 *
 * Barrel files are characterized by:
 * - Named index.ts/index.js (or variants)
 * - OR consisting primarily of re-export statements with minimal implementation
 *
 * When expanding test dependencies transitively, we stop at barrel files
 * because they re-export many modules that the test doesn't actually use.
 */
function isBarrelFile(absolutePath: string, sourceFile: ts.SourceFile): boolean {
  const fileName = path.basename(absolutePath).toLowerCase();

  // Check filename pattern: index.ts, index.js, index.mts, etc.
  if (/^index\.[cm]?[jt]sx?$/.test(fileName)) {
    return true;
  }

  // Check content: if >80% of top-level statements are exports/re-exports, it's a barrel
  const statements = sourceFile.statements;
  if (statements.length === 0) {
    return false;
  }

  let exportStatements = 0;
  for (const statement of statements) {
    if (ts.isExportDeclaration(statement) || ts.isExportAssignment(statement)) {
      exportStatements++;
    } else if (
      ts.isImportDeclaration(statement) &&
      !statement.importClause
    ) {
      // Side-effect import like `import "./polyfill"` - not an export
      continue;
    } else if (ts.isImportDeclaration(statement)) {
      // Regular import for re-export - count as part of barrel pattern
      continue;
    } else {
      // Any other statement (function, class, variable declaration with logic)
      // indicates this is not a pure barrel
    }
  }

  // If more than 80% of non-import statements are exports, treat as barrel
  const nonImportStatements = statements.filter((s) => !ts.isImportDeclaration(s));
  if (nonImportStatements.length === 0) {
    return false;
  }

  return exportStatements / nonImportStatements.length >= 0.8;
}

async function expandTargetsWithDependencies(params: {
  targets: Set<string>;
  workspaceRoot: string;
  resolution: ModuleResolutionContext;
}): Promise<void> {
  const { targets, workspaceRoot, resolution } = params;
  const queue: string[] = Array.from(targets);
  const queued = new Set(queue);
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    queued.delete(current);

    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    const absolute = path.resolve(workspaceRoot, current);
    const extension = path.extname(absolute).toLowerCase();
    if (!SUPPORTED_SCRIPT_EXTENSIONS.has(extension)) {
      continue;
    }

    let content: string;
    try {
      content = await fs.readFile(absolute, "utf8");
    } catch {
      continue;
    }

    const scriptKind = inferScriptKind(extension);
    const sourceFile = ts.createSourceFile(absolute, content, ts.ScriptTarget.Latest, true, scriptKind);

    // Skip transitive expansion through barrel files
    // Barrel files re-export many modules, but tests importing from them
    // typically only use a subset. Expanding through barrels causes false
    // positives where a test is marked as "covering" modules it never touches.
    if (isBarrelFile(absolute, sourceFile)) {
      continue;
    }

    const specifiers = new Set<string>();
    collectModuleSpecifiers(sourceFile, specifiers);
    for (const moduleSpecifier of specifiers) {
      const snapshot = new Set(targets);
      await ingestSpecifier({
        specifier: moduleSpecifier,
        fromFile: absolute,
        workspaceRoot,
        targets,
        fixtures: new Set(),
        resolution
      });

      for (const candidate of targets) {
        if (snapshot.has(candidate)) {
          continue;
        }
        if (visited.has(candidate) || queued.has(candidate)) {
          continue;
        }
        if (isFixturePath(candidate) || isTestPath(candidate)) {
          continue;
        }
        queue.push(candidate);
        queued.add(candidate);
      }
    }
  }
}

function isFixturePath(relativePath: string): boolean {
  return /\/fixtures\//.test(relativePath);
}

function isTestPath(relativePath: string): boolean {
  return (
    /(^|\/)tests\//.test(relativePath) ||
    /(^|\/)__tests__\//.test(relativePath) ||
    /\.(test|spec)\.[cm]?[jt]sx?$/.test(relativePath)
  );
}

async function resolveModuleSpecifier(params: {
  specifier: string;
  fromFile: string;
  resolution: ModuleResolutionContext;
}): Promise<string | undefined> {
  const { specifier, fromFile, resolution } = params;

  if (!specifier) {
    return undefined;
  }

  if (specifier.startsWith("node:")) {
    return undefined;
  }

  if (specifier.startsWith(".")) {
    return resolveWithExtensions(specifier, fromFile);
  }

  const aliasResolved = await resolveWithPathAliases({
    specifier,
    resolution
  });

  if (aliasResolved) {
    return aliasResolved;
  }

  return undefined;
}

async function resolveWithExtensions(specifier: string, fromFile: string): Promise<string | undefined> {
  const base = path.resolve(path.dirname(fromFile), specifier);
  return resolveAbsoluteWithExtensions(base);
}

async function fileExists(candidate: string): Promise<boolean> {
  try {
    const stats = await fs.stat(candidate);
    return stats.isFile();
  } catch {
    return false;
  }
}

async function resolveAbsoluteWithExtensions(base: string): Promise<string | undefined> {
  const explicitExt = path.extname(base);
  const attempts: string[] = [];

  if (explicitExt) {
    attempts.push(base);
  } else {
    for (const ext of MODULE_RESOLUTION_EXTENSIONS) {
      attempts.push(`${base}${ext}`);
    }
  }

  const baseWithoutExt = explicitExt ? base.slice(0, base.length - explicitExt.length) : base;
  for (const ext of MODULE_RESOLUTION_EXTENSIONS) {
    attempts.push(path.join(baseWithoutExt, `index${ext}`));
  }

  for (const candidate of attempts) {
    if (await fileExists(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

async function resolveWithPathAliases(params: {
  specifier: string;
  resolution: ModuleResolutionContext;
}): Promise<string | undefined> {
  const { specifier, resolution } = params;

  for (const alias of resolution.aliases) {
    const match = alias.matcher.exec(specifier);
    if (!match) {
      continue;
    }

    const replacements = match.slice(1);

    for (const targetPattern of alias.targetPatterns) {
      let candidateRelative = targetPattern;
      if (alias.wildcardCount > 0) {
        candidateRelative = applyWildcardReplacements(targetPattern, replacements);
      }

      const absoluteCandidate = path.resolve(resolution.baseUrl, candidateRelative);
      const resolved = await resolveAbsoluteWithExtensions(absoluteCandidate);
      if (resolved) {
        return resolved;
      }
    }
  }

  return undefined;
}

function applyWildcardReplacements(pattern: string, replacements: string[]): string {
  let result = pattern;
  for (const replacement of replacements) {
    result = result.replace("*", replacement);
  }
  return result;
}

async function createModuleResolutionContext(workspaceRoot: string): Promise<ModuleResolutionContext> {
  const tsconfigPath = path.join(workspaceRoot, "tsconfig.base.json");
  let compilerOptions: Record<string, unknown> = {};

  try {
    const raw = await fs.readFile(tsconfigPath, "utf8");
    const parsed = JSON.parse(raw) as { compilerOptions?: Record<string, unknown> };
    if (parsed.compilerOptions) {
      compilerOptions = parsed.compilerOptions;
    }
  } catch (error) {
    console.warn(
      `[live-docs] Failed to read TypeScript config for alias resolution (${tsconfigPath}): ${(error as Error).message}`
    );
  }

  const baseUrlRaw = typeof compilerOptions.baseUrl === "string" ? compilerOptions.baseUrl : ".";
  const baseUrl = path.resolve(workspaceRoot, baseUrlRaw);

  const pathsConfig = compilerOptions.paths as Record<string, string[]> | undefined;
  const aliases: PathAliasEntry[] = [];

  if (pathsConfig) {
    for (const [pattern, targets] of Object.entries(pathsConfig)) {
      if (!Array.isArray(targets) || targets.length === 0) {
        continue;
      }

      const wildcardCount = (pattern.match(/\*/g) ?? []).length;
      const matcher = new RegExp(convertTsPathPatternToRegex(pattern));
      aliases.push({
        pattern,
        matcher,
        targetPatterns: targets,
        wildcardCount
      });
    }
  }

  return {
    workspaceRoot,
    baseUrl,
    aliases
  };
}

function convertTsPathPatternToRegex(pattern: string): string {
  const escaped = pattern
    .split("*")
    .map((segment) => segment.replace(/[.+^${}()|[\]\\]/g, "\\$&"));

  if (escaped.length === 1) {
    return `^${escaped[0]}$`;
  }

  return `^${escaped[0]}${escaped
    .slice(1)
    .map((segment) => "(.+)" + segment)
    .join("")}$`;
}

function inferScriptKind(extension: string): ts.ScriptKind {
  switch (extension) {
    case ".tsx":
      return ts.ScriptKind.TSX;
    case ".jsx":
      return ts.ScriptKind.JSX;
    case ".cts":
    case ".mts":
      return ts.ScriptKind.TS;
    case ".mjs":
    case ".cjs":
      return ts.ScriptKind.JS;
    default:
      return ts.ScriptKind.TS;
  }
}

function classifyTest(relativePath: string): { suite: string; kind: ManifestSuiteKind } {
  if (relativePath.startsWith("tests/")) {
    return {
      suite: "Mocha Integration Tests",
      kind: "integration"
    };
  }

  return {
    suite: "Vitest Unit Tests",
    kind: "unit"
  };
}

async function writeManifest(workspaceRoot: string, manifest: unknown): Promise<void> {
  const canonicalPath = path.join(workspaceRoot, "data", "live-docs", "targets.json");
  const coveragePath = path.join(workspaceRoot, "coverage", "live-docs", "targets.json");

  const serialized = JSON.stringify(manifest, null, 2);

  await fs.mkdir(path.dirname(canonicalPath), { recursive: true });
  await fs.writeFile(canonicalPath, serialized, "utf8");

  await fs.mkdir(path.dirname(coveragePath), { recursive: true });
  await fs.writeFile(coveragePath, serialized, "utf8");

  console.log(`[live-docs] Wrote targets manifest to ${canonicalPath}`);
  console.log(`[live-docs] Wrote targets manifest to ${coveragePath}`);
}

main().catch((error) => {
  console.error("live-docs:build-target-manifest failed");
  if (error instanceof Error) {
    console.error(error.message);
  }
  process.exit(1);
});
