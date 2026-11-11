/**
 * The step panel beside the 3D picture, and the dialog that shows the whole
 * step (the plan's C4; compact since 2026-11-11). The panel is small by
 * default: the commit's subject in at most two lines, cut with an ellipsis and
 * whole in its title; the hash, the date, by the toggle the author, and the
 * step; then one line counting what the step changed (`countWords`), or at the
 * base that the shape is the beginning of what is known, and why, when the
 * history is cut there, or that the commit changed nothing the docs could see.
 * While the thumb drags, only the subject and that line of meta are drawn.
 *
 * Its "Show the whole step" button, always in the same place in its header,
 * opens a modal dialog with the whole subject, the meta, the base's note and
 * every group the step changed: the files created, deleted, renamed and
 * resized, the directories renamed whole, the wires that came, went and changed
 * their count, the documents linked and unlinked, and the files whose content
 * changed alone, each group folded with its count and open when it is short. A
 * document is a button that reads today's version of it where the bundle
 * carries it, and says so where it does not. A file is a button that pins it at
 * the moment it exists, and says "gone since" where it is not in today's docs,
 * with its archetype and its symbol count at the step. Choosing either closes
 * the dialog so that the result is seen. Escape, the close button and a click
 * on the backdrop close it, and the focus returns to the button that opened it.
 *
 * The panel's own button hides it, and the scrubber's toggle brings it back, so
 * that the picture can be seen whole while the scrubber stays (2026-10-30).
 *
 * @module step-panel
 */

import type { CommitInfo } from "@live-documentation/engine/live-docs/history/format";

import { changeCount, countWords, stepCounts, type StepSummary, type SummaryDocLink, type SummaryEdge, type SummaryFile } from "./step-summary";
import { escapeHtml } from "../graph-helpers";
import { CLOSE_ICON, iconButton, MORE_ICON } from "../panels/icon-button";

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
  /** Show and retain the file at the moment containing it, including immediately before deletion. */
  onChooseFile(path: string, step: number): void;
  /** Whether today's bundle carries the document. */
  hasDocument(path: string): boolean;
  /** Read today's version of a document the bundle carries. */
  onReadDocument(path: string): void;
  /** The panel's own button was pressed: hide the panel, the scrubber staying. */
  onHide(): void;
  /** The whole step was opened in its dialog: reading a step means stopping on it. */
  onOpenStep(): void;
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

/** Every historical file is actionable at its own moment; today's absence never disables that evidence. */
function fileWords(file: SummaryFile): string {
  const name = `<button type="button" class="history-file" data-file="${escapeHtml(file.path)}" data-at="${file.at}" title="Show ${escapeHtml(file.path)} at step ${file.at}">${escapeHtml(file.name)}</button>`;
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

const NOTHING_SEEN = `<p class="history-step-note">This commit changed nothing the docs could see.</p>`;

/** Every group the step changed, for the dialog. */
function groups(summary: StepSummary, hasDocument: (path: string) => boolean): string {
  if (summary.base) return "";
  if (changeCount(summary) === 0) return NOTHING_SEEN;
  return [
    group("Created", summary.born.map(fileWords)),
    group("Deleted", summary.dead.map(fileWords)),
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

/** The compact panel's one line of what the step changed: the counts, or the sentence for a commit the docs saw nothing of. */
function counts(summary: StepSummary): string {
  if (summary.base) return "";
  const words = countWords(stepCounts(summary));
  return words ? `<p class="history-step-counts">${escapeHtml(words)}</p>` : NOTHING_SEEN;
}

/** The hash, the date, the author when shown and the step, in the panel and the dialog alike. */
function meta(view: StepPanelView): string {
  const author = view.showAuthors && view.commit.author ? `<span class="history-author">${escapeHtml(view.commit.author)}</span>` : "";
  return `<p class="history-step-meta"><code title="${escapeHtml(view.commit.id)}">${escapeHtml(short(view.commit))}</code><span>${escapeHtml(view.commit.date.slice(0, 10))}</span>${author}<span>step ${view.step}</span></p>`;
}

/** At the base, what is known begins here, and why, when the history is cut. */
function beginning(view: StepPanelView): string {
  return view.base
    ? `<p class="history-step-note">The beginning of what is known: ${plural(view.files, "file")} and ${plural(view.edges, "wire")}.${view.truncated ? ` ${escapeHtml(view.truncated)}` : ""}</p>`
    : "";
}

let dialogs = 0;

/** Make the panel and its dialog under their parent, hidden until synced. */
export function createStepPanel(options: StepPanelOptions): StepPanel {
  const element = document.createElement("section");
  element.className = "history-step-panel";
  element.setAttribute("aria-label", "What the step changed");
  element.hidden = true;
  // The header's buttons stand outside the words, which each step draws afresh, so that they never move.
  const header = document.createElement("div");
  header.className = "history-step-header";
  const subject = document.createElement("h2");
  const more = iconButton("Show the whole step", MORE_ICON);
  more.className = "history-step-more";
  more.setAttribute("aria-haspopup", "dialog");
  const hide = iconButton("Hide step details", CLOSE_ICON);
  hide.className = "history-step-hide";
  hide.addEventListener("click", () => options.onHide());
  const actions = document.createElement("div");
  actions.className = "history-step-actions";
  actions.append(more, hide);
  header.append(subject, actions);
  const content = document.createElement("div");
  content.className = "history-step-content";
  element.append(header, content);

  // The whole step, modal, so that reading it is the one thing done; the page's policy allows no inline handler.
  const dialog = document.createElement("dialog");
  dialog.className = "history-step-dialog";
  // Focusable, so that a click on its words or a redraw under the focus leaves the focus in it rather than on the page.
  dialog.tabIndex = -1;
  const titleId = `history-step-dialog-title-${++dialogs}`;
  dialog.setAttribute("aria-labelledby", titleId);
  const dialogHeader = document.createElement("div");
  dialogHeader.className = "history-step-dialog-header";
  const dialogTitle = document.createElement("h2");
  dialogTitle.id = titleId;
  const close = iconButton("Close", CLOSE_ICON);
  close.className = "history-step-dialog-close";
  dialogHeader.append(dialogTitle, close);
  const dialogBody = document.createElement("div");
  dialogBody.className = "history-step-dialog-body";
  dialog.append(dialogHeader, dialogBody);
  options.parent.append(element, dialog);

  let view: StepPanelView | null = null;
  let drawn = "";
  let dialogDrawn = "";
  /**
   * Whether the dialog's close event puts the focus on the button that opened it. The browser already gives it back as
   * the dialog closes; the event comes later, and after a choice, whose action may have moved the focus on, it must not.
   */
  let returnFocus = true;
  /** Whether the pointer went down on the backdrop, outside the dialog's box. */
  let pressedOutside = false;

  function drawDialog(): void {
    if (!view) return;
    const key = JSON.stringify([view.commit.id, view.showAuthors, view.truncated, view.files, view.edges, view.summary ? changeCount(view.summary) : null]);
    if (key === dialogDrawn) return;
    dialogDrawn = key;
    // A redraw while it is open (Back or Forward to another commit) removes the row that held the focus: the dialog keeps it.
    const focused = dialog.open && dialogBody.contains(document.activeElement);
    dialogTitle.textContent = view.commit.subject;
    dialogBody.innerHTML = `${meta(view)}${beginning(view)}${view.summary ? groups(view.summary, path => options.hasDocument(path)) : ""}`;
    dialogBody.scrollTop = 0;
    if (focused) dialog.focus();
  }

  function closeDialog(giveFocusBack: boolean): void {
    if (!dialog.open) return;
    returnFocus = giveFocusBack;
    dialog.close();
  }

  more.addEventListener("click", () => {
    options.onOpenStep();
    dialogDrawn = "";
    drawDialog();
    returnFocus = true;
    pressedOutside = false;
    dialog.showModal();
  });
  close.addEventListener("click", () => closeDialog(true));
  dialog.addEventListener("close", () => {
    if (returnFocus && !element.hidden) more.focus();
    returnFocus = true;
  });
  // The page behind is inert while the dialog is open, and no key is the page's: Escape closes the dialog alone, never
  // the reader behind it, whose own Escape listens on the document and would cancel the dialog's. Heard first, on the
  // document's capture, so that it holds wherever the focus is; the browser's own closing is a default, not a listener.
  document.addEventListener("keydown", event => { if (dialog.open) event.stopPropagation(); }, true);
  // A click on the backdrop closes the dialog: one pressed and released outside its box, so that a selection dragged
  // out of it does not.
  const outside = (event: MouseEvent): boolean => {
    if (event.target !== dialog) return false;
    const box = dialog.getBoundingClientRect();
    return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
  };
  dialog.addEventListener("pointerdown", event => { pressedOutside = outside(event); });
  dialog.addEventListener("click", event => {
    if (pressedOutside && outside(event)) { closeDialog(true); return; }
    // A file or a document chosen: the dialog closes so that the result is seen, then the choice acts.
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-file], button[data-read]");
    if (!button) return;
    closeDialog(false);
    if (button.dataset.file) options.onChooseFile(button.dataset.file, Number(button.dataset.at));
    else if (button.dataset.read) options.onReadDocument(button.dataset.read);
  });

  return {
    element,
    sync(next) {
      view = next;
      if (dialog.open) drawDialog();
      const key = JSON.stringify([next.commit.id, next.showAuthors, next.truncated, next.summary ? changeCount(next.summary) : null, next.files, next.edges]);
      if (key === drawn) return;
      drawn = key;
      subject.textContent = next.commit.subject;
      subject.title = next.commit.subject;
      content.innerHTML = `${meta(next)}${beginning(next)}${next.summary ? counts(next.summary) : ""}`;
    },
    hide(hidden) {
      element.hidden = hidden;
      if (hidden) closeDialog(false);
    }
  };
}
