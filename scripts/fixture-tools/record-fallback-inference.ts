#!/usr/bin/env node
import { glob } from "glob";
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  BENCHMARK_MANIFEST_SEGMENTS,
  loadBenchmarkManifest,
  type BenchmarkFixtureDefinition
} from "./benchmark-manifest";
import { materializeFixture } from "./fixtureMaterializer";
import { type LinkRelationshipKind } from "../../packages/shared/src/domain/artifacts";
import {
  inferFallbackGraph,
  type ArtifactSeed,
  type FallbackInferenceResult
} from "../../packages/shared/src/inference/fallbackInference";

interface CliOptions {
  fixtureIds: Set<string>;
  languages: Set<string>;
  writeInPlace: boolean;
  helpRequested?: boolean;
}

interface EdgeRecord {
  source: string;
  target: string;
  relation: string;
}

const REPO_ROOT = path.resolve(path.join(__dirname, "..", ".."));
const FIXTURE_ROOT = path.join(REPO_ROOT, ...BENCHMARK_MANIFEST_SEGMENTS.slice(0, -1));
const OUTPUT_ROOT = path.join(REPO_ROOT, "AI-Agent-Workspace", "tmp", "fallback-inference");

const LANGUAGE_ALIASES = new Map<string, string>([
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
  ["golang", "go"]
]);

const LANGUAGE_DEFAULT_GLOBS = new Map<string, string[]>([
  ["typescript", ["**/*.ts", "**/*.tsx"]],
  ["python", ["**/*.py"]],
  ["c", ["**/*.c", "**/*.h"]],
  ["rust", ["**/*.rs"]],
  ["java", ["**/*.java"]],
  ["ruby", ["**/*.rb"]],
  ["csharp", ["**/*.cs"]],
  ["go", ["**/*.go"]]
]);

const SUPPORTED_LANGUAGES = Array.from(new Set(LANGUAGE_ALIASES.values())).sort();

const CONTEXT_PRIORITY = new Map<string | undefined, number>([
  ["call", 5],
  ["require", 4],
  ["use", 3],
  ["import", 2],
  ["include", 1],
  ["directive", 0],
  ["hint", 0],
  ["text", 0],
  [undefined, -1]
]);

const EXTENSION_LANGUAGE_HINT = new Map<string, string>([
  [".ts", "typescript"],
  [".tsx", "typescript"],
  [".mts", "typescript"],
  [".cts", "typescript"],
  [".js", "javascript"],
  [".jsx", "javascript"],
  [".py", "python"],
  [".c", "c"],
  [".h", "c"],
  [".rs", "rust"],
  [".java", "java"],
  [".rb", "ruby"],
  [".cs", "csharp"],
  [".go", "go"]
]);

export async function runCli(argv: string[]): Promise<void> {
  const options = parseArgs(argv);
  if (options.helpRequested) {
    printHelp();
    return;
  }

  const manifest = await loadBenchmarkManifest(REPO_ROOT);
  const fixtureMap = new Map<string, BenchmarkFixtureDefinition>();
  for (const entry of manifest) {
    fixtureMap.set(entry.id, entry);
  }

  const filteredByLanguage = options.languages.size > 0
    ? manifest.filter(entry => {
        const language = entry.language?.toLowerCase();
        return Boolean(language && options.languages.has(language));
      })
    : manifest;

  const targets = resolveTargetFixtures(filteredByLanguage, fixtureMap, options.fixtureIds);
  if (targets.length === 0) {
    console.log("No fixtures matched the requested filters.");
    return;
  }

  await fs.mkdir(OUTPUT_ROOT, { recursive: true });

  for (const fixture of targets) {
    const label = fixture.label ? `${fixture.id} (${fixture.label})` : fixture.id;
    console.log(`\n=== ${label} ===`);
    await recordFixture(fixture, options.writeInPlace).catch(error => {
      throw contextualizeError(fixture.id, error);
    });
  }

  console.log("\nFallback inference capture complete.");
}

function parseArgs(argv: string[]): CliOptions {
  const fixtureIds = new Set<string>();
  const languages = new Set<string>();
  let writeInPlace = false;
  let helpRequested = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      helpRequested = true;
      continue;
    }

    if (arg === "--write" || arg === "--in-place" || arg === "-w") {
      writeInPlace = true;
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

    if (arg === "--lang" || arg === "--suite" || arg === "-l" || arg === "-s") {
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

    const alias = LANGUAGE_ALIASES.get(arg.toLowerCase());
    if (alias) {
      languages.add(alias);
      continue;
    }

    fixtureIds.add(arg);
  }

  return { fixtureIds, languages, writeInPlace, helpRequested } satisfies CliOptions;
}

function addLanguage(target: Set<string>, raw: string): void {
  const resolved = LANGUAGE_ALIASES.get(raw.toLowerCase());
  if (!resolved) {
    throw new Error(
      `Unsupported language '${raw}'. Supported values: ${SUPPORTED_LANGUAGES.join(", ")}.`
    );
  }
  target.add(resolved);
}

function printHelp(): void {
  console.log(
    `Usage: npm run fixtures:record-fallback -- [options] [fixtureIds...]\n\n` +
      `Options:\n` +
      `  --fixture <id>      Capture fallback edges for a specific fixture (can repeat).\n` +
      `  --lang <name>       Filter fixtures by language (${SUPPORTED_LANGUAGES.join(", ")}).\n` +
      `  --write             Overwrite tests/.../inferred.json instead of writing to AI-Agent-Workspace.\n` +
      `  -h, --help          Show this help message.\n`
  );
}

function resolveTargetFixtures(
  candidates: BenchmarkFixtureDefinition[],
  fixtureMap: Map<string, BenchmarkFixtureDefinition>,
  requestedIds: Set<string>
): BenchmarkFixtureDefinition[] {
  if (requestedIds.size === 0) {
    return candidates;
  }

  const targets: BenchmarkFixtureDefinition[] = [];
  const missing: string[] = [];

  for (const id of requestedIds) {
    const entry = fixtureMap.get(id);
    if (entry) {
      if (candidates.includes(entry)) {
        targets.push(entry);
      }
    } else {
      missing.push(id);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Unknown fixture ids requested: ${missing.join(", ")}`);
  }

  if (targets.length === 0) {
    return candidates;
  }

  return targets;
}

async function recordFixture(fixture: BenchmarkFixtureDefinition, writeInPlace: boolean): Promise<void> {
  const fixtureRoot = path.join(FIXTURE_ROOT, fixture.path);
  const inferredPath = path.join(fixtureRoot, fixture.inferred);

  const workspaceMode = process.env.FIXTURE_PERSIST === "1" ? "persistent" : "ephemeral";
  const { workspaceRoot, dispose } = await materializeFixture(REPO_ROOT, fixture, {
    workspaceMode
  });

  try {
    const files = await resolveFixtureFiles(fixture, workspaceRoot);
    if (files.length === 0) {
      console.log("No files resolved for fixture; skipping.");
      return;
    }

    const seeds = await buildSeeds(files, workspaceRoot, fixture.language);
    const result = await inferFallbackGraph({ seeds });
    const edges = filterEdgesByOracleRelations(fixture, buildEdgeRecords(result, workspaceRoot));
    const payload = JSON.stringify(edges, null, 2) + "\n";

    if (writeInPlace) {
      await fs.mkdir(path.dirname(inferredPath), { recursive: true });
      await fs.writeFile(inferredPath, payload, "utf8");
      console.log(`Updated ${path.relative(REPO_ROOT, inferredPath)} (${edges.length} edges).`);
      return;
    }

    const outputDir = path.join(OUTPUT_ROOT, fixture.id);
    await fs.mkdir(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, "inferred.json");
    await fs.writeFile(outputPath, payload, "utf8");
    console.log(
      `Captured ${edges.length} edges to ${path.relative(REPO_ROOT, outputPath)}.`
    );
  } finally {
    if (typeof dispose === "function") {
      await dispose();
    }
  }
}

function filterEdgesByOracleRelations(
  fixture: BenchmarkFixtureDefinition,
  edges: EdgeRecord[]
): EdgeRecord[] {
  const oracleRelations = (fixture as { oracle?: { relations?: string[] } }).oracle?.relations;
  if (!oracleRelations || oracleRelations.length === 0) {
    return edges;
  }
  const allowed = new Set(oracleRelations.map(relation => relation.toLowerCase()));
  return edges.filter(edge => allowed.has(edge.relation.toLowerCase()));
}

async function resolveFixtureFiles(
  fixture: BenchmarkFixtureDefinition,
  workspaceRoot: string
): Promise<string[]> {
  const include = resolveIncludePatterns(fixture);
  const exclude = resolveExcludePatterns(fixture);
  const matches = await glob(include, {
    cwd: workspaceRoot,
    ignore: exclude,
    nodir: true,
    dot: false,
    windowsPathsNoEscape: true
  });
  return matches.sort((left, right) => left.localeCompare(right));
}

function resolveIncludePatterns(fixture: BenchmarkFixtureDefinition): string[] {
  if (fixture.integrity?.fileSet?.include?.length) {
    return fixture.integrity.fileSet.include;
  }
  if (fixture.materialization && fixture.materialization.kind === "git") {
    const include = fixture.materialization.include;
    if (include?.length) {
      return include;
    }
  }
  const language = fixture.language?.toLowerCase();
  const defaults = language ? LANGUAGE_DEFAULT_GLOBS.get(language) : undefined;
  return defaults ?? ["**/*"];
}

function resolveExcludePatterns(fixture: BenchmarkFixtureDefinition): string[] {
  if (fixture.integrity?.fileSet?.exclude?.length) {
    return fixture.integrity.fileSet.exclude;
  }
  if (fixture.materialization && fixture.materialization.kind === "git") {
    const exclude = fixture.materialization.exclude;
    if (exclude?.length) {
      return exclude;
    }
  }
  return [];
}

async function buildSeeds(
  files: string[],
  workspaceRoot: string,
  defaultLanguage: string | undefined
): Promise<ArtifactSeed[]> {
  const seeds: ArtifactSeed[] = [];

  for (const relativePath of files) {
    const absolutePath = path.join(workspaceRoot, relativePath);
    const content = await fs.readFile(absolutePath, "utf8");
    const uri = pathToFileURL(absolutePath).href;
    const extension = path.extname(relativePath).toLowerCase();
    const language = EXTENSION_LANGUAGE_HINT.get(extension) ?? defaultLanguage;

    seeds.push({
      uri,
      layer: "code",
      language,
      content
    });
  }

  return seeds;
}

function buildEdgeRecords(result: FallbackInferenceResult, workspaceRoot: string): EdgeRecord[] {
  const artifactById = new Map(result.artifacts.map(artifact => [artifact.id, artifact]));
  const artifactByUri = new Map(result.artifacts.map(artifact => [normalizeUri(artifact.uri), artifact]));
  const contextMap = new Map<string, { context?: string; rationale?: string }>();

  for (const trace of result.traces) {
    const source = artifactByUri.get(normalizeUri(trace.sourceUri));
    const target = artifactByUri.get(normalizeUri(trace.targetUri));
    if (!source || !target) {
      continue;
    }
    const key = linkKey(source.id, target.id, trace.kind);
    const existing = contextMap.get(key);
    if (!existing || compareContextPriority(trace.context, existing.context) > 0) {
      contextMap.set(key, { context: trace.context, rationale: trace.rationale });
    }
  }

  const edges: EdgeRecord[] = [];

  for (const link of result.links) {
    const source = artifactById.get(link.sourceId);
    const target = artifactById.get(link.targetId);
    if (!source || !target) {
      continue;
    }

    const key = linkKey(link.sourceId, link.targetId, link.kind);
    const contextInfo = contextMap.get(key);
    const relation = mapRelation(link.kind, contextInfo?.context, contextInfo?.rationale);
    const sourcePath = toRelativePath(source.uri, workspaceRoot);
    const targetPath = toRelativePath(target.uri, workspaceRoot);

    if (!sourcePath || !targetPath) {
      continue;
    }

    edges.push({
      source: sourcePath,
      target: targetPath,
      relation
    });
  }

  const deduped = dedupeRecords(edges);
  const filtered = deduped.filter(record => record.relation !== "references");
  // Drop low-signal reference edges to avoid inflating benchmark false positives.
  return sortRecords(filtered);
}

function compareContextPriority(candidate: string | undefined, baseline: string | undefined): number {
  const candidateScore = CONTEXT_PRIORITY.get(candidate) ?? -1;
  const baselineScore = CONTEXT_PRIORITY.get(baseline) ?? -1;
  return candidateScore - baselineScore;
}

function mapRelation(
  kind: LinkRelationshipKind,
  context: string | undefined,
  rationale: string | undefined
): string {
  switch (context) {
    case "include":
      return "includes";
    case "call":
      return "calls";
    case "require":
      return "requires";
    case "use":
      return "uses";
    case "import":
      return "imports";
  }

  switch (kind) {
    case "includes":
      return "includes";
    case "implements":
      return "implements";
    case "documents":
      return "documents";
    case "depends_on":
      return rationale?.startsWith("java usage") ? "uses" : "depends_on";
    default:
      return "references";
  }
}

function toRelativePath(uri: string, workspaceRoot: string): string | null {
  let absolutePath: string;
  try {
    absolutePath = uri.startsWith("file://") ? fileURLToPath(uri) : path.resolve(uri);
  } catch {
    return null;
  }

  const relative = path.relative(workspaceRoot, absolutePath);
  if (!relative || relative.startsWith("..")) {
    return null;
  }

  return relative.replace(/\\/g, "/");
}

function dedupeRecords(records: EdgeRecord[]): EdgeRecord[] {
  const map = new Map<string, EdgeRecord>();
  for (const record of records) {
    map.set(edgeKey(record), record);
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

function edgeKey(record: EdgeRecord): string {
  return `${record.source}→${record.target}#${record.relation}`;
}

function linkKey(sourceId: string, targetId: string, kind: LinkRelationshipKind): string {
  return `${sourceId}|${targetId}|${kind}`;
}

function normalizeUri(uri: string): string {
  return uri.trim();
}

function contextualizeError(fixtureId: string, error: unknown): Error {
  if (error instanceof Error) {
    return new Error(`Fixture ${fixtureId}: ${error.message}`);
  }
  return new Error(`Fixture ${fixtureId}: ${String(error)}`);
}

void runCli(process.argv.slice(2)).catch(error => {
  console.error("Fallback inference capture failed.");
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});
