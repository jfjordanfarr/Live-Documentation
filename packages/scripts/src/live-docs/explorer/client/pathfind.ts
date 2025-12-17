/**
 * Pathfind Toolbar Module
 * 
 * Provides FROM/TO artifact and symbol search for pathfinding visualization.
 * Integrates with the omnisearch pattern but operates inline within the Local Map view.
 */

import type { ExplorerNodePayload } from "../shared/types";

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

/** Callbacks for pathfind events */
export interface PathfindCallbacks {
  onFromChange: (endpoint: PathfindEndpoint | undefined) => void;
  onToChange: (endpoint: PathfindEndpoint | undefined) => void;
  onFindPath: (from: PathfindEndpoint, to: PathfindEndpoint) => void;
  onClear: () => void;
}

/**
 * Initialize the pathfind toolbar with search and symbol selection
 */
export function initPathfind(
  nodes: ExplorerNodePayload[],
  callbacks: PathfindCallbacks
): PathfindState {
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
    return state;
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

  function getArchetypeIcon(archetype: string): string {
    const lower = archetype.toLowerCase();
    if (lower === "test") return "🧪";
    if (lower === "asset") return "📄";
    if (lower === "config") return "⚙️";
    return "📦";
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
        <span class="pathfind-result-icon">${getArchetypeIcon(node.archetype)}</span>
        <div class="pathfind-result-text">
          <div class="pathfind-result-name">${escapeHtml(node.name)}</div>
          <div class="pathfind-result-path">${escapeHtml(node.codeRelativePath)}</div>
        </div>
        <span class="pathfind-result-badge">${node.archetype}</span>
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

  return state;
}
