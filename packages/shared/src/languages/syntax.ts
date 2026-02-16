/**
 * Language Syntax Interface
 *
 * Provides a common interface for language-specific syntax processing utilities.
 * This interface is designed to be async-compatible from the ground up, enabling
 * future tree-sitter WASM integration without breaking changes.
 *
 * Used by:
 * - LanguageAdapters (production Live Docs generation)
 * - FallbackHeuristics (benchmark inference)
 * - Tree-sitter integration (future runtime union)
 *
 * @module languages/syntax
 */

/**
 * Comment delimiter configuration for a language.
 * Used for both regex-based stripping and tree-sitter traversal hints.
 */
export interface CommentDelimiters {
  /** Line comment starters (e.g., '//', '#') */
  line?: string[];
  /** Block comment pairs as [start, end] tuples */
  block?: [string, string][];
}

/**
 * String literal delimiter configuration for a language.
 */
export interface StringDelimiters {
  /** Standard string delimiters (e.g., ['"', "'"]) */
  standard?: string[];
  /** Raw/template string delimiters (e.g., ['`', '"""']) */
  raw?: string[];
}

/**
 * Language syntax configuration and utilities.
 *
 * Each supported language provides an implementation of this interface.
 * The interface is intentionally async-compatible to allow for tree-sitter
 * WASM integration in the future.
 */
export interface LanguageSyntax {
  /** Unique language identifier (e.g., 'go', 'csharp', 'typescript') */
  readonly id: string;

  /** File extensions this syntax applies to (e.g., ['.go'], ['.cs']) */
  readonly extensions: readonly string[];

  /** Comment delimiter configuration */
  readonly comments: CommentDelimiters;

  /** String literal delimiter configuration */
  readonly strings: StringDelimiters;

  /**
   * Fundamental framework/standard library types that every file typically uses.
   *
   * This is a **conservative** list containing ONLY ubiquitous types like
   * `string`, `int`, `bool`, `Task`, etc. Used to filter obvious noise when
   * detecting dependencies.
   *
   * **Note**: This is NOT for filtering tree-sitter results (tree-sitter has
   * zero false positives). This is only for C-style header dependency detection
   * where type references are heuristically matched.
   */
  readonly frameworkTypes: ReadonlySet<string>;

  /**
   * Strips comments from source code, preserving string literals.
   *
   * This is the primary utility for preventing false positive symbol matches
   * in comments and documentation. String literals are preserved because:
   * - Interpolated strings (e.g., `$"...{Code}..."`, `f"...{code}..."`, `` `...${code}...` ``)
   *   contain executable code that would be destroyed by naive string stripping
   * - Tree-sitter and SCIP have zero false positives and don't need stripping
   * - Heuristics/oracles need comment stripping to avoid doc comments, but
   *   strings rarely contain symbol-like patterns that cause false positives
   *
   * @param content - The source code content
   * @returns Content with comments removed, strings preserved (async-compatible)
   *
   * @remarks
   * The returned string may have different length than input due to removal.
   * For position-preserving stripping (e.g., for diagnostics), use a
   * space-replacement variant.
   */
  stripComments(content: string): Promise<string>;

  /**
   * Checks if an identifier is a fundamental framework/standard library type.
   *
   * @param identifier - The identifier to check
   * @returns True if the identifier is a fundamental type to filter as noise
   */
  isFrameworkType(identifier: string): boolean;
}

/**
 * Declarative configuration for creating a {@link LanguageSyntax} via
 * the {@link createLanguageSyntax} factory.
 *
 * All fields are pure data except the optional `stripComments` override.
 * When `stripComments` is omitted the factory defaults to C-style regex
 * stripping (`// …` line comments + `/* … * /` block comments), which is
 * correct for C, C#, Java, TypeScript, and Rust.
 */
export interface LanguageSyntaxConfig {
  readonly id: string;
  readonly extensions: readonly string[];
  readonly comments: CommentDelimiters;
  readonly strings: StringDelimiters;
  readonly frameworkTypes: ReadonlySet<string>;
  /**
   * Optional custom comment-stripping function.
   *
   * Provide this only for languages whose comment syntax differs from the
   * standard C-style `//` + `/* * /` pattern (e.g. Python's `#`, Ruby's
   * `=begin…=end`, PowerShell's `<# … #>`, or Go's string-aware walker).
   */
  readonly stripComments?: (content: string) => string;
}

/**
 * Strips C-style comments from source code.
 *
 * Removes:
 * - Block comments `/* … * /` (including JSDoc / Javadoc)
 * - Line comments `// …`
 *
 * String literals are **not** individually tracked because the regex
 * approach is intentionally coarse — tree-sitter provides the precise
 * path.  For heuristic usage the loss is acceptable and the simplicity
 * is a feature.
 *
 * Used as the default `stripComments` by {@link createLanguageSyntax}
 * for C, C#, Java, TypeScript, and Rust.
 */
export function stripCStyleComments(content: string): string {
  let result = content.replace(/\/\*[\s\S]*?\*\//g, " ");
  result = result.replace(/\/\/[^\n]*/g, " ");
  return result;
}

/**
 * Creates a {@link LanguageSyntax} implementation from declarative
 * configuration, eliminating per-language boilerplate.
 *
 * Default behaviours provided by the factory:
 * - **`stripComments`** — delegates to {@link stripCStyleComments} unless
 *   a custom stripper is supplied via `config.stripComments`.
 * - **`isFrameworkType`** — always delegates to
 *   `config.frameworkTypes.has(identifier)`.
 * - The async `Promise.resolve()` wrapper around the synchronous
 *   stripper, required by the interface's tree-sitter-ready signature.
 *
 * @param config - Pure-data language configuration
 * @returns A fully conformant {@link LanguageSyntax} object
 */
export function createLanguageSyntax(config: LanguageSyntaxConfig): LanguageSyntax {
  const stripper = config.stripComments ?? stripCStyleComments;
  return {
    id: config.id,
    extensions: config.extensions,
    comments: config.comments,
    strings: config.strings,
    frameworkTypes: config.frameworkTypes,
    async stripComments(content: string): Promise<string> {
      return await Promise.resolve(stripper(content));
    },
    isFrameworkType(identifier: string): boolean {
      return config.frameworkTypes.has(identifier);
    },
  };
}

/**
 * Creates a synchronous wrapper around the async stripComments method.
 *
 * This is provided for backward compatibility with existing synchronous code.
 * New code should prefer the async version when possible.
 *
 * **Important**: This relies on the fact that current regex-based implementations
 * resolve synchronously via `Promise.resolve()`. When tree-sitter implementations
 * are added, callers using this wrapper will need to migrate to async patterns.
 *
 * @param syntax - The LanguageSyntax implementation
 * @returns A synchronous stripping function
 */
export function createSyncStripper(
  syntax: LanguageSyntax
): (content: string) => string {
  // Note: This pattern works because current implementations use Promise.resolve()
  // which resolves synchronously within the same microtask.
  // When tree-sitter (truly async) is integrated, callers must use async patterns.
  return (content: string) => {
    let result: string | undefined;
    let error: Error | undefined;
    
    // Start the promise chain and capture result synchronously
    void syntax.stripComments(content)
      .then((r) => { result = r; })
      .catch((e: Error) => { error = e; });
    
    // For Promise.resolve-based implementations, result is set synchronously
    if (error !== undefined) {
      throw error;
    }
    if (result === undefined) {
      throw new Error(
        `LanguageSyntax '${syntax.id}' stripComments is truly async. ` +
          `Use the async version or await initialization.`
      );
    }
    return result;
  };
}

