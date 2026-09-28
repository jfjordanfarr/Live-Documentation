// Live Documentation: .live-documentation/source/packages/engine/src/config/liveDocumentationConfig.md

/**
 * Dialect used to generate header-anchor slugs in Live Doc markdown.
 *
 * Each platform slugifies `## Heading Text` differently (e.g. GitHub lowercases
 * and strips punctuation, Azure DevOps preserves casing). The chosen dialect
 * controls how `{#symbol-...}` anchors are produced so that cross-references
 * resolve correctly on the target hosting platform.
 */
export type LiveDocumentationSlugDialect = "github" | "azure-devops" | "gitlab";

/**
 * Classifies a tracked workspace artifact into a structural role.
 *
 * The archetype is recorded in each Live Doc's metadata. The generator infers
 * it from path patterns, and consumers can force a value via
 * {@link LiveDocumentationConfig.archetypeOverrides}.
 */
export type LiveDocumentationArchetype =
  | "implementation"
  | "test"
  | "asset"
  | "stub"
  | "component"
  | "interaction"
  | "data-model"
  | "workflow"
  | "integration"
  | "testing";

/**
 * Complete, resolved configuration for the Live Documentation pipeline.
 *
 * Every CLI command, generator pass, lint rule, and explorer view reads from
 * this shape. Obtain an instance via {@link normalizeLiveDocumentationConfig}
 * which fills missing fields from {@link DEFAULT_LIVE_DOCUMENTATION_CONFIG}.
 *
 * This interface is the single source of truth for how the pipeline maps
 * workspace source artifacts to their Live Doc mirror files and which slug
 * dialect to use.
 */
export interface LiveDocumentationConfig {
  /** Filesystem root where staged Live Docs are written. */
  root: string;
  /** Mirror folder inside the root that represents the base layer (`"source"` by default). */
  baseLayer: string;
  /** File extension (including suffix) applied to generated Live Docs. */
  extension: string;
  /** Glob patterns that select source artefacts which should receive Live Docs. */
  glob: string[];
  /** Optional overrides that assign archetypes to matching paths. */
  archetypeOverrides: Record<string, LiveDocumentationArchetype>;
  /** Enforce workspace-relative markdown links for wiki portability. */
  requireRelativeLinks: boolean;
  /** Header-slug dialect used when generating anchors. */
  slugDialect: LiveDocumentationSlugDialect;
  /** Toggle for docstring bridge reconciliation once adapters are configured. */
  enableDocstringBridge: boolean;
  /**
   * Workspace-relative glob patterns for markdown files that Live Docs may link
   * to but that the Explorer must not bundle or show as related documents
   * (for example, a large chat archive).
   */
  bundleExclude: string[];
}

/**
 * Partial input shape accepted by {@link normalizeLiveDocumentationConfig}.
 *
 * Consumers (CLI flags, `.live-docs.config.json`) provide only the fields they
 * want to override; everything else falls back to
 * {@link DEFAULT_LIVE_DOCUMENTATION_CONFIG}.
 */
export type LiveDocumentationConfigInput = Partial<LiveDocumentationConfig>;

// Consumer-friendly defaults.
//
// This repo often overrides these defaults to align with its internal MDMD convention
// (e.g. root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md").
/** Default root directory for the Live Docs mirror (`".live-documentation"`). */
export const LIVE_DOCUMENTATION_DEFAULT_ROOT = ".live-documentation";
/** Default base-layer subdirectory within the root (`"source"`). */
export const LIVE_DOCUMENTATION_DEFAULT_BASE_LAYER = "source";
/** Default file extension for generated Live Doc files (`".md"`). */
export const LIVE_DOCUMENTATION_FILE_EXTENSION = ".md";
/**
 * Default glob patterns selecting workspace artifacts that receive Live Docs.
 *
 * Covers TypeScript, JavaScript, PowerShell, C#/.NET view files, Python, Java,
 * Ruby, Rust, C/C++, Go, HTML/CSS, JSON, SQL scripts, .NET project files, npm
 * package manifests, and static assets (images, fonts, media). Static assets
 * receive stub-only Live Docs for graph connectivity.
 */
export const LIVE_DOCUMENTATION_DEFAULT_GLOBS = [
  "package.json",
  "packages/*/package.json",
  "packages/**/src/**/*.ts",
  "packages/**/src/**/*.tsx",
  "packages/**/src/**/*.js",
  "packages/**/src/**/*.jsx",
  "packages/**/src/**/*.mjs",
  "packages/**/src/**/*.cjs",
  "packages/**/src/**/*.mts",
  "packages/**/src/**/*.cts",
  "packages/**/src/**/*.ps1",
  "packages/**/src/**/*.psm1",
  "packages/**/src/**/*.psd1",
  "packages/**/src/**/*.aspx",
  "packages/**/src/**/*.ascx",
  "packages/**/src/**/*.cshtml",
  "packages/**/src/**/*.razor",
  "packages/**/src/**/*.config",
  "packages/**/src/**/*.html",
  "packages/**/src/**/*.css",
  "packages/**/src/**/*.json",
  "scripts/**/*.ts",
  "scripts/**/*.tsx",
  "scripts/**/*.mjs",
  "scripts/**/*.cjs",
  "scripts/**/*.ps1",
  "scripts/**/*.psm1",
  "scripts/**/*.psd1",
  "scripts/**/*.html",
  "scripts/**/*.css",
  "scripts/**/*.json",
  "tests/**/*.ts",
  "tests/**/*.tsx",
  "tests/**/*.js",
  "tests/**/*.jsx",
  "tests/**/*.mjs",
  "tests/**/*.cjs",
  "tests/**/*.mts",
  "tests/**/*.cts",
  "tests/**/*.ps1",
  "tests/**/*.psm1",
  "tests/**/*.psd1",
  "tests/**/*.aspx",
  "tests/**/*.ascx",
  "tests/**/*.razor",
  "tests/**/*.config",
  "tests/**/*.cs",
  "tests/**/*.cshtml",
  "tests/**/*.cshtml.cs",
  "tests/**/*.py",
  "tests/**/*.java",
  "tests/**/*.rb",
  "tests/**/*.rs",
  "tests/**/*.c",
  "tests/**/*.h",
  "tests/**/*.cpp",
  "tests/**/*.go",
  "tests/**/*.html",
  "tests/**/*.css",
  "tests/**/*.json",
  "tests/**/*.sql",
  "tests/**/*.csproj",
  // Static assets — stub-like Live Docs for graph connectivity (2025-11-08 vision)
  "tests/**/*.png",
  "tests/**/*.jpg",
  "tests/**/*.jpeg",
  "tests/**/*.gif",
  "tests/**/*.svg",
  "tests/**/*.ico",
  "tests/**/*.webp",
  "tests/**/*.woff",
  "tests/**/*.woff2",
  "tests/**/*.ttf",
  "tests/**/*.eot",
  "tests/**/*.mp4",
  "tests/**/*.webm",
  "tests/**/*.mp3",
  "tests/**/*.wav",
  "tests/**/*.ogg"
];

/**
 * Fully-resolved default configuration used when no `.live-docs.config.json`
 * is present or when individual fields are omitted from the input.
 *
 * This workspace typically overrides `root`, `baseLayer`, and `extension` to
 * `".mdmd"`, `"layer-4"`, and `".mdmd.md"` respectively via its repo-local
 * config file.
 */
export const DEFAULT_LIVE_DOCUMENTATION_CONFIG: LiveDocumentationConfig = {
  root: LIVE_DOCUMENTATION_DEFAULT_ROOT,
  baseLayer: LIVE_DOCUMENTATION_DEFAULT_BASE_LAYER,
  extension: LIVE_DOCUMENTATION_FILE_EXTENSION,
  glob: [...LIVE_DOCUMENTATION_DEFAULT_GLOBS],
  archetypeOverrides: {},
  requireRelativeLinks: true,
  slugDialect: "github",
  enableDocstringBridge: false,
  bundleExclude: []
};

/**
 * Merges a partial config input with {@link DEFAULT_LIVE_DOCUMENTATION_CONFIG},
 * producing a fully-resolved {@link LiveDocumentationConfig}.
 *
 * Handles edge cases: blank strings fall back to defaults, globs are deduped,
 * and file extensions are normalized to start with `"."`. This is the canonical
 * entry point for every CLI and server path that needs a config object.
 *
 * @param input - Partial overrides, typically parsed from `.live-docs.config.json`
 *   or CLI flags. When `undefined`, returns the default config unchanged.
 * @returns A complete, immutable configuration ready for pipeline consumption.
 */
export function normalizeLiveDocumentationConfig(
  input?: LiveDocumentationConfigInput
): LiveDocumentationConfig {
  const inputGlobs = Array.isArray(input?.glob) ? input?.glob : undefined;
  const glob = inputGlobs && inputGlobs.length
    ? dedupeStrings(inputGlobs)
    : [...DEFAULT_LIVE_DOCUMENTATION_CONFIG.glob];

  const archetypeOverrides = input?.archetypeOverrides
    ? { ...input.archetypeOverrides }
    : {};

  const inputBundleExclude = Array.isArray(input?.bundleExclude) ? input?.bundleExclude : undefined;
  const bundleExclude = inputBundleExclude ? dedupeStrings(inputBundleExclude) : [];

  return {
    root: normalizeStringOption(input?.root, DEFAULT_LIVE_DOCUMENTATION_CONFIG.root),
    baseLayer: normalizeStringOption(
      input?.baseLayer,
      DEFAULT_LIVE_DOCUMENTATION_CONFIG.baseLayer
    ),
    extension: normalizeExtensionOption(
      input?.extension,
      DEFAULT_LIVE_DOCUMENTATION_CONFIG.extension
    ),
    glob,
    archetypeOverrides,
    requireRelativeLinks:
      input?.requireRelativeLinks ?? DEFAULT_LIVE_DOCUMENTATION_CONFIG.requireRelativeLinks,
    slugDialect: input?.slugDialect ?? DEFAULT_LIVE_DOCUMENTATION_CONFIG.slugDialect,
    enableDocstringBridge:
      input?.enableDocstringBridge ?? DEFAULT_LIVE_DOCUMENTATION_CONFIG.enableDocstringBridge,
    bundleExclude
  };
}

function normalizeStringOption(value: string | undefined, fallback: string): string {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : fallback;
}

function normalizeExtensionOption(value: string | undefined, fallback: string): string {
  const normalized = value?.trim();
  if (!normalized) {
    return fallback;
  }

  const ensured = normalized.startsWith(".") ? normalized : `.${normalized}`;
  return ensured.length > 1 ? ensured : fallback;
}

function dedupeStrings(source: string[]): string[] {
  const seen = new Set<string>();
  for (const value of source) {
    const normalized = value.trim();
    if (!normalized) {
      continue;
    }
    seen.add(normalized);
  }
  return Array.from(seen);
}
