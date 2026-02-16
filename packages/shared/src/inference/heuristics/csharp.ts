import { isImplementationLayer } from "./artifactLayerUtils";
import { stripCStyleComments } from "../../languages/syntax";
import type { FallbackHeuristic, HeuristicArtifact } from "../fallbackHeuristicTypes";

const CSHARP_USING_DIRECTIVE_PATTERN = "^\\s*using\\s+(static\\s+)?([^=;]+);";
const CSHARP_NAMESPACE_DECLARATION_PATTERN = "\\bnamespace\\s+([A-Za-z_][A-Za-z0-9_.]*)\\s*(?:;|\\{)";
const CSHARP_TYPE_DECLARATION_PATTERN = "(partial\\s+)?(class|struct|interface|record|enum|delegate)\\s+([A-Za-z_][A-Za-z0-9_]*)";
const CSHARP_IDENTIFIER_PATTERN = "\\b([A-Z][A-Za-z0-9_]*)\\b";

/**
 * Built-in .NET types to ignore when detecting cross-file references.
 *
 * Note: This is more conservative than csharpSyntax.ignoredIdentifiers because
 * the heuristic needs to detect project-specific types like ValidationUtils,
 * ObjectConstructor, etc. The LanguageSyntax blocklist is tuned for tree-sitter
 * noise reduction and includes common variable names that would cause too many
 * false negatives here.
 */
const CSHARP_BUILT_INS = new Set([
  "Task",
  "ValueTask",
  "String",
  "Int32",
  "Boolean",
  "Double",
  "Decimal",
  "DateTime",
  "DateTimeOffset",
  "TimeSpan",
  "Guid",
  "List",
  "Dictionary",
  "IDictionary",
  "IEnumerable",
  "IList",
  "HashSet",
  "Nullable",
  "CultureInfo",
]);

/**
 * Strips C# comments for type-reference analysis.
 *
 * Delegates to the shared {@link stripCStyleComments} utility which handles
 * both `// …` line comments (including `///` XML doc comments) and
 * `/* … * /` block comments. Strings are intentionally preserved — type
 * references like `nameof(MyType)` can appear adjacent to string literals.
 */
const getStrippedContent = stripCStyleComments;

interface CSharpContext {
  fileMetadata: Map<string, CSharpFileMetadata>;
  typesBySimpleName: Map<string, CSharpTypeDefinition[]>;
  partialTypesByFullName: Map<string, CSharpTypeDefinition[]>;
}

interface CSharpFileMetadata {
  namespaceName: string | null;
  definedTypes: CSharpTypeDefinition[];
  importedNamespaces: Set<string>;
}

interface CSharpTypeDefinition {
  simpleName: string;
  fullName: string;
  namespaceName: string | null;
  isPartial: boolean;
  artifact: HeuristicArtifact;
}

/**
 * Creates a heuristic that detects C# `using` directives and namespace
 * references, mapping them to workspace `.cs` files by namespace convention.
 */
export function createCSharpHeuristic(): FallbackHeuristic {
  let context: CSharpContext = {
    fileMetadata: new Map(),
    typesBySimpleName: new Map(),
    partialTypesByFullName: new Map(),
  };

  return {
    id: "csharp-type-relationships",
    initialize(artifacts) {
      context = buildCSharpContext(artifacts);
    },
    appliesTo(source) {
      return isImplementationLayer(source.artifact.layer) && source.comparablePath.endsWith(".cs");
    },
    evaluate(source, emit) {
      if (!source.content) {
        return;
      }

      const metadata = context.fileMetadata.get(source.artifact.id);
      if (!metadata) {
        return;
      }

      const definedNames = new Set(metadata.definedTypes.map((definition) => definition.simpleName));
      const usingNamespaces = metadata.importedNamespaces;
      const namespaceName = metadata.namespaceName?.toLowerCase() ?? null;
      const seenTargets = new Set<string>();
      const identifierPattern = new RegExp(CSHARP_IDENTIFIER_PATTERN, "gm");

      // Strip comments and strings to avoid false positives from type names in documentation
      const codeContent = getStrippedContent(source.content);

      for (const match of codeContent.matchAll(identifierPattern)) {
        const symbol = match[1];
        if (!symbol || definedNames.has(symbol) || CSHARP_BUILT_INS.has(symbol)) {
          continue;
        }

        const candidates = context.typesBySimpleName.get(symbol.toLowerCase());
        if (!candidates || candidates.length === 0) {
          continue;
        }

        const target = disambiguateCSharpType(candidates, namespaceName, usingNamespaces);
        if (!target || target.artifact.artifact.id === source.artifact.id) {
          continue;
        }

        if (seenTargets.has(target.artifact.artifact.id)) {
          continue;
        }

        seenTargets.add(target.artifact.artifact.id);
        const relation = classifyCSharpRelation(symbol, codeContent);
        const rationale = relation === "uses" ? `csharp usage ${symbol}` : `csharp import ${symbol}`;
        const confidence = relation === "uses" ? 0.8 : 0.65;

        emit({
          target: target.artifact,
          confidence,
          rationale,
          context: relation === "uses" ? "use" : "import",
        });
      }

      if (shouldLinkCSharpPartialPeers(source.comparablePath)) {
        const partialTargets = new Set<string>();
        for (const definition of metadata.definedTypes) {
          if (!definition.isPartial) {
            continue;
          }

          const group = context.partialTypesByFullName.get(definition.fullName.toLowerCase());
          if (!group) {
            continue;
          }

          for (const peer of group) {
            const peerId = peer.artifact.artifact.id;
            if (peerId === source.artifact.id || partialTargets.has(peerId)) {
              continue;
            }

            partialTargets.add(peerId);
            emit({
              target: peer.artifact,
              confidence: 0.7,
              rationale: `csharp partial type ${definition.simpleName}`,
              context: "use",
            });
          }
        }
      }
    },
  };
}

function buildCSharpContext(artifacts: readonly HeuristicArtifact[]): CSharpContext {
  const fileMetadata = new Map<string, CSharpFileMetadata>();
  const typesBySimpleName = new Map<string, CSharpTypeDefinition[]>();
  const partialTypesByFullName = new Map<string, CSharpTypeDefinition[]>();

  for (const artifact of artifacts) {
    if (!artifact.content || !artifact.comparablePath.endsWith(".cs")) {
      continue;
    }

    const metadata = extractCSharpFileMetadata(artifact);
    fileMetadata.set(artifact.artifact.id, metadata);

    for (const definition of metadata.definedTypes) {
      const key = definition.simpleName.toLowerCase();
      const group = typesBySimpleName.get(key) ?? [];
      group.push(definition);
      typesBySimpleName.set(key, group);

      if (definition.isPartial) {
        const fullKey = definition.fullName.toLowerCase();
        const partialGroup = partialTypesByFullName.get(fullKey) ?? [];
        partialGroup.push(definition);
        partialTypesByFullName.set(fullKey, partialGroup);
      }
    }
  }

  return { fileMetadata, typesBySimpleName, partialTypesByFullName };
}

function extractCSharpFileMetadata(artifact: HeuristicArtifact): CSharpFileMetadata {
  const namespaceName = extractCSharpNamespace(artifact.content ?? "");
  const definedTypes = extractCSharpTypeDefinitions(artifact, namespaceName);
  const importedNamespaces = extractCSharpUsingNamespaces(artifact.content ?? "");

  return {
    namespaceName,
    definedTypes,
    importedNamespaces,
  };
}

function extractCSharpNamespace(content: string): string | null {
  const pattern = new RegExp(CSHARP_NAMESPACE_DECLARATION_PATTERN, "m");
  const match = pattern.exec(content);
  return match ? match[1].trim() : null;
}

function extractCSharpTypeDefinitions(
  artifact: HeuristicArtifact,
  namespaceName: string | null
): CSharpTypeDefinition[] {
  if (!artifact.content) {
    return [];
  }

  const definitions: CSharpTypeDefinition[] = [];
  const pattern = new RegExp(CSHARP_TYPE_DECLARATION_PATTERN, "gm");

  for (const match of artifact.content.matchAll(pattern)) {
    const simpleName = match[3];
    if (!simpleName) {
      continue;
    }

    const isPartial = Boolean(match[1]);
    const fullName = namespaceName ? `${namespaceName}.${simpleName}` : simpleName;
    definitions.push({
      simpleName,
      namespaceName,
      fullName,
      isPartial,
      artifact,
    });
  }

  return definitions;
}

function extractCSharpUsingNamespaces(content: string): Set<string> {
  const namespaces = new Set<string>();
  const pattern = new RegExp(CSHARP_USING_DIRECTIVE_PATTERN, "gm");

  for (const match of content.matchAll(pattern)) {
    const directive = match[2]?.trim();
    if (!directive) {
      continue;
    }

    if (directive.includes("=")) {
      continue;
    }

    if (directive.startsWith("System.")) {
      continue;
    }

    const normalized = directive.replace(/\s+/g, "").toLowerCase();
    namespaces.add(normalized);

    const segments = normalized.split(".");
    if (segments.length > 1) {
      namespaces.add(segments.slice(0, -1).join("."));
    }
  }

  return namespaces;
}

function disambiguateCSharpType(
  candidates: CSharpTypeDefinition[],
  namespaceName: string | null,
  usingNamespaces: Set<string>
): CSharpTypeDefinition | undefined {
  if (candidates.length === 1) {
    return candidates[0];
  }

  const sameNamespace = namespaceName
    ? candidates.filter((candidate) => candidate.namespaceName?.toLowerCase() === namespaceName)
    : [];
  if (sameNamespace.length === 1) {
    return sameNamespace[0];
  }

  const importedMatches = candidates.filter((candidate) => {
    if (!candidate.namespaceName) {
      return false;
    }
    return usingNamespaces.has(candidate.namespaceName.toLowerCase());
  });

  if (importedMatches.length === 1) {
    return importedMatches[0];
  }

  return undefined;
}

function classifyCSharpRelation(symbol: string, content: string): "imports" | "uses" {
  const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const constructorPattern = new RegExp(`new\\s+${escaped}\\b`);
  const declarationPattern = new RegExp(`\\b${escaped}\\s+[A-Za-z_][A-Za-z0-9_]*\\s*(=|;|,|\\))`);
  const genericPattern = new RegExp(`<\\s*${escaped}\\b`);
  const staticPattern = new RegExp(`\\b${escaped}\\s*\\.`);

  if (
    constructorPattern.test(content) ||
    declarationPattern.test(content) ||
    genericPattern.test(content) ||
    staticPattern.test(content)
  ) {
    return "uses";
  }

  return "imports";
}

function shouldLinkCSharpPartialPeers(relativePath: string): boolean {
  const lower = relativePath.toLowerCase();
  return lower.endsWith(".designer.cs") || lower.endsWith(".g.cs");
}
