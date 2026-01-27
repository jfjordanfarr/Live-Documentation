#!/usr/bin/env node
import { execSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

import {
  BENCHMARK_MANIFEST_SEGMENTS,
  loadBenchmarkManifest
} from "./benchmark-manifest";
import type { BenchmarkFixtureDefinition as ManifestFixtureDefinition } from "./benchmark-manifest";
import { materializeFixture } from "./fixtureMaterializer";
import {
  generateCFixtureGraph,
  mergeCOracleEdges,
  serializeCOracleEdges,
  type CFixtureOracleOptions,
  type COracleEdgeRecord,
  type COracleOverrideConfig,
  type COracleEdgeRelation
} from "../../packages/shared/src/testing/fixtureOracles/cFixtureOracle";
import {
  generateCSharpFixtureGraph,
  mergeCSharpOracleEdges,
  serializeCSharpOracleEdges,
  type CSharpFixtureOracleOptions,
  type CSharpOracleEdgeRecord,
  type CSharpOracleOverrideConfig
} from "../../packages/shared/src/testing/fixtureOracles/csharpFixtureOracle";
import {
  generateGoFixtureGraph,
  mergeGoOracleEdges,
  serializeGoOracleEdges,
  type GoFixtureOracleOptions,
  type GoOracleEdgeRecord,
  type GoOracleOverrideConfig
} from "../../packages/shared/src/testing/fixtureOracles/goFixtureOracle";
import {
  generateJavaFixtureGraph,
  mergeJavaOracleEdges,
  serializeJavaOracleEdges,
  type JavaFixtureOracleOptions,
  type JavaOracleEdgeRecord,
  type JavaOracleOverrideConfig
} from "../../packages/shared/src/testing/fixtureOracles/javaFixtureOracle";
import {
  generatePythonFixtureGraph,
  mergePythonOracleEdges,
  serializePythonOracleEdges,
  type PythonFixtureOracleOptions,
  type PythonOracleEdgeRecord,
  type PythonOracleOverrideConfig
} from "../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle";
import {
  generateRubyFixtureGraph,
  mergeRubyOracleEdges,
  serializeRubyOracleEdges,
  type RubyFixtureOracleOptions,
  type RubyOracleEdgeRecord,
  type RubyOracleOverrideConfig
} from "../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle";
import {
  generateRustFixtureGraph,
  mergeRustOracleEdges,
  serializeRustOracleEdges,
  type RustFixtureOracleOptions,
  type RustOracleEdgeRecord,
  type RustOracleOverrideConfig
} from "../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle";
import {
  generateTypeScriptFixtureGraph,
  mergeOracleEdges as mergeTypeScriptOracleEdges,
  serializeOracleEdges as serializeTypeScriptOracleEdges,
  type OracleEdgeRecord as TypeScriptEdgeRecord,
  type OracleOverrideConfig as TypeScriptOverrideConfig
} from "../../packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle";

type OracleKind = "typescript" | "python" | "c" | "rust" | "java" | "ruby" | "csharp" | "go" | "scip";

type OracleFixtureDefinition = ManifestFixtureDefinition & {
  oracle?: OracleFixtureConfig;
};

type OracleFixtureConfig =
  | TypeScriptOracleConfig
  | PythonOracleConfig
  | COracleConfig
  | RustOracleConfig
  | JavaOracleConfig
  | RubyOracleConfig
  | CSharpOracleConfig
  | GoOracleConfig
  | ScipOracleConfig;

/**
 * SCIP oracle configuration - uses compiler-backed SCIP indexers for ground truth
 * Supported indexers: scip-typescript, scip-dotnet, scip-java, etc.
 */
interface ScipOracleConfig {
  kind: "scip";
  /**
   * The SCIP indexer to use: "typescript" | "csharp" | "java" | etc.
   * Maps to the external tool: scip-{indexer}
   */
  indexer: "typescript" | "csharp" | "java" | "python" | "go" | "rust";
  /**
   * Subdirectory within the fixture to index (e.g., "source" for ky repo)
   */
  root?: string;
  /**
   * Path to manual overrides JSON for edges that SCIP cannot detect
   * (e.g., cross-format dependencies like aspx → cs)
   */
  manualOverrides?: string;
}

interface TypeScriptOracleConfig {
  kind: "typescript";
  root?: string;
  manualOverrides?: string;
  include?: string[];
}

interface PythonOracleConfig {
  kind: "python";
  root?: string;
  manualOverrides?: string;
  include?: string[];
  exclude?: string[];
  packageRoots?: string[];
  entryPackages?: string[];
  interpreter?: string;
  env?: Record<string, string>;
}

interface COracleConfig {
  kind: "c";
  root?: string;
  manualOverrides?: string;
  include?: string[];
  exclude?: string[];
  relations?: COracleEdgeRelation[];
}

interface RustOracleConfig {
  kind: "rust";
  root?: string;
  manualOverrides?: string;
  include?: string[];
  exclude?: string[];
}

interface JavaOracleConfig {
  kind: "java";
  root?: string;
  manualOverrides?: string;
  include?: string[];
  exclude?: string[];
}

interface RubyOracleConfig {
  kind: "ruby";
  root?: string;
  manualOverrides?: string;
  include?: string[];
  exclude?: string[];
}

interface CSharpOracleConfig {
  kind: "csharp";
  root?: string;
  manualOverrides?: string;
  include?: string[];
  exclude?: string[];
}

interface GoOracleConfig {
  kind: "go";
  root?: string;
  manualOverrides?: string;
  include?: string[];
  exclude?: string[];
}

interface CliOptions {
  fixtureIds: Set<string>;
  languages: Set<OracleKind>;
  helpRequested?: boolean;
  writeMode: boolean;
}

interface EdgeRecord {
  source: string;
  target: string;
  relation: string;
}

const REPO_ROOT = path.resolve(path.join(__dirname, "..", ".."));
const FIXTURE_ROOT = path.join(REPO_ROOT, ...BENCHMARK_MANIFEST_SEGMENTS.slice(0, -1));
const OUTPUT_ROOT = path.join(REPO_ROOT, "AI-Agent-Workspace", "tmp", "fixture-regeneration");

const LANGUAGE_ALIASES = new Map<string, OracleKind>([
  ["ts", "typescript"],
  ["typescript", "typescript"],
  ["py", "python"],
  ["python", "python"],
  ["c", "c"],
  ["c-lang", "c"],
  ["clang", "c"],
  ["rs", "rust"],
  ["rust", "rust"],
  ["java", "java"],
  ["javac", "java"],
  ["rb", "ruby"],
  ["ruby", "ruby"],
  ["cs", "csharp"],
  ["csharp", "csharp"],
  ["dotnet", "csharp"],
  ["go", "go"],
  ["golang", "go"],
  ["scip", "scip"]
]);

const SUPPORTED_LANGUAGES = Array.from(new Set(LANGUAGE_ALIASES.values())).sort();

export async function runRegenerationCli(argv: string[]): Promise<void> {
  const options = parseArgs(argv);
  if (options.helpRequested) {
    printHelp();
    return;
  }

  const manifest = (await loadBenchmarkManifest(REPO_ROOT)) as OracleFixtureDefinition[];
  const candidates = manifest.filter(entry => entry.oracle);
  if (candidates.length === 0) {
    console.log("No fixtures declare oracle configurations.");
    return;
  }

  const fixtureMap = new Map<string, OracleFixtureDefinition>();
  for (const entry of candidates) {
    fixtureMap.set(entry.id, entry);
  }

  const filteredByLanguage = options.languages.size > 0
    ? candidates.filter(entry => entry.oracle && options.languages.has(entry.oracle.kind))
    : candidates;

  const targets = resolveTargetFixtures(filteredByLanguage, fixtureMap, options.fixtureIds);
  if (targets.length === 0) {
    console.log("No fixtures matched the requested filters.");
    return;
  }

  await fs.mkdir(OUTPUT_ROOT, { recursive: true });

  for (const fixture of targets) {
    const label = fixture.label ? `${fixture.id} (${fixture.label})` : fixture.id;
    console.log(`\n=== ${label} ===`);
    await regenerateFixture(fixture, { writeExpected: options.writeMode }).catch(error => {
      throw contextualizeError(fixture.id, error);
    });
  }

  console.log("\nOracle regeneration completed.");
}

function parseArgs(argv: string[]): CliOptions {
  const fixtureIds = new Set<string>();
  const languages = new Set<OracleKind>();
  let writeMode = false;
  let helpRequested = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      helpRequested = true;
      continue;
    }

    if (arg === "--write" || arg === "--apply") {
      writeMode = true;
      continue;
    }

    if (arg === "--fixture" || arg === "-f") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--fixture requires an identifier");
      }
      fixtureIds.add(value);
      index += 1;
      continue;
    }

    if (arg.startsWith("--fixture=")) {
      fixtureIds.add(arg.slice("--fixture=".length));
      continue;
    }

    if (arg === "--lang" || arg === "-l" || arg === "--suite" || arg === "-s") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error(`${arg} requires a value`);
      }
      addLanguage(languages, value);
      index += 1;
      continue;
    }

    if (arg.startsWith("--lang=") || arg.startsWith("--suite=")) {
      const [, value] = arg.split("=", 2);
      if (!value) {
        throw new Error(`${arg.split("=")[0]} requires a value`);
      }
      addLanguage(languages, value);
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unrecognized argument '${arg}'. Use --help for usage.`);
    }

    const languageAlias = LANGUAGE_ALIASES.get(arg.toLowerCase());
    if (languageAlias) {
      languages.add(languageAlias);
      continue;
    }

    fixtureIds.add(arg);
  }

  return { fixtureIds, languages, helpRequested, writeMode };
}

function addLanguage(languages: Set<OracleKind>, raw: string): void {
  const normalized = raw.toLowerCase();
  const resolved = LANGUAGE_ALIASES.get(normalized);
  if (!resolved) {
    throw new Error(
      `Unsupported language '${raw}'. Supported values: ${SUPPORTED_LANGUAGES.join(", ")}.`
    );
  }
  languages.add(resolved);
}

function printHelp(): void {
  console.log(
    `Usage: npm run fixtures:regenerate -- [options] [fixtureIds...]\n\n` +
      `Options:\n` +
      `  --lang <name>       Regenerate fixtures for a language (${SUPPORTED_LANGUAGES.join(", ")}). Can repeat.\n` +
      `  --suite <name>      Alias for --lang (${SUPPORTED_LANGUAGES.join(", ")}).\n` +
      `  --fixture <id>      Regenerate a specific fixture (can repeat).\n` +
      `  --write             Overwrite each fixture's expected.json with the merged oracle output.\n` +
      `  -h, --help          Show this help message.\n`
  );
}

function resolveTargetFixtures(
  candidates: OracleFixtureDefinition[],
  fixtureMap: Map<string, OracleFixtureDefinition>,
  requestedIds: Set<string>
): OracleFixtureDefinition[] {
  if (requestedIds.size === 0) {
    return candidates;
  }

  const targets: OracleFixtureDefinition[] = [];
  const missing: string[] = [];

  for (const id of requestedIds) {
    const entry = fixtureMap.get(id);
    if (entry) {
      targets.push(entry);
    } else {
      missing.push(id);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Unknown fixture ids requested: ${missing.join(", ")}`);
  }

  return targets;
}

interface RegenerationOptions {
  writeExpected: boolean;
}

async function regenerateFixture(
  fixture: OracleFixtureDefinition,
  options: RegenerationOptions
): Promise<void> {
  const oracle = fixture.oracle;
  if (!oracle) {
    throw new Error(`Fixture ${fixture.id} does not declare an oracle configuration.`);
  }

  const fixtureRoot = path.join(FIXTURE_ROOT, fixture.path);
  const expectedPath = path.join(FIXTURE_ROOT, fixture.expected);
  const overridesPath = oracle.manualOverrides
    ? path.join(FIXTURE_ROOT, oracle.manualOverrides)
    : path.join(fixtureRoot, "oracle.overrides.json");

  const expectedEdges = await loadEdgeRecords(expectedPath);

  const { workspaceRoot, dispose } = await materializeFixture(REPO_ROOT, fixture, {
    workspaceMode: "ephemeral"
  });

  try {
    if (oracle.kind === "typescript") {
      await regenerateTypeScriptFixture({
        fixture,
        oracle,
        workspaceRoot,
        overridesPath,
        expectedEdges,
        expectedPath,
        writeExpected: options.writeExpected
      });
    } else if (oracle.kind === "python") {
      await regeneratePythonFixture({
        fixture,
        oracle,
        workspaceRoot,
        overridesPath,
        expectedEdges,
        expectedPath,
        writeExpected: options.writeExpected
      });
    } else if (oracle.kind === "c") {
      await regenerateCFixture({
        fixture,
        oracle,
        workspaceRoot,
        overridesPath,
        expectedEdges,
        expectedPath,
        writeExpected: options.writeExpected
      });
    } else if (oracle.kind === "rust") {
      await regenerateRustFixture({
        fixture,
        oracle,
        workspaceRoot,
        overridesPath,
        expectedEdges,
        expectedPath,
        writeExpected: options.writeExpected
      });
    } else if (oracle.kind === "java") {
      await regenerateJavaFixture({
        fixture,
        oracle,
        workspaceRoot,
        overridesPath,
        expectedEdges,
        expectedPath,
        writeExpected: options.writeExpected
      });
    } else if (oracle.kind === "csharp") {
      await regenerateCSharpFixture({
        fixture,
        oracle,
        workspaceRoot,
        overridesPath,
        expectedEdges,
        expectedPath,
        writeExpected: options.writeExpected
      });
    } else if (oracle.kind === "ruby") {
      await regenerateRubyFixture({
        fixture,
        oracle,
        workspaceRoot,
        overridesPath,
        expectedEdges,
        expectedPath,
        writeExpected: options.writeExpected
      });
    } else if (oracle.kind === "go") {
      await regenerateGoFixture({
        fixture,
        oracle,
        workspaceRoot,
        overridesPath,
        expectedEdges,
        expectedPath,
        writeExpected: options.writeExpected
      });
    } else if (oracle.kind === "scip") {
      await regenerateScipFixture({
        fixture,
        oracle,
        workspaceRoot,
        overridesPath,
        expectedPath,
        writeExpected: options.writeExpected
      });
    } else {
      throw new Error(`Unsupported oracle kind '${(oracle as { kind: string }).kind}'`);
    }
  } finally {
    if (typeof dispose === "function") {
      await dispose();
    }
  }
}

async function regenerateCFixture(input: {
  fixture: OracleFixtureDefinition;
  oracle: COracleConfig;
  workspaceRoot: string;
  overridesPath: string;
  expectedEdges: EdgeRecord[];
  expectedPath: string;
  writeExpected: boolean;
}): Promise<void> {
  const {
    fixture,
    oracle,
    workspaceRoot,
    overridesPath,
    expectedEdges,
    expectedPath,
    writeExpected
  } = input;

  const overrides = await readOverrideConfig<COracleOverrideConfig>(overridesPath);
  const oracleRoot = path.resolve(workspaceRoot, oracle.root ?? ".");
  const oracleOptions: CFixtureOracleOptions = {
    fixtureRoot: oracleRoot,
    include: oracle.include,
    exclude: oracle.exclude,
    relations: oracle.relations
  };

  const autoEdges = generateCFixtureGraph(oracleOptions);
  const merge = mergeCOracleEdges(autoEdges, overrides);

  const autoRecords = merge.autoRecords.map(toEdgeRecordFromC);
  const manualRecords = merge.manualRecords.map(toEdgeRecordFromC);
  const mergedRecords = merge.mergedRecords.map(toEdgeRecordFromC);
  const matchedManualRecords = merge.matchedManualRecords.map(toEdgeRecordFromC);

  const additions = computeEdgeDifferences(mergedRecords, expectedEdges);
  const removals = computeEdgeDifferences(expectedEdges, mergedRecords);

  await writeOracleArtifacts({
    fixture,
    oracleFileContents: serializeCOracleEdges(autoEdges),
    mergedRecords,
    expectedEdges,
    overridesPath,
    expectedPath,
    additions,
    removals,
    writeExpected,
    summary: {
      autoRecords,
      manualRecords,
      matchedManualRecords,
      missingManualEntries: merge.missingManualEntries
    }
  });
}

async function regenerateTypeScriptFixture(input: {
  fixture: OracleFixtureDefinition;
  oracle: TypeScriptOracleConfig;
  workspaceRoot: string;
  overridesPath: string;
  expectedEdges: EdgeRecord[];
  expectedPath: string;
  writeExpected: boolean;
}): Promise<void> {
  const {
    fixture,
    oracle,
    workspaceRoot,
    overridesPath,
    expectedEdges,
    expectedPath,
    writeExpected
  } = input;

  const overrides = await readOverrideConfig<TypeScriptOverrideConfig>(overridesPath);
  const oracleRoot = path.resolve(workspaceRoot, oracle.root ?? ".");
  const autoEdges = generateTypeScriptFixtureGraph({
    fixtureRoot: oracleRoot,
    include: oracle.include
  });
  const merge = mergeTypeScriptOracleEdges(autoEdges, overrides);

  const autoRecords = merge.autoRecords.map(toEdgeRecordFromTypeScript);
  const manualRecords = merge.manualRecords.map(toEdgeRecordFromTypeScript);
  const mergedRecords = merge.mergedRecords.map(toEdgeRecordFromTypeScript);
  const matchedManualRecords = merge.matchedManualRecords.map(toEdgeRecordFromTypeScript);

  const additions = computeEdgeDifferences(mergedRecords, expectedEdges);
  const removals = computeEdgeDifferences(expectedEdges, mergedRecords);

  await writeOracleArtifacts({
    fixture,
    oracleFileContents: serializeTypeScriptOracleEdges(autoEdges),
    mergedRecords,
    expectedEdges,
    overridesPath,
    expectedPath,
    additions,
    removals,
    writeExpected,
    summary: {
      autoRecords,
      manualRecords,
      matchedManualRecords,
      missingManualEntries: merge.missingManualEntries
    }
  });
}

async function regeneratePythonFixture(input: {
  fixture: OracleFixtureDefinition;
  oracle: PythonOracleConfig;
  workspaceRoot: string;
  overridesPath: string;
  expectedEdges: EdgeRecord[];
  expectedPath: string;
  writeExpected: boolean;
}): Promise<void> {
  const {
    fixture,
    oracle,
    workspaceRoot,
    overridesPath,
    expectedEdges,
    expectedPath,
    writeExpected
  } = input;

  const overrides = await readOverrideConfig<PythonOracleOverrideConfig>(overridesPath);
  const oracleRoot = path.resolve(workspaceRoot, oracle.root ?? ".");

  const oracleOptions: PythonFixtureOracleOptions = {
    fixtureRoot: oracleRoot,
    include: oracle.include,
    exclude: oracle.exclude,
    packageRoots: oracle.packageRoots,
    entryPackages: oracle.entryPackages,
    interpreter: oracle.interpreter,
    env: oracle.env
  };

  const autoEdges = await generatePythonFixtureGraph(oracleOptions);
  const merge = mergePythonOracleEdges(autoEdges, overrides);

  const autoRecords = merge.autoRecords.map(toEdgeRecordFromPython);
  const manualRecords = merge.manualRecords.map(toEdgeRecordFromPython);
  const mergedRecords = merge.mergedRecords.map(toEdgeRecordFromPython);
  const matchedManualRecords = merge.matchedManualRecords.map(toEdgeRecordFromPython);

  const additions = computeEdgeDifferences(mergedRecords, expectedEdges);
  const removals = computeEdgeDifferences(expectedEdges, mergedRecords);

  await writeOracleArtifacts({
    fixture,
    oracleFileContents: serializePythonOracleEdges(autoEdges),
    mergedRecords,
    expectedEdges,
    overridesPath,
    expectedPath,
    additions,
    removals,
    writeExpected,
    summary: {
      autoRecords,
      manualRecords,
      matchedManualRecords,
      missingManualEntries: merge.missingManualEntries
    }
  });
}

async function regenerateRustFixture(input: {
  fixture: OracleFixtureDefinition;
  oracle: RustOracleConfig;
  workspaceRoot: string;
  overridesPath: string;
  expectedEdges: EdgeRecord[];
  expectedPath: string;
  writeExpected: boolean;
}): Promise<void> {
  const {
    fixture,
    oracle,
    workspaceRoot,
    overridesPath,
    expectedEdges,
    expectedPath,
    writeExpected
  } = input;

  const overrides = await readOverrideConfig<RustOracleOverrideConfig>(overridesPath);
  const oracleRoot = path.resolve(workspaceRoot, oracle.root ?? ".");
  const oracleOptions: RustFixtureOracleOptions = {
    fixtureRoot: oracleRoot,
    include: oracle.include,
    exclude: oracle.exclude
  };

  const autoEdges = generateRustFixtureGraph(oracleOptions);
  const merge = mergeRustOracleEdges(autoEdges, overrides);

  const autoRecords = merge.autoRecords.map(toEdgeRecordFromRust);
  const manualRecords = merge.manualRecords.map(toEdgeRecordFromRust);
  const mergedRecords = merge.mergedRecords.map(toEdgeRecordFromRust);
  const matchedManualRecords = merge.matchedManualRecords.map(toEdgeRecordFromRust);

  const additions = computeEdgeDifferences(mergedRecords, expectedEdges);
  const removals = computeEdgeDifferences(expectedEdges, mergedRecords);

  await writeOracleArtifacts({
    fixture,
    oracleFileContents: serializeRustOracleEdges(autoEdges),
    mergedRecords,
    expectedEdges,
    overridesPath,
    expectedPath,
    additions,
    removals,
    writeExpected,
    summary: {
      autoRecords,
      manualRecords,
      matchedManualRecords,
      missingManualEntries: merge.missingManualEntries
    }
  });
}

async function regenerateJavaFixture(input: {
  fixture: OracleFixtureDefinition;
  oracle: JavaOracleConfig;
  workspaceRoot: string;
  overridesPath: string;
  expectedEdges: EdgeRecord[];
  expectedPath: string;
  writeExpected: boolean;
}): Promise<void> {
  const {
    fixture,
    oracle,
    workspaceRoot,
    overridesPath,
    expectedEdges,
    expectedPath,
    writeExpected
  } = input;

  const overrides = await readOverrideConfig<JavaOracleOverrideConfig>(overridesPath);
  const oracleRoot = path.resolve(workspaceRoot, oracle.root ?? ".");
  const oracleOptions: JavaFixtureOracleOptions = {
    fixtureRoot: oracleRoot,
    include: oracle.include,
    exclude: oracle.exclude
  };

  const autoEdges = generateJavaFixtureGraph(oracleOptions);
  const merge = mergeJavaOracleEdges(autoEdges, overrides);

  const autoRecords = merge.autoRecords.map(toEdgeRecordFromJava);
  const manualRecords = merge.manualRecords.map(toEdgeRecordFromJava);
  const mergedRecords = merge.mergedRecords.map(toEdgeRecordFromJava);
  const matchedManualRecords = merge.matchedManualRecords.map(toEdgeRecordFromJava);

  const additions = computeEdgeDifferences(mergedRecords, expectedEdges);
  const removals = computeEdgeDifferences(expectedEdges, mergedRecords);

  await writeOracleArtifacts({
    fixture,
    oracleFileContents: serializeJavaOracleEdges(autoEdges),
    mergedRecords,
    expectedEdges,
    overridesPath,
    expectedPath,
    additions,
    removals,
    writeExpected,
    summary: {
      autoRecords,
      manualRecords,
      matchedManualRecords,
      missingManualEntries: merge.missingManualEntries
    }
  });
}

async function regenerateCSharpFixture(input: {
  fixture: OracleFixtureDefinition;
  oracle: CSharpOracleConfig;
  workspaceRoot: string;
  overridesPath: string;
  expectedEdges: EdgeRecord[];
  expectedPath: string;
  writeExpected: boolean;
}): Promise<void> {
  const {
    fixture,
    oracle,
    workspaceRoot,
    overridesPath,
    expectedEdges,
    expectedPath,
    writeExpected
  } = input;

  const overrides = await readOverrideConfig<CSharpOracleOverrideConfig>(overridesPath);
  const oracleRoot = path.resolve(workspaceRoot, oracle.root ?? ".");
  const oracleOptions: CSharpFixtureOracleOptions = {
    fixtureRoot: oracleRoot,
    include: oracle.include,
    exclude: oracle.exclude
  };

  const autoEdges = generateCSharpFixtureGraph(oracleOptions);
  const merge = mergeCSharpOracleEdges(autoEdges, overrides);

  const autoRecords = merge.autoRecords.map(toEdgeRecordFromCSharp);
  const manualRecords = merge.manualRecords.map(toEdgeRecordFromCSharp);
  const mergedRecords = merge.mergedRecords.map(toEdgeRecordFromCSharp);
  const matchedManualRecords = merge.matchedManualRecords.map(toEdgeRecordFromCSharp);

  const additions = computeEdgeDifferences(mergedRecords, expectedEdges);
  const removals = computeEdgeDifferences(expectedEdges, mergedRecords);

  await writeOracleArtifacts({
    fixture,
    oracleFileContents: serializeCSharpOracleEdges(autoEdges),
    mergedRecords,
    expectedEdges,
    overridesPath,
    expectedPath,
    additions,
    removals,
    writeExpected,
    summary: {
      autoRecords,
      manualRecords,
      matchedManualRecords,
      missingManualEntries: merge.missingManualEntries
    }
  });
}

async function regenerateRubyFixture(input: {
  fixture: OracleFixtureDefinition;
  oracle: RubyOracleConfig;
  workspaceRoot: string;
  overridesPath: string;
  expectedEdges: EdgeRecord[];
  expectedPath: string;
  writeExpected: boolean;
}): Promise<void> {
  const {
    fixture,
    oracle,
    workspaceRoot,
    overridesPath,
    expectedEdges,
    expectedPath,
    writeExpected
  } = input;

  const overrides = await readOverrideConfig<RubyOracleOverrideConfig>(overridesPath);
  const oracleRoot = path.resolve(workspaceRoot, oracle.root ?? ".");
  const oracleOptions: RubyFixtureOracleOptions = {
    fixtureRoot: oracleRoot,
    include: oracle.include,
    exclude: oracle.exclude
  };

  const autoEdges = generateRubyFixtureGraph(oracleOptions);
  const merge = mergeRubyOracleEdges(autoEdges, overrides);

  const autoRecords = merge.autoRecords.map(toEdgeRecordFromRuby);
  const manualRecords = merge.manualRecords.map(toEdgeRecordFromRuby);
  const mergedRecords = merge.mergedRecords.map(toEdgeRecordFromRuby);
  const matchedManualRecords = merge.matchedManualRecords.map(toEdgeRecordFromRuby);

  const additions = computeEdgeDifferences(mergedRecords, expectedEdges);
  const removals = computeEdgeDifferences(expectedEdges, mergedRecords);

  await writeOracleArtifacts({
    fixture,
    oracleFileContents: serializeRubyOracleEdges(autoEdges),
    mergedRecords,
    expectedEdges,
    overridesPath,
    expectedPath,
    additions,
    removals,
    writeExpected,
    summary: {
      autoRecords,
      manualRecords,
      matchedManualRecords,
      missingManualEntries: merge.missingManualEntries
    }
  });
}

async function regenerateGoFixture(input: {
  fixture: OracleFixtureDefinition;
  oracle: GoOracleConfig;
  workspaceRoot: string;
  overridesPath: string;
  expectedEdges: EdgeRecord[];
  expectedPath: string;
  writeExpected: boolean;
}): Promise<void> {
  const {
    fixture,
    oracle,
    workspaceRoot,
    overridesPath,
    expectedEdges,
    expectedPath,
    writeExpected
  } = input;

  const overrides = await readOverrideConfig<GoOracleOverrideConfig>(overridesPath);
  const oracleRoot = path.resolve(workspaceRoot, oracle.root ?? ".");
  const oracleOptions: GoFixtureOracleOptions = {
    fixtureRoot: oracleRoot,
    include: oracle.include,
    exclude: oracle.exclude
  };

  const autoEdges = generateGoFixtureGraph(oracleOptions);
  const merge = mergeGoOracleEdges(autoEdges, overrides);

  const autoRecords = merge.autoRecords.map(toEdgeRecordFromGo);
  const manualRecords = merge.manualRecords.map(toEdgeRecordFromGo);
  const mergedRecords = merge.mergedRecords.map(toEdgeRecordFromGo);
  const matchedManualRecords = merge.matchedManualRecords.map(toEdgeRecordFromGo);

  const additions = computeEdgeDifferences(mergedRecords, expectedEdges);
  const removals = computeEdgeDifferences(expectedEdges, mergedRecords);

  await writeOracleArtifacts({
    fixture,
    oracleFileContents: serializeGoOracleEdges(autoEdges),
    mergedRecords,
    expectedEdges,
    overridesPath,
    expectedPath,
    additions,
    removals,
    writeExpected,
    summary: {
      autoRecords,
      manualRecords,
      matchedManualRecords,
      missingManualEntries: merge.missingManualEntries
    }
  });
}

async function writeOracleArtifacts(input: {
  fixture: OracleFixtureDefinition;
  oracleFileContents: string;
  mergedRecords: EdgeRecord[];
  expectedEdges: EdgeRecord[];
  expectedPath: string;
  overridesPath: string;
  additions: EdgeRecord[];
  removals: EdgeRecord[];
  writeExpected: boolean;
  summary: {
    autoRecords: EdgeRecord[];
    manualRecords: EdgeRecord[];
    matchedManualRecords: EdgeRecord[];
    missingManualEntries: Array<{ source: string; target: string; relation: string }>;
  };
}): Promise<void> {
  const {
    fixture,
    oracleFileContents,
    mergedRecords,
    expectedEdges,
    expectedPath,
    overridesPath,
    additions,
    removals,
    writeExpected,
    summary
  } = input;

  const outputRoot = path.join(OUTPUT_ROOT, fixture.id);
  await fs.mkdir(outputRoot, { recursive: true });

  await fs.writeFile(path.join(outputRoot, "oracle.json"), oracleFileContents, "utf8");

  await fs.writeFile(
    path.join(outputRoot, "merged.json"),
    JSON.stringify(mergedRecords, null, 2) + "\n",
    "utf8"
  );

  const diffReport = renderDiffReport({
    fixture,
    expectedEdges,
    overridesPath,
    additions,
    removals,
    mergedCount: mergedRecords.length,
    summary
  });

  await fs.writeFile(path.join(outputRoot, "diff.md"), diffReport, "utf8");

  if (writeExpected) {
    const hasChanges = additions.length > 0 || removals.length > 0;
    if (hasChanges) {
      const serialized = JSON.stringify(sortRecords(mergedRecords), null, 2) + "\n";
      await fs.writeFile(expectedPath, serialized, "utf8");
      console.log(`→ expected.json updated (${path.relative(REPO_ROOT, expectedPath)})`);
    } else {
      console.log("→ expected.json already aligned (no changes written)");
    }
  }

  console.log(`→ oracle edges: ${summary.autoRecords.length}`);
  console.log(`→ manual overrides: ${summary.manualRecords.length}`);
  console.log(`→ merged edges: ${mergedRecords.length}`);
  console.log(`→ additions vs expected: ${additions.length}`);
  console.log(`→ removals vs expected: ${removals.length}`);
  if (summary.missingManualEntries.length > 0) {
    console.log(
      `→ missing manual overrides: ${summary.missingManualEntries.length} (see diff.md)`
    );
  }
  console.log(`Artifacts written to ${outputRoot}`);
}

async function readOverrideConfig<T>(filePath: string): Promise<T | undefined> {
  const exists = await fileExists(filePath);
  if (!exists) {
    return undefined;
  }
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function fileExists(candidate: string): Promise<boolean> {
  try {
    await fs.access(candidate);
    return true;
  } catch {
    return false;
  }
}

async function loadEdgeRecords(filePath: string): Promise<EdgeRecord[]> {
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`Edge fixture must be an array: ${filePath}`);
  }
  const records = parsed.map(normalizeEdgeRecord);
  return sortRecords(dedupeRecords(records));
}

function normalizeEdgeRecord(entry: unknown): EdgeRecord {
  if (typeof entry !== "object" || entry === null) {
    throw new Error("Edge entries must be objects");
  }

  const candidate = entry as { source?: unknown; target?: unknown; relation?: unknown };
  if (typeof candidate.source !== "string" || typeof candidate.target !== "string") {
    throw new Error("Edge entries must include 'source' and 'target'");
  }

  return {
    source: normalizePath(candidate.source),
    target: normalizePath(candidate.target),
    relation:
      typeof candidate.relation === "string" && candidate.relation.length > 0
        ? candidate.relation
        : "default"
  } satisfies EdgeRecord;
}

function normalizePath(candidate: string): string {
  return candidate.replace(/\\/g, "/");
}

function dedupeRecords(records: EdgeRecord[]): EdgeRecord[] {
  const map = new Map<string, EdgeRecord>();
  for (const record of records) {
    map.set(edgeKey(record.source, record.target, record.relation), record);
  }
  return Array.from(map.values());
}

function sortRecords(records: EdgeRecord[]): EdgeRecord[] {
  return [...records].sort((left, right) => {
    if (left.source !== right.source) {
      return left.source.localeCompare(right.source);
    }
    if (left.target !== right.target) {
      return left.target.localeCompare(right.target);
    }
    return left.relation.localeCompare(right.relation);
  });
}

function computeEdgeDifferences(left: EdgeRecord[], right: EdgeRecord[]): EdgeRecord[] {
  const rightKeys = new Set(right.map(record => edgeKey(record.source, record.target, record.relation)));
  return left.filter(record => !rightKeys.has(edgeKey(record.source, record.target, record.relation)));
}

function edgeKey(source: string, target: string, relation: string): string {
  return `${source}→${target}#${relation}`;
}

function toEdgeRecordFromTypeScript(record: TypeScriptEdgeRecord): EdgeRecord {
  return {
    source: record.source,
    target: record.target,
    relation: record.relation
  } satisfies EdgeRecord;
}

function toEdgeRecordFromPython(record: PythonOracleEdgeRecord): EdgeRecord {
  return {
    source: record.source,
    target: record.target,
    relation: record.relation
  } satisfies EdgeRecord;
}

function toEdgeRecordFromC(record: COracleEdgeRecord): EdgeRecord {
  return {
    source: record.source,
    target: record.target,
    relation: record.relation
  } satisfies EdgeRecord;
}

function toEdgeRecordFromRust(record: RustOracleEdgeRecord): EdgeRecord {
  return {
    source: record.source,
    target: record.target,
    relation: record.relation
  } satisfies EdgeRecord;
}

function toEdgeRecordFromJava(record: JavaOracleEdgeRecord): EdgeRecord {
  return {
    source: record.source,
    target: record.target,
    relation: record.relation
  } satisfies EdgeRecord;
}

function toEdgeRecordFromCSharp(record: CSharpOracleEdgeRecord): EdgeRecord {
  return {
    source: record.source,
    target: record.target,
    relation: record.relation
  } satisfies EdgeRecord;
}

function toEdgeRecordFromRuby(record: RubyOracleEdgeRecord): EdgeRecord {
  return {
    source: record.source,
    target: record.target,
    relation: record.relation
  } satisfies EdgeRecord;
}

function toEdgeRecordFromGo(record: GoOracleEdgeRecord): EdgeRecord {
  return {
    source: record.source,
    target: record.target,
    relation: record.relation
  } satisfies EdgeRecord;
}

function renderDiffReport(input: {
  fixture: OracleFixtureDefinition;
  expectedEdges: EdgeRecord[];
  overridesPath: string;
  additions: EdgeRecord[];
  removals: EdgeRecord[];
  mergedCount: number;
  summary: {
    autoRecords: EdgeRecord[];
    manualRecords: EdgeRecord[];
    matchedManualRecords: EdgeRecord[];
    missingManualEntries: Array<{ source: string; target: string; relation: string }>;
  };
}): string {
  const { fixture, expectedEdges, overridesPath, additions, removals, mergedCount, summary } = input;
  const lines: string[] = [];
  const label = fixture.label ? `${fixture.id} – ${fixture.label}` : fixture.id;

  lines.push(`# ${label}`);
  lines.push("");
  lines.push("## Summary");
  lines.push(`- expected edges: ${expectedEdges.length}`);
  lines.push(`- oracle edges: ${summary.autoRecords.length}`);
  lines.push(
    `- manual overrides (${path.relative(REPO_ROOT, overridesPath)}): ${summary.manualRecords.length}`
  );
  lines.push(`  - matched manual overrides: ${summary.matchedManualRecords.length}`);
  lines.push(`  - missing manual overrides: ${summary.missingManualEntries.length}`);
  lines.push(`- merged edges: ${mergedCount}`);
  lines.push(`- additions vs expected: ${additions.length}`);
  lines.push(`- removals vs expected: ${removals.length}`);
  lines.push("");

  if (additions.length > 0) {
    lines.push("## Additions");
    for (const record of additions) {
      lines.push(`- ${formatRecord(record)}`);
    }
    lines.push("");
  }

  if (removals.length > 0) {
    lines.push("## Removals");
    for (const record of removals) {
      lines.push(`- ${formatRecord(record)}`);
    }
    lines.push("");
  }

  if (summary.missingManualEntries.length > 0) {
    lines.push("## Missing Manual Overrides");
    for (const entry of summary.missingManualEntries) {
      lines.push(`- ${entry.source} → ${entry.target} (#${entry.relation})`);
    }
    lines.push("");
  }

  lines.push("## Next Steps");
  lines.push("- Review oracle.json and merged.json under AI-Agent-Workspace/tmp/fixture-regeneration.");
  lines.push("- If the merged output is correct, replace expected.json with merged.json.");
  lines.push("- Commit manual override updates if new cross-language edges are required.");
  lines.push("");

  return lines.join("\n");
}

function formatRecord(record: EdgeRecord): string {
  return `${record.source} → ${record.target} (#${record.relation})`;
}

function contextualizeError(fixtureId: string, error: unknown): Error {
  if (error instanceof Error) {
    return new Error(`Fixture ${fixtureId}: ${error.message}`);
  }
  return new Error(`Fixture ${fixtureId}: ${String(error)}`);
}

/**
 * Regenerate expected.json using SCIP compiler-backed indexer.
 * This invokes the external SCIP indexer (scip-typescript, scip-dotnet, etc.)
 * and then converts the output to expected.json format.
 */
async function regenerateScipFixture(input: {
  fixture: OracleFixtureDefinition;
  oracle: ScipOracleConfig;
  workspaceRoot: string;
  overridesPath: string;
  expectedPath: string;
  writeExpected: boolean;
}): Promise<void> {
  const { oracle, workspaceRoot, overridesPath, expectedPath, writeExpected } = input;
  
  const indexRoot = oracle.root ? path.join(workspaceRoot, oracle.root) : workspaceRoot;
  const indexPath = path.join(indexRoot, "index.scip");
  
  // Step 1: Invoke the SCIP indexer based on the indexer type
  console.log(`  Invoking scip-${oracle.indexer} indexer...`);
  
  let indexerCmd: string;
  switch (oracle.indexer) {
    case "typescript":
      indexerCmd = `npx scip-typescript index --infer-tsconfig --output index.scip`;
      break;
    case "csharp":
      indexerCmd = `scip-dotnet index --output index.scip`;
      break;
    case "java":
      indexerCmd = `scip-java index --output index.scip`;
      break;
    case "python":
      indexerCmd = `scip-python index --output index.scip`;
      break;
    case "go":
      indexerCmd = `scip-go index --output index.scip`;
      break;
    case "rust":
      indexerCmd = `rust-analyzer scip .`;
      break;
    default:
      throw new Error(`Unsupported SCIP indexer: ${oracle.indexer}`);
  }
  
  try {
    execSync(indexerCmd, {
      cwd: indexRoot,
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 120000 // 2 minute timeout for large codebases
    });
    console.log(`  ✓ SCIP index generated: ${indexPath}`);
  } catch (err) {
    const error = err as { message?: string; stderr?: Buffer };
    const stderr = error.stderr?.toString() || error.message || "Unknown error";
    throw new Error(`SCIP indexer failed: ${stderr.split("\\n")[0]}`);
  }
  
  // Step 2: Convert SCIP index to expected.json using scip-to-expected.ts
  console.log(`  Converting SCIP index to expected.json...`);
  
  const scipToExpectedPath = path.join(REPO_ROOT, "scripts", "fixture-tools", "scip-to-expected.ts");
  const convertCmd = `npx tsx ${scipToExpectedPath} --input "${indexPath}"`;
  
  let expectedJson: string;
  try {
    const result = execSync(convertCmd, {
      cwd: REPO_ROOT,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 60000
    });
    expectedJson = result;
  } catch (err) {
    const error = err as { message?: string; stderr?: Buffer };
    const stderr = error.stderr?.toString() || error.message || "Unknown error";
    throw new Error(`SCIP to expected.json conversion failed: ${stderr}`);
  }
  
  // Parse and count edges
  let edges = JSON.parse(expectedJson) as EdgeRecord[];
  console.log(`  Generated ${edges.length} edges from compiler analysis`);
  
  // Step 3: Merge manual overrides if present
  interface ScipOverrideConfig {
    manualEdges?: EdgeRecord[];
    removals?: Array<{ source: string; target: string; reason?: string }>;
  }
  const overrides = await readOverrideConfig<ScipOverrideConfig>(overridesPath);
  
  // Handle removals first
  if (overrides?.removals && overrides.removals.length > 0) {
    const removalKeys = new Set(
      overrides.removals.map(r => `${r.source}|${r.target}`)
    );
    const beforeCount = edges.length;
    edges = edges.filter(e => !removalKeys.has(`${e.source}|${e.target}`));
    const removedCount = beforeCount - edges.length;
    if (removedCount > 0) {
      console.log(`  Removed ${removedCount} edges per override removals`);
    }
  }
  
  // Handle additions
  if (overrides?.manualEdges && overrides.manualEdges.length > 0) {
    const manualEdges = overrides.manualEdges;
    console.log(`  Merging ${manualEdges.length} manual override edges`);
    
    // Create a set of existing edge keys for deduplication
    const existingEdges = new Set(edges.map(e => `${e.source}|${e.target}|${e.relation}`));
    
    // Add manual edges that don't already exist
    let addedCount = 0;
    for (const manual of manualEdges) {
      const key = `${manual.source}|${manual.target}|${manual.relation}`;
      if (!existingEdges.has(key)) {
        edges.push(manual);
        existingEdges.add(key);
        addedCount++;
      }
    }
    
    console.log(`  ✓ Added ${addedCount} manual edges (total: ${edges.length})`);
  }
  
  // Sort by source then target for stable output
  edges = edges.sort((a, b) => {
    const srcCmp = a.source.localeCompare(b.source);
    return srcCmp !== 0 ? srcCmp : a.target.localeCompare(b.target);
  });
  
  // Step 4: Write expected.json if in write mode
  if (writeExpected) {
    await fs.writeFile(expectedPath, JSON.stringify(edges, null, 2) + "\n", "utf-8");
    console.log(`  ✓ Wrote ${edges.length} edges to ${path.relative(REPO_ROOT, expectedPath)}`);
  } else {
    console.log(`  [dry-run] Would write ${edges.length} edges to ${path.relative(REPO_ROOT, expectedPath)}`);
  }
  
  // Step 5: Clean up the index.scip file (it's gitignored but good hygiene)
  try {
    await fs.unlink(indexPath);
  } catch {
    // Ignore if file doesn't exist
  }
}

void runRegenerationCli(process.argv.slice(2)).catch(error => {
  console.error("Benchmark oracle regeneration failed.");
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});
