#!/usr/bin/env node
import * as fs from "node:fs";
import * as path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import {
  GraphStore,
  type KnowledgeArtifact,
  type LinkRelationshipKind,
  type SymbolNeighborGroup
} from "@live-documentation/shared";

import { inspectSymbolNeighbors } from "../../packages/server/src/features/dependencies/symbolNeighbors";

interface ParsedArgs {
  helpRequested: boolean;
  listKindsRequested: boolean;
  dbPath?: string;
  workspace?: string;
  artifactId?: string;
  artifactUri?: string;
  maxDepth?: number;
  maxResults?: number;
  linkKinds?: LinkRelationshipKind[];
  jsonOutput: boolean;
}

const KNOWN_LINK_KINDS: LinkRelationshipKind[] = [
  "depends_on",
  "implements",
  "documents",
  "references"
];

const EXIT_SUCCESS = 0;
const EXIT_INVALID_ARGS = 1;
const EXIT_MISSING_DB = 2;
const EXIT_NOT_FOUND = 3;
const EXIT_UNCAUGHT_ERROR = 4;

export function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    helpRequested: false,
    listKindsRequested: false,
    jsonOutput: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    switch (current) {
      case "-h":
      case "--help": {
        parsed.helpRequested = true;
        break;
      }

      case "--list-kinds": {
        parsed.listKindsRequested = true;
        break;
      }

      case "--json": {
        parsed.jsonOutput = true;
        break;
      }

      case "--db": {
        parsed.dbPath = expectValue(argv, ++index, current);
        break;
      }

      case "--workspace": {
        parsed.workspace = expectValue(argv, ++index, current);
        break;
      }

      case "--id": {
        parsed.artifactId = expectValue(argv, ++index, current);
        break;
      }

      case "--uri": {
        parsed.artifactUri = expectValue(argv, ++index, current);
        break;
      }

      case "--file": {
        const filePath = expectValue(argv, ++index, current);
        parsed.artifactUri = pathToFileURL(path.resolve(filePath)).href;
        break;
      }

      case "--max-depth": {
        parsed.maxDepth = expectNumeric(argv, ++index, current);
        break;
      }

      case "--max-results": {
        parsed.maxResults = expectNumeric(argv, ++index, current);
        break;
      }

      case "--kinds": {
        const rawKinds = expectValue(argv, ++index, current);
        parsed.linkKinds = rawKinds
          .split(",")
          .map(kind => kind.trim())
          .filter(Boolean)
          .map(validateKind);
        break;
      }

      default: {
        if (current.startsWith("-")) {
          throw new Error(`Unrecognised option: ${current}`);
        }

        const candidate = current.trim();
        if (candidate.length === 0) {
          break;
        }

        if (!parsed.artifactId && !parsed.artifactUri) {
          if (candidate.includes(":")) {
            parsed.artifactUri = candidate;
          } else if (fs.existsSync(candidate)) {
            parsed.artifactUri = pathToFileURL(path.resolve(candidate)).href;
          } else {
            parsed.artifactId = candidate;
          }
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

function expectNumeric(argv: string[], index: number, flag: string): number {
  const raw = expectValue(argv, index, flag);
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`Option ${flag} requires a positive integer; received “${raw}”.`);
  }
  return parsed;
}

function validateKind(candidate: string): LinkRelationshipKind {
  if ((KNOWN_LINK_KINDS as ReadonlyArray<string>).includes(candidate)) {
    return candidate as LinkRelationshipKind;
  }

  throw new Error(
    `Unknown link relationship kind “${candidate}”. Known kinds: ${KNOWN_LINK_KINDS.join(", ")}.`
  );
}

function usage(): string {
  return `Usage: npm run graph:inspect -- [options]\n\n` +
    `Target selection:\n` +
    `  --id <artifact-id>             Query by stored artifact id.\n` +
    `  --uri <file-uri>              Query by file URI.\n` +
    `  --file <path>                 Query by file system path (converted to file URI).\n\n` +
    `Traversal options:\n` +
    `  --max-depth <n>               Hop depth (default 2).\n` +
    `  --max-results <n>             Result limit (default 50).\n` +
    `  --kinds <k1,k2>               Comma-separated link kinds (${KNOWN_LINK_KINDS.join(", ")}).\n\n` +
    `Database discovery:\n` +
    `  --db <path>                   Explicit SQLite database path.\n` +
    `  --workspace <path>            Workspace root used to locate .live-documentation storage.\n\n` +
    `Output controls:\n` +
    `  --json                       Emit raw JSON instead of formatted text.\n` +
    `  --list-kinds                 Print recognised link relationship kinds.\n` +
    `  --help                       Display this help text.\n` +
    `\nExamples:\n` +
    `  npm run graph:inspect -- --file packages/server/src/main.ts\n` +
    `  npm run graph:inspect -- --id artifact-123 --max-depth 3 --kinds depends_on,implements\n` +
    `  npm run graph:inspect -- --db ../.live-documentation/live-documentation.db --json\n`;
}

function listKinds(): void {
  console.log("Known relationship kinds:");
  for (const kind of KNOWN_LINK_KINDS) {
    console.log(`  - ${kind}`);
  }
}

function resolveDatabasePath(options: ParsedArgs): string {
  if (options.dbPath) {
    return path.resolve(options.dbPath);
  }

  const workspace = options.workspace ? path.resolve(options.workspace) : process.cwd();
  return path.join(workspace, ".live-documentation", "live-documentation.db");
}

function formatConfidence(confidence: number): string {
  const percentage = Math.round(confidence * 1000) / 10;
  return `${percentage}%`;
}

function renderGroups(groups: SymbolNeighborGroup[]): void {
  for (const group of groups) {
    console.log(`\n[${group.kind}]`);
    for (const neighbor of group.neighbors) {
      const depthLabel = neighbor.depth === 1 ? "hop" : "hops";
      const directionArrow = neighbor.direction === "outgoing" ? "→" : "←";
      console.log(
        `  - ${neighbor.artifact.uri} (${neighbor.artifact.id}) ${directionArrow} ` +
          `${neighbor.depth} ${depthLabel} | confidence ${formatConfidence(neighbor.confidence)}`
      );

      const pathArtifacts = neighbor.path.artifacts.map(
        (artifact: KnowledgeArtifact) => artifact.uri
      );
      if (pathArtifacts.length > 1) {
        console.log(`    path: ${pathArtifacts.join(" -> ")}`);
      }
    }
  }
}

export function printResult(
  options: ParsedArgs,
  result: ReturnType<typeof inspectSymbolNeighbors>
): number {
  if (!result.origin) {
    console.error("No artifact matched the provided target.");
    return EXIT_NOT_FOUND;
  }

  if (options.jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return EXIT_SUCCESS;
  }

  console.log(`Origin: ${result.origin.uri} (${result.origin.id})`);
  console.log(`Neighbors: ${result.summary.totalNeighbors}`);
  console.log(`Max depth reached: ${result.summary.maxDepthReached}`);

  if (result.summary.totalNeighbors === 0) {
    return EXIT_SUCCESS;
  }

  renderGroups(result.groups);
  return EXIT_SUCCESS;
}

export function main(): void {
  let parsed: ParsedArgs;
  try {
    parsed = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error((error as Error).message);
    console.error(usage());
    process.exit(EXIT_INVALID_ARGS);
    return;
  }

  if (parsed.helpRequested) {
    console.log(usage());
    process.exit(EXIT_SUCCESS);
    return;
  }

  if (parsed.listKindsRequested) {
    listKinds();
    process.exit(EXIT_SUCCESS);
    return;
  }

  if (!parsed.artifactId && !parsed.artifactUri) {
    console.error("You must provide an artifact id, file path, or URI (see --help).\n");
    console.error(usage());
    process.exit(EXIT_INVALID_ARGS);
    return;
  }

  const dbPath = resolveDatabasePath(parsed);
  if (!fs.existsSync(dbPath)) {
    console.error(`Graph database not found at ${dbPath}.`);
    console.error("Run the extension or language server once to generate the SQLite cache, or pass --db.");
    process.exit(EXIT_MISSING_DB);
    return;
  }

  const store = new GraphStore({ dbPath });
  try {
    const result = inspectSymbolNeighbors({
      graphStore: store,
      artifactId: parsed.artifactId,
      artifactUri: parsed.artifactUri,
      maxDepth: parsed.maxDepth,
      maxResults: parsed.maxResults,
      linkKinds: parsed.linkKinds
    });

    const exitCode = printResult(parsed, result);
    process.exit(exitCode);
  } catch (error) {
    console.error("Failed to inspect symbol neighbors.");
    if (error instanceof Error) {
      console.error(error.stack ?? error.message);
    } else {
      console.error(String(error));
    }
    process.exit(EXIT_UNCAUGHT_ERROR);
  } finally {
    store.close();
  }
}

main();
