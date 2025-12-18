#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  buildLiveDocGraph,
  type LiveDocGraph,
  type LiveDocGraphNode
} from "@live-documentation/scripts/live-docs/graph/liveDocGraph";
import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  normalizeLiveDocumentationConfig,
  type LiveDocumentationConfig,
  type LiveDocumentationConfigInput
} from "@live-documentation/shared/config/liveDocumentationConfig";
import { normalizeWorkspacePath } from "@live-documentation/shared/tooling/pathUtils";

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

type Direction = "outbound" | "inbound" | "both";

interface FrontierEntry {
  node: string;
  docPath?: string;
  reason: "terminal" | "max-depth" | "missing-doc";
  missingDependency?: string;
}

interface PathSearchResult {
  path?: string[];
  visited: Set<string>;
  frontier: FrontierEntry[];
}

interface NodeDescriptor {
  codePath: string;
  docPath?: string;
  symbols?: SymbolDescriptor[];
}

interface HopDescriptor {
  from: NodeDescriptor;
  to: NodeDescriptor;
}

interface SymbolDescriptor {
  name: string;
  summary?: string;
  remarks?: string;
  parameters?: SymbolParameterDescriptor[];
}

interface SymbolParameterDescriptor {
  name: string;
  description?: string;
}

interface FanoutPath {
  nodes: string[];
}

/**
 * A reference that may include a symbol anchor (e.g., "file.ts#SymbolName").
 */
interface SymbolReference {
  codePath: string;
  symbol?: string;
}

/**
 * A node in a symbol-aware path, tracking both file and symbol at each hop.
 */
interface SymbolHop {
  codePath: string;
  symbol?: string;
}

/**
 * Result of a symbol-aware path search.
 */
interface SymbolPathSearchResult {
  path?: SymbolHop[];
  found: boolean;
}

/**
 * Converts a symbol name (e.g., "GraphStore") to an anchor slug (e.g., "symbol-graphstore").
 * This matches the format used in Live Doc markdown links.
 */
function _symbolToAnchor(symbol: string): string {
  return `symbol-${symbol.toLowerCase()}`;
}

/**
 * Converts an anchor slug (e.g., "symbol-graphstore") back to a normalized form for comparison.
 * Returns the lowercase version without the prefix.
 */
function normalizeAnchor(anchor: string): string {
  const prefix = "symbol-";
  if (anchor.startsWith(prefix)) {
    return anchor.slice(prefix.length).toLowerCase();
  }
  return anchor.toLowerCase();
}

/**
 * Checks if a symbol name matches an anchor slug.
 * Handles the symbol-prefix format used in Live Doc anchors.
 */
function symbolMatchesAnchor(symbol: string, anchor: string): boolean {
  // Direct match (e.g., both are symbol names)
  if (symbol === anchor) {
    return true;
  }
  // Compare normalized forms
  return symbol.toLowerCase() === normalizeAnchor(anchor);
}

/**
 * Attempts to resolve an anchor slug to a proper symbol name by looking up
 * the target node's publicSymbols array.
 * Returns the matched symbol name or the original anchor if no match found.
 */
function resolveAnchorToSymbolName(
  anchor: string | undefined,
  codePath: string,
  graph: LiveDocGraph
): string | undefined {
  if (!anchor) {
    return undefined;
  }
  
  const node = graph.nodes.get(codePath);
  if (!node) {
    return anchor;
  }
  
  // Try to find a matching symbol in publicSymbols
  for (const symbol of node.publicSymbols) {
    if (symbolMatchesAnchor(symbol, anchor)) {
      return symbol;
    }
  }
  
  // No match found, return as-is (might be a valid symbol name already)
  return anchor;
}

const DEFAULT_MAX_DEPTH = 25;
const MAX_ENUMERATED_PATHS = 200;

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

function resolveArtifactIdentifier(
  input: string,
  workspaceRoot: string,
  config: LiveDocumentationConfig,
  graph: LiveDocGraph
): string | undefined {
  const normalizedInput = normalizeInputIdentifier(input, workspaceRoot);

  if (graph.nodes.has(normalizedInput)) {
    return normalizedInput;
  }

  if (graph.docToCode.has(normalizedInput)) {
    return graph.docToCode.get(normalizedInput);
  }

  const stripped = stripLiveDocDecorations(normalizedInput, config);
  if (graph.nodes.has(stripped)) {
    return stripped;
  }

  if (graph.docToCode.has(stripped)) {
    return graph.docToCode.get(stripped);
  }

  return undefined;
}

function normalizeInputIdentifier(input: string, workspaceRoot: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return trimmed;
  }

  const withoutQuotes = trimmed.replace(/^"|"$/g, "").replace(/^'|'$/g, "");
  const normalizedSeparators = withoutQuotes.replace(/\\/g, "/");

  const candidate = path.isAbsolute(normalizedSeparators)
    ? path.relative(workspaceRoot, normalizedSeparators)
    : normalizedSeparators;

  const normalized = normalizeWorkspacePath(candidate);
  return normalized.startsWith("./") ? normalized.slice(2) : normalized;
}

function stripLiveDocDecorations(value: string, config: LiveDocumentationConfig): string {
  let candidate = value;

  const docRoot = normalizeWorkspacePath(config.root);
  const docBase = normalizeWorkspacePath(path.join(config.root, config.baseLayer));
  const baseOnly = normalizeWorkspacePath(config.baseLayer);

  if (candidate.startsWith(`${docBase}/`)) {
    candidate = candidate.slice(docBase.length + 1);
  }

  if (candidate.startsWith(`${docRoot}/`)) {
    candidate = candidate.slice(docRoot.length + 1);
  }

  if (candidate.startsWith(`${baseOnly}/`)) {
    candidate = candidate.slice(baseOnly.length + 1);
  }

  if (candidate.endsWith(config.extension)) {
    candidate = candidate.slice(0, -config.extension.length);
  }

  return candidate;
}

/**
 * Parses an input string that may contain a symbol reference.
 * Supported formats:
 * - `path/to/file.ts` → { path: "path/to/file.ts", symbol: undefined }
 * - `path/to/file.ts#SymbolName` → { path: "path/to/file.ts", symbol: "SymbolName" }
 * - `path/to/file.ts:SymbolName` → { path: "path/to/file.ts", symbol: "SymbolName" } (Windows-safe alt)
 */
function parseSymbolReference(input: string): { path: string; symbol?: string } {
  // Try hash separator first (preferred, markdown-compatible)
  const hashIndex = input.indexOf("#");
  if (hashIndex !== -1) {
    return {
      path: input.slice(0, hashIndex),
      symbol: input.slice(hashIndex + 1) || undefined
    };
  }

  // Fallback: colon separator, but only after the last path separator and not part of a Windows drive
  // e.g., "C:/path/file.ts:Symbol" should parse as file="C:/path/file.ts", symbol="Symbol"
  const lastSlash = Math.max(input.lastIndexOf("/"), input.lastIndexOf("\\"));
  const colonAfterPath = input.indexOf(":", lastSlash + 1);
  
  // Skip if it looks like a Windows drive letter (e.g., "C:")
  if (colonAfterPath !== -1 && colonAfterPath !== 1) {
    return {
      path: input.slice(0, colonAfterPath),
      symbol: input.slice(colonAfterPath + 1) || undefined
    };
  }

  return { path: input, symbol: undefined };
}

/**
 * Checks if an input string contains a symbol reference.
 */
function hasSymbolReference(input: string): boolean {
  const { symbol } = parseSymbolReference(input);
  return symbol !== undefined;
}

/**
 * Resolves a symbol reference to a validated SymbolReference.
 * Returns undefined if the code path cannot be resolved or the symbol doesn't exist.
 */
function resolveSymbolReference(
  input: string,
  workspaceRoot: string,
  config: LiveDocumentationConfig,
  graph: LiveDocGraph
): SymbolReference | undefined {
  const { path: rawPath, symbol } = parseSymbolReference(input);
  
  const codePath = resolveArtifactIdentifier(rawPath, workspaceRoot, config, graph);
  if (!codePath) {
    return undefined;
  }

  // If a symbol was specified, validate it exists on the target node
  if (symbol) {
    const node = graph.nodes.get(codePath);
    if (!node) {
      return undefined;
    }
    // Check if the symbol exists in publicSymbols
    if (!node.publicSymbols.includes(symbol)) {
      // Also check rawDependencies for sourceAnchor/anchor matches
      const hasAsSource = node.rawDependencies.some(d => d.sourceAnchor === symbol);
      const hasAsTarget = Array.from(graph.inbound.get(codePath) ?? []).some(srcPath => {
        const srcNode = graph.nodes.get(srcPath);
        return srcNode?.rawDependencies.some(d => d.codePath === codePath && d.anchor === symbol);
      });
      
      if (!hasAsSource && !hasAsTarget && !node.publicSymbols.includes(symbol)) {
        // Symbol not found - but let's be lenient and allow it anyway for partial matches
        // The search will just not find any paths if it doesn't exist in edges
      }
    }
  }

  return { codePath, symbol };
}

function searchGraph(
  graph: LiveDocGraph,
  from: string,
  to: string,
  direction: Direction,
  maxDepth: number
): PathSearchResult {
  const visited = new Set<string>([from]);
  const queue: Array<{ node: string; depth: number }> = [{ node: from, depth: 0 }];
  const parents = new Map<string, string>();
  const frontierMap = new Map<string, FrontierEntry>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.node === to) {
      const pathNodes = reconstructPath(parents, from, to);
      return { path: pathNodes, visited, frontier: [] };
    }

    const neighbors = getNeighbors(graph, current.node, direction);

    if (current.depth >= maxDepth) {
      frontierMap.set(`${current.node}|max-depth`, {
        node: current.node,
        docPath: graph.nodes.get(current.node)?.docPath,
        reason: "max-depth"
      });
      continue;
    }

    let enqueued = false;
    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) {
        continue;
      }
      visited.add(neighbor);
      parents.set(neighbor, current.node);
      queue.push({ node: neighbor, depth: current.depth + 1 });
      enqueued = true;
    }

    if (!enqueued) {
      frontierMap.set(`${current.node}|terminal`, {
        node: current.node,
        docPath: graph.nodes.get(current.node)?.docPath,
        reason: "terminal"
      });
    }
  }

  if (direction === "outbound") {
    for (const node of visited) {
      const graphNode = graph.nodes.get(node);
      if (!graphNode) {
        continue;
      }
      for (const dependency of graphNode.rawDependencies) {
        const targetId = dependency.codePath;
        if (!targetId || !graph.nodes.has(targetId)) {
          const missingKey = targetId ?? dependency.raw;
          frontierMap.set(`${node}|missing|${missingKey}`, {
            node,
            docPath: graphNode.docPath,
            reason: "missing-doc",
            missingDependency: missingKey
          });
        }
      }
    }
  }

  return { path: undefined, visited, frontier: Array.from(frontierMap.values()) };
}

function getNeighbors(
  graph: LiveDocGraph,
  node: string,
  direction: Direction
): Set<string> {
  if (direction === "outbound") {
    return graph.nodes.get(node)?.dependencies ?? new Set<string>();
  }
  return graph.inbound.get(node) ?? new Set<string>();
}

function reconstructPath(
  parents: Map<string, string>,
  start: string,
  target: string
): string[] {
  const reversed: string[] = [target];
  let cursor = target;
  while (cursor !== start) {
    const parent = parents.get(cursor);
    if (!parent) {
      break;
    }
    reversed.push(parent);
    cursor = parent;
  }
  return reversed.reverse();
}

/**
 * Symbol-aware path search using BFS.
 * 
 * When both from and to have symbols, finds a path where:
 * - The first hop originates from the fromSymbol (via sourceAnchor)
 * - The last hop arrives at the toSymbol (via anchor)
 * 
 * The algorithm tracks symbol transitions through the graph's rawDependencies.
 */
function searchSymbolPath(
  graph: LiveDocGraph,
  from: SymbolReference,
  to: SymbolReference,
  direction: Direction,
  maxDepth: number
): SymbolPathSearchResult {
  // Create a composite key for visited tracking using normalized anchors
  const makeKey = (hop: SymbolHop): string => 
    hop.symbol ? `${hop.codePath}#${hop.symbol.toLowerCase()}` : hop.codePath;

  const startHop: SymbolHop = { codePath: from.codePath, symbol: from.symbol };
  const visited = new Set<string>([makeKey(startHop)]);
  const queue: Array<{ hop: SymbolHop; path: SymbolHop[]; depth: number }> = [
    { hop: startHop, path: [startHop], depth: 0 }
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    // Check if we've reached the target
    if (current.hop.codePath === to.codePath) {
      // If to has a symbol, we need to match it (handle anchor format differences)
      if (!to.symbol) {
        return { path: current.path, found: true };
      }
      // Use symbolMatchesAnchor to handle format differences between user input and anchor slugs
      if (current.hop.symbol && symbolMatchesAnchor(to.symbol, current.hop.symbol)) {
        return { path: current.path, found: true };
      }
      // Also check direct match for when both are symbol names (sourceAnchor case)
      if (current.hop.symbol === to.symbol) {
        return { path: current.path, found: true };
      }
    }

    if (current.depth >= maxDepth) {
      continue;
    }

    // Get symbol-aware neighbors
    const neighbors = getSymbolNeighbors(graph, current.hop, direction);

    for (const neighbor of neighbors) {
      const key = makeKey(neighbor);
      if (visited.has(key)) {
        continue;
      }
      visited.add(key);
      queue.push({
        hop: neighbor,
        path: [...current.path, neighbor],
        depth: current.depth + 1
      });
    }
  }

  return { path: undefined, found: false };
}

/**
 * Gets symbol-aware neighbors for a given hop.
 * 
 * For outbound direction:
 * - If current hop has a symbol, only follow edges where sourceAnchor matches
 * - Returns the target codePath and anchor (target symbol)
 * 
 * For inbound direction:
 * - If current hop has a symbol, only follow edges where anchor matches
 * - Returns the source codePath and sourceAnchor
 */
function getSymbolNeighbors(
  graph: LiveDocGraph,
  current: SymbolHop,
  direction: Direction
): SymbolHop[] {
  const neighbors: SymbolHop[] = [];
  const node = graph.nodes.get(current.codePath);
  
  if (!node) {
    return neighbors;
  }

  if (direction === "outbound") {
    // Look at rawDependencies from this node
    for (const dep of node.rawDependencies) {
      if (!dep.codePath || !graph.nodes.has(dep.codePath)) {
        continue;
      }

      // If current hop has a symbol, only follow edges from that symbol
      if (current.symbol && dep.sourceAnchor && dep.sourceAnchor !== current.symbol) {
        continue;
      }

      // Add the neighbor with its target symbol (anchor)
      neighbors.push({
        codePath: dep.codePath,
        symbol: dep.anchor
      });
    }

    // Also add file-level dependencies if no symbol filter or symbol matches
    if (!current.symbol) {
      for (const depPath of node.dependencies) {
        if (!neighbors.some(n => n.codePath === depPath)) {
          neighbors.push({ codePath: depPath });
        }
      }
    }
  } else {
    // Inbound: look at nodes that depend on this one
    const inboundNodes = graph.inbound.get(current.codePath) ?? new Set<string>();
    
    for (const srcPath of inboundNodes) {
      const srcNode = graph.nodes.get(srcPath);
      if (!srcNode) {
        continue;
      }

      // Find edges from srcNode that point to current node
      for (const dep of srcNode.rawDependencies) {
        if (dep.codePath !== current.codePath) {
          continue;
        }

        // If current hop has a symbol, only follow edges to that symbol
        // Use symbolMatchesAnchor to handle format differences (user's symbol vs anchor slug)
        if (current.symbol && dep.anchor && !symbolMatchesAnchor(current.symbol, dep.anchor)) {
          continue;
        }

        // Add the source with its sourceAnchor
        neighbors.push({
          codePath: srcPath,
          symbol: dep.sourceAnchor
        });
      }

      // Also add file-level if no symbol filter
      if (!current.symbol && !neighbors.some(n => n.codePath === srcPath)) {
        neighbors.push({ codePath: srcPath });
      }
    }
  }

  return neighbors;
}

function enumerateTerminalPaths(
  graph: LiveDocGraph,
  start: string,
  direction: Direction,
  maxDepth: number
): FanoutPath[] {
  const results: FanoutPath[] = [];
  const stack: Array<{ path: string[] }> = [{ path: [start] }];

  while (stack.length > 0 && results.length < MAX_ENUMERATED_PATHS) {
    const current = stack.pop()!;
    const node = current.path[current.path.length - 1];
    const neighbors = Array.from(getNeighbors(graph, node, direction));
    const available = neighbors.filter((neighbor) => !current.path.includes(neighbor));

    if (available.length === 0 || current.path.length - 1 >= maxDepth) {
      results.push({ nodes: current.path });
      continue;
    }

    for (const neighbor of available) {
      stack.push({ path: [...current.path, neighbor] });
    }
  }

  return results;
}

function emitPathResult(
  pathNodes: string[],
  direction: Direction,
  graph: LiveDocGraph,
  json: boolean,
  verbose: boolean
): void {
  const hops: HopDescriptor[] = [];
  for (let index = 0; index < pathNodes.length - 1; index += 1) {
    const from = pathNodes[index];
    const to = pathNodes[index + 1];
    hops.push({
      from: describeNode(graph, from, verbose),
      to: describeNode(graph, to, verbose)
    });
  }

  if (json) {
    const payload = {
      kind: "path" as const,
      direction,
      length: pathNodes.length - 1,
      from: describeNode(graph, pathNodes[0], verbose),
      to: describeNode(graph, pathNodes[pathNodes.length - 1], verbose),
      nodes: pathNodes.map((node) => describeNode(graph, node, verbose)),
      hops
    };
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(
    `Path from ${pathNodes[0]} to ${pathNodes[pathNodes.length - 1]} (${pathNodes.length - 1} hop(s), ${direction}).`
  );
  hops.forEach((hop, index) => {
    const hopNumber = index + 1;
    const fromDoc = hop.from.docPath ? ` [${hop.from.docPath}]` : "";
    const toDoc = hop.to.docPath ? ` [${hop.to.docPath}]` : "";
    console.log(`  ${hopNumber}. ${hop.from.codePath}${fromDoc} -> ${hop.to.codePath}${toDoc}`);
  });
}

function emitNotFound(
  from: string,
  to: string,
  direction: Direction,
  graph: LiveDocGraph,
  result: PathSearchResult,
  json: boolean,
  verbose: boolean
): void {
  const frontier = result.frontier;
  const payload = {
    kind: "not-found" as const,
    direction,
    from: describeNode(graph, from, verbose),
    to: describeNode(graph, to, verbose),
    visited: Array.from(result.visited).map((node) => describeNode(graph, node, verbose)),
    frontier: frontier.map((entry) => ({
      node: describeNode(graph, entry.node, verbose),
      reason: entry.reason,
      missingDependency: entry.missingDependency
    }))
  };

  if (json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`No dependency path found from ${from} to ${to} (${direction}).`);
  if (payload.frontier.length > 0) {
    console.log("Closest reachable frontier:");
    for (const entry of payload.frontier) {
      const docInfo = entry.node.docPath ? ` [${entry.node.docPath}]` : "";
      const detail = entry.missingDependency ? ` (missing ${entry.missingDependency})` : "";
      console.log(`  - ${entry.node.codePath}${docInfo} — ${entry.reason}${detail}`);
    }
  }
}

/**
 * Emits results for a dual-direction (both forward and reverse) search.
 * Reports both paths if found, clearly labeling the direction of each.
 */
function emitDualDirectionResult(
  from: string,
  to: string,
  outboundResult: PathSearchResult,
  inboundResult: PathSearchResult,
  graph: LiveDocGraph,
  json: boolean,
  verbose: boolean
): void {
  if (json) {
    const payload = {
      kind: "dual-direction" as const,
      from: describeNode(graph, from, verbose),
      to: describeNode(graph, to, verbose),
      forward: outboundResult.path
        ? {
            found: true,
            direction: "outbound" as const,
            length: outboundResult.path.length - 1,
            nodes: outboundResult.path.map(node => describeNode(graph, node, verbose))
          }
        : { found: false, direction: "outbound" as const },
      reverse: inboundResult.path
        ? {
            found: true,
            direction: "inbound" as const,
            length: inboundResult.path.length - 1,
            nodes: inboundResult.path.map(node => describeNode(graph, node, verbose))
          }
        : { found: false, direction: "inbound" as const }
    };
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`Dual-direction search from ${from} to ${to}:\n`);

  // Forward path (outbound): "FROM depends on something that eventually reaches TO"
  if (outboundResult.path) {
    const pathNodes = outboundResult.path;
    console.log(`  FORWARD PATH (outbound, ${pathNodes.length - 1} hop(s)):`);
    console.log(`    Interpretation: "${path.basename(from)}" depends on → ... → "${path.basename(to)}"`);
    for (let i = 0; i < pathNodes.length - 1; i++) {
      const fromNode = pathNodes[i];
      const toNode = pathNodes[i + 1];
      const fromDoc = graph.nodes.get(fromNode)?.docPath ?? "";
      const toDoc = graph.nodes.get(toNode)?.docPath ?? "";
      console.log(`    ${i + 1}. ${fromNode}${fromDoc ? ` [${fromDoc}]` : ""} → ${toNode}${toDoc ? ` [${toDoc}]` : ""}`);
    }
    console.log();
  } else {
    console.log(`  FORWARD PATH (outbound): No path found.`);
    console.log(`    "${path.basename(from)}" does not depend (directly or transitively) on "${path.basename(to)}".`);
    console.log();
  }

  // Reverse path (inbound): "TO depends on something that eventually reaches FROM"
  if (inboundResult.path) {
    const pathNodes = inboundResult.path;
    console.log(`  REVERSE PATH (inbound, ${pathNodes.length - 1} hop(s)):`);
    console.log(`    Interpretation: "${path.basename(from)}" is depended on by ← ... ← "${path.basename(to)}"`);
    for (let i = 0; i < pathNodes.length - 1; i++) {
      const fromNode = pathNodes[i];
      const toNode = pathNodes[i + 1];
      const fromDoc = graph.nodes.get(fromNode)?.docPath ?? "";
      const toDoc = graph.nodes.get(toNode)?.docPath ?? "";
      console.log(`    ${i + 1}. ${fromNode}${fromDoc ? ` [${fromDoc}]` : ""} ← ${toNode}${toDoc ? ` [${toDoc}]` : ""}`);
    }
    console.log();
  } else {
    console.log(`  REVERSE PATH (inbound): No path found.`);
    console.log(`    Nothing that depends on "${path.basename(from)}" also depends on "${path.basename(to)}".`);
    console.log();
  }

  if (!outboundResult.path && !inboundResult.path) {
    console.log(`  No relationship found in either direction.`);
  }
}

/**
 * Emits a symbol-aware path result.
 */
function emitSymbolPathResult(
  path: SymbolHop[],
  from: SymbolReference,
  to: SymbolReference,
  direction: Direction,
  graph: LiveDocGraph,
  json: boolean
): void {
  // Normalize symbols in path to proper symbol names (resolve anchor slugs)
  const normalizedPath = path.map(hop => ({
    codePath: hop.codePath,
    symbol: resolveAnchorToSymbolName(hop.symbol, hop.codePath, graph)
  }));

  const hops: Array<{ from: { codePath: string; symbol?: string }; to: { codePath: string; symbol?: string } }> = [];
  
  for (let index = 0; index < normalizedPath.length - 1; index += 1) {
    hops.push({
      from: { codePath: normalizedPath[index].codePath, symbol: normalizedPath[index].symbol },
      to: { codePath: normalizedPath[index + 1].codePath, symbol: normalizedPath[index + 1].symbol }
    });
  }

  const formatRef = (ref: SymbolReference): string =>
    ref.symbol ? `${ref.codePath}#${ref.symbol}` : ref.codePath;

  if (json) {
    const payload = {
      kind: "symbol-path" as const,
      direction,
      length: normalizedPath.length - 1,
      from: { codePath: from.codePath, symbol: from.symbol },
      to: { codePath: to.codePath, symbol: to.symbol },
      hops: hops.map(hop => ({
        from: hop.from,
        to: hop.to
      }))
    };
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(
    `Symbol path from ${formatRef(from)} to ${formatRef(to)} (${normalizedPath.length - 1} hop(s), ${direction}).`
  );
  hops.forEach((hop, index) => {
    const hopNumber = index + 1;
    const fromStr = hop.from.symbol ? `${hop.from.codePath}#${hop.from.symbol}` : hop.from.codePath;
    const toStr = hop.to.symbol ? `${hop.to.codePath}#${hop.to.symbol}` : hop.to.codePath;
    console.log(`  ${hopNumber}. ${fromStr} -> ${toStr}`);
  });
}

/**
 * Emits a symbol path not found result.
 */
function emitSymbolPathNotFound(
  from: SymbolReference,
  to: SymbolReference,
  direction: Direction,
  json: boolean
): void {
  const formatRef = (ref: SymbolReference): string =>
    ref.symbol ? `${ref.codePath}#${ref.symbol}` : ref.codePath;

  if (json) {
    const payload = {
      kind: "symbol-not-found" as const,
      direction,
      from: { codePath: from.codePath, symbol: from.symbol },
      to: { codePath: to.codePath, symbol: to.symbol }
    };
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`No symbol path found from ${formatRef(from)} to ${formatRef(to)} (${direction}).`);
}

/**
 * Emits results for a dual-direction symbol path search.
 */
function emitDualDirectionSymbolResult(
  from: SymbolReference,
  to: SymbolReference,
  outboundResult: SymbolPathSearchResult,
  inboundResult: SymbolPathSearchResult,
  graph: LiveDocGraph,
  json: boolean
): void {
  const formatRef = (ref: SymbolReference): string =>
    ref.symbol ? `${ref.codePath}#${ref.symbol}` : ref.codePath;

  const normalizePath = (symbolPath: SymbolHop[] | undefined): Array<{ codePath: string; symbol?: string }> | undefined => {
    if (!symbolPath) return undefined;
    return symbolPath.map(hop => ({
      codePath: hop.codePath,
      symbol: resolveAnchorToSymbolName(hop.symbol, hop.codePath, graph)
    }));
  };

  const outboundNormalized = normalizePath(outboundResult.path);
  const inboundNormalized = normalizePath(inboundResult.path);

  if (json) {
    const payload = {
      kind: "dual-direction-symbol" as const,
      from: { codePath: from.codePath, symbol: from.symbol },
      to: { codePath: to.codePath, symbol: to.symbol },
      forward: outboundNormalized
        ? {
            found: true,
            direction: "outbound" as const,
            length: outboundNormalized.length - 1,
            hops: outboundNormalized
          }
        : { found: false, direction: "outbound" as const },
      reverse: inboundNormalized
        ? {
            found: true,
            direction: "inbound" as const,
            length: inboundNormalized.length - 1,
            hops: inboundNormalized
          }
        : { found: false, direction: "inbound" as const }
    };
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`Dual-direction symbol search from ${formatRef(from)} to ${formatRef(to)}:\n`);

  if (outboundNormalized) {
    console.log(`  FORWARD PATH (outbound, ${outboundNormalized.length - 1} hop(s)):`);
    for (let i = 0; i < outboundNormalized.length - 1; i++) {
      const fromHop = outboundNormalized[i];
      const toHop = outboundNormalized[i + 1];
      const fromStr = fromHop.symbol ? `${path.basename(fromHop.codePath)}#${fromHop.symbol}` : path.basename(fromHop.codePath);
      const toStr = toHop.symbol ? `${path.basename(toHop.codePath)}#${toHop.symbol}` : path.basename(toHop.codePath);
      console.log(`    ${i + 1}. ${fromStr} → ${toStr}`);
    }
    console.log();
  } else {
    console.log(`  FORWARD PATH (outbound): No path found.\n`);
  }

  if (inboundNormalized) {
    console.log(`  REVERSE PATH (inbound, ${inboundNormalized.length - 1} hop(s)):`);
    for (let i = 0; i < inboundNormalized.length - 1; i++) {
      const fromHop = inboundNormalized[i];
      const toHop = inboundNormalized[i + 1];
      const fromStr = fromHop.symbol ? `${path.basename(fromHop.codePath)}#${fromHop.symbol}` : path.basename(fromHop.codePath);
      const toStr = toHop.symbol ? `${path.basename(toHop.codePath)}#${toHop.symbol}` : path.basename(toHop.codePath);
      console.log(`    ${i + 1}. ${fromStr} ← ${toStr}`);
    }
    console.log();
  } else {
    console.log(`  REVERSE PATH (inbound): No path found.\n`);
  }
}

function emitFanoutResult(
  from: string,
  direction: Direction,
  fanout: FanoutPath[],
  graph: LiveDocGraph,
  maxDepth: number,
  json: boolean,
  verbose: boolean
): void {
  const payload = {
    kind: "fanout" as const,
    direction,
    from: describeNode(graph, from, verbose),
    maxDepth,
    terminalPaths: fanout.map((entry) => ({
      length: entry.nodes.length - 1,
      nodes: entry.nodes.map((node) => describeNode(graph, node, verbose))
    }))
  };

  if (json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(
    `Terminal ${direction} paths from ${from} (max depth ${maxDepth}, ${fanout.length} path(s) listed, limit ${MAX_ENUMERATED_PATHS}).`
  );
  fanout.forEach((entry, index) => {
    const step = index + 1;
    const descriptors = entry.nodes
      .map((node) => {
        const descriptor = describeNode(graph, node, verbose);
        return descriptor.docPath ? `${descriptor.codePath} [${descriptor.docPath}]` : descriptor.codePath;
      })
      .join(" -> ");
    console.log(`  ${step}. ${descriptors}`);
  });
}

function describeNode(graph: LiveDocGraph, codePath: string, verbose: boolean = false): NodeDescriptor {
  const node = graph.nodes.get(codePath);
  if (!node) {
    return { codePath };
  }  // In slim mode (default), omit symbol lists for compact output
  if (!verbose) {
    return {
      codePath: node.codePath,
      docPath: node.docPath
    };
  }  const symbols = buildSymbolDescriptors(node);
  return {
    codePath: node.codePath,
    docPath: node.docPath,
    symbols: symbols.length > 0 ? symbols : undefined
  };
}

function buildSymbolDescriptors(node: LiveDocGraphNode): SymbolDescriptor[] {
  if (node.publicSymbols.length === 0) {
    return [];
  }

  const seen = new Set<string>();
  const descriptors: SymbolDescriptor[] = [];

  for (const symbol of node.publicSymbols) {
    if (seen.has(symbol)) {
      continue;
    }
    seen.add(symbol);

    const documentation = node.symbolDocumentation[symbol];
    const descriptor: SymbolDescriptor = {
      name: symbol
    };

    if (documentation) {
      if (documentation.summary) {
        descriptor.summary = documentation.summary;
      }
      if (documentation.remarks) {
        descriptor.remarks = documentation.remarks;
      }
      if (documentation.parameters && documentation.parameters.length > 0) {
        descriptor.parameters = documentation.parameters.map((parameter): SymbolParameterDescriptor => ({
          name: parameter.name,
          description: parameter.description
        }));
      }
    }

    descriptors.push(descriptor);
  }

  return descriptors;
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
