import type { LocalViewController } from "./controller";
import { parentDirectory } from "./directory-bands";
import { under } from "./directory-state";
import { iconButton } from "../../panels/icon-button";

/** A compact entrance into a directory's ancestors; names unfold at viewport text size. */
export function ancestryButton(controller: LocalViewController, directory: string): HTMLButtonElement {
  const button = iconButton(`Ancestors of ${directory || "Scan root"}`,
    '<path d="M4 17V7h10M8 21V11h10M2 3h20"/>');
  button.className = "local-directory-ancestors";
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-haspopup", "dialog");

  button.addEventListener("click", event => {
    event.stopPropagation();
    document.querySelector<HTMLElement>(".directory-ancestry")?.hidePopover();
    const panel = document.createElement("div");
    panel.className = "directory-ancestry";
    panel.setAttribute("popover", "auto");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", `Ancestors of ${directory || "Scan root"}`);

    const heading = document.createElement("strong");
    heading.textContent = directory.split("/").pop() || "Scan root";
    const stack = document.createElement("div");
    stack.className = "directory-ancestry-stack";
    const ancestors: string[] = [];
    for (let path = parentDirectory(directory); ; path = parentDirectory(path)) {
      ancestors.unshift(path);
      if (path === "") break;
    }

    const preview = document.createElement("div");
    preview.className = "directory-ancestor-preview";
    preview.hidden = true;
    document.getElementById("main")!.append(preview);

    function showPreview(path: string): void {
      const members = [...controller.getContainer().querySelectorAll<HTMLElement>(".node-card[data-id], .local-directory-closed[data-directory]")]
        .filter(element => under(element.dataset.id ?? element.dataset.directory ?? "", path))
        .map(element => element.getBoundingClientRect());
      if (!members.length) { preview.hidden = true; return; }
      const left = Math.min(...members.map(rect => rect.left)) - 10;
      const top = Math.min(...members.map(rect => rect.top)) - 10;
      const right = Math.max(...members.map(rect => rect.right)) + 10;
      const bottom = Math.max(...members.map(rect => rect.bottom)) + 10;
      const frame = document.getElementById("main")!.getBoundingClientRect();
      Object.assign(preview.style, { left: `${left - frame.left}px`, top: `${top - frame.top}px`, width: `${right - left}px`, height: `${bottom - top}px` });
      preview.hidden = false;
    }

    ancestors.forEach((path, depth) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "directory-ancestor";
      row.style.setProperty("--ancestor-depth", String(Math.min(depth, 5)));
      row.textContent = path.split("/").pop() || "Scan root";
      row.title = path || "Scan root";
      row.setAttribute("aria-label", `Open ancestor ${path || "Scan root"}`);
      row.addEventListener("pointerenter", () => showPreview(path));
      row.addEventListener("focus", () => showPreview(path));
      row.addEventListener("click", () => {
        panel.hidePopover();
        controller.openDirectory(path);
      });
      stack.append(row);
    });
    stack.addEventListener("pointerleave", () => { preview.hidden = true; });
    panel.append(heading, stack);
    document.getElementById("main")!.append(panel);
    panel.addEventListener("toggle", event => {
      if ((event).newState === "closed") {
        button.setAttribute("aria-expanded", "false");
        preview.remove();
        panel.remove();
      }
    });
    panel.showPopover();
    button.setAttribute("aria-expanded", "true");
    const anchor = button.getBoundingClientRect();
    const size = panel.getBoundingClientRect();
    panel.style.left = `${Math.max(8, Math.min(anchor.left, window.innerWidth - size.width - 8))}px`;
    panel.style.top = `${Math.max(8, Math.min(anchor.bottom + 6, window.innerHeight - size.height - 8))}px`;
    stack.querySelector<HTMLButtonElement>("button:last-child")?.focus({ preventScroll: true });
  });
  return button;
}
