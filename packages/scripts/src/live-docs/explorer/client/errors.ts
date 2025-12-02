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

export function reportFatalExplorerError(error: unknown): void {
  console.error("Live Docs Explorer fatal error", error);

  const { message, stack } = describeError(error);

  const statsLine = document.getElementById("stats-line");
  if (statsLine) {
    statsLine.textContent = `Error: ${message}`;
  }

  const detailBody = document.getElementById("detail-body");
  if (detailBody) {
    detailBody.innerHTML = `<pre style="white-space:pre-wrap;color:#f88;">${encodeHtml(stack)}</pre>`;
  }

  const overlay = document.getElementById("detail-panel");
  overlay?.classList.add("visible");

  (window as Window & { __liveDocsExplorerError?: unknown }).__liveDocsExplorerError = error;
}

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
