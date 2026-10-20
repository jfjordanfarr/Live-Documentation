/**
 * @file detailPanel.ts
 * @description Detail panel component for the Live Docs Explorer.
 *
 * Renders a file's Live Doc from the graph in the bundle: its metadata, its
 * authored block as markdown, and its generated sections as navigable lists.
 */
import { renderLiveDoc, symbolName } from "@live-documentation/engine/live-docs/document";
import type { GraphFile } from "@live-documentation/engine/live-docs/graph";

import { requireElement } from "./dom";
import { escapeHtml } from "./graph-helpers";
import { renderMarkdown } from "./markdown";
import type { InspectionTarget } from "./types";
import { INTERNAL_SYMBOL } from "./views/pin-state";
import type { ExplorerNodePayload } from "../shared/types";

/** A reader control whose meaning and state belong to the application. */
export interface DetailPanelAction {
  label: string;
  /** Optional concise visible wording; the full label remains its accessible name and tooltip. */
  text?: string;
  pressed?: boolean;
  run(): void;
}

/** Public API surface of the Explorer detail panel component. */
export interface DetailPanelApi {
  showNode(node: ExplorerNodePayload, symbol?: string): void;
  showDirectory(directory: string): void;
  showBundledDoc(docPath: string, content: string, fragment?: string): void;
  setActions(actions: readonly DetailPanelAction[]): void;
  /** A line above the evidence saying what it is read against, or null for none. */
  setNote(text: string | null): void;
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
  /** Bundled authored documents, keyed by their actual workspace paths. */
  bundledMarkdown?: Readonly<Record<string, string>>;

  /**
   * Callback when user clicks a node link in the documentation.
   * Used for navigation within the explorer.
   */
  onNodeClick?: (nodeId: string, symbol?: string) => void;
  /** Ask the application to inspect a directory named by the reader. */
  onDirectoryClick?: (directory: string) => void;
  /** Ask the application to close evidence, including its address/history state. */
  onClose?: () => void;

  /**
   * Callback when user clicks a bundled doc link (e.g., README, spec).
   * Used to show the bundled doc in the detail panel.
   */
  onBundledDocClick?: (docPath: string, fragment?: string) => void;

}

/**
 * Creates the detail panel component for viewing a file's Live Doc
 * and node metadata.
 */
export function createDetailPanel(
  nodesById: Map<string, ExplorerNodePayload>,
  options: DetailPanelOptions
): DetailPanelApi {
  const { files, onNodeClick, onDirectoryClick, onBundledDocClick, onClose } = options;
  const linkContext: ReaderLinkContext = { nodesById, files, bundledMarkdown: options.bundledMarkdown };

  const panel = requireElement<HTMLDivElement>("detail-panel");
  const title = requireElement<HTMLHeadingElement>("detail-title");
  const body = requireElement<HTMLDivElement>("detail-body");
  const closeButton = requireElement<HTMLButtonElement>("detail-close");
  const downloadButton = requireElement<HTMLButtonElement>("download-doc-btn");
  const actions = document.createElement("div");
  actions.className = "detail-actions";
  downloadButton.before(actions);
  const note = document.createElement("p");
  note.className = "detail-note";
  note.hidden = true;
  body.before(note);
  panel.setAttribute("aria-hidden", "true");
  panel.inert = true;

  // Track current node for action buttons
  let currentNode: ExplorerNodePayload | null = null;
  // Track current bundled doc (for non-graph markdown files)
  let currentBundledDoc: { path: string; content: string } | null = null;
  let currentTarget: InspectionTarget | null = null;

  const hide = (): void => {
    panel.classList.remove("visible");
    panel.setAttribute("aria-hidden", "true");
    panel.inert = true;
    currentNode = null;
    currentBundledDoc = null;
    currentTarget = null;
    actions.replaceChildren();
  };

  closeButton.addEventListener("click", () => { if (onClose) onClose(); else hide(); });

  function setActions(commands: readonly DetailPanelAction[]): void {
    const focusedIndex = [...actions.children].indexOf(document.activeElement as Element);
    actions.replaceChildren(...commands.map(command => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "action-btn ghost";
      button.textContent = command.text ?? command.label;
      button.setAttribute("aria-label", command.label);
      button.title = command.label;
      if (command.pressed !== undefined) button.setAttribute("aria-pressed", String(command.pressed));
      button.addEventListener("click", () => command.run());
      return button;
    }));
    actions.hidden = commands.length === 0;
    if (focusedIndex >= 0) {
      (actions.children[Math.min(focusedIndex, actions.children.length - 1)] as HTMLButtonElement | undefined)
        ?.focus({ preventScroll: true });
    }
  }

  function reveal(): void {
    panel.inert = false;
    panel.setAttribute("aria-hidden", "false");
    panel.classList.add("visible");
  }

  function attachReaderLinks(): void {
    attachNodeLinkHandlers(body, onNodeClick);
    attachBundledDocLinkHandlers(body, onBundledDocClick);
    body.querySelectorAll<HTMLAnchorElement>("a.directory-link[data-directory]").forEach(link => {
      link.addEventListener("click", event => {
        event.preventDefault();
        if (link.dataset.directory !== undefined) onDirectoryClick?.(link.dataset.directory);
      });
    });
    body.querySelectorAll<HTMLAnchorElement>("a.reader-anchor[data-fragment]").forEach(link => {
      link.addEventListener("click", event => {
        event.preventDefault();
        scrollToFragment(link.dataset.fragment);
      });
    });
  }

  /** Scroll only the reader, never the canvas or an ancestor of its overlay. */
  function scrollToFragment(fragment?: string): void {
    const target = fragment ? [...body.querySelectorAll<HTMLElement>("[id]")].find(element => element.id === fragment) : undefined;
    body.scrollTop = target
      ? body.scrollTop + target.getBoundingClientRect().top - body.getBoundingClientRect().top
      : 0;
  }

  function setLoading(node: ExplorerNodePayload): void {
    reveal();
    title.textContent = node.name;
    body.innerHTML = '<p class="loading-indicator">Loading documentation...</p>';
    currentNode = node;
    currentBundledDoc = null; // Clear bundled doc state when showing a graph node
    currentTarget = null;
  }

  function showNode(node: ExplorerNodePayload, symbol?: string): void {
    if (currentTarget?.kind === "file" && currentTarget.nodeId === node.id && currentTarget.symbol === symbol && currentNode === node) return;
    setLoading(node);
    currentTarget = { kind: "file", nodeId: node.id, ...(symbol ? { symbol } : {}) };
    downloadButton.hidden = false;

    try {
      const file = files[node.id];
      body.innerHTML = file
        ? renderDocumentation(file, node, linkContext, symbol)
        : renderFallbackDetails(node, nodesById);
      attachReaderLinks();
      body.scrollTop = 0;
    } catch (error) {
      console.error(error);
      body.innerHTML = '<p class="error-message">Failed to load documentation for this node.</p>';
    }
  }

  /** A directory is read from the bundled graph's file inventory, without a separate data channel. */
  function showDirectory(directory: string): void {
    if (currentTarget?.kind === "directory" && currentTarget.directory === directory) return;
    reveal();
    currentNode = null;
    currentBundledDoc = null;
    currentTarget = { kind: "directory", directory };
    title.textContent = directory || "Scan root";
    downloadButton.hidden = true;
    const prefix = directory ? `${directory}/` : "";
    const filesHere = [...nodesById.values()].filter(node => node.id.startsWith(prefix)).sort((a, b) => a.id.localeCompare(b.id));
    const directFiles = filesHere.filter(node => !node.id.slice(prefix.length).includes("/"));
    const subdirectories = [...new Set(filesHere.flatMap(node => {
      const tail = node.id.slice(prefix.length);
      const slash = tail.indexOf("/");
      return slash < 0 ? [] : [`${prefix}${tail.slice(0, slash)}`];
    }))].sort();
    body.innerHTML = `<div class="detail-doc-content"><p>${filesHere.length} ${filesHere.length === 1 ? "file" : "files"} in this directory and its subdirectories</p>`
      + (subdirectories.length ? `<div class="detail-section"><div class="detail-label">Directories</div><div class="detail-content">${subdirectories.map(path => `<div class="dep-item"><a href="#" class="directory-link" data-directory="${escapeHtml(path)}">${escapeHtml(path)}</a></div>`).join("")}</div></div>` : "")
      + (directFiles.length ? `<div class="detail-section"><div class="detail-label">Files</div><div class="detail-content">${directFiles.map(node => `<div class="dep-item"><a href="#" class="node-link" data-node-id="${escapeHtml(node.id)}">${escapeHtml(node.name)}</a></div>`).join("")}</div></div>` : "")
      + `</div>`;
    attachReaderLinks();
    body.scrollTop = 0;
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
      // The bundled doc already carries its configured name and suffix.
      a.download = currentNode.docPath.split("/").pop() || currentNode.name;
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
  function showBundledDoc(docPath: string, content: string, fragment?: string): void {
    if (currentTarget?.kind === "bundled-doc" && currentTarget.path === docPath
      && currentTarget.fragment === fragment && currentBundledDoc?.content === content) return;
    reveal();
    downloadButton.hidden = false;
    currentNode = null; // Clear current node since this is not a graph node
    currentBundledDoc = { path: docPath, content }; // Track for download button
    currentTarget = { kind: "bundled-doc", path: docPath, ...(fragment ? { fragment } : {}) };
    
    // Extract filename from path for title
    const fileName = docPath.split("/").pop() ?? docPath;
    title.textContent = fileName;
    
    // Create link handler for bundled doc content
    const linkHandler = createReaderLinkHandler(docPath, linkContext);
    
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
    attachReaderLinks();
    scrollToFragment(fragment);
  }

  function setNote(text: string | null): void {
    note.textContent = text ?? "";
    note.hidden = text === null;
  }

  return { showNode, showDirectory, showBundledDoc, setActions, setNote, setLoading, hide, downloadCurrentDoc, getCurrentNode };
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
  links: ReaderLinkContext,
  inspectedSymbol?: string
): string {
  const parts: string[] = [];

  parts.push(renderNodeMetadata(node, file.generatedAt));

  if (inspectedSymbol === INTERNAL_SYMBOL) {
    parts.push(sectionHtml("Internal implementation", "File-level connections that are not attributed to a public symbol."));
  } else if (inspectedSymbol) {
    const block = file.symbols.find(entry => symbolName(entry) === inspectedSymbol);
    const summary = block?.sections.find(section => section.title === "Summary")?.body.join(" ");
    parts.push(sectionHtml("Inspected symbol", `<strong>${escapeHtml(inspectedSymbol)}</strong>`
      + (block?.kind ? ` · ${escapeHtml(block.kind)}` : "")
      + (summary ? `<p>${escapeHtml(summary)}</p>` : "")));
  }

  const authoredHtml = renderMarkdown(file.authored, { linkHandler: createReaderLinkHandler(node.docPath, links) });
  parts.push(`<div class="doc-authored markdown-body">${authoredHtml}</div>`);

  if (node.publicSymbols.length > 0 || node.dependencies.length > 0 || node.dependents.length > 0) {
    const generatedHtml = renderGeneratedContent(node, links, inspectedSymbol);
    parts.push(`<div class="doc-generated">${generatedHtml}</div>`);
  }

  return parts.join("");
}

/**
 * Render generated content (Public Symbols, Dependencies) with structured badge/list style.
 */
function renderGeneratedContent(
  node: ExplorerNodePayload,
  links: ReaderLinkContext,
  inspectedSymbol?: string
): string {
  const parts: string[] = [];
  
  // Public Symbols - render as badge pills
  if (node.publicSymbols.length > 0) {
    const symbolBadges = node.publicSymbols
      .map(symbol => `<a href="#" class="node-link symbol-badge${symbol === inspectedSymbol ? " inspected-symbol" : ""}" data-node-id="${escapeHtml(node.id)}" data-symbol="${escapeHtml(symbol)}"${symbol === inspectedSymbol ? ' aria-current="true"' : ""}>${escapeHtml(symbol)}</a>`)
      .join("");
    parts.push(sectionHtml("Public Symbols", `<div class="symbol-badges">${symbolBadges}</div>`));
  }
  
  // Dependencies - render as clickable list items
  const resolvedDeps = node.dependencies.filter(d => d.resolved);
  if (resolvedDeps.length > 0) {
    const depItems = resolvedDeps
      .map(d => renderDependencyItem(d, links))
      .sort()
      .join("");
    parts.push(sectionHtml("Dependencies", `<div class="dep-list">${depItems}</div>`));
  }
  
  // Dependents - render as clickable list items
  if (node.dependents.length > 0) {
    const depItems = node.dependents
      .map(depId => renderDependentItem(depId, links.nodesById))
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
  links: ReaderLinkContext
): string {
  const target = dep.targetId ? links.nodesById.get(dep.targetId) : undefined;
  const displayPath = target?.codeRelativePath ?? dep.targetId ?? dep.label ?? dep.raw ?? "unknown";
  const symbolLine = dep.targetSymbol 
    ? `<div class="dep-symbol">${escapeHtml(dep.targetSymbol)}</div>` 
    : "";
  
  if (target) {
    return `<div class="dep-item">${readerLink(fileInspection(target, dep.targetSymbol, links), escapeHtml(displayPath))}${symbolLine}</div>`;
  }
  return `<div class="dep-item"><span class="dep-path">${escapeHtml(displayPath)}</span>${symbolLine}</div>`;
}

/**
 * Render a single dependent as a clickable list item.
 */
function renderDependentItem(
  depId: string,
  nodesById: ReadonlyMap<string, ExplorerNodePayload>
): string {
  const target = nodesById.get(depId);
  const displayPath = target?.codeRelativePath ?? depId;
  
  if (target) {
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
  onNodeClick?: (nodeId: string, symbol?: string) => void
): void {
  if (!onNodeClick) return;

  // Find all node-link elements and attach click handlers
  const nodeLinks = container.querySelectorAll<HTMLAnchorElement>("a.node-link[data-node-id]");
  nodeLinks.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const nodeId = link.dataset.nodeId;
      if (nodeId) {
        onNodeClick(nodeId, link.dataset.symbol);
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
        <span class="metadata-value">${escapeHtml(formatted)}</span>
      </div>
    `;
  }
  
  return `
    <div class="metadata-row archetype-row">
      <span class="archetype-badge ${escapeHtml(archetypeClass)}">
        <span class="archetype-icon">${archetypeIcon}</span>
        <span class="archetype-label">${escapeHtml(node.archetype)}</span>
      </span>
    </div>
    <div class="metadata-row path-row">
      <span class="path-label">CODE:</span>
      <code class="path-value">${escapeHtml(node.codeRelativePath)}</code>
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
      .map(d => escapeHtml(nodesById.get(d)?.codeRelativePath ?? d))
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
  return escapeHtml(`${basePath}${symbolSuffix}`);
}

/**
 * Attach click handlers for bundled doc links in the detail panel.
 */
function attachBundledDocLinkHandlers(
  container: HTMLElement,
  onBundledDocClick?: (docPath: string, fragment?: string) => void
): void {
  if (!onBundledDocClick) return;

  // Find all bundled-doc-link elements and attach click handlers
  const docLinks = container.querySelectorAll<HTMLAnchorElement>("a.bundled-doc-link[data-doc-path]");
  docLinks.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const docPath = link.dataset.docPath;
      if (docPath) {
        onBundledDocClick(docPath, link.dataset.fragment);
      }
    });
  });
}

interface ReaderLinkContext {
  nodesById: ReadonlyMap<string, ExplorerNodePayload>;
  files: Readonly<Record<string, GraphFile>>;
  bundledMarkdown?: Readonly<Record<string, string>>;
}

/** Resolve against the document's real path; neither the docs root nor its extension is special. */
function resolveDocLink(relativePath: string, fromDocPath: string): string | null {
  if (!relativePath) return fromDocPath;
  const parts = relativePath.startsWith("/") ? [] : fromDocPath.split("/").slice(0, -1);
  for (const part of relativePath.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      if (!parts.length) return null;
      parts.pop();
    } else parts.push(part);
  }
  return parts.join("/");
}

function decodeLinkPart(value: string): string {
  try { return decodeURIComponent(value); } catch { return value; }
}

/** Follow a documented re-export to its origin where the bundle carries that evidence. */
function fileInspection(
  node: ExplorerNodePayload,
  fragment: string | undefined,
  context: ReaderLinkContext,
  visited = new Set<string>()
): Extract<InspectionTarget, { kind: "file" }> {
  const whole: Extract<InspectionTarget, { kind: "file" }> = { kind: "file", nodeId: node.id };
  if (!fragment) return whole;
  const key = `${node.id}#${fragment}`;
  if (visited.has(key)) return whole;
  visited.add(key);
  const file = context.files[node.id];
  const reExport = file?.reExports?.find(entry => entry.slug === fragment || entry.name === fragment);
  if (reExport?.from) {
    const origin = resolveReaderTarget(reExport.from.link, node.docPath, context, visited);
    if (origin?.kind === "file") return origin;
  }
  const block = file?.symbols.find(entry => entry.slug === fragment || symbolName(entry) === fragment);
  const symbol = block ? symbolName(block) : node.publicSymbols.includes(fragment) ? fragment : undefined;
  return symbol ? { ...whole, symbol } : whole;
}

function resolveReaderTarget(
  href: string,
  fromDocPath: string,
  context: ReaderLinkContext,
  visited?: Set<string>
): InspectionTarget | null {
  href = href.trim();
  if (href.startsWith("<") && href.endsWith(">")) href = href.slice(1, -1);
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/iu.test(href)) return null;
  const hash = href.indexOf("#");
  const pathPart = hash < 0 ? href : href.slice(0, hash);
  const fragment = hash < 0 ? undefined : decodeLinkPart(href.slice(hash + 1)) || undefined;
  const path = resolveDocLink(decodeLinkPart(pathPart), fromDocPath);
  if (path === null) return null;
  for (const node of context.nodesById.values()) {
    if (node.docPath === path || node.codePath === path || node.id === path) {
      return fileInspection(node, fragment, context, visited);
    }
  }
  if (context.bundledMarkdown && Object.hasOwn(context.bundledMarkdown, path)) {
    return { kind: "bundled-doc", path, ...(fragment ? { fragment } : {}) };
  }
  const directory = path.replace(/\/+$/u, "");
  const prefix = directory ? `${directory}/` : "";
  if ([...context.nodesById.keys()].some(id => id.startsWith(prefix))) return { kind: "directory", directory };
  return null;
}

function readerLink(target: InspectionTarget, text: string): string {
  if (target.kind === "file") {
    return `<a href="#" class="node-link" data-node-id="${escapeHtml(target.nodeId)}"${target.symbol ? ` data-symbol="${escapeHtml(target.symbol)}"` : ""}>${text}</a>`;
  }
  if (target.kind === "directory") {
    return `<a href="#" class="directory-link" data-directory="${escapeHtml(target.directory)}">${text}</a>`;
  }
  return `<a href="#" class="bundled-doc-link" data-doc-path="${escapeHtml(target.path)}"${target.fragment ? ` data-fragment="${escapeHtml(target.fragment)}"` : ""}>${text}</a>`;
}

/** Authored Live Doc prose and bundled Markdown use exactly the same navigation rules. */
function createReaderLinkHandler(fromDocPath: string, context: ReaderLinkContext): (href: string, text: string) => string {
  return (href, text) => {
    href = href.trim();
    if (href.startsWith("<") && href.endsWith(">")) href = href.slice(1, -1);
    const target = resolveReaderTarget(href, fromDocPath, context);
    if (target) {
      // A local authored heading does not name another evidence item or a generated symbol.
      if (href.startsWith("#") && target.kind === "file" && !target.symbol) {
        return `<a href="#" class="reader-anchor" data-fragment="${escapeHtml(decodeLinkPart(href.slice(1)))}">${text}</a>`;
      }
      return readerLink(target, text);
    }
    if (/^(?:https?:|mailto:|\/\/)/iu.test(href)) {
      return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    }
    // A source-relative path unavailable in this static bundle has no truthful reader destination.
    return `<span class="unavailable-link" title="Not included in this bundle">${text}</span>`;
  };
}
