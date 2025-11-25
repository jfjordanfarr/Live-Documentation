#!/usr/bin/env node
import path from "node:path";
import process from "node:process";

import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  normalizeLiveDocumentationConfig,
  type LiveDocumentationConfig
} from "@live-documentation/shared/config/liveDocumentationConfig";
import { normalizeWorkspacePath } from "@live-documentation/shared/tooling/pathUtils";
import {
  buildLiveDocGraph,
  type LiveDocGraph,
  type LiveDocGraphNode
} from "@live-documentation/scripts/live-docs/graph/liveDocGraph";

interface ParsedArgs {
  help: boolean;
  version: boolean;
  json: boolean;
  workspace?: string;
  root?: string;
  baseLayer?: string;
  extension?: string;
  from?: string;
  to?: string;
  direction: Direction;
  maxDepth: number;
}

type Direction = "outbound" | "inbound";

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

  const configInput: LiveDocumentationConfig = normalizeLiveDocumentationConfig({
    ...DEFAULT_LIVE_DOCUMENTATION_CONFIG,
    root: args.root ?? DEFAULT_LIVE_DOCUMENTATION_CONFIG.root,
    baseLayer: args.baseLayer ?? DEFAULT_LIVE_DOCUMENTATION_CONFIG.baseLayer,
    extension: args.extension ?? DEFAULT_LIVE_DOCUMENTATION_CONFIG.extension
  });

  const graph = await buildLiveDocGraph({ workspaceRoot, config: configInput });
  if (graph.nodes.size === 0) {
    console.error("No Live Docs found. Generate Live Documentation before running inspect.");
    process.exit(1);
    return;
  }

  const fromId = resolveArtifactIdentifier(args.from, workspaceRoot, configInput, graph);
  if (!fromId) {
    console.error(`Unable to resolve --from '${args.from}'.`);
    process.exit(1);
    return;
  }

  const direction = args.direction;

  if (args.to) {
    const toId = resolveArtifactIdentifier(args.to, workspaceRoot, configInput, graph);
    if (!toId) {
      console.error(`Unable to resolve --to '${args.to}'.`);
      process.exit(1);
      return;
    }

    const searchResult = searchGraph(graph, fromId, toId, direction, args.maxDepth);
    if (searchResult.path) {
      emitPathResult(searchResult.path, direction, graph, args.json);
      return;
    }

    emitNotFound(fromId, toId, direction, graph, searchResult, args.json);
    process.exit(1);
    return;
  }

  const fanout = enumerateTerminalPaths(graph, fromId, direction, args.maxDepth);
  emitFanoutResult(fromId, direction, fanout, graph, args.maxDepth, args.json);
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = {
    help: false,
    version: false,
    json: false,
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

      case "--workspace": {
        parsed.workspace = expectValue(argv, ++index, current);
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
        if (value !== "outbound" && value !== "inbound") {
          throw new Error("--direction must be 'outbound' or 'inbound'.");
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
  json: boolean
): void {
  const hops: HopDescriptor[] = [];
  for (let index = 0; index < pathNodes.length - 1; index += 1) {
    const from = pathNodes[index];
    const to = pathNodes[index + 1];
    hops.push({
      from: describeNode(graph, from),
      to: describeNode(graph, to)
    });
  }

  if (json) {
    const payload = {
      kind: "path" as const,
      direction,
      length: pathNodes.length - 1,
      from: describeNode(graph, pathNodes[0]),
      to: describeNode(graph, pathNodes[pathNodes.length - 1]),
      nodes: pathNodes.map((node) => describeNode(graph, node)),
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
  json: boolean
): void {
  const frontier = result.frontier;
  const payload = {
    kind: "not-found" as const,
    direction,
    from: describeNode(graph, from),
    to: describeNode(graph, to),
    visited: Array.from(result.visited).map((node) => describeNode(graph, node)),
    frontier: frontier.map((entry) => ({
      node: describeNode(graph, entry.node),
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

function emitFanoutResult(
  from: string,
  direction: Direction,
  fanout: FanoutPath[],
  graph: LiveDocGraph,
  maxDepth: number,
  json: boolean
): void {
  const payload = {
    kind: "fanout" as const,
    direction,
    from: describeNode(graph, from),
    maxDepth,
    terminalPaths: fanout.map((entry) => ({
      length: entry.nodes.length - 1,
      nodes: entry.nodes.map((node) => describeNode(graph, node))
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
        const descriptor = describeNode(graph, node);
        return descriptor.docPath ? `${descriptor.codePath} [${descriptor.docPath}]` : descriptor.codePath;
      })
      .join(" -> ");
    console.log(`  ${step}. ${descriptors}`);
  });
}

function describeNode(graph: LiveDocGraph, codePath: string): NodeDescriptor {
  const node = graph.nodes.get(codePath);
  if (!node) {
    return { codePath };
  }
  const symbols = buildSymbolDescriptors(node);
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
    `  --to <path>              Target artefact. Omit to list terminal paths from --from.\n` +
    `  --direction <dir>        Traversal direction: outbound (default) or inbound.\n` +
    `  --max-depth <n>          Maximum traversal depth (default ${DEFAULT_MAX_DEPTH}).\n` +
    `  --json                   Emit JSON instead of text.\n` +
    `  --workspace <path>       Workspace root (defaults to current working directory).\n` +
    `  --root <path>            Override liveDocumentation.root.\n` +
    `  --base-layer <name>      Override liveDocumentation.baseLayer.\n` +
    `  --extension <suffix>     Override liveDocumentation.extension.\n` +
    `  --version                Print inspect CLI version.\n` +
    `  --help                   Display this help text.\n` +
    `\nExamples:\n` +
    `  npm run live-docs:inspect -- --from tests/integration/fixtures/.../app-insights.js --to tests/integration/fixtures/.../Web.config\n` +
    `  npm run live-docs:inspect -- --from packages/server/src/index.ts --direction inbound --json\n`;
}

main().catch((error) => {
  console.error("live-docs:inspect failed");
  if (error instanceof Error) {
    console.error(error.message);
  }
  process.exit(1);
});
