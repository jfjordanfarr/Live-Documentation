/**
 * Column factory functions for Local Map columns.
 *
 * Extracted from render.ts to improve maintainability.
 * These functions create the DOM elements for columns
 * (hierarchical and stacked) in the Local Map view.
 *
 * @module column-factory
 */

import { createNodeCard } from "./card-factory";
import type { LocalViewController } from "./controller";
import type { CenterAlignmentGuides, ColumnRole } from "./types";
import type { ExplorerNodePayload } from "../../../shared/types";
import { ROOT_KEY, getDirectoryKey } from "../layoutUtils";
import { renderLayoutForNodes } from "./layout-renderer";

/**
 * Highlights a specific symbol row in a column.
 * Used in path mode to auto-highlight FROM/TO symbols.
 *
 * @param column - The column element to search in
 * @param symbol - The symbol name to highlight
 */
export function highlightSymbolInColumn(column: HTMLElement, symbol: string): void {
  const normalizedSymbol = symbol.toLowerCase();
  column.querySelectorAll<HTMLElement>(".symbol-row").forEach(row => {
    const rowSymbol = row.dataset.symbol?.toLowerCase();
    if (rowSymbol === normalizedSymbol) {
      row.classList.add("symbol-pinned");
    }
  });
}

/**
 * Creates a hierarchical column layout for the Local Map.
 * Used for the classic directory-grouped node layout.
 *
 * @param controller - The LocalViewController instance
 * @param label - The column label text
 * @param nodes - The nodes to render in this column
 * @param direction - The direction (inbound/outbound/center)
 * @param emptyLabel - Label to show when no nodes
 * @param position - The visual position (left/center/right)
 * @param connectionScore - Map of node IDs to connection scores
 * @param hopIndex - Optional hop index for multi-hop visualization
 * @returns The created column element
 */
export function createHierarchicalColumn(
  controller: LocalViewController,
  label: string,
  nodes: ExplorerNodePayload[],
  direction: "inbound" | "outbound" | "center",
  emptyLabel: string,
  position: "left" | "center" | "right",
  connectionScore: Map<string, number>,
  hopIndex?: number
): HTMLElement {
  const column = document.createElement("div");
  column.className = `local-column ${direction}`;
  column.dataset.direction = direction;
  column.dataset.position = position;

  const heading = document.createElement("div");
  heading.className = "local-column-label";
  heading.textContent = label;
  column.appendChild(heading);

  if (direction === "center") {
    if (nodes.length === 0) {
      const empty = document.createElement("div");
      empty.className = "local-column-empty";
      empty.textContent = emptyLabel;
      column.appendChild(empty);
      return column;
    }
    const focusSurface = document.createElement("div");
    focusSurface.className = "local-focus-surface";
    nodes.forEach(node => {
      const card = createNodeCard(controller, node, "center", hopIndex);
      card.classList.add("focus-node");
      focusSurface.appendChild(card);
    });
    column.appendChild(focusSurface);
    return column;
  }

  const surface = renderLayoutForNodes(controller, nodes, direction, connectionScore);
  if (!surface) {
    const empty = document.createElement("div");
    empty.className = "local-column-empty";
    empty.textContent = emptyLabel;
    column.appendChild(empty);
    return column;
  }

  column.appendChild(surface);
  return column;
}

/**
 * Creates a stacked column layout for the Local Map.
 * Used for multi-hop visualization where nodes are vertically stacked
 * and aligned based on their connection targets.
 *
 * @param controller - The LocalViewController instance
 * @param label - The column label text
 * @param nodes - The nodes to render in this column
 * @param direction - The direction (inbound/outbound)
 * @param emptyLabel - Label to show when no nodes
 * @param guides - Alignment guides from the center column
 * @param position - The visual position (left/right)
 * @param connectionScore - Map of node IDs to connection scores
 * @param hopIndex - Optional hop index for multi-hop visualization
 * @returns The created column element
 */
export function createStackedColumn(
  controller: LocalViewController,
  label: string,
  nodes: ExplorerNodePayload[],
  direction: "inbound" | "outbound",
  emptyLabel: string,
  guides: CenterAlignmentGuides,
  position: "left" | "right",
  connectionScore: Map<string, number>,
  hopIndex?: number
): HTMLElement {
  const column = document.createElement("div");
  column.className = `local-column ${direction} local-column--stacked`;
  column.dataset.direction = direction;
  column.dataset.position = position;

  const heading = document.createElement("div");
  heading.className = "local-column-label";
  heading.textContent = label;
  column.appendChild(heading);

  const eligibleNodes = nodes.filter(node => controller.shouldIncludeNode(node));
  if (eligibleNodes.length === 0) {
    const empty = document.createElement("div");
    empty.className = "local-column-empty";
    empty.textContent = emptyLabel;
    column.appendChild(empty);
    return column;
  }

  const stack = document.createElement("div");
  stack.className = "local-stack";

  const grouped = new Map<
    string,
    {
      nodes: Array<{ node: ExplorerNodePayload; alignment: number; weight: number }>;
      order: number;
    }
  >();

  eligibleNodes.forEach(node => {
    const alignment = computeDirectionalAlignmentValue(controller, guides, node, direction);
    const weight = connectionScore.get(node.id) ?? 0;
    const key = getDirectoryKey(node);
    if (!grouped.has(key)) {
      grouped.set(key, {
        nodes: [],
        order: Number.POSITIVE_INFINITY
      });
    }
    const group = grouped.get(key)!;
    group.nodes.push({ node, alignment, weight });
    if (Number.isFinite(alignment)) {
      group.order = Math.min(group.order, alignment);
    }
  });

  const orderedGroups = Array.from(grouped.entries())
    .map(([path, group]) => {
      const nodesWithOrder = group.nodes.slice().sort((a, b) => {
        const aAlignment = Number.isFinite(a.alignment) ? a.alignment : Number.POSITIVE_INFINITY;
        const bAlignment = Number.isFinite(b.alignment) ? b.alignment : Number.POSITIVE_INFINITY;
        if (aAlignment !== bAlignment) {
          return aAlignment - bAlignment;
        }
        if (b.weight !== a.weight) {
          return b.weight - a.weight;
        }
        return a.node.name.localeCompare(b.node.name);
      });
      const displayName = path === ROOT_KEY ? "(root)" : path.split("/").filter(Boolean).pop() ?? "(root)";
      const orderValue = Number.isFinite(group.order) ? group.order : Number.POSITIVE_INFINITY;
      return {
        path,
        displayName,
        order: orderValue,
        nodes: nodesWithOrder
      };
    })
    .sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.displayName.localeCompare(b.displayName);
    });

  orderedGroups.forEach(group => {
    const groupElement = document.createElement("div");
    groupElement.className = "local-stack-group";

    const shouldShowLabel = !(group.path === ROOT_KEY && orderedGroups.length === 1);
    if (shouldShowLabel) {
      const labelElement = document.createElement("div");
      labelElement.className = "local-stack-group__label";
      labelElement.textContent = group.displayName;
      groupElement.appendChild(labelElement);
    }

    const content = document.createElement("div");
    content.className = "local-stack-group__content";
    // Map edge direction to column role:
    // - "outbound" edges → "upstream" column (dependencies — data flows FROM these)
    // - "inbound" edges → "downstream" column (dependents — data flows TO these)
    const columnRole: ColumnRole = direction === "outbound" ? "upstream" : "downstream";
    group.nodes.forEach(entry => {
      const card = createNodeCard(controller, entry.node, columnRole, hopIndex);
      card.classList.add("layout-node", "stacked-node");
      card.dataset.direction = direction;
      content.appendChild(card);
    });
    groupElement.appendChild(content);
    stack.appendChild(groupElement);
  });

  column.appendChild(stack);
  return column;
}

/**
 * Computes the alignment Y value for a node in a stacked column.
 * Determines where a node should be positioned based on its
 * connections to the center column.
 *
 * @param controller - The LocalViewController instance
 * @param guides - Alignment guides from the center column
 * @param node - The node to compute alignment for
 * @param direction - The direction of the column
 * @returns The Y coordinate for alignment
 */
export function computeDirectionalAlignmentValue(
  controller: LocalViewController,
  guides: CenterAlignmentGuides,
  node: ExplorerNodePayload,
  direction: "inbound" | "outbound"
): number {
  const subgraph = controller.currentSubgraph;
  if (!subgraph) {
    return Number.POSITIVE_INFINITY;
  }

  const centerId = subgraph.center.id;
  const relatedEdges = subgraph.links.filter(edge => {
    if (direction === "inbound") {
      return edge.sourceId === node.id && edge.targetId === centerId;
    } else {
      return edge.targetId === node.id && edge.sourceId === centerId;
    }
  });

  if (relatedEdges.length === 0) {
    const fallback = guides.cardCenters.get(centerId);
    return fallback !== undefined ? fallback : Number.POSITIVE_INFINITY;
  }

  let minY = Number.POSITIVE_INFINITY;
  for (const edge of relatedEdges) {
    const lookupDirection = direction === "inbound" ? "inbound" : "outbound";
    const symbol = direction === "inbound" ? edge.targetSymbol : edge.sourceSymbol;
    const y = controller.lookupCenterAnchorPosition(guides, centerId, lookupDirection, symbol);
    if (y !== null && y < minY) {
      minY = y;
    }
  }

  if (minY === Number.POSITIVE_INFINITY) {
    const fallback = guides.cardCenters.get(centerId);
    return fallback !== undefined ? fallback : Number.POSITIVE_INFINITY;
  }

  return minY;
}
