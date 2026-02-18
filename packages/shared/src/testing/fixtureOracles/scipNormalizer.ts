/**
 * SCIP Edge Normalizer
 *
 * Language-specific normalizers that transform raw SCIP index edges into
 * clean, normalized expected.json edges. Each language's SCIP indexer has
 * its own quirks (cache paths, build artifacts, relation semantics) that
 * need to be filtered or remapped.
 *
 * This interface enables a functional composition approach where:
 * 1. scip-to-expected.ts parses the generic SCIP protobuf format
 * 2. Language-specific normalizers filter/transform edges
 * 3. Clean expected.json is produced
 */

/**
 * Raw edge extracted from SCIP index before normalization.
 */
export interface RawScipEdge {
  source: string;
  target: string;
  relation: "references" | "extends" | "implements";
  /** Optional symbol that caused this edge, for provenance tracking */
  provenanceSymbol?: string;
}

/**
 * Normalized edge ready for expected.json output.
 * Returning null from normalize() means the edge should be skipped.
 */
export interface NormalizedScipEdge {
  source: string;
  target: string;
  relation: "references" | "extends" | "implements";
}

/**
 * Language-specific SCIP normalizer interface.
 *
 * Each language that uses SCIP indexers should implement this interface
 * to handle its specific quirks:
 * - Go: filter go-build cache paths, handle same-package test→impl
 * - C#: filter obj/bin paths, handle assembly references
 * - TypeScript: filter node_modules paths, handle .d.ts references
 * - Java: filter target/build paths, handle generated sources
 */
export interface ScipNormalizer {
  /** Language identifier matching fixtures.manifest.json indexer field */
  readonly language: string;

  /**
   * Determine if a path is an artifact/cache path that should be excluded.
   * Examples: go-build cache, obj/, bin/, target/, node_modules/
   */
  isArtifactPath(filePath: string): boolean;

  /**
   * Normalize a single edge. Return null to skip the edge entirely.
   * Can also transform paths or relations if needed.
   */
  normalizeEdge(edge: RawScipEdge): NormalizedScipEdge | null;

  /**
   * Optional post-processing on the full edge set.
   * Useful for deduplication, sorting, or cross-edge analysis.
   */
  postProcess?(edges: NormalizedScipEdge[]): NormalizedScipEdge[];
}

/**
 * Creates a base normalizer with common filtering logic.
 * Language-specific normalizers can extend this.
 */
export function createBaseNormalizer(language: string): ScipNormalizer {
  return {
    language,

    isArtifactPath(filePath: string): boolean {
      // Common artifact patterns across languages
      const artifactPatterns = [
        /^\.\.\//, // Any relative path escaping the project
        /node_modules\//,
        /\.git\//,
      ];
      return artifactPatterns.some((p) => p.test(filePath));
    },

    normalizeEdge(edge: RawScipEdge): NormalizedScipEdge | null {
      // Skip edges with empty source (package-level symbols)
      if (!edge.source) {
        return null;
      }

      // Skip if either path is an artifact
      if (this.isArtifactPath(edge.source) || this.isArtifactPath(edge.target)) {
        return null;
      }

      // Skip self-references
      if (edge.source === edge.target) {
        return null;
      }

      return {
        source: edge.source,
        target: edge.target,
        relation: edge.relation,
      };
    },
  };
}

// ============================================================================
// Go SCIP Normalizer
// ============================================================================

function createGoScipNormalizer(): ScipNormalizer {
  const base = createBaseNormalizer("go");

  return {
    ...base,

    isArtifactPath(filePath: string): boolean {
      // Go-specific artifact paths
      if (filePath.includes("go-build/")) {
        return true;
      }
      if (filePath.includes("/vendor/")) {
        return true;
      }
      // Delegate to base for common patterns
      return base.isArtifactPath(filePath);
    },
  };
}

// ============================================================================
// C# SCIP Normalizer
// ============================================================================

function createCSharpScipNormalizer(): ScipNormalizer {
  const base = createBaseNormalizer("csharp");

  return {
    ...base,

    isArtifactPath(filePath: string): boolean {
      // C#-specific artifact paths
      if (/\/(obj|bin)\//.test(filePath)) {
        return true;
      }
      // Assembly references (DLLs in nuget packages, etc.)
      if (filePath.endsWith(".dll")) {
        return true;
      }
      return base.isArtifactPath(filePath);
    },
  };
}

// ============================================================================
// TypeScript SCIP Normalizer
// ============================================================================

function createTypeScriptScipNormalizer(): ScipNormalizer {
  const base = createBaseNormalizer("typescript");

  return {
    ...base,

    isArtifactPath(filePath: string): boolean {
      // TypeScript-specific: node_modules, dist/, .d.ts in packages
      if (filePath.includes("node_modules/")) {
        return true;
      }
      if (/\/(dist|build|out)\//.test(filePath)) {
        return true;
      }
      return base.isArtifactPath(filePath);
    },
  };
}

// ============================================================================
// Java SCIP Normalizer
// ============================================================================

function createJavaScipNormalizer(): ScipNormalizer {
  const base = createBaseNormalizer("java");

  return {
    ...base,

    isArtifactPath(filePath: string): boolean {
      // Java-specific: target/, build/, generated-sources/
      if (/\/(target|build)\//.test(filePath)) {
        return true;
      }
      if (filePath.includes("generated-sources/")) {
        return true;
      }
      return base.isArtifactPath(filePath);
    },
  };
}

// ============================================================================
// Python SCIP Normalizer
// ============================================================================

function createPythonScipNormalizer(): ScipNormalizer {
  const base = createBaseNormalizer("python");

  return {
    ...base,

    isArtifactPath(filePath: string): boolean {
      // Python-specific: __pycache__, .pyc, venv/, .venv/
      if (filePath.includes("__pycache__/")) {
        return true;
      }
      if (filePath.endsWith(".pyc")) {
        return true;
      }
      if (/\/(\.?venv|site-packages)\//.test(filePath)) {
        return true;
      }
      return base.isArtifactPath(filePath);
    },
  };
}

// ============================================================================
// Rust SCIP Normalizer
// ============================================================================

function createRustScipNormalizer(): ScipNormalizer {
  const base = createBaseNormalizer("rust");

  return {
    ...base,

    isArtifactPath(filePath: string): boolean {
      // Rust-specific: target/ build output directory
      if (/\/(target)\//i.test(filePath)) {
        return true;
      }
      // Cargo registry paths
      if (filePath.includes(".cargo/registry/")) {
        return true;
      }
      return base.isArtifactPath(filePath);
    },
  };
}

// ============================================================================
// Registry
// ============================================================================

const NORMALIZER_REGISTRY: Record<string, () => ScipNormalizer> = {
  go: createGoScipNormalizer,
  csharp: createCSharpScipNormalizer,
  typescript: createTypeScriptScipNormalizer,
  java: createJavaScipNormalizer,
  python: createPythonScipNormalizer,
  rust: createRustScipNormalizer,
};

/**
 * Get the SCIP normalizer for a given language.
 * Falls back to base normalizer for unsupported languages.
 */
export function getScipNormalizer(language: string): ScipNormalizer {
  const factory = NORMALIZER_REGISTRY[language];
  if (factory) {
    return factory();
  }
  // Fallback to base normalizer
  return createBaseNormalizer(language);
}

/**
 * Process a batch of raw SCIP edges through a normalizer.
 */
export function normalizeScipEdges(
  edges: RawScipEdge[],
  normalizer: ScipNormalizer
): NormalizedScipEdge[] {
  const normalized: NormalizedScipEdge[] = [];

  for (const edge of edges) {
    const result = normalizer.normalizeEdge(edge);
    if (result !== null) {
      normalized.push(result);
    }
  }

  // Apply post-processing if defined
  if (normalizer.postProcess) {
    return normalizer.postProcess(normalized);
  }

  return normalized;
}
