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
   * Strips comments and string literals from source code.
   *
   * This is the primary utility for preventing false positive symbol matches
   * in comments, documentation, or string literals.
   *
   * @param content - The source code content
   * @returns Content with comments and strings removed (async-compatible)
   *
   * @remarks
   * The returned string may have different length than input due to removal.
   * For position-preserving stripping (e.g., for diagnostics), use a
   * space-replacement variant.
   */
  stripCommentsAndStrings(content: string): Promise<string>;

  /**
   * Checks if an identifier is a fundamental framework/standard library type.
   *
   * @param identifier - The identifier to check
   * @returns True if the identifier is a fundamental type to filter as noise
   */
  isFrameworkType(identifier: string): boolean;
}

/**
 * Creates a synchronous wrapper around the async stripCommentsAndStrings method.
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
    void syntax.stripCommentsAndStrings(content)
      .then((r) => { result = r; })
      .catch((e: Error) => { error = e; });
    
    // For Promise.resolve-based implementations, result is set synchronously
    if (error !== undefined) {
      throw error;
    }
    if (result === undefined) {
      throw new Error(
        `LanguageSyntax '${syntax.id}' stripCommentsAndStrings is truly async. ` +
          `Use the async version or await initialization.`
      );
    }
    return result;
  };
}

