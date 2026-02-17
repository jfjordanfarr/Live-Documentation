import fs from "node:fs";
import path from "node:path";

/**
 * Tri-state severity for SlopCop diagnostic rules.
 *
 * - `"off"` — rule is disabled
 * - `"warn"` — violations are reported as warnings
 * - `"error"` — violations are reported as errors (fails CI)
 */
export type SeveritySetting = "off" | "warn" | "error";

/**
 * Shared configuration applicable to any SlopCop audit section
 * (markdown, assets, or symbols).
 */
export interface SlopcopConfigSection {
  /** Glob patterns identifying files to include in the audit. */
  includeGlobs?: string[];
  /** Glob patterns identifying files to exclude from the audit. */
  ignoreGlobs?: string[];
  /** Regex patterns for link targets to suppress as violations. */
  ignoreTargets?: string[];
  /** Additional root directories for link resolution. */
  rootDirectories?: string[];
}

/**
 * Extended section config for the symbol auditor, which has additional
 * severity knobs for duplicate headings and missing anchors.
 */
export interface SlopcopSymbolConfig extends SlopcopConfigSection {
  /** Whether the symbol audit is enabled at all. Defaults to `false`. */
  enabled?: boolean;
  /** Severity for duplicate heading slugs within a single file. */
  duplicateHeadingSeverity?: SeveritySetting;
  /** Severity for link targets that reference missing anchors. */
  missingAnchorSeverity?: SeveritySetting;
}

/**
 * Top-level SlopCop configuration, typically loaded from `slopcop.config.json`
 * at the workspace root.
 *
 * Global fields (`ignoreGlobs`, `ignoreTargets`, `rootDirectories`) are
 * merged into every section. Per-section overrides refine behaviour for
 * markdown link, asset reference, and symbol anchor audits respectively.
 */
export interface SlopcopConfig {
  /** Glob patterns to ignore across all sections. */
  ignoreGlobs?: string[];
  /** Regex patterns for link targets to suppress across all sections. */
  ignoreTargets?: string[];
  /** Additional root directories for link resolution across all sections. */
  rootDirectories?: string[];
  /** Configuration for the markdown relative-link auditor. */
  markdown?: SlopcopConfigSection;
  /** Configuration for the HTML/CSS asset reference auditor. */
  assets?: SlopcopConfigSection;
  /** Configuration for the heading/anchor symbol auditor. */
  symbols?: SlopcopSymbolConfig;
  /** Allows forward-compatible unknown keys. */
  [key: string]: unknown;
}

/** Default filename for the SlopCop configuration file. */
export const CONFIG_FILE_NAME = "slopcop.config.json";

type SectionKey = "markdown" | "assets" | "symbols";

/**
 * Loads and normalises a SlopCop configuration from disk.
 *
 * If no `overridePath` is given, looks for `slopcop.config.json` in the
 * workspace root. Returns an empty config object when the default file
 * is absent; throws if an explicit override path is missing.
 *
 * @param workspaceRoot - Absolute path to the workspace root.
 * @param overridePath - Optional explicit path to a config file.
 */
export function loadSlopcopConfig(workspaceRoot: string, overridePath?: string): SlopcopConfig {
  const resolvedPath = overridePath ? path.resolve(overridePath) : path.join(workspaceRoot, CONFIG_FILE_NAME);
  if (!fs.existsSync(resolvedPath)) {
    if (overridePath) {
      throw new Error(`Configuration file not found: ${resolvedPath}`);
    }
    return {};
  }

  try {
    const raw = fs.readFileSync(resolvedPath, "utf8");
    const parsed = JSON.parse(raw);
    if (!isPlainObject(parsed)) {
      throw new Error("Configuration must be an object");
    }

    return normalizeConfig(parsed as Record<string, unknown>);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read ${CONFIG_FILE_NAME}: ${message}`);
  }
}

/**
 * Merges global and section-level ignore globs with built-in defaults.
 *
 * @param config - The loaded SlopCop config.
 * @param section - Which audit section to resolve globs for.
 * @param defaults - Built-in ignore globs always applied.
 * @returns Combined array of ignore glob patterns.
 */
export function resolveIgnoreGlobs(
  config: SlopcopConfig,
  section: SectionKey,
  defaults: string[]
): string[] {
  const globalExtras = config.ignoreGlobs ?? [];
  const sectionExtras = config[section]?.ignoreGlobs ?? [];
  return [...defaults, ...globalExtras, ...sectionExtras];
}

/**
 * Resolves include globs for a section, falling back to defaults
 * when no section-level overrides are configured.
 *
 * @param config - The loaded SlopCop config.
 * @param section - Which audit section to resolve globs for.
 * @param defaults - Built-in include globs used when the section has none.
 * @returns Array of include glob patterns.
 */
export function resolveIncludeGlobs(
  config: SlopcopConfig,
  section: SectionKey,
  defaults: string[]
): string[] {
  const include = config[section]?.includeGlobs;
  if (Array.isArray(include) && include.length > 0) {
    return include.map(String);
  }
  return defaults;
}

/**
 * Compiles global and section-level `ignoreTargets` strings into RegExp
 * instances for link-target matching.
 *
 * Throws if any pattern string is an invalid regular expression.
 *
 * @param config - The loaded SlopCop config.
 * @param section - Which audit section to compile patterns for.
 * @returns Array of compiled RegExp ignore patterns.
 */
export function compileIgnorePatterns(
  config: SlopcopConfig,
  section: SectionKey
): RegExp[] {
  const patterns: string[] = [];
  if (Array.isArray(config.ignoreTargets)) {
    patterns.push(...config.ignoreTargets.map(String));
  }
  const sectionPatterns = config[section]?.ignoreTargets;
  if (Array.isArray(sectionPatterns)) {
    patterns.push(...sectionPatterns.map(String));
  }

  const compiled: RegExp[] = [];
  for (const pattern of patterns) {
    try {
      compiled.push(new RegExp(pattern));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid ignore pattern "${pattern}": ${message}`);
    }
  }
  return compiled;
}

/**
 * Collects root directories from both global and section-level config.
 *
 * These directories are used as additional resolution roots when
 * checking relative link targets.
 *
 * @param config - The loaded SlopCop config.
 * @param section - Which audit section to resolve roots for.
 * @returns Array of additional root directory paths.
 */
export function resolveRootDirectories(
  config: SlopcopConfig,
  section: SectionKey
): string[] {
  const directories: string[] = [];
  if (Array.isArray(config.rootDirectories)) {
    directories.push(...config.rootDirectories.map(String));
  }
  const sectionDirectories = config[section]?.rootDirectories;
  if (Array.isArray(sectionDirectories)) {
    directories.push(...sectionDirectories.map(String));
  }
  return directories;
}

function normalizeConfig(raw: Record<string, unknown>): SlopcopConfig {
  const normalized: SlopcopConfig = {};

  if (Array.isArray(raw.ignoreGlobs)) {
    normalized.ignoreGlobs = raw.ignoreGlobs.map(String);
  }
  if (Array.isArray(raw.ignoreTargets)) {
    normalized.ignoreTargets = raw.ignoreTargets.map(String);
  }
  if (Array.isArray(raw.rootDirectories)) {
    normalized.rootDirectories = raw.rootDirectories.map(String);
  }

  if (isPlainObject(raw.markdown)) {
    normalized.markdown = normalizeSection(raw.markdown as Record<string, unknown>);
  }
  if (isPlainObject(raw.assets)) {
    normalized.assets = normalizeSection(raw.assets as Record<string, unknown>);
  }
  if (isPlainObject(raw.symbols)) {
    normalized.symbols = normalizeSymbolSection(raw.symbols as Record<string, unknown>);
  }

  return normalized;
}

function normalizeSection(section: Record<string, unknown>): SlopcopConfigSection {
  const normalized: SlopcopConfigSection = {};

  if (Array.isArray(section.includeGlobs)) {
    normalized.includeGlobs = section.includeGlobs.map(String);
  }
  if (Array.isArray(section.ignoreGlobs)) {
    normalized.ignoreGlobs = section.ignoreGlobs.map(String);
  }
  if (Array.isArray(section.ignoreTargets)) {
    normalized.ignoreTargets = section.ignoreTargets.map(String);
  }
  if (Array.isArray(section.rootDirectories)) {
    normalized.rootDirectories = section.rootDirectories.map(String);
  }

  return normalized;
}

function normalizeSymbolSection(section: Record<string, unknown>): SlopcopSymbolConfig {
  const base = normalizeSection(section);
  const normalized: SlopcopSymbolConfig = { ...base };

  if (typeof section.enabled === "boolean") {
    normalized.enabled = section.enabled;
  }

  if (section.duplicateHeadingSeverity !== undefined) {
    normalized.duplicateHeadingSeverity = normalizeSeverity(
      section.duplicateHeadingSeverity,
      "duplicateHeadingSeverity"
    );
  }

  if (section.missingAnchorSeverity !== undefined) {
    normalized.missingAnchorSeverity = normalizeSeverity(
      section.missingAnchorSeverity,
      "missingAnchorSeverity"
    );
  }

  return normalized;
}

function normalizeSeverity(value: unknown, field: string): SeveritySetting {
  if (typeof value !== "string") {
    throw new Error(`${field} must be a string severity (off|warn|error)`);
  }

  const normalized = value.toLowerCase();
  if (normalized === "warning") {
    return "warn";
  }

  if (normalized === "off" || normalized === "warn" || normalized === "error") {
    return normalized;
  }

  throw new Error(`${field} must be one of: off, warn, error`);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
