/**
 * The lens's key: one hash of the generator and the configuration it applies
 * to every change, so that the cache keeps a summary only under the lens that
 * made it and a new lens recomputes (the plan's scenario 13).
 *
 * @module
 */

import { createHash } from "node:crypto";

import type { LiveDocumentationConfig } from "../../config/liveDocumentationConfig";
import type { GeneratorIdentity, HistoryLens } from "./format";

/**
 * The lens of a generator and a normalized configuration, with its key. The key is made of the generator's version,
 * its committed code and tool dependency lock, its uncommitted changes to either, the runtime's version of Unicode,
 * and the configuration a summary is made under ({@link summarizedConfiguration}); the commit the generator runs from
 * rides in the lens for the reader but does not key it, so unrelated commits keep the cache. The lens itself carries
 * the whole configuration, for the reader.
 *
 * With the configuration goes what the repository itself decides of how a summary is made: whether its version control
 * matches names without regard to case (`VersionControl.ignoresCase`, for git its own `core.ignorecase`), which the
 * generator applies to `exclude`, so that a clone made on Windows excludes `Docs/` where a pattern names `docs/`. Since
 * 2026-11-20 it keys the lens, and the trees' environment answers the generator with the value keyed, so that the key and
 * the summary read one value; before, it reached summaries unkeyed, and a cache moved between machines could hold
 * summaries made under the other. Where it is false the key is made as before it was keyed.
 *
 * So too whether the summarizing workers were kept from one change to the next (`keepWorkers`, the history command's
 * `--keep-workers`), which is not yet shown to make the summaries a fresh process makes: since 2026-11-20 it keys the
 * lens where it is true, so that summaries made with workers kept never share a cache folder with those made one change
 * a worker, and the pool reads it from the lens (`regenerate.ts`), one source for the key and the run. Where it is false
 * the key is made as before it was keyed.
 */
export function lensOf(generator: GeneratorIdentity, configuration: LiveDocumentationConfig, made: { ignoresCase?: boolean; keepWorkers?: boolean } = {}): HistoryLens {
  const keyed = { version: generator.version, code: generator.code, modified: generator.modified, unicode: generator.unicode ?? null };
  const repository = made.ignoresCase === true ? { repository: { ignoresCase: true } } : {};
  const workers = made.keepWorkers === true ? { workers: { kept: true } } : {};
  const key = createHash("sha256").update(canonicalJson({ generator: keyed, configuration: summarizedConfiguration(configuration), ...repository, ...workers })).digest("hex").slice(0, 16);
  return { key, generator, configuration, ...(made.ignoresCase === true ? { ignoresCase: true as const } : {}), ...(made.keepWorkers === true ? { keepWorkers: true as const } : {}) };
}

/**
 * The configuration a commit's summary is made under: the lens's, without what only the reading of summaries uses.
 * The history command hands the summarizing process exactly this, and the lens's key holds exactly this, so that what
 * is keyed is by construction what a summary is made under.
 *
 * @remarks
 * Since 2026-11-19 the bundle's exclusions (`bundleExclude`) are applied where summaries are read (`bundled.ts`), and a
 * summary keeps every linked and citing document, so an edit of them rewrites the sequence from the cache. No module of
 * the engine or the generator reads the board (`board`, read by the Explorer's builder and the board command), so it
 * goes the same way. `requireRelativeLinks` and `slugDialect` are read by no module of either package either, by a
 * search of their sources, and stay in until that is shown by more than a search.
 */
export function summarizedConfiguration(configuration: LiveDocumentationConfig): LiveDocumentationConfig {
  const { board: _read, ...summarized } = configuration;
  return { ...summarized, bundleExclude: [] };
}

/** JSON with every object's keys in sorted order, so that two equal values always hash alike. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortedKeys(value));
}

function sortedKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortedKeys);
  }
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return Object.fromEntries(entries.map(([key, inner]) => [key, sortedKeys(inner)]));
  }
  return value;
}
