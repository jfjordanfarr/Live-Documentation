import path from "node:path";

import type { LiveDocumentationConfig } from "../config/liveDocumentationConfig";
import { LIVE_DOCUMENTATION_FILE_EXTENSION } from "../config/liveDocumentationConfig";
import { normalizeWorkspacePath } from "../tooling/pathUtils";

/**
 * Represents a type reference extracted from a Live Doc's Public Symbols section.
 *
 * @remarks
 * This mirrors the structure rendered by the Live Doc generator when a symbol's
 * return type, parameter type, extends clause, or implements clause references
 * another type defined in the workspace. The `targetDocPath` and `targetAnchor`
 * fields enable navigation in the Explorer's Local Map.
 */
export interface ParsedTypeReference {
  /**
   * The name of the referenced type as displayed in the Live Doc.
   */
  typeName: string;

  /**
   * The role this type plays in the symbol's signature.
   */
  role: "return" | "parameter" | "extends" | "implements" | "constraint";

  /**
   * For parameter types, the name of the parameter.
   */
  parameterName?: string;

  /**
   * Whether this type resolved to a Live Doc link.
   * If false, it was rendered as plain code (external or primitive type).
   */
  isResolved: boolean;

  /**
   * The relative path to the target Live Doc (if resolved).
   * E.g., "./types.ts.mdmd.md"
   */
  targetDocPath?: string;

  /**
   * The anchor within the target Live Doc (if resolved).
   * E.g., "symbol-widget"
   */
  targetAnchor?: string;
}

export interface ParsedLiveDoc {
  sourcePath: string;
  archetype: string;
  publicSymbols: string[];
  dependencies: ParsedDependency[];
  docPath: string;
  symbolDocumentation: Record<string, ParsedSymbolDocumentationEntry>;
}

export interface ParsedSymbolDocumentationEntry {
  summary?: string;
  remarks?: string;
  parameters?: Array<{ name: string; description?: string }>;
  /**
   * Type references extracted from the symbol's metadata lines
   * (Returns:, Parameters:, Extends:, Implements:, Constraints:).
   */
  typeReferences?: ParsedTypeReference[];
}

export interface ParsedDependency {
  codePath?: string;
  docPath?: string;
  anchor?: string;
  /** Anchor of the symbol on the *source* file that declares this dependency */
  sourceAnchor?: string;
  label?: string;
  raw: string;
}

const DEFAULT_ARCHETYPE = "implementation";

export function parseLiveDocMarkdown(
  content: string,
  docAbsolutePath: string,
  workspaceRoot: string,
  config: LiveDocumentationConfig
): ParsedLiveDoc | undefined {
  const metadataPathMatch = content.match(/-\s+Code Path:\s+(.+)/);
  if (!metadataPathMatch) {
    return undefined;
  }

  const rawSourcePath = metadataPathMatch[1].trim();
  if (!rawSourcePath) {
    return undefined;
  }

  const archetypeMatch = content.match(/-\s+Archetype:\s+(\w+)/);
  const archetype = archetypeMatch ? archetypeMatch[1].toLowerCase() : DEFAULT_ARCHETYPE;

  const publicSymbolsSection = extractSection(content, "Public Symbols");
  const dependenciesSection = extractSection(content, "Dependencies");
  const symbolDocumentation = parseSymbolDocumentation(publicSymbolsSection);

  const docDir = path.dirname(docAbsolutePath);

  const publicSymbols = Array.from(parseSymbolSection(publicSymbolsSection));
  const dependencies = parseDependencySection(dependenciesSection, docDir, workspaceRoot, config);

  return {
    sourcePath: normalizeWorkspacePath(rawSourcePath),
    archetype,
    publicSymbols,
    dependencies,
    docPath: normalizeWorkspacePath(path.relative(workspaceRoot, docAbsolutePath)),
    symbolDocumentation
  };
}

function extractSection(content: string, section: string): string {
  const begin = `<!-- LIVE-DOC:BEGIN ${section} -->`;
  const end = `<!-- LIVE-DOC:END ${section} -->`;
  const startIndex = content.indexOf(begin);
  const endIndex = content.indexOf(end);
  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return "";
  }
  return content.slice(startIndex + begin.length, endIndex).trim();
}

function parseSymbolSection(section: string): Set<string> {
  const symbols = new Set<string>();
  const lines = section.split(/\r?\n/);
  for (const line of lines) {
    const bulletMatch = line.match(/-\s+`([^`]+)`/);
    if (bulletMatch) {
      symbols.add(bulletMatch[1]);
      continue;
    }

    const headingMatch = line.match(/^####\s+`([^`]+)`/);
    if (headingMatch) {
      symbols.add(headingMatch[1]);
    }
  }
  return symbols;
}

function parseDependencySection(
  section: string,
  docDir: string,
  workspaceRoot: string,
  config: LiveDocumentationConfig
): ParsedDependency[] {
  const dependencies: ParsedDependency[] = [];
  const seenKeys = new Set<string>();
  const lines = section.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("- ")) {
      continue;
    }

    const remainder = trimmed.slice(2).trim();
    if (!remainder || remainder.startsWith("_")) {
      continue;
    }

    const linkMatch = remainder.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      const [, label, target] = linkMatch;
      const resolvedTarget = resolveDependencyTarget(target, docDir, workspaceRoot, config);
      if (resolvedTarget) {
        const entry: ParsedDependency = {
          codePath: resolvedTarget.codePath,
          docPath: resolvedTarget.docPath,
          anchor: resolvedTarget.anchor,
          label: stripInlineCode(label) || resolvedTarget.codePath,
          raw: target
        };
        const key = dependencyKey(entry);
        if (!seenKeys.has(key)) {
          dependencies.push(entry);
          seenKeys.add(key);
        }
        continue;
      }

      const sanitisedLabel = stripInlineCode(label);
      if (sanitisedLabel) {
        const entry: ParsedDependency = {
          label: sanitisedLabel,
          raw: sanitisedLabel
        };
        const key = dependencyKey(entry);
        if (!seenKeys.has(key)) {
          dependencies.push(entry);
          seenKeys.add(key);
        }
      }
      continue;
    }

    const [firstToken] = remainder.split(/\s+/);
    if (!firstToken) {
      continue;
    }

    const sanitizedToken = stripInlineCode(firstToken);
    if (!sanitizedToken) {
      continue;
    }

    if (sanitizedToken.startsWith(".")) {
      const resolved = resolveDependencyTarget(sanitizedToken, docDir, workspaceRoot, config);
      if (resolved) {
        const entry: ParsedDependency = {
          codePath: resolved.codePath,
          docPath: resolved.docPath,
          anchor: resolved.anchor,
          raw: sanitizedToken
        };
        const key = dependencyKey(entry);
        if (!seenKeys.has(key)) {
          dependencies.push(entry);
          seenKeys.add(key);
        }
      } else {
        const entry: ParsedDependency = {
          raw: sanitizedToken
        };
        const key = dependencyKey(entry);
        if (!seenKeys.has(key)) {
          dependencies.push(entry);
          seenKeys.add(key);
        }
      }
      continue;
    }

    const entry: ParsedDependency = {
      raw: sanitizedToken
    };
    const key = dependencyKey(entry);
    if (!seenKeys.has(key)) {
      dependencies.push(entry);
      seenKeys.add(key);
    }
  }

  return dependencies;
}

function parseSymbolDocumentation(section: string): Record<string, ParsedSymbolDocumentationEntry> {
  const documentation: Record<string, ParsedSymbolDocumentationEntry> = {};
  if (!section) {
    return documentation;
  }

  const lines = section.split(/\r?\n/);
  let currentSymbol: string | undefined;
  let currentSection: "summary" | "remarks" | "parameters" | null = null;
  let buffer: string[] = [];
  let pendingParameter: { name: string; description: string } | null = null;

  const ensureEntry = (symbol: string): ParsedSymbolDocumentationEntry => {
    if (!documentation[symbol]) {
      documentation[symbol] = {};
    }
    return documentation[symbol];
  };

  const flushBuffer = (): void => {
    if (!currentSymbol || !currentSection) {
      buffer = [];
      return;
    }

    const text = buffer.join("\n").trim();
    if (!text) {
      buffer = [];
      return;
    }

    const entry = ensureEntry(currentSymbol);
    if (currentSection === "summary") {
      entry.summary = entry.summary ? `${entry.summary}\n${text}` : text;
    } else if (currentSection === "remarks") {
      entry.remarks = entry.remarks ? `${entry.remarks}\n${text}` : text;
    }

    buffer = [];
  };

  const flushParameter = (): void => {
    if (!currentSymbol || !pendingParameter) {
      pendingParameter = null;
      return;
    }

    const name = pendingParameter.name.trim();
    if (!name) {
      pendingParameter = null;
      return;
    }

    const description = pendingParameter.description.trim();
    const entry = ensureEntry(currentSymbol);
    if (!entry.parameters) {
      entry.parameters = [];
    }
    entry.parameters.push({
      name,
      description: description ? description : undefined
    });

    pendingParameter = null;
  };

  for (const rawLine of lines) {
    const line = rawLine;

    const symbolMatch = line.match(/^####\s+`([^`]+)`/);
    if (symbolMatch) {
      flushParameter();
      flushBuffer();
      currentSymbol = symbolMatch[1];
      currentSection = null;
      buffer = [];
      continue;
    }

    const sectionMatch = line.match(/^#####\s+`([^`]+)`\s+—\s+(Summary|Remarks|Parameters)/);
    if (sectionMatch) {
      flushParameter();
      flushBuffer();
      currentSymbol = sectionMatch[1];
      const sectionName = sectionMatch[2];
      currentSection = sectionName === "Summary"
        ? "summary"
        : sectionName === "Remarks"
          ? "remarks"
          : "parameters";
      buffer = [];
      continue;
    }

    if (line.startsWith("#####")) {
      // Unhandled sub-section (for example, Links, Returns); flush any accumulators.
      flushParameter();
      flushBuffer();
      currentSection = null;
      buffer = [];
      continue;
    }

    // When we're in the metadata area (between #### heading and ##### subsections),
    // try to parse type reference lines
    if (currentSymbol && currentSection === null) {
      const typeRefs = parseTypeReferenceLine(line);
      if (typeRefs.length > 0) {
        const entry = ensureEntry(currentSymbol);
        if (!entry.typeReferences) {
          entry.typeReferences = [];
        }
        entry.typeReferences.push(...typeRefs);
      }
      continue;
    }

    if (!currentSection || !currentSymbol) {
      continue;
    }

    if (currentSection === "parameters") {
      const bulletMatch = line.match(/^\s*-\s+`([^`]+)`:\s*(.*)$/);
      if (bulletMatch) {
        flushParameter();
        pendingParameter = {
          name: bulletMatch[1],
          description: bulletMatch[2] ?? ""
        };
        continue;
      }

      if (pendingParameter) {
        const continuation = line.trim();
        if (continuation) {
          pendingParameter.description += `\n${continuation}`;
        }
      }
      continue;
    }

    buffer.push(line);
  }

  flushParameter();
  flushBuffer();

  return documentation;
}

interface ResolvedDependencyTarget {
  codePath: string;
  docPath?: string;
  anchor?: string;
}

function resolveDependencyTarget(
  rawTarget: string,
  docDir: string,
  workspaceRoot: string,
  config: LiveDocumentationConfig
): ResolvedDependencyTarget | undefined {
  const target = rawTarget.trim();
  if (!target || /^[a-z]+:\/\//i.test(target)) {
    return undefined;
  }

  const [pathComponent, anchorComponent] = target.split("#", 2);
  if (!pathComponent) {
    return undefined;
  }

  const absolute = path.resolve(docDir, pathComponent);
  const workspaceResolved = path.resolve(workspaceRoot);
  const absoluteResolved = path.resolve(absolute);
  if (
    absoluteResolved !== workspaceResolved &&
    !absoluteResolved.startsWith(`${workspaceResolved}${path.sep}`)
  ) {
    return undefined;
  }

  const relative = path.relative(workspaceRoot, absoluteResolved);
  if (!relative) {
    return undefined;
  }

  const normalizedRelative = normalizeWorkspacePath(relative);
  const liveDocsPrefix = normalizeWorkspacePath(path.join(config.root, config.baseLayer));

  const anchor = anchorComponent ? stripInlineCode(anchorComponent) : undefined;

  if (normalizedRelative === liveDocsPrefix) {
    return undefined;
  }

  if (normalizedRelative.startsWith(`${liveDocsPrefix}/`)) {
    const withoutPrefix = normalizedRelative.slice(liveDocsPrefix.length + 1);
    if (!withoutPrefix.endsWith(LIVE_DOCUMENTATION_FILE_EXTENSION)) {
      return undefined;
    }
    const codePath = withoutPrefix.slice(0, -LIVE_DOCUMENTATION_FILE_EXTENSION.length);
    const docPath = normalizeWorkspacePath(path.join(liveDocsPrefix, withoutPrefix));
    return {
      codePath,
      docPath,
      anchor
    };
  }

  return {
    codePath: normalizedRelative,
    anchor
  };
}

function stripInlineCode(token: string): string {
  let value = token.trim();
  while (value.startsWith("`")) {
    value = value.slice(1);
  }
  while (value.endsWith("`")) {
    value = value.slice(0, -1);
  }
  return value.trim();
}

/**
 * Parses a type reference from a metadata line like:
 * - `- Returns: [\`Widget\`](./types.ts.mdmd.md#symbol-widget)`
 * - `- Returns: \`Widget\``
 * - `- Extends: [\`BaseClass\`](./base.ts.mdmd.md#symbol-baseclass)`
 *
 * @param content The content after the role label (e.g., "[\`Widget\`](./types.ts.mdmd.md#symbol-widget)")
 * @param role The role of this type reference
 * @param parameterName Optional parameter name for parameter types
 * @returns Array of parsed type references (may be multiple for union/intersection types)
 */
function parseTypeReferencesFromContent(
  content: string,
  role: ParsedTypeReference["role"],
  parameterName?: string
): ParsedTypeReference[] {
  const refs: ParsedTypeReference[] = [];
  
  // Split by comma and/or pipe (union types) to handle multiple types
  // E.g., "[\`Widget\`](./a.md), \`Error\`" or "\`A\` | \`B\`"
  const segments = content.split(/[,|]/).map(s => s.trim()).filter(Boolean);
  
  for (const segment of segments) {
    // Try to match a markdown link: [`TypeName`](path#anchor)
    const linkMatch = segment.match(/\[`([^`]+)`\]\(([^)]+)\)/);
    if (linkMatch) {
      const typeName = linkMatch[1];
      const fullPath = linkMatch[2];
      const [targetDocPath, targetAnchor] = fullPath.split("#", 2);
      
      refs.push({
        typeName,
        role,
        parameterName,
        isResolved: true,
        targetDocPath: targetDocPath || undefined,
        targetAnchor: targetAnchor || undefined
      });
      continue;
    }
    
    // Try to match plain code span: `TypeName` or `TypeName`[]
    const codeMatch = segment.match(/`([^`]+)`(\[\])?/);
    if (codeMatch) {
      const typeName = codeMatch[1] + (codeMatch[2] ?? "");
      refs.push({
        typeName,
        role,
        parameterName,
        isResolved: false
      });
    }
  }
  
  return refs;
}

/**
 * Parses a full type reference line from the Public Symbols section.
 * Handles lines like:
 * - `- Returns: [\`Widget\`](./types.ts.mdmd.md#symbol-widget)`
 * - `- Parameters: \`input\`: \`string\`; \`options\`: [\`Config\`](./config.ts.mdmd.md#symbol-config)`
 * - `- Extends: [\`BaseClass\`](./base.ts.mdmd.md#symbol-baseclass)`
 * - `- Implements: [\`Interface\`](./interface.ts.mdmd.md#symbol-interface)`
 * - `- Constraints: \`T\` extends [\`Widget\`](./types.ts.mdmd.md#symbol-widget)`
 */
function parseTypeReferenceLine(line: string): ParsedTypeReference[] {
  const trimmed = line.trim();
  if (!trimmed.startsWith("-")) {
    return [];
  }
  
  // Match the role prefix
  const returnsMatch = trimmed.match(/^-\s+Returns:\s+(.+)$/);
  if (returnsMatch) {
    return parseTypeReferencesFromContent(returnsMatch[1], "return");
  }
  
  const extendsMatch = trimmed.match(/^-\s+Extends:\s+(.+)$/);
  if (extendsMatch) {
    return parseTypeReferencesFromContent(extendsMatch[1], "extends");
  }
  
  const implementsMatch = trimmed.match(/^-\s+Implements:\s+(.+)$/);
  if (implementsMatch) {
    return parseTypeReferencesFromContent(implementsMatch[1], "implements");
  }
  
  const constraintsMatch = trimmed.match(/^-\s+Constraints:\s+(.+)$/);
  if (constraintsMatch) {
    return parseTypeReferencesFromContent(constraintsMatch[1], "constraint");
  }
  
  // Parameters line: `- Parameters: \`name\`: Type; \`other\`: Type`
  const paramsMatch = trimmed.match(/^-\s+Parameters:\s+(.+)$/);
  if (paramsMatch) {
    const refs: ParsedTypeReference[] = [];
    // Split by semicolon for each parameter
    const paramSegments = paramsMatch[1].split(";").map(s => s.trim()).filter(Boolean);
    for (const seg of paramSegments) {
      // Match `paramName`: TypeContent
      const paramMatch = seg.match(/`([^`]+)`:\s*(.+)/);
      if (paramMatch) {
        const paramName = paramMatch[1];
        const typeContent = paramMatch[2];
        refs.push(...parseTypeReferencesFromContent(typeContent, "parameter", paramName));
      }
    }
    return refs;
  }
  
  return [];
}

function dependencyKey(entry: ParsedDependency): string {
  const parts = [
    entry.codePath ?? "",
    entry.docPath ?? "",
    entry.anchor ?? "",
    entry.label ?? "",
    entry.raw
  ];
  return parts.join("|");
}
