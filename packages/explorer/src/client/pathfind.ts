/**
 * Pathfind Toolbar Module
 * 
 * Provides FROM/TO artifact and symbol search for pathfinding visualization.
 * Integrates with the omnisearch pattern but operates inline within the Local Map view.
 */

import type { ExplorerLinkPayload, ExplorerNodePayload } from "../shared/types";
import { commitUrl } from "./persistence/history";

/** Pathfind endpoint selection */
export interface PathfindEndpoint {
  node: ExplorerNodePayload;
  symbol?: string; // Optional symbol within the node
}

/** Pathfind state */
export interface PathfindState {
  from?: PathfindEndpoint;
  to?: PathfindEndpoint;
}

/** A hop in a path result */
export interface PathHop {
  nodeId: string;
  node: ExplorerNodePayload;
  symbol?: string;
}

/** What a search between two files found. */
export interface PathfindResult {
  /**
   * The hops from FROM to TO when TO depends on FROM. This is the only path the
   * Local Map draws: what offers stands left of what uses it, so FROM must offer
   * and TO must use. Empty when no such path exists.
   */
  path: PathHop[];
  /**
   * The hops from TO to FROM when only FROM depends on TO: the same files, read in
   * the direction the map can draw. The map never draws a path against its
   * reading direction; it says there is none and offers this reverse question
   * instead (the owner's rule of 2025-12-18). Empty when `path` is found or no
   * path exists either way.
   */
  reversePath: PathHop[];
  fromEndpoint: PathfindEndpoint;
  toEndpoint: PathfindEndpoint;
  /** Files visited by the searches, counted only when nothing is drawn. */
  searchedNodes: number;
  /** Whether a search stopped at the hop limit before reaching its target. */
  maxDepthReached: boolean;
}

/** Callbacks for pathfind events */
export interface PathfindCallbacks {
  onFromChange: (endpoint: PathfindEndpoint | undefined) => void;
  onToChange: (endpoint: PathfindEndpoint | undefined) => void;
  onFindPath: (from: PathfindEndpoint, to: PathfindEndpoint) => void;
  onClear: () => void;
}

function endpointId(endpoint: ExplorerLinkPayload["source"]): string {
  return typeof endpoint === "string" ? endpoint : endpoint.id;
}

/**
 * Finds the shortest path the Local Map can draw between two files, or the
 * reverse of it when only the reverse exists.
 *
 * A link runs from the file that depends to the file it depends on, so the map's
 * reading direction, offers on the left and uses on the right, walks a file's
 * dependents. The search from FROM along dependents reaches TO exactly when TO
 * depends on FROM; the same search from TO reaches FROM when FROM depends on TO,
 * and that path is returned as `reversePath`, provider first, never drawn.
 */
export function findPath(
  fromNodeId: string,
  toNodeId: string,
  nodesById: Map<string, ExplorerNodePayload>,
  links: ExplorerLinkPayload[],
  maxHops: number = Math.max(0, nodesById.size - 1)
): PathfindResult {
  const fromNode = nodesById.get(fromNodeId);
  const toNode = nodesById.get(toNodeId);
  const nothing: PathfindResult = {
    path: [],
    reversePath: [],
    fromEndpoint: { node: fromNode ?? ({ id: fromNodeId } as ExplorerNodePayload) },
    toEndpoint: { node: toNode ?? ({ id: toNodeId } as ExplorerNodePayload) },
    searchedNodes: 0,
    maxDepthReached: false
  };
  if (!fromNode || !toNode) {
    return nothing;
  }

  // dependents: file -> the files that depend on it
  const dependents = new Map<string, Set<string>>();
  for (const link of links) {
    const sourceId = endpointId(link.source);
    const targetId = endpointId(link.target);
    let set = dependents.get(targetId);
    if (!set) {
      set = new Set();
      dependents.set(targetId, set);
    }
    set.add(sourceId);
  }

  const forward = directedBFS(fromNodeId, toNodeId, dependents, nodesById, maxHops);
  if (forward.path) {
    return { ...nothing, path: forward.path };
  }
  const reverse = directedBFS(toNodeId, fromNodeId, dependents, nodesById, maxHops);
  return {
    ...nothing,
    reversePath: reverse.path ?? [],
    searchedNodes: forward.searchedNodes + reverse.searchedNodes,
    maxDepthReached: forward.maxDepthReached || reverse.maxDepthReached
  };
}

/**
 * The references between the files of a drawn path that run against it: an
 * earlier file, which the picture shows offering, depending on a later one.
 * The path drawer leaves them out, so the toolbar counts them aloud.
 */
export function referencesAgainstPath(pathNodeIds: readonly string[], links: ExplorerLinkPayload[]): number {
  const position = new Map(pathNodeIds.map((id, index) => [id, index] as const));
  let count = 0;
  for (const link of links) {
    const dependent = position.get(endpointId(link.source));
    const dependency = position.get(endpointId(link.target));
    if (dependent !== undefined && dependency !== undefined && dependent < dependency) {
      count += 1;
    }
  }
  return count;
}

interface Search {
  /** The hops from the start to the target, or null when the target was not reached. */
  path: PathHop[] | null;
  searchedNodes: number;
  maxDepthReached: boolean;
}

/** Breadth-first search from one file to another along one adjacency. */
function directedBFS(
  fromNodeId: string,
  toNodeId: string,
  adjacency: Map<string, Set<string>>,
  nodesById: Map<string, ExplorerNodePayload>,
  maxHops: number
): Search {
  const visited = new Set<string>([fromNodeId]);
  const parents = new Map<string, string>();
  const queue: Array<{ nodeId: string; depth: number }> = [{ nodeId: fromNodeId, depth: 0 }];
  let maxDepthReached = false;

  // Each file is enqueued once; the cursor avoids repeated array shifting.
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const { nodeId, depth } = queue[cursor];

    if (nodeId === toNodeId) {
      const path: PathHop[] = [];
      let current: string | undefined = toNodeId;
      while (current !== undefined) {
        const node = nodesById.get(current);
        if (node) {
          path.unshift({ nodeId: current, node });
        }
        current = parents.get(current);
      }
      return { path, searchedNodes: visited.size, maxDepthReached: false };
    }

    if (depth >= maxHops) {
      maxDepthReached ||= [...(adjacency.get(nodeId) ?? [])].some(id => nodesById.has(id) && !visited.has(id));
      continue;
    }

    for (const neighborId of adjacency.get(nodeId) ?? []) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        parents.set(neighborId, nodeId);
        queue.push({ nodeId: neighborId, depth: depth + 1 });
      }
    }
  }

  return { path: null, searchedNodes: visited.size, maxDepthReached };
}

/**
 * Parse pathfind state from URL parameters.
 */
export function parsePathfindFromUrl(
  nodesById: Map<string, ExplorerNodePayload>
): { from?: PathfindEndpoint; to?: PathfindEndpoint } {
  const params = new URLSearchParams(window.location.search);
  const fromId = params.get("from");
  const toId = params.get("to");
  const fromSymbol = params.get("fromSymbol");
  const toSymbol = params.get("toSymbol");

  const result: { from?: PathfindEndpoint; to?: PathfindEndpoint } = {};

  if (fromId) {
    const fromNode = nodesById.get(fromId);
    if (fromNode) {
      result.from = { node: fromNode, symbol: fromSymbol || undefined };
    }
  }

  if (toId) {
    const toNode = nodesById.get(toId);
    if (toNode) {
      result.to = { node: toNode, symbol: toSymbol || undefined };
    }
  }

  return result;
}

/** The page's address with the pathfind state written into it and everything else kept. */
export function pathfindHref(state: PathfindState): string {
  const url = new URL(window.location.href);
  const params = url.searchParams;

  // Clear existing pathfind params
  params.delete("from");
  params.delete("to");
  params.delete("fromSymbol");
  params.delete("toSymbol");

  // Set new params
  if (state.from) {
    params.set("from", state.from.node.id);
    if (state.from.symbol) {
      params.set("fromSymbol", state.from.symbol);
    }
  }
  if (state.to) {
    params.set("to", state.to.node.id);
    if (state.to.symbol) {
      params.set("toSymbol", state.to.symbol);
    }
  }

  return params.toString() ? `${url.pathname}?${params.toString()}` : url.pathname;
}

/**
 * Update URL with pathfind state.
 */
export function updatePathfindUrl(state: PathfindState): void {
  commitUrl(pathfindHref(state));
}

/** Return type for initPathfind */
export interface PathfindApi {
  state: PathfindState;
  setFrom: (endpoint: PathfindEndpoint | undefined) => void;
  setTo: (endpoint: PathfindEndpoint | undefined) => void;
  clearAll: () => void;
  executeFindPath: () => void;
  /** Asks the reverse question: TO becomes FROM and FROM becomes TO, then the path is searched again. */
  swap: () => void;
}

/**
 * Initialize the pathfind toolbar with search and symbol selection
 */
export function initPathfind(
  nodes: ExplorerNodePayload[],
  callbacks: PathfindCallbacks
): PathfindApi {
  const state: PathfindState = {};

  // DOM elements
  const toolbar = document.getElementById("pathfind-toolbar");
  const fromInput = document.getElementById("pathfind-from") as HTMLInputElement | null;
  const fromClear = document.getElementById("pathfind-from-clear");
  const fromSymbol = document.getElementById("pathfind-from-symbol") as HTMLSelectElement | null;
  const fromResults = document.getElementById("pathfind-from-results");
  const toInput = document.getElementById("pathfind-to") as HTMLInputElement | null;
  const toClear = document.getElementById("pathfind-to-clear");
  const toSymbol = document.getElementById("pathfind-to-symbol") as HTMLSelectElement | null;
  const toResults = document.getElementById("pathfind-to-results");
  const goButton = document.getElementById("pathfind-go") as HTMLButtonElement | null;
  const clearButton = document.getElementById("pathfind-clear");

  if (!toolbar || !fromInput || !fromResults || !toInput || !toResults) {
    console.warn("Pathfind toolbar elements not found");
    // Return no-op API when elements not found
    return {
      state,
      setFrom: () => {},
      setTo: () => {},
      clearAll: () => {},
      executeFindPath: () => {},
      swap: () => {}
    };
  }

  // Shadowed references after guard - TypeScript knows these are non-null
  const fromResultsEl = fromResults;
  const toResultsEl = toResults;

  // Search state
  let fromSearchResults: ExplorerNodePayload[] = [];
  let fromSelectedIndex = -1;
  let toSearchResults: ExplorerNodePayload[] = [];
  let toSelectedIndex = -1;

  // ==================
  // FUZZY SEARCH
  // ==================

  function searchNodes(query: string): ExplorerNodePayload[] {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    const terms = lowerQuery.split(/\s+/);

    return nodes
      .map(node => {
        const name = (node.name || "").toLowerCase();
        const path = (node.codeRelativePath || "").toLowerCase();
        const symbols = (node.publicSymbols || []).map(s => (s || "").toLowerCase());

        let score = 0;
        for (const term of terms) {
          if (name === term) score += 100;
          else if (name.startsWith(term)) score += 50;
          else if (name.includes(term)) score += 25;
          if (path.includes(term)) score += 10;
          if (symbols.some(s => s.includes(term))) score += 15;
        }
        return { node, score };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15)
      .map(r => r.node);
  }

  // ==================
  // RESULT RENDERING
  // ==================

  function escapeHtml(str: string): string {
    return str.replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c)
    );
  }

  function renderResults(
    results: ExplorerNodePayload[],
    container: HTMLElement,
    selectedIdx: number
  ): void {
    if (results.length === 0) {
      container.innerHTML = '<div class="pathfind-results-empty">No results found</div>';
      return;
    }

    container.innerHTML = results
      .map(
        (node, i) => `
      <div class="pathfind-result ${i === selectedIdx ? "selected" : ""}" data-index="${i}">
        <div class="pathfind-result-text">
          <div class="pathfind-result-name">${escapeHtml(node.name)}</div>
          <div class="pathfind-result-path">${escapeHtml(node.codeRelativePath)}</div>
        </div>
        <span class="pathfind-result-badge">${escapeHtml(node.archetype)}</span>
      </div>
    `
      )
      .join("");
  }

  function updateResultSelection(container: HTMLElement, selectedIdx: number): void {
    const items = container.querySelectorAll(".pathfind-result");
    items.forEach((item, i) => {
      item.classList.toggle("selected", i === selectedIdx);
    });
    const selected = container.querySelector(".pathfind-result.selected");
    selected?.scrollIntoView({ block: "nearest" });
  }

  // ==================
  // SYMBOL DROPDOWN
  // ==================

  function populateSymbolDropdown(dropdown: HTMLSelectElement | null, node: ExplorerNodePayload | undefined): void {
    if (!dropdown) return;

    // Clear existing options except first (All symbols)
    while (dropdown.options.length > 1) {
      dropdown.remove(1);
    }

    if (!node || !node.publicSymbols || node.publicSymbols.length === 0) {
      dropdown.hidden = true;
      dropdown.value = "";
      return;
    }

    // Add symbol options
    for (const symbol of node.publicSymbols) {
      const option = document.createElement("option");
      option.value = symbol;
      option.textContent = symbol;
      dropdown.appendChild(option);
    }

    dropdown.hidden = false;
    dropdown.value = ""; // Default to "All symbols"
  }

  // ==================
  // ENDPOINT SELECTION
  // ==================

  function selectFromNode(node: ExplorerNodePayload): void {
    state.from = { node };
    fromInput!.value = node.name;
    fromInput!.classList.add("has-selection");
    fromClear!.hidden = false;
    fromResultsEl.hidden = true;
    fromSearchResults = [];
    fromSelectedIndex = -1;
    populateSymbolDropdown(fromSymbol, node);
    updateGoButton();
    callbacks.onFromChange(state.from);
  }

  function selectToNode(node: ExplorerNodePayload): void {
    state.to = { node };
    toInput!.value = node.name;
    toInput!.classList.add("has-selection");
    toClear!.hidden = false;
    toResultsEl.hidden = true;
    toSearchResults = [];
    toSelectedIndex = -1;
    populateSymbolDropdown(toSymbol, node);
    updateGoButton();
    callbacks.onToChange(state.to);
  }

  function clearFrom(): void {
    state.from = undefined;
    fromInput!.value = "";
    fromInput!.classList.remove("has-selection");
    fromClear!.hidden = true;
    fromResultsEl.hidden = true;
    fromSymbol!.hidden = true;
    fromSymbol!.value = "";
    fromSearchResults = [];
    fromSelectedIndex = -1;
    updateGoButton();
    callbacks.onFromChange(undefined);
  }

  function clearTo(): void {
    state.to = undefined;
    toInput!.value = "";
    toInput!.classList.remove("has-selection");
    toClear!.hidden = true;
    toResultsEl.hidden = true;
    toSymbol!.hidden = true;
    toSymbol!.value = "";
    toSearchResults = [];
    toSelectedIndex = -1;
    updateGoButton();
    callbacks.onToChange(undefined);
  }

  function clearAll(): void {
    clearFrom();
    clearTo();
    callbacks.onClear();
  }

  function updateGoButton(): void {
    if (goButton) {
      // Enable if FROM is selected (TO is optional for fan-out visualization)
      goButton.disabled = !state.from;
    }
  }

  // ==================
  // EVENT HANDLERS
  // ==================

  // FROM input events
  fromInput.addEventListener("input", () => {
    if (state.from) {
      // Clear selection if user starts typing again
      clearFrom();
    }
    const query = fromInput.value;
    if (query.trim()) {
      fromSearchResults = searchNodes(query);
      fromSelectedIndex = fromSearchResults.length > 0 ? 0 : -1;
      renderResults(fromSearchResults, fromResultsEl, fromSelectedIndex);
      fromResultsEl.hidden = false;
    } else {
      fromResultsEl.hidden = true;
      fromSearchResults = [];
    }
  });

  fromInput.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      fromResultsEl.hidden = true;
      fromInput.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (fromSearchResults.length > 0) {
        fromSelectedIndex = (fromSelectedIndex + 1) % fromSearchResults.length;
        updateResultSelection(fromResultsEl, fromSelectedIndex);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (fromSearchResults.length > 0) {
        fromSelectedIndex = fromSelectedIndex <= 0 ? fromSearchResults.length - 1 : fromSelectedIndex - 1;
        updateResultSelection(fromResultsEl, fromSelectedIndex);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (fromSelectedIndex >= 0 && fromSelectedIndex < fromSearchResults.length) {
        selectFromNode(fromSearchResults[fromSelectedIndex]);
      }
    } else if (e.key === "Tab" && !e.shiftKey) {
      // Tab to TO field
      if (fromSearchResults.length > 0 && fromSelectedIndex >= 0) {
        selectFromNode(fromSearchResults[fromSelectedIndex]);
      }
    }
  });

  fromInput.addEventListener("focus", () => {
    if (fromSearchResults.length > 0 && !state.from) {
      fromResultsEl.hidden = false;
    }
  });

  fromInput.addEventListener("blur", _e => {
    // Delay hiding to allow click on results
    setTimeout(() => {
      if (!fromResultsEl.contains(document.activeElement)) {
        fromResultsEl.hidden = true;
      }
    }, 150);
  });

  fromResults?.addEventListener("click", e => {
    const target = (e.target as HTMLElement).closest(".pathfind-result");
    if (target instanceof HTMLElement) {
      const index = parseInt(target.dataset.index || "-1", 10);
      if (index >= 0 && index < fromSearchResults.length) {
        selectFromNode(fromSearchResults[index]);
      }
    }
  });

  // TO input events (mirror FROM logic)
  toInput.addEventListener("input", () => {
    if (state.to) {
      clearTo();
    }
    const query = toInput.value;
    if (query.trim()) {
      toSearchResults = searchNodes(query);
      toSelectedIndex = toSearchResults.length > 0 ? 0 : -1;
      renderResults(toSearchResults, toResultsEl, toSelectedIndex);
      toResultsEl.hidden = false;
    } else {
      toResultsEl.hidden = true;
      toSearchResults = [];
    }
  });

  toInput.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      toResultsEl.hidden = true;
      toInput.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (toSearchResults.length > 0) {
        toSelectedIndex = (toSelectedIndex + 1) % toSearchResults.length;
        updateResultSelection(toResultsEl, toSelectedIndex);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (toSearchResults.length > 0) {
        toSelectedIndex = toSelectedIndex <= 0 ? toSearchResults.length - 1 : toSelectedIndex - 1;
        updateResultSelection(toResultsEl, toSelectedIndex);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (toSelectedIndex >= 0 && toSelectedIndex < toSearchResults.length) {
        selectToNode(toSearchResults[toSelectedIndex]);
      }
    }
  });

  toInput.addEventListener("focus", () => {
    if (toSearchResults.length > 0 && !state.to) {
      toResultsEl.hidden = false;
    }
  });

  toInput.addEventListener("blur", () => {
    setTimeout(() => {
      if (!toResultsEl.contains(document.activeElement)) {
        toResultsEl.hidden = true;
      }
    }, 150);
  });

  toResults?.addEventListener("click", e => {
    const target = (e.target as HTMLElement).closest(".pathfind-result");
    if (target instanceof HTMLElement) {
      const index = parseInt(target.dataset.index || "-1", 10);
      if (index >= 0 && index < toSearchResults.length) {
        selectToNode(toSearchResults[index]);
      }
    }
  });

  // Symbol dropdown changes
  fromSymbol?.addEventListener("change", () => {
    if (state.from) {
      state.from.symbol = fromSymbol.value || undefined;
      callbacks.onFromChange(state.from);
    }
  });

  toSymbol?.addEventListener("change", () => {
    if (state.to) {
      state.to.symbol = toSymbol.value || undefined;
      callbacks.onToChange(state.to);
    }
  });

  // Clear buttons
  fromClear?.addEventListener("click", clearFrom);
  toClear?.addEventListener("click", clearTo);
  clearButton?.addEventListener("click", clearAll);

  // Go button
  goButton?.addEventListener("click", () => {
    if (state.from) {
      // If TO is not specified, still call onFindPath (will show fan-out)
      const toEndpoint = state.to || { node: state.from.node }; // Self if no TO
      callbacks.onFindPath(state.from, toEndpoint);
    }
  });

  // ==================
  // PROGRAMMATIC API
  // ==================

  /**
   * Set the FROM endpoint programmatically (for URL restore)
   */
  function setFrom(endpoint: PathfindEndpoint | undefined): void {
    if (!endpoint) {
      clearFrom();
      return;
    }
    state.from = endpoint;
    fromInput!.value = endpoint.node.name;
    fromInput!.classList.add("has-selection");
    fromClear!.hidden = false;
    fromResultsEl.hidden = true;
    populateSymbolDropdown(fromSymbol, endpoint.node);
    if (endpoint.symbol && fromSymbol) {
      fromSymbol.value = endpoint.symbol;
    }
    updateGoButton();
  }

  /**
   * Set the TO endpoint programmatically (for URL restore)
   */
  function setTo(endpoint: PathfindEndpoint | undefined): void {
    if (!endpoint) {
      clearTo();
      return;
    }
    state.to = endpoint;
    toInput!.value = endpoint.node.name;
    toInput!.classList.add("has-selection");
    toClear!.hidden = false;
    toResultsEl.hidden = true;
    populateSymbolDropdown(toSymbol, endpoint.node);
    if (endpoint.symbol && toSymbol) {
      toSymbol.value = endpoint.symbol;
    }
    updateGoButton();
  }

  /**
   * Execute pathfinding with current state
   */
  function executeFindPath(): void {
    if (state.from && state.to) {
      callbacks.onFindPath(state.from, state.to);
    }
  }

  function swap(): void {
    const { from, to } = state;
    if (!from || !to) {
      return;
    }
    setFrom(to);
    setTo(from);
    callbacks.onFromChange(state.from);
    callbacks.onToChange(state.to);
    executeFindPath();
  }

  return {
    state,
    setFrom,
    setTo,
    clearAll,
    executeFindPath,
    swap
  };
}
