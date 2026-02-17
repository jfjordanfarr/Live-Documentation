/**
 * GitHub-compatible slug generation.
 *
 * This implementation is adapted from the `github-slugger` package (ISC license).
 * We vendor the algorithm here so we can reference it in both runtime code and tests
 * without introducing a new ESM dependency. See https://github.com/Flet/github-slugger.
 */

import { GITHUB_SLUG_REMOVE_PATTERN } from "./githubSluggerRegex";

/**
 * Extended slug result that includes the de-duplicated slug string,
 * the base slug before collision resolution, and the collision index.
 */
export interface SlugContext {
  /** Final slug string (may have a `-N` suffix for duplicates). */
  slug: string;
  /** Slug before collision-avoidance suffix was appended. */
  base: string;
  /** 0-based collision index; 0 means no collision. */
  index: number;
}

/**
 * Stateful GitHub-compatible heading slug generator.
 *
 * Maintains an internal occurrence map so duplicate headings receive
 * disambiguating `-N` suffixes, matching GitHub's rendering behaviour.
 */
export class GitHubSlugger {
  private occurrences: Record<string, number>;

  constructor() {
    this.occurrences = createOccurrences();
  }

  /**
   * Generates a GitHub-compatible slug, auto-disambiguating duplicates.
   *
   * @param value - Raw heading text.
   * @param maintainCase - If `true`, preserves original casing.
   * @returns De-duplicated slug string.
   */
  slug(value: string, maintainCase = false): string {
    return this.slugWithContext(value, maintainCase).slug;
  }

  /**
   * Like {@link slug} but returns the full {@link SlugContext} with
   * base slug and collision index.
   */
  slugWithContext(value: string, maintainCase = false): SlugContext {
    const original = slug(value, maintainCase);
    let result = original;

    while (hasOwn(this.occurrences, result)) {
      const next = (this.occurrences[original] ?? 0) + 1;
      this.occurrences[original] = next;
      result = `${original}-${next}`;
    }

    if (!hasOwn(this.occurrences, original)) {
      this.occurrences[original] = 0;
    }

    this.occurrences[result] = 0;

    const index = result === original ? 0 : this.occurrences[original];

    return { slug: result, base: original, index };
  }

  /** Clears the internal occurrence map, resetting collision tracking. */
  reset(): void {
    this.occurrences = createOccurrences();
  }
}

/**
 * Stateless slug generation (no duplicate tracking).
 *
 * @param value - Raw heading text.
 * @param maintainCase - If `true`, preserves original casing.
 * @returns GitHub-compatible slug string.
 */
export function slug(value: string, maintainCase = false): string {
  if (typeof value !== "string") {
    return "";
  }

  const source = maintainCase ? value : value.toLowerCase();
  return source.replace(GITHUB_SLUG_REMOVE_PATTERN, "").replace(/ /g, "-");
}

/** Creates a fresh {@link GitHubSlugger} instance. */
export function createSlugger(): GitHubSlugger {
  return new GitHubSlugger();
}

function createOccurrences(): Record<string, number> {
  return Object.create(null) as Record<string, number>;
}

function hasOwn<T extends Record<string, unknown>>(object: T, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}
