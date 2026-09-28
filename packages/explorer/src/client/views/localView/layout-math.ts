/**
 * Pure layout computation for Local Map multi-hop visualization.
 *
 * Design principles:
 * - Zero DOM dependencies — works with abstract data structures
 * - Deterministic output — same inputs always produce same layout
 * - Unit testable with simple object assertions
 * - Prepares data for rendering without performing rendering
 *
 * @module layout-math
 */

import type { SymbolPin } from "./state";

/**
 * Represents a node in the layout with its computed position.
 */
export interface LayoutNode {
  /** Unique identifier for the node */
  id: string;
  /** Display name of the node */
  name: string;
  /** Column index this node belongs to */
  columnIndex: number;
  /** Role within the column (for styling) */
  role: ColumnRole;
  /** Vertical order within the column (for sorting) */
  sortOrder: number;
  /** Optional alignment guide (Y coordinate to align with) */
  alignmentY?: number;
}

/**
 * Represents a column in the multi-hop layout.
 */
export interface LayoutColumn {
  /** Zero-based column index */
  index: number;
  /** Semantic role of this column */
  role: ColumnRole;
  /** Which hop this column belongs to (0 = origin) */
  hopIndex: number;
  /** Label to display above the column */
  label: string;
  /** Nodes to render in this column */
  nodes: LayoutNode[];
  /** CSS class name for styling */
  className: string;
}

/**
 * Complete layout specification for the Local Map.
 */
export interface LocalMapLayout {
  /** Ordered array of columns from left to right */
  columns: LayoutColumn[];
  /** Total number of columns */
  columnCount: number;
  /** CSS grid template value (e.g., "repeat(5, max-content)") */
  gridTemplate: string;
}

/**
 * Semantic role of a column in the layout.
 *
 * Uses "upstream/downstream" semantics instead of "left/right"
 * to support future RTL layouts and multi-hop expansion.
 */
export type ColumnRole = "upstream" | "center" | "downstream";

/**
 * Input data for a single hop in the chain.
 */
export interface HopData {
  /** The center node for this hop */
  centerId: string;
  centerName: string;
  /** The pinned symbol on the center (if any) */
  pinnedSymbol?: string;
  /** Dependencies of the center (shown in upstream column) */
  dependencies: Array<{ id: string; name: string }>;
  /** Dependents of the center (shown in downstream column) */
  dependents: Array<{ id: string; name: string }>;
}

/**
 * Configuration for layout computation.
 */
export interface LayoutConfig {
  /** Default gap between columns in pixels */
  columnGap: number;
  /** Maximum number of hops to display */
  maxHops: number;
}

/**
 * Default layout configuration.
 */
export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  columnGap: 200,
  maxHops: 5
};

/**
 * Computes the grid template string for a given number of columns.
 *
 * @param columnCount - Number of columns
 * @returns CSS grid-template-columns value
 */
export function computeGridTemplate(columnCount: number): string {
  return `repeat(${columnCount}, max-content)`;
}

/**
 * Computes the number of columns needed for a given hop count.
 *
 * Layout pattern:
 * - Hop 0 (single-hop): [Dependencies, Center, Dependents] = 3 columns
 * - Multi-hop (hopCount > 1):
 *   [Dependencies, Origin, Dependents, Hop1Center, (Via1, Hop2Center)..., HopN]
 *   We skip the LAST hop's dependents column because the path ends there.
 *
 * Formula:
 * - Single-hop (hopCount = 1): 3 columns
 * - Multi-hop (hopCount > 1): 3 + (hopCount - 1) * 2 - 1 = hopCount * 2
 *   (subtract 1 because we skip last hop's dependents)
 *
 * @param hopCount - Number of hops (1 = single node, 2 = two nodes, etc.)
 * @returns Number of columns needed
 */
export function computeColumnCount(hopCount: number): number {
  if (hopCount <= 0) return 3; // Minimum is single-hop view
  if (hopCount === 1) return 3; // Single-hop: Deps, Center, Dependents
  // Multi-hop: skip last hop's dependents column
  return hopCount * 2;
}

/**
 * Determines the column role for a given column index.
 *
 * Pattern for N hops:
 * - Index 0: upstream (dependencies of hop 0)
 * - Index 1: center (hop 0)
 * - Index 2: downstream (dependents of hop 0 / hop 1 if exists)
 * - Index 3: center (hop 1) [if exists]
 * - Index 4: downstream (dependents of hop 1) [if exists]
 * - ...
 *
 * @param columnIndex - Zero-based column index
 * @returns The semantic role of that column
 */
export function getColumnRole(columnIndex: number): ColumnRole {
  if (columnIndex === 0) return "upstream";
  if (columnIndex % 2 === 1) return "center";
  return "downstream";
}

/**
 * Determines which hop a column belongs to.
 *
 * @param columnIndex - Zero-based column index
 * @returns The hop index (0-based)
 */
export function getHopIndex(columnIndex: number): number {
  if (columnIndex === 0) return 0;
  return Math.floor(columnIndex / 2);
}

/**
 * Generates a label for a column based on its role and hop index.
 *
 * @param role - Column role
 * @param hopIndex - Which hop this column belongs to
 * @param totalHops - Total number of hops in the chain
 * @returns Human-readable column label
 */
export function generateColumnLabel(
  role: ColumnRole,
  hopIndex: number,
  totalHops: number
): string {
  // Single-hop mode uses simple labels
  if (totalHops <= 1) {
    switch (role) {
      case "upstream":
        return "Dependencies (Inputs)";
      case "center":
        return "Selected Artifact";
      case "downstream":
        return "Dependents (Outputs)";
    }
  }

  // Multi-hop mode includes hop numbers
  switch (role) {
    case "upstream":
      return "Dependencies";
    case "center":
      return hopIndex === 0 ? "Origin" : `Hop ${hopIndex}`;
    case "downstream":
      return hopIndex === 0 ? "Dependents" : `Via ${hopIndex}`;
  }
}

/**
 * Computes the complete layout for a single-hop view (classic 3-column).
 *
 * @param center - The center node data
 * @param dependencies - Nodes that the center depends on
 * @param dependents - Nodes that depend on the center
 * @returns A LocalMapLayout ready for rendering
 */
export function computeSingleHopLayout(
  center: { id: string; name: string },
  dependencies: Array<{ id: string; name: string }>,
  dependents: Array<{ id: string; name: string }>
): LocalMapLayout {
  const columns: LayoutColumn[] = [
    {
      index: 0,
      role: "upstream",
      hopIndex: 0,
      label: "Dependencies (Inputs)",
      className: "local-column outbound",
      nodes: dependencies.map((node, i) => ({
        id: node.id,
        name: node.name,
        columnIndex: 0,
        role: "upstream" as ColumnRole,
        sortOrder: i
      }))
    },
    {
      index: 1,
      role: "center",
      hopIndex: 0,
      label: "Selected Artifact",
      className: "local-column center",
      nodes: [
        {
          id: center.id,
          name: center.name,
          columnIndex: 1,
          role: "center" as ColumnRole,
          sortOrder: 0
        }
      ]
    },
    {
      index: 2,
      role: "downstream",
      hopIndex: 0,
      label: "Dependents (Outputs)",
      className: "local-column inbound",
      nodes: dependents.map((node, i) => ({
        id: node.id,
        name: node.name,
        columnIndex: 2,
        role: "downstream" as ColumnRole,
        sortOrder: i
      }))
    }
  ];

  return {
    columns,
    columnCount: 3,
    gridTemplate: computeGridTemplate(3)
  };
}

/**
 * Computes the complete layout for a multi-hop view.
 *
 * @param hops - Array of hop data, ordered from origin to destination
 * @param config - Layout configuration
 * @returns A LocalMapLayout ready for rendering
 */
export function computeMultiHopLayout(
  hops: HopData[],
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): LocalMapLayout {
  if (hops.length === 0) {
    return {
      columns: [],
      columnCount: 0,
      gridTemplate: ""
    };
  }

  // Limit hops to maxHops
  const effectiveHops = hops.slice(0, config.maxHops);
  const totalHops = effectiveHops.length;
  const columnCount = computeColumnCount(totalHops);

  const columns: LayoutColumn[] = [];
  let columnIndex = 0;

  // First hop is special: has dependencies column
  const firstHop = effectiveHops[0];
  columns.push({
    index: columnIndex++,
    role: "upstream",
    hopIndex: 0,
    label: generateColumnLabel("upstream", 0, totalHops),
    className: "local-column outbound",
    nodes: firstHop.dependencies.map((node, i) => ({
      id: node.id,
      name: node.name,
      columnIndex: 0,
      role: "upstream" as ColumnRole,
      sortOrder: i
    }))
  });

  // Each hop adds center column; non-final hops also add dependents column
  effectiveHops.forEach((hop, hopIndex) => {
    const centerColumnIndex = columnIndex++;
    columns.push({
      index: centerColumnIndex,
      role: "center",
      hopIndex,
      label: generateColumnLabel("center", hopIndex, totalHops),
      className: hopIndex === 0 ? "local-column center" : "local-column center hop-center",
      nodes: [
        {
          id: hop.centerId,
          name: hop.centerName,
          columnIndex: centerColumnIndex,
          role: "center" as ColumnRole,
          sortOrder: 0
        }
      ]
    });

    // Skip the dependents column for the LAST hop in multi-hop paths
    // because the path ends at the destination — its dependents are irrelevant
    const isLastHop = hopIndex === totalHops - 1;
    if (isLastHop && totalHops > 1) {
      return; // Don't add dependents column for destination
    }

    const downstreamColumnIndex = columnIndex++;
    columns.push({
      index: downstreamColumnIndex,
      role: "downstream",
      hopIndex,
      label: generateColumnLabel("downstream", hopIndex, totalHops),
      className: "local-column inbound",
      nodes: hop.dependents.map((node, i) => ({
        id: node.id,
        name: node.name,
        columnIndex: downstreamColumnIndex,
        role: "downstream" as ColumnRole,
        sortOrder: i
      }))
    });
  });

  return {
    columns,
    columnCount,
    gridTemplate: computeGridTemplate(columnCount)
  };
}

/**
 * Converts a pinned path to hop data suitable for layout computation.
 *
 * This bridges the state module (SymbolPin[]) to the layout module (HopData[]).
 *
 * @param pins - Array of pinned symbols forming the path
 * @param getNodeData - Function to retrieve node data by ID
 * @param getDependencies - Function to retrieve dependencies for a node
 * @param getDependents - Function to retrieve dependents for a node
 * @returns Array of HopData for layout computation
 */
export function pinsToHopData(
  pins: SymbolPin[],
  getNodeData: (id: string) => { id: string; name: string } | null,
  getDependencies: (id: string) => Array<{ id: string; name: string }>,
  getDependents: (id: string) => Array<{ id: string; name: string }>
): HopData[] {
  if (pins.length === 0) return [];

  return pins
    .sort((a, b) => a.hopIndex - b.hopIndex)
    .map(pin => {
      const node = getNodeData(pin.nodeId);
      if (!node) return null;

      return {
        centerId: node.id,
        centerName: node.name,
        pinnedSymbol: pin.symbol,
        dependencies: getDependencies(node.id),
        dependents: getDependents(node.id)
      };
    })
    .filter((hop): hop is HopData => hop !== null);
}

// ============================================================================
// Alignment Utilities
// ============================================================================

/**
 * Computes vertical alignment values for nodes to minimize edge crossing.
 *
 * Nodes that connect to the same symbols on the center should be
 * positioned near each other vertically.
 *
 * @param nodes - Nodes to compute alignments for
 * @param centerSymbolPositions - Map of center symbol names to Y positions
 * @param connections - Function that returns connected symbol names for a node
 * @returns Map of node IDs to alignment Y values
 */
export function computeVerticalAlignments(
  nodes: Array<{ id: string }>,
  centerSymbolPositions: Map<string, number>,
  connections: (nodeId: string) => string[]
): Map<string, number> {
  const alignments = new Map<string, number>();

  for (const node of nodes) {
    const connectedSymbols = connections(node.id);
    if (connectedSymbols.length === 0) {
      // No specific alignment — will be placed at the end
      alignments.set(node.id, Infinity);
      continue;
    }

    // Average the Y positions of connected symbols
    let sum = 0;
    let count = 0;
    for (const symbol of connectedSymbols) {
      const y = centerSymbolPositions.get(symbol);
      if (y !== undefined) {
        sum += y;
        count++;
      }
    }

    alignments.set(node.id, count > 0 ? sum / count : Infinity);
  }

  return alignments;
}

/**
 * Sorts nodes by their alignment values (lower Y first).
 *
 * @param nodes - Nodes to sort
 * @param alignments - Map of node IDs to alignment values
 * @returns Sorted array of nodes
 */
export function sortByAlignment<T extends { id: string }>(
  nodes: T[],
  alignments: Map<string, number>
): T[] {
  return [...nodes].sort((a, b) => {
    const aAlign = alignments.get(a.id) ?? Infinity;
    const bAlign = alignments.get(b.id) ?? Infinity;
    return aAlign - bAlign;
  });
}

// ============================================================================
// Column Intersection Detection (for edge routing)
// ============================================================================

/**
 * Detects which intermediate columns a connection path would cross.
 *
 * Used to determine if edge routing needs to avoid overlapping content.
 *
 * @param sourceColumnIndex - Column index of the source node
 * @param targetColumnIndex - Column index of the target node
 * @returns Array of column indices that the path crosses
 */
export function getIntermediateColumns(
  sourceColumnIndex: number,
  targetColumnIndex: number
): number[] {
  const result: number[] = [];
  const minCol = Math.min(sourceColumnIndex, targetColumnIndex);
  const maxCol = Math.max(sourceColumnIndex, targetColumnIndex);

  for (let col = minCol + 1; col < maxCol; col++) {
    result.push(col);
  }

  return result;
}

/**
 * Determines if a connection spans multiple hops (requires special routing).
 *
 * @param sourceColumnIndex - Column index of the source node
 * @param targetColumnIndex - Column index of the target node
 * @returns True if the connection spans more than adjacent columns
 */
export function isMultiHopConnection(
  sourceColumnIndex: number,
  targetColumnIndex: number
): boolean {
  return Math.abs(sourceColumnIndex - targetColumnIndex) > 1;
}
