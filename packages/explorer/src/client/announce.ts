/**
 * The page's one polite status region (WCAG 2.2 SC 4.1.3, Status Messages): what happens that a person does not
 * look at, said to a screen reader without moving focus. Any view calls `announce` with a short sentence; the region
 * is `#page-status` in the page's template, visually hidden. One region for the page, so that two views never talk
 * over each other in two of their own (the design system's audit, 2026-11-18).
 */

/** How long the region stays empty before new words, so that the same sentence said twice is heard twice. */
const PAUSE_MS = 50;

let pending: { timer: ReturnType<typeof setTimeout>; words: string } | null = null;

const region = (): HTMLElement | null => document.getElementById("page-status");

/** Say `words` in the page's status region, politely: after whatever the screen reader is saying now. */
export function announce(words: string): void {
  const element = region();
  if (!element) return;
  if (pending) clearTimeout(pending.timer);
  element.textContent = "";
  pending = {
    words,
    timer: setTimeout(() => {
      pending = null;
      element.textContent = words;
    }, PAUSE_MS)
  };
}

/** Take back `words` if they are what the region says or is about to say, so that it does not keep a stale sentence. */
export function withdraw(words: string): void {
  const element = region();
  if (!element) return;
  if (pending?.words === words) {
    clearTimeout(pending.timer);
    pending = null;
  }
  if (element.textContent === words) element.textContent = "";
}
