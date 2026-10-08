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

export { cSyntax } from "./c";
export { csharpSyntax } from "./csharp";
export { goSyntax } from "./go";
export { javaSyntax } from "./java";
export { pythonSyntax } from "./python";
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


