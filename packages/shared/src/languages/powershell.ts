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
 * Common PowerShell identifiers to ignore.
 */
const POWERSHELL_IGNORED_IDENTIFIERS = new Set([
  // Common local names
  "i", "j", "k", "x", "y", "n", "s", "e", "v", "r", "w",

  // Common variable names
  "value", "result", "item", "index", "count", "length", "size",
  "key", "data", "name", "type", "path", "file", "args",

  // Automatic variables
  "_", "PSItem", "null", "true", "false",
  "Error", "ErrorActionPreference", "VerbosePreference",
  "PSScriptRoot", "PSCommandPath", "MyInvocation",

  // Common cmdlet nouns (as identifiers)
  "Object", "Item", "Content", "ChildItem", "Process", "Service",
  "Module", "Command", "Variable", "Function", "Alias",
]);

/**
 * Strips comments and string literals from PowerShell source code.
 *
 * Handles:
 * - Line comments (#)
 * - Block comments (<# ... #>)
 * - Single and double quoted strings
 * - Here-strings (@'...'@ and @"..."@)
 */
function stripPowerShellCommentsAndStrings(content: string): string {
  // Remove block comments <# ... #>
  let result = content.replace(/<#[\s\S]*?#>/g, " ");

  // Remove here-strings @'...'@ and @"..."@
  result = result.replace(/@'[\s\S]*?'@/g, '""');
  result = result.replace(/@"[\s\S]*?"@/g, '""');

  // Remove line comments (# ...)
  result = result.replace(/#[^\n]*/g, "");

  // Remove string literals "..." and '...'
  result = result.replace(/"(?:[^"\\]|\\.)*"/g, '""');
  result = result.replace(/'(?:[^'])*'/g, "''");

  return result;
}

export const powershellSyntax: LanguageSyntax = {
  id: "powershell",
  extensions: [".ps1", ".psm1", ".psd1"],
  comments: POWERSHELL_COMMENTS,
  strings: POWERSHELL_STRINGS,
  ignoredIdentifiers: POWERSHELL_IGNORED_IDENTIFIERS,

  async stripCommentsAndStrings(content: string): Promise<string> {
    return await Promise.resolve(stripPowerShellCommentsAndStrings(content));
  },

  isIgnoredIdentifier(identifier: string): boolean {
    return POWERSHELL_IGNORED_IDENTIFIERS.has(identifier);
  },
};

