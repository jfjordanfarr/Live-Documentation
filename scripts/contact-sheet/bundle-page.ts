/// <reference lib="dom" />
/**
 * @file bundle-page.ts
 * @description What the contact sheet and the marble sheet share: a built Explorer bundle answered from disk under an
 * origin of its own, and the viewer's saved settings written before a page loads.
 */

import type { BrowserContext } from "@playwright/test";
import * as fs from "node:fs/promises";
import path from "node:path";

import { PERSISTED_UI_KEY, PERSISTED_UI_VERSION } from "../../packages/explorer/src/client/persistence/local-storage";

/** The origin a bundle is served under. */
export const ORIGIN = "http://sheet.local";

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".json": "application/json", ".css": "text/css",
  ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff", ".map": "application/json", ".md": "text/markdown"
};

/** Answers the page's requests from the bundle on disk, under an origin of its own. */
export async function serve(context: BrowserContext, bundleDir: string): Promise<void> {
  await context.route(`${ORIGIN}/**`, async route => {
    let file = path.join(bundleDir, decodeURIComponent(new URL(route.request().url()).pathname));
    try {
      if ((await fs.stat(file)).isDirectory()) file = path.join(file, "index.html");
      await route.fulfill({ body: await fs.readFile(file), contentType: CONTENT_TYPES[path.extname(file)] ?? "application/octet-stream" });
    } catch {
      await route.fulfill({ status: 404, body: "" });
    }
  });
}

/**
 * Merges settings into the persisted UI a hook may already have written. The script is given as text: a function passed
 * from here is compiled by tsx, which names its inner functions with a helper the page does not have, and the script
 * then failed in the page before writing anything (found 2026-11-17, when no setting reached a page).
 */
export async function mergeStorage(context: BrowserContext, settings: Record<string, unknown>): Promise<void> {
  await context.addInitScript(`(() => {
    const key = ${JSON.stringify(PERSISTED_UI_KEY)};
    const merge = function (into, from) {
      for (const [k, v] of Object.entries(from)) into[k] = v && typeof v === "object" && !Array.isArray(v) ? merge(into[k] ?? {}, v) : v;
      return into;
    };
    let stored;
    try { stored = JSON.parse(window.localStorage.getItem(key) ?? "{}"); } catch { stored = {}; }
    window.localStorage.setItem(key, JSON.stringify(merge({ version: ${JSON.stringify(PERSISTED_UI_VERSION)}, ...stored }, ${JSON.stringify(settings)})));
  })();`);
}

/** A text made safe to stand in HTML. */
export const escape = (text: string): string => text.replace(/[&<>"]/gu, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[ch]!);
