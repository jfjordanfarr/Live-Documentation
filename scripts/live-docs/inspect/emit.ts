/**
 * What the inspect CLI prints: node descriptors, and the text or JSON of a
 * path, a symbol path, a fan-out, the files a path reaches from a file or from
 * the entry points, a dual-direction search, or a miss.
 *
 * @module
 */

import path from "node:path";

import { entryWords, symbolName } from "@live-documentation/engine/live-docs/document";
import type { GraphFile, LiveDocGraph } from "@live-documentation/engine/live-docs/graph";
import {
  MAX_ENUMERATED_PATHS,
  type Direction,
  type FanoutPath,
  type OneWay,
  type PathSearchResult,
  type Reachability,
  type SymbolHop,
  type SymbolPathSearchResult,
  type SymbolReference
} from "@live-documentation/engine/live-docs/pathfind";

import { resolveAnchorToSymbolName } from "./resolve";

/** Descriptor for a node in path output. */
export interface NodeDescriptor {
  codePath: string;
  docPath?: string;
  symbols?: SymbolDescriptor[];
}

/** Descriptor for a hop (edge) in path output. */
export interface HopDescriptor {
  from: NodeDescriptor;
  to: NodeDescriptor;
}

/** Descriptor for a public symbol. */
export interface SymbolDescriptor {
  name: string;
  summary?: string;
  remarks?: string;
  parameters?: SymbolParameterDescriptor[];
}

/** Descriptor for a symbol parameter. */
export interface SymbolParameterDescriptor {
  name: string;
  description?: string;
}

// ============================================================================
// Descriptors
// ============================================================================

/**
 * Creates a descriptor for a node in the graph.
 *
 * @param graph - The Live Doc graph
 * @param codePath - The code path of the node
 * @param verbose - If true, includes full symbol lists
 * @returns Node descriptor with optional symbol information
 */
export function describeNode(graph: LiveDocGraph, codePath: string, verbose: boolean = false): NodeDescriptor {
  const file = graph.files[codePath];
  if (!file) {
    return { codePath };
  }

  // In slim mode (default), omit symbol lists for compact output
  if (!verbose) {
    return { codePath: file.codePath, docPath: file.docPath };
  }

  const symbols = buildSymbolDescriptors(file);
  return { codePath: file.codePath, docPath: file.docPath, symbols: symbols.length > 0 ? symbols : undefined };
}

/**
 * Builds symbol descriptors from a file's public symbols: one per name, with the
 * Summary, Remarks and Parameters sections of the first symbol that carries it.
 *
 * @param file - The file of the graph
 * @returns Array of symbol descriptors with documentation
 */
export function buildSymbolDescriptors(file: GraphFile): SymbolDescriptor[] {
  const seen = new Set<string>();
  const descriptors: SymbolDescriptor[] = [];

  for (const symbol of file.symbols) {
    const name = symbolName(symbol);
    if (seen.has(name)) {
      continue;
    }
    seen.add(name);

    const descriptor: SymbolDescriptor = { name };
    for (const section of symbol.sections) {
      if (section.title === "Summary") {
        descriptor.summary = section.body.join("\n");
      } else if (section.title === "Remarks") {
        descriptor.remarks = section.body.join("\n");
      } else if (section.title === "Parameters") {
        const parameters = parametersOf(section.body);
        if (parameters.length > 0) {
          descriptor.parameters = parameters;
        }
      }
    }
    descriptors.push(descriptor);
  }

  return descriptors;
}

/** Reads the `- \`name\`: description` bullets of a Parameters section. */
function parametersOf(body: string[]): SymbolParameterDescriptor[] {
  const parameters: SymbolParameterDescriptor[] = [];
  for (const line of body) {
    const bullet = /^\s*-\s+`([^`]+)`:\s*(.*)$/u.exec(line);
    if (bullet) {
      parameters.push({ name: bullet[1], description: bullet[2] ? bullet[2] : undefined });
    } else if (parameters.length > 0 && line.trim()) {
      const last = parameters[parameters.length - 1];
      last.description = last.description ? `${last.description}\n${line.trim()}` : line.trim();
    }
  }
  return parameters;
}

// ============================================================================
// File-level results
// ============================================================================

/**
 * Emits a successful path result.
 *
 * @param pathNodes - Array of node IDs in the path
 * @param direction - Traversal direction used
 * @param graph - The Live Doc graph
 * @param json - If true, emit JSON format
 * @param verbose - If true, include symbol details
 */
export function emitPathResult(
  pathNodes: string[],
  direction: Direction,
  graph: LiveDocGraph,
  json: boolean,
  verbose: boolean
): void {
  const hops: HopDescriptor[] = [];
  for (let index = 0; index < pathNodes.length - 1; index += 1) {
    hops.push({
      from: describeNode(graph, pathNodes[index], verbose),
      to: describeNode(graph, pathNodes[index + 1], verbose)
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
    const fromDoc = hop.from.docPath ? ` [${hop.from.docPath}]` : "";
    const toDoc = hop.to.docPath ? ` [${hop.to.docPath}]` : "";
    console.log(`  ${index + 1}. ${hop.from.codePath}${fromDoc} -> ${hop.to.codePath}${toDoc}`);
  });
}

/**
 * Emits a "path not found" result with frontier information.
 *
 * @param from - Source node code path
 * @param to - Target node code path
 * @param direction - Traversal direction used
 * @param graph - The Live Doc graph
 * @param result - The search result with frontier information
 * @param json - If true, emit JSON format
 * @param verbose - If true, include symbol details
 */
export function emitNotFound(
  from: string,
  to: string,
  direction: Direction,
  graph: LiveDocGraph,
  result: PathSearchResult,
  json: boolean,
  verbose: boolean
): void {
  const payload = {
    kind: "not-found" as const,
    direction,
    from: describeNode(graph, from, verbose),
    to: describeNode(graph, to, verbose),
    visited: Array.from(result.visited).map((node) => describeNode(graph, node, verbose)),
    frontier: result.frontier.map((entry) => ({
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
      const detail = entry.missingDependency ? ` (${entry.missingDependency} is outside the scan)` : "";
      console.log(`  - ${entry.node.codePath}${docInfo} — ${entry.reason}${detail}`);
    }
  }
}

/**
 * Emits fanout (terminal paths) result.
 *
 * @param from - Source node code path
 * @param direction - Traversal direction used
 * @param fanout - Array of terminal paths
 * @param graph - The Live Doc graph
 * @param maxDepth - Maximum depth used
 * @param json - If true, emit JSON format
 * @param verbose - If true, include symbol details
 */
export function emitFanoutResult(
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
    const descriptors = entry.nodes
      .map((node) => {
        const descriptor = describeNode(graph, node, verbose);
        return descriptor.docPath ? `${descriptor.codePath} [${descriptor.docPath}]` : descriptor.codePath;
      })
      .join(" -> ");
    console.log(`  ${index + 1}. ${descriptors}`);
  });
}

/** The files a path reaches one way from a file, nearest first, each with the hops to it. */
export interface ReachedFiles {
  direction: OneWay;
  files: Array<{ node: string; hops: number }>;
}

/**
 * Emits every file a path reaches from a file, one list per direction asked:
 * the headless form of the Explorer's destination field, which offers the
 * same files with the same distances.
 *
 * @param from - Source node code path
 * @param reached - The files reached, per direction, nearest first
 * @param graph - The Live Doc graph
 * @param maxDepth - Maximum depth used
 * @param json - If true, emit JSON format
 * @param verbose - If true, include symbol details
 */
export function emitReachableResult(
  from: string,
  reached: ReachedFiles[],
  graph: LiveDocGraph,
  maxDepth: number,
  json: boolean,
  verbose: boolean
): void {
  const payload = {
    kind: "reachable" as const,
    from: describeNode(graph, from, verbose),
    maxDepth,
    reached: reached.map((entry) => ({
      direction: entry.direction,
      files: entry.files.map((file) => ({ hops: file.hops, node: describeNode(graph, file.node, verbose) }))
    }))
  };

  if (json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`Files a path reaches from ${from} (max depth ${maxDepth}), nearest first.`);
  for (const entry of reached) {
    const way = entry.direction === "outbound" ? "what it depends on" : "what depends on it";
    console.log(`${entry.direction} (${way}): ${entry.files.length} ${entry.files.length === 1 ? "file" : "files"}`);
    for (const file of entry.files) {
      const descriptor = describeNode(graph, file.node, verbose);
      const where = descriptor.docPath ? `${descriptor.codePath} [${descriptor.docPath}]` : descriptor.codePath;
      console.log(`  ${file.hops} ${file.hops === 1 ? "hop " : "hops"}  ${where}`);
    }
  }
}

/**
 * Emits what the entry points reach: the headless form of the Knowledge Sources
 * panel, whose JSON export carries the same object. The text names every entry
 * with its reasons, then the files reached nearest first, the files no entry
 * reaches with their archetypes, and the files only a test reaches.
 *
 * @param result - The engine's reachability from the graph's entry points
 * @param graph - The Live Doc graph
 * @param maxDepth - Maximum depth used
 * @param json - If true, emit JSON format
 */
export function emitReachableFromEntries(result: Reachability, graph: LiveDocGraph, maxDepth: number, json: boolean): void {
  if (json) {
    console.log(JSON.stringify({ kind: "reachable" as const, maxDepth, ...result }, null, 2));
    return;
  }

  const where = (codePath: string): string => {
    const docPath = graph.files[codePath]?.docPath;
    return docPath ? `${codePath} [${docPath}]` : codePath;
  };
  const count = (n: number, noun: string): string => `${n} ${noun}${n === 1 ? "" : "s"}`;

  console.log(`Files a path reaches from the entry points (max depth ${maxDepth}), nearest first.`);
  console.log(`Entry points: ${count(result.starts.length, "file")}`);
  for (const start of result.starts) {
    const reasons = [...start.entries.map(entryWords), ...(start.test ? ["test"] : [])].join("; ");
    console.log(`  ${where(start.codePath)}  ${reasons}`);
  }
  console.log(`Reached: ${count(result.reached.length, "file")}`);
  for (const file of result.reached) {
    console.log(`  ${file.hops} ${file.hops === 1 ? "hop " : "hops"}  ${where(file.codePath)}`);
  }
  console.log(`Unreachable from any entry: ${count(result.unreachable.length, "file")}`);
  for (const codePath of result.unreachable) {
    console.log(`  ${where(codePath)}  ${graph.files[codePath]?.archetype ?? "implementation"}`);
  }
  console.log(`Reached only from tests: ${count(result.testsOnly.length, "file")}`);
  for (const codePath of result.testsOnly) {
    console.log(`  ${where(codePath)}`);
  }
}

/**
 * Emits results for a dual-direction (both forward and reverse) file-level search.
 * Reports both paths if found, clearly labeling the direction of each.
 *
 * @param from - Source node code path
 * @param to - Target node code path
 * @param outboundResult - Result of outbound search
 * @param inboundResult - Result of inbound search
 * @param graph - The Live Doc graph
 * @param json - If true, emit JSON format
 * @param verbose - If true, include symbol details
 */
export function emitDualDirectionResult(
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
            nodes: outboundResult.path.map((node) => describeNode(graph, node, verbose))
          }
        : { found: false, direction: "outbound" as const },
      reverse: inboundResult.path
        ? {
            found: true,
            direction: "inbound" as const,
            length: inboundResult.path.length - 1,
            nodes: inboundResult.path.map((node) => describeNode(graph, node, verbose))
          }
        : { found: false, direction: "inbound" as const }
    };
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`Dual-direction search from ${from} to ${to}:\n`);

  const docOf = (node: string): string => {
    const docPath = graph.files[node]?.docPath ?? "";
    return docPath ? ` [${docPath}]` : "";
  };

  // Forward path (outbound): "FROM depends on something that eventually reaches TO"
  if (outboundResult.path) {
    const pathNodes = outboundResult.path;
    console.log(`  FORWARD PATH (outbound, ${pathNodes.length - 1} hop(s)):`);
    console.log(`    Interpretation: "${path.basename(from)}" depends on → ... → "${path.basename(to)}"`);
    for (let i = 0; i < pathNodes.length - 1; i++) {
      console.log(`    ${i + 1}. ${pathNodes[i]}${docOf(pathNodes[i])} → ${pathNodes[i + 1]}${docOf(pathNodes[i + 1])}`);
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
      console.log(`    ${i + 1}. ${pathNodes[i]}${docOf(pathNodes[i])} ← ${pathNodes[i + 1]}${docOf(pathNodes[i + 1])}`);
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

// ============================================================================
// Symbol-level results
// ============================================================================

function formatRef(ref: SymbolReference): string {
  return ref.symbol ? `${ref.codePath}#${ref.symbol}` : ref.codePath;
}

/** The hops of a symbol path with each anchor resolved to its symbol's name. */
function normalizeSymbolPath(symbolPath: SymbolHop[], graph: LiveDocGraph): SymbolHop[] {
  return symbolPath.map((hop) => ({
    codePath: hop.codePath,
    symbol: resolveAnchorToSymbolName(hop.symbol, hop.codePath, graph)
  }));
}

/**
 * Emits a successful symbol-aware path result.
 *
 * @param symbolPath - Array of symbol hops in the path
 * @param from - Source symbol reference
 * @param to - Target symbol reference
 * @param direction - Traversal direction used
 * @param graph - The Live Doc graph
 * @param json - If true, emit JSON format
 */
export function emitSymbolPathResult(
  symbolPath: SymbolHop[],
  from: SymbolReference,
  to: SymbolReference,
  direction: Direction,
  graph: LiveDocGraph,
  json: boolean
): void {
  const normalizedPath = normalizeSymbolPath(symbolPath, graph);
  const hops: Array<{ from: SymbolHop; to: SymbolHop }> = [];
  for (let index = 0; index < normalizedPath.length - 1; index += 1) {
    hops.push({ from: normalizedPath[index], to: normalizedPath[index + 1] });
  }

  if (json) {
    const payload = {
      kind: "symbol-path" as const,
      direction,
      length: normalizedPath.length - 1,
      from: { codePath: from.codePath, symbol: from.symbol },
      to: { codePath: to.codePath, symbol: to.symbol },
      hops
    };
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(
    `Symbol path from ${formatRef(from)} to ${formatRef(to)} (${normalizedPath.length - 1} hop(s), ${direction}).`
  );
  hops.forEach((hop, index) => {
    console.log(`  ${index + 1}. ${formatRef(hop.from)} -> ${formatRef(hop.to)}`);
  });
}

/**
 * Emits a "symbol path not found" result.
 *
 * @param from - Source symbol reference
 * @param to - Target symbol reference
 * @param direction - Traversal direction used
 * @param json - If true, emit JSON format
 */
export function emitSymbolPathNotFound(
  from: SymbolReference,
  to: SymbolReference,
  direction: Direction,
  json: boolean
): void {
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
 *
 * @param from - Source symbol reference
 * @param to - Target symbol reference
 * @param outboundResult - Result of outbound symbol search
 * @param inboundResult - Result of inbound symbol search
 * @param graph - The Live Doc graph
 * @param json - If true, emit JSON format
 */
export function emitDualDirectionSymbolResult(
  from: SymbolReference,
  to: SymbolReference,
  outboundResult: SymbolPathSearchResult,
  inboundResult: SymbolPathSearchResult,
  graph: LiveDocGraph,
  json: boolean
): void {
  const outboundNormalized = outboundResult.path ? normalizeSymbolPath(outboundResult.path, graph) : undefined;
  const inboundNormalized = inboundResult.path ? normalizeSymbolPath(inboundResult.path, graph) : undefined;

  if (json) {
    const payload = {
      kind: "dual-direction-symbol" as const,
      from: { codePath: from.codePath, symbol: from.symbol },
      to: { codePath: to.codePath, symbol: to.symbol },
      forward: outboundNormalized
        ? { found: true, direction: "outbound" as const, length: outboundNormalized.length - 1, hops: outboundNormalized }
        : { found: false, direction: "outbound" as const },
      reverse: inboundNormalized
        ? { found: true, direction: "inbound" as const, length: inboundNormalized.length - 1, hops: inboundNormalized }
        : { found: false, direction: "inbound" as const }
    };
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const short = (hop: SymbolHop): string =>
    hop.symbol ? `${path.basename(hop.codePath)}#${hop.symbol}` : path.basename(hop.codePath);

  console.log(`Dual-direction symbol search from ${formatRef(from)} to ${formatRef(to)}:\n`);

  if (outboundNormalized) {
    console.log(`  FORWARD PATH (outbound, ${outboundNormalized.length - 1} hop(s)):`);
    for (let i = 0; i < outboundNormalized.length - 1; i++) {
      console.log(`    ${i + 1}. ${short(outboundNormalized[i])} → ${short(outboundNormalized[i + 1])}`);
    }
    console.log();
  } else {
    console.log(`  FORWARD PATH (outbound): No path found.\n`);
  }

  if (inboundNormalized) {
    console.log(`  REVERSE PATH (inbound, ${inboundNormalized.length - 1} hop(s)):`);
    for (let i = 0; i < inboundNormalized.length - 1; i++) {
      console.log(`    ${i + 1}. ${short(inboundNormalized[i])} ← ${short(inboundNormalized[i + 1])}`);
    }
    console.log();
  } else {
    console.log(`  REVERSE PATH (inbound): No path found.\n`);
  }
}
