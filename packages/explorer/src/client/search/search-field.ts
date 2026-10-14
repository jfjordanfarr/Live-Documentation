/**
 * One search field with its results under it: the words typed find directories, files and symbols, grouped by
 * directory; the arrow keys walk the rows, Enter or a click chooses one, Escape puts back what the field showed.
 * The bar makes two of these, the subject and the destination.
 */

import { escapeHtml } from "../graph-helpers";
import { searchGraph, searchRows, type SearchHit, type SearchIndex, type SearchRow } from "./graph-search";

export interface SearchFieldOptions {
  input: HTMLInputElement;
  results: HTMLElement;
  index: SearchIndex;
  /** The thing chosen; the field then shows what the next `show` gives it. */
  onChoose: (hit: SearchHit) => void;
}

export interface SearchField {
  /** The words the field shows while nobody types in it; an empty string shows the placeholder. */
  show(text: string): void;
  focus(): void;
  /** Hide the results and put back the shown words. */
  settle(): void;
}

export function createSearchField(options: SearchFieldOptions): SearchField {
  const { input, results, index, onChoose } = options;
  let shown = "";
  let query = "";
  let rows: SearchRow[] = [];
  let selected = -1;
  let expanded = new Set<string>();

  const row = (at: number, kind: string, name: string, badge: string, context: string): string =>
    `<div class="search-row search-row--${kind}${at === selected ? " selected" : ""}" data-index="${at}" role="option" aria-selected="${at === selected}">`
    + `<span class="search-row-name">${escapeHtml(name)}</span>`
    + (context ? `<span class="search-row-context">${escapeHtml(context)}</span>` : "")
    + (badge ? `<span class="search-row-badge">${escapeHtml(badge)}</span>` : "")
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

  /** Draw the rows of the query in the same order `searchRows` walks them, so that the indices agree. */
  const render = (): void => {
    if (!query.trim()) {
      hide();
      return;
    }
    const groups = searchGraph(query, index, { expanded });
    rows = searchRows(groups);
    selected = rows.length ? Math.min(Math.max(selected, 0), rows.length - 1) : -1;
    const html: string[] = [];
    let at = 0;
    for (const group of groups) {
      const heading = group.directory || "Scan root";
      if (group.matched) html.push(row(at++, "directory", heading, "directory", ""));
      else html.push(`<div class="search-group">${escapeHtml(heading)}</div>`);
      for (const file of group.files) {
        html.push(row(at++, "file", file.node.name, file.node.archetype, file.node.codeRelativePath));
        for (const symbol of file.symbols) html.push(row(at++, "symbol", symbol, "", ""));
        if (file.moreSymbols > 0) html.push(row(at++, "more", `${file.moreSymbols} more ${file.moreSymbols === 1 ? "symbol" : "symbols"}`, "", ""));
      }
    }
    results.innerHTML = html.length ? html.join("") : '<div class="search-empty">Nothing found</div>';
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
