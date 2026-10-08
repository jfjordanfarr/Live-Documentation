/**
 * The Knowledge Sources panel: what this bundle is, the files most used and
 * most using, what nothing references, the related documentation and the
 * export. Everything it says about the graph comes as the facts that
 * `sources-facts.ts` computed from the bundle's graph; the tree of related
 * markdown comes from the bundle. Each file named is a
 * button that puts the file in the detail panel, where its doc and its doors
 * are; each directory counted is a link to the Local Map's directory door.
 *
 * Rewritten on 2026-10-08 from the dead code sweep's findings: the fixed
 * thresholds that called a file a "potential barrel" or "heavily
 * depended-upon" went, with the cut list of "disconnected nodes", the tagline,
 * the "How to Improve" text that named this repository's npm scripts, and the
 * export's prose.
 */

import type { BundledMarkdownTreeNode } from "../../shared/staticExplorerData";
import { requireElement } from "../dom";
import { escapeHtml } from "../graph-helpers";
import { symbolCount, type SourcesFacts, type SymbolsOfFile, type UnreferencedFile } from "./sources-facts";

/** Which documents the export takes: the Live Docs, the related markdown, or both. */
export type DownloadBundleType = "live" | "related" | "all";

/** One flattened markdown file, or a ZIP that keeps the folders. */
export type DownloadFormat = "markdown" | "zip";

/** What the panel needs from the client. */
export interface SourcesViewConfig {
  facts: SourcesFacts;
  /** Put a file in the detail panel without leaving the panel. */
  onFocusNode: (nodeId: string) => void;
  onDownload: (bundleType: DownloadBundleType, format: DownloadFormat) => void;
  /** Take the panel's facts out as JSON. */
  onDownloadFacts: (facts: SourcesFacts) => void;
  bundledDocs?: { tree: BundledMarkdownTreeNode; count: number };
  onViewBundledDoc?: (docPath: string) => void;
}

const dateOf = (iso: string): string => iso.slice(0, 10);
const plural = (count: number, noun: string): string => `${count.toLocaleString()} ${noun}${count === 1 ? "" : "s"}`;
const nameOf = (path: string): string => path.slice(path.lastIndexOf("/") + 1);
const directoryOf = (path: string): string => (path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "");

/** A file's name as a button that focuses it, with its directory beside it. */
function fileButton(path: string): string {
  const directory = directoryOf(path);
  return `<button type="button" class="sources-file" data-node-id="${escapeHtml(path)}">${escapeHtml(nameOf(path))}</button>` +
    (directory ? `<span class="sources-path">${escapeHtml(directory)}</span>` : "");
}

function renderShape(facts: SourcesFacts): string {
  const { shape } = facts;
  const archetypes = shape.byArchetype.map(entry => `${entry.name} ${entry.count.toLocaleString()}`).join(", ");
  const generated = shape.generatedFrom && shape.generatedTo
    ? (dateOf(shape.generatedFrom) === dateOf(shape.generatedTo) ? dateOf(shape.generatedTo) : `${dateOf(shape.generatedFrom)} to ${dateOf(shape.generatedTo)}`)
    : "unknown";
  const directories = shape.byDirectory.map(entry => entry.name
    ? `<li><a class="sources-directory" href="?view=local&amp;dir=${encodeURIComponent(entry.name)}">${escapeHtml(entry.name)}</a><span class="sources-count">${entry.count.toLocaleString()}</span></li>`
    : `<li><span class="sources-directory">at the root</span><span class="sources-count">${entry.count.toLocaleString()}</span></li>`).join("");
  const extensions = shape.byExtension.map(entry => `${escapeHtml(entry.name || "no extension")} ${entry.count.toLocaleString()}`).join(", ");
  return `
    <section class="sources-panel" data-section="bundle">
      <h2><span class="sources-title">This bundle</span></h2>
      <div class="sources-row" data-row="docs"><span class="sources-row-label">Docs</span><span class="sources-row-value">${escapeHtml(`${shape.root}/${shape.baseLayer}`)}</span></div>
      <div class="sources-row" data-row="files"><span class="sources-row-label">Files</span><span class="sources-row-value">${shape.files.toLocaleString()}: ${escapeHtml(archetypes)}</span></div>
      <div class="sources-row" data-row="references"><span class="sources-row-label">References between files</span><span class="sources-row-value">${shape.references.toLocaleString()}</span></div>
      <div class="sources-row" data-row="generated"><span class="sources-row-label">Generated</span><span class="sources-row-value">${escapeHtml(generated)}</span></div>
      <h3><span class="sources-title">By directory</span></h3>
      <ul class="sources-counts">${directories}</ul>
      <h3><span class="sources-title">By extension</span></h3>
      <p class="sources-inline">${extensions}</p>
    </section>`;
}

function renderUse(facts: SourcesFacts): string {
  const used = facts.mostUsed.map(entry =>
    `<li>${fileButton(entry.path)}<span class="sources-count">used by ${plural(entry.users, "file")}, ${entry.symbolsUsed} of ${plural(entry.symbols, "symbol")}</span></li>`).join("");
  const using = facts.mostUsing.map(entry =>
    `<li>${fileButton(entry.path)}<span class="sources-count">uses ${plural(entry.uses, "file")}</span></li>`).join("");
  return `
    <section class="sources-panel" data-section="use">
      <h2><span class="sources-title">Most used</span></h2>
      <ol class="sources-list">${used || '<li class="sources-empty">No file references another.</li>'}</ol>
      <h2><span class="sources-title">Uses the most</span></h2>
      <ol class="sources-list">${using || '<li class="sources-empty">No file references another.</li>'}</ol>
    </section>`;
}

function renderFileGroup(files: readonly UnreferencedFile[], open: boolean): string {
  const byArchetype = new Map<string, UnreferencedFile[]>();
  for (const file of files) {
    const group = byArchetype.get(file.archetype) ?? [];
    group.push(file);
    byArchetype.set(file.archetype, group);
  }
  return [...byArchetype.entries()].map(([archetype, group]) => `
    <details class="sources-group" data-archetype="${escapeHtml(archetype)}"${open ? " open" : ""}>
      <summary><span class="sources-group-name">${escapeHtml(archetype)}</span><span class="sources-count">${group.length.toLocaleString()}</span></summary>
      <ul class="sources-list">${group.map(file => `<li>${fileButton(file.path)}</li>`).join("")}</ul>
    </details>`).join("");
}

function renderUnreferenced(facts: SourcesFacts): string {
  const { unreferenced, testsOnly } = facts;
  return `
    <section class="sources-panel" data-section="unreferenced">
      <h2><span class="sources-title">Nothing references these</span><span class="sources-count">${unreferenced.length.toLocaleString()}</span></h2>
      <div class="sources-files" data-list="unreferenced">${unreferenced.length ? renderFileGroup(unreferenced, false) : '<p class="sources-empty">Every file is referenced by another.</p>'}</div>
      <p class="sources-note">An entry point a script or a test runner names, a file a template links, and a file nothing needs look alike here: the docs carry the references the code makes, and no more.</p>
      <h3><span class="sources-title">Only tests reference these</span><span class="sources-count">${testsOnly.length.toLocaleString()}</span></h3>
      <div class="sources-files" data-list="tests-only">${testsOnly.length ? renderFileGroup(testsOnly, true) : '<p class="sources-empty">None.</p>'}</div>
    </section>`;
}

function renderSymbolFile(entry: SymbolsOfFile): string {
  return `
    <details class="sources-group" data-file="${escapeHtml(entry.path)}">
      <summary>${fileButton(entry.path)}<span class="sources-count">${entry.symbols.length.toLocaleString()}</span></summary>
      <ul class="sources-symbols">${entry.symbols.map(symbol => `<li><code>${escapeHtml(symbol.name)}</code><span class="sources-kind">${escapeHtml(symbol.kind)}</span></li>`).join("")}</ul>
    </details>`;
}

/** The files of a class under their first directory, so that a bundle of hundreds of files is a few groups at rest. */
function renderSymbolClass(classes: readonly SymbolsOfFile[]): string {
  if (classes.length === 0) return '<p class="sources-empty">None.</p>';
  const byDirectory = new Map<string, SymbolsOfFile[]>();
  for (const entry of classes) {
    const directory = entry.path.includes("/") ? entry.path.slice(0, entry.path.indexOf("/")) : "";
    const group = byDirectory.get(directory) ?? [];
    group.push(entry);
    byDirectory.set(directory, group);
  }
  return [...byDirectory.entries()].map(([directory, group]) => `
    <details class="sources-group sources-group--directory" data-directory="${escapeHtml(directory)}">
      <summary><span class="sources-directory-name">${escapeHtml(directory || "at the root")}</span><span class="sources-count">${symbolCount(group).toLocaleString()} on ${plural(group.length, "file")}</span></summary>
      ${group.map(renderSymbolFile).join("")}
    </details>`).join("");
}

function renderSymbols(facts: SourcesFacts): string {
  const unreferenced = symbolCount(facts.symbolsUnreferenced);
  const testsOnly = symbolCount(facts.symbolsTestsOnly);
  return `
    <section class="sources-panel" data-section="symbols">
      <h2><span class="sources-title">Symbols nothing references</span><span class="sources-count">${unreferenced.toLocaleString()} on ${plural(facts.symbolsUnreferenced.length, "file")}</span></h2>
      ${renderSymbolClass(facts.symbolsUnreferenced)}
      <p class="sources-note">A symbol its own file uses is among these: the docs carry no uses within a file.</p>
      <h3><span class="sources-title">Symbols only tests reference</span><span class="sources-count">${testsOnly.toLocaleString()} on ${plural(facts.symbolsTestsOnly.length, "file")}</span></h3>
      ${renderSymbolClass(facts.symbolsTestsOnly)}
    </section>`;
}

function renderBundledTreeNode(node: BundledMarkdownTreeNode, depth = 0): string {
  const indent = depth * 16;
  if (node.type === "folder") {
    const children = (node.children ?? []).map(child => renderBundledTreeNode(child, depth + 1)).join("");
    return `
      <div class="bundled-tree-folder" style="padding-left: ${indent}px;">
        <div class="bundled-tree-folder-header" data-expanded="false">
          <span class="bundled-tree-toggle">▶</span>
          <span class="bundled-tree-name">${escapeHtml(node.name)}</span>
        </div>
        <div class="bundled-tree-children" style="display: none;">${children}</div>
      </div>`;
  }
  return `
    <div class="bundled-tree-file" style="padding-left: ${indent}px;" data-doc-path="${escapeHtml(node.path)}">
      <span class="bundled-tree-name">${escapeHtml(node.name)}</span>
    </div>`;
}

function renderRelated(bundledDocs: SourcesViewConfig["bundledDocs"]): string {
  if (!bundledDocs || bundledDocs.count === 0) {
    return `
    <section class="sources-panel" data-section="related">
      <h2><span class="sources-title">Related documentation</span><span class="sources-count">0</span></h2>
      <p class="sources-empty">No Live Doc links to a markdown file.</p>
    </section>`;
  }
  const children = (bundledDocs.tree.children ?? []).map(child => renderBundledTreeNode(child, 0)).join("");
  return `
    <section class="sources-panel" data-section="related">
      <h2><span class="sources-title">Related documentation</span><span class="sources-count">${bundledDocs.count.toLocaleString()}</span></h2>
      <p class="sources-panel-desc">Markdown files that Live Docs link to. Click one to read it.</p>
      <div class="bundled-tree-container">${children}</div>
    </section>`;
}

function renderExport(facts: SourcesFacts, bundledDocs: SourcesViewConfig["bundledDocs"]): string {
  const related = bundledDocs?.count ?? 0;
  return `
    <section class="sources-panel" data-section="export">
      <h2><span class="sources-title">Export</span></h2>
      <div class="export-options">
        <div class="export-row">
          <label class="export-label" for="export-bundle-type">Documents</label>
          <select id="export-bundle-type" class="export-select">
            <option value="live">Live Docs (${facts.shape.files.toLocaleString()})</option>
            <option value="related" ${related > 0 ? "" : "disabled"}>Related documentation (${related.toLocaleString()})</option>
            <option value="all">Both (${(facts.shape.files + related).toLocaleString()})</option>
          </select>
        </div>
        <div class="export-row">
          <span class="export-label">Format</span>
          <div class="export-format-options">
            <label class="export-format-option"><input type="radio" name="export-format" value="markdown" checked><span>One markdown file</span></label>
            <label class="export-format-option"><input type="radio" name="export-format" value="zip"><span>ZIP, folders kept</span></label>
          </div>
        </div>
        <div class="export-actions">
          <button id="download-btn" type="button" class="action-btn primary">Download</button>
          <button id="download-facts-btn" type="button" class="action-btn">This panel as JSON</button>
        </div>
      </div>
    </section>`;
}

/** Render the panel into its container and wire its buttons. */
export function renderSourcesView(config: SourcesViewConfig): void {
  const { facts, onFocusNode, onDownload, onDownloadFacts, bundledDocs, onViewBundledDoc } = config;
  const container = requireElement<HTMLDivElement>("sources-container");

  container.innerHTML = `
    <div class="sources-header"><h1>Knowledge Sources</h1></div>
    ${renderShape(facts)}
    ${renderUse(facts)}
    ${renderUnreferenced(facts)}
    ${renderSymbols(facts)}
    ${renderRelated(bundledDocs)}
    ${renderExport(facts, bundledDocs)}
  `;

  container.querySelectorAll<HTMLButtonElement>(".sources-file").forEach(button => {
    button.addEventListener("click", event => {
      // A name inside a <summary> focuses the file without toggling the group.
      event.preventDefault();
      event.stopPropagation();
      const nodeId = button.dataset.nodeId;
      if (nodeId) onFocusNode(nodeId);
    });
  });

  container.querySelector<HTMLButtonElement>("#download-btn")?.addEventListener("click", () => {
    const bundleType = container.querySelector<HTMLSelectElement>("#export-bundle-type")?.value as DownloadBundleType | undefined;
    const format = container.querySelector<HTMLInputElement>('input[name="export-format"]:checked')?.value as DownloadFormat | undefined;
    onDownload(bundleType ?? "live", format ?? "markdown");
  });
  container.querySelector<HTMLButtonElement>("#download-facts-btn")?.addEventListener("click", () => onDownloadFacts(facts));

  container.querySelectorAll<HTMLElement>(".bundled-tree-folder-header").forEach(header => {
    header.addEventListener("click", () => {
      const folder = header.parentElement;
      if (!folder) return;
      const expanded = header.dataset.expanded === "true";
      const toggle = header.querySelector<HTMLSpanElement>(".bundled-tree-toggle");
      const children = folder.querySelector<HTMLDivElement>(".bundled-tree-children");
      if (toggle) toggle.textContent = expanded ? "▶" : "▼";
      if (children) children.style.display = expanded ? "none" : "block";
      header.dataset.expanded = expanded ? "false" : "true";
    });
  });

  if (onViewBundledDoc) {
    container.querySelectorAll<HTMLElement>(".bundled-tree-file").forEach(fileEl => {
      fileEl.addEventListener("click", () => {
        const docPath = fileEl.dataset.docPath;
        if (docPath) onViewBundledDoc(docPath);
      });
    });
  }
}
