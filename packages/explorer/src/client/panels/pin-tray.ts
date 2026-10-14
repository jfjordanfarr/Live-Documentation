import { CLOSE_ICON, DIRECTORY_ICON, iconButton } from "./icon-button";
import type { ExplorerNodePayload } from "../../shared/types";
import { retainedItems, retainedKey, type RetainedItem, type RetainedState } from "../views/retained-state";

/** Actions operate on the shared selection; opening the tray or focusing a row does not retain anything. */
export interface PinTrayOptions {
  parent: HTMLElement;
  nodes: ReadonlyMap<string, ExplorerNodePayload>;
  onRelease(item: RetainedItem): void;
  onClearDirectory(directory: string): void;
  onClear(): void;
  onFocus(item: RetainedItem): void;
}

/** A newest-first working set with stable row elements and a persistent collapse handle. */
export function createPinTray(options: PinTrayOptions): {
  sync(state: RetainedState, visible: boolean, busy: boolean): void;
} {
  const tray = document.createElement("section");
  tray.className = "pin-tray";
  tray.setAttribute("aria-label", "Retained selections");

  const panel = document.createElement("div");
  panel.className = "pin-tray-panel";
  panel.id = "pin-tray-panel";
  panel.hidden = true;

  const header = document.createElement("div");
  header.className = "pin-tray-header";
  const heading = document.createElement("strong");
  heading.textContent = "Pins";
  const clear = document.createElement("button");
  clear.type = "button";
  clear.textContent = "Clear all";
  clear.setAttribute("aria-label", "Clear exploration pins");
  clear.title = "Release all file, symbol and directory pins";
  clear.addEventListener("click", () => options.onClear());
  header.append(heading, clear);

  const list = document.createElement("ol");
  list.className = "pin-tray-list";
  const empty = document.createElement("p");
  empty.className = "pin-tray-empty";
  empty.textContent = "No retained selections.";
  panel.append(header, list, empty);

  const toggle = iconButton("Show pins", '<path d="m9 3 6 0-1 6 4 4v2H6v-2l4-4ZM12 15v6"/>');
  toggle.className = "pin-tray-toggle";
  toggle.setAttribute("aria-controls", panel.id);
  toggle.setAttribute("aria-expanded", "false");
  const count = document.createElement("span");
  count.id = "pin-tray-count";
  toggle.setAttribute("aria-describedby", count.id);
  toggle.append(count);
  toggle.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    toggle.setAttribute("aria-expanded", String(!panel.hidden));
    toggle.setAttribute("aria-label", panel.hidden ? "Show pins" : "Hide pins");
    toggle.title = panel.hidden ? "Show pins" : "Hide pins";
    if (!panel.hidden) document.getElementById("detail-close")?.click();
  });
  tray.append(panel, toggle);
  options.parent.append(tray);

  // Details and pins use the same edge. Keep the pin handle available beside Details.
  const details = document.getElementById("detail-panel");
  if (details) {
    new MutationObserver(() => {
      if (details.classList.contains("visible")) {
        panel.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Show pins");
        toggle.title = "Show pins";
      }
    }).observe(details, { attributes: true, attributeFilter: ["class"] });
  }

  const rows = new Map<string, HTMLLIElement>();

  function createRow(item: RetainedItem): HTMLLIElement {
    const row = document.createElement("li");
    row.className = "pin-tray-row";
    row.dataset.retainedKey = retainedKey(item);
    const directory = item.kind === "directory";
    const path = directory ? item.directory : item.pin.nodeId;
    const name = directory ? path.split("/").pop() || "Scan root"
      : options.nodes.get(item.pin.nodeId)?.name ?? item.pin.nodeId;
    const symbol = !directory && item.pin.symbol !== "*"
      ? item.pin.symbol === "__internals__" ? "Internals" : item.pin.symbol : null;
    const description = directory ? `directory ${path || "Scan root"}`
      : symbol ? `${symbol} in ${path}` : path;

    const focus = iconButton(`Show ${description}`, directory ? DIRECTORY_ICON
      : '<path d="M6 3h8l4 4v14H6ZM14 3v5h4"/>');
    focus.className = "pin-tray-subject";
    const words = document.createElement("span");
    words.className = "pin-tray-words";
    const title = document.createElement("span");
    title.className = "pin-tray-name";
    title.textContent = symbol ?? name;
    const context = document.createElement("span");
    context.className = "pin-tray-context";
    context.textContent = path || "Directory";
    if (!directory && !symbol) focus.title = `${path} · All symbols`;
    words.append(title, context);
    focus.append(words);
    focus.addEventListener("click", () => options.onFocus(item));
    row.append(focus);

    if (directory) {
      const bulk = iconButton(`Clear pins inside ${path || "Scan root"}`,
        '<path d="M3 5h6l2 2h10v13H3ZM10 11l6 6m0-6-6 6"/>');
      bulk.className = "pin-tray-bulk";
      bulk.addEventListener("click", () => options.onClearDirectory(item.directory));
      row.append(bulk);
    }

    const release = iconButton(`Release ${description}`, CLOSE_ICON);
    release.className = "pin-tray-release";
    release.addEventListener("click", () => options.onRelease(item));
    row.append(release);
    return row;
  }

  return {
    sync(state, visible, busy) {
      tray.hidden = !visible;
      const items = retainedItems(state).reverse();
      const present = new Set(items.map(retainedKey));
      const focusedRow = document.activeElement?.closest<HTMLLIElement>(".pin-tray-row");
      const oldIndex = focusedRow ? [...list.children].indexOf(focusedRow) : -1;

      for (const [key, row] of rows) {
        if (!present.has(key)) {
          row.remove();
          rows.delete(key);
        }
      }
      items.forEach((item, index) => {
        const key = retainedKey(item);
        const row = rows.get(key) ?? createRow(item);
        rows.set(key, row);
        if (list.children[index] !== row) list.insertBefore(row, list.children[index] ?? null);
        row.querySelectorAll<HTMLButtonElement>("button").forEach(button => { button.disabled = busy; });
      });

      if (focusedRow && !focusedRow.isConnected) {
        const next = list.children[Math.min(oldIndex, list.children.length - 1)];
        (next?.querySelector<HTMLButtonElement>(".pin-tray-release") ?? toggle).focus({ preventScroll: true });
      }
      count.textContent = `${items.length} ${items.length === 1 ? "pin" : "pins"}`;
      clear.disabled = busy || items.length === 0;
      empty.hidden = items.length > 0;
    }
  };
}
