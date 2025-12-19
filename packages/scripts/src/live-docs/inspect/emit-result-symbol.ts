/**
 * Symbol-level path result emission.
 * 
 * Handles output formatting for symbol-aware path search results
 * in both human-readable text and JSON formats.
 * 
 * @module inspect/emit-result-symbol
 */

import type { LiveDocGraph } from "@live-documentation/scripts/live-docs/graph/liveDocGraph";

import { resolveAnchorToSymbolName } from "./symbol-reference";
import type { Direction, SymbolHop, SymbolReference } from "./types";

/**
 * Formats a symbol reference for display.
 */
function formatRef(ref: SymbolReference): string {
  return ref.symbol ? `${ref.codePath}#${ref.symbol}` : ref.codePath;
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
  // Normalize symbols in path to proper symbol names (resolve anchor slugs)
  const normalizedPath = symbolPath.map(hop => ({
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
