/**
 * The Knowledge Sources panel: what this bundle is, the files most used and
 * most using, the entry points and what a walk from them reaches, the symbols
 * nothing references, the related documentation and the export. Everything it
 * says about the graph comes as the facts that `sources-facts.ts` computed
 * from the bundle's graph; the tree of related markdown comes from the bundle.
 * Each file named is a button that puts the file in the detail panel, where
 * its doc and its doors are; each directory counted is a link to the Local
 * Map's directory door.
 *
 * The "Reachable from" field (the owner's thought, 2026-10-15) lets a person
 * walk from any file or directory in place of the entry points; the choice is
 * exploration state and rides the share link, and the line that would declare
 * the file in the configuration is offered to copy, since a static page cannot
 * write the file.
 *
 * Rewritten on 2026-10-08 from the dead code sweep's findings, and on
 * 2026-10-15 around the entry points the docs now declare, in place of the
 * one-hop list of what nothing references.
 */

import type { BundledMarkdownTreeNode } from "../../shared/staticExplorerData";
import { requireElement } from "../dom";
import { escapeHtml } from "../graph-helpers";
import type { SearchHit, SearchIndex } from "../search/graph-search";
import { createSearchField } from "../search/search-field";
import type { LocalMapPerspective, PathDestination } from "../types";
import { symbolCount, type FileByArchetype, type SourcesFacts, type StartFile, type SymbolsOfFile } from "./sources-facts";

/** Which documents the export takes: the Live Docs, the related markdown, or both. */
export type DownloadBundleType = "live" | "related" | "all";

/** One flattened markdown file, or a ZIP that keeps the folders. */
export type DownloadFormat = "markdown" | "zip";

/** What the panel needs from the client. */
export interface SourcesViewConfig {
  facts: SourcesFacts;
  perspective: LocalMapPerspective;
  /** The search over the bundle's files, symbols and directories, for the "Reachable from" field. */
  search: SearchIndex;
  /** The file or directory the facts were walked from in place of the entry points; null for the entry points. */
  reachFrom: PathDestination | null;
  /** The person chose a start for the walk, or went back to the entry points. */
  onReachFrom: (destination: PathDestination | null) => void;
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

function renderShape(facts: SourcesFacts, perspective: LocalMapPerspective): string {
  const { shape } = facts;
  const archetypes = shape.byArchetype.map(entry => `${entry.name} ${entry.count.toLocaleString()}`).join(", ");
  const generated = shape.generatedFrom && shape.generatedTo
    ? (dateOf(shape.generatedFrom) === dateOf(shape.generatedTo) ? dateOf(shape.generatedTo) : `${dateOf(shape.generatedFrom)} to ${dateOf(shape.generatedTo)}`)
    : "unknown";
  const directories = shape.byDirectory.map(entry => entry.name
    ? `<li><a class="sources-directory" href="?view=local&amp;mode=${perspective}&amp;dir=${encodeURIComponent(entry.name)}">${escapeHtml(entry.name)}</a><span class="sources-count">${entry.count.toLocaleString()}</span></li>`
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

/** The groups of the entry points, by reason; a file with several reasons stands in each. */
const REASON_GROUPS: ReadonlyArray<{ key: string; title: string; holds: (start: StartFile) => boolean }> = [
  { key: "program", title: "Programs", holds: start => start.entries.some(entry => entry.reason === "program") },
  { key: "command", title: "Commands", holds: start => start.entries.some(entry => entry.reason === "command") },
  { key: "module", title: "Modules", holds: start => start.entries.some(entry => entry.reason === "module") },
  { key: "opening", title: "Openings served", holds: start => start.entries.some(entry => entry.reason === "opening") },
  { key: "tooling", title: "Tooling inputs", holds: start => start.entries.some(entry => entry.reason === "tooling") },
  { key: "declared", title: "Declared", holds: start => start.entries.some(entry => entry.reason === "declared") },
  { key: "test", title: "Tests", holds: start => start.test }
];

/** A start as a row: its name, where it is, and why it is an entry. */
function startRow(start: StartFile): string {
  return `<li>${fileButton(start.path)}<span class="sources-reasons">${escapeHtml(start.reasons.join("; "))}</span></li>`;
}

/** One reason's group: the scanned system's files, then each sample root's files folded under its name. */
function renderReasonGroup(group: (typeof REASON_GROUPS)[number], starts: readonly StartFile[]): string {
  const own = starts.filter(start => start.sample === undefined);
  const samples = new Map<string, StartFile[]>();
  for (const start of starts) {
    if (start.sample === undefined) continue;
    const list = samples.get(start.sample) ?? [];
    list.push(start);
    samples.set(start.sample, list);
  }
  const sampleGroups = [...samples.entries()].map(([root, files]) => `
      <details class="sources-group sources-group--sample" data-sample="${escapeHtml(root)}">
        <summary><span class="sources-group-name">${escapeHtml(root)}</span><span class="sources-count">${files.length.toLocaleString()} sample ${files.length === 1 ? "entry" : "entries"}</span></summary>
        <ul class="sources-list">${files.map(startRow).join("")}</ul>
      </details>`).join("");
  return `
    <details class="sources-group" data-reason="${group.key}">
      <summary><span class="sources-group-name">${group.title}</span><span class="sources-count">${starts.length.toLocaleString()}</span></summary>
      ${own.length ? `<ul class="sources-list">${own.map(startRow).join("")}</ul>` : ""}
      ${sampleGroups}
    </details>`;
}

/** The words of a start the person chose: a file's name, or a directory's. */
function reachFromWords(reachFrom: PathDestination): string {
  return reachFrom.kind === "file" ? reachFrom.nodeId : reachFrom.directory || "the scan root";
}

/** The line that would declare the chosen start in `.live-docs.config.json`. */
function declarationOf(reachFrom: PathDestination): string {
  const pattern = reachFrom.kind === "file" ? reachFrom.nodeId : reachFrom.directory ? `${reachFrom.directory}/**` : "**";
  return `"entryPoints": [${JSON.stringify(pattern)}]`;
}

function renderEntries(config: SourcesViewConfig): string {
  const { reach } = config.facts;
  const others = config.facts.shape.files - reach.starts.length;
  const status = reach.from === "entries"
    ? `${plural(reach.starts.length, "entry point")} reach ${reach.reached.length.toLocaleString()} of the other ${plural(others, "file")}.`
    : `${escapeHtml(reachFromWords(config.reachFrom!))} reaches ${reach.reached.length.toLocaleString()} of the other ${plural(others, "file")}.`;
  const groups = reach.from === "entries"
    ? REASON_GROUPS.map(group => ({ group, starts: reach.starts.filter(group.holds) })).filter(({ starts }) => starts.length > 0).map(({ group, starts }) => renderReasonGroup(group, starts)).join("")
    : "";
  const declaration = config.reachFrom
    ? `
      <div class="sources-declare">
        <code class="sources-declare-line">${escapeHtml(declarationOf(config.reachFrom))}</code>
        <button type="button" class="action-btn" id="sources-declare-copy">Copy as declaration</button>
        <span class="sources-declare-status" aria-live="polite"></span>
      </div>`
    : "";
  return `
    <section class="sources-panel" data-section="entries">
      <h2><span class="sources-title">Entry points</span>${reach.from === "entries" ? `<span class="sources-count">${reach.starts.length.toLocaleString()}</span>` : ""}</h2>
      <div class="sources-reach">
        <label class="sources-reach-label" for="sources-reach-from">Reachable from</label>
        <div class="search-field sources-reach-field">
          <input type="text" id="sources-reach-from" class="search-input" placeholder="every entry point" autocomplete="off" spellcheck="false">
          <button type="button" id="sources-reach-clear" class="search-clear" aria-label="Back to the entry points"${config.reachFrom ? "" : " hidden"}>&times;</button>
          <div id="sources-reach-results" class="search-results" role="listbox" hidden></div>
        </div>
      </div>
      <p class="sources-reach-status" data-row="reach">${status}</p>
      ${declaration}
      ${reach.from === "entries"
        ? (groups || '<p class="sources-empty">The docs declare no entry point; a test is one by its archetype, and there is none.</p>')
        : ""}
      ${reach.from === "entries" ? '<p class="sources-note">An entry point is a file something outside the code starts: a program, a script a manifest runs, a package\'s module, a route or table served, a file a tool reads, one the configuration declares, or a test. A file loaded by a path the docs cannot read is not among them until it is declared.</p>' : ""}
    </section>`;
}

function renderFileGroup(files: readonly FileByArchetype[], open: boolean): string {
  const byArchetype = new Map<string, FileByArchetype[]>();
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

function renderUnreachable(config: SourcesViewConfig): string {
  const { reach } = config.facts;
  const title = reach.from === "entries" ? "Unreachable from any entry" : `Unreachable from ${escapeHtml(reachFromWords(config.reachFrom!))}`;
  const testsOnly = reach.from === "entries"
    ? `
      <h3><span class="sources-title">Reached only from tests</span><span class="sources-count">${reach.testsOnly.length.toLocaleString()}</span></h3>
      <div class="sources-files" data-list="tests-only">${reach.testsOnly.length ? renderFileGroup(reach.testsOnly, true) : '<p class="sources-empty">None.</p>'}</div>`
    : "";
  return `
    <section class="sources-panel" data-section="unreachable">
      <h2><span class="sources-title">${title}</span><span class="sources-count">${reach.unreachable.length.toLocaleString()}</span></h2>
      <div class="sources-files" data-list="unreachable">${reach.unreachable.length ? renderFileGroup(reach.unreachable, false) : '<p class="sources-empty">Every file is reached.</p>'}</div>
      <p class="sources-note">No path along the references the docs record leads here from a start. A file reached by a path string the docs cannot read, a template's link or a tool's own rule looks the same until the configuration declares it.</p>
      ${testsOnly}
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

/** The start a search hit names: a file, a symbol's file, or a directory. */
function startOfHit(hit: SearchHit): PathDestination {
  return hit.kind === "directory" ? { kind: "directory", directory: hit.directory } : { kind: "file", nodeId: hit.node.id };
}

/** Render the panel into its container and wire its buttons and its field. */
export function renderSourcesView(config: SourcesViewConfig): void {
  const { facts, onFocusNode, onDownload, onDownloadFacts, bundledDocs, onViewBundledDoc } = config;
  const container = requireElement<HTMLDivElement>("sources-container");

  container.innerHTML = `
    <div class="sources-header"><h1>Knowledge Sources</h1></div>
    ${renderShape(facts, config.perspective)}
    ${renderUse(facts)}
    ${renderEntries(config)}
    ${renderUnreachable(config)}
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

  // The "Reachable from" field: a search over the bundle; a choice walks from it, the clear goes back to the entry points.
  const field = createSearchField({
    input: container.querySelector<HTMLInputElement>("#sources-reach-from")!,
    results: container.querySelector<HTMLElement>("#sources-reach-results")!,
    scope: () => ({ index: config.search }),
    onChoose: hit => config.onReachFrom(startOfHit(hit))
  });
  field.show(config.reachFrom ? reachFromWords(config.reachFrom) : "");
  container.querySelector<HTMLButtonElement>("#sources-reach-clear")?.addEventListener("click", () => config.onReachFrom(null));
  container.querySelector<HTMLButtonElement>("#sources-declare-copy")?.addEventListener("click", () => {
    const line = container.querySelector<HTMLElement>(".sources-declare-line")?.textContent ?? "";
    const status = container.querySelector<HTMLElement>(".sources-declare-status");
    const done = (): void => { if (status) status.textContent = "Copied"; };
    const failed = (): void => { if (status) status.textContent = "Select the line and copy it"; };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(line).then(done, failed);
    else failed();
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
