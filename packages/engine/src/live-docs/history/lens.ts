/**
 * The lens's key: one hash of the generator and the configuration it applies
 * to every change, so that the cache keeps a summary only under the lens that
 * made it and a new lens recomputes (the plan's scenario 13).
 *
 * @module
 */

import { createHash } from "node:crypto";

import type { GeneratorIdentity, HistoryLens } from "./format";
import type { LiveDocumentationConfig } from "../../config/liveDocumentationConfig";

/** The lens of a generator and a normalized configuration, with its key. */
export function lensOf(generator: GeneratorIdentity, configuration: LiveDocumentationConfig): HistoryLens {
  const key = createHash("sha256").update(canonicalJson({ generator, configuration })).digest("hex").slice(0, 16);
  return { key, generator, configuration };
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
