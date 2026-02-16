/**
 * A single public symbol extracted by a language adapter during Stage-0
 * processing. Carries the symbol's name and its syntactic kind (e.g.
 * `"function"`, `"class"`, `"interface"`).
 */
export interface Stage0Symbol {
  name: string;
  type: string;
}

/**
 * The complete output of a language adapter for one source file.
 *
 * Contains the extracted public symbols, resolved dependency paths,
 * external module references, and the document routing information
 * needed by the Live Doc generator.
 */
export interface Stage0Doc {
  sourcePath: string;
  docAbsolutePath: string;
  docRelativePath: string;
  archetype: string;
  dependencies: string[];
  externalModules: string[];
  publicSymbols: Stage0Symbol[];
}

/**
 * Logging interface injected into Stage-0 adapters to surface
 * non-fatal extraction warnings without coupling to a concrete logger.
 */
export interface Stage0DocLogger {
  warn(message: string): void;
}

/**
 * Shape of the test-target coverage manifest (`targets.json`).
 *
 * Each suite entry maps test files to the source paths and fixtures
 * they cover, powering the Observed Evidence section in Live Docs.
 */
export interface TargetManifest {
  suites?: Array<{
    suite?: string;
    kind?: string;
    tests?: Array<{
      path?: string;
      targets?: string[];
      fixtures?: string[];
    }>;
  }>;
}
