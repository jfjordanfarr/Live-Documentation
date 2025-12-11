import { promises as fs } from "node:fs";

import type {
  DependencyEntry,
  PublicSymbolEntry,
  SourceAnalysisResult,
  TypeReference
} from "../core";
import type { LanguageAdapter } from "./index";
import { parseDocstring } from "./python.docstring";

interface DependencyBucket {
  specifier: string;
  symbols: Set<string>;
}

// Captures: [1] indent, [2] keyword, [3] name, [4] base classes (optional)
const TOP_LEVEL_PATTERN = /^([ \t]*)(async\s+def|def|class)\s+([A-Za-z_][A-Za-z0-9_]*)(?:\(([^)]+)\))?/;
const DECORATOR_PATTERN = /^\s*@/;

/**
 * Language adapter that extracts public symbols and docstring metadata from Python modules.
 *
 * @remarks
 * The adapter recognises reStructuredText, Google, and NumPy-style docstring conventions
 * to populate Live Doc summaries, parameter tables, and inline examples without relying
 * on Python runtime introspection.
 */
export const pythonAdapter: LanguageAdapter = {
  id: "python-basic",
  extensions: [".py"],
  async analyze({ absolutePath }): Promise<SourceAnalysisResult | null> {
    const content = await fs.readFile(absolutePath, "utf8");
    const symbols = extractSymbols(content);
    const dependencies = extractDependencies(content);

    if (symbols.length === 0 && dependencies.length === 0) {
      return {
        symbols: [],
        dependencies: []
      };
    }

    return {
      symbols,
      dependencies
    };
  }
};

function extractSymbols(content: string): PublicSymbolEntry[] {
  const lines = content.split(/\r?\n/);
  const results: PublicSymbolEntry[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (DECORATOR_PATTERN.test(line)) {
      continue;
    }

    const match = TOP_LEVEL_PATTERN.exec(line);
    TOP_LEVEL_PATTERN.lastIndex = 0;
    if (!match) {
      continue;
    }

    const indent = match[1] ?? "";
    if (indent.trim().length > 0) {
      continue;
    }

    const keyword = match[2];
    const name = match[3];
    const baseClasses = match[4];
    const kind = keyword.includes("class") ? "class" : "function";
    const docstring = extractDocstring(lines, index);
    const documentation = docstring ? parseDocstring(docstring) : undefined;

    // Extract type references from base classes for class definitions
    let typeReferences: TypeReference[] | undefined;
    if (kind === "class" && baseClasses) {
      const bases = baseClasses
        .split(",")
        .map(b => b.trim())
        .filter(b => b && !b.includes("=")) // Exclude keyword args like metaclass=
        .map(b => b.split("[")[0].trim()); // Strip generic params like List[int]
      
      if (bases.length > 0) {
        typeReferences = bases.map(baseName => ({
          name: baseName,
          role: "extends" as const
        }));
      }
    }

    results.push({
      name,
      kind,
      location: {
        line: index + 1,
        character: indent.length + 1
      },
      documentation,
      typeReferences
    } as PublicSymbolEntry);
  }

  results.sort((left, right) => {
    const lineDiff = (left.location?.line ?? 0) - (right.location?.line ?? 0);
    if (lineDiff !== 0) {
      return lineDiff;
    }
    const charDiff = (left.location?.character ?? 0) - (right.location?.character ?? 0);
    if (charDiff !== 0) {
      return charDiff;
    }
    return left.name.localeCompare(right.name);
  });

  return results;
}

function extractDocstring(lines: string[], definitionIndex: number): string | undefined {
  let cursor = definitionIndex + 1;
  while (cursor < lines.length) {
    const raw = lines[cursor];
    if (!raw.trim()) {
      cursor += 1;
      continue;
    }

    const trimmed = raw.trim();
    const quote = detectTripleQuote(trimmed);
    if (!quote) {
      return undefined;
    }

    const closingIndex = trimmed.indexOf(quote, quote.length);
    if (closingIndex >= 0) {
      const inner = trimmed.slice(quote.length, closingIndex);
      const normalizedInline = normalizeDocstring(inner);
      return normalizedInline || undefined;
    }

    const accumulator: string[] = [];
    accumulator.push(trimmed.slice(quote.length));
    cursor += 1;
    while (cursor < lines.length) {
      const candidate = lines[cursor];
      const closePos = candidate.indexOf(quote);
      if (closePos >= 0) {
        accumulator.push(candidate.slice(0, closePos));
        break;
      }
      accumulator.push(candidate);
      cursor += 1;
    }

    const normalized = normalizeDocstring(accumulator.join("\n"));
    return normalized || undefined;
  }

  return undefined;
}

function detectTripleQuote(candidate: string): string | undefined {
  if (candidate.startsWith('"""')) {
    return '"""';
  }
  if (candidate.startsWith("'''")) {
    return "'''";
  }
  return undefined;
}

function normalizeDocstring(raw: string): string {
  const replaced = raw.replace(/\r\n/g, "\n");
  const segments = replaced.split("\n");

  let start = 0;
  while (start < segments.length && !segments[start].trim()) {
    start += 1;
  }

  let end = segments.length - 1;
  while (end >= start && !segments[end].trim()) {
    end -= 1;
  }

  const sliced = segments.slice(start, end + 1);
  if (!sliced.length) {
    return "";
  }

  let minIndent = Infinity;
  for (const line of sliced.slice(1)) {
    if (!line.trim()) {
      continue;
    }
    const leading = line.match(/^\s+/);
    if (!leading) {
      minIndent = 0;
      break;
    }
    minIndent = Math.min(minIndent, leading[0].length);
  }

  if (!Number.isFinite(minIndent)) {
    minIndent = 0;
  }

  if (minIndent > 0) {
    for (let index = 1; index < sliced.length; index += 1) {
      const line = sliced[index];
      if (!line.trim()) {
        continue;
      }
      sliced[index] = line.slice(minIndent);
    }
  }

  return sliced.join("\n");
}

function extractDependencies(content: string): DependencyEntry[] {
  const lines = content.split(/\r?\n/);
  const dependencies = new Map<string, DependencyBucket>();

  const register = (specifier: string, symbol?: string): void => {
    const normalized = specifier.trim();
    if (!normalized) {
      return;
    }
    const existing = dependencies.get(normalized);
    const bucket: DependencyBucket = existing ?? {
      specifier: normalized,
      symbols: new Set<string>()
    };
    if (symbol && symbol.trim()) {
      bucket.symbols.add(symbol.trim());
    }
    dependencies.set(normalized, bucket);
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    if (trimmed.startsWith("import ")) {
      const remainder = trimmed.slice("import ".length);
      const modules = remainder.split(",").map((segment) => segment.split(/\s+as\s+/)[0]?.trim());
      for (const moduleName of modules) {
        if (!moduleName) {
          continue;
        }
        register(moduleName);
      }
      continue;
    }

    if (trimmed.startsWith("from ")) {
      const fromMatch = /^from\s+([.\w]+)\s+import\s+(.+)$/.exec(trimmed);
      if (!fromMatch) {
        continue;
      }

      const moduleSegment = fromMatch[1];
      const importSegment = fromMatch[2];
      const rawNames = importSegment
        .split(",")
        .map((segment) => segment.split(/\s+as\s+/)[0]?.trim());
      const names = rawNames.filter((candidate): candidate is string => Boolean(candidate && candidate.trim()));

      for (const name of names) {
        const combined = buildCombinedModule(moduleSegment, name);
        if (combined) {
          register(combined.module, combined.symbol);
        }
      }

      const base = normalizeModuleSegment(moduleSegment);
      if (base) {
        register(base);
      }
    }
  }

  return Array.from(dependencies.values())
    .map<DependencyEntry>((bucket) => ({
      specifier: bucket.specifier,
      resolvedPath: undefined,
      symbols: Array.from(bucket.symbols.values()).sort(),
      kind: "import"
    }))
    .sort((left, right) => left.specifier.localeCompare(right.specifier));
}

function buildCombinedModule(moduleSegment: string, member: string): { module: string; symbol: string } | undefined {
  const base = normalizeModuleSegment(moduleSegment);
  if (!base) {
    return undefined;
  }

  if (!member) {
    return { module: base, symbol: member };
  }

  if (member === "*") {
    return { module: base, symbol: "*" };
  }

  return {
    module: `${base}.${member}`.replace(/[.]+/g, "."),
    symbol: member
  };
}

function normalizeModuleSegment(segment: string): string | undefined {
  if (!segment) {
    return undefined;
  }

  const trimmed = segment.trim();
  if (!trimmed) {
    return undefined;
  }

  const relativePrefix = trimmed.match(/^([.]+)(.*)$/);
  if (!relativePrefix) {
    return trimmed.replace(/[.]+/g, ".").replace(/[.]$/, "");
  }

  const [, dots, remainder] = relativePrefix;
  const levels = dots.length;
  const remainderParts = remainder.split(".").filter(Boolean);
  const parents = Array.from({ length: levels }, () => "parent");
  return parents.concat(remainderParts).join(".");
}