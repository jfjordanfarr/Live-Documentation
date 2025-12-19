/**
 * Graph Helpers
 * 
 * Utility functions for working with the explorer graph data,
 * including test coverage mapping and DOM helpers.
 */

import type { TestCoverageMap } from "./types";
import type {
  ExplorerGraphPayload,
  ExplorerLinkPayload,
  ExplorerNodePayload
} from "../shared/types";

/**
 * Get an input element by ID, returning null if not found or not an input.
 */
export const getInputById = (id: string): HTMLInputElement | null => {
  const element = document.getElementById(id);
  return element instanceof HTMLInputElement ? element : null;
};

/**
 * Build a map of implementation node IDs to their covering test nodes.
 * 
 * A test "covers" an implementation if there's a link from test → implementation.
 * This allows showing test coverage badges on non-test nodes.
 */
export function buildTestCoverageMap(
  graphData: ExplorerGraphPayload,
  resolveLinkEndpoint: (endpoint: ExplorerLinkPayload["source"]) => string,
  nodesById: Map<string, ExplorerNodePayload>
): TestCoverageMap {
  const coverage: TestCoverageMap = new Map();
  const isTestNode = (node: ExplorerNodePayload | undefined): boolean =>
    !!node && (node.archetype || "").toLowerCase() === "test";

  const testIds = new Set<string>();
  graphData.nodes.forEach(node => {
    if (isTestNode(node)) {
      testIds.add(node.id);
    }
  });

  if (testIds.size === 0) {
    return coverage;
  }

  graphData.links.forEach(link => {
    const sourceId = resolveLinkEndpoint(link.source);
    const targetId = resolveLinkEndpoint(link.target);
    if (!testIds.has(sourceId) || sourceId === "" || targetId === "") {
      return;
    }
    if (testIds.has(targetId)) {
      return;
    }
    const testNode = nodesById.get(sourceId);
    if (!testNode) {
      return;
    }
    if (!coverage.has(targetId)) {
      coverage.set(targetId, []);
    }
    const bucket = coverage.get(targetId)!;
    if (!bucket.some(existing => existing.id === testNode.id)) {
      bucket.push(testNode);
    }
  });

  return coverage;
}

/**
 * Resolve a link endpoint to its node ID string.
 * Handles both string IDs and object references.
 */
export const resolveLinkEndpoint = (endpoint: ExplorerLinkPayload["source"]): string => {
  if (typeof endpoint === "string") {
    return endpoint;
  }
  if (endpoint && typeof endpoint === "object" && "id" in endpoint) {
    const candidate = endpoint.id;
    if (typeof candidate === "string") {
      return candidate;
    }
  }
  return "";
};

/**
 * Escape HTML special characters for safe rendering.
 */
export const escapeHtml = (str: string): string => {
  return str.replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c] || c));
};
