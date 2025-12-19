#!/usr/bin/env node
/**
 * Live Documentation inspect CLI.
 * 
 * Provides pathfinding capabilities across the Live Doc dependency graph.
 * Supports both file-level and symbol-level searches.
 * 
 * Usage: npm run live-docs:inspect -- [options]
 * 
 * @module inspect
 */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { buildLiveDocGraph } from "@live-documentation/scripts/live-docs/graph/liveDocGraph";
import {
  type Direction,
  hasSymbolReference,
  resolveSymbolReference,
  resolveArtifactIdentifier,
  searchGraph,
  searchSymbolPath,
  enumerateTerminalPaths,
  emitPathResult,
  emitNotFound,
  emitFanoutResult,
  emitSymbolPathResult,
  emitSymbolPathNotFound,
  emitDualDirectionResult,
  emitDualDirectionSymbolResult
} from "@live-documentation/scripts/live-docs/inspect";
import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  normalizeLiveDocumentationConfig,
  type LiveDocumentationConfig,
  type LiveDocumentationConfigInput
} from "@live-documentation/shared/config/liveDocumentationConfig";

// Import from extracted modules

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
  direction: Direction;
  maxDepth: number;
}

const DEFAULT_MAX_DEPTH = 25;

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(usage());
    return;
  }

  if (args.version) {
    const version = process.env.LIVE_DOCS_INSPECT_VERSION ?? "0.1.0";
    console.log(version);
    return;
  }

  if (!args.from) {
    console.error("--from is required. See --help for usage details.");
    process.exit(1);
    return;
  }

  const workspaceRoot = path.resolve(args.workspace ?? process.cwd());

  const hasExplicitConfigOverrides = Boolean(
    args.configPath || args.root || args.baseLayer || args.extension
  );

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

  let configInput: LiveDocumentationConfig = normalizeLiveDocumentationConfig({
    ...DEFAULT_LIVE_DOCUMENTATION_CONFIG,
    ...configFileInput,
    root: args.root ?? configFileInput.root ?? DEFAULT_LIVE_DOCUMENTATION_CONFIG.root,
    baseLayer: args.baseLayer ?? configFileInput.baseLayer ?? DEFAULT_LIVE_DOCUMENTATION_CONFIG.baseLayer,
    extension: args.extension ?? configFileInput.extension ?? DEFAULT_LIVE_DOCUMENTATION_CONFIG.extension
  });

  let graph = await buildLiveDocGraph({ workspaceRoot, config: configInput });
  if (graph.nodes.size === 0 && !hasExplicitConfigOverrides) {
    // Back-compat fallback: older workspaces (and some fixtures) may still use the
    // MDMD-oriented defaults. Only attempt this when the user did not explicitly
    // choose a config (flags or --config).
    const legacyConfig = normalizeLiveDocumentationConfig({
      ...DEFAULT_LIVE_DOCUMENTATION_CONFIG,
      root: ".mdmd",
      baseLayer: "layer-4",
      extension: ".mdmd.md"
    });

    const legacyGraph = await buildLiveDocGraph({ workspaceRoot, config: legacyConfig });
    if (legacyGraph.nodes.size > 0) {
      configInput = legacyConfig;
      graph = legacyGraph;
    }
  }

  if (graph.nodes.size === 0) {
    console.error("No Live Docs found. Generate Live Documentation before running inspect.");
    process.exit(1);
    return;
  }

  const direction = args.direction;

  // Check if either input contains a symbol reference
  const fromHasSymbol = hasSymbolReference(args.from);
  const toHasSymbol = args.to ? hasSymbolReference(args.to) : false;

  // Symbol-aware pathfinding when symbols are specified
  if (fromHasSymbol || toHasSymbol) {
    const fromRef = resolveSymbolReference(args.from, workspaceRoot, configInput, graph);
    if (!fromRef) {
      console.error(`Unable to resolve --from '${args.from}'.`);
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
  const fromId = resolveArtifactIdentifier(args.from, workspaceRoot, configInput, graph);
  if (!fromId) {
    console.error(`Unable to resolve --from '${args.from}'.`);
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

  const fanout = enumerateTerminalPaths(graph, fromId, direction, args.maxDepth);
  emitFanoutResult(fromId, direction, fanout, graph, args.maxDepth, args.json, args.verbose);
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    help: false,
    version: false,
    json: false,
    verbose: false,
    direction: "outbound",
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

      case "--direction": {
        const value = expectValue(argv, ++index, current).toLowerCase();
        if (value !== "outbound" && value !== "inbound" && value !== "both") {
          throw new Error("--direction must be 'outbound', 'inbound', or 'both'.");
        }
        parsed.direction = value as Direction;
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
    `  --direction <dir>        Traversal direction: outbound (default) or inbound.\n` +
    `  --max-depth <n>          Maximum traversal depth (default ${DEFAULT_MAX_DEPTH}).\n` +
    `  --config <file>          Load configuration from JSON file.\n` +
    `  --json                   Emit JSON instead of text.\n` +
    `  --verbose                Include full symbol lists in output (default: slim).\n` +
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
    `  npm run live-docs:inspect -- --from packages/server/src/main.ts --to packages/shared/src/index.ts\n` +
    `  npm run live-docs:inspect -- --from packages/server/src/main.ts#startServer --to packages/shared/src/index.ts#GraphStore --json\n` +
    `  npm run live-docs:inspect -- --from packages/server/src/index.ts --direction inbound --json\n`;
}

main().catch((error) => {
  console.error("live-docs:inspect failed");
  if (error instanceof Error) {
    console.error(error.message);
  }
  process.exit(1);
});
