#!/usr/bin/env node
/**
 * Live Documentation inspect CLI.
 * 
 * Provides pathfinding capabilities across the Live Doc dependency graph.
 * Supports both file-level and symbol-level searches, and the walk from the
 * entry points and the disconnected groups of the files that the Knowledge
 * Sources panel shows; and, from the history
 * the history command computed, a file's wires and the walk from the entries
 * at a past commit (`--at`) and what changed between two commits
 * (`--between`).
 *
 * Usage: npm run live-docs:inspect -- [options]
 * 
 * @module inspect
 */
import process from "node:process";

import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  normalizeLiveDocumentationConfig,
  type LiveDocumentationConfig
} from "@live-documentation/engine/config/liveDocumentationConfig";
import { resolveDocLink, type GraphFile, type LiveDocGraph } from "@live-documentation/engine/live-docs/graph";
import { readLiveDocGraph } from "@live-documentation/engine/live-docs/graphFiles";
import {
  fileGroups,
  getNeighbors,
  reachFrom,
  reachability,
  searchGraph,
  searchSymbolPath,
  under,
  endsApart,
  type Direction,
  type OneWay
} from "@live-documentation/engine/live-docs/pathfind";
import { relatedDocsOf } from "@live-documentation/engine/live-docs/relatedDocs";

import { endQuietlyWhenThePipeCloses, optionValue, packageVersion, readConfiguration, runCommand, UsageError, workspaceFolder } from "./cli";
import {
  emitDualDirectionResult,
  emitDualDirectionSymbolResult,
  emitNeighbourResult,
  emitGroups,
  emitNotFound,
  emitPathResult,
  emitReachableFromEntries,
  emitReachableResult,
  emitSymbolPathNotFound,
  emitSymbolPathResult
} from "./inspect/emit";
import { codePathOf, emitBetween, emitFileAt, emitLinksAt, emitReachableAt, emitWordsAt, historyFolder, HistoryRefusal, readHistory, resolveStep } from "./inspect/history";
import { hasSymbolReference, parseSymbolReference, resolveArtifactIdentifier, resolveSymbolReference } from "./inspect/resolve";

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
  /** Whether `--words` asks, with `--at` and `--from`, for the words of the file at that commit. */
  words: boolean;
  /** Whether `--groups` asks for the disconnected groups of the whole graph. */
  groups: boolean;
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

  if (args.groups && (args.from !== undefined || args.to !== undefined || args.directionGiven || args.reachable || args.at !== undefined || args.between !== undefined)) {
    console.error("--groups lists the disconnected groups of the whole graph as today's docs say; it takes no --from, --to, --direction, --reachable, --at or --between.");
    process.exit(1);
    return;
  }

  if (args.words && args.at === undefined) {
    console.error("--words prints a file's words at a past commit, from the history, and takes --at; today's words are in the file's Live Doc.");
    process.exit(1);
    return;
  }

  if (!args.from && !args.reachable && !args.between && !args.groups) {
    console.error("--from is required, unless --reachable asks what the entry points reach, --groups for the disconnected groups or --between what changed. See --help for usage details.");
    process.exit(1);
    return;
  }

  const workspaceRoot = workspaceFolder(args.workspace);

  const configFileInput = await readConfiguration(workspaceRoot, args.configPath);

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

  if (args.groups) {
    emitGroups(fileGroups(graph), graph, args.json);
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

  // Standard file-level pathfinding. An end is a file, or a directory standing for every file under it, as the
  // Explorer's path takes one (2026-11-22): both resolve a directory by the engine's `under`.
  const start = resolveEnd(from, workspaceRoot, configInput, graph);
  if (!start) {
    console.error(`Unable to resolve --from '${from}'.`);
    process.exit(1);
    return;
  }
  const fromId = start.label;

  if (args.to) {
    const end = resolveEnd(args.to, workspaceRoot, configInput, graph);
    if (!end) {
      console.error(`Unable to resolve --to '${args.to}'.`);
      process.exit(1);
      return;
    }
    const toId = end.label;
    // Two ends that share files: the outer is taken without the inner, and one end asked twice is no path.
    const asked = { from: fromId, to: toId, narrowed: endsApart(start.files, end.files).narrowed };

    // Handle dual-direction search
    if (direction === "both") {
      const outboundResult = searchGraph(graph, start.files, end.files, "outbound", args.maxDepth);
      const inboundResult = searchGraph(graph, start.files, end.files, "inbound", args.maxDepth);
      emitDualDirectionResult(fromId, toId, outboundResult, inboundResult, graph, args.json, args.verbose, asked);
      // Exit with success if at least one path found
      if (!outboundResult.path && !inboundResult.path) {
        process.exit(1);
      }
      return;
    }

    // Without --direction the route is found whichever way the dependency runs and told as asked: along what --from
    // uses first, else along what uses it (2026-11-22). --direction keeps the search to one way.
    const searchResult = searchGraph(graph, start.files, end.files, direction, args.maxDepth);
    if (searchResult.path) {
      emitPathResult(searchResult.path, direction, graph, args.json, args.verbose, asked);
      return;
    }
    if (!args.directionGiven) {
      const against = searchGraph(graph, start.files, end.files, "inbound", args.maxDepth);
      if (against.path) {
        emitPathResult(against.path, "inbound", graph, args.json, args.verbose, asked);
        return;
      }
      emitNotFound(fromId, toId, direction, graph, searchResult, args.json, args.verbose, undefined, true, asked);
      process.exit(1);
      return;
    }

    const back = searchGraph(graph, end.files, start.files, direction, args.maxDepth).path;
    emitNotFound(fromId, toId, direction, graph, searchResult, args.json, args.verbose, back ? { hops: back.length - 1 } : undefined, asked.narrowed === "same", asked);
    process.exit(1);
    return;
  }

  // Every file a path reaches, nearest first: the Explorer's destination field asks the same of the same walk; from a
  // directory, every file a path reaches from any of its files, its own files not listed.
  if (args.reachable) {
    const ways: OneWay[] = direction === "both" ? ["outbound", "inbound"] : [direction];
    const own = new Set(start.files);
    const reached = ways.map((way) => ({
      direction: way,
      files: [...reachFrom(start.files, (id) => getNeighbors(graph, id, way), args.maxDepth)]
        .filter(([node]) => !own.has(node))
        .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
        .map(([node, hops]) => ({ node, hops }))
    }));
    emitReachableResult(fromId, reached, graph, args.maxDepth, args.json, args.verbose);
    return;
  }

  if (start.directory) {
    console.error(`${from} is a directory: give --to for a path from any of its files, or --reachable for what they reach.`);
    process.exit(1);
    return;
  }

  // A file alone: its direct neighbours each way asked, counted and bounded (until 2026-11-22, every terminal path whole)
  const ways: OneWay[] = direction === "both" ? ["outbound", "inbound"] : [direction];
  const neighbours = ways.map((way) => ({ direction: way, files: [...new Set(getNeighbors(graph, fromId, way))].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)) }));
  emitNeighbourResult(fromId, neighbours, graph, args.json, args.verbose, documentsOf(graph.files[fromId], configInput));
}

/**
 * An end of a path or a reach: a file the docs know, or else a directory holding some, standing for every file under
 * it by the engine's `under`, the rule the Explorer's path ends use. A directory is named as typed, with or without a
 * closing slash, and found in any case when not as spelled; its label ends in a slash.
 */
function resolveEnd(typed: string, workspaceRoot: string, config: LiveDocumentationConfig, graph: LiveDocGraph): { label: string; files: string[]; directory?: string } | undefined {
  const file = resolveArtifactIdentifier(typed, workspaceRoot, config, graph);
  if (file) {
    return { label: file, files: [file] };
  }
  const directory = typed.replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/+$/, "");
  if (directory === "" || directory === ".") {
    return undefined;
  }
  const ids = Object.keys(graph.files).sort();
  let files = ids.filter((id) => under(id, directory));
  let spelled = directory;
  if (files.length === 0) {
    // In another case: one directory answering to the name is that directory, named back as it is spelled; two or
    // more are named back to the person, as two files that differ by case are (the engine review of 2026-11-22).
    const folded = directory.toLowerCase();
    const spellings = [...new Set(ids.filter((id) => under(id.toLowerCase(), folded)).map((id) => id.slice(0, directory.length)))].sort();
    if (spellings.length > 1) {
      throw new UsageError(`${typed} names ${spellings.length} directories that differ only in case: ${spellings.join(", ")}; give one as it is spelled.`);
    }
    if (spellings.length === 1) {
      spelled = spellings[0];
      files = ids.filter((id) => under(id, spelled));
    }
  }
  return files.length > 0 ? { label: `${spelled}/`, files, directory: spelled } : undefined;
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
  if (args.directionGiven || (args.to !== undefined && args.at === undefined)) {
    throw new HistoryRefusal("From the history, --at answers a file's rows, the links between two files or symbols with --to, and the walk from the entries, and --between what changed; neither takes --direction, nor --between --to.");
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
  if (args.words) {
    if (args.from === undefined || args.to !== undefined || args.reachable) {
      throw new HistoryRefusal("At a commit, --words prints the words of the file --from names; it takes no --to or --reachable.");
    }
    await emitWordsAt(sequence, step, codePathOf(args.from, config), historyFolder(workspaceRoot, config), args.json);
    return;
  }
  if (args.to !== undefined) {
    if (args.from === undefined || args.reachable) {
      throw new HistoryRefusal("At a commit, --to lists the links between --from and it; give --from and no --reachable.");
    }
    const end = (given: string): { codePath: string; symbol?: string } => {
      const reference = parseSymbolReference(given);
      return { codePath: codePathOf(reference.path, config), ...(reference.symbol !== undefined ? { symbol: reference.symbol } : {}) };
    };
    emitLinksAt(sequence, step, end(args.from), end(args.to), args.json);
    return;
  }
  if (args.from !== undefined) {
    emitFileAt(sequence, step, codePathOf(args.from, config), args.json);
    return;
  }
  emitReachableAt(sequence, step, config, args.maxDepth, args.json);
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    help: false,
    version: false,
    json: false,
    verbose: false,
    reachable: false,
    words: false,
    groups: false,
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
        parsed.workspace = optionValue(argv, ++index, current);
        break;
      }

      case "--config": {
        parsed.configPath = optionValue(argv, ++index, current);
        break;
      }

      case "--root": {
        parsed.root = optionValue(argv, ++index, current);
        break;
      }

      case "--base-layer": {
        parsed.baseLayer = optionValue(argv, ++index, current);
        break;
      }

      case "--extension": {
        parsed.extension = optionValue(argv, ++index, current);
        break;
      }

      case "--from": {
        parsed.from = optionValue(argv, ++index, current);
        break;
      }

      case "--to": {
        parsed.to = optionValue(argv, ++index, current);
        break;
      }

      case "--words": {
        parsed.words = true;
        break;
      }
      case "--reachable": {
        parsed.reachable = true;
        break;
      }

      case "--groups": {
        parsed.groups = true;
        break;
      }

      case "--direction": {
        const value = optionValue(argv, ++index, current).toLowerCase();
        if (value !== "outbound" && value !== "inbound" && value !== "both") {
          throw new UsageError("--direction takes outbound, inbound or both.");
        }
        parsed.direction = value as Direction;
        parsed.directionGiven = true;
        break;
      }

      case "--at": {
        parsed.at = optionValue(argv, ++index, current);
        break;
      }

      case "--between": {
        parsed.between = [optionValue(argv, ++index, current), optionValue(argv, ++index, current)];
        break;
      }

      case "--max-depth": {
        const raw = optionValue(argv, ++index, current);
        const depth = Number.parseInt(raw, 10);
        if (!Number.isFinite(depth) || depth <= 0) {
          throw new UsageError("--max-depth takes a whole number of one or more.");
        }
        parsed.maxDepth = depth;
        break;
      }

      default: {
        throw new UsageError(current.startsWith("-") ? `${current} is not an option.` : `${current} is not an option; name a file with --from.`);
      }
    }
  }

  return parsed;
}

function usage(): string {
  return `Usage: npm run live-docs:inspect -- [options]\n\n` +
    `Options:\n` +
    `  --from <path>            Starting artefact (code or Live Doc path).\n` +
    `                           Use path#Symbol syntax for symbol-level search, which needs --to.\n` +
    `  --to <path>              Target artefact. Omit for the direct neighbours of a file named by --from, counted.\n` +
    `                           Use path#Symbol syntax for symbol-level search.\n` +
    `  --reachable              List every file a path reaches from --from, nearest first, with its hops.\n` +
    `                           Without --from: the entry points, what they reach, what nothing reaches,\n` +
    `                           and what only a test reaches.\n` +
    `  --groups                 The disconnected groups of the files: two or more joined by dependencies, either\n` +
    `                           way; each by its seed (its most connected file, ties by path) and its size,\n` +
    `                           largest first; then the files joined to none. Takes no --from, --to or --direction.\n` +
    `                           With --json: { kind: "groups", files, groups: [{ seed, size, members }], alone }.\n` +
    `  --direction <dir>        Traversal direction: outbound (default), inbound or both.\n` +
    `  --max-depth <n>          Maximum traversal depth (default ${DEFAULT_MAX_DEPTH}).\n` +
    `  --config <file>          The configuration (default: the workspace's .live-docs.config.json when it\n` +
    `                           has one, else the shipped defaults).\n` +
    `  --json                   Emit JSON instead of text.\n` +
    `  --verbose                Include full symbol lists in output (default: slim).\n` +
    `  --at <commit>            From the history, at a commit (a prefix of its id): with --from, whether the\n` +
    `                           file existed, its symbols, dependency lines and links that day; with --from\n` +
    `                           and --to, the links between two files, or two symbols as path#Symbol; with\n` +
    `                           --reachable, the walk from that commit's entries, from the shape alone.\n` +
    `                           npm run live-docs:history computes the history.\n` +
    `  --words                  With --at and --from, the file's words that day: its authored block and each\n` +
    `                           symbol's description, or why they cannot be read.\n` +
    `  --between <a> <b>        From the history, what changed from commit a to the later commit b: files created,\n` +
    `                           deleted, renamed and resized, wires added and removed. From the shape alone.\n` +
    `  --workspace <path>       Workspace root (default: the nearest folder, from the current directory up,\n` +
    `                           that holds a .live-docs.config.json; else the current directory).\n` +
    `  --root <path>            In place of the configuration's root.\n` +
    `  --base-layer <name>      In place of the configuration's baseLayer.\n` +
    `  --extension <suffix>     In place of the configuration's extension.\n` +
    `  -v, --version            Print the engine's version.\n` +
    `  -h, --help               Print this help.\n` +
    `\nSymbol Reference Syntax:\n` +
    `  path/to/file.ts#SymbolName   Hash-separated (preferred, markdown-compatible)\n` +
    `  path/to/file.ts:SymbolName   Colon-separated (Windows-safe alternative)\n` +
    `\nExamples:\n` +
    `  npm run live-docs:inspect -- --from scripts/live-docs/generate.ts --to packages/engine/src/live-docs/core.ts\n` +
    `  npm run live-docs:inspect -- --from packages/generator/src/generator.ts#generateLiveDocs --to packages/engine/src/live-docs/core.ts#analyzeSourceFile --json\n` +
    `  npm run live-docs:inspect -- --from packages/engine/src/config/liveDocumentationConfig.ts --direction inbound --json\n` +
    `  npm run live-docs:inspect -- --from packages/engine/src/live-docs/graph.ts --reachable --direction both\n` +
    `  npm run live-docs:inspect -- --reachable --json\n` +
    `  npm run live-docs:inspect -- --groups\n` +
    `  npm run live-docs:inspect -- --at 690f5d27 --from packages/engine/src/live-docs/graph.ts\n` +
    `  npm run live-docs:inspect -- --between cad63bdd d23a6f90 --json\n`;
}

runCommand("live-docs:inspect", main);
