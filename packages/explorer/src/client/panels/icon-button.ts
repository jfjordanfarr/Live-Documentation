/** A named, keyboard-accessible icon action. SVG content is supplied by the application, never by graph data. */
export function iconButton(label: string, drawing: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.title = label;
  button.setAttribute("aria-label", label);
  button.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${drawing}</svg>`;
  return button;
}

/** The shared release glyph. */
export const CLOSE_ICON = '<path d="m6 6 12 12M18 6 6 18"/>';

/** A directory has containment, rather than the exposed-symbol marker of a file. */
export const DIRECTORY_ICON = '<path d="M3 7V5h6l2 2h10v13H3Z"/>';

/** Retain the file or symbol's connections. */
export const PIN_ICON = '<path d="M8 3h8l-1 6 3 3v2H6v-2l3-3-1-6ZM12 14v7"/>';

/** Bring the named item to the centre of the map. */
export const CENTRE_ICON = '<circle cx="12" cy="12" r="3.5"/><path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4"/>';

/** The item's additional commands. */
export const MORE_ICON = '<g fill="currentColor" stroke="none"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></g>';
