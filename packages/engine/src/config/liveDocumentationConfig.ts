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
  /** Workspace-relative sample directories: code remains implementation, data remains asset, and test names/directories retain their test role. */
  sampleRoots: string[];
  /**
   * Workspace-relative paths or globs of files declared as entry points, for
   * what no rule infers: a bundler's entry named by a path string in code, a
   * stylesheet a template links. Each matching file's doc carries
   * `- Entry: declared`.
   */
  entryPoints: string[];
  /**
   * Workspace-relative paths or globs that discovery skips: a folder that
   * documents itself, a vendored tree the `.gitignore` does not cover. Read by
   * the rule the archetype overrides and the entry points use (`*` stands for
   * anything within one segment, `**` for anything across segments), so a
   * folder is named with its contents, as `vendor/**`.
   */
  exclude: string[];
  /** Enforce workspace-relative markdown links for wiki portability. */
  requireRelativeLinks: boolean;
  /** Header-slug dialect used when generating anchors. */
  slugDialect: LiveDocumentationSlugDialect;
  /**
   * Workspace-relative glob patterns for markdown files that Live Docs may link
   * to but that the Explorer must not bundle or show as related documents
   * (for example, a large chat archive). A document the patterns name neither
   * cites a file nor is cited by one.
   */
  bundleExclude: string[];
  /**
   * Whether each doc carries a `Cited By` section naming the documents whose
   * markdown links name its file or its doc, the reverse of the links a doc's
   * authored words make, so that a README or a design note that points at a
   * file is related to it as the file's own words would make it. True by
   * default, the owner's rule of 2026-01-06; false keeps the related documents
   * to what the docs' authored words name, so that no document comes along
   * uninvited (the owner, 2026-10-22). What a document links to is read from
   * the documents discovery finds, held to `exclude` and `bundleExclude`.
   */
  citedBy: boolean;
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
 * The extensions of every file the generator can read: the scripts the
 * built-in TypeScript parser reads, then each language adapter's files. Every
 * adapter's extensions are here, and a test holds the registry to it. Any
 * other file is documented too, but by a doc whose generated sections are
 * empty because nothing reads it ({@link hasReader}).
 */
export const LIVE_DOCUMENTATION_SOURCE_EXTENSIONS: readonly string[] = [
  // The built-in TypeScript parser
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mts", ".cts",
  // C and C++
  ".c", ".h", ".cpp", ".cc", ".cxx", ".hpp", ".hh", ".hxx", ".inl",
  // C# and ASP.NET markup
  ".cs", ".aspx", ".ascx", ".cshtml", ".razor",
  // .NET configuration and project files
  ".config", ".csproj", ".vbproj", ".fsproj",
  ".css",
  ".go",
  ".html", ".htm",
  ".java",
  ".json",
  ".ps1", ".psm1", ".psd1",
  ".py",
  ".rb",
  ".rs",
  ".sql"
];

/**
 * The names of the files an adapter reads by name rather than by extension:
 * the package manifests whose extension (`.toml`, `.xml`, `.mod`) is shared by
 * files that are not manifests, which no reader reads. A test holds the
 * registry's file names to this list.
 */
export const LIVE_DOCUMENTATION_SOURCE_FILE_NAMES: readonly string[] = [
  "Cargo.toml",
  "go.mod",
  "pom.xml",
  "pyproject.toml"
];

/**
 * The extensions of the static assets, images, fonts and media: files with
 * nothing in them for a reader to find, so that the empty generated sections
 * of their docs are the whole truth and need no note saying otherwise.
 */
export const LIVE_DOCUMENTATION_ASSET_EXTENSIONS: readonly string[] = [
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp",
  ".woff", ".woff2", ".ttf", ".eot",
  ".mp4", ".webm", ".mp3", ".wav", ".ogg"
];

/**
 * True when the TypeScript parser or a language adapter reads the file, by
 * its name or its extension. A file no reader handles still gets a doc, and
 * that doc starts with a note in its authored block saying why its generated
 * sections are empty, unless it is an image, a font or a recording
 * ({@link LIVE_DOCUMENTATION_ASSET_EXTENSIONS}), which has nothing to read.
 *
 * @param relativePath - Workspace-relative path with forward slashes.
 */
export function hasReader(relativePath: string): boolean {
  const name = relativePath.slice(relativePath.lastIndexOf("/") + 1);
  const dot = name.lastIndexOf(".");
  return LIVE_DOCUMENTATION_SOURCE_FILE_NAMES.includes(name)
    || (dot > 0 && LIVE_DOCUMENTATION_SOURCE_EXTENSIONS.includes(name.slice(dot).toLowerCase()));
}

/** True for an image, a font or a recording, by its extension: a file with nothing for a reader to find. */
export function isMediaAsset(relativePath: string): boolean {
  const name = relativePath.slice(relativePath.lastIndexOf("/") + 1);
  const dot = name.lastIndexOf(".");
  return dot > 0 && LIVE_DOCUMENTATION_ASSET_EXTENSIONS.includes(name.slice(dot).toLowerCase());
}

/**
 * True for a file no reader handles that could hold what a reader finds: not
 * read by its name or its extension ({@link hasReader}), and not an image, a
 * font or a recording ({@link isMediaAsset}). Its doc starts with a note
 * saying so, and a walk along dependencies lists it as not read rather than
 * unreachable, since the wires out of it and into it are unknown.
 *
 * @param relativePath - Workspace-relative path with forward slashes.
 */
export function noReaderHandles(relativePath: string): boolean {
  return !hasReader(relativePath) && !isMediaAsset(relativePath);
}

/**
 * The default glob: every file, anywhere in the workspace, hidden ones
 * included, so that a cold run over any repository is honest about what it
 * holds. A file carries authorial intent or wiring whether or not a reader
 * understands it yet: "Is there authorial decisionmaking to convey here? If
 * so, there should be a live documentation file for it." (the owner,
 * 2026-10-15). Discovery then removes the kinds of file that never get a doc
 * (`.git`, `node_modules`, the docs root, lock files and documents, which the
 * Explorer shows as linked documentation; the owner's list, 2026-10-22), what
 * git ignores, and what the configuration's `exclude` names. A repository
 * that wants a narrower set names its own globs.
 */
export const LIVE_DOCUMENTATION_DEFAULT_GLOBS: readonly string[] = ["**/*"];

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
  sampleRoots: [],
  entryPoints: [],
  exclude: [],
  requireRelativeLinks: true,
  slugDialect: "github",
  bundleExclude: [],
  citedBy: true
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
  const sampleRoots = dedupeStrings(Array.isArray(input?.sampleRoots) ? input.sampleRoots : [])
    .map(root => root.replace(/\\/g, "/").replace(/^(?:\.\/)+/, "").replace(/\/+$/, "") || ".");
  const entryPoints = normalizeWorkspacePatterns(input?.entryPoints);
  const exclude = normalizeWorkspacePatterns(input?.exclude);

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
    sampleRoots: [...new Set(sampleRoots)],
    entryPoints,
    exclude,
    requireRelativeLinks:
      input?.requireRelativeLinks ?? DEFAULT_LIVE_DOCUMENTATION_CONFIG.requireRelativeLinks,
    slugDialect: input?.slugDialect ?? DEFAULT_LIVE_DOCUMENTATION_CONFIG.slugDialect,
    bundleExclude,
    citedBy: typeof input?.citedBy === "boolean" ? input.citedBy : DEFAULT_LIVE_DOCUMENTATION_CONFIG.citedBy
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

/** Workspace-relative paths or globs as a configuration names them: trimmed, with forward slashes, without a leading `./`, deduplicated. */
function normalizeWorkspacePatterns(source: string[] | undefined): string[] {
  const patterns = dedupeStrings(Array.isArray(source) ? source : [])
    .map((pattern) => pattern.replace(/\\/g, "/").replace(/^(?:\.\/)+/, ""));
  return [...new Set(patterns)];
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
