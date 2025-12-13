#!/usr/bin/env node
import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  GraphStore,
  KnowledgeGraphBridge,
  LinkInferenceOrchestrator,
  createRelationshipRuleProvider,
  type KnowledgeArtifact,
  type LinkRelationship,
  type ExternalArtifact,
  type ExternalLink,
  type ExternalSnapshot
} from "@live-documentation/shared";

import { createWorkspaceIndexProvider } from "../../packages/server/src/features/knowledge/workspaceIndexProvider";

interface ParsedArgs {
  helpRequested: boolean;
  quiet: boolean;
  skipDb: boolean;
  workspace?: string;
  dbPath?: string;
  outputPath?: string;
  timestamp?: string;
}

interface FixturePayload {
  generatedAt: string;
  workspace: string;
  totals: {
    artifacts: number;
    links: number;
  };
  artifacts: NormalizedArtifact[];
  links: NormalizedLink[];
  providerSummaries: unknown;
  errors: unknown;
}

interface NormalizedArtifact {
  id: string;
  uri: string;
  layer: string;
  language?: string;
  owner?: string;
  lastSynchronizedAt?: string;
  hash?: string;
  metadata?: Record<string, unknown>;
}

interface NormalizedLink {
  id: string;
  sourceId: string;
  targetId: string;
  kind: string;
  confidence: number;
  createdAt: string;
  createdBy: string;
}

interface WriteDatabaseOptions {
  workspaceRoot: string;
  quiet: boolean;
}

const DEFAULT_TIMESTAMP = "2025-01-01T00:00:00.000Z";
export const DEFAULT_DB = path.join(".link-aware-diagnostics", "link-aware-diagnostics.db");
export const DEFAULT_OUTPUT = path.join("data", "graph-snapshots", "workspace.snapshot.json");

export interface SnapshotWorkspaceOptions {
  workspaceRoot: string;
  timestamp?: string;
  dbPath?: string;
  outputPath?: string;
  skipDb?: boolean;
  quiet?: boolean;
}

export interface SnapshotWorkspaceResult {
  artifacts: NormalizedArtifact[];
  links: NormalizedLink[];
  snapshot: ExternalSnapshot;
  dbPath?: string;
  outputPath: string;
}

export function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    helpRequested: false,
    quiet: false,
    skipDb: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    switch (current) {
      case "-h":
      case "--help": {
        parsed.helpRequested = true;
        break;
      }
      case "--quiet": {
        parsed.quiet = true;
        break;
      }
      case "--skip-db": {
        parsed.skipDb = true;
        break;
      }
      case "--workspace": {
        parsed.workspace = expectValue(argv, ++index, current);
        break;
      }
      case "--db": {
        parsed.dbPath = expectValue(argv, ++index, current);
        break;
      }
      case "--output": {
        parsed.outputPath = expectValue(argv, ++index, current);
        break;
      }
      case "--timestamp": {
        parsed.timestamp = expectValue(argv, ++index, current);
        break;
      }
      default: {
        if (current.startsWith("-")) {
          throw new Error(`Unrecognised option: ${current}`);
        }
      }
    }
  }

  return parsed;
}

function expectValue(argv: string[], index: number, flag: string): string {
  const value = argv[index];
  if (!value || value.startsWith("-")) {
    throw new Error(`Option ${flag} requires a value.`);
  }
  return value;
}

function usage(): string {
  return (
    "Usage: npm run graph:snapshot -- [options]\n\n" +
    "Workspace discovery:\n" +
    "  --workspace <path>           Workspace root to scan (default: cwd).\n\n" +
    "Outputs:\n" +
    "  --db <path>                   SQLite database path (default: ./.link-aware-diagnostics/link-aware-diagnostics.db).\n" +
    "  --output <path>               JSON fixture path (default: ./data/graph-snapshots/workspace.snapshot.json).\n" +
    "  --skip-db                     Skip writing the SQLite database.\n\n" +
    "Controls:\n" +
    "  --timestamp <iso8601>         Deterministic timestamp for artifacts and links.\n" +
    "  --quiet                       Suppress informational logging.\n" +
    "  --help                        Display this help text.\n\n" +
    "Examples:\n" +
    "  npm run graph:snapshot\n" +
    "  npm run graph:snapshot -- --output ./data/graph-snapshots/latest.json --timestamp 2025-10-24T00:00:00Z\n"
  );
}

async function ensureDirectory(filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function fileExists(candidate: string): Promise<boolean> {
  try {
    await fs.access(candidate);
    return true;
  } catch {
    return false;
  }
}

async function loadContent(uri: string): Promise<string | undefined> {
  if (!uri.startsWith("file://")) {
    return undefined;
  }
  try {
    const resolved = fileURLToPath(uri);
    return await fs.readFile(resolved, "utf8");
  } catch {
    return undefined;
  }
}

function normalizeTimestamp(candidate?: string): string {
  if (!candidate) {
    return DEFAULT_TIMESTAMP;
  }
  const parsed = new Date(candidate);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid ISO timestamp: ${candidate}`);
  }
  return parsed.toISOString();
}

function normalizeArtifacts(artifacts: KnowledgeArtifact[]): NormalizedArtifact[] {
  return [...artifacts]
    .sort((left, right) => left.uri.localeCompare(right.uri))
    .map(artifact => ({
      id: artifact.id,
      uri: artifact.uri,
      layer: artifact.layer,
      language: artifact.language,
      owner: artifact.owner,
      lastSynchronizedAt: artifact.lastSynchronizedAt,
      hash: artifact.hash,
      metadata: artifact.metadata
    }));
}

function normalizeLinks(links: LinkRelationship[], timestamp: string): NormalizedLink[] {
  return [...links]
    .sort((left, right) => {
      const bySource = left.sourceId.localeCompare(right.sourceId);
      if (bySource !== 0) return bySource;
      const byTarget = left.targetId.localeCompare(right.targetId);
      if (byTarget !== 0) return byTarget;
      return left.kind.localeCompare(right.kind);
    })
    .map(link => ({
      id: link.id,
      sourceId: link.sourceId,
      targetId: link.targetId,
      kind: link.kind,
      confidence: Number(link.confidence.toFixed(6)),
      createdAt: timestamp,
      createdBy: link.createdBy
    }));
}

function toExternalSnapshot(
  artifacts: NormalizedArtifact[],
  links: NormalizedLink[],
  workspace: string,
  timestamp: string
): ExternalSnapshot {
  const externalArtifacts: ExternalArtifact[] = artifacts.map(artifact => ({
    id: artifact.id,
    uri: artifact.uri,
    layer: artifact.layer as ExternalArtifact["layer"],
    language: artifact.language,
    owner: artifact.owner,
    lastSynchronizedAt: artifact.lastSynchronizedAt,
    hash: artifact.hash,
    metadata: artifact.metadata
  }));

  const externalLinks: ExternalLink[] = links.map(link => ({
    id: link.id,
    sourceId: link.sourceId,
    targetId: link.targetId,
    kind: link.kind as ExternalLink["kind"],
    confidence: link.confidence,
    createdAt: timestamp,
    createdBy: link.createdBy
  }));

  return {
    id: `workspace-snapshot-${path.basename(workspace)}`,
    label: `Workspace snapshot for ${path.basename(workspace)}`,
    createdAt: timestamp,
    artifacts: externalArtifacts,
    links: externalLinks,
    metadata: {
      workspace
    }
  } satisfies ExternalSnapshot;
}

function isBetterSqliteVersionMismatch(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("NODE_MODULE_VERSION") ||
    error.message.includes("better_sqlite3.node")
  );
}

async function rebuildBetterSqlite3(workspaceRoot: string, quiet: boolean): Promise<void> {
  const scriptPath = path.resolve(workspaceRoot, "scripts", "rebuild-better-sqlite3.mjs");
  const scriptAvailable = await fileExists(scriptPath);
  const isWindows = process.platform === "win32";
  const command = scriptAvailable ? process.execPath : isWindows ? "npm.cmd" : "npm";
  const args = scriptAvailable ? [scriptPath] : ["rebuild", "better-sqlite3"];

  if (!quiet) {
    console.warn(
      `[better-sqlite3] Native module mismatch detected. Executing ${command} ${args.join(" ")} ...`
    );
  }

  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: workspaceRoot,
      stdio: "inherit"
    });

    child.on("error", reject);
    child.on("exit", code => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`better-sqlite3 rebuild exited with code ${code ?? "null"}`));
    });
  });
}

export async function writeDatabaseWithRecovery(
  dbPath: string,
  snapshot: ExternalSnapshot,
  options: WriteDatabaseOptions
): Promise<void> {
  await ensureDirectory(dbPath);
  await fs.rm(dbPath, { force: true });

  const attempt = (): void => {
    const store = new GraphStore({ dbPath });
    try {
      const bridge = new KnowledgeGraphBridge(store);
      bridge.ingestSnapshot(snapshot);
    } finally {
      store.close();
    }
  };

  try {
    attempt();
    return;
  } catch (error) {
    if (!isBetterSqliteVersionMismatch(error)) {
      throw error;
    }

    await rebuildBetterSqlite3(options.workspaceRoot, options.quiet);

    try {
      attempt();
    } catch (retryError) {
      const message =
        "Failed to create graph database even after rebuilding better-sqlite3. " +
        "See the logs above for details.";
      throw new Error(message, { cause: retryError });
    }
  }
}

async function writeFixture(outputPath: string, payload: FixturePayload): Promise<void> {
  await ensureDirectory(outputPath);
  const serialised = JSON.stringify(payload, null, 2);
  await fs.writeFile(outputPath, `${serialised}\n`, "utf8");
}

async function verifyWorkspaceRoot(workspace: string): Promise<void> {
  const stats = await fs.stat(workspace);
  if (!stats.isDirectory()) {
    throw new Error(`Workspace root is not a directory: ${workspace}`);
  }
}

export async function snapshotWorkspace(options: SnapshotWorkspaceOptions): Promise<SnapshotWorkspaceResult> {
  const workspaceRoot = path.resolve(options.workspaceRoot);
  await verifyWorkspaceRoot(workspaceRoot);

  const timestamp = normalizeTimestamp(options.timestamp);
  const quiet = options.quiet ?? false;
  const dbPath = options.skipDb
    ? undefined
    : path.resolve(workspaceRoot, options.dbPath ?? DEFAULT_DB);
  const outputPath = path.resolve(workspaceRoot, options.outputPath ?? DEFAULT_OUTPUT);

  // NOTE: "specs" is intentionally excluded from documentation globs.
  // Spec-Kit docs are design artifacts, not Live Documentation mirrors.
  // They are still validated by slopcop:markdown for link integrity, but
  // graph:audit does not require them to "touch code" like base-layer Live Docs.
  const orchestrationTargets = {
    implementation: ["packages", "tests", "scripts", "src", "lib", "examples", "include"],
    documentation: [
      ".mdmd",
      ".live-documentation",
      path.join(".live-documentation", "source"),
      path.join(".live-documentation", "system"),
      "docs",
      path.join("tests", "integration", "fixtures", "simple-workspace", "docs"),
      path.join("tests", "integration", "fixtures", "slopcop-symbols", "workspace", "docs"),
      path.join("tests", "integration", "fixtures", "csharp-advanced-symbols", "docs")
    ],
    scripts: ["scripts", "tools"]
  };

  const orchestrator = new LinkInferenceOrchestrator();
  const logInfo = quiet ? undefined : (message: string) => console.log(message);
  const logWarn = quiet ? undefined : (message: string) => console.warn(message);

  const workspaceProvider = createWorkspaceIndexProvider({
    rootPath: workspaceRoot,
    implementationGlobs: orchestrationTargets.implementation,
    documentationGlobs: orchestrationTargets.documentation,
    scriptGlobs: orchestrationTargets.scripts,
    logger: logInfo
      ? {
          info: logInfo
        }
      : undefined
  });

  const relationshipRuleProvider = createRelationshipRuleProvider({
    workspaceRoot,
    logger:
      logInfo || logWarn
        ? {
            info: logInfo,
            warn: logWarn
          }
        : undefined
  });

  if (!quiet) {
    console.log(`Scanning workspace: ${workspaceRoot}`);
  }

  const result = await orchestrator.run({
    seeds: [],
    workspaceProviders: [workspaceProvider, relationshipRuleProvider],
    contentProvider: loadContent,
    now: () => new Date(timestamp)
  });

  const artifacts = normalizeArtifacts(result.artifacts);
  const links = normalizeLinks(result.links, timestamp);
  const snapshot = toExternalSnapshot(artifacts, links, workspaceRoot, timestamp);

  if (dbPath) {
    await writeDatabaseWithRecovery(dbPath, snapshot, {
      workspaceRoot,
      quiet
    });
    if (!quiet) {
      console.log(`Graph database written to ${dbPath}`);
    }
  }

  const fixturePayload: FixturePayload = {
    generatedAt: timestamp,
    workspace: workspaceRoot,
    totals: {
      artifacts: artifacts.length,
      links: links.length
    },
    artifacts,
    links,
    providerSummaries: result.providerSummaries,
    errors: result.errors
  };

  await writeFixture(outputPath, fixturePayload);
  if (!quiet) {
    console.log(`Snapshot fixture written to ${outputPath}`);
    console.log(
      `Artifacts: ${artifacts.length}, Links: ${links.length}, Providers: ${result.providerSummaries.length}`
    );
  }

  return {
    artifacts,
    links,
    snapshot,
    dbPath,
    outputPath
  };
}

export async function main(): Promise<void> {
  let args: ParsedArgs;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error((error as Error).message);
    console.error(usage());
    process.exit(1);
    return;
  }

  if (args.helpRequested) {
    console.log(usage());
    return;
  }

  try {
    await snapshotWorkspace({
      workspaceRoot: path.resolve(args.workspace ?? process.cwd()),
      timestamp: args.timestamp,
      dbPath: args.dbPath,
      outputPath: args.outputPath,
      skipDb: args.skipDb,
      quiet: args.quiet
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error("Failed to snapshot workspace graph.");
    if (error instanceof Error) {
      console.error(error.stack ?? error.message);
    } else {
      console.error(String(error));
    }
    process.exit(1);
  });
}
