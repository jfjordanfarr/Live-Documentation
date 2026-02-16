import path from "node:path";

import { isImplementationLayer } from "./artifactLayerUtils";
import { resolveReference } from "./referenceResolver";
import type { FallbackHeuristic, HeuristicArtifact, MatchEmitter } from "../fallbackHeuristicTypes";

const POWERSHELL_EXTENSIONS = new Set([".ps1", ".psm1"]);
const MODULE_PARAMETER_NAMES = new Set([
  "-name",
  "-module",
  "-modules",
  "-modulename",
  "-fullyqualifiedname"
]);

interface PowerShellReference {
  specifier: string;
  rationale: string;
}

/**
 * Creates a heuristic that detects PowerShell dot-sourced scripts
 * (`. .\path.ps1`) and `Import-Module` references, resolving them
 * to workspace `.ps1`/`.psm1` files.
 */
export function createPowerShellHeuristic(): FallbackHeuristic {
  let candidates: readonly HeuristicArtifact[] = [];

  return {
    id: "powershell-dependencies",
    initialize(artifacts) {
      candidates = artifacts;
    },
    appliesTo(source) {
      if (!isImplementationLayer(source.artifact.layer)) {
        return false;
      }
      const extension = path.extname(source.comparablePath).toLowerCase();
      return POWERSHELL_EXTENSIONS.has(extension);
    },
    evaluate(source, emit) {
      if (!source.content?.trim()) {
        return;
      }

      const references = collectPowerShellReferences(source);
      if (references.length === 0) {
        return;
      }

      emitResolvedReferences(references, source, candidates, emit);
    }
  };
}

function collectPowerShellReferences(source: HeuristicArtifact): PowerShellReference[] {
  const lines = (source.content ?? "").split(/\r?\n/);
  const collected: PowerShellReference[] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      continue;
    }

    if (trimmed.toLowerCase().startsWith("#requires")) {
      const modules = extractRequiresModules(trimmed.slice(9));
      for (const specifier of modules) {
        collected.push({
          specifier,
          rationale: `powershell requires ${specifier}`
        });
      }
      continue;
    }

    const sanitized = stripPowerShellComment(rawLine);
    if (!sanitized.trim()) {
      continue;
    }

    const dotSourceMatch = sanitized.match(/^\s*\.\s+(?:&\s+)?(?<remainder>.+)$/i);
    if (dotSourceMatch?.groups?.remainder) {
      const tokens = tokenizePowerShellWords(dotSourceMatch.groups.remainder);
      const specifierCandidate = tokens[0];
      const specifier = specifierCandidate ? normalizeDotSourceSpecifier(specifierCandidate) : null;
      if (specifier) {
        collected.push({
          specifier,
          rationale: `powershell dot-source ${specifier}`
        });
      }
    }

    const usingMatch = sanitized.match(/^\s*using\s+module\s+(?<remainder>.+)$/i);
    if (usingMatch?.groups?.remainder) {
      const modules = extractModuleSpecifiers(usingMatch.groups.remainder, true);
      for (const specifier of modules) {
        collected.push({
          specifier,
          rationale: `powershell using module ${specifier}`
        });
      }
    }

    const importMatch = sanitized.match(/^\s*import-module\b(?<remainder>.*)$/i);
    if (importMatch?.groups?.remainder !== undefined) {
      const remainder = importMatch.groups.remainder ?? "";
      const modules = extractModuleSpecifiers(remainder, true);
      for (const specifier of modules) {
        collected.push({
          specifier,
          rationale: `powershell import-module ${specifier}`
        });
      }
    }
  }
  return collected;
}

function emitResolvedReferences(
  references: PowerShellReference[],
  source: HeuristicArtifact,
  candidates: readonly HeuristicArtifact[],
  emit: MatchEmitter
): void {
  const seen = new Set<string>();

  for (const reference of references) {
    const key = reference.specifier.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    const resolution = resolveReference(reference.specifier, source, candidates, reference.rationale);
    if (!resolution) {
      continue;
    }

    emit({
      target: resolution.target,
      confidence: resolution.confidence,
      rationale: resolution.rationale,
      context: "import"
    });
  }
}

function normalizeDotSourceSpecifier(value: string): string | null {
  const unquoted = removeEnclosingQuotes(value).trim();
  if (!unquoted) {
    return null;
  }

  const replaced = unquoted.replace(/\$PSScriptRoot/gi, ".");
  if (/[`$]/.test(replaced)) {
    return null;
  }

  const normalizedSeparators = replaced.replace(/\\+/g, "/");
  const prefixed = normalizedSeparators.startsWith(".") || normalizedSeparators.startsWith("/")
    ? normalizedSeparators
    : `./${normalizedSeparators}`;

  const normalized = path.posix.normalize(prefixed);
  if (!normalized || normalized === "." || normalized === "/") {
    return null;
  }

  return normalized;
}

function extractModuleSpecifiers(segment: string, treatFirstAsModule: boolean): string[] {
  const tokens = tokenizePowerShellWords(segment);
  if (tokens.length === 0) {
    return [];
  }

  const results: string[] = [];
  let activeParameter: string | null = treatFirstAsModule ? "default" : null;

  for (const token of tokens) {
    if (!token) {
      continue;
    }

    if (token.startsWith("-") && !token.includes("=")) {
      const normalized = token.toLowerCase();
      activeParameter = MODULE_PARAMETER_NAMES.has(normalized) ? normalized : null;
      continue;
    }

    if (token.startsWith("-") && token.includes("=")) {
      const [parameter, raw] = token.split("=", 2);
      const normalized = parameter.toLowerCase();
      if (!MODULE_PARAMETER_NAMES.has(normalized)) {
        activeParameter = null;
        continue;
      }
      if (raw) {
        const specifier = normalizeModuleSpecifier(raw);
        if (specifier) {
          results.push(specifier);
        }
      }
      activeParameter = normalized;
      continue;
    }

    if (activeParameter === "default" || (activeParameter && MODULE_PARAMETER_NAMES.has(activeParameter))) {
      const specifier = normalizeModuleSpecifier(token);
      if (specifier) {
        results.push(specifier);
      }
      continue;
    }

    if (!activeParameter && treatFirstAsModule && results.length === 0) {
      const specifier = normalizeModuleSpecifier(token);
      if (specifier) {
        results.push(specifier);
      }
    }
  }

  return results;
}

function extractRequiresModules(segment: string): string[] {
  const tokens = tokenizePowerShellWords(segment);
  if (tokens.length === 0) {
    return [];
  }

  const modules: string[] = [];
  let activeParameter: string | null = null;

  for (const token of tokens) {
    if (!token) {
      continue;
    }

    if (token.startsWith("-")) {
      const normalized = token.toLowerCase();
      activeParameter = MODULE_PARAMETER_NAMES.has(normalized) ? normalized : null;
      continue;
    }

    if (activeParameter && MODULE_PARAMETER_NAMES.has(activeParameter)) {
      const specifier = normalizeModuleSpecifier(token);
      if (specifier) {
        modules.push(specifier);
      }
    }
  }

  return modules;
}

function normalizeModuleSpecifier(raw: string): string | null {
  const unquoted = removeEnclosingQuotes(raw).trim();
  if (!unquoted) {
    return null;
  }

  if (/[`$]/.test(unquoted)) {
    return null;
  }

  if (
    unquoted.includes("/") ||
    unquoted.includes("\\") ||
    unquoted.startsWith(".") ||
    /\$PSScriptRoot/i.test(unquoted)
  ) {
    return normalizePathLikeSpecifier(unquoted);
  }

  const replaced = unquoted.replace(/::/g, "/").replace(/\./g, "/");
  const collapsed = replaced.replace(/\\+/g, "/").replace(/\/{2,}/g, "/");
  return collapsed || null;
}

function normalizePathLikeSpecifier(raw: string): string | null {
  const replacedRoot = raw.replace(/\$PSScriptRoot/gi, ".");
  const sanitized = replacedRoot.replace(/\\+/g, "/");
  const prefixed = sanitized.startsWith(".") || sanitized.startsWith("/")
    ? sanitized
    : `./${sanitized}`;
  const normalized = path.posix.normalize(prefixed);
  if (!normalized || normalized === "." || normalized === "/") {
    return null;
  }
  return normalized;
}

function stripPowerShellComment(line: string): string {
  let inSingle = false;
  let inDouble = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === "'" && !inDouble) {
      if (inSingle && line[index + 1] === "'") {
        index += 1;
        continue;
      }
      inSingle = !inSingle;
      continue;
    }

    if (char === '"' && !inSingle) {
      if (inDouble && line[index + 1] === '"') {
        index += 1;
        continue;
      }
      inDouble = !inDouble;
      continue;
    }

    if (char === "#" && !inSingle && !inDouble) {
      return line.slice(0, index);
    }
  }

  return line;
}

function removeEnclosingQuotes(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length < 2) {
    return trimmed;
  }

  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }

  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/""/g, '"');
  }

  return trimmed;
}

function tokenizePowerShellWords(segment: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;

  const flush = (): void => {
    if (current) {
      tokens.push(current);
      current = "";
    }
  };

  for (let index = 0; index < segment.length; index += 1) {
    const char = segment[index];

    if (inSingle) {
      if (char === "'") {
        if (segment[index + 1] === "'") {
          current += "'";
          index += 1;
          continue;
        }
        inSingle = false;
        continue;
      }
      current += char;
      continue;
    }

    if (inDouble) {
      if (char === '"') {
        if (segment[index + 1] === '"') {
          current += '"';
          index += 1;
          continue;
        }
        inDouble = false;
        continue;
      }
      current += char;
      continue;
    }

    if (char === "'") {
      inSingle = true;
      continue;
    }

    if (char === '"') {
      inDouble = true;
      continue;
    }

    if (char === " " || char === "\t" || char === ",") {
      flush();
      continue;
    }

    current += char;
  }

  flush();
  return tokens;
}
