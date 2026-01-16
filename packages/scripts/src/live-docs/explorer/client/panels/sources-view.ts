/**
 * Sources View Panel
 * 
 * Renders the "Knowledge Sources" view that shows graph statistics,
 * data provenance, and health warnings (high fan-out/fan-in nodes).
 */

import type { BundledMarkdownTreeNode } from "../../shared/staticExplorerData";
import type {
  ExplorerGraphPayload,
  ExplorerLinkPayload,
  ExplorerNodePayload
} from "../../shared/types";
import { requireElement } from "../dom";
import type { ViewerConfig } from "../persistence";

/** Static docs map type (nodeId → markdown content) */
export type StaticDocsMap = Map<string, string> | undefined;

/** Callback for navigating to a node from health warnings */
export type NavigateToNodeCallback = (nodeId: string) => void;

/** Download bundle type */
export type DownloadBundleType = "live" | "related" | "all";

/** Download format */
export type DownloadFormat = "markdown" | "zip";

/** Callback for downloading documentation */
export type DownloadCallback = (bundleType: DownloadBundleType, format: DownloadFormat) => void;

/** Callback for viewing a bundled doc in the detail panel */
export type ViewBundledDocCallback = (docPath: string) => void;

/** Bundled docs tree data */
export interface BundledDocsData {
  tree: BundledMarkdownTreeNode;
  count: number;
}

/** Sources view configuration */
export interface SourcesViewConfig {
  graphData: ExplorerGraphPayload;
  viewerConfig: ViewerConfig | null;
  staticDocs: StaticDocsMap;
  resolveLinkEndpoint: (endpoint: ExplorerLinkPayload["source"]) => string;
  nodesById: Map<string, ExplorerNodePayload>;
  /** Navigate to node in Local Map view (for health warnings) */
  onNavigateToNode: NavigateToNodeCallback;
  /** Focus node in detail panel without navigating away (for islands) */
  onFocusNode?: NavigateToNodeCallback;
  onDownload?: DownloadCallback;
  bundledDocs?: BundledDocsData;
  onViewBundledDoc?: ViewBundledDocCallback;
}

/** Thresholds for health warnings */
const HIGH_FANOUT_THRESHOLD = 50;
const HIGH_FANIN_THRESHOLD = 30;

/** Maximum islands to display before truncating */
const MAX_ISLAND_DISPLAY = 20;

/**
 * Escape HTML special characters
 */
const escapeHtml = (str: string): string => {
  return str.replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c] || c));
};

/**
 * Render health warnings for high fan-out and fan-in nodes.
 */
function renderHealthWarnings(
  highFanout: ExplorerNodePayload[],
  highFanin: ExplorerNodePayload[],
  outboundCounts: Map<string, number>,
  inboundCounts: Map<string, number>
): string {
  const warnings: string[] = [];

  highFanout.forEach(node => {
    const count = outboundCounts.get(node.id) ?? 0;
    warnings.push(`
      <li>
        <span class="warning-icon">📤</span>
        <span class="warning-text">
          <span class="warning-node" data-node-id="${escapeHtml(node.id)}">${escapeHtml(node.name)}</span>
          has <strong>${count}</strong> outbound dependencies (potential barrel file)
        </span>
      </li>
    `);
  });

  highFanin.forEach(node => {
    const count = inboundCounts.get(node.id) ?? 0;
    warnings.push(`
      <li>
        <span class="warning-icon">📥</span>
        <span class="warning-text">
          <span class="warning-node" data-node-id="${escapeHtml(node.id)}">${escapeHtml(node.name)}</span>
          has <strong>${count}</strong> inbound dependencies (heavily depended-upon)
        </span>
      </li>
    `);
  });

  if (warnings.length === 0) {
    return '<div class="sources-empty">No high fan-out or fan-in nodes detected.</div>';
  }

  return `<ul class="sources-warnings">${warnings.join("")}</ul>`;
}

/**
 * Render warnings for disconnected "island" nodes (no dependencies and no dependents).
 */
function renderIslandWarnings(
  islands: ExplorerNodePayload[]
): string {
  if (islands.length === 0) {
    return '<div class="sources-empty sources-positive">No disconnected nodes detected. All nodes are connected!</div>';
  }

  // Group islands by directory prefix for readability
  const byDirectory = new Map<string, ExplorerNodePayload[]>();
  for (const node of islands) {
    const parts = node.id.split("/");
    const dir = parts.length > 1 ? parts.slice(0, -1).join("/") : "(root)";
    if (!byDirectory.has(dir)) {
      byDirectory.set(dir, []);
    }
    byDirectory.get(dir)!.push(node);
  }

  // Sort directories alphabetically
  const sortedDirs = [...byDirectory.keys()].sort();

  // Build display list with truncation
  const items: string[] = [];
  let displayedCount = 0;

  for (const dir of sortedDirs) {
    if (displayedCount >= MAX_ISLAND_DISPLAY) break;
    
    const nodes = byDirectory.get(dir)!.sort((a, b) => a.name.localeCompare(b.name));
    for (const node of nodes) {
      if (displayedCount >= MAX_ISLAND_DISPLAY) break;
      
      items.push(`
        <li>
          <span class="warning-icon">⊘</span>
          <span class="warning-text">
            <span class="warning-node island-node" data-node-id="${escapeHtml(node.id)}">${escapeHtml(node.name)}</span>
            <span class="island-path">${escapeHtml(dir)}</span>
          </span>
        </li>
      `);
      displayedCount++;
    }
  }

  const remaining = islands.length - displayedCount;
  const suffix = remaining > 0 
    ? `<li class="island-truncated">...and ${remaining} more disconnected node(s)</li>` 
    : "";

  return `
    <ul class="sources-warnings sources-islands">${items.join("")}${suffix}</ul>
    <p class="sources-note">Disconnected nodes may indicate missing adapter detection, stale files, or legitimately standalone utilities.</p>
  `;
}

/**
 * Render a bundled docs tree node recursively.
 */
function renderBundledTreeNode(node: BundledMarkdownTreeNode, depth: number = 0): string {
  const indent = depth * 16;
  
  if (node.type === "folder") {
    const hasChildren = node.children && node.children.length > 0;
    const childrenHtml = hasChildren
      ? node.children!.map(child => renderBundledTreeNode(child, depth + 1)).join("")
      : "";
    
    return `
      <div class="bundled-tree-folder" style="padding-left: ${indent}px;">
        <div class="bundled-tree-folder-header" data-expanded="false">
          <span class="bundled-tree-toggle">▶</span>
          <span class="bundled-tree-icon">📁</span>
          <span class="bundled-tree-name">${escapeHtml(node.name)}</span>
        </div>
        <div class="bundled-tree-children" style="display: none;">
          ${childrenHtml}
        </div>
      </div>
    `;
  }
  
  // File node - use simple file icon for all markdown files
  return `
    <div class="bundled-tree-file" style="padding-left: ${indent}px;" data-doc-path="${escapeHtml(node.path)}">
      <span class="bundled-tree-icon">📄</span>
      <span class="bundled-tree-name">${escapeHtml(node.name)}</span>
    </div>
  `;
}

/**
 * Render the bundled docs tree panel.
 */
function renderBundledDocsPanel(bundledDocs: BundledDocsData | undefined): string {
  if (!bundledDocs || bundledDocs.count === 0) {
    return `
      <div class="sources-panel">
        <h2><span class="panel-icon">📚</span> Related Documentation</h2>
        <div class="sources-empty">No referenced markdown files found. Live Docs may not contain links to READMEs, specs, or other documentation.</div>
      </div>
    `;
  }

  const tree = bundledDocs.tree;
  const childrenHtml = tree.children
    ? tree.children.map(child => renderBundledTreeNode(child, 0)).join("")
    : "";

  return `
    <div class="sources-panel">
      <h2><span class="panel-icon">📚</span> Related Documentation</h2>
      <p class="sources-panel-desc">
        ${bundledDocs.count} markdown files referenced from Live Docs (READMEs, chat history, specs, etc.).
        Click any file to view it in the detail panel.
      </p>
      <div class="bundled-tree-container">
        ${childrenHtml}
      </div>
    </div>
  `;
}

/**
 * Render the Sources view panel showing graph statistics and health information.
 */
export function renderSourcesView(config: SourcesViewConfig): void {
  const { graphData, viewerConfig, staticDocs, resolveLinkEndpoint, nodesById: _nodesById, onNavigateToNode, onFocusNode, onDownload, bundledDocs, onViewBundledDoc } = config;

  const container = requireElement<HTMLDivElement>("sources-container");

  // Compute graph health metrics
  const nodeCount = graphData.nodes.length;
  const linkCount = graphData.links.length;

  // Count archetypes
  const archetypeCounts = new Map<string, number>();
  graphData.nodes.forEach(node => {
    const arch = (node.archetype || "unknown").toLowerCase();
    archetypeCounts.set(arch, (archetypeCounts.get(arch) ?? 0) + 1);
  });

  // High fan-out nodes (potential barrels)
  const outboundCounts = new Map<string, number>();
  const inboundCounts = new Map<string, number>();
  graphData.links.forEach(link => {
    const sourceId = resolveLinkEndpoint(link.source);
    const targetId = resolveLinkEndpoint(link.target);
    if (sourceId) outboundCounts.set(sourceId, (outboundCounts.get(sourceId) ?? 0) + 1);
    if (targetId) inboundCounts.set(targetId, (inboundCounts.get(targetId) ?? 0) + 1);
  });

  const highFanoutNodes = graphData.nodes
    .filter(node => (outboundCounts.get(node.id) ?? 0) >= HIGH_FANOUT_THRESHOLD)
    .sort((a, b) => (outboundCounts.get(b.id) ?? 0) - (outboundCounts.get(a.id) ?? 0))
    .slice(0, 5);

  const highFaninNodes = graphData.nodes
    .filter(node => (inboundCounts.get(node.id) ?? 0) >= HIGH_FANIN_THRESHOLD)
    .sort((a, b) => (inboundCounts.get(b.id) ?? 0) - (inboundCounts.get(a.id) ?? 0))
    .slice(0, 5);

  // Island nodes (no outbound and no inbound links)
  const islandNodes = graphData.nodes
    .filter(node => {
      const outCount = outboundCounts.get(node.id) ?? 0;
      const inCount = inboundCounts.get(node.id) ?? 0;
      return outCount === 0 && inCount === 0;
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  // Determine data source
  const isStaticMode = !!staticDocs || document.getElementById("explorer-data")?.textContent;
  const dataSourceLabel = isStaticMode ? "Static bundle (embedded/fetched)" : "Server /graph endpoint";

  // Build archetype breakdown string
  const archetypeList = Array.from(archetypeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([arch, count]) => `${arch}: ${count}`)
    .join(", ");

  // Render
  container.innerHTML = `
    <div class="sources-header">
      <h1>📊 Knowledge Sources</h1>
      <p>Where this graph gets its data, what it knows, and how you can improve it.</p>
    </div>

    <div class="sources-panel">
      <h2><span class="panel-icon">🔌</span> Data Provenance</h2>
      <div class="sources-row">
        <span class="sources-row-label">Data source</span>
        <span class="sources-row-value neutral">${escapeHtml(dataSourceLabel)}</span>
      </div>
      <div class="sources-row">
        <span class="sources-row-label">Viewer config</span>
        <span class="sources-row-value ${viewerConfig ? "positive" : "neutral"}">${viewerConfig ? "Present" : "Not provided"}</span>
      </div>
      <div class="sources-row">
        <span class="sources-row-label">Knowledge feeds</span>
        <span class="sources-row-value neutral">0 discovered (server-only feature)</span>
      </div>
    </div>

    <div class="sources-panel">
      <h2><span class="panel-icon">📈</span> Graph Statistics</h2>
      <div class="sources-row">
        <span class="sources-row-label">Total nodes</span>
        <span class="sources-row-value positive">${nodeCount.toLocaleString()}</span>
      </div>
      <div class="sources-row">
        <span class="sources-row-label">Total links</span>
        <span class="sources-row-value positive">${linkCount.toLocaleString()}</span>
      </div>
      <div class="sources-row">
        <span class="sources-row-label">Archetypes</span>
        <span class="sources-row-value neutral">${escapeHtml(archetypeList) || "None"}</span>
      </div>
    </div>

    <div class="sources-panel">
      <h2><span class="panel-icon">⚠️</span> Graph Health Warnings</h2>
      ${renderHealthWarnings(highFanoutNodes, highFaninNodes, outboundCounts, inboundCounts)}
    </div>

    <div class="sources-panel">
      <h2><span class="panel-icon">⊘</span> Disconnected Nodes (${islandNodes.length})</h2>
      ${renderIslandWarnings(islandNodes)}
    </div>

    ${renderBundledDocsPanel(bundledDocs)}

    <div class="sources-panel">
      <h2><span class="panel-icon">💡</span> How to Improve</h2>
      <div class="sources-guidance">
        <p>The Explorer builds its graph from <strong>Live Documentation</strong> — markdown files that mirror your source code and declare their dependencies explicitly.</p>
        <p>To enrich the graph:</p>
        <ul>
          <li>Run <code>npm run live-docs:generate</code> to create or update Live Docs for your workspace.</li>
          <li>Use <code>npm run live-docs:inspect -- &lt;path&gt;</code> to trace dependency paths from the command line.</li>
          <li>Author <code>Purpose</code> and <code>Notes</code> sections in your Live Docs to improve discoverability.</li>
        </ul>
        <p><strong>Barrel files</strong> (index.ts re-exporters) can obscure original symbol sources. If you see high fan-out warnings above, consider whether those files are masking the true dependency structure.</p>
      </div>
    </div>

    <div class="sources-panel">
      <h2><span class="panel-icon">📥</span> Export Documentation</h2>
      <div class="sources-guidance">
        <p>Download documentation as a combined markdown file or a ZIP archive with preserved directory structure.</p>
        <p>Use this to:</p>
        <ul>
          <li>Share documentation with team members who don't have workspace access</li>
          <li>Create offline backups of your documentation</li>
          <li>Publish documentation to wikis or static sites</li>
        </ul>
      </div>
      <div class="export-options">
        <div class="export-row">
          <label class="export-label">Bundle:</label>
          <select id="export-bundle-type" class="export-select" ${onDownload ? "" : "disabled"}>
            <option value="live">Live Docs (${nodeCount})</option>
            <option value="related" ${bundledDocs && bundledDocs.count > 0 ? "" : "disabled"}>Related Docs (${bundledDocs?.count ?? 0})</option>
            <option value="all">All Documentation (${nodeCount + (bundledDocs?.count ?? 0)})</option>
          </select>
        </div>
        <div class="export-row">
          <label class="export-label">Format:</label>
          <div class="export-format-options">
            <label class="export-format-option">
              <input type="radio" name="export-format" value="markdown" checked ${onDownload ? "" : "disabled"}>
              <span>Flattened Markdown</span>
            </label>
            <label class="export-format-option">
              <input type="radio" name="export-format" value="zip" ${onDownload ? "" : "disabled"}>
              <span>ZIP Archive</span>
            </label>
          </div>
        </div>
        <div class="export-actions">
          <button id="download-btn" class="action-btn primary" ${onDownload ? "" : "disabled"}>
            Download
          </button>
          ${onDownload ? "" : '<span class="sources-note">Bulk download requires server mode or static bundle with embedded docs.</span>'}
        </div>
      </div>
    </div>
  `;

  // Attach click handlers for warning nodes (navigate to Local Map)
  container.querySelectorAll<HTMLElement>(".warning-node:not(.island-node)").forEach(el => {
    el.addEventListener("click", () => {
      const nodeId = el.dataset.nodeId;
      if (nodeId) {
        onNavigateToNode(nodeId);
      }
    });
  });

  // Attach click handlers for island nodes (focus in detail panel without navigating)
  const focusCallback = onFocusNode ?? onNavigateToNode;
  container.querySelectorAll<HTMLElement>(".island-node").forEach(el => {
    el.addEventListener("click", () => {
      const nodeId = el.dataset.nodeId;
      if (nodeId) {
        focusCallback(nodeId);
      }
    });
  });

  // Attach click handler for download button
  if (onDownload) {
    const downloadBtn = container.querySelector<HTMLButtonElement>("#download-btn");
    const bundleTypeSelect = container.querySelector<HTMLSelectElement>("#export-bundle-type");
    const formatRadios = container.querySelectorAll<HTMLInputElement>('input[name="export-format"]');
    
    if (downloadBtn && bundleTypeSelect) {
      downloadBtn.addEventListener("click", () => {
        const bundleType = bundleTypeSelect.value as DownloadBundleType;
        let format: DownloadFormat = "markdown";
        formatRadios.forEach(radio => {
          if (radio.checked) {
            format = radio.value as DownloadFormat;
          }
        });
        onDownload(bundleType, format);
      });
    }
  }

  // Attach click handlers for bundled tree folders (expand/collapse)
  container.querySelectorAll<HTMLElement>(".bundled-tree-folder-header").forEach(header => {
    header.addEventListener("click", () => {
      const folder = header.parentElement;
      if (!folder) return;
      
      const isExpanded = header.dataset.expanded === "true";
      const toggle = header.querySelector<HTMLSpanElement>(".bundled-tree-toggle");
      const childrenContainer = folder.querySelector<HTMLDivElement>(".bundled-tree-children");
      
      if (toggle) {
        toggle.textContent = isExpanded ? "▶" : "▼";
      }
      if (childrenContainer) {
        childrenContainer.style.display = isExpanded ? "none" : "block";
      }
      header.dataset.expanded = isExpanded ? "false" : "true";
    });
  });

  // Attach click handlers for bundled tree files (view doc)
  if (onViewBundledDoc) {
    container.querySelectorAll<HTMLElement>(".bundled-tree-file").forEach(fileEl => {
      fileEl.addEventListener("click", () => {
        const docPath = fileEl.dataset.docPath;
        if (docPath) {
          onViewBundledDoc(docPath);
        }
      });
    });
  }
}
