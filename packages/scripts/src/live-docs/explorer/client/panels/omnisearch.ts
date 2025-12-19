/**
 * Omnisearch Panel
 * 
 * Provides fuzzy search across all graph nodes with keyboard navigation.
 * Triggered via Ctrl+P hotkey, similar to VS Code's quick open.
 */

import type { ExplorerGraphPayload, ExplorerNodePayload } from "../../shared/types";

/** Callback for when a node is selected from search results */
export type OmnisearchSelectCallback = (node: ExplorerNodePayload) => void | Promise<void>;

/** Omnisearch configuration */
export interface OmnisearchConfig {
  graphData: ExplorerGraphPayload;
  onSelect: OmnisearchSelectCallback;
}

/**
 * Get archetype display icon
 */
const getArchetypeIcon = (archetype: string): string => {
  const lower = archetype.toLowerCase();
  if (lower === "test") return "🧪";
  if (lower === "asset") return "📄";
  if (lower === "config") return "⚙️";
  return "📦";
};

/**
 * Escape HTML special characters
 */
const escapeHtml = (str: string): string => {
  return str.replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c] || c));
};

/**
 * Initialize the omnisearch panel with keyboard shortcuts and fuzzy search.
 * 
 * @param config - Omnisearch configuration
 * @returns API for programmatic control
 */
export function initOmnisearch(config: OmnisearchConfig): { open: () => void; close: () => void } {
  const { graphData, onSelect } = config;

  const omnisearch = document.getElementById("omnisearch");
  const omnisearchInput = document.getElementById("omnisearch-input") as HTMLInputElement | null;
  const omnisearchResults = document.getElementById("omnisearch-results");
  const backdrop = omnisearch?.querySelector(".omnisearch-backdrop");

  if (!omnisearch || !omnisearchInput || !omnisearchResults) {
    return { open: () => {}, close: () => {} };
  }

  let selectedIndex = -1;
  let currentResults: ExplorerNodePayload[] = [];

  // Open omnisearch
  const openOmnisearch = (): void => {
    omnisearch.hidden = false;
    omnisearchInput.value = "";
    omnisearchInput.focus();
    omnisearchResults.innerHTML = "";
    selectedIndex = -1;
    currentResults = [];
  };

  // Close omnisearch
  const closeOmnisearch = (): void => {
    omnisearch.hidden = true;
    omnisearchInput.blur();
  };

  // Fuzzy search nodes
  const searchNodes = (query: string): ExplorerNodePayload[] => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    const terms = lowerQuery.split(/\s+/);
    
    return graphData.nodes
      .map(node => {
        const name = (node.name || '').toLowerCase();
        const path = (node.codeRelativePath || '').toLowerCase();
        // publicSymbols is string[], not {name}[]
        const symbols = (node.publicSymbols || []).map(s => (s || '').toLowerCase());
        
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
      .slice(0, 20)
      .map(r => r.node);
  };

  // Render results
  const renderResults = (results: ExplorerNodePayload[]): void => {
    currentResults = results;
    selectedIndex = results.length > 0 ? 0 : -1;
    
    if (results.length === 0) {
      omnisearchResults.innerHTML = '<div class="omnisearch-empty">No results found</div>';
      return;
    }

    omnisearchResults.innerHTML = results.map((node, i) => `
      <div class="omnisearch-result ${i === 0 ? 'selected' : ''}" data-index="${i}">
        <span class="omnisearch-result-icon">${getArchetypeIcon(node.archetype)}</span>
        <div class="omnisearch-result-text">
          <div class="omnisearch-result-name">${escapeHtml(node.name)}</div>
          <div class="omnisearch-result-path">${escapeHtml(node.codeRelativePath)}</div>
        </div>
        <span class="omnisearch-result-badge">${node.archetype}</span>
      </div>
    `).join("");
  };

  // Update selection highlight
  const updateSelection = (): void => {
    const items = omnisearchResults.querySelectorAll(".omnisearch-result");
    items.forEach((item, i) => {
      item.classList.toggle("selected", i === selectedIndex);
    });
    // Scroll into view
    const selected = omnisearchResults.querySelector(".omnisearch-result.selected");
    selected?.scrollIntoView({ block: "nearest" });
  };

  // Select result
  const selectResult = (node: ExplorerNodePayload): void => {
    closeOmnisearch();
    void onSelect(node);
  };

  // Event listeners
  omnisearchInput.addEventListener("input", () => {
    const results = searchNodes(omnisearchInput.value);
    renderResults(results);
  });

  omnisearchInput.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeOmnisearch();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (currentResults.length > 0) {
        selectedIndex = (selectedIndex + 1) % currentResults.length;
        updateSelection();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (currentResults.length > 0) {
        selectedIndex = selectedIndex <= 0 ? currentResults.length - 1 : selectedIndex - 1;
        updateSelection();
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < currentResults.length) {
        selectResult(currentResults[selectedIndex]);
      }
    }
  });

  omnisearchResults.addEventListener("click", e => {
    const target = (e.target as HTMLElement).closest(".omnisearch-result");
    if (target instanceof HTMLElement) {
      const index = parseInt(target.dataset.index || "-1", 10);
      if (index >= 0 && index < currentResults.length) {
        selectResult(currentResults[index]);
      }
    }
  });

  backdrop?.addEventListener("click", closeOmnisearch);

  // Global keyboard shortcut (Ctrl+P)
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key === "p") {
      e.preventDefault();
      openOmnisearch();
    }
  });

  // Expose to global window for legacy compatibility
  const globalWindow = window as unknown as Record<string, unknown>;
  globalWindow.openOmnisearch = openOmnisearch;

  return { open: openOmnisearch, close: closeOmnisearch };
}
