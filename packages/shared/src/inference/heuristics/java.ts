import path from "node:path";

import { isImplementationLayer } from "./artifactLayerUtils";
import type { FallbackHeuristic, HeuristicArtifact } from "../fallbackHeuristicTypes";

const JAVA_IMPORT_PATTERN = "^\\s*import\\s+([^;]+);";

interface JavaContext {
  packageIndex: Map<string, HeuristicArtifact>;
  samePackageIndex: Map<string, SamePackageEntry[]>;
}

interface SamePackageEntry {
  className: string;
  artifact: HeuristicArtifact;
}

/**
 * Creates a heuristic that detects Java `import` statements and maps
 * fully-qualified class names to workspace `.java` files by package path.
 */
export function createJavaHeuristic(): FallbackHeuristic {
  let context: JavaContext = { packageIndex: new Map(), samePackageIndex: new Map() };

  return {
    id: "java-imports",
    initialize(artifacts) {
      context = buildJavaContext(artifacts);
    },
    appliesTo(source) {
      return isImplementationLayer(source.artifact.layer) && source.comparablePath.endsWith(".java");
    },
    evaluate(source, emit) {
      if (!source.content) {
        return;
      }

      const seen = new Set<string>();
      const pattern = new RegExp(JAVA_IMPORT_PATTERN, "gm");

      // Handle explicit imports
      for (const match of source.content.matchAll(pattern)) {
        const statement = match[1]?.trim();
        if (!statement || statement.startsWith("java.")) {
          continue;
        }

        const target = context.packageIndex.get(statement.toLowerCase());
        if (!target || target.artifact.id === source.artifact.id) {
          continue;
        }

        if (seen.has(target.artifact.id)) {
          continue;
        }

        seen.add(target.artifact.id);
        const symbol = statement.slice(statement.lastIndexOf(".") + 1);
        const relation = classifyJavaRelation(symbol, source.content ?? "");
        const rationale = relation === "uses" ? `java usage ${symbol}` : `java import ${symbol}`;
        const confidence = relation === "uses" ? 0.8 : 0.7;

        emit({
          target,
          confidence,
          rationale,
          context: relation === "uses" ? "use" : "import",
        });
      }

      // Handle same-package references (Java allows unqualified access to same-package classes)
      const sourcePackage = extractJavaPackage(source.content);
      if (sourcePackage) {
        const samePackageClasses = context.samePackageIndex.get(sourcePackage) ?? [];
        for (const entry of samePackageClasses) {
          // Note: entry.artifact is HeuristicArtifact, so .artifact.artifact gives KnowledgeArtifact
          // source is HeuristicArtifact, so .artifact gives KnowledgeArtifact
          if (entry.artifact.artifact.id === source.artifact.id) continue;
          if (seen.has(entry.artifact.artifact.id)) continue;

          // Look for unqualified class usage: ClassName. or ClassName:: or new ClassName
          const escaped = entry.className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const usagePattern = new RegExp(
            `\\b${escaped}\\s*\\.|\\b${escaped}::|\\bnew\\s+${escaped}\\b|\\bextends\\s+${escaped}\\b|\\bimplements\\s+${escaped}\\b`
          );

          if (usagePattern.test(source.content)) {
            seen.add(entry.artifact.artifact.id);
            const relation = classifyJavaRelation(entry.className, source.content);
            emit({
              target: entry.artifact,
              confidence: relation === "uses" ? 0.75 : 0.65,
              rationale: `java same-package ${relation === "uses" ? "usage" : "reference"} ${entry.className}`,
              context: relation === "uses" ? "use" : "import",
            });
          }
        }
      }
    },
  };
}

function buildJavaContext(artifacts: readonly HeuristicArtifact[]): JavaContext {
  const packageIndex = new Map<string, HeuristicArtifact>();
  const samePackageIndex = new Map<string, SamePackageEntry[]>();

  for (const artifact of artifacts) {
    if (!artifact.content || !artifact.comparablePath.endsWith(".java")) {
      continue;
    }

    const packageName = extractJavaPackage(artifact.content);
    if (!packageName) {
      continue;
    }

    // Use extractJavaClassName for same-package index (preserves case)
    const className = extractJavaClassName(artifact.content, artifact.comparablePath);
    // For packageIndex, use lowercased version for lookup compatibility
    const lowerClassName = inferJavaClassName(artifact.comparablePath);
    packageIndex.set(`${packageName}.${lowerClassName}`.toLowerCase(), artifact);

    // Build same-package index for unqualified references (case-sensitive className)
    const entries = samePackageIndex.get(packageName) ?? [];
    entries.push({ className, artifact });
    samePackageIndex.set(packageName, entries);
  }

  return { packageIndex, samePackageIndex };
}

function extractJavaPackage(content: string): string | null {
  const match = content.match(/\bpackage\s+([^;]+);/);
  return match ? match[1].trim() : null;
}

function extractJavaClassName(content: string, comparablePath: string): string {
  // Try to extract the public class/interface/enum name from the content (preserves case)
  const classMatch = content.match(/\bpublic\s+(?:final\s+)?(?:abstract\s+)?(?:class|interface|enum)\s+([A-Za-z_$][A-Za-z0-9_$]*)/);
  if (classMatch) {
    return classMatch[1];
  }
  // Fall back to basename but try to preserve proper casing from filename
  const basename = path.basename(comparablePath);
  const stem = basename.endsWith(".java") ? basename.slice(0, -".java".length) : basename;
  // If the path was lowercased, we can't recover casing - return as-is
  return stem;
}

function inferJavaClassName(comparablePath: string): string {
  const basename = path.basename(comparablePath);
  return basename.endsWith(".java") ? basename.slice(0, -".java".length) : basename;
}

function classifyJavaRelation(symbol: string, content: string): "imports" | "uses" {
  const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const constructorPattern = new RegExp(`new\\s+${escaped}\\b`);
  const genericPattern = new RegExp(`<\\s*${escaped}\\b`);
  const declarationPattern = new RegExp(`\\b${escaped}\\s+[A-Za-z_$][\\w$]*\\s*(=|;|,|\\))`);
  const methodReferencePattern = new RegExp(`\\b${escaped}::`);

  if (
    constructorPattern.test(content) ||
    genericPattern.test(content) ||
    declarationPattern.test(content) ||
    methodReferencePattern.test(content)
  ) {
    return "uses";
  }

  return "imports";
}
