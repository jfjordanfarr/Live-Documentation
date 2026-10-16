/**
 * The PowerShell adapter, held to PowerShell's own parser. For every
 * PowerShell fixture that carries `expected/powershell-ast.json`, written by
 * `npm run oracle:index` at development time, the adapter reads each file as
 * the generator has it read, with the fixture's files as the workspace's
 * index, and what it reports is set beside what the parser said: of a script
 * or module, the functions it publishes and the classes and enums it defines,
 * by name, line and column, the functions with their help, the dependencies,
 * by specifier and resolved file, and the program mark of a script; of a
 * `.psd1`, whether its table, as `Import-PowerShellDataFile` read it, makes it
 * a module manifest, and then the module it publishes, the files and modules
 * it names and the root module it declares. Nothing here runs `pwsh`.
 *
 * Where they disagree the disagreement is listed, in words, and the list must
 * equal the register below exactly: a miss fixed, or a new one, fails the
 * test until the register says so. Each entry names the construct that
 * causes it.
 */
import * as fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { powershellAdapter } from "@live-documentation/engine/live-docs/adapters/powershell";
import type { DependencyEntry, PublicSymbolEntry, SourceAnalysisResult, SymbolDocumentation } from "@live-documentation/engine/live-docs/core";

import { readPowerShellAst } from "../../../scripts/oracle/files";
import { isDataFileFacts, type PowerShellDataFileFacts, type PowerShellHelp, type PowerShellScriptFacts } from "../../../scripts/oracle/powershell-edges";

const INTEGRATION_ROOT = path.resolve(__dirname, "..");

/**
 * The measured misses, fixture by fixture. None remains since the engine
 * builds its own PowerShell grammar (`packages/engine/grammars/powershell`),
 * which reads the comma lists, variable-led paths and `using` statements the
 * bundled grammar could not.
 */
const MEASURED_MISSES: Record<string, string[]> = {
  "programs/powershell/rollout": [],
  "fixtures/powershell-compendium": []
};

/** The fixtures that carry the parser's record. */
function measuredFixtures(): string[] {
  return Object.keys(MEASURED_MISSES).filter((fixture) => fs.existsSync(path.join(INTEGRATION_ROOT, fixture, "expected", "powershell-ast.json")));
}

/** Every file of a fixture, fixture-relative, as the generator's index holds a workspace's files. */
function fileIndex(fixtureDir: string): Set<string> {
  const entries = fs.readdirSync(fixtureDir, { recursive: true, withFileTypes: true });
  return new Set(entries.filter((entry) => entry.isFile()).map((entry) => path.relative(fixtureDir, path.join(entry.parentPath, entry.name)).split(path.sep).join("/")));
}

function normalizeHelpText(text: string | null): string | undefined {
  const normalized = text?.replace(/\r?\n/g, "\n").trim();
  return normalized ? normalized : undefined;
}

/** The documentation the parser's help makes, in the form the docs carry it. */
function expectedDocumentation(help: PowerShellHelp | null): SymbolDocumentation | undefined {
  if (!help) return undefined;
  const summary    = normalizeHelpText(help.synopsis);
  const remarks    = normalizeHelpText(help.description);
  const parameters = help.parameters.map((parameter) => {
    const description = normalizeHelpText(parameter.description);
    return description ? { name: parameter.name, description } : { name: parameter.name };
  });
  if (!summary && !remarks && parameters.length === 0) return undefined;
  return { source: "comment-help", summary, remarks, parameters: parameters.length > 0 ? parameters : undefined };
}

interface Dependency {
  specifier: string;
  resolved?: string;
}

/** The dependencies the parser's record makes: module imports, `using module`, `#requires` and dot-sources, a resolved one under its file. */
function expectedDependencies(facts: PowerShellScriptFacts): Dependency[] {
  const written: Array<{ text: string | null; resolved: string | null }> = [
    ...facts.importModules.flatMap((command) => command.names.map((name) => ({ text: name.name, resolved: name.resolved }))),
    ...facts.usingStatements.filter((using) => using.kind === "Module").map((using) => ({ text: using.name, resolved: using.resolved })),
    ...facts.requiredModules.map((module) => ({ text: module.name, resolved: module.resolved })),
    ...facts.dotSources.map((dotSource) => ({ text: dotSource.target, resolved: dotSource.resolved }))
  ];
  const dependencies = new Map<string, Dependency>();
  for (const { text, resolved } of written) {
    const specifier = resolved ?? text?.trim();
    if (specifier && !dependencies.has(specifier)) dependencies.set(specifier, resolved ? { specifier, resolved } : { specifier });
  }
  return Array.from(dependencies.values());
}

const describeDependency = (dependency: Dependency): string => `${dependency.specifier}${dependency.resolved ? " (resolved)" : ""}`;

/** Every way the adapter's dependencies differ from the expected ones, in words. */
function compareDependencies(file: string, wanted: Dependency[], dependencies: DependencyEntry[]): string[] {
  const found: string[] = [];
  const actual = dependencies.map((dependency): Dependency => (dependency.resolvedPath ? { specifier: dependency.specifier, resolved: dependency.resolvedPath } : { specifier: dependency.specifier }));
  const key    = (dependency: Dependency): string => `${dependency.specifier}|${dependency.resolved ?? ""}`;
  for (const dependency of wanted) {
    if (!actual.some((candidate) => key(candidate) === key(dependency))) found.push(`${file}: PowerShell depends on ${describeDependency(dependency)}, the adapter does not`);
  }
  for (const dependency of actual) {
    if (!wanted.some((candidate) => key(candidate) === key(dependency))) found.push(`${file}: the adapter depends on ${describeDependency(dependency)}, PowerShell does not`);
  }
  return found;
}

/** Every way the adapter's reading of a script or module differs from the parser's, in words. */
function compareScript(file: string, facts: PowerShellScriptFacts, analysis: SourceAnalysisResult): string[] {
  const found: string[] = [];
  const expected = [
    ...facts.functions.filter((fact) => !fact.member && facts.published.includes(fact.name)).map((fact) => ({ name: fact.name, kind: "function", line: fact.line, column: fact.column, help: fact.help })),
    ...facts.types.map((type) => ({ name: type.name, kind: type.kind, line: type.line, column: type.column, help: null }))
  ];

  const remaining: PublicSymbolEntry[] = [...analysis.symbols];
  for (const fact of expected) {
    const index = remaining.findIndex((symbol) => symbol.name === fact.name && symbol.kind === fact.kind);
    if (index === -1) {
      found.push(`${file}: PowerShell defines ${fact.kind} ${fact.name}, the adapter does not report it`);
      continue;
    }
    const [symbol] = remaining.splice(index, 1);
    const where = `${symbol.location?.line}:${symbol.location?.character}`;
    if (where !== `${fact.line}:${fact.column}`) {
      found.push(`${file}: ${fact.name} stands at ${fact.line}:${fact.column} for PowerShell, at ${where} for the adapter`);
    }
    const documentation = expectedDocumentation(fact.help);
    if (JSON.stringify(symbol.documentation) !== JSON.stringify(documentation)) {
      found.push(`${file}: ${fact.name}'s help is ${JSON.stringify(documentation)} for PowerShell, ${JSON.stringify(symbol.documentation)} for the adapter`);
    }
  }
  for (const symbol of remaining) found.push(`${file}: the adapter reports ${symbol.kind} ${symbol.name}, PowerShell does not`);

  found.push(...compareDependencies(file, expectedDependencies(facts), analysis.dependencies));
  const program = analysis.program !== undefined;
  if (program !== file.endsWith(".ps1")) found.push(`${file}: the adapter ${program ? "marks" : "does not mark"} it as the program's entry`);
  return found;
}

/** The keys of a table as PowerShell read it, lower-cased, as PowerShell's hashtables compare them. */
function tableKeys(data: unknown): Set<string> {
  return new Set(data && typeof data === "object" && !Array.isArray(data) ? Object.keys(data).map((key) => key.toLowerCase()) : []);
}

/** Every way the adapter's reading of a `.psd1` differs from what PowerShell's reading of its table makes of it, in words. */
function compareDataFile(file: string, facts: PowerShellDataFileFacts, analysis: SourceAnalysisResult): string[] {
  const keys     = tableKeys(facts.data);
  const manifest = ["rootmodule", "moduletoprocess", "moduleversion", "functionstoexport"].some((key) => keys.has(key));
  if (!manifest) {
    return JSON.stringify(analysis) === JSON.stringify({ symbols: [], dependencies: [] }) ? [] : [`${file}: a data file, of which the adapter reports ${JSON.stringify(analysis)}`];
  }
  const found: string[] = [];
  const module = path.posix.basename(file).replace(/\.psd1$/i, "");
  const symbols = analysis.symbols.map((symbol) => `${symbol.kind} ${symbol.name}`);
  if (JSON.stringify(symbols) !== JSON.stringify([`package ${module}`])) found.push(`${file}: a manifest of module ${module}, for which the adapter reports ${JSON.stringify(symbols)}`);

  const wanted = new Map<string, Dependency>();
  for (const reference of facts.references) {
    if (reference.resolved === file) continue;
    const dependency = reference.resolved
      ? { specifier: reference.resolved, resolved: reference.resolved }
      : { specifier: reference.version ? `${reference.value}@${reference.version}` : reference.value };
    wanted.set(dependency.specifier, dependency);
  }
  found.push(...compareDependencies(file, Array.from(wanted.values()), analysis.dependencies));

  const root     = facts.references.find((reference) => (reference.key === "RootModule" || reference.key === "ModuleToProcess") && reference.resolved && reference.resolved !== file)?.resolved;
  const declares = JSON.stringify(analysis.declares ?? []);
  const expected = JSON.stringify(root ? [{ reason: "module", file: root }] : []);
  if (declares !== expected) found.push(`${file}: declares ${expected} for PowerShell, ${declares} for the adapter`);
  return found;
}

describe("the PowerShell adapter against PowerShell's parser", () => {
  it("finds the fixtures that carry the parser's record", () => {
    expect(measuredFixtures()).toEqual(Object.keys(MEASURED_MISSES));
  });

  for (const fixture of measuredFixtures()) {
    it(`agrees with the parser on ${fixture}, but for its measured misses`, async () => {
      const fixtureDir = path.join(INTEGRATION_ROOT, fixture);
      const ast        = readPowerShellAst(path.join(fixtureDir, "expected", "powershell-ast.json"), fixtureDir)!;
      const files      = fileIndex(fixtureDir);
      const found: string[] = [];
      for (const [file, facts] of Object.entries(ast.files)) {
        const analysis = (await powershellAdapter.analyze({ absolutePath: path.join(fixtureDir, file), workspaceRoot: fixtureDir, fileIndex: files }))!;
        found.push(...(isDataFileFacts(facts) ? compareDataFile(file, facts, analysis) : compareScript(file, facts, analysis)));
      }
      expect(found).toEqual(MEASURED_MISSES[fixture]);
    });
  }
});
