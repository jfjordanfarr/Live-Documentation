/**
 * Language-specific Tree-sitter Node Type Configurations
 *
 * Each language has different AST node types for declarations and references.
 * This module provides the mapping for each supported language.
 *
 * @module treeSitter/languages
 */

/**
 * Configuration for extracting symbols and references from a language.
 */
export interface LanguageConfig {
  /** Language identifier (matches LANGUAGE_GRAMMAR_MAP keys) */
  id: string;

  /** Tree-sitter grammar name (e.g., "c-sharp", "go") */
  grammarName: string;

  /** Node types that represent symbol declarations */
  declarationTypes: string[];

  /** Node types that represent symbol references/usages */
  referenceTypes: string[];

  /** Field name to extract the symbol name from a declaration node */
  nameField: string;

  /** Symbols to ignore (stdlib types, common local variables) */
  ignoredSymbols: Set<string>;

  /**
   * Optional: Extract the symbol name from a declaration node.
   * If not provided, uses `node.childForFieldName(nameField)?.text`.
   */
  extractName?: (node: { childForFieldName: (name: string) => { text: string } | null }) => string | null;
}

// =============================================================================
// Go Configuration
// =============================================================================

const GO_IGNORED = new Set([
  // Single letters (lowercase)
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
  "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
  // Common Go variable names
  "ok", "err", "ctx", "req", "res", "buf", "out", "in", "key", "val",
  "url", "uri", "msg", "log", "tmp", "old", "new", "got", "want",
  "rv", "wg", "mu", "id", "fn", "tc", "tt", "ts",
  // Common test/domain names
  "route", "match", "matches", "query", "value", "request", "response",
  // Go stdlib types that cause false positives
  "Handler", "HandlerFunc", "Header", "Request", "Response", "ResponseWriter",
  "Client", "Server", "Transport", "Cookie", "Error",
  "URL", "Values",
  "NewRecorder", "NewRequest", "NewServer",
  "Print", "Printf", "Println", "Sprint", "Sprintf", "Sprintln",
  "Builder", "Reader", "Writer", "Closer", "ReadWriter",
  "Context", "Background", "TODO", "WithCancel", "WithTimeout", "WithValue",
  "New", "Is", "As", "Unwrap",
]);

const GO_CONFIG: LanguageConfig = {
  id: "go",
  grammarName: "go",
  declarationTypes: [
    "function_declaration",
    "method_declaration",
    "type_spec",
    "const_spec",
    "var_spec",
  ],
  referenceTypes: [
    "identifier",
    "type_identifier",
    "field_identifier",
  ],
  nameField: "name",
  ignoredSymbols: GO_IGNORED,
};

// =============================================================================
// C# Configuration
// =============================================================================

const CSHARP_IGNORED = new Set([
  // Single letters
  "i", "j", "k", "x", "y", "n", "s", "c", "t", "e", "o", "v", "r", "w",
  // Common variable names
  "value", "result", "item", "index", "count", "length", "type", "name",
  "key", "text", "data", "list", "array", "reader", "writer",
  // .NET Framework types
  "String", "Int32", "Int64", "Boolean", "Object", "Type", "Array",
  "Exception", "List", "Dictionary", "IEnumerable", "IList", "IDictionary",
  "Task", "Action", "Func", "Nullable", "DateTime", "TimeSpan", "Guid",
  "StringBuilder", "StringComparer", "StringComparison", "CultureInfo",
  "Stream", "TextReader", "TextWriter", "IDisposable", "IEquatable",
  "IComparable", "IFormatProvider", "IFormattable", "IConvertible",
  "EventArgs", "EventHandler", "Attribute", "Enum",
]);

const CSHARP_CONFIG: LanguageConfig = {
  id: "csharp",
  grammarName: "c-sharp",
  declarationTypes: [
    "class_declaration",
    "interface_declaration",
    "struct_declaration",
    "enum_declaration",
    "delegate_declaration",
    "record_declaration",
  ],
  referenceTypes: [
    "identifier",
    "generic_name",
  ],
  nameField: "name",
  ignoredSymbols: CSHARP_IGNORED,
};

// =============================================================================
// TypeScript Configuration
// =============================================================================

const TYPESCRIPT_IGNORED = new Set([
  // Common local names
  "i", "j", "k", "x", "y", "n", "s", "e", "v", "r", "w",
  "value", "result", "item", "index", "count", "length", "type", "name",
  "key", "data", "list", "array", "options", "config", "props", "state",
  // Built-in types
  "String", "Number", "Boolean", "Object", "Array", "Function",
  "Promise", "Map", "Set", "WeakMap", "WeakSet", "Symbol",
  "Error", "TypeError", "ReferenceError", "SyntaxError",
  "Date", "RegExp", "JSON", "Math", "console",
  "undefined", "null", "true", "false", "NaN", "Infinity",
  // DOM types
  "HTMLElement", "Element", "Node", "Document", "Window", "Event",
]);

const TYPESCRIPT_CONFIG: LanguageConfig = {
  id: "typescript",
  grammarName: "typescript",
  declarationTypes: [
    "class_declaration",
    "interface_declaration",
    "type_alias_declaration",
    "enum_declaration",
    "function_declaration",
  ],
  referenceTypes: [
    "identifier",
    "type_identifier",
  ],
  nameField: "name",
  ignoredSymbols: TYPESCRIPT_IGNORED,
};

// =============================================================================
// Python Configuration
// =============================================================================

const PYTHON_IGNORED = new Set([
  // Common local names
  "i", "j", "k", "x", "y", "n", "s", "e", "v", "r", "w", "f",
  "self", "cls", "args", "kwargs",
  "value", "result", "item", "index", "count", "length", "type", "name",
  "key", "data", "list", "dict", "set", "tuple",
  // Built-in types/functions
  "str", "int", "float", "bool", "list", "dict", "set", "tuple",
  "None", "True", "False", "object", "type", "super",
  "print", "len", "range", "enumerate", "zip", "map", "filter",
  "open", "file", "input", "output",
  "Exception", "ValueError", "TypeError", "KeyError", "IndexError",
]);

const PYTHON_CONFIG: LanguageConfig = {
  id: "python",
  grammarName: "python",
  declarationTypes: [
    "class_definition",
    "function_definition",
  ],
  referenceTypes: [
    "identifier",
  ],
  nameField: "name",
  ignoredSymbols: PYTHON_IGNORED,
};

// =============================================================================
// Java Configuration
// =============================================================================

const JAVA_IGNORED = new Set([
  // Common local names
  "i", "j", "k", "x", "y", "n", "s", "e", "v", "r", "w",
  "value", "result", "item", "index", "count", "length", "type", "name",
  "key", "data", "list", "array", "map", "set",
  // Built-in types
  "String", "Integer", "Long", "Double", "Float", "Boolean", "Character",
  "Object", "Class", "Void", "Throwable", "Exception", "Error",
  "List", "ArrayList", "LinkedList", "Map", "HashMap", "Set", "HashSet",
  "Collection", "Iterator", "Iterable", "Comparable", "Comparator",
  "System", "Math", "Runtime", "Thread", "Runnable",
  "Optional", "Stream", "Consumer", "Supplier", "Function", "Predicate",
]);

const JAVA_CONFIG: LanguageConfig = {
  id: "java",
  grammarName: "java",
  declarationTypes: [
    "class_declaration",
    "interface_declaration",
    "enum_declaration",
    "annotation_type_declaration",
    "record_declaration",
  ],
  referenceTypes: [
    "identifier",
    "type_identifier",
  ],
  nameField: "name",
  ignoredSymbols: JAVA_IGNORED,
};

// =============================================================================
// Rust Configuration
// =============================================================================

const RUST_IGNORED = new Set([
  // Common local names
  "i", "j", "k", "x", "y", "n", "s", "e", "v", "r", "w",
  "value", "result", "item", "index", "count", "len", "key", "data",
  "self", "Self",
  // Primitive types
  "bool", "char", "str", "i8", "i16", "i32", "i64", "i128", "isize",
  "u8", "u16", "u32", "u64", "u128", "usize", "f32", "f64",
  // Standard library types
  "String", "Vec", "Box", "Rc", "Arc", "Cell", "RefCell",
  "Option", "Result", "Some", "None", "Ok", "Err",
  "HashMap", "HashSet", "BTreeMap", "BTreeSet",
  "Iterator", "IntoIterator", "FromIterator",
  "Debug", "Display", "Clone", "Copy", "Default", "PartialEq", "Eq",
  "PartialOrd", "Ord", "Hash", "Send", "Sync",
]);

const RUST_CONFIG: LanguageConfig = {
  id: "rust",
  grammarName: "rust",
  declarationTypes: [
    "struct_item",
    "enum_item",
    "trait_item",
    "impl_item",
    "function_item",
    "type_item",
  ],
  referenceTypes: [
    "identifier",
    "type_identifier",
  ],
  nameField: "name",
  ignoredSymbols: RUST_IGNORED,
};

// =============================================================================
// Ruby Configuration
// =============================================================================

const RUBY_IGNORED = new Set([
  // Common local names
  "i", "j", "k", "x", "y", "n", "s", "e", "v", "r", "w",
  "self", "value", "result", "item", "index", "count", "key", "data",
  // Built-in types/modules
  "Object", "Class", "Module", "String", "Integer", "Float", "Array", "Hash",
  "Symbol", "Proc", "Lambda", "Method", "Binding",
  "NilClass", "TrueClass", "FalseClass",
  "Enumerable", "Comparable", "Kernel", "BasicObject",
  "Exception", "StandardError", "RuntimeError", "ArgumentError",
]);

const RUBY_CONFIG: LanguageConfig = {
  id: "ruby",
  grammarName: "ruby",
  declarationTypes: [
    "class",
    "module",
    "method",
    "singleton_method",
  ],
  referenceTypes: [
    "identifier",
    "constant",
  ],
  nameField: "name",
  ignoredSymbols: RUBY_IGNORED,
};

// =============================================================================
// Language Registry
// =============================================================================

const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  go: GO_CONFIG,
  csharp: CSHARP_CONFIG,
  cs: CSHARP_CONFIG,
  "c#": CSHARP_CONFIG,
  typescript: TYPESCRIPT_CONFIG,
  ts: TYPESCRIPT_CONFIG,
  javascript: TYPESCRIPT_CONFIG, // Use TS config for JS too
  js: TYPESCRIPT_CONFIG,
  python: PYTHON_CONFIG,
  py: PYTHON_CONFIG,
  java: JAVA_CONFIG,
  rust: RUST_CONFIG,
  rs: RUST_CONFIG,
  ruby: RUBY_CONFIG,
  rb: RUBY_CONFIG,
};

/**
 * Gets the language configuration for a given language ID.
 */
export function getLanguageConfig(languageId: string): LanguageConfig | undefined {
  return LANGUAGE_CONFIGS[languageId.toLowerCase()];
}

/**
 * Gets all supported language IDs.
 */
export function getSupportedLanguages(): string[] {
  return Object.keys(LANGUAGE_CONFIGS);
}
