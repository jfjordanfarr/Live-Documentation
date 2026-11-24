/**
 * One search field with its results under it: the words typed find directories, files and symbols, grouped by
 * directory; the arrow keys walk the rows, Enter or a click chooses one, Escape puts back what the field showed.
 * The bar makes two of these, the subject and the destination, each over a scope of its own.
 */

import { announce, withdraw } from "../announce";
import { escapeHtml } from "../graph-helpers";
import { DIRECTORY_ICON, FILE_ICON } from "../panels/icon-button";
import { DIRECTORY_LIMIT, FILE_LIMIT, namedMatches, searchGraph, searchRows, type SearchHit, type SearchResult, type SearchRow, type SearchScope } from "./graph-search";

/** What a search field is made from: its input and its results element, the scope it searches, and what is done with the thing chosen. */
export interface SearchFieldOptions {
  input: HTMLInputElement;
  results: HTMLElement;
  /** The scope to search, read at every keystroke, so that a bar can change it as the exploration goes. */
  scope: () => SearchScope;
  /** The thing chosen; the field then shows what the next `show` gives it. */
  onChoose: (hit: SearchHit) => void;
}

/** A search field as the bar drives it: show words while nobody types, take focus, and settle back to the shown words. */
export interface SearchField {
  /** The words the field shows while nobody types in it; an empty string shows the placeholder. */
  show(text: string): void;
  focus(): void;
  /** Hide the results and put back the shown words. */
  settle(): void;
}

/** What the results say, and the page's status region with them, when the words find nothing. */
const NOTHING_FOUND = "Nothing found";

/** A row of the field: a search row, marked when it stands among the files kept apart, or the fold that opens them. */
type FieldRow = (SearchRow & { apart?: boolean }) | { kind: "apart"; count: number };

/** A search row that counts what the limits left out, and lists it when pressed. */
type CountFold = Extract<SearchRow, { kind: "more" | "more-files" | "elsewhere" | "more-directories" }>;

/** What a section of the list has been asked to show beyond the limits since the words last changed. */
interface Revealed {
  directories: Set<string>;
  elsewhere: number;
  directoryLimit: number;
}

const unrevealed = (): Revealed => ({ directories: new Set(), elsewhere: 0, directoryLimit: DIRECTORY_LIMIT });

/** The words a row carries when the scope gives none: a file's kind, a directory's. */
function plainBadge(hit: SearchHit): string {
  return hit.kind === "file" ? hit.node.archetype : hit.kind === "directory" ? "directory" : "";
}

/** The arrow of a fold, the one the map's cut signs point down with: more lies below, and a press brings it. */
const FOLD_ARROW = '<svg class="search-fold-arrow" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6l5 5 5-5"/></svg>';

/** A kind's glyph beside a fold's count, so that a count at the list's end says what it counts. */
const foldGlyph = (drawing: string): string =>
  `<svg class="search-fold-glyph" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${drawing}</svg>`;

const plural = (count: number, one: string, many: string): string => `${count} ${count === 1 ? one : many}`;

/**
 * The words of a fold for a screen reader and a resting pointer: what it counts, and what a press shows. On the
 * screen it is an arrow and the count, and the kind's glyph where its place does not say the kind.
 */
export function foldName(fold: CountFold): string {
  const them = (count: number, step: number): string => count <= step ? (count === 1 ? "show it" : "show them") : `show the next ${step}`;
  switch (fold.kind) {
    case "more": return `${plural(fold.count, "more symbol", "more symbols")} of ${fold.node.name}: ${them(fold.count, fold.count)}`;
    case "more-files": return `${plural(fold.count, "more file", "more files")} in ${fold.directory || "the scan root"}: ${them(fold.count, fold.count)}`;
    case "elsewhere": return `${plural(fold.count, "more file", "more files")} in other directories: ${them(fold.count, FILE_LIMIT)}`;
    case "more-directories": return `${plural(fold.count, "more directory", "more directories")}: ${them(fold.count, DIRECTORY_LIMIT)}`;
  }
}

/** What a row names, so that the rows a press brings can be told from those that stood before it. */
function rowKey(row: FieldRow): string {
  const apart = "apart" in row && row.apart ? "apart:" : "";
  switch (row.kind) {
    case "directory": return `${apart}directory:${row.directory}`;
    case "file": return `${apart}file:${row.node.id}`;
    case "symbol": return `${apart}symbol:${row.node.id}:${row.symbol}`;
    default: return "";
  }
}

/** Make a search field over an input and a results element: typing searches the scope, the arrows walk the rows, Enter or a click chooses, Escape settles. */
export function createSearchField(options: SearchFieldOptions): SearchField {
  const { input, results, onChoose } = options;
  let shown = "";
  let query = "";
  let rows: FieldRow[] = [];
  let selected = -1;
  let expanded = new Set<string>();
  let revealed = { offered: unrevealed(), apart: unrevealed() };
  let apartOpen = false;
  // Whether the results now say that nothing was found, so that the page's status region says it once.
  let emptyShown = false;

  // A combobox over a listbox, as the ARIA pattern has it: the input owns the list, says whether it is open, and
  // names the keyboard's row while focus stays in the input.
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-controls", results.id);
  input.setAttribute("aria-expanded", "false");
  results.setAttribute("role", "listbox");

  const syncResultsFade = (): void => {
    const start = !results.hidden && results.scrollTop > 2;
    const end = !results.hidden && results.scrollTop + results.clientHeight < results.scrollHeight - 2;
    results.dataset.scrollStart = String(start);
    results.dataset.scrollEnd = String(end);
  };
  results.addEventListener("scroll", syncResultsFade, { passive: true });
  if (typeof ResizeObserver === "function") new ResizeObserver(syncResultsFade).observe(results);

  /** A row; `words` marks a badge that is a sentence of the scope's, drawn as words rather than as a kind's capitals. */
  const row = (kind: string, name: string, badge: string, context: string, apart = false, words = false): string =>
    `<div class="search-row search-row--${kind}${apart ? " is-apart" : ""}" role="option" aria-selected="false">`
    + `<span class="search-row-name">${escapeHtml(name)}</span>`
    + (context ? `<span class="search-row-context">${escapeHtml(context)}</span>` : "")
    + (badge ? `<span class="search-row-badge${words ? " search-row-badge--words" : ""}">${escapeHtml(badge)}</span>` : "")
    + "</div>";

  /** A fold: an arrow, the count and, where its place does not say the kind, the kind's glyph; its words on hover and to a screen reader. */
  const foldRow = (fold: CountFold, apart: boolean): string => {
    const name = escapeHtml(foldName(fold));
    const glyph = fold.kind === "elsewhere" ? foldGlyph(FILE_ICON) : fold.kind === "more-directories" ? foldGlyph(DIRECTORY_ICON) : "";
    return `<div class="search-row search-row--fold search-row--${fold.kind}${apart ? " is-apart" : ""}" role="option" aria-selected="false" aria-label="${name}" title="${name}">`
      + `<span class="search-fold">${FOLD_ARROW}<span class="search-fold-count">${fold.count}</span>${glyph}</span></div>`;
  };

  /** Mark the selected row, name it as the input's active descendant, and keep it in view. */
  const mark = (): void => {
    let active: string | null = null;
    for (const element of results.querySelectorAll<HTMLElement>(".search-row")) {
      const on = Number(element.dataset.index) === selected;
      element.classList.toggle("selected", on);
      element.setAttribute("aria-selected", String(on));
      if (on) {
        active = element.id;
        element.scrollIntoView({ block: "nearest" });
      }
    }
    if (active) input.setAttribute("aria-activedescendant", active);
    else input.removeAttribute("aria-activedescendant");
  };

  /**
   * Draw the rows of the query: the offered groups, then, when the scope keeps files apart and the words match any,
   * the fold, and under it those groups once opened. The HTML is written in the order `searchRows` walks, so that a
   * row's number is its place in `rows`.
   */
  const render = (): void => {
    if (!query.trim()) {
      hide();
      return;
    }
    const scope = options.scope();
    const find = (over: SearchScope["index"], asked: Revealed): SearchResult => searchGraph(query, over, {
      expanded, expandedDirectories: asked.directories, elsewhere: asked.elsewhere, directoryLimit: asked.directoryLimit
    });
    const offered = find(scope.index, revealed.offered);
    const apart = scope.apart ? find(scope.apart.index, revealed.apart) : null;
    const html: string[] = [];
    const list: FieldRow[] = [];
    const words = !!scope.badge;
    const section = (result: SearchResult, badgeOf: (hit: SearchHit) => string, isApart: boolean): void => {
      for (const group of result.groups) {
        const heading = group.directory || "Scan root";
        if (group.matched) html.push(row("directory", heading, badgeOf({ kind: "directory", directory: group.directory }), "", isApart, words));
        else html.push(`<div class="search-group${isApart ? " is-apart" : ""}" role="presentation">${escapeHtml(heading)}</div>`);
        for (const file of group.files) {
          html.push(row("file", file.node.name, badgeOf({ kind: "file", node: file.node }), file.node.codeRelativePath, isApart, words));
          for (const symbol of file.symbols) html.push(row("symbol", symbol, "", "", isApart));
          if (file.moreSymbols > 0) html.push(foldRow({ kind: "more", node: file.node, count: file.moreSymbols }, isApart));
        }
        if (group.moreFiles > 0) html.push(foldRow({ kind: "more-files", directory: group.directory, count: group.moreFiles }, isApart));
      }
      if (result.elsewhere > 0) html.push(foldRow({ kind: "elsewhere", count: result.elsewhere }, isApart));
      if (result.moreDirectories > 0) html.push(foldRow({ kind: "more-directories", count: result.moreDirectories }, isApart));
      list.push(...searchRows(result).map(each => isApart ? { ...each, apart: true } : each));
    };
    // Directories the scope offers by a name of their own stand first: the name, and the directory it chooses beside it.
    for (const named of namedMatches(query, scope.named ?? [])) {
      html.push(row("directory", named.name, "", named.directory));
      list.push({ kind: "directory", directory: named.directory });
    }
    section(offered, hit => scope.badge?.(hit) ?? plainBadge(hit), false);
    if (scope.apart && apart && apart.files > 0) {
      html.push(row("apart", scope.apart.fold(apart.files, offered.files > 0), "", ""));
      list.push({ kind: "apart", count: apart.files });
      if (apartOpen) section(apart, () => scope.apart!.badge, true);
    }
    rows = list;
    selected = rows.length ? Math.min(Math.max(selected, 0), rows.length - 1) : -1;
    results.innerHTML = html.length ? html.join("") : `<div class="search-empty">${NOTHING_FOUND}</div>`;
    // A list that empties is said once, politely; a keystroke that keeps it empty says nothing again.
    if (!html.length && !emptyShown) announce(NOTHING_FOUND);
    else if (html.length && emptyShown) withdraw(NOTHING_FOUND);
    emptyShown = !html.length;
    let at = 0;
    for (const element of results.querySelectorAll<HTMLElement>(".search-row")) {
      element.dataset.index = String(at);
      element.id = `${results.id}-${at++}`;
    }
    results.hidden = false;
    input.setAttribute("aria-expanded", "true");
    mark();
    syncResultsFade();
  };

  const hide = (): void => {
    if (emptyShown) withdraw(NOTHING_FOUND);
    emptyShown = false;
    results.hidden = true;
    results.dataset.scrollStart = "false";
    results.dataset.scrollEnd = "false";
    results.innerHTML = "";
    rows = [];
    selected = -1;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
  };

  const settle = (): void => {
    hide();
    query = "";
    expanded = new Set();
    revealed = { offered: unrevealed(), apart: unrevealed() };
    apartOpen = false;
    input.value = shown;
  };

  /** Show what a fold counts, and move the keyboard's row to the first row it brought, wherever its group stands. */
  const unfold = (fold: CountFold & { apart?: boolean }): void => {
    const asked = fold.apart ? revealed.apart : revealed.offered;
    if (fold.kind === "more") expanded.add(fold.node.id);
    else if (fold.kind === "more-files") asked.directories.add(fold.directory);
    else if (fold.kind === "elsewhere") asked.elsewhere += FILE_LIMIT;
    else asked.directoryLimit += DIRECTORY_LIMIT;
    const before = new Set(rows.map(rowKey));
    render();
    const brought = rows.findIndex(each => rowKey(each) !== "" && !before.has(rowKey(each)));
    if (brought >= 0) {
      selected = brought;
      mark();
    }
  };

  const choose = (at: number): void => {
    const chosen = rows[at];
    if (!chosen) return;
    if (chosen.kind === "apart") {
      apartOpen = !apartOpen;
      render();
      return;
    }
    if (chosen.kind !== "directory" && chosen.kind !== "file" && chosen.kind !== "symbol") {
      unfold(chosen);
      return;
    }
    settle();
    input.blur();
    onChoose(chosen);
  };

  input.addEventListener("focus", () => input.select());
  const search = (): void => {
    query = input.value;
    selected = 0;
    // What a fold showed belongs to the words it was pressed under; a file's symbols, named by the file, stay shown
    revealed = { offered: unrevealed(), apart: unrevealed() };
    render();
  };
  input.addEventListener("input", search);
  // The field stands in the page before the Explorer's data has loaded and this listener exists, so words typed in that
  // moment have fired their input events into nothing (seen on a slow machine by the search-bar spec, 2026-11-07). A
  // field that holds the person's words and their focus searches them now; a field left alone keeps its text as it is.
  if (document.activeElement === input && input.value) search();
  input.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      // The field has used this Escape; the reader or map behind it must not act on it too.
      event.preventDefault();
      settle();
      input.blur();
    } else if (event.key === "ArrowDown" && rows.length) {
      event.preventDefault();
      selected = (selected + 1) % rows.length;
      mark();
    } else if (event.key === "ArrowUp" && rows.length) {
      event.preventDefault();
      selected = selected <= 0 ? rows.length - 1 : selected - 1;
      mark();
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(selected);
    }
  });
  // Leaving the field without a choice puts back what it showed; a click on a row is a choice, not a leave.
  input.addEventListener("blur", () => {
    setTimeout(() => {
      if (document.activeElement !== input) settle();
    }, 150);
  });
  results.addEventListener("mousedown", event => event.preventDefault());
  results.addEventListener("click", event => {
    const target = (event.target as HTMLElement).closest<HTMLElement>(".search-row");
    if (target) choose(Number(target.dataset.index));
  });

  return {
    show(text: string): void {
      shown = text;
      if (document.activeElement !== input) input.value = text;
    },
    focus(): void {
      input.focus();
      input.select();
    },
    settle
  };
}
