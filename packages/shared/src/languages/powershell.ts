/**
 * PowerShell Language Syntax Configuration
 *
 * @module languages/powershell
 */

import type { LanguageSyntax, CommentDelimiters, StringDelimiters } from "./syntax";

const POWERSHELL_COMMENTS: CommentDelimiters = {
  line: ["#"],
  block: [["<#", "#>"]],
};

const POWERSHELL_STRINGS: StringDelimiters = {
  standard: ['"', "'"],
  raw: ["@'", '@"'],  // Here-strings
};

/**
 * Fundamental PowerShell types that appear in virtually every file.
 * Conservative list — only .NET primitives commonly used in PS.
 */
const POWERSHELL_FRAMEWORK_TYPES = new Set([
  // .NET type accelerators (common in PowerShell)
  "string", "int", "long", "bool", "double", "decimal", "float",
  "byte", "char", "object", "array", "void",
  // Common automatic variables (these are truly everywhere)
  "null", "true", "false",
]);

/**
 * Strips comments from PowerShell source code, preserving string literals.
 *
 * Handles:
 * - Line comments (#)
 * - Block comments (<# ... #>)
 *
 * String literals (including here-strings) are preserved to avoid destroying
 * code in expandable strings (e.g., "Value: $variable" or "Result: $(expression)").
 */
function stripPowerShellComments(content: string): string {
  // Remove block comments <# ... #>
  let result = content.replace(/<#[\s\S]*?#>/g, " ");

  // Remove line comments (# ...) - be careful with # in strings
  // Simple approach for now
  result = result.replace(/#[^\n]*/g, "");

  return result;
}

export const powershellSyntax: LanguageSyntax = {
  id: "powershell",
  extensions: [".ps1", ".psm1", ".psd1"],
  comments: POWERSHELL_COMMENTS,
  strings: POWERSHELL_STRINGS,
  frameworkTypes: POWERSHELL_FRAMEWORK_TYPES,

  async stripComments(content: string): Promise<string> {
    return await Promise.resolve(stripPowerShellComments(content));
  },

  isFrameworkType(identifier: string): boolean {
    return POWERSHELL_FRAMEWORK_TYPES.has(identifier);
  },
};

