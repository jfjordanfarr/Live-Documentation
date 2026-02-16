/**
 * Python Language Syntax Configuration
 *
 * Provides comment delimiters, string delimiters (including docstrings,
 * raw strings, and f-strings), framework type filtering, and a
 * string-aware `#` comment stripper for Python source files.
 *
 * @module languages/python
 */

import { createLanguageSyntax } from "./syntax";
import type { CommentDelimiters, StringDelimiters } from "./syntax";

const PYTHON_COMMENTS: CommentDelimiters = {
  line: ["#"],
  block: [],  // Python uses docstrings, not block comments
};

const PYTHON_STRINGS: StringDelimiters = {
  standard: ['"', "'"],
  raw: ['"""', "'''", 'r"', "r'", 'f"', "f'"],  // Docstrings, raw strings, f-strings
};

/**
 * Known Python standard library modules that should not be resolved to local files.
 *
 * @remarks
 * This is a representative subset; full stdlib enumeration would be extensive.
 * We include the most common modules to avoid false positive resolution attempts.
 */
export const PYTHON_STDLIB_MODULES = new Set([
  // Built-in modules
  "abc", "aifc", "argparse", "array", "ast", "asynchat", "asyncio", "asyncore",
  "atexit", "audioop", "base64", "bdb", "binascii", "binhex", "bisect",
  "builtins", "bz2", "calendar", "cgi", "cgitb", "chunk", "cmath", "cmd",
  "code", "codecs", "codeop", "collections", "colorsys", "compileall",
  "concurrent", "configparser", "contextlib", "contextvars", "copy", "copyreg",
  "cProfile", "crypt", "csv", "ctypes", "curses", "dataclasses", "datetime",
  "dbm", "decimal", "difflib", "dis", "distutils", "doctest", "email",
  "encodings", "enum", "errno", "faulthandler", "fcntl", "filecmp", "fileinput",
  "fnmatch", "fractions", "ftplib", "functools", "gc", "getopt", "getpass",
  "gettext", "glob", "graphlib", "grp", "gzip", "hashlib", "heapq", "hmac",
  "html", "http", "idlelib", "imaplib", "imghdr", "imp", "importlib", "inspect",
  "io", "ipaddress", "itertools", "json", "keyword", "lib2to3", "linecache",
  "locale", "logging", "lzma", "mailbox", "mailcap", "marshal", "math",
  "mimetypes", "mmap", "modulefinder", "multiprocessing", "netrc", "nis",
  "nntplib", "numbers", "operator", "optparse", "os", "ossaudiodev", "pathlib",
  "pdb", "pickle", "pickletools", "pipes", "pkgutil", "platform", "plistlib",
  "poplib", "posix", "posixpath", "pprint", "profile", "pstats", "pty", "pwd",
  "py_compile", "pyclbr", "pydoc", "queue", "quopri", "random", "re",
  "readline", "reprlib", "resource", "rlcompleter", "runpy", "sched", "secrets",
  "select", "selectors", "shelve", "shlex", "shutil", "signal", "site",
  "smtpd", "smtplib", "sndhdr", "socket", "socketserver", "spwd", "sqlite3",
  "ssl", "stat", "statistics", "string", "stringprep", "struct", "subprocess",
  "sunau", "symtable", "sys", "sysconfig", "syslog", "tabnanny", "tarfile",
  "telnetlib", "tempfile", "termios", "test", "textwrap", "threading", "time",
  "timeit", "tkinter", "token", "tokenize", "trace", "traceback", "tracemalloc",
  "tty", "turtle", "turtledemo", "types", "typing", "typing_extensions",
  "unicodedata", "unittest", "urllib", "uu", "uuid", "venv", "warnings",
  "wave", "weakref", "webbrowser", "winreg", "winsound", "wsgiref", "xdrlib",
  "xml", "xmlrpc", "zipapp", "zipfile", "zipimport", "zlib",
  // Common third-party that we definitely can't resolve
  "numpy", "pandas", "scipy", "matplotlib", "requests", "flask", "django",
  "pytest", "setuptools", "pip", "wheel", "six", "certifi", "urllib3",
  "idna", "charset_normalizer", "packaging", "attrs", "click", "jinja2",
  "markupsafe", "werkzeug", "pyyaml", "yaml", "toml", "tomli", "sqlalchemy",
  "pydantic", "fastapi", "starlette", "httpx", "aiohttp", "celery", "redis",
  "boto3", "botocore", "google", "azure", "aws", "tensorflow", "torch",
  "sklearn", "cv2", "PIL", "pillow"
]);

/**
 * Fundamental Python types that appear in virtually every file.
 * Conservative list — only built-in type names.
 */
const PYTHON_FRAMEWORK_TYPES = new Set([
  // Built-in types
  "str", "int", "float", "bool", "complex",
  "list", "dict", "set", "frozenset", "tuple",
  "bytes", "bytearray", "memoryview",
  "object", "type",
  // Constants
  "None", "True", "False", "Ellipsis", "NotImplemented",
]);

/**
 * Strips comments from Python source code, preserving string literals.
 *
 * Handles:
 * - Line comments (#)
 *
 * String literals (including f-strings) are preserved to avoid destroying
 * code in formatted strings (e.g., f"Value: {expression}").
 *
 * Note: Triple-quoted strings used as docstrings are preserved because they
 * are technically string literals and may contain code examples.
 */
function stripPythonComments(content: string): string {
  // Remove line comments (# ...)
  // Be careful not to match # inside strings - use a simple approach
  // that splits by lines and handles each line
  const lines = content.split('\n');
  const result = lines.map(line => {
    // Find # that's not inside a string
    let inString = false;
    let stringChar = '';
    let tripleQuote = false;
    let i = 0;
    
    while (i < line.length) {
      // Check for triple quotes
      if (!inString && (line.slice(i, i + 3) === '"""' || line.slice(i, i + 3) === "'''")) {
        inString = true;
        tripleQuote = true;
        stringChar = line.slice(i, i + 3);
        i += 3;
        continue;
      }
      
      // Check for closing triple quotes
      if (inString && tripleQuote && line.slice(i, i + 3) === stringChar) {
        inString = false;
        tripleQuote = false;
        i += 3;
        continue;
      }
      
      // Check for single/double quotes (not triple)
      if (!inString && (line[i] === '"' || line[i] === "'")) {
        // Make sure it's not a triple quote
        if (line.slice(i, i + 3) !== '"""' && line.slice(i, i + 3) !== "'''") {
          inString = true;
          stringChar = line[i];
          i++;
          continue;
        }
      }
      
      // Check for closing single quote
      if (inString && !tripleQuote && line[i] === stringChar) {
        inString = false;
        i++;
        continue;
      }
      
      // Handle escapes inside strings
      if (inString && line[i] === '\\' && i + 1 < line.length) {
        i += 2;
        continue;
      }
      
      // Check for comment start
      if (!inString && line[i] === '#') {
        return line.slice(0, i);
      }
      
      i++;
    }
    
    return line;
  });
  
  return result.join('\n');
}

/**
 * Python language syntax configuration.
 *
 * Covers `.py` and `.pyw` extensions.  Uses a line-by-line
 * string-aware comment stripper because Python's `#` comment character
 * can appear inside string literals.
 */
export const pythonSyntax = createLanguageSyntax({
  id: "python",
  extensions: [".py", ".pyw"],
  comments: PYTHON_COMMENTS,
  strings: PYTHON_STRINGS,
  frameworkTypes: PYTHON_FRAMEWORK_TYPES,
  stripComments: stripPythonComments,
});

