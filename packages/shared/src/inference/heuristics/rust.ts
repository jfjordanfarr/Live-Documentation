import path from "node:path";

import { isImplementationLayer } from "./artifactLayerUtils";
import { isWithinComment } from "./shared";
import type { FallbackHeuristic, HeuristicArtifact, MatchContext } from "../fallbackHeuristicTypes";

const RUST_MOD_STATEMENT_PATTERN = "^\\s*((?:pub(?:\\([^)]*\\))?\\s+)?)mod\\s+([A-Za-z_][A-Za-z0-9_]*)\\s*;";
const RUST_USE_STATEMENT_PATTERN = "^\\s*((?:pub(?:\\([^)]*\\))?\\s+)?)use\\s+([^;]+);";
const RUST_PATH_REFERENCE_PATTERN = "(?:\\bcrate|\\$crate|\\bself|\\bsuper)(?:::[A-Za-z_][A-Za-z0-9_]*!?)+";
const RUST_SEGMENT_TRIMMERS = new Set(["crate", "self", "super"]);

interface RustContext {
  moduleIndex: Map<string, HeuristicArtifact[]>;
}

interface RustUseTarget {
  moduleName: string;
  origin: "base" | "type";
}

/**
 * Creates a heuristic that detects Rust `mod`, `use`, and `path` attribute
 * references, mapping module paths to workspace `.rs` files.
 */
export function createRustHeuristic(): FallbackHeuristic {
  let context: RustContext = { moduleIndex: new Map() };

  return {
    id: "rust-module-relationships",
    initialize(artifacts) {
      context = buildRustContext(artifacts);
    },
    appliesTo(source) {
      return isImplementationLayer(source.artifact.layer) && source.comparablePath.endsWith(".rs");
    },
    evaluate(source, emit) {
      if (!source.content) {
        return;
      }

      const seenTargets = new Set<string>();
      const modPattern = new RegExp(RUST_MOD_STATEMENT_PATTERN, "gm");

      for (const match of source.content.matchAll(modPattern)) {
        const visibility = match[1];
        const moduleName = match[2];

        for (const target of resolveRustModuleTargets(moduleName, context, source)) {
          if (seenTargets.has(target.artifact.id)) {
            continue;
          }
          if (
            target.comparablePath.endsWith("/mod.rs") &&
            path.dirname(target.comparablePath) === path.dirname(source.comparablePath)
          ) {
            continue;
          }

          const isPublicMod = Boolean(visibility?.trim());
          const isDirectoryModule = target.comparablePath.endsWith("/mod.rs");
          const isPrivateLeafModule = !isPublicMod && !isDirectoryModule;
          if (
            isPrivateLeafModule &&
            source.basename !== "lib.rs" &&
            !isRustModuleReferenced(source.content ?? "", moduleName)
          ) {
            continue;
          }

          seenTargets.add(target.artifact.id);
          const modContext: MatchContext = source.basename === "main.rs" ? "import" : "use";

          emit({
            target,
            confidence: 0.7,
            rationale: `rust mod ${moduleName}`,
            context: modContext,
          });
        }
      }

      const usePattern = new RegExp(RUST_USE_STATEMENT_PATTERN, "gm");
      for (const match of source.content.matchAll(usePattern)) {
        const visibility = match[1];
        const statement = match[2];
        const targets = parseRustUseTargets(statement, Boolean(visibility?.trim()));
        const baseContext = inferRustUseContext(statement, Boolean(visibility?.trim()));

        for (const { moduleName, origin } of targets) {
          if (isLikelyExternalRustUse(statement, moduleName, source.content ?? "")) {
            continue;
          }

          for (const target of resolveRustModuleTargets(moduleName, context, source)) {
            if (seenTargets.has(target.artifact.id)) {
              continue;
            }

            if (
              target.comparablePath.endsWith("/mod.rs") &&
              path.dirname(target.comparablePath) === path.dirname(source.comparablePath)
            ) {
              continue;
            }

            seenTargets.add(target.artifact.id);
            emit({
              target,
              confidence: 0.7,
              rationale: `rust use ${moduleName}`,
              context: deriveRustUseTargetContext(baseContext, origin, target),
            });
          }
        }
      }

      const pathPattern = new RegExp(RUST_PATH_REFERENCE_PATTERN, "g");
      for (const match of source.content.matchAll(pathPattern)) {
        const raw = match[0];
        const referenceStart = match.index ?? 0;
        if (isWithinComment(source.content, referenceStart)) {
          continue;
        }

        const moduleName = inferRustModuleFromPath(raw);
        if (!moduleName) {
          continue;
        }

        for (const target of resolveRustModuleTargets(moduleName, context, source)) {
          if (seenTargets.has(target.artifact.id)) {
            continue;
          }
          seenTargets.add(target.artifact.id);
          emit({
            target,
            confidence: 0.65,
            rationale: `rust path ${raw}`,
            context: "use",
          });
        }
      }
    },
  };
}

function buildRustContext(artifacts: readonly HeuristicArtifact[]): RustContext {
  const moduleIndex = new Map<string, HeuristicArtifact[]>();

  for (const artifact of artifacts) {
    if (!artifact.comparablePath.endsWith(".rs")) {
      continue;
    }

    const moduleName = inferRustModuleName(artifact.comparablePath);
    if (!moduleName) {
      continue;
    }

    const bucket = moduleIndex.get(moduleName) ?? [];
    bucket.push(artifact);
    moduleIndex.set(moduleName, bucket);
  }

  return { moduleIndex };
}

function inferRustModuleName(comparablePath: string): string | null {
  if (!comparablePath.endsWith(".rs")) {
    return null;
  }

  const normalized = comparablePath.replace(/\\/g, "/");
  if (normalized.endsWith("/mod.rs")) {
    const parent = normalized.slice(0, -"/mod.rs".length);
    const module = path.basename(parent);
    return module || null;
  }

  return path.basename(normalized, ".rs") || null;
}

function resolveRustModuleTargets(
  moduleName: string | null,
  context: RustContext,
  source: HeuristicArtifact
): HeuristicArtifact[] {
  if (!moduleName) {
    return [];
  }

  const candidates = context.moduleIndex.get(moduleName);
  if (!candidates) {
    return [];
  }

  return candidates.filter((candidate) => {
    if (candidate.artifact.id === source.artifact.id) {
      return false;
    }

    if (
      candidate.comparablePath.endsWith("/mod.rs") &&
      path.dirname(candidate.comparablePath) === path.dirname(source.comparablePath)
    ) {
      return false;
    }

    return true;
  });
}

function parseRustUseTargets(statement: string, isPublic: boolean): RustUseTarget[] {
  const cleaned = statement.split("//", 1)[0]?.trim() ?? "";
  if (!cleaned) {
    return [];
  }

  if (cleaned.includes("{")) {
    const prefix = cleaned.slice(0, cleaned.indexOf("{")).replace(/::\s*$/, "").trim();
    const module = extractRustModuleFromSegments(prefix.split("::"));
    return module ? [{ moduleName: module, origin: "base" }] : [];
  }

  const segments = cleaned.split("::").map((segment) => segment.trim()).filter(Boolean);
  if (segments.length === 0) {
    return [];
  }

  const module = extractRustModuleFromSegments(segments);
  const targets: RustUseTarget[] = module ? [{ moduleName: module, origin: "base" }] : [];

  if (isPublic) {
    const typeModule = inferRustModuleFromTypeSegments(segments, module);
    if (typeModule && typeModule !== module) {
      targets.push({ moduleName: typeModule, origin: "type" });
    }
  }

  return targets;
}

function extractRustModuleFromSegments(segments: string[]): string | null {
  const cleaned = segments
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => (segment === "$crate" ? "crate" : segment))
    .map((segment) => segment.replace(/[^A-Za-z0-9_]/g, ""))
    .filter(Boolean);
  const trimmed = dropRustContextualSegments(cleaned);
  if (trimmed.length === 0) {
    if (cleaned.includes("crate")) {
      return "lib";
    }
    return null;
  }
  const candidate = trimmed.length === 1 ? trimmed[0] : trimmed[trimmed.length - 2];
  return isLikelyRustModuleName(candidate) ? candidate : null;
}

function inferRustUseContext(statement: string, isPublic: boolean): MatchContext {
  if (isPublic) {
    return "use";
  }

  const cleaned = statement.split("//", 1)[0]?.trim() ?? "";
  if (!cleaned) {
    return "use";
  }

  const symbols = extractRustUseSymbols(cleaned);
  if (symbols.length === 0) {
    return "use";
  }

  return symbols.some(isLikelyRustValueSymbol) ? "import" : "use";
}

function deriveRustUseTargetContext(
  baseContext: MatchContext,
  origin: RustUseTarget["origin"],
  target: HeuristicArtifact
): MatchContext {
  if (origin === "type") {
    return "use";
  }

  if (target.comparablePath.endsWith("/mod.rs")) {
    return "use";
  }

  if (target.basename === "lib.rs") {
    return "use";
  }

  return baseContext;
}

function isRustModuleReferenced(content: string, moduleName: string): boolean {
  if (!content || !moduleName) {
    return false;
  }

  const referencePattern = new RegExp(`\\b${moduleName}\\s*::`, "g");
  return referencePattern.test(content);
}

function isLikelyExternalRustUse(statement: string, moduleName: string, sourceContent: string): boolean {
  const trimmed = statement.trim();
  if (!trimmed) {
    return false;
  }

  if (/^(?:crate|self|super|\$crate)\s*::/.test(trimmed) || trimmed.startsWith("::")) {
    return false;
  }

  const modulePattern = new RegExp(`\\b(?:pub\\s+)?mod\\s+${moduleName}\\b`);
  return !modulePattern.test(sourceContent);
}

function extractRustUseSymbols(statement: string): string[] {
  const braceStart = statement.indexOf("{");
  const braceEnd = statement.lastIndexOf("}");
  const symbols: string[] = [];

  if (braceStart !== -1 && braceEnd !== -1 && braceEnd > braceStart) {
    const inner = statement.slice(braceStart + 1, braceEnd);
    for (const part of inner.split(",")) {
      const symbol = sanitizeRustUseSymbol(part);
      if (symbol) {
        symbols.push(symbol);
      }
    }
    return symbols;
  }

  const symbol = sanitizeRustUseSymbol(statement.slice(statement.lastIndexOf("::") + 2));
  return symbol ? [symbol] : [];
}

function sanitizeRustUseSymbol(raw: string): string | null {
  const cleaned = raw
    .trim()
    .replace(/\bas\s+[A-Za-z_][A-Za-z0-9_]*/, "")
    .replace(/^[*&]/, "")
    .replace(/[,;]$/, "")
    .trim();

  if (!cleaned) {
    return null;
  }

  const segments = cleaned.split("::");
  const symbol = segments[segments.length - 1]?.trim();
  return symbol ?? null;
}

function isLikelyRustValueSymbol(symbol: string): boolean {
  return /^[a-z0-9_]+$/.test(symbol);
}

function dropRustContextualSegments(segments: string[]): string[] {
  let index = 0;
  while (index < segments.length && RUST_SEGMENT_TRIMMERS.has(segments[index])) {
    index += 1;
  }
  return segments.slice(index);
}

function inferRustModuleFromTypeSegments(segments: string[], primaryModule: string | null): string | null {
  const cleaned = segments
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => (segment === "$crate" ? "crate" : segment))
    .map((segment) => segment.replace(/[^A-Za-z0-9_]/g, ""))
    .filter(Boolean);
  const trimmed = dropRustContextualSegments(cleaned);
  if (trimmed.length < 2) {
    return null;
  }

  const typeSegment = trimmed[trimmed.length - 1];
  if (!isPascalCaseIdentifier(typeSegment)) {
    return null;
  }

  const candidate = toSnakeCase(typeSegment);
  if (!isLikelyRustModuleName(candidate) || candidate === primaryModule) {
    return null;
  }

  return candidate;
}

function isLikelyRustModuleName(name: string): boolean {
  return /^[a-z0-9_]+$/.test(name);
}

function isPascalCaseIdentifier(value: string): boolean {
  return /^[A-Z][A-Za-z0-9]*$/.test(value);
}

function toSnakeCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();
}

function inferRustModuleFromPath(input: string): string | null {
  const normalized = input.replace(/^\$crate/, "crate");
  const segments = normalized.split("::");
  return extractRustModuleFromSegments(segments);
}
