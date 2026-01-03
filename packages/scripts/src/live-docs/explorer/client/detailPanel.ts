/**
 * @file detailPanel.ts
 * @description Detail panel component for the Live Docs Explorer.
 * 
 * Supports two modes:
 * - **Server mode**: Fetches doc content from `/details` endpoint
 * - **Static mode**: Uses embedded markdown from `StaticExplorerData.docs`
 * 
 * Renders full Live Documentation markdown with proper formatting.
 */
import { requireElement } from "./dom";
import { renderMarkdown } from "./markdown";
import type {
  ExplorerDetailPayload,
  ExplorerNodePayload
} from "../shared/types";

export interface DetailPanelApi {
  showNode(node: ExplorerNodePayload): Promise<void>;
  setLoading(node: ExplorerNodePayload): void;
  hide(): void;
  /** Download the current node's markdown file */
  downloadCurrentDoc(): Promise<void>;
  /** Get the current node (if any) */
  getCurrentNode(): ExplorerNodePayload | null;
}

export interface DetailPanelOptions {
  /**
   * Embedded docs from static bundle (keyed by node ID).
   * If provided, the panel operates in static mode.
   */
  staticDocs?: Record<string, string>;

  /**
   * Callback when user clicks a node link in the documentation.
   * Used for navigation within the explorer.
   */
  onNodeClick?: (nodeId: string) => void;

  /**
   * Callback when user clicks "Open in Circuit Board".
   */
  onOpenInCircuitBoard?: (node: ExplorerNodePayload) => void;
}

export function createDetailPanel(
  nodesById: Map<string, ExplorerNodePayload>,
  options: DetailPanelOptions = {}
): DetailPanelApi {
  const { staticDocs, onNodeClick, onOpenInCircuitBoard } = options;
  const isStaticMode = staticDocs !== undefined;

  const panel = requireElement<HTMLDivElement>("detail-panel");
  const title = requireElement<HTMLHeadingElement>("detail-title");
  const body = requireElement<HTMLDivElement>("detail-body");
  const closeButton = requireElement<HTMLButtonElement>("detail-close");

  // Hide "Open in Editor" button in static mode
  if (isStaticMode) {
    const editorButton = document.querySelector<HTMLButtonElement>('[onclick="openInEditor()"]');
    if (editorButton) {
      editorButton.style.display = "none";
    }
  }

  // Track current node for action buttons
  let currentNode: ExplorerNodePayload | null = null;

  const hide = (): void => {
    panel.classList.remove("visible");
    currentNode = null;
  };

  closeButton.addEventListener("click", hide);
  closeButton.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      hide();
    }
  });

  // Set up "Open in Circuit Board" button handler
  const circuitBoardButton = document.querySelector<HTMLButtonElement>('[onclick="openInCircuitBoard()"]');
  if (circuitBoardButton && onOpenInCircuitBoard) {
    circuitBoardButton.onclick = () => {
      if (currentNode) {
        onOpenInCircuitBoard(currentNode);
      }
    };
  }

  function setLoading(node: ExplorerNodePayload): void {
    panel.classList.add("visible");
    title.textContent = node.name;
    body.innerHTML = '<p class="loading-indicator">Loading documentation...</p>';
    currentNode = node;
  }

  async function showNode(node: ExplorerNodePayload): Promise<void> {
    setLoading(node);

    try {
      if (isStaticMode && staticDocs) {
        // Static mode: use embedded markdown
        const markdown = staticDocs[node.id];
        if (markdown) {
          body.innerHTML = renderDocumentation(markdown, node, nodesById, onNodeClick);
        } else {
          body.innerHTML = renderFallbackDetails(node, nodesById);
        }
      } else {
        // Server mode: fetch from API
        const response = await fetch(`/details?docPath=${encodeURIComponent(node.docPath)}`);
        if (!response.ok) {
          throw new Error("Failed to load details");
        }
        const details = (await response.json()) as ExplorerDetailPayload;
        body.innerHTML = renderServerDetails(node, details, nodesById, onNodeClick);
      }
      // Attach delegated click handler for node-link elements
      attachNodeLinkHandlers(body, onNodeClick);
    } catch (error) {
      console.error(error);
      body.innerHTML = '<p class="error-message">Failed to load documentation for this node.</p>';
    }
  }

  async function downloadCurrentDoc(): Promise<void> {
    if (!currentNode) return;
    
    try {
      let markdown: string;
      
      if (isStaticMode && staticDocs) {
        // Static mode: use embedded markdown
        markdown = staticDocs[currentNode.id] ?? "";
      } else {
        // Server mode: fetch from doc endpoint
        const response = await fetch(`/doc?docPath=${encodeURIComponent(currentNode.docPath)}`);
        if (!response.ok) {
          throw new Error("Failed to fetch markdown");
        }
        markdown = await response.text();
      }
      
      if (!markdown) {
        console.warn("No markdown content available for download");
        return;
      }
      
      // Create download
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentNode.name}.mdmd.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download markdown:", error);
    }
  }

  function getCurrentNode(): ExplorerNodePayload | null {
    return currentNode;
  }

  return { showNode, setLoading, hide, downloadCurrentDoc, getCurrentNode };
}

/**
 * Parsed sections from a Live Documentation file.
 */
interface ParsedLiveDoc {
  /** Raw metadata key-value pairs */
  metadata: Record<string, string>;
  /** Authored section markdown (Purpose, Notes, etc.) */
  authored: string;
  /** Generated section markdown (Public Symbols, Dependencies) */
  generated: string;
}

/**
 * Parse a Live Documentation markdown file into its sections.
 * Live Docs have structure: # Title > ## Metadata > ## Authored > ## Generated
 */
function parseLiveDocSections(markdown: string): ParsedLiveDoc {
  const result: ParsedLiveDoc = { metadata: {}, authored: "", generated: "" };
  
  // Find section boundaries using ## headers
  const metadataMatch = markdown.match(/^## Metadata\s*\n([\s\S]*?)(?=^## |$)/m);
  const authoredMatch = markdown.match(/^## Authored\s*\n([\s\S]*?)(?=^## |$)/m);
  const generatedMatch = markdown.match(/^## Generated\s*\n([\s\S]*?)$/m);
  
  // Parse metadata as key-value pairs
  if (metadataMatch) {
    const lines = metadataMatch[1].trim().split("\n");
    for (const line of lines) {
      const kvMatch = line.match(/^- ([^:]+):\s*(.+)$/);
      if (kvMatch) {
        result.metadata[kvMatch[1].trim()] = kvMatch[2].trim();
      }
    }
  }
  
  if (authoredMatch) {
    result.authored = authoredMatch[1].trim();
  }
  
  if (generatedMatch) {
    result.generated = generatedMatch[1].trim();
  }
  
  return result;
}

/**
 * Render full Live Documentation with hybrid approach:
 * - Metadata: Terse badge rendering
 * - Authored: Full markdown rendering with smart links
 * - Generated: Structured badge/list rendering with clickable navigation
 */
function renderDocumentation(
  markdown: string,
  node: ExplorerNodePayload,
  nodesById: Map<string, ExplorerNodePayload>,
  onNodeClick?: (nodeId: string) => void
): string {
  const parsed = parseLiveDocSections(markdown);
  const parts: string[] = [];
  
  // 1. Metadata section - terse badge rendering with generated timestamp
  const generatedAt = parsed.metadata["Generated At"];
  parts.push(renderNodeMetadata(node, generatedAt));
  
  // 2. Authored section - full markdown rendering
  if (parsed.authored) {
    const authoredHtml = renderAuthoredContent(parsed.authored, node, nodesById, onNodeClick);
    parts.push(`<div class="doc-authored markdown-body">${authoredHtml}</div>`);
  }
  
  // 3. Generated section - structured rendering
  if (parsed.generated || node.publicSymbols.length > 0 || node.dependencies.length > 0) {
    const generatedHtml = renderGeneratedContent(parsed.generated, node, nodesById, onNodeClick);
    parts.push(`<div class="doc-generated">${generatedHtml}</div>`);
  }
  
  return parts.join("");
}

/**
 * Render authored content (Purpose, Notes) with full markdown and smart link handling.
 */
function renderAuthoredContent(
  content: string,
  node: ExplorerNodePayload,
  nodesById: Map<string, ExplorerNodePayload>,
  onNodeClick?: (nodeId: string) => void
): string {
  // Create link handler with smart routing rules:
  // 1. Links to .mdmd.md files → navigate within explorer
  // 2. Links to external URLs → open in new tab
  // 3. Links to workspace files (not Live Docs) → external link (static) or VS Code (server)
  const linkHandler = (href: string, text: string): string => {
    // Check if this is a Live Doc link
    if (href.endsWith(".mdmd.md")) {
      const resolvedId = resolveRelativePath(href, node.docPath, nodesById);
      if (resolvedId && onNodeClick) {
        return `<a href="#" class="node-link" data-node-id="${escapeHtml(resolvedId)}">${text}</a>`;
      }
    }
    
    // Check if this is an external URL
    if (href.startsWith("http://") || href.startsWith("https://")) {
      return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener">${text}</a>`;
    }
    
    // Workspace file (not a Live Doc) - render as external link for now
    // TODO: In server mode, this could open in VS Code; in static mode, use repo URL prefix
    return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener" class="workspace-link">${text}</a>`;
  };

  return renderMarkdown(content, { linkHandler });
}

/**
 * Render generated content (Public Symbols, Dependencies) with structured badge/list style.
 */
function renderGeneratedContent(
  rawGenerated: string,
  node: ExplorerNodePayload,
  nodesById: Map<string, ExplorerNodePayload>,
  onNodeClick?: (nodeId: string) => void
): string {
  const parts: string[] = [];
  
  // Public Symbols - render as badge pills
  if (node.publicSymbols.length > 0) {
    const symbolBadges = node.publicSymbols
      .map(s => `<span class="symbol-badge">${escapeHtml(s)}</span>`)
      .join("");
    parts.push(sectionHtml("Public Symbols", `<div class="symbol-badges">${symbolBadges}</div>`));
  }
  
  // Dependencies - render as clickable list items
  const resolvedDeps = node.dependencies.filter(d => d.resolved);
  if (resolvedDeps.length > 0) {
    const depItems = resolvedDeps
      .map(d => renderDependencyItem(d, nodesById, onNodeClick))
      .sort()
      .join("");
    parts.push(sectionHtml("Dependencies", `<div class="dep-list">${depItems}</div>`));
  }
  
  // Dependents - render as clickable list items
  if (node.dependents.length > 0) {
    const depItems = node.dependents
      .map(depId => renderDependentItem(depId, nodesById, onNodeClick))
      .sort()
      .join("");
    parts.push(sectionHtml("Dependents", `<div class="dep-list">${depItems}</div>`));
  }
  
  return parts.join("");
}

/**
 * Render a single dependency as a clickable list item.
 */
function renderDependencyItem(
  dep: { targetId?: string; targetSymbol?: string; label?: string; raw?: string },
  nodesById: Map<string, ExplorerNodePayload>,
  onNodeClick?: (nodeId: string) => void
): string {
  const target = dep.targetId ? nodesById.get(dep.targetId) : undefined;
  const displayPath = target?.codeRelativePath ?? dep.targetId ?? dep.label ?? dep.raw ?? "unknown";
  const symbolLine = dep.targetSymbol 
    ? `<div class="dep-symbol">${escapeHtml(dep.targetSymbol)}</div>` 
    : "";
  
  if (target && onNodeClick) {
    return `<div class="dep-item"><a href="#" class="node-link dep-path" data-node-id="${escapeHtml(target.id)}">${escapeHtml(displayPath)}</a>${symbolLine}</div>`;
  }
  return `<div class="dep-item"><span class="dep-path">${escapeHtml(displayPath)}</span>${symbolLine}</div>`;
}

/**
 * Render a single dependent as a clickable list item.
 */
function renderDependentItem(
  depId: string,
  nodesById: Map<string, ExplorerNodePayload>,
  onNodeClick?: (nodeId: string) => void
): string {
  const target = nodesById.get(depId);
  const displayPath = target?.codeRelativePath ?? depId;
  
  if (target && onNodeClick) {
    return `<div class="dep-item"><a href="#" class="node-link" data-node-id="${escapeHtml(target.id)}">${escapeHtml(displayPath)}</a></div>`;
  }
  return `<div class="dep-item">${escapeHtml(displayPath)}</div>`;
}

/**
 * Attach click handlers for node-link elements in the detail panel.
 * Uses event delegation to handle dynamically rendered links.
 */
function attachNodeLinkHandlers(
  container: HTMLElement,
  onNodeClick?: (nodeId: string) => void
): void {
  if (!onNodeClick) return;

  // Find all node-link elements and attach click handlers
  const nodeLinks = container.querySelectorAll<HTMLAnchorElement>("a.node-link[data-node-id]");
  nodeLinks.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const nodeId = link.dataset.nodeId;
      if (nodeId) {
        onNodeClick(nodeId);
      }
    });
  });
}

/**
 * Render node metadata badges (archetype, paths, generated timestamp).
 */
function renderNodeMetadata(node: ExplorerNodePayload, generatedAt?: string): string {
  const archetypeIcon = getArchetypeIcon(node.archetype);
  const archetypeClass = `archetype-${node.archetype.toLowerCase()}`;
  
  let generatedAtHtml = "";
  if (generatedAt) {
    const date = new Date(generatedAt);
    const formatted = isNaN(date.getTime()) 
      ? generatedAt 
      : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    generatedAtHtml = `
      <div class="metadata-row generated-row">
        <span class="metadata-icon">⏱</span>
        <span class="metadata-label">Generated:</span>
        <span class="metadata-value">${formatted}</span>
      </div>
    `;
  }
  
  return `
    <div class="metadata-row archetype-row">
      <span class="archetype-badge ${archetypeClass}">
        <span class="archetype-icon">${archetypeIcon}</span>
        <span class="archetype-label">${node.archetype}</span>
      </span>
    </div>
    <div class="metadata-row path-row">
      <span class="path-label">CODE:</span>
      <code class="path-value">${node.codeRelativePath}</code>
    </div>
    ${generatedAtHtml}
  `;
}

/**
 * Get icon for archetype (using CSS-safe Unicode symbols, not emojis).
 */
function getArchetypeIcon(archetype: string): string {
  switch (archetype.toLowerCase()) {
    case "implementation": return "◆"; // diamond
    case "test": return "✓"; // checkmark
    case "asset": return "◎"; // bullseye
    case "stub": return "○"; // circle
    default: return "◇"; // empty diamond
  }
}

/**
 * Fallback rendering when markdown is not available.
 */
function renderFallbackDetails(
  node: ExplorerNodePayload,
  nodesById: Map<string, ExplorerNodePayload>
): string {
  const parts: string[] = [];

  parts.push(renderNodeMetadata(node));

  if (node.publicSymbols.length > 0) {
    const symbols = node.publicSymbols.map(s => `<span class="pill">${escapeHtml(s)}</span>`).join(" ");
    parts.push(sectionHtml("Public Symbols", symbols));
  }

  if (node.dependencies.length > 0) {
    const deps = node.dependencies
      .filter(d => d.resolved)
      .map(d => describeDependency(d, nodesById))
      .sort();
    if (deps.length > 0) {
      parts.push(sectionHtml("Dependencies", listHtml(deps)));
    }
  }

  if (node.dependents.length > 0) {
    const dependents = node.dependents
      .map(d => nodesById.get(d)?.codeRelativePath ?? d)
      .sort();
    parts.push(sectionHtml("Dependents", listHtml(dependents)));
  }

  return parts.join("");
}

/**
 * Render details from server API response.
 * Uses the new 'authored' field if available, falls back to 'purpose' for backward compatibility.
 */
function renderServerDetails(
  node: ExplorerNodePayload,
  details: ExplorerDetailPayload,
  nodesById: Map<string, ExplorerNodePayload>,
  onNodeClick?: (nodeId: string) => void
): string {
  const parts: string[] = [];
  
  // Metadata section with Generated At timestamp
  parts.push(`<div class="doc-metadata">${renderNodeMetadata(node, details.generatedAt)}</div>`);
  
  // Authored section - use full 'authored' field if available, otherwise fall back to 'purpose'
  const authoredContent = details.authored || details.purpose;
  if (authoredContent) {
    const authoredHtml = renderAuthoredContent(authoredContent, node, nodesById, onNodeClick);
    parts.push(`<div class="doc-authored markdown-body">${authoredHtml}</div>`);
  }
  
  // Generated content section
  const generatedHtml = renderGeneratedContent("", node, nodesById, onNodeClick);
  if (generatedHtml) {
    parts.push(`<div class="doc-generated">${generatedHtml}</div>`);
  }
  
  return parts.join("");
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function sectionHtml(label: string, content: string): string {
  return `
    <div class="detail-section">
      <div class="detail-label">${label}</div>
      <div class="detail-content">${content}</div>
    </div>
  `;
}

function listHtml(entries: string[], isError = false): string {
  const className = isError ? "error-list" : "";
  return `<div class="${className}">${entries.map(e => `<div class="list-item">${e}</div>`).join("")}</div>`;
}

function describeDependency(
  reference: { targetId?: string; targetSymbol?: string; label?: string; raw?: string; resolved?: boolean },
  nodesById: Map<string, ExplorerNodePayload>
): string {
  const target = reference.targetId ? nodesById.get(reference.targetId) : undefined;
  const basePath = target?.codeRelativePath ?? reference.targetId ?? reference.label ?? reference.raw ?? "unknown";
  const symbolSuffix = reference.targetSymbol ? ` · ${reference.targetSymbol}` : "";
  return `${basePath}${symbolSuffix}`;
}

/**
 * Resolve a relative path from a doc to a node ID.
 */
function resolveRelativePath(
  relativePath: string,
  fromDocPath: string,
  nodesById: Map<string, ExplorerNodePayload>
): string | null {
  // Simple resolution: try to find a node whose docPath or codePath matches
  // This is a heuristic; proper resolution would need path normalization
  const normalizedTarget = relativePath.replace(/^\.\.?\/?/, "");

  for (const [id, node] of nodesById) {
    if (node.docPath.endsWith(normalizedTarget) || node.codePath.endsWith(normalizedTarget)) {
      return id;
    }
    // Also check if the code relative path matches
    if (node.codeRelativePath === normalizedTarget || id === normalizedTarget) {
      return id;
    }
  }
  return null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
