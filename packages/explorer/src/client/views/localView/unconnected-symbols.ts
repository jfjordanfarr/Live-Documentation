/**
 * The symbols of a file that connect to nothing, and what a card pinned whole does with their rows (Tuning → 2D Layout →
 * Unconnected, a trial of 2026-11-23 on the owner's word: "can we make it so that, by default, the symbols which have no
 * reference to anything else are not shown or dimmed or something? I'm looking at this powershell module here going
 * 'holy moly'", before a JSON file of the PowerShell sample whose card was a column of dozens of rows, none wired).
 *
 * A symbol is unconnected when no reference of the whole graph touches it: nothing in another file uses it, it uses
 * nothing in another file, and no reference ties it to another symbol of its own file. It is decided from the graph the
 * page holds, not from what the picture happens to show, so a row does not change kind with the pins or the filters.
 *
 * Pure-function module: no DOM.
 *
 * @module unconnected-symbols
 */

import type { ExplorerGraphPayload } from "../../../shared/types";
import type { UnconnectedRows } from "../../types";
import { normalizeSymbolIdentifier } from "../symbolAnchors";
import { buildSelfLoopEdges } from "./subgraph-builder";

const endpointId = (endpoint: string | { id: string }): string => typeof endpoint === "string" ? endpoint : endpoint.id;

/**
 * Each file's unconnected symbols, by the file's id, as their normalized names. A file whose every symbol is touched,
 * or that has none, is absent.
 */
export function unconnectedSymbols(graph: Pick<ExplorerGraphPayload, "nodes" | "links">): ReadonlyMap<string, ReadonlySet<string>> {
  const touched = new Set<string>();
  const touch = (file: string, symbol: string | undefined): void => {
    const name = normalizeSymbolIdentifier(symbol);
    if (name) touched.add(`${file}\0${name}`);
  };
  // Across files: a link names the symbol that uses at its source and the symbol used at its target, when it names either.
  for (const link of graph.links) {
    touch(endpointId(link.source), link.sourceSymbol);
    touch(endpointId(link.target), link.targetSymbol);
  }
  const result = new Map<string, ReadonlySet<string>>();
  for (const node of graph.nodes) {
    // Within the file: the references the card draws as its laces.
    for (const edge of buildSelfLoopEdges(node)) {
      touch(node.id, edge.sourceSymbol);
      touch(node.id, edge.targetSymbol);
    }
    const alone = new Set<string>();
    for (const symbol of node.publicSymbols ?? []) {
      const name = normalizeSymbolIdentifier(symbol);
      if (name && !touched.has(`${node.id}\0${name}`)) alone.add(name);
    }
    if (alone.size) result.set(node.id, alone);
  }
  return result;
}

/** What one row of a card pinned whole is under the lever: drawn as today, drawn faded, or not drawn. */
export type UnconnectedRow = "shown" | "dimmed" | "folded";

/**
 * One row's treatment. Only an unconnected row of a card that draws every row is touched, and never one the person
 * asked for: a symbol pinned by name, the symbol the address or a search names, or a row whose evidence is open; nor
 * any row of a card whose folded rows the person has asked to see.
 */
export function unconnectedRow(choice: UnconnectedRows, row: { unconnected: boolean; wholeCard: boolean; asked: boolean; revealed: boolean }): UnconnectedRow {
  if (choice === "shown" || !row.unconnected || !row.wholeCard || row.asked) return "shown";
  if (choice === "dimmed") return "dimmed";
  return row.revealed ? "shown" : "folded";
}
