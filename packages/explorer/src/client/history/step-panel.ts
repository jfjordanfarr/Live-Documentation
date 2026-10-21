/**
 * The step panel beside the 3D picture: what the step changed, as the step
 * summary says it (the plan's C4). The commit's subject, hash, date and, when
 * the toggle is on, its author; then the files born, dead, renamed and
 * resized, the directories renamed whole, the wires that came, went and
 * changed their count, the documents linked and unlinked, and the files whose
 * content changed alone, each group folded with its count and open when it is
 * short. A document is a button that reads today's version of it where the
 * bundle carries it, and says so where it does not. A file is a button that
 * pins it where it still exists today, and says "gone since" where it does
 * not, with its archetype and its symbol count at the step. At the base the
 * panel says the shape is the beginning of what is known, and why, when the
 * history is cut there. While the thumb drags, only the header is drawn.
 *
 * @module step-panel
 */

import type { CommitInfo } from "@live-documentation/engine/live-docs/history/format";

import { changeCount, type StepSummary, type SummaryDocLink, type SummaryEdge, type SummaryFile } from "./step-summary";
import { escapeHtml } from "../graph-helpers";

/** The header, and the whole when the thumb rests. */
export interface StepPanelView {
  step: number;
  commit: CommitInfo;
  base: boolean;
  files: number;
  edges: number;
  showAuthors: boolean;
  /** Why the history begins here, when it is cut; null when it begins where the repository did. */
  truncated: string | null;
  /** The whole step; absent while the thumb drags, when the header alone is drawn. */
  summary?: StepSummary;
}

/** What the panel is made with. */
export interface StepPanelOptions {
  parent: HTMLElement;
  /** Pin the file, by its path today. */
  onPinFile(path: string): void;
  /** Whether today's bundle carries the document. */
  hasDocument(path: string): boolean;
  /** Read today's version of a document the bundle carries. */
  onReadDocument(path: string): void;
}

/** The panel as the control drives it. */
export interface StepPanel {
  element: HTMLElement;
  sync(view: StepPanelView): void;
  hide(hidden: boolean): void;
}

/** Groups this long or shorter open; longer ones fold behind their count. */
const OPEN_UP_TO = 8;

// A count is read from the history file and written into HTML, so it is made a number first.
const plural = (count: number, noun: string): string => `${Number(count).toLocaleString()} ${noun}${count === 1 ? "" : "s"}`;
const short = (commit: CommitInfo): string => commit.id.slice(0, 8);
const directoryOf = (path: string): string => (path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "");

/** A file's name as a button that pins it today, or as words with where it went. */
function fileWords(file: SummaryFile): string {
  const name = file.today.kind === "today"
    ? `<button type="button" class="history-file" data-pin="${escapeHtml(file.today.path)}">${escapeHtml(file.name)}</button>`
    : `<span class="history-file-name">${escapeHtml(file.name)}</span>`;
  const directory = directoryOf(file.path);
  const where = directory ? `<span class="history-path">${escapeHtml(directory)}</span>` : "";
  const shape = `<span class="history-shape">${escapeHtml(file.archetype || "file")}, ${plural(file.symbols, "symbol")}</span>`;
  const gone = file.today.kind === "gone"
    ? `<span class="history-gone">${file.today.since ? `gone since ${escapeHtml(short(file.today.since))}` : "not in today's docs"}</span>`
    : "";
  return `${name}${where}${shape}${gone}`;
}

function edgeWords(edge: SummaryEdge, after = ""): string {
  return `<span class="history-path">${escapeHtml(edge.from)}</span><span class="history-arrow">to</span><span class="history-path">${escapeHtml(edge.to)}</span>${after}`;
}

function docLinkWords(link: SummaryDocLink, hasDocument: (path: string) => boolean): string {
  const name = link.doc.slice(link.doc.lastIndexOf("/") + 1);
  const doc = hasDocument(link.doc)
    ? `<button type="button" class="history-file" data-read="${escapeHtml(link.doc)}" title="${escapeHtml(link.doc)}">${escapeHtml(name)}</button>`
    : `<span class="history-file-name" title="${escapeHtml(link.doc)}">${escapeHtml(name)}</span><span class="history-gone">not in this bundle</span>`;
  return `${fileWords(link.file)}<span class="history-arrow">to</span>${doc}`;
}

function group(title: string, rows: string[]): string {
  if (rows.length === 0) return "";
  return `<details${rows.length <= OPEN_UP_TO ? " open" : ""}><summary><span>${escapeHtml(title)}</span><span class="history-count">${rows.length.toLocaleString()}</span></summary><ul>${rows.map(row => `<li>${row}</li>`).join("")}</ul></details>`;
}

function body(summary: StepSummary, hasDocument: (path: string) => boolean): string {
  if (summary.base) return "";
  if (changeCount(summary) === 0) return `<p class="history-step-note">This commit changed nothing the docs could see.</p>`;
  return [
    group("Born", summary.born.map(fileWords)),
    group("Dead", summary.dead.map(fileWords)),
    group("Renamed", summary.renamed.map(rename => `<span class="history-path">${escapeHtml(rename.from)}</span><span class="history-arrow">to</span>${fileWords(rename.file)}`)),
    group("Renamed whole", summary.directoriesRenamed.map(rename => `<span class="history-path">${escapeHtml(rename.from)}</span><span class="history-arrow">to</span><span class="history-path">${escapeHtml(rename.to)}</span>`)),
    group("Resized", summary.resized.map(resized => `${fileWords({ ...resized.file, symbols: resized.after })}<span class="history-shape">${Number(resized.before)} to ${Number(resized.after)}</span>`)),
    group("Wires added", summary.edgesAdded.map(edge => edgeWords(edge, `<span class="history-shape">${plural(edge.count, "reference")}</span>`))),
    group("Wires removed", summary.edgesRemoved.map(edge => edgeWords(edge))),
    group("Wires changed", summary.edgesChanged.map(edge => edgeWords(edge, `<span class="history-shape">${Number(edge.before)} to ${Number(edge.count)}</span>`))),
    group("Documents linked", summary.docLinksAdded.map(link => docLinkWords(link, hasDocument))),
    group("Documents unlinked", summary.docLinksRemoved.map(link => docLinkWords(link, hasDocument))),
    group("Content changed, shape kept", summary.touched.map(fileWords))
  ].join("");
}

/** Make the panel under its parent, hidden until synced. */
export function createStepPanel(options: StepPanelOptions): StepPanel {
  const element = document.createElement("section");
  element.className = "history-step-panel";
  element.setAttribute("aria-label", "What the step changed");
  element.hidden = true;
  options.parent.append(element);
  element.addEventListener("click", event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-pin], button[data-read]");
    if (button?.dataset.pin) options.onPinFile(button.dataset.pin);
    else if (button?.dataset.read) options.onReadDocument(button.dataset.read);
  });
  let drawn = "";
  return {
    element,
    sync(view) {
      const key = JSON.stringify([view.commit.id, view.showAuthors, view.truncated, view.summary ? changeCount(view.summary) : null, view.files, view.edges]);
      if (key === drawn) return;
      drawn = key;
      const author = view.showAuthors && view.commit.author ? `<span class="history-author">${escapeHtml(view.commit.author)}</span>` : "";
      const beginning = view.base
        ? `<p class="history-step-note">The beginning of what is known: ${plural(view.files, "file")} and ${plural(view.edges, "wire")}.${view.truncated ? ` ${escapeHtml(view.truncated)}` : ""}</p>`
        : "";
      element.innerHTML = `
        <h2>${escapeHtml(view.commit.subject)}</h2>
        <p class="history-step-meta"><code title="${escapeHtml(view.commit.id)}">${escapeHtml(short(view.commit))}</code><span>${escapeHtml(view.commit.date.slice(0, 10))}</span>${author}<span>step ${view.step}</span></p>
        ${beginning}
        ${view.summary ? body(view.summary, path => options.hasDocument(path)) : ""}`;
    },
    hide(hidden) {
      element.hidden = hidden;
    }
  };
}
