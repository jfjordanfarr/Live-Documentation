/**
 * Dual-direction path result emission.
 * 
 * Handles output formatting for dual-direction (both outbound and inbound)
 * search results for both file-level and symbol-level paths.
 * 
 * @module inspect/emit-result-dual
 */

import path from "node:path";

import type { LiveDocGraph } from "@live-documentation/scripts/live-docs/graph/liveDocGraph";

import { describeNode } from "./describe-node";
import { resolveAnchorToSymbolName } from "./symbol-reference";
import type { PathSearchResult, SymbolHop, SymbolPathSearchResult, SymbolReference } from "./types";

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
 * Formats a symbol reference for display.
 */
function formatRef(ref: SymbolReference): string {
  return ref.symbol ? `${ref.codePath}#${ref.symbol}` : ref.codePath;
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
