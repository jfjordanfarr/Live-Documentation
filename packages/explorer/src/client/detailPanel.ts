/**
 * @file detailPanel.ts
 * @description Detail panel component for the Live Docs Explorer.
 *
 * Renders a file's Live Doc from the graph in the bundle: its metadata, its
 * authored block as markdown, and its generated sections as navigable lists.
 */
import { renderLiveDoc } from "@live-documentation/engine/live-docs/document";
import type { GraphFile } from "@live-documentation/engine/live-docs/graph";

import { requireElement } from "./dom";
import { renderMarkdown } from "./markdown";
import type { ExplorerNodePayload } from "../shared/types";

/** Public API surface of the Explorer detail panel component. */
export interface DetailPanelApi {
  showNode(node: ExplorerNodePayload): void;
  showBundledDoc(docPath: string, content: string): void;
  setLoading(node: ExplorerNodePayload): void;
  hide(): void;
  /** Download the current node's markdown file */
  downloadCurrentDoc(): void;
  /** Get the current node (if any) */
  getCurrentNode(): ExplorerNodePayload | null;
}

/** Configuration options for the Explorer detail panel. */
export interface DetailPanelOptions {
  /** The graph's files, keyed by code path: what the panel renders a node from. */
  files: Record<string, GraphFile>;

  /**
   * Callback when user clicks a node link in the documentation.
   * Used for navigation within the explorer.
   */
  onNodeClick?: (nodeId: string) => void;

  /**
   * Callback when user clicks a bundled doc link (e.g., README, spec).
   * Used to show the bundled doc in the detail panel.
   */
  onBundledDocClick?: (docPath: string) => void;

  /**
   * Callback when user clicks "Open in Circuit Board".
   */
  onOpenInCircuitBoard?: (node: ExplorerNodePayload) => void;

  /**
   * Callback when user clicks "Open in Membrane Map".
   */
  onOpenInMembraneMap?: (node: ExplorerNodePayload) => void;
}

/**
 * Creates the detail panel component for viewing a file's Live Doc
 * and node metadata.
 */
export function createDetailPanel(
  nodesById: Map<string, ExplorerNodePayload>,
  options: DetailPanelOptions
): DetailPanelApi {
  const { files, onNodeClick, onBundledDocClick, onOpenInCircuitBoard, onOpenInMembraneMap } = options;

  const panel = requireElement<HTMLDivElement>("detail-panel");
  const title = requireElement<HTMLHeadingElement>("detail-title");
  const body = requireElement<HTMLDivElement>("detail-body");
  const closeButton = requireElement<HTMLButtonElement>("detail-close");

  // A static page cannot open an editor
  const editorButton = document.querySelector<HTMLButtonElement>('[onclick="openInEditor()"]');
  if (editorButton) {
    editorButton.style.display = "none";
  }

  // Track current node for action buttons
  let currentNode: ExplorerNodePayload | null = null;
  // Track current bundled doc (for non-graph markdown files)
  let currentBundledDoc: { path: string; content: string } | null = null;

  const hide = (): void => {
    panel.classList.remove("visible");
    currentNode = null;
    currentBundledDoc = null;
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

  // Set up "Open in Membrane Map" button handler
  const membraneMapButton = document.querySelector<HTMLButtonElement>('[onclick="openInMembraneMap()"]');
  if (membraneMapButton && onOpenInMembraneMap) {
    membraneMapButton.onclick = () => {
      if (currentNode) {
        onOpenInMembraneMap(currentNode);
      }
    };
  }

  function setLoading(node: ExplorerNodePayload): void {
    panel.classList.add("visible");
    title.textContent = node.name;
    body.innerHTML = '<p class="loading-indicator">Loading documentation...</p>';
    currentNode = node;
    currentBundledDoc = null; // Clear bundled doc state when showing a graph node
  }

  function showNode(node: ExplorerNodePayload): void {
    setLoading(node);

    // Show Circuit Board, Local Map, and Membrane Map buttons (these are graph nodes)
    const circuitBoardBtn = document.querySelector<HTMLButtonElement>('[onclick="openInCircuitBoard()"]');
    const localViewBtn = document.querySelector<HTMLButtonElement>('[onclick="openInLocalView()"]');
    const membraneMapBtn = document.querySelector<HTMLButtonElement>('[onclick="openInMembraneMap()"]');
    if (circuitBoardBtn) {
      circuitBoardBtn.style.display = "";
    }
    if (localViewBtn) {
      localViewBtn.style.display = "";
    }
    if (membraneMapBtn) {
      membraneMapBtn.style.display = "";
    }

    try {
      const file = files[node.id];
      body.innerHTML = file
        ? renderDocumentation(file, node, nodesById, onNodeClick)
        : renderFallbackDetails(node, nodesById);
      // Attach delegated click handler for node-link elements
      attachNodeLinkHandlers(body, onNodeClick);
      // Attach delegated click handler for bundled doc links
      attachBundledDocLinkHandlers(body, onBundledDocClick);
    } catch (error) {
      console.error(error);
      body.innerHTML = '<p class="error-message">Failed to load documentation for this node.</p>';
    }
  }

  function downloadCurrentDoc(): void {
    // Handle bundled doc download (non-graph markdown files)
    if (currentBundledDoc) {
      const fileName = currentBundledDoc.path.split("/").pop() ?? "document.md";
      const blob = new Blob([currentBundledDoc.content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }
    
    if (!currentNode) return;

    try {
      const file = files[currentNode.id];
      if (!file) {
        console.warn("No Live Doc available for download");
        return;
      }

      // The doc renders back to the bytes the generator wrote
      const blob = new Blob([renderLiveDoc(file)], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Derive extension from node's actual docPath (supports any configured extension)
      const docExt = currentNode.docPath.includes(".")
        ? currentNode.docPath.slice(currentNode.docPath.indexOf(".", currentNode.docPath.lastIndexOf("/") + 1))
        : ".md";
      a.download = `${currentNode.name}${docExt}`;
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

  /**
   * Show a bundled markdown document in the detail panel.
   * Used for READMEs, chat history, specs, etc. linked from Live Docs.
   */
  function showBundledDoc(docPath: string, content: string): void {
    panel.classList.add("visible");
    currentNode = null; // Clear current node since this is not a graph node
    currentBundledDoc = { path: docPath, content }; // Track for download button
    
    // Extract filename from path for title
    const fileName = docPath.split("/").pop() ?? docPath;
    title.textContent = fileName;
    
    // Hide Circuit Board, Local Map, and Membrane Map buttons (bundled docs aren't graph nodes)
    const circuitBoardBtn = document.querySelector<HTMLButtonElement>('[onclick="openInCircuitBoard()"]');
    const localViewBtn = document.querySelector<HTMLButtonElement>('[onclick="openInLocalView()"]');
    const membraneMapBtn = document.querySelector<HTMLButtonElement>('[onclick="openInMembraneMap()"]');
    if (circuitBoardBtn) {
      circuitBoardBtn.style.display = "none";
    }
    if (localViewBtn) {
      localViewBtn.style.display = "none";
    }
    if (membraneMapBtn) {
      membraneMapBtn.style.display = "none";
    }
    
    // Create link handler for bundled doc content
    const linkHandler = createBundledDocLinkHandler(docPath);
    
    // Render the markdown content with file path indicator
    const renderedHtml = renderMarkdown(content, { linkHandler });
    
    body.innerHTML = `
      <div class="bundled-doc-path-indicator">
        <span class="bundled-doc-path">${escapeHtml(docPath)}</span>
      </div>
      <div class="detail-doc-content bundled-doc-content">
        ${renderedHtml}
      </div>
    `;
    
    // Attach click handlers for bundled doc links within this content
    attachBundledDocLinkHandlers(body, onBundledDocClick);
  }

  return { showNode, showBundledDoc, setLoading, hide, downloadCurrentDoc, getCurrentNode };
}

/**
 * Render a file's Live Doc:
 * - Metadata: terse badge rendering
 * - Authored: full markdown rendering with smart links
 * - Generated: structured list rendering with clickable navigation
 */
function renderDocumentation(
  file: GraphFile,
  node: ExplorerNodePayload,
  nodesById: Map<string, ExplorerNodePayload>,
  onNodeClick?: (nodeId: string) => void
): string {
  const parts: string[] = [];

  parts.push(renderNodeMetadata(node, file.generatedAt));

  const authoredHtml = renderAuthoredContent(file.authored, node, nodesById, onNodeClick);
  parts.push(`<div class="doc-authored markdown-body">${authoredHtml}</div>`);

  if (node.publicSymbols.length > 0 || node.dependencies.length > 0 || node.dependents.length > 0) {
    const generatedHtml = renderGeneratedContent(node, nodesById, onNodeClick);
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
  // 1. Links that resolve to a graph node → navigate within explorer
  // 2. Links to external URLs → open in new tab
  // 3. Links to other .md files → treat as bundled doc
  // 4. Other workspace files → external link
  const linkHandler = (href: string, text: string): string => {
    // Strip fragment for path resolution (e.g., "file.md#section" → "file.md")
    const hrefWithoutFragment = href.split("#")[0];

    // First, try to resolve as an in-explorer Live Doc link (extension-agnostic).
    // Any .md href that matches a known graph node gets in-explorer navigation.
    if (hrefWithoutFragment.endsWith(".md")) {
      const resolvedId = resolveRelativePath(hrefWithoutFragment, node.docPath, nodesById);
      if (resolvedId && onNodeClick) {
        return `<a href="#" class="node-link" data-node-id="${escapeHtml(resolvedId)}">${text}</a>`;
      }
    }
    
    // Check if this is an external URL
    if (href.startsWith("http://") || href.startsWith("https://")) {
      return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener">${text}</a>`;
    }
    
    // Markdown file that didn't resolve to a node → potential bundled doc
    if (hrefWithoutFragment.endsWith(".md")) {
      const resolvedPath = resolveRelativePathToWorkspace(hrefWithoutFragment, node.docPath);
      return `<a href="#" class="bundled-doc-link" data-doc-path="${escapeHtml(resolvedPath)}">${text}</a>`;
    }
    
    // Workspace file (not markdown) - render as external link
    return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener" class="workspace-link">${text}</a>`;
  };

  return renderMarkdown(content, { linkHandler });
}

/**
 * Render generated content (Public Symbols, Dependencies) with structured badge/list style.
 */
function renderGeneratedContent(
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

/**
 * Resolve a relative path from a doc to a workspace-relative path.
 * Used for linking to bundled markdown files.
 */
function resolveRelativePathToWorkspace(
  relativePath: string,
  fromDocPath: string
): string {
  // Handle absolute paths (starting with /)
  if (relativePath.startsWith("/")) {
    return relativePath.slice(1); // Remove leading slash
  }
  
  // Get the directory of the source doc, stripping the Live Docs root prefix.
  // e.g., ".live-documentation/source/packages/generator/src/generator.ts.md" → "packages/generator/src"
  //        ".mdmd/layer-4/packages/generator/src/generator.ts.mdmd.md"       → "packages/generator/src"
  let sourceDir = fromDocPath;
  
  // Remove the Live Doc filename
  const lastSlash = sourceDir.lastIndexOf("/");
  if (lastSlash !== -1) {
    sourceDir = sourceDir.substring(0, lastSlash);
  }
  
  // Remove Live Docs root prefix (supports both default and MDMD-style layouts)
  sourceDir = sourceDir.replace(/^\.live-documentation\/[^/]+\//, "");
  sourceDir = sourceDir.replace(/^\.mdmd\/layer-\d+\//, "");
  
  // Resolve the relative path
  const parts = sourceDir.split("/").filter(Boolean);
  const targetParts = relativePath.split("/");
  
  for (const part of targetParts) {
    if (part === "..") {
      parts.pop();
    } else if (part !== ".") {
      parts.push(part);
    }
  }
  
  return parts.join("/");
}

/**
 * Attach click handlers for bundled doc links in the detail panel.
 */
function attachBundledDocLinkHandlers(
  container: HTMLElement,
  onBundledDocClick?: (docPath: string) => void
): void {
  if (!onBundledDocClick) return;

  // Find all bundled-doc-link elements and attach click handlers
  const docLinks = container.querySelectorAll<HTMLAnchorElement>("a.bundled-doc-link[data-doc-path]");
  docLinks.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const docPath = link.dataset.docPath;
      if (docPath) {
        onBundledDocClick(docPath);
      }
    });
  });
}

/**
 * Create a link handler for bundled doc content.
 * Used when rendering markdown content from non-Live-Doc files (READMEs, chat history, etc.)
 */
function createBundledDocLinkHandler(
  fromDocPath: string
): (href: string, text: string) => string {
  return (href: string, text: string): string => {
    // External URLs - open in new tab
    if (href.startsWith("http://") || href.startsWith("https://")) {
      return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener">${text}</a>`;
    }
    
    // Check if this is a markdown file (potential bundled doc)
    // Strip fragment identifier for the .md check (e.g., "file.md#L100" → "file.md")
    const hrefWithoutFragment = href.split("#")[0];
    if (hrefWithoutFragment.endsWith(".md")) {
      // Resolve the relative path from the bundled doc's location
      const resolvedPath = resolveRelativePathFromBundledDoc(hrefWithoutFragment, fromDocPath);
      return `<a href="#" class="bundled-doc-link" data-doc-path="${escapeHtml(resolvedPath)}">${text}</a>`;
    }
    
    // Other workspace files - render as external link (won't work in static mode)
    return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener" class="workspace-link">${text}</a>`;
  };
}

/**
 * Resolve a relative path from a bundled doc to a workspace-relative path.
 * Similar to resolveRelativePathToWorkspace but doesn't strip the Live Docs root prefix.
 */
function resolveRelativePathFromBundledDoc(
  relativePath: string,
  fromDocPath: string
): string {
  // Handle absolute paths (starting with /)
  if (relativePath.startsWith("/")) {
    return relativePath.slice(1); // Remove leading slash
  }
  
  // Get the directory of the source doc
  let sourceDir = fromDocPath;
  const lastSlash = sourceDir.lastIndexOf("/");
  if (lastSlash !== -1) {
    sourceDir = sourceDir.substring(0, lastSlash);
  } else {
    sourceDir = "";
  }
  
  // Resolve the relative path
  const parts = sourceDir.split("/").filter(Boolean);
  const targetParts = relativePath.split("/");
  
  for (const part of targetParts) {
    if (part === "..") {
      parts.pop();
    } else if (part !== ".") {
      parts.push(part);
    }
  }
  
  return parts.join("/");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
