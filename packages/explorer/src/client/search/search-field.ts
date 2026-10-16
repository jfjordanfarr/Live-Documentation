/**
 * One search field with its results under it: the words typed find directories, files and symbols, grouped by
 * directory; the arrow keys walk the rows, Enter or a click chooses one, Escape puts back what the field showed.
 * The bar makes two of these, the subject and the destination, each over a scope of its own.
 */

import { escapeHtml } from "../graph-helpers";
import { searchGraph, searchRows, type SearchGroup, type SearchHit, type SearchRow, type SearchScope } from "./graph-search";

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

/** A row of the field: a search row, or the fold that opens the files kept apart. */
type FieldRow = SearchRow | { kind: "apart"; count: number };

/** The words a row carries when the scope gives none: a file's kind, a directory's. */
function plainBadge(hit: SearchHit): string {
  return hit.kind === "file" ? hit.node.archetype : hit.kind === "directory" ? "directory" : "";
}

/** Make a search field over an input and a results element: typing searches the scope, the arrows walk the rows, Enter or a click chooses, Escape settles. */
export function createSearchField(options: SearchFieldOptions): SearchField {
  const { input, results, onChoose } = options;
  let shown = "";
  let query = "";
  let rows: FieldRow[] = [];
  let selected = -1;
  let expanded = new Set<string>();
  let apartOpen = false;

  /** A row; `words` marks a badge that is a sentence of the scope's, drawn as words rather than as a kind's capitals. */
  const row = (kind: string, name: string, badge: string, context: string, apart = false, words = false): string =>
    `<div class="search-row search-row--${kind}${apart ? " is-apart" : ""}" role="option" aria-selected="false">`
    + `<span class="search-row-name">${escapeHtml(name)}</span>`
    + (context ? `<span class="search-row-context">${escapeHtml(context)}</span>` : "")
    + (badge ? `<span class="search-row-badge${words ? " search-row-badge--words" : ""}">${escapeHtml(badge)}</span>` : "")
    + "</div>";

  /** Mark the selected row and keep it in view. */
  const mark = (): void => {
    for (const element of results.querySelectorAll<HTMLElement>(".search-row")) {
      const on = Number(element.dataset.index) === selected;
      element.classList.toggle("selected", on);
      element.setAttribute("aria-selected", String(on));
      if (on) element.scrollIntoView({ block: "nearest" });
    }
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
    const offered = searchGraph(query, scope.index, { expanded });
    const apart = scope.apart ? searchGraph(query, scope.apart.index, { expanded }) : null;
    const html: string[] = [];
    const list: FieldRow[] = [];
    const words = !!scope.badge;
    const section = (groups: readonly SearchGroup[], badgeOf: (hit: SearchHit) => string, isApart: boolean): void => {
      for (const group of groups) {
        const heading = group.directory || "Scan root";
        if (group.matched) html.push(row("directory", heading, badgeOf({ kind: "directory", directory: group.directory }), "", isApart, words));
        else html.push(`<div class="search-group${isApart ? " is-apart" : ""}">${escapeHtml(heading)}</div>`);
        for (const file of group.files) {
          html.push(row("file", file.node.name, badgeOf({ kind: "file", node: file.node }), file.node.codeRelativePath, isApart, words));
          for (const symbol of file.symbols) html.push(row("symbol", symbol, "", "", isApart));
          if (file.moreSymbols > 0) html.push(row("more", `${file.moreSymbols} more ${file.moreSymbols === 1 ? "symbol" : "symbols"}`, "", "", isApart));
        }
      }
      list.push(...searchRows(groups));
    };
    section(offered.groups, hit => scope.badge?.(hit) ?? plainBadge(hit), false);
    if (scope.apart && apart && apart.files > 0) {
      html.push(row("apart", scope.apart.fold(apart.files, offered.files > 0), "", ""));
      list.push({ kind: "apart", count: apart.files });
      if (apartOpen) section(apart.groups, () => scope.apart!.badge, true);
    }
    rows = list;
    selected = rows.length ? Math.min(Math.max(selected, 0), rows.length - 1) : -1;
    results.innerHTML = html.length ? html.join("") : '<div class="search-empty">Nothing found</div>';
    let at = 0;
    for (const element of results.querySelectorAll<HTMLElement>(".search-row")) element.dataset.index = String(at++);
    results.hidden = false;
    mark();
  };

  const hide = (): void => {
    results.hidden = true;
    results.innerHTML = "";
    rows = [];
    selected = -1;
  };

  const settle = (): void => {
    hide();
    query = "";
    expanded = new Set();
    apartOpen = false;
    input.value = shown;
  };

  const choose = (at: number): void => {
    const chosen = rows[at];
    if (!chosen) return;
    if (chosen.kind === "more") {
      expanded.add(chosen.node.id);
      render();
      return;
    }
    if (chosen.kind === "apart") {
      apartOpen = !apartOpen;
      render();
      return;
    }
    settle();
    input.blur();
    onChoose(chosen);
  };

  input.addEventListener("focus", () => input.select());
  input.addEventListener("input", () => {
    query = input.value;
    selected = 0;
    render();
  });
  input.addEventListener("keydown", event => {
    if (event.key === "Escape") {
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
