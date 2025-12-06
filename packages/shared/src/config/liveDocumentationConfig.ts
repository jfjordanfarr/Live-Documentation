// Live Documentation: .live-documentation/source/packages/shared/src/config/liveDocumentationConfig.md

export type LiveDocumentationSlugDialect = "github" | "azure-devops" | "gitlab";

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

export type LiveDocumentationEvidenceStrictMode = "off" | "warning" | "error";

export interface LiveDocumentationEvidenceConfig {
  strict: LiveDocumentationEvidenceStrictMode;
}

export interface LiveDocumentationConfig {
  /** Filesystem root where staged Live Docs are written. */
  root: string;
  /** Mirror folder inside the root that represents the base layer (Layer-4 by default). */
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
  /** Evidence configuration controlling lint severity when evidence is missing. */
  evidence: LiveDocumentationEvidenceConfig;
}

export type LiveDocumentationConfigInput = Partial<LiveDocumentationConfig> & {
  evidence?: Partial<LiveDocumentationEvidenceConfig>;
};

export const LIVE_DOCUMENTATION_DEFAULT_ROOT = ".mdmd";
export const LIVE_DOCUMENTATION_DEFAULT_BASE_LAYER = "layer-4";
export const LIVE_DOCUMENTATION_FILE_EXTENSION = ".mdmd.md";
export const LIVE_DOCUMENTATION_DEFAULT_GLOBS = [
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
  "scripts/**/*.ts",
  "scripts/**/*.tsx",
  "scripts/**/*.mjs",
  "scripts/**/*.cjs",
  "scripts/**/*.ps1",
  "scripts/**/*.psm1",
  "scripts/**/*.psd1",
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
  "tests/**/*.html",
  "tests/**/*.css",
  "tests/**/*.json"
];

export const DEFAULT_LIVE_DOCUMENTATION_CONFIG: LiveDocumentationConfig = {
  root: LIVE_DOCUMENTATION_DEFAULT_ROOT,
  baseLayer: LIVE_DOCUMENTATION_DEFAULT_BASE_LAYER,
  extension: LIVE_DOCUMENTATION_FILE_EXTENSION,
  glob: [...LIVE_DOCUMENTATION_DEFAULT_GLOBS],
  archetypeOverrides: {},
  requireRelativeLinks: true,
  slugDialect: "github",
  enableDocstringBridge: false,
  evidence: {
    strict: "warning"
  }
};

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

  const evidence: LiveDocumentationEvidenceConfig = {
    strict: input?.evidence?.strict ?? DEFAULT_LIVE_DOCUMENTATION_CONFIG.evidence.strict
  };

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
    evidence
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
