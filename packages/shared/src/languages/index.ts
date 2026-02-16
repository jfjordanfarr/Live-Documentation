/**
 * Language Syntax Registry
 *
 * Central registry for language-specific syntax configurations.
 * Used by adapters, heuristics, and tree-sitter integration.
 *
 * @module languages
 */

import { cSyntax } from "./c";
import { csharpSyntax } from "./csharp";
import { goSyntax } from "./go";
import { javaSyntax } from "./java";
import { powershellSyntax } from "./powershell";
import { pythonSyntax } from "./python";
import { rubySyntax } from "./ruby";
import { rustSyntax } from "./rust";
import type { LanguageSyntax } from "./syntax";
import { typescriptSyntax } from "./typescript";

export type {
  LanguageSyntax,
  LanguageSyntaxConfig,
  CommentDelimiters,
  StringDelimiters,
} from "./syntax";

export { createSyncStripper, createLanguageSyntax, stripCStyleComments } from "./syntax";

export { cSyntax } from "./c";
export { csharpSyntax } from "./csharp";
export { goSyntax, GO_STDLIB_PACKAGES } from "./go";
export { javaSyntax } from "./java";
export { powershellSyntax } from "./powershell";
export { pythonSyntax, PYTHON_STDLIB_MODULES } from "./python";
export { rubySyntax } from "./ruby";
export { rustSyntax } from "./rust";
export { typescriptSyntax } from "./typescript";

/**
 * All registered language syntax configurations.
 */
const LANGUAGE_SYNTAXES: readonly LanguageSyntax[] = [
  goSyntax,
  cSyntax,
  csharpSyntax,
  typescriptSyntax,
  pythonSyntax,
  rustSyntax,
  rubySyntax,
  javaSyntax,
  powershellSyntax,
];

/**
 * Map from language ID to syntax configuration.
 */
const SYNTAX_BY_ID = new Map<string, LanguageSyntax>(
  LANGUAGE_SYNTAXES.map((syntax) => [syntax.id, syntax])
);

/**
 * Map from file extension to syntax configuration.
 */
const SYNTAX_BY_EXTENSION = new Map<string, LanguageSyntax>();
for (const syntax of LANGUAGE_SYNTAXES) {
  for (const ext of syntax.extensions) {
    SYNTAX_BY_EXTENSION.set(ext.toLowerCase(), syntax);
  }
}

/**
 * Gets a language syntax configuration by language ID.
 *
 * @param languageId - The language identifier (e.g., 'go', 'csharp')
 * @returns The syntax configuration, or undefined if not found
 */
export function getSyntaxById(languageId: string): LanguageSyntax | undefined {
  return SYNTAX_BY_ID.get(languageId.toLowerCase());
}

/**
 * Gets a language syntax configuration by file extension.
 *
 * @param extension - The file extension including dot (e.g., '.go', '.cs')
 * @returns The syntax configuration, or undefined if not found
 */
export function getSyntaxByExtension(extension: string): LanguageSyntax | undefined {
  return SYNTAX_BY_EXTENSION.get(extension.toLowerCase());
}

/**
 * Gets a language syntax configuration by file path.
 *
 * @param filePath - Path to the file
 * @returns The syntax configuration, or undefined if not found
 */
export function getSyntaxByPath(filePath: string): LanguageSyntax | undefined {
  const ext = filePath.toLowerCase().match(/\.[^./\\]+$/)?.[0];
  return ext ? getSyntaxByExtension(ext) : undefined;
}

/**
 * Gets all registered language syntax configurations.
 */
export function getAllSyntaxes(): readonly LanguageSyntax[] {
  return LANGUAGE_SYNTAXES;
}

/**
 * Checks if a language is supported.
 *
 * @param languageId - The language identifier
 */
export function isLanguageSupported(languageId: string): boolean {
  return SYNTAX_BY_ID.has(languageId.toLowerCase());
}

/**
 * Checks if a file extension is supported.
 *
 * @param extension - The file extension including dot
 */
export function isExtensionSupported(extension: string): boolean {
  return SYNTAX_BY_EXTENSION.has(extension.toLowerCase());
}

/**
 * Strips comments from content using the appropriate language syntax.
 * String literals are preserved to avoid destroying code in interpolated strings.
 *
 * @param filePath - Path to the file (used to determine language)
 * @param content - The source code content
 * @returns Stripped content, or original content if language not supported
 */
export async function stripCommentsForPath(
  filePath: string,
  content: string
): Promise<string> {
  const syntax = getSyntaxByPath(filePath);
  if (!syntax) {
    return content;
  }
  return syntax.stripComments(content);
}

/**
 * Checks if an identifier is a fundamental framework type for the given file's language.
 *
 * @param filePath - Path to the file (used to determine language)
 * @param identifier - The identifier to check
 * @returns True if the identifier is a framework type to filter as noise, false otherwise
 */
export function isFrameworkTypeForPath(filePath: string, identifier: string): boolean {
  const syntax = getSyntaxByPath(filePath);
  if (!syntax) {
    return false;
  }
  return syntax.isFrameworkType(identifier);
}

