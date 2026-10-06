/**
 * The scopes the layout lab works on, which are the still-picture deck's, and
 * the built bundle each is drawn from, served to a browser straight from
 * `dist/explorer` without a server process.
 *
 * @module layout-lab/scopes
 */
import type { Page } from "@playwright/test";
import * as fs from "node:fs/promises";
import path from "node:path";


import { explorerGraphOf } from "../../packages/explorer/src/shared/graph";
import type { StaticExplorerData } from "../../packages/explorer/src/shared/staticExplorerData";
import type { ExplorerGraphPayload } from "../../packages/explorer/src/shared/types";
import { DECK_SCOPES, type DeckScope } from "../../tests/e2e/scopes";

/** A scope the lab works on: one of the deck's. */
export type ScopeRun = DeckScope;

/** The built Explorer, which `npm run live-docs:visualize` and `:estate` write. */
export const DIST = path.resolve(__dirname, "../../dist/explorer");

/** The origin the lab serves a bundle under; nothing listens there, the page's requests are answered from disk. */
export const ORIGIN = "http://lab.local";

/** A scope by `bundle/scope`, as in `repository/five files`, `repository/five`, `estate/chain`. */
export function findScope(key: string): ScopeRun {
  const [bundle, ...rest] = key.split("/");
  const name = rest.join("/").trim().toLowerCase();
  const found = DECK_SCOPES.find(run => run.bundle === bundle && (run.scopeName === name || run.scopeName.startsWith(name)));
  if (!found) throw new Error(`No scope ${JSON.stringify(key)}; the scopes are ${DECK_SCOPES.map(run => `${run.bundle}/${run.scopeName}`).join(", ")}.`);
  return found;
}

/** The subject of the scope's retained picture: its first file, as the deck's retained rows open it. */
export const retainedSubject = (run: ScopeRun): string => run.scope[0];

/** The scope's short key, for file names: `repository-five-files`. */
export const scopeSlug = (run: ScopeRun): string => `${run.bundle}-${run.scopeName.replace(/\s+/gu, "-")}`;

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".mjs": "application/javascript", ".json": "application/json", ".css": "text/css",
  ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff", ".ico": "image/x-icon", ".map": "application/json", ".txt": "text/plain", ".md": "text/markdown"
};

/** Answers the page's requests under the lab's origin from the built bundle on disk. */
export async function serveBundle(page: Page): Promise<void> {
  await page.route(`${ORIGIN}/**`, async route => {
    const url = new URL(route.request().url());
    if (url.pathname.includes("/__pretext/")) { await route.fallback(); return; }
    let file = path.join(DIST, decodeURIComponent(url.pathname));
    try {
      if ((await fs.stat(file)).isDirectory()) file = path.join(file, "index.html");
      const body = await fs.readFile(file);
      await route.fulfill({ body, contentType: CONTENT_TYPES[path.extname(file)] ?? "application/octet-stream" });
    } catch {
      await route.fulfill({ status: 404, body: `No ${url.pathname} in the built bundle.` });
    }
  });
}

/**
 * Lets a function compiled by tsx run inside the page. esbuild keeps function
 * names by wrapping each in a `__name(...)` call, a helper the node side has
 * and the page has not, so a function Playwright serializes into the page
 * would fail on its first line; this defines the helper there as the identity.
 */
export async function admitCompiledFunctions(page: Page): Promise<void> {
  await page.evaluate("window.__name = window.__name || ((target) => target)");
}

/** The scope's bundle as the client projects it, read from disk. */
export async function loadBundleGraph(run: ScopeRun): Promise<ExplorerGraphPayload> {
  const file = path.join(DIST, run.base, "explorer-data.json");
  const bundle = JSON.parse(await fs.readFile(file, "utf8")) as StaticExplorerData;
  return explorerGraphOf(bundle.graph);
}
