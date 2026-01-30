import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

export type PythonOracleEdgeRelation = "imports";
export type PythonOracleProvenance = "module-import" | "runtime-import" | "type-hint";

export interface PythonOracleEdge {
  source: string;
  target: string;
  relation: PythonOracleEdgeRelation;
  provenance: PythonOracleProvenance;
}

export interface PythonOracleEdgeRecord {
  source: string;
  target: string;
  relation: string;
}

export interface PythonFixtureOracleOptions {
  fixtureRoot: string;
  include?: string[];
  exclude?: string[];
  packageRoots?: string[];
  entryPackages?: string[];
  interpreter?: string;
  env?: Record<string, string | undefined>;
}

export interface PythonOracleOverrideEntry {
  source: string;
  target: string;
  relation: string;
}

export interface PythonOracleOverrideConfig {
  manualEdges?: PythonOracleOverrideEntry[];
}

export interface PythonOracleSegmentPartition {
  autoEdges: PythonOracleEdge[];
  matchedManualEdges: PythonOracleEdge[];
  manualEntries: PythonOracleOverrideEntry[];
  missingManualEntries: PythonOracleOverrideEntry[];
}

export interface PythonOracleMergeResult {
  autoEdges: PythonOracleEdge[];
  autoRecords: PythonOracleEdgeRecord[];
  manualRecords: PythonOracleEdgeRecord[];
  matchedManualRecords: PythonOracleEdgeRecord[];
  mergedRecords: PythonOracleEdgeRecord[];
  missingManualEntries: PythonOracleOverrideEntry[];
}

interface InterpreterCandidate {
  command: string;
  args: string[];
  label: string;
}

const REPO_ROOT = path.resolve(__dirname, "../../../../../");
const PYTHON_WORKER_PATH = path.join(
  REPO_ROOT,
  "scripts",
  "fixture-tools",
  "python_oracle_worker.py"
);

export async function generatePythonFixtureGraph(
  options: PythonFixtureOracleOptions
): Promise<PythonOracleEdge[]> {
  const interpreter = resolveInterpreter(options.interpreter);
  const payload = {
    root: path.resolve(options.fixtureRoot),
    include: options.include ?? [],
    exclude: options.exclude ?? [],
    package_roots: options.packageRoots ?? [],
    entry_packages: options.entryPackages ?? []
  } satisfies Record<string, unknown>;

  const env = {
    ...process.env,
    ...(options.env ?? {})
  } as NodeJS.ProcessEnv;

  const response = await runPythonWorker(interpreter, payload, env);
  const edges = parseWorkerResponse(response);
  return edges.sort(comparePythonEdges);
}

export function serializePythonOracleEdges(edges: PythonOracleEdge[]): string {
  const records = edges.map(toRecordFromPythonEdge).sort(comparePythonRecords);
  return JSON.stringify(records, null, 2) + "\n";
}

export function partitionPythonOracleSegments(
  edges: PythonOracleEdge[],
  overrides?: PythonOracleOverrideConfig
): PythonOracleSegmentPartition {
  const overrideEntries = overrides?.manualEdges ?? [];
  const overrideMap = new Map<string, PythonOracleOverrideEntry>();
  for (const entry of overrideEntries) {
    overrideMap.set(edgeKey(entry.source, entry.target, entry.relation), entry);
  }

  const autoEdges: PythonOracleEdge[] = [];
  const matchedManualEdges: PythonOracleEdge[] = [];
  const encountered = new Set<string>();

  for (const edge of edges) {
    const key = edgeKey(edge.source, edge.target, edge.relation);
    if (overrideMap.has(key)) {
      matchedManualEdges.push(edge);
      encountered.add(key);
    } else {
      autoEdges.push(edge);
    }
  }

  const missingManualEntries = overrideEntries.filter(entry =>
    !encountered.has(edgeKey(entry.source, entry.target, entry.relation))
  );

  return {
    autoEdges,
    matchedManualEdges,
    manualEntries: overrideEntries,
    missingManualEntries
  };
}

export function mergePythonOracleEdges(
  edges: PythonOracleEdge[],
  overrides?: PythonOracleOverrideConfig
): PythonOracleMergeResult {
  const partition = partitionPythonOracleSegments(edges, overrides);
  const autoRecords = collectRecords(edges.map(toRecordFromPythonEdge));
  const manualRecords = collectRecords(
    (overrides?.manualEdges ?? []).map(toRecordFromOverride)
  );
  const matchedManualRecords = collectRecords(
    partition.matchedManualEdges.map(toRecordFromPythonEdge)
  );

  const merged = new Map<string, PythonOracleEdgeRecord>();

  for (const record of autoRecords) {
    merged.set(edgeKey(record.source, record.target, record.relation), record);
  }

  for (const record of manualRecords) {
    merged.set(edgeKey(record.source, record.target, record.relation), record);
  }

  const mergedRecords = Array.from(merged.values()).sort(comparePythonRecords);

  return {
    autoEdges: edges,
    autoRecords,
    manualRecords,
    matchedManualRecords,
    mergedRecords,
    missingManualEntries: partition.missingManualEntries
  };
}

function parseWorkerResponse(raw: string): PythonOracleEdge[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray((parsed as { edges?: unknown }).edges)
    ) {
      throw new Error("Worker response missing 'edges' array");
    }

    const edges = (parsed as { edges: unknown[] }).edges.map(entry => {
      if (!entry || typeof entry !== "object") {
        throw new Error("Worker edge entry must be an object");
      }
      const candidate = entry as {
        source?: unknown;
        target?: unknown;
        relation?: unknown;
        provenance?: unknown;
      };
      if (typeof candidate.source !== "string" || typeof candidate.target !== "string") {
        throw new Error("Worker edge entry missing 'source' or 'target'");
      }
      const relation =
        typeof candidate.relation === "string" && candidate.relation.length > 0
          ? candidate.relation
          : "imports";
      const provenance =
        typeof candidate.provenance === "string" && candidate.provenance.length > 0
          ? candidate.provenance
          : "module-import";

      return {
        source: normalizePath(candidate.source),
        target: normalizePath(candidate.target),
        relation: relation as PythonOracleEdgeRelation,
        provenance: provenance as PythonOracleProvenance
      } satisfies PythonOracleEdge;
    });

    return edges;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse Python oracle output: ${error.message}`);
    }
    throw new Error("Failed to parse Python oracle output");
  }
}

function runPythonWorker(
  interpreter: InterpreterCandidate,
  payload: Record<string, unknown>,
  env: NodeJS.ProcessEnv
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(interpreter.command, [...interpreter.args, PYTHON_WORKER_PATH], {
      cwd: payload.root && typeof payload.root === "string" ? payload.root : REPO_ROOT,
      env,
      stdio: ["pipe", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });

    child.on("error", (error: unknown) => {
      reject(
        new Error(
          `Failed to launch Python interpreter '${interpreter.label}': ${error instanceof Error ? error.message : String(error)}`
        )
      );
    });

    child.on("close", code => {
      if (code === 0) {
        resolve(stdout);
        return;
      }

      const message = stderr.trim().length > 0 ? stderr.trim() : "Unknown Python oracle failure";
      reject(
        new Error(
          `Python oracle exited with code ${code ?? "null"} (${interpreter.label}). ${message}`
        )
      );
    });

    child.stdin.end(JSON.stringify(payload));
  });
}

function resolveInterpreter(preferred?: string): InterpreterCandidate {
  const candidates: InterpreterCandidate[] = [];

  if (preferred && preferred.length > 0) {
    candidates.push({ command: preferred, args: [], label: preferred });
  }

  const envConfigured = process.env.PYTHON_FIXTURE_ORACLE_INTERPRETER;
  if (envConfigured && envConfigured.length > 0) {
    candidates.push({ command: envConfigured, args: [], label: envConfigured });
  }

  candidates.push(
    { command: "python", args: [], label: "python" },
    { command: "python3", args: [], label: "python3" },
    { command: "py", args: ["-3"], label: "py -3" },
    { command: "py", args: [], label: "py" }
  );

  for (const candidate of candidates) {
    const probe = spawnSync(candidate.command, [...candidate.args, "--version"], {
      stdio: "ignore"
    });

    if (probe.error) {
      continue;
    }

    if (typeof probe.status === "number" && probe.status === 0) {
      return candidate;
    }
  }

  throw new Error("Unable to locate a Python interpreter for fixture oracle execution");
}

function comparePythonEdges(left: PythonOracleEdge, right: PythonOracleEdge): number {
  if (left.source !== right.source) {
    return left.source.localeCompare(right.source);
  }
  if (left.target !== right.target) {
    return left.target.localeCompare(right.target);
  }
  const leftRelation = String(left.relation);
  const rightRelation = String(right.relation);
  if (leftRelation !== rightRelation) {
    return leftRelation.localeCompare(rightRelation);
  }
  const leftProvenance = String(left.provenance);
  const rightProvenance = String(right.provenance);
  return leftProvenance.localeCompare(rightProvenance);
}

function toRecordFromPythonEdge(edge: PythonOracleEdge): PythonOracleEdgeRecord {
  return {
    source: edge.source,
    target: edge.target,
    relation: edge.relation
  } satisfies PythonOracleEdgeRecord;
}

function toRecordFromOverride(entry: PythonOracleOverrideEntry): PythonOracleEdgeRecord {
  return {
    source: entry.source,
    target: entry.target,
    relation: entry.relation
  } satisfies PythonOracleEdgeRecord;
}

function normalizeRecord(record: PythonOracleEdgeRecord): PythonOracleEdgeRecord {
  return {
    source: normalizePath(record.source),
    target: normalizePath(record.target),
    relation: record.relation
  } satisfies PythonOracleEdgeRecord;
}

function collectRecords(records: PythonOracleEdgeRecord[]): PythonOracleEdgeRecord[] {
  const deduped = new Map<string, PythonOracleEdgeRecord>();
  for (const record of records) {
    const normalized = normalizeRecord(record);
    deduped.set(edgeKey(normalized.source, normalized.target, normalized.relation), normalized);
  }
  return Array.from(deduped.values()).sort(comparePythonRecords);
}

function comparePythonRecords(
  left: PythonOracleEdgeRecord,
  right: PythonOracleEdgeRecord
): number {
  if (left.source !== right.source) {
    return left.source.localeCompare(right.source);
  }
  if (left.target !== right.target) {
    return left.target.localeCompare(right.target);
  }
  const leftRelation = String(left.relation);
  const rightRelation = String(right.relation);
  return leftRelation.localeCompare(rightRelation);
}

function edgeKey(source: string, target: string, relation: string): string {
  return `${source}→${target}#${relation}`;
}

function normalizePath(candidate: string): string {
  return candidate.replace(/\\/g, "/");
}
