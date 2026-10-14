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
