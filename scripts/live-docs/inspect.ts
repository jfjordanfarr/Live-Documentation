#!/usr/bin/env node
/**
 * Live Documentation inspect CLI.
 * 
 * Provides pathfinding capabilities across the Live Doc dependency graph.
 * Supports both file-level and symbol-level searches, and the walk from the
 * entry points that the Knowledge Sources panel shows; and, from the history
 * the history command computed, a file's wires and the walk from the entries
 * at a past commit (`--at`) and what changed between two commits
 * (`--between`).
 *
 * Usage: npm run live-docs:inspect -- [options]
 * 
 * @module inspect
 */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  normalizeLiveDocumentationConfig,
  type LiveDocumentationConfig,
  type LiveDocumentationConfigInput
} from "@live-documentation/engine/config/liveDocumentationConfig";
import { resolveDocLink, type GraphFile } from "@live-documentation/engine/live-docs/graph";
import { readLiveDocGraph } from "@live-documentation/engine/live-docs/graphFiles";
import {
  enumerateTerminalPaths,
  getNeighbors,
  reachFrom,
  reachability,
  searchGraph,
  searchSymbolPath,
  type Direction,
  type OneWay
} from "@live-documentation/engine/live-docs/pathfind";
import { relatedDocsOf } from "@live-documentation/engine/live-docs/relatedDocs";

import { endQuietlyWhenThePipeCloses, packageVersion } from "./cli";
import {
  emitDualDirectionResult,
  emitDualDirectionSymbolResult,
  emitFanoutResult,
  emitNotFound,
  emitPathResult,
  emitReachableFromEntries,
  emitReachableResult,
  emitSymbolPathNotFound,
  emitSymbolPathResult
} from "./inspect/emit";
import { emitBetween, emitFileAt, emitReachableAt, HistoryRefusal, readHistory, resolveStep } from "./inspect/history";
import { hasSymbolReference, resolveArtifactIdentifier, resolveSymbolReference } from "./inspect/resolve";

interface ParsedArgs {
  help: boolean;
  version: boolean;
  json: boolean;
  verbose: boolean;
  workspace?: string;
  configPath?: string;
  root?: string;
  baseLayer?: string;
  extension?: string;
  from?: string;
  to?: string;
  reachable: boolean;
  direction: Direction;
  /** Whether `--direction` was given, which the history's questions do not take. */
  directionGiven: boolean;
  maxDepth: number;
  at?: string;
  between?: [string, string];
}

const DEFAULT_MAX_DEPTH = 25;

async function main(): Promise<void> {
  endQuietlyWhenThePipeCloses();
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(usage());
    return;
  }

  if (args.version) {
    console.log(await packageVersion("engine"));
    return;
  }

  if (!args.from && !args.reachable && !args.between) {
    console.error("--from is required, unless --reachable asks what the entry points reach or --between what changed. See --help for usage details.");
    process.exit(1);
    return;
  }

  const workspaceRoot = path.resolve(args.workspace ?? process.cwd());

  let configFileInput: LiveDocumentationConfigInput = {};
  let resolvedConfigPath: string | undefined;
  if (args.configPath) {
    resolvedConfigPath = args.configPath;
  } else {
    const defaultConfigPath = path.join(workspaceRoot, ".live-docs.config.json");
    try {
      await fs.access(defaultConfigPath);
      resolvedConfigPath = defaultConfigPath;
    } catch {
      // No default config present.
    }
  }

  if (resolvedConfigPath) {
    configFileInput = await readConfigFile(resolvedConfigPath);
  }

  const configInput: LiveDocumentationConfig = normalizeLiveDocumentationConfig({
    ...DEFAULT_LIVE_DOCUMENTATION_CONFIG,
    ...configFileInput,
    root: args.root ?? configFileInput.root ?? DEFAULT_LIVE_DOCUMENTATION_CONFIG.root,
    baseLayer: args.baseLayer ?? configFileInput.baseLayer ?? DEFAULT_LIVE_DOCUMENTATION_CONFIG.baseLayer,
    extension: args.extension ?? configFileInput.extension ?? DEFAULT_LIVE_DOCUMENTATION_CONFIG.extension
  });

  if (args.at !== undefined || args.between !== undefined) {
    try {
      await answerFromHistory(args, workspaceRoot, configInput);
    } catch (error) {
      if (!(error instanceof HistoryRefusal)) {
        throw error;
      }
      console.error(error.message);
      process.exit(1);
    }
    return;
  }

  const graph = await readLiveDocGraph({ workspaceRoot, config: configInput });

  if (Object.keys(graph.files).length === 0) {
    console.error("No Live Docs found. Generate Live Documentation before running inspect.");
    process.exit(1);
    return;
  }

  const direction = args.direction;

  if (args.reachable && args.to) {
    console.error("--reachable lists what a path reaches from --from, or from the entry points; it takes no --to.");
    process.exit(1);
    return;
  }

  // What the entry points reach: every file something outside the code starts, walked along what it depends on.
  if (args.reachable && !args.from) {
    if (direction !== "outbound") {
      console.error("From the entry points the walk runs along what they depend on; --reachable without --from takes no --direction.");
      process.exit(1);
      return;
    }
    emitReachableFromEntries(reachability(graph, undefined, args.maxDepth), graph, args.maxDepth, args.json);
    return;
  }
  const from = args.from!;

  // Check if either input contains a symbol reference
  const fromHasSymbol = hasSymbolReference(from);
  const toHasSymbol = args.to ? hasSymbolReference(args.to) : false;

  // Symbol-aware pathfinding when symbols are specified
  if (fromHasSymbol || toHasSymbol) {
    const fromRef = resolveSymbolReference(from, workspaceRoot, configInput, graph);
    if (!fromRef) {
      console.error(`Unable to resolve --from '${from}'.`);
      process.exit(1);
      return;
    }

    if (args.to) {
      const toRef = resolveSymbolReference(args.to, workspaceRoot, configInput, graph);
      if (!toRef) {
        console.error(`Unable to resolve --to '${args.to}'.`);
        process.exit(1);
        return;
      }

      // Handle dual-direction search for symbols
      if (direction === "both") {
        const outboundResult = searchSymbolPath(graph, fromRef, toRef, "outbound", args.maxDepth);
        const inboundResult = searchSymbolPath(graph, fromRef, toRef, "inbound", args.maxDepth);
        emitDualDirectionSymbolResult(fromRef, toRef, outboundResult, inboundResult, graph, args.json);
        if (!outboundResult.found && !inboundResult.found) {
          process.exit(1);
        }
        return;
      }

      const result = searchSymbolPath(graph, fromRef, toRef, direction, args.maxDepth);
      if (result.found && result.path) {
        emitSymbolPathResult(result.path, fromRef, toRef, direction, graph, args.json);
        return;
      }

      emitSymbolPathNotFound(fromRef, toRef, direction, args.json);
      process.exit(1);
      return;
    }

    // Symbol fanout not yet implemented - fall back to file-level
    console.error("Symbol fanout (--from with symbol, no --to) is not yet supported. Use file-level fanout.");
    process.exit(1);
    return;
  }

  // Standard file-level pathfinding
  const fromId = resolveArtifactIdentifier(from, workspaceRoot, configInput, graph);
  if (!fromId) {
    console.error(`Unable to resolve --from '${from}'.`);
    process.exit(1);
    return;
  }

  if (args.to) {
    const toId = resolveArtifactIdentifier(args.to, workspaceRoot, configInput, graph);
    if (!toId) {
      console.error(`Unable to resolve --to '${args.to}'.`);
      process.exit(1);
      return;
    }

    // Handle dual-direction search
    if (direction === "both") {
      const outboundResult = searchGraph(graph, fromId, toId, "outbound", args.maxDepth);
      const inboundResult = searchGraph(graph, fromId, toId, "inbound", args.maxDepth);
      emitDualDirectionResult(fromId, toId, outboundResult, inboundResult, graph, args.json, args.verbose);
      // Exit with success if at least one path found
      if (!outboundResult.path && !inboundResult.path) {
        process.exit(1);
      }
      return;
    }

    const searchResult = searchGraph(graph, fromId, toId, direction, args.maxDepth);
    if (searchResult.path) {
      emitPathResult(searchResult.path, direction, graph, args.json, args.verbose);
      return;
    }

    emitNotFound(fromId, toId, direction, graph, searchResult, args.json, args.verbose);
    process.exit(1);
    return;
  }

  // Every file a path reaches, nearest first: the Explorer's destination field asks the same of the same walk
  if (args.reachable) {
    const ways: OneWay[] = direction === "both" ? ["outbound", "inbound"] : [direction];
    const reached = ways.map((way) => ({
      direction: way,
      files: [...reachFrom([fromId], (id) => getNeighbors(graph, id, way), args.maxDepth)]
        .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
        .map(([node, hops]) => ({ node, hops }))
    }));
    emitReachableResult(fromId, reached, graph, args.maxDepth, args.json, args.verbose);
    return;
  }

  if (direction === "both") {
    console.error("Terminal paths run one way: give --direction outbound or inbound, or add --reachable to list what a path reaches both ways.");
    process.exit(1);
    return;
  }

  const fanout = enumerateTerminalPaths(graph, fromId, direction, args.maxDepth);
  emitFanoutResult(fromId, direction, fanout, graph, args.maxDepth, args.json, args.verbose, documentsOf(graph.files[fromId], configInput));
}

/** A file's related documents, both ways: what its authored words cite, and what cites it by its doc's `Cited By` section. */
function documentsOf(file: GraphFile, config: LiveDocumentationConfig): { cites: string[]; citedBy: string[] } {
  return {
    cites: relatedDocsOf(file, config, config.bundleExclude),
    citedBy: (file.citedBy ?? []).map((entry) => resolveDocLink(file.docPath, entry.link) ?? entry.label)
  };
}

/**
 * A file's wires and the walk from the entries at a past commit, and what
 * changed between two, from the history: never from today's docs, which may
 * not hold the file.
 */
async function answerFromHistory(args: ParsedArgs, workspaceRoot: string, config: LiveDocumentationConfig): Promise<void> {
  if (args.at !== undefined && args.between !== undefined) {
    throw new HistoryRefusal("--at asks about one commit and --between about two; give one of them.");
  }
  if (args.to !== undefined || args.directionGiven) {
    throw new HistoryRefusal("From the history, --at answers a file's wires and the walk from the entries, and --between what changed; neither takes --to or --direction yet.");
  }
  if (args.between !== undefined) {
    if (args.from !== undefined || args.reachable) {
      throw new HistoryRefusal("--between lists what changed between two commits; it takes no --from or --reachable.");
    }
    const sequence = await readHistory(workspaceRoot, config);
    emitBetween(sequence, resolveStep(sequence, args.between[0]), resolveStep(sequence, args.between[1]), args.json);
    return;
  }
  if (args.from !== undefined && args.reachable) {
    throw new HistoryRefusal("At a commit, --from names a file whose wires to list and --reachable walks from the entries; give one of them.");
  }
  const sequence = await readHistory(workspaceRoot, config);
  const step = resolveStep(sequence, args.at!);
  if (args.from !== undefined) {
    emitFileAt(sequence, step, codePathOf(args.from, config), args.json);
    return;
  }
  emitReachableAt(sequence, step, config, args.maxDepth, args.json);
}

/** A file as the history names it: its workspace-relative path, also when given as its doc's path. */
function codePathOf(given: string, config: LiveDocumentationConfig): string {
  const normalized = given.replace(/\\/gu, "/").replace(/^(?:\.\/)+/u, "");
  const docsFolder = `${[config.root, config.baseLayer].map((segment) => segment.replace(/^(?:\.\/)+|\/+$/gu, "")).join("/")}/`;
  if (normalized.startsWith(docsFolder) && normalized.endsWith(config.extension)) {
    return normalized.slice(docsFolder.length, -config.extension.length);
  }
  return normalized;
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    help: false,
    version: false,
    json: false,
    verbose: false,
    reachable: false,
    direction: "outbound",
    directionGiven: false,
    maxDepth: DEFAULT_MAX_DEPTH
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    switch (current) {
      case "-h":
      case "--help": {
        parsed.help = true;
        break;
      }

      case "-v":
      case "--version": {
        parsed.version = true;
        break;
      }

      case "--json": {
        parsed.json = true;
        break;
      }

      case "--verbose": {
        parsed.verbose = true;
        break;
      }

      case "--workspace": {
        parsed.workspace = expectValue(argv, ++index, current);
        break;
      }

      case "--config": {
        parsed.configPath = expectValue(argv, ++index, current);
        break;
      }

      case "--root": {
        parsed.root = expectValue(argv, ++index, current);
        break;
      }

      case "--base-layer": {
        parsed.baseLayer = expectValue(argv, ++index, current);
        break;
      }

      case "--extension": {
        parsed.extension = expectValue(argv, ++index, current);
        break;
      }

      case "--from": {
        parsed.from = expectValue(argv, ++index, current);
        break;
      }

      case "--to": {
        parsed.to = expectValue(argv, ++index, current);
        break;
      }

      case "--reachable": {
        parsed.reachable = true;
        break;
      }

      case "--direction": {
        const value = expectValue(argv, ++index, current).toLowerCase();
        if (value !== "outbound" && value !== "inbound" && value !== "both") {
          throw new Error("--direction must be 'outbound', 'inbound', or 'both'.");
        }
        parsed.direction = value as Direction;
        parsed.directionGiven = true;
        break;
      }

      case "--at": {
        parsed.at = expectValue(argv, ++index, current);
        break;
      }

      case "--between": {
        parsed.between = [expectValue(argv, ++index, current), expectValue(argv, ++index, current)];
        break;
      }

      case "--max-depth": {
        const raw = expectValue(argv, ++index, current);
        const depth = Number.parseInt(raw, 10);
        if (!Number.isFinite(depth) || depth <= 0) {
          throw new Error("--max-depth must be a positive integer.");
        }
        parsed.maxDepth = depth;
        break;
      }

      default: {
        throw new Error(`Unknown argument '${current}'.`);
      }
    }
  }

  return parsed;
}

async function readConfigFile(configPath: string): Promise<LiveDocumentationConfigInput> {
  const resolved = path.resolve(configPath);
  const raw = await fs.readFile(resolved, "utf8");
  return JSON.parse(raw) as LiveDocumentationConfigInput;
}

function expectValue(argv: string[], index: number, flag: string): string {
  if (index >= argv.length) {
    throw new Error(`Expected value after ${flag}.`);
  }
  return argv[index];
}

function usage(): string {
  return `Usage: npm run live-docs:inspect -- [options]\n\n` +
    `Options:\n` +
    `  --from <path>            Starting artefact (code or Live Doc path).\n` +
    `                           Use path#Symbol syntax for symbol-level search.\n` +
    `  --to <path>              Target artefact. Omit to list terminal paths from --from.\n` +
    `                           Use path#Symbol syntax for symbol-level search.\n` +
    `  --reachable              List every file a path reaches from --from, nearest first, with its hops.\n` +
    `                           Without --from: the entry points, what they reach, what nothing reaches,\n` +
    `                           and what only a test reaches.\n` +
    `  --direction <dir>        Traversal direction: outbound (default) or inbound; both with --to or --reachable.\n` +
    `  --max-depth <n>          Maximum traversal depth (default ${DEFAULT_MAX_DEPTH}).\n` +
    `  --config <file>          Load configuration from JSON file.\n` +
    `  --json                   Emit JSON instead of text.\n` +
    `  --verbose                Include full symbol lists in output (default: slim).\n` +
    `  --at <commit>            From the history, at a commit (a prefix of its id): with --from, whether the\n` +
    `                           file existed and its wires; with --reachable, the walk from that commit's\n` +
    `                           entries. From the shape alone; npm run live-docs:history computes the history.\n` +
    `  --between <a> <b>        From the history, what changed from commit a to the later commit b: files born,\n` +
    `                           dead, renamed and resized, wires added and removed. From the shape alone.\n` +
    `  --workspace <path>       Workspace root (defaults to current working directory).\n` +
    `  --root <path>            Override liveDocumentation.root.\n` +
    `  --base-layer <name>      Override liveDocumentation.baseLayer.\n` +
    `  --extension <suffix>     Override liveDocumentation.extension.\n` +
    `  --version                Print inspect CLI version.\n` +
    `  --help                   Display this help text.\n` +
    `\nSymbol Reference Syntax:\n` +
    `  path/to/file.ts#SymbolName   Hash-separated (preferred, markdown-compatible)\n` +
    `  path/to/file.ts:SymbolName   Colon-separated (Windows-safe alternative)\n` +
    `\nExamples:\n` +
    `  npm run live-docs:inspect -- --from scripts/live-docs/generate.ts --to packages/engine/src/live-docs/core.ts\n` +
    `  npm run live-docs:inspect -- --from packages/generator/src/generator.ts#generateLiveDocs --to packages/engine/src/live-docs/core.ts#analyzeSourceFile --json\n` +
    `  npm run live-docs:inspect -- --from packages/engine/src/config/liveDocumentationConfig.ts --direction inbound --json\n` +
    `  npm run live-docs:inspect -- --from packages/engine/src/live-docs/graph.ts --reachable --direction both\n` +
    `  npm run live-docs:inspect -- --reachable --json\n` +
    `  npm run live-docs:inspect -- --at 690f5d27 --from packages/engine/src/live-docs/graph.ts\n` +
    `  npm run live-docs:inspect -- --between cad63bdd d23a6f90 --json\n`;
}

main().catch((error) => {
  console.error("live-docs:inspect failed");
  if (error instanceof Error) {
    console.error(error.message);
  }
  process.exit(1);
});
