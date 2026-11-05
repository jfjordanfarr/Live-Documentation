/** Contextual commands for a map entity, reached by More or the platform context-menu gesture. */
export interface ItemCommand {
  label: string;
  detail?: string;
  run(): void;
}

/** A transient command menu. Application callbacks own every change it offers. */
export function createItemMenu(): {
  show(anchor: { x: number; y: number }, commands: readonly ItemCommand[], onClose?: () => void, title?: string): void;
  close(): void;
  dispose(): void;
} {
  const lifetime = new AbortController();
  const menu = document.createElement("div");
  menu.className = "item-menu";
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", "Item actions");
  menu.hidden = true;
  document.body.append(menu);
  let opener: HTMLElement | null = null;
  let afterClose: (() => void) | undefined;

  function close(): void {
    const heldFocus = menu.contains(document.activeElement);
    menu.hidden = true;
    if (heldFocus && opener?.isConnected) opener.focus({ preventScroll: true });
    opener = null;
    const notify = afterClose;
    afterClose = undefined;
    notify?.();
  }

  menu.addEventListener("keydown", event => {
    const buttons = [...menu.querySelectorAll<HTMLButtonElement>("button")];
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); }
    else if (event.key === "Tab") close();
    else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1
        : (index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next]?.focus();
    }
  }, { signal: lifetime.signal });
  document.addEventListener("pointerdown", event => {
    if (!menu.hidden && event.target instanceof Node && !menu.contains(event.target)) close();
  }, { capture: true, signal: lifetime.signal });
  window.addEventListener("resize", close, { signal: lifetime.signal });
  window.addEventListener("popstate", close, { signal: lifetime.signal });

  return {
    close,
    dispose(): void { close(); lifetime.abort(); menu.remove(); },
    show(anchor, commands, onClose, title): void {
      close();
      menu.setAttribute("aria-label", title ?? "Item actions");
      opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      afterClose = onClose;
      menu.replaceChildren(...commands.map(command => {
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("role", "menuitem");
        button.tabIndex = -1;
        button.textContent = command.label;
        if (command.detail) {
          const detail = document.createElement("span");
          detail.className = "item-menu-detail";
          detail.textContent = command.detail;
          button.append(detail);
        }
        button.addEventListener("click", () => { close(); command.run(); });
        return button;
      }));
      if (title) {
        const heading = document.createElement("div");
        heading.className = "item-menu-heading";
        heading.setAttribute("role", "presentation");
        heading.textContent = title;
        menu.prepend(heading);
      }
      menu.hidden = false;
      menu.style.left = "0px";
      menu.style.top = "0px";
      const box = menu.getBoundingClientRect();
      menu.style.left = `${Math.max(8, Math.min(anchor.x, window.innerWidth - box.width - 8))}px`;
      menu.style.top = `${Math.max(8, Math.min(anchor.y, window.innerHeight - box.height - 8))}px`;
      menu.querySelector<HTMLButtonElement>("button")?.focus();
    }
  };
}
