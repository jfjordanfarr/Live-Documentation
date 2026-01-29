/**
 * Java Language Syntax Configuration
 *
 * @module languages/java
 */

import type { LanguageSyntax, CommentDelimiters, StringDelimiters } from "./syntax";

const JAVA_COMMENTS: CommentDelimiters = {
  line: ["//"],
  block: [["/*", "*/"], ["/**", "*/"]],  // Includes Javadoc
};

const JAVA_STRINGS: StringDelimiters = {
  standard: ['"'],
  raw: ['"""'],  // Text blocks (Java 15+)
};

/**
 * Common Java identifiers to ignore.
 *
 * Combined from:
 * - packages/shared/src/inference/treeSitter/languages.ts (JAVA_IGNORED)
 * - Common JDK types
 */
const JAVA_IGNORED_IDENTIFIERS = new Set([
  // Common local names
  "i", "j", "k", "x", "y", "n", "s", "e", "v", "r", "w",
  "value", "result", "item", "index", "count", "length", "type", "name",
  "key", "data", "list", "array", "map", "set",

  // Built-in types
  "String", "Integer", "Long", "Double", "Float", "Boolean", "Character",
  "Object", "Class", "Enum", "Number", "Void",
  "List", "Map", "Set", "Collection", "Iterable", "Iterator",
  "ArrayList", "HashMap", "HashSet", "LinkedList", "TreeMap", "TreeSet",
  "Optional", "Stream", "Collectors",
  "Exception", "RuntimeException", "Error", "Throwable",
  "IOException", "IllegalArgumentException", "NullPointerException",
  "Thread", "Runnable", "Callable", "Future", "CompletableFuture",
  "StringBuilder", "StringBuffer", "Comparable", "Comparator",
]);

/**
 * Strips comments and string literals from Java source code.
 *
 * Handles:
 * - Line comments (//)
 * - Block comments (/* ... *\/)
 * - Javadoc comments (/** ... *\/)
 * - Standard strings ("...")
 * - Text blocks ("""...""" - Java 15+)
 */
function stripJavaCommentsAndStrings(content: string): string {
  // Remove text blocks first (Java 15+)
  let result = content.replace(/"""[\s\S]*?"""/g, '""');

  // Remove block comments /* ... */ (including Javadoc)
  result = result.replace(/\/\*[\s\S]*?\*\//g, " ");

  // Remove line comments // ...
  result = result.replace(/\/\/[^\n]*/g, " ");

  // Remove string literals "..."
  result = result.replace(/"(?:[^"\\]|\\.)*"/g, '""');

  return result;
}

export const javaSyntax: LanguageSyntax = {
  id: "java",
  extensions: [".java"],
  comments: JAVA_COMMENTS,
  strings: JAVA_STRINGS,
  ignoredIdentifiers: JAVA_IGNORED_IDENTIFIERS,

  async stripCommentsAndStrings(content: string): Promise<string> {
    return await Promise.resolve(stripJavaCommentsAndStrings(content));
  },

  isIgnoredIdentifier(identifier: string): boolean {
    return JAVA_IGNORED_IDENTIFIERS.has(identifier);
  },
};

