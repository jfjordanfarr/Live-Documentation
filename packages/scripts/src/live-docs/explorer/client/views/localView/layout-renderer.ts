/**
 * Layout rendering functions for Local Map columns.
 *
 * Extracted from render.ts to improve maintainability.
 * These functions handle the directory-based layout computation
 * and rendering for node columns.
 *
 * @module layout-renderer
 */

import type { ExplorerNodePayload } from "../../../shared/types";
import type { DirectoryNode } from "../../types";
import type { DirectoryLayoutPlan } from "../layoutUtils";
import type { LocalViewController } from "./controller";
import type { ColumnRole } from "./types";
import {
  ROOT_KEY,
  buildHierarchy,
  computeDirectoryLayout,
  measureDirectoryTree
} from "../layoutUtils";
import { createNodeCard } from "./card-factory";

/**
 * Renders a layout surface for a set of nodes.
 * Uses directory hierarchy grouping for visual organization.
 *
 * @param controller - The LocalViewController instance
 * @param nodes - The nodes to render
 * @param direction - The direction (inbound/outbound/center)
 * @param connectionScore - Map of node IDs to connection scores for sorting
 * @returns The rendered surface element, or null if no eligible nodes
 */
export function renderLayoutForNodes(
  controller: LocalViewController,
  nodes: ExplorerNodePayload[],
  direction: "inbound" | "outbound" | "center",
  connectionScore: Map<string, number>
): HTMLElement | null {
  const eligibleNodes = direction === "center" ? nodes.slice() : nodes.filter(node => controller.shouldIncludeNode(node));
  if (eligibleNodes.length === 0) {
    return null;
  }

  const hierarchy = buildHierarchy(eligibleNodes);
  const scoreCache = new Map<string, number>();
  const computeScore = (dir: DirectoryNode): number => {
    const cached = scoreCache.get(dir.path);
    if (cached !== undefined) {
      return cached;
    }
    let score = 0;
    dir.nodes.forEach(node => {
      score += connectionScore.get(node.id) ?? 0;
    });
    dir.children.forEach(child => {
      score += computeScore(child);
    });
    scoreCache.set(dir.path, score);
    return score;
  };

  reorderDirectory(hierarchy, computeScore, connectionScore);

  const measure = measureDirectoryTree(hierarchy);
  if (measure.totalNodes === 0) {
    return null;
  }

  const layout = computeDirectoryLayout(measure);

  const surface = document.createElement("div");
  surface.className = "layout-surface local-surface";
  surface.dataset.direction = direction;
  surface.style.position = "relative";
  surface.style.width = `${layout.width}px`;
  surface.style.height = `${layout.height}px`;
  surface.style.minWidth = `${layout.width}px`;
  surface.style.minHeight = `${layout.height}px`;

  const positionElement = (
    element: HTMLElement,
    rect: { x: number; y: number; width: number; height: number },
    origin: { x: number; y: number }
  ): void => {
    element.style.position = "absolute";
    element.style.left = `${rect.x - origin.x}px`;
    element.style.top = `${rect.y - origin.y}px`;
    element.style.width = `${rect.width}px`;
    element.style.height = `${rect.height}px`;
  };

  const renderDirectoryPlan = (
    plan: DirectoryLayoutPlan,
    parentPlan: DirectoryLayoutPlan | null,
    host: HTMLElement
  ): void => {
    const element = document.createElement("div");
    element.className =
      plan.depth === 0 ? "layout-box layout-box--root local-layout-box" : "layout-box local-layout-box";
    element.dataset.direction = direction;
    element.dataset.clusterPath = plan.path;
    element.setAttribute("role", "region");
    element.setAttribute("aria-label", `Cluster ${plan.path === ROOT_KEY ? "root" : plan.name}`);
    element.tabIndex = 0;
    element.title = plan.path === ROOT_KEY ? "root" : plan.path;
    if (plan.collapsedAncestors.length > 0) {
      element.dataset.collapsedAncestors = plan.collapsedAncestors.map(entry => entry.path).join(",");
    }

    const origin = parentPlan ? { x: parentPlan.contentRect.x, y: parentPlan.contentRect.y } : { x: 0, y: 0 };
    positionElement(element, plan.rect, origin);

    const showLabel = plan.depth > 0 || plan.path === ROOT_KEY;
    if (showLabel) {
      const heading = document.createElement("div");
      heading.className = "layout-box__label";
      heading.textContent = plan.path === ROOT_KEY ? "(root)" : plan.displayName;
      element.appendChild(heading);
    }

    const content = document.createElement("div");
    content.className = "layout-box__content";
    positionElement(content, plan.contentRect, { x: plan.rect.x, y: plan.rect.y });
    element.appendChild(content);
    host.appendChild(element);

    if (plan.fileArea && plan.fileArea.nodes.length > 0) {
      const nodeOrigin = { x: plan.contentRect.x, y: plan.contentRect.y };
      // Map edge direction to column role for anchor registration
      const columnRole: ColumnRole = direction === "center" ? "center"
        : direction === "outbound" ? "upstream" : "downstream";
      plan.fileArea.nodes.forEach(nodePlan => {
        const card = createNodeCard(controller, nodePlan.node, columnRole);
        card.classList.add("layout-node");
        card.dataset.direction = direction;
        positionElement(card, nodePlan.rect, nodeOrigin);
        content.appendChild(card);
      });
    }

    plan.directories.forEach(child => {
      renderDirectoryPlan(child, plan, content);
    });
  };

  renderDirectoryPlan(layout.root, null, surface);
  return surface;
}

/**
 * Reorders a directory hierarchy for optimal visual presentation.
 * Nodes and subdirectories are sorted by connection score (descending)
 * with alphabetical fallback for ties.
 *
 * @param dir - The directory node to reorder
 * @param computeScore - Function to compute aggregate score for a directory
 * @param connectionScore - Map of node IDs to connection scores
 */
export function reorderDirectory(
  dir: DirectoryNode,
  computeScore: (dir: DirectoryNode) => number,
  connectionScore: Map<string, number>
): void {
  const entries = Array.from(dir.children.entries());
  entries.forEach(([, child]) => reorderDirectory(child, computeScore, connectionScore));
  entries.sort(([, a], [, b]) => {
    const weightDelta = computeScore(b) - computeScore(a);
    if (weightDelta !== 0) {
      return weightDelta;
    }
    return a.name.localeCompare(b.name);
  });
  dir.children.clear();
  entries.forEach(([key, child]) => {
    dir.children.set(key, child);
  });
  dir.nodes.sort((a, b) => {
    const weightDelta = (connectionScore.get(b.id) ?? 0) - (connectionScore.get(a.id) ?? 0);
    if (weightDelta !== 0) {
      return weightDelta;
    }
    return a.name.localeCompare(b.name);
  });
}
