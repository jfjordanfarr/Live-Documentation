/**
 * Markdown rendering for Live Documentation.
 *
 * @remarks
 * This module generates the markdown content for Live Doc sections,
 * including Public Symbols, Dependencies, and Re-exported Anchors.
 *
 * @module
 */

import path from "node:path";

import { RESERVED_HEADING_NAMES } from "./coreConstants";
import type {
  PublicSymbolEntry,
  PublicSymbolHeadingInfo,
  SourceAnalysisResult,
  DependencyEntry,
  ReExportedSymbolInfo,
  TypeReference,
  ResolvedSymbolLocation,
  WorkspaceSymbolIndex
} from "./coreTypes";
import {
  formatSourceLink,
  formatRelativePathFromDoc,
  createSymbolSlug,
  toModuleLabel,
  formatInlineCode,
  formatDependencyQualifier,
  displayDependencyKey,
  compareSymbolLocationsPreferOrigin
} from "./coreUtils";

// ============================================================================
// Public Symbol Heading Computation
// ============================================================================

function normalizeSymbolNameKey(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Computes display names and slugs for public symbol headings.
 *
 * @remarks
 * Handles disambiguation when multiple symbols share the same name,
 * and ensures slugs are unique within the document.
 *
 * @param symbols - Array of public symbol entries to process
 * @returns Array of heading info with display names and slugs
 */
export function computePublicSymbolHeadingInfo(symbols: PublicSymbolEntry[]): PublicSymbolHeadingInfo[] {
  const infos: PublicSymbolHeadingInfo[] = [];
  const nameCounts = new Map<string, number>();
  const nameKindCounts = new Map<string, number>();
  const slugCounts = new Map<string, number>();
  const slugKindCounts = new Map<string, number>();

  for (const symbol of symbols) {
    const normalizedNameKey = normalizeSymbolNameKey(symbol.name);
    const kindLabel = symbol.kind ?? "symbol";
    const nameKindKey = `${normalizedNameKey}::${kindLabel}`;

    nameCounts.set(normalizedNameKey, (nameCounts.get(normalizedNameKey) ?? 0) + 1);
    nameKindCounts.set(nameKindKey, (nameKindCounts.get(nameKindKey) ?? 0) + 1);

    const slugValue = createSymbolSlug(symbol.name) ?? "";
    if (slugValue) {
      const slugKindKey = `${slugValue}::${kindLabel}`;
      slugCounts.set(slugValue, (slugCounts.get(slugValue) ?? 0) + 1);
      slugKindCounts.set(slugKindKey, (slugKindCounts.get(slugKindKey) ?? 0) + 1);
    }
  }

  const kindOccurrences = new Map<string, number>();

  for (const symbol of symbols) {
    const normalizedNameKey = normalizeSymbolNameKey(symbol.name);
    const kindLabel = symbol.kind ?? "symbol";
    const nameKindKey = `${normalizedNameKey}::${kindLabel}`;
    const initialSlug = createSymbolSlug(symbol.name) ?? "";
    const slugKindKey = initialSlug ? `${initialSlug}::${kindLabel}` : undefined;

    let occurrence = 0;
    let occurrenceKey: string | undefined;

    const duplicateNameCount = nameCounts.get(normalizedNameKey) ?? 0;
    const duplicateKindCount = nameKindCounts.get(nameKindKey) ?? 0;
    const slugCollisionCount = initialSlug ? slugCounts.get(initialSlug) ?? 0 : 0;
    const slugKindCollisionCount = slugKindKey ? slugKindCounts.get(slugKindKey) ?? 0 : 0;
    const normalizedName = normalizedNameKey;
    const isReservedHeadingName = RESERVED_HEADING_NAMES.has(normalizedName);
    const baseSlug = initialSlug;

    const shouldDisambiguateByName = duplicateNameCount > 1;
    const shouldDisambiguateBySlug = !shouldDisambiguateByName && slugCollisionCount > 1;

    if (shouldDisambiguateByName) {
      occurrenceKey = nameKindKey;
    } else if (shouldDisambiguateBySlug && slugKindKey) {
      occurrenceKey = slugKindKey;
    }

    if (occurrenceKey) {
      occurrence = (kindOccurrences.get(occurrenceKey) ?? 0) + 1;
      kindOccurrences.set(occurrenceKey, occurrence);
    }

    let displayName = symbol.name;
    if (shouldDisambiguateByName || shouldDisambiguateBySlug) {
      const kindSpecificCount = shouldDisambiguateByName ? duplicateKindCount : slugKindCollisionCount;
      if (kindSpecificCount === 1 && symbol.kind) {
        displayName = `${symbol.name} (${symbol.kind})`;
      } else {
        const labelBase = symbol.kind ? `${symbol.kind} overload` : "variant";
        const ordinal = occurrence > 0 ? occurrence : 1;
        displayName = `${symbol.name} (${labelBase} ${ordinal})`;
      }
    } else if (isReservedHeadingName) {
      const descriptiveKind = symbol.kind ?? "symbol";
      displayName = `${symbol.name} (${descriptiveKind})`;
    }

    let resolvedSlug: string;
    if (shouldDisambiguateByName || shouldDisambiguateBySlug) {
      resolvedSlug = createSymbolSlug(displayName) ?? baseSlug;
    } else if (isReservedHeadingName) {
      resolvedSlug = baseSlug || createSymbolSlug(displayName) || "";
    } else {
      resolvedSlug = createSymbolSlug(displayName) ?? baseSlug;
    }
    infos.push({
      symbol,
      displayName,
      slug: resolvedSlug
    });
  }

  ensureUniqueSymbolSlugs(infos);

  return infos;
}

function ensureUniqueSymbolSlugs(headings: PublicSymbolHeadingInfo[]): void {
  const used = new Set<string>();
  const suffixCounts = new Map<string, number>();

  for (const heading of headings) {
    if (!heading.slug) {
      continue;
    }

    const baseSlug = heading.slug;
    const normalizedBase = baseSlug.toLowerCase();
    if (!used.has(normalizedBase)) {
      used.add(normalizedBase);
      continue;
    }

    let suffix = suffixCounts.get(baseSlug) ?? 0;
    let candidate: string;
    do {
      suffix += 1;
      candidate = `${baseSlug}-${suffix}`;
    } while (used.has(candidate.toLowerCase()));

    suffixCounts.set(baseSlug, suffix);
    heading.slug = candidate;
    used.add(candidate.toLowerCase());
  }
}

// ============================================================================
// Public Symbol Rendering
// ============================================================================

/**
 * Renders the markdown lines that populate the `Public Symbols` section for a Live Doc.
 *
 * @remarks
 * The output includes symbol metadata (type, location, qualifiers) followed by
 * deterministic `#####` subsections per documented field (summary, remarks,
 * parameters, returns, etc.). This structure keeps docstring bridges stable and
 * individually addressable across languages.
 *
 * @param args.analysis - Analyzer output describing exported symbols and dependencies.
 * @param args.docDir - Absolute directory path of the Live Doc being written.
 * @param args.sourceAbsolute - Absolute path to the source file backing this Live Doc.
 * @param args.workspaceRoot - Workspace root, used to resolve relative links.
 * @param args.sourceRelativePath - Workspace-relative source path.
 * @param args.headings - Pre-computed heading info for symbols.
 * @param args.symbolIndex - Optional workspace-wide symbol index for resolving type references.
 * @param args.liveDocsRootAbsolute - Absolute path to the Live Docs root.
 *
 * @returns An array of markdown lines ready to insert beneath the `Public Symbols` heading.
 *
 * @see renderDependencyLines
 */
export function renderPublicSymbolLines(args: {
  analysis: SourceAnalysisResult;
  docDir: string;
  sourceAbsolute: string;
  workspaceRoot: string;
  sourceRelativePath: string;
  headings: PublicSymbolHeadingInfo[];
  /** Optional workspace-wide symbol index for resolving type references to Live Doc links. */
  symbolIndex?: WorkspaceSymbolIndex;
  /** Absolute path to the Live Docs root (e.g., "/workspace/.mdmd/layer-4"). */
  liveDocsRootAbsolute?: string;
}): string[] {
  const lines: string[] = [];

  for (const info of args.headings) {
    const symbol = info.symbol;
    const anchorSuffix = info.slug ? ` {#${info.slug}}` : "";
    lines.push(`#### \`${info.displayName}\`${anchorSuffix}`);

    const detailLines: string[] = [];
    const displayKind = symbol.kind ? symbol.kind : "symbol";

    const typeSuffixParts: string[] = [];
    if (symbol.isDefault) {
      typeSuffixParts.push("default");
    }
    if (symbol.isTypeOnly) {
      typeSuffixParts.push("type-only");
    }
    const typeSuffix = typeSuffixParts.length > 0 ? ` (${typeSuffixParts.join(", ")})` : "";
    detailLines.push(`- Type: ${displayKind}${typeSuffix}`);

    if (symbol.location) {
      const location = formatSourceLink({
        docDir: args.docDir,
        sourceAbsolute: args.sourceAbsolute,
        line: symbol.location.line
      });
      detailLines.push(`- Source: [source](${location})`);
    }

    // Render type references if present
    const typeRefLines = renderTypeReferences(
      symbol.typeReferences,
      args.symbolIndex,
      args.sourceRelativePath,
      args.docDir,
      args.liveDocsRootAbsolute
    );
    if (typeRefLines.length > 0) {
      detailLines.push(...typeRefLines);
    }

    if (detailLines.length > 0) {
      lines.push(...detailLines);
    }

    const documentationLines = renderSymbolDocumentationSections(symbol, info.displayName);
    if (documentationLines.length > 0) {
      lines.push("", ...documentationLines);
    }

    lines.push("");
  }

  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  return lines;
}

// ============================================================================
// Type Reference Rendering
// ============================================================================

/**
 * Result of resolving a type name to its Live Doc location.
 */
interface ResolvedTypeLocation {
  /** The resolved symbol location. */
  location: ResolvedSymbolLocation;
  /** True if the type is defined in the same file (intra-file reference). */
  isSelfReference: boolean;
}

/**
 * Resolves a type name to its Live Doc location using the workspace symbol index.
 *
 * @remarks
 * When multiple files export the same symbol (e.g., an origin file and a barrel
 * that re-exports it), this function prefers the **origin** file where the symbol
 * is actually defined. This produces more accurate documentation links.
 *
 * The resolution strategy:
 * 1. Filter out self-references (types in the current file)
 * 2. Prefer non-barrel files over barrel files (index.ts, mod.ts, etc.)
 * 3. Among files of the same barrel-ness, prefer deeper paths (more specific)
 *
 * @param typeName - The type name to resolve (e.g., "Widget", "Foo.Bar").
 * @param index - The workspace-wide symbol index.
 * @param currentSourcePath - The source path of the file being rendered.
 *
 * @returns The resolved location with self-reference flag, or undefined if not found.
 */
function resolveTypeToLiveDoc(
  typeName: string,
  index: WorkspaceSymbolIndex,
  currentSourcePath: string
): ResolvedTypeLocation | undefined {
  const locations = index.get(typeName);
  if (!locations || locations.length === 0) {
    return undefined;
  }

  // Separate self-references from external references
  const external = locations.filter((loc) => loc.sourcePath !== currentSourcePath);
  const selfRefs = locations.filter((loc) => loc.sourcePath === currentSourcePath);

  // Prefer external definitions, sorted to prefer origin files over barrels
  if (external.length > 0) {
    const sorted = external.slice().sort(compareSymbolLocationsPreferOrigin);
    return { location: sorted[0], isSelfReference: false };
  }

  // Fall back to self-reference (intra-file link)
  if (selfRefs.length > 0) {
    return { location: selfRefs[0], isSelfReference: true };
  }

  return undefined;
}

/**
 * Renders type references as markdown bullet points with optional Live Doc links.
 *
 * @remarks
 * Groups type references by role (returns, parameters, extends, implements)
 * and formats them as readable bullet points. When a symbol index is provided,
 * type names that resolve to workspace symbols are rendered as markdown links
 * to their Live Doc definitions.
 *
 * @param typeReferences - Array of type references extracted from the symbol.
 * @param symbolIndex - Optional workspace-wide symbol index for resolving type links.
 * @param currentSourcePath - Source path of the current file (to avoid self-links).
 * @param docDir - Directory of the current Live Doc (for relative path calculation).
 * @param liveDocsRootAbsolute - Absolute path to Live Docs root.
 * @returns Array of markdown lines representing the type references.
 */
function renderTypeReferences(
  typeReferences: TypeReference[] | undefined,
  symbolIndex?: WorkspaceSymbolIndex,
  currentSourcePath?: string,
  docDir?: string,
  liveDocsRootAbsolute?: string
): string[] {
  if (!typeReferences || typeReferences.length === 0) {
    return [];
  }

  const lines: string[] = [];

  // Create a type formatter with the resolution context
  const formatType = (ref: TypeReference): string => {
    return formatTypeReference(ref, symbolIndex, currentSourcePath, docDir, liveDocsRootAbsolute);
  };

  // Group by role
  const returnTypes = typeReferences.filter((ref) => ref.role === "return");
  const paramTypes = typeReferences.filter((ref) => ref.role === "parameter");
  const extendsTypes = typeReferences.filter((ref) => ref.role === "extends");
  const implementsTypes = typeReferences.filter((ref) => ref.role === "implements");
  const constraintTypes = typeReferences.filter((ref) => ref.role === "generic-constraint");

  // Render return types
  if (returnTypes.length > 0) {
    const formatted = formatTypeListWithLinks(returnTypes, formatType);
    lines.push(`- Returns: ${formatted}`);
  }

  // Render parameter types (grouped by parameter name)
  const paramsByName = new Map<string, TypeReference[]>();
  for (const param of paramTypes) {
    const name = param.parameterName ?? "_unnamed_";
    const existing = paramsByName.get(name) ?? [];
    existing.push(param);
    paramsByName.set(name, existing);
  }

  if (paramsByName.size > 0) {
    const paramEntries = Array.from(paramsByName.entries())
      .map(([name, refs]) => `\`${name}\`: ${formatTypeListWithLinks(refs, formatType)}`)
      .join("; ");
    lines.push(`- Parameters: ${paramEntries}`);
  }

  // Render extends
  if (extendsTypes.length > 0) {
    const formatted = formatTypeListWithLinks(extendsTypes, formatType);
    lines.push(`- Extends: ${formatted}`);
  }

  // Render implements
  if (implementsTypes.length > 0) {
    const formatted = formatTypeListWithLinks(implementsTypes, formatType);
    lines.push(`- Implements: ${formatted}`);
  }

  // Render generic constraints
  if (constraintTypes.length > 0) {
    const formatted = formatTypeListWithLinks(constraintTypes, formatType);
    lines.push(`- Constraints: ${formatted}`);
  }

  return lines;
}

/**
 * Formats a single type reference, optionally as a link if resolvable.
 *
 * @param ref - The type reference to format.
 * @param symbolIndex - Optional workspace symbol index.
 * @param currentSourcePath - Current source path to avoid self-links.
 * @param docDir - Current Live Doc directory for relative path calculation.
 * @param liveDocsRootAbsolute - Absolute path to Live Docs root.
 * @returns Formatted type string (code span or link).
 */
function formatTypeReference(
  ref: TypeReference,
  symbolIndex?: WorkspaceSymbolIndex,
  currentSourcePath?: string,
  docDir?: string,
  liveDocsRootAbsolute?: string
): string {
  // Try to resolve the type to a Live Doc
  let resolved: ResolvedTypeLocation | undefined;
  if (symbolIndex && currentSourcePath) {
    resolved = resolveTypeToLiveDoc(ref.name, symbolIndex, currentSourcePath);
  }

  let formatted: string;

  if (resolved && docDir && liveDocsRootAbsolute) {
    const { location, isSelfReference } = resolved;
    const fragment = location.anchor ? `#${location.anchor}` : "";

    if (isSelfReference) {
      // Intra-file reference: use fragment-only link (same document)
      formatted = `[\`${ref.name}\`](${fragment})`;
    } else {
      // External reference: compute relative path to target Live Doc
      const targetDocAbsolute = path.resolve(
        liveDocsRootAbsolute,
        "..",  // Go up from liveDocsRoot (which is .mdmd/layer-4) to .mdmd
        "..",  // Go up to workspace root
        location.liveDocPath
      );
      const relativePath = formatRelativePathFromDoc(docDir, targetDocAbsolute);
      formatted = `[\`${ref.name}\`](${relativePath}${fragment})`;
    }
  } else {
    // No resolution — render as plain code span
    formatted = `\`${ref.name}\``;
  }

  // Add array indicator
  if (ref.isArrayElement) {
    formatted = `${formatted}[]`;
  }

  // Add Promise indicator
  if (ref.isPromiseResolution) {
    formatted = `Promise<${formatted}>`;
  }

  return formatted;
}

/**
 * Formats a list of type references with optional links.
 *
 * @param refs - Array of type references to format.
 * @param formatFn - Function to format each individual type reference.
 * @returns A comma-separated string of formatted type names.
 */
function formatTypeListWithLinks(
  refs: TypeReference[],
  formatFn: (ref: TypeReference) => string
): string {
  const formatted = refs.map(formatFn);
  // Deduplicate and join
  const unique = [...new Set(formatted)];
  return unique.join(", ");
}

// ============================================================================
// Symbol Documentation Rendering
// ============================================================================

function renderSymbolDocumentationSections(symbol: PublicSymbolEntry, displayName: string): string[] {
  const documentation = symbol.documentation;
  if (!documentation) {
    return [];
  }

  const sections: Array<{ title: string; body: string[] }> = [];
  const pushSection = (title: string, body: string[] | undefined): void => {
    if (!body || body.length === 0) {
      return;
    }
    sections.push({ title, body });
  };

  pushSection("Summary", normalizeDocText(documentation.summary));
  pushSection("Remarks", normalizeDocText(documentation.remarks));

  if (documentation.parameters && documentation.parameters.length > 0) {
    const parameterLines = documentation.parameters.map((param) => {
      const description = param.description?.trim()
        ? param.description.trim()
        : "_Not documented_";
      return `- \`${param.name}\`: ${description}`;
    });
    pushSection("Parameters", parameterLines);
  }

  if (documentation.typeParameters && documentation.typeParameters.length > 0) {
    const typeParameterLines = documentation.typeParameters.map((param) => {
      const description = param.description?.trim()
        ? param.description.trim()
        : "_Not documented_";
      return `- \`${param.name}\`: ${description}`;
    });
    pushSection("Type Parameters", typeParameterLines);
  }

  pushSection("Returns", normalizeDocText(documentation.returns));
  pushSection("Value", normalizeDocText(documentation.value));

  if (documentation.exceptions && documentation.exceptions.length > 0) {
    const exceptionLines = documentation.exceptions.map((exception) => {
      const head = exception.type ? `\`${exception.type}\`` : "_Unknown_";
      if (exception.description?.trim()) {
        return `- ${head}: ${exception.description.trim()}`;
      }
      return `- ${head}`;
    });
    pushSection("Exceptions", exceptionLines);
  }

  if (documentation.examples && documentation.examples.length > 0) {
    const exampleLines: string[] = [];
    documentation.examples.forEach((example, index) => {
      if (index > 0) {
        exampleLines.push("");
      }
      const descriptionLines = normalizeDocText(example.description);
      if (descriptionLines) {
        exampleLines.push(...descriptionLines);
      }
      if (example.code) {
          if (exampleLines.length > 0 && exampleLines[exampleLines.length - 1] !== "") {
            exampleLines.push("");
          }
        const fence = example.language ? `\`\`\`${example.language}` : "```";
        exampleLines.push(fence);
        exampleLines.push(example.code);
        exampleLines.push("```");
      }
    });
    pushSection("Examples", exampleLines);
  }

  if (documentation.links && documentation.links.length > 0) {
    const linkLines = documentation.links.map((link) => {
      switch (link.kind) {
        case "href": {
          const label = link.text?.trim() || link.target;
          return `- [${label}](${link.target})`;
        }
        case "cref": {
          const suffix = link.text?.trim() ? ` — ${link.text.trim()}` : "";
          return `- \`${link.target}\`${suffix}`;
        }
        default: {
          const suffix = link.text?.trim() ? ` — ${link.text.trim()}` : "";
          return `- ${link.target}${suffix}`;
        }
      }
    });
    pushSection("Links", linkLines);
  }

  if (documentation.rawFragments && documentation.rawFragments.length > 0) {
    const rawLines = documentation.rawFragments.map((fragment) => `- ${fragment}`);
    pushSection("Additional Documentation", rawLines);
  }

  if (documentation.unsupportedTags && documentation.unsupportedTags.length > 0) {
    const unsupportedLines = documentation.unsupportedTags.map((tag) => `- \`${tag}\``);
    pushSection("Unsupported Doc Tags", unsupportedLines);
  }

  if (sections.length === 0) {
    return [];
  }

  const headingPrefix = `##### \`${displayName}\` — `;
  const lines: string[] = [];

  for (const section of sections) {
    lines.push(`${headingPrefix}${section.title}`);
    lines.push(...section.body);
    lines.push("");
  }

  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  return lines;
}

function normalizeDocText(value?: string): string[] | undefined {
  if (!value) {
    return undefined;
  }

  const lines = value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+$/u, ""));

  let start = 0;
  while (start < lines.length && lines[start].trim() === "") {
    start += 1;
  }
  let end = lines.length - 1;
  while (end >= start && lines[end].trim() === "") {
    end -= 1;
  }

  const normalized = lines.slice(start, end + 1);
  return normalized.length > 0 ? normalized : undefined;
}

// ============================================================================
// Dependency Rendering
// ============================================================================

/**
 * Renders the markdown bullet list for a Live Doc's `Dependencies` section.
 *
 * @remarks
 * Module specifiers that resolve inside the workspace are linked directly to
 * their Live Doc counterparts, while external dependencies are emitted as inline
 * code with optional symbol suffixes.
 *
 * @param args.analysis - Analyzer output describing imported and re-exported modules.
 * @param args.docDir - Directory containing the Live Doc being written.
 * @param args.workspaceRoot - Workspace root used to compute relative links.
 * @param args.liveDocsRootAbsolute - Absolute path to the Live Docs mirror root.
 * @param args.docExtension - File extension for Live Docs (e.g., ".mdmd.md").
 * @param args.headings - Symbol heading info for anchor resolution within the current file.
 * @param args.symbolIndex - Optional workspace-wide symbol index for cross-file anchor resolution.
 *
 * @see renderPublicSymbolLines
 *
 * @returns Markdown lines suitable for the `Dependencies` section, or an empty array when none exist.
 */
export function renderDependencyLines(args: {
  analysis: SourceAnalysisResult;
  docDir: string;
  workspaceRoot: string;
  liveDocsRootAbsolute: string;
  docExtension: string;
  headings: PublicSymbolHeadingInfo[];
  /** Optional workspace-wide symbol index for resolving imported symbols to correct anchors. */
  symbolIndex?: WorkspaceSymbolIndex;
}): string[] {
  if (args.analysis.dependencies.length === 0) {
    return [];
  }

  const slugIndex = buildSymbolSlugIndex(args.headings);
  const grouped = new Map<
    string,
    { entry: DependencyEntry; symbols: Set<string>; targets: Record<string, string> }
  >();

  for (const dependency of args.analysis.dependencies) {
    const key = displayDependencyKey(dependency);
    const bucket =
      grouped.get(key) ?? {
        entry: dependency,
        symbols: new Set<string>(),
        targets: {}
      };
    for (const symbol of dependency.symbols) {
      bucket.symbols.add(symbol);
      const targetName = dependency.symbolTargets?.[symbol];
      if (targetName) {
        bucket.targets[symbol] = targetName;
      } else if (!bucket.targets[symbol]) {
        bucket.targets[symbol] = symbol;
      }
    }
    grouped.set(key, bucket);
  }

  const keys = Array.from(grouped.keys()).sort();
  const lines: string[] = [];

  for (const key of keys) {
    const bucket = grouped.get(key)!;
    const dependency = bucket.entry;
    const qualifierSuffix = formatDependencyQualifier(dependency);

    if (dependency.resolvedPath) {
      const moduleLabel = toModuleLabel(dependency.resolvedPath);
      const docAbsolute = path.resolve(
        args.liveDocsRootAbsolute,
        `${dependency.resolvedPath}${args.docExtension}`
      );
      const docRelative = formatRelativePathFromDoc(args.docDir, docAbsolute);
      const symbols = Array.from(bucket.symbols).sort();

      if (symbols.length === 0) {
        lines.push(`- [${formatInlineCode(moduleLabel)}](${docRelative})${qualifierSuffix}`);
        continue;
      }

      for (const symbolName of symbols) {
        const anchorName = bucket.targets[symbolName] ?? symbolName;
        // Try to resolve slug from workspace-wide index first (cross-file), then fall back to local headings
        const workspaceSlug = resolveSymbolSlugFromIndex(
          anchorName,
          dependency.resolvedPath,
          args.symbolIndex
        );
        const slug =
          workspaceSlug ?? resolveSymbolSlug(anchorName, slugIndex) ?? createSymbolSlug(anchorName);
        const fragment = slug ? `#${slug}` : "";
        // Avoid redundancy like "Reader.Reader" when symbol equals module name (common in Java)
        const label =
          symbolName.toLowerCase() === moduleLabel.toLowerCase()
            ? symbolName
            : `${moduleLabel}.${symbolName}`;
        lines.push(`- [${formatInlineCode(label)}](${docRelative}${fragment})${qualifierSuffix}`);
      }
      continue;
    }

    const externalSymbols = Array.from(bucket.symbols)
      .sort()
      .map((name) => formatInlineCode(name));
    const symbolSuffix = externalSymbols.length ? ` - ${externalSymbols.join(", ")}` : "";
    lines.push(`- ${formatInlineCode(dependency.specifier)}${symbolSuffix}${qualifierSuffix}`);
  }

  return lines;
}

function buildSymbolSlugIndex(headings: PublicSymbolHeadingInfo[]): Map<string, string> {
  const index = new Map<string, string>();

  for (const info of headings) {
    registerSymbolAlias(index, info.displayName, info.slug);
    registerSymbolAlias(index, info.symbol.name, info.slug);
    if (info.symbol.qualifiedName) {
      registerSymbolAlias(index, info.symbol.qualifiedName, info.slug);
    }
  }

  return index;
}

function registerSymbolAlias(index: Map<string, string>, alias: string | undefined, slugValue: string): void {
  if (!alias || !slugValue) {
    return;
  }

  const trimmed = alias.trim();
  if (!trimmed) {
    return;
  }

  const lower = trimmed.toLowerCase();
  if (!index.has(trimmed)) {
    index.set(trimmed, slugValue);
  }
  if (!index.has(lower)) {
    index.set(lower, slugValue);
  }
}

function resolveSymbolSlug(alias: string | undefined, index: Map<string, string>): string | undefined {
  if (!alias) {
    return undefined;
  }

  const direct = index.get(alias) ?? index.get(alias.toLowerCase());
  if (direct) {
    return direct;
  }

  const segments = alias.split(".");
  if (segments.length > 1) {
    const last = segments[segments.length - 1];
    const resolved = index.get(last) ?? index.get(last.toLowerCase());
    if (resolved) {
      return resolved;
    }
  }

  return undefined;
}

/**
 * Resolves a symbol slug from the workspace-wide symbol index.
 *
 * @remarks
 * This function looks up the correct anchor slug for an imported symbol
 * by finding it in the workspace symbol index, filtered by source path.
 * This handles cases where symbols are disambiguated (e.g., `Analyzer`
 * becomes `symbol-analyzer-class` when the file also has a constructor).
 *
 * @param symbolName - The symbol name to look up.
 * @param targetSourcePath - The workspace-relative source path where the symbol is defined.
 * @param index - The workspace-wide symbol index.
 * @returns The resolved anchor slug, or undefined if not found.
 */
function resolveSymbolSlugFromIndex(
  symbolName: string,
  targetSourcePath: string,
  index: WorkspaceSymbolIndex | undefined
): string | undefined {
  if (!index || !symbolName || !targetSourcePath) {
    return undefined;
  }

  // Normalize path separators for comparison
  const normalizedTarget = targetSourcePath.replace(/\\/gu, "/");

  // Look up all locations for this symbol name
  const locations = index.get(symbolName) ?? index.get(symbolName.toLowerCase());
  if (!locations || locations.length === 0) {
    return undefined;
  }

  // Find the location matching our target source path
  const matchingLocation = locations.find((loc) => {
    const normalizedSource = loc.sourcePath.replace(/\\/gu, "/");
    return normalizedSource === normalizedTarget;
  });

  return matchingLocation?.anchor;
}

// ============================================================================
// Re-Exported Anchor Rendering
// ============================================================================

/**
 * Renders the markdown for the Re-Exported Symbol Anchors section.
 *
 * @param args.reExports - Array of re-exported symbol info
 * @param args.docDir - Directory containing the Live Doc being written
 * @param args.liveDocsRootAbsolute - Absolute path to the Live Docs mirror root
 * @param args.docExtension - File extension for Live Docs
 *
 * @returns Markdown lines for re-exported anchors, or empty array if none
 */
export function renderReExportedAnchorLines(args: {
  reExports: ReExportedSymbolInfo[];
  docDir: string;
  liveDocsRootAbsolute: string;
  docExtension: string;
}): string[] {
  if (args.reExports.length === 0) {
    return [];
  }

  const sorted = [...args.reExports].sort((a, b) => a.name.localeCompare(b.name));
  const lines: string[] = [];

  for (const entry of sorted) {
    const slugValue = createSymbolSlug(entry.name);
    const anchorSuffix = slugValue ? ` {#${slugValue}}` : "";
    lines.push(`#### \`${entry.name}\`${anchorSuffix}`);

    const qualifierParts: string[] = [];
    if (entry.isTypeOnly) {
      qualifierParts.push("type-only");
    }

    if (entry.sourceModulePath) {
      const moduleDocAbsolute = path.resolve(
        args.liveDocsRootAbsolute,
        `${entry.sourceModulePath}${args.docExtension}`
      );
      const relative = formatRelativePathFromDoc(args.docDir, moduleDocAbsolute);
      const moduleLabel = toModuleLabel(entry.sourceModulePath);
      const fragment = slugValue ? `#${slugValue}` : "";
      const qualifierSuffix = qualifierParts.length ? ` (${qualifierParts.join(", ")})` : "";
      lines.push(
        `- Re-exported from [${formatInlineCode(moduleLabel)}](${relative}${fragment})${qualifierSuffix}`
      );
    } else {
      const qualifierSuffix = qualifierParts.length ? ` (${qualifierParts.join(", ")})` : "";
      lines.push(`- Re-exported from external module${qualifierSuffix}`);
    }

    lines.push("");
  }

  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  return lines;
}
