/**
 * The PowerShell adapter, held to PowerShell's own parser. For every
 * PowerShell fixture that carries `expected/powershell-ast.json`, written by
 * `npm run oracle:index` at development time, the adapter reads each file as
 * the generator has it read, with the fixture's files as the workspace's
 * index, and what it reports is set beside what the parser said: of a script
 * or module, the functions it publishes and the classes and enums it defines,
 * by name, line and column, the functions with their help, the dependencies,
 * by specifier, resolved file and the functions called there, and the program
 * mark of a script; of a `.psd1`, whether its table, as
 * `Import-PowerShellDataFile` read it, makes it a module manifest, and then the
 * module it publishes, the files and modules it names, the root module it
 * declares and the functions it offers from their origin files. Which file a
 * call reaches, which script is a library and which function a manifest offers
 * are the rules of `scripts/oracle/powershell-wires.ts` applied to the
 * parser's facts. Nothing here runs `pwsh`.
 *
 * Where they disagree the disagreement is listed, in words, and the list must
 * equal the register below exactly: a miss fixed, or a new one, fails the
 * test until the register says so. Each entry names the construct that
 * causes it.
 */
import { globSync } from "glob";
import * as fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { powershellAdapter } from "@live-documentation/engine/live-docs/adapters/powershell";
import type { DependencyEntry, PublicSymbolEntry, SourceAnalysisResult, SymbolDocumentation } from "@live-documentation/engine/live-docs/core";

import { readPowerShellAst } from "../../../scripts/oracle/files";
import { listFixtureFiles } from "../../../scripts/oracle/fixture";
import { isDataFileFacts, POWERSHELL_EXTENSIONS, type PowerShellDataFileFacts, type PowerShellHelp, type PowerShellScriptFacts } from "../../../scripts/oracle/powershell-edges";
import { isLibraryByParser, ParserWorkspace, recordedShippedNames } from "../../../scripts/oracle/powershell-wires";
import { sourceDigests, sourcesDiffer } from "../../../scripts/oracle/sources";

const INTEGRATION_ROOT = path.resolve(__dirname, "..");

/**
 * The measured misses, fixture by fixture. None remained once the engine
 * built its own PowerShell grammar (`packages/engine/grammars/powershell`),
 * which reads the comma lists, variable-led paths and `using` statements the
 * bundled grammar could not. One is the grammar's again, recorded on
 * 2026-11-19: it reads `./scripts/Clean.ps1`, a script run by its path, as the
 * dot-source `. /scripts/Clean.ps1`, so the adapter keeps a rooted path no
 * workspace holds where PowerShell runs the script beside it.
 *
 * One is a difference of platform, since 2026-11-21: a relative path without
 * its extension, `. ./build` beside both `build` and `build.ps1`, is
 * `build.ps1` on Windows and `build` on Unix, as PowerShell's own source has
 * it and as the owner's run on their Windows machine showed
 * (`expected/windows-runs.json`); the record was written by pwsh on Linux,
 * and the engine follows Windows, PowerShell's home. A rooted path,
 * `"$PSScriptRoot/build"`, is `build` on both, and agrees.
 */
const MEASURED_MISSES: Record<string, string[]> = {
  "programs/powershell/rollout": [],
  "fixtures/powershell-compendium": [],
  "fixtures/powershell-wires": [
    "Build/Use-Build.ps1: PowerShell depends on Build/build (resolved), the adapter does not",
    "Build/Use-Build.ps1: the adapter depends on Build/build.ps1 (resolved), PowerShell does not",
    "Deploy.ps1: PowerShell depends on scripts/Clean.ps1 (resolved), the adapter does not",
    "Deploy.ps1: the adapter depends on /scripts/Clean.ps1, PowerShell does not"
  ]
};

/** A run of PowerShell on Windows, kept where pwsh here answers otherwise: what a folder held beside the caller, the path written, and the file PowerShell ran. */
interface WindowsRun {
  beside: string[];
  path: string;
  runs: string;
}

/** Discover parser records independently of the register of measured misses. */
function measuredFixtures(root = INTEGRATION_ROOT): string[] {
  return globSync(["programs/**/expected/powershell-ast.json", "fixtures/**/expected/powershell-ast.json"], { cwd: root, dot: true, nodir: true })
    .map((file) => path.posix.dirname(path.posix.dirname(file.replace(/\\/gu, "/"))))
    .sort();
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
  /** The functions called in the file, sorted. */
  calls?:    string[];
}

/**
 * The dependencies the parser's record makes: module imports, `using module`,
 * `#requires`, dot-sources, loops' listings and scripts run by path, a
 * resolved one under its file and an unresolved one under its text; then the
 * files whose functions the script calls, with those functions.
 */
function expectedDependencies(file: string, facts: PowerShellScriptFacts, workspace: ParserWorkspace): Dependency[] {
  const written: Array<{ text: string | null; resolved: string | null }> = [
    ...facts.importModules.flatMap((command) => command.names.map((name) => ({ text: name.name, resolved: name.resolved }))),
    ...facts.usingStatements.filter((using) => using.kind === "Module").map((using) => ({ text: using.name, resolved: using.resolved })),
    ...facts.requiredModules.map((module) => ({ text: module.name, resolved: module.resolved })),
    ...facts.dotSources.map((dotSource) => ({ text: dotSource.target, resolved: dotSource.resolved })),
    ...facts.loads.flatMap((load) => load.resolved.map((resolved) => ({ text: null, resolved })))
  ];
  const dependencies = new Map<string, Dependency>();
  for (const { text, resolved } of written) {
    const specifier = resolved ?? text?.trim();
    if (specifier && specifier !== file && !dependencies.has(specifier)) dependencies.set(specifier, resolved ? { specifier, resolved } : { specifier });
  }
  for (const [to, names] of workspace.wiresOf(file)) {
    const calls = Array.from(names).sort();
    const existing = dependencies.get(to);
    if (existing) existing.calls = calls;
    else dependencies.set(to, { specifier: to, resolved: to, calls });
  }
  return Array.from(dependencies.values());
}

const describeDependency = (dependency: Dependency): string =>
  `${dependency.specifier}${dependency.resolved ? " (resolved)" : ""}${dependency.calls?.length ? `, calling ${dependency.calls.join(", ")}` : ""}`;

/** Every way the adapter's dependencies differ from the expected ones, in words. */
function compareDependencies(file: string, wanted: Dependency[], dependencies: DependencyEntry[]): string[] {
  const found: string[] = [];
  const actual = dependencies.map((dependency): Dependency => ({
    specifier: dependency.specifier,
    ...(dependency.resolvedPath ? { resolved: dependency.resolvedPath } : {}),
    ...(dependency.symbols.length > 0 ? { calls: [...dependency.symbols].sort() } : {})
  }));
  const key    = (dependency: Dependency): string => `${dependency.specifier}|${dependency.resolved ?? ""}|${(dependency.calls ?? []).join(",")}`;
  for (const dependency of wanted) {
    if (!actual.some((candidate) => key(candidate) === key(dependency))) found.push(`${file}: PowerShell depends on ${describeDependency(dependency)}, the adapter does not`);
  }
  for (const dependency of actual) {
    if (!wanted.some((candidate) => key(candidate) === key(dependency))) found.push(`${file}: the adapter depends on ${describeDependency(dependency)}, PowerShell does not`);
  }
  return found;
}

/** Every way the adapter's reading of a script or module differs from the parser's, in words. */
function compareScript(file: string, facts: PowerShellScriptFacts, analysis: SourceAnalysisResult, workspace: ParserWorkspace): string[] {
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

  found.push(...compareDependencies(file, expectedDependencies(file, facts, workspace), analysis.dependencies));
  const program = analysis.program !== undefined;
  if (program !== (file.endsWith(".ps1") && !isLibraryByParser(facts))) found.push(`${file}: the adapter ${program ? "marks" : "does not mark"} it as the program's entry`);
  return found;
}

/** The keys of a table as PowerShell read it, lower-cased, as PowerShell's hashtables compare them. */
function tableKeys(data: unknown): Set<string> {
  return new Set(data && typeof data === "object" && !Array.isArray(data) ? Object.keys(data).map((key) => key.toLowerCase()) : []);
}

/** Every way the adapter's reading of a `.psd1` differs from what PowerShell's reading of its table makes of it, in words. */
function compareDataFile(file: string, facts: PowerShellDataFileFacts, analysis: SourceAnalysisResult, workspace: ParserWorkspace): string[] {
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

  const offered  = JSON.stringify(workspace.offeredBy(file).map((offer) => `${offer.name} from ${offer.from}`).sort());
  const reported = JSON.stringify((analysis.reExportedSymbols ?? []).map((offer) => `${offer.name} from ${offer.sourceModulePath}`).sort());
  if (offered !== reported) found.push(`${file}: offers ${offered} for PowerShell, ${reported} for the adapter`);
  return found;
}

describe("the PowerShell adapter against PowerShell's parser", () => {
  it("finds the fixtures that carry the parser's record", () => {
    expect(measuredFixtures()).toEqual(Object.keys(MEASURED_MISSES).sort());
  });

  it("discovers a new parser record without adding it to the miss register", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "powershell-oracle-discovery-"));
    try {
      const expected = path.join(root, "fixtures", "new-case", "expected");
      fs.mkdirSync(expected, { recursive: true });
      fs.writeFileSync(path.join(expected, "powershell-ast.json"), "{}\n");
      const hidden = path.join(root, "fixtures", ".hidden-case", "expected");
      fs.mkdirSync(hidden, { recursive: true });
      fs.writeFileSync(path.join(hidden, "powershell-ast.json"), "{}\n");
      expect(measuredFixtures(root)).toEqual(["fixtures/.hidden-case", "fixtures/new-case"]);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  // The owner's run on their own Windows machine, 2026-11-21, kept beside the parser's record: `Build/` holds what that
  // folder held, and `Build/Use-Build.ps1` writes the path the run asked for.
  it("follows PowerShell on Windows where pwsh here answers as Unix does, by the owner's own run", async () => {
    const fixtureDir = path.join(INTEGRATION_ROOT, "fixtures", "powershell-wires");
    const { runs } = JSON.parse(fs.readFileSync(path.join(fixtureDir, "expected", "windows-runs.json"), "utf8")) as { runs: WindowsRun[] };
    const files = fileIndex(fixtureDir);
    expect(runs.length).toBeGreaterThan(0);
    for (const run of runs) {
      expect(run.beside.map((name) => `Build/${name}`).filter((file) => !files.has(file))).toEqual([]);
      expect(fs.readFileSync(path.join(fixtureDir, "Build", "Use-Build.ps1"), "utf8")).toContain(`. ${run.path}\n`);
      const analysis = (await powershellAdapter.analyze({ absolutePath: path.join(fixtureDir, "Build", "Use-Build.ps1"), workspaceRoot: fixtureDir, fileIndex: files }))!;
      expect(analysis.dependencies.map((dependency) => dependency.resolvedPath)).toEqual([`Build/${run.runs}`]);
    }
  });

  for (const fixture of measuredFixtures()) {
    it(`agrees with the parser on ${fixture}, but for its measured misses, its record parsed from its files as they stand`, async () => {
      const fixtureDir = path.join(INTEGRATION_ROOT, fixture);
      const ast        = readPowerShellAst(path.join(fixtureDir, "expected", "powershell-ast.json"), fixtureDir)!;
      const read       = listFixtureFiles(fixtureDir).filter((file) => POWERSHELL_EXTENSIONS.includes(path.extname(file).toLowerCase()));
      expect(sourcesDiffer(sourceDigests(fixtureDir, read), ast.sources), `write the record again: npm run oracle:index -- tests/integration/${fixture}`).toEqual([]);
      const files      = fileIndex(fixtureDir);
      const workspace  = new ParserWorkspace(ast, recordedShippedNames());
      const found: string[] = [];
      for (const [file, facts] of Object.entries(ast.files)) {
        const analysis = (await powershellAdapter.analyze({ absolutePath: path.join(fixtureDir, file), workspaceRoot: fixtureDir, fileIndex: files }))!;
        found.push(...(isDataFileFacts(facts) ? compareDataFile(file, facts, analysis, workspace) : compareScript(file, facts, analysis, workspace)));
      }
      expect(found).toEqual(MEASURED_MISSES[fixture]);
    });
  }
});
