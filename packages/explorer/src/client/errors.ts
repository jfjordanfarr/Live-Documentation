const encodeHtml = (value: string): string =>
  value.replace(/[&<>]/g, character => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      default:
        return character;
    }
  });

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/** What stops the Explorer that the reader can act on, said in one plain sentence: shown where the map would be, never with a stack. */
export class ExplorerRefusal extends Error {}

/** The refusal of a page opened as a file, whose browser lets it read nothing beside it (2026-11-12). */
export const OPENED_AS_FILE = "The Explorer cannot load its data when opened as a file; serve its folder with a web server and open that address.";

const describeError = (error: unknown): { message: string; stack: string } => {
  if (error instanceof Error) {
    const stack = error.stack ?? error.message;
    return { message: error.message, stack };
  }

  if (typeof error === "string") {
    return { message: error, stack: error };
  }

  if (typeof error === "number" || typeof error === "boolean") {
    const text = String(error);
    return { message: text, stack: text };
  }

  if (isObject(error)) {
    try {
      const serialised = JSON.stringify(error, null, 2);
      return { message: "Unexpected error", stack: serialised };
    } catch {
      const fallback = Object.prototype.toString.call(error);
      return { message: fallback, stack: fallback };
    }
  }

  return { message: "Unknown error", stack: "Unknown error" };
};

/**
 * Says what stopped the Explorer in the status line, as `Error: <message>`. A refusal is also its one sentence where
 * the map would be, at reading size and alone; a fault the reader cannot act on opens the detail panel with its
 * encoded stack.
 */
export function reportFatalExplorerError(error: unknown): void {
  console.error("Live Docs Explorer fatal error", error);

  const { message, stack } = describeError(error);

  const statsLine = document.getElementById("stats-line");
  if (statsLine) {
    statsLine.textContent = `Error: ${message}`;
  }

  if (error instanceof ExplorerRefusal) {
    // One sentence in the main area, never two: a second refusal replaces the first.
    const views = document.getElementById("views");
    if (views) {
      let sentence = document.getElementById("explorer-refusal");
      if (!sentence) {
        sentence = document.createElement("p");
        sentence.id = "explorer-refusal";
        sentence.className = "explorer-refusal";
        sentence.setAttribute("role", "alert");
        views.append(sentence);
      }
      sentence.textContent = message;
    }
  } else {
    const detailBody = document.getElementById("detail-body");
    if (detailBody) {
      detailBody.innerHTML = `<pre style="white-space:pre-wrap;color:#f88;">${encodeHtml(stack)}</pre>`;
    }

    const overlay = document.getElementById("detail-panel");
    overlay?.classList.add("visible");
  }

  (window as Window & { __liveDocsExplorerError?: unknown }).__liveDocsExplorerError = error;
}

/** Installs a `window.error` listener that delegates to {@link reportFatalExplorerError}. */
export function attachGlobalErrorHandler(): void {
  window.addEventListener("error", (event: ErrorEvent) => {
    const globalWindow = window as Window & { __liveDocsExplorerError?: unknown };
    if (globalWindow.__liveDocsExplorerError) {
      return;
    }
    const payload: unknown = event.error ?? event.message ?? event;
    reportFatalExplorerError(payload);
  });
}
