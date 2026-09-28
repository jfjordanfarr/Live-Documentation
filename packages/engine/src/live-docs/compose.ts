/**
 * From analysis to document: the resolution step of generation.
 *
 * @remarks
 * A source file's analysis names symbols and dependencies. Composing turns
 * them into what a Live Doc records: headings with unique anchors, links to
 * the docs that declare the types a symbol uses, links to the docs of the
 * files it depends on, and the documentation sections. The result is a
 * {@link LiveDoc} fragment that `renderLiveDoc` writes out.
 *
 * @module
 */

import path from "node:path";

import { getSyntaxByPath } from "../languages";
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
  formatRelativePathFromDoc,
  createSymbolSlug,
  toModuleLabel,
  formatInlineCode,
  displayDependencyKey,
  createProximityAwareComparator
} from "./coreUtils";
import type { Dependency, DocSection, ReExport, ReferenceLine, SymbolBlock, TypeRef } from "./document";

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
// Public Symbols
// ============================================================================

/**
 * Composes the `Public Symbols` section of a Live Doc.
 *
 * @param args.headings - The symbols with their display names and anchors, from {@link computePublicSymbolHeadingInfo}.
 * @param args.docDir - Absolute directory of the Live Doc being written; links are relative to it.
 * @param args.sourceAbsolute - Absolute path of the source file, for the `Source:` links.
 * @param args.sourceRelativePath - Workspace-relative source path, so a type declared in this file links within the doc.
 * @param args.symbolIndex - The workspace symbol index that resolves a type name to the doc that declares it.
 * @param args.liveDocsRootAbsolute - Absolute path of the Live Docs root.
 */
export function composeSymbolBlocks(args: {
  headings: PublicSymbolHeadingInfo[];
  docDir: string;
  sourceAbsolute: string;
  sourceRelativePath: string;
  symbolIndex?: WorkspaceSymbolIndex;
  liveDocsRootAbsolute?: string;
}): SymbolBlock[] {
  return args.headings.map((info) => {
    const symbol = info.symbol;
    const flags: string[] = [];
    if (symbol.isDefault) {
      flags.push("default");
    }
    if (symbol.isTypeOnly) {
      flags.push("type-only");
    }
    const block: SymbolBlock = {
      name: info.displayName,
      slug: info.slug || undefined,
      kind: symbol.kind ? symbol.kind : "symbol",
      flags,
      references: composeReferences(symbol.typeReferences, args),
      sections: composeDocSections(symbol)
    };
    if (symbol.location) {
      block.source = {
        path: formatRelativePathFromDoc(args.docDir, args.sourceAbsolute),
        line: symbol.location.line
      };
    }
    return block;
  });
}

// ============================================================================
// Type References
// ============================================================================

interface ResolvedTypeLocation {
  location: ResolvedSymbolLocation;
  /** True if the type is defined in the same file (intra-file reference). */
  isSelfReference: boolean;
}

/**
 * Resolves a type name to its Live Doc location using the workspace symbol index.
 *
 * @remarks
 * A type the file itself declares links within the doc, whatever other files
 * declare under the same name. Otherwise the candidates are the files written
 * in the same language: one that declares the type wins over a barrel that only
 * re-exports it, then the file closest to the one being rendered.
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

  const here = locations.filter((loc) => loc.sourcePath === currentSourcePath);
  const declaredHere = here.find((loc) => !loc.isReExport);
  if (declaredHere) {
    return { location: declaredHere, isSelfReference: true };
  }

  const language = languageOf(currentSourcePath);
  const elsewhere = locations
    .filter((loc) => loc.sourcePath !== currentSourcePath && languageOf(loc.sourcePath) === language)
    .sort(compareDeclarationsFirst(currentSourcePath));
  if (elsewhere.length > 0) {
    return { location: elsewhere[0], isSelfReference: false };
  }

  return here.length > 0 ? { location: here[0], isSelfReference: true } : undefined;
}

/** Orders candidates: a file that declares the symbol before one that re-exports it, then by proximity. */
function compareDeclarationsFirst(currentSourcePath: string) {
  const byProximity = createProximityAwareComparator(currentSourcePath);
  return (a: ResolvedSymbolLocation, b: ResolvedSymbolLocation): number => {
    if (Boolean(a.isReExport) !== Boolean(b.isReExport)) {
      return a.isReExport ? 1 : -1;
    }
    return byProximity(a, b);
  };
}

/** The language a file is written in, by the registry, or its extension when the registry does not know it. */
function languageOf(sourcePath: string): string {
  return getSyntaxByPath(sourcePath)?.id ?? path.extname(sourcePath).toLowerCase();
}

function composeReferences(
  typeReferences: TypeReference[] | undefined,
  args: { docDir: string; sourceRelativePath: string; symbolIndex?: WorkspaceSymbolIndex; liveDocsRootAbsolute?: string }
): ReferenceLine[] {
  if (!typeReferences || typeReferences.length === 0) {
    return [];
  }

  const compose = (refs: TypeReference[]): TypeRef[] => {
    const types: TypeRef[] = [];
    const seen = new Set<string>();
    for (const ref of refs) {
      const type = composeTypeRef(ref, args);
      const key = JSON.stringify(type);
      if (!seen.has(key)) {
        seen.add(key);
        types.push(type);
      }
    }
    return types;
  };

  const lines: ReferenceLine[] = [];
  const byRole = (role: TypeReference["role"]) => typeReferences.filter((ref) => ref.role === role);

  const returnTypes = byRole("return");
  if (returnTypes.length > 0) {
    lines.push({ role: "Returns", types: compose(returnTypes) });
  }

  const paramsByName = new Map<string, TypeReference[]>();
  for (const param of byRole("parameter")) {
    const name = param.parameterName ?? "_unnamed_";
    const existing = paramsByName.get(name) ?? [];
    existing.push(param);
    paramsByName.set(name, existing);
  }
  if (paramsByName.size > 0) {
    lines.push({
      role: "Parameters",
      parameters: Array.from(paramsByName.entries()).map(([name, refs]) => ({ name, types: compose(refs) }))
    });
  }

  const extendsTypes = byRole("extends");
  if (extendsTypes.length > 0) {
    lines.push({ role: "Extends", types: compose(extendsTypes) });
  }

  const implementsTypes = byRole("implements");
  if (implementsTypes.length > 0) {
    lines.push({ role: "Implements", types: compose(implementsTypes) });
  }

  const constraintTypes = byRole("generic-constraint");
  if (constraintTypes.length > 0) {
    lines.push({ role: "Constraints", types: compose(constraintTypes) });
  }

  return lines;
}

function composeTypeRef(
  ref: TypeReference,
  args: { docDir: string; sourceRelativePath: string; symbolIndex?: WorkspaceSymbolIndex; liveDocsRootAbsolute?: string }
): TypeRef {
  const type: TypeRef = { name: ref.name };

  const resolved = args.symbolIndex
    ? resolveTypeToLiveDoc(ref.name, args.symbolIndex, args.sourceRelativePath)
    : undefined;

  if (resolved && args.liveDocsRootAbsolute) {
    const { location, isSelfReference } = resolved;
    const fragment = location.anchor ? `#${location.anchor}` : "";
    if (isSelfReference) {
      type.link = fragment;
    } else {
      // liveDocPath is workspace-relative; the Live Docs root sits two levels below the workspace root.
      const targetDocAbsolute = path.resolve(args.liveDocsRootAbsolute, "..", "..", location.liveDocPath);
      type.link = `${formatRelativePathFromDoc(args.docDir, targetDocAbsolute)}${fragment}`;
    }
  }

  if (ref.isArrayElement) {
    type.array = true;
  }
  if (ref.isPromiseResolution) {
    type.promise = true;
  }
  return type;
}

// ============================================================================
// Symbol Documentation
// ============================================================================

function composeDocSections(symbol: PublicSymbolEntry): DocSection[] {
  const documentation = symbol.documentation;
  if (!documentation) {
    return [];
  }

  const sections: DocSection[] = [];
  const pushSection = (title: string, body: string[] | undefined): void => {
    if (!body || body.length === 0) {
      return;
    }
    sections.push({ title, body });
  };

  pushSection("Summary", normalizeDocText(documentation.summary));
  pushSection("Remarks", normalizeDocText(documentation.remarks));

  if (documentation.parameters && documentation.parameters.length > 0) {
    pushSection("Parameters", documentation.parameters.map((param) => {
      const description = param.description?.trim() ? param.description.trim() : "_Not documented_";
      return `- \`${param.name}\`: ${description}`;
    }));
  }

  if (documentation.typeParameters && documentation.typeParameters.length > 0) {
    pushSection("Type Parameters", documentation.typeParameters.map((param) => {
      const description = param.description?.trim() ? param.description.trim() : "_Not documented_";
      return `- \`${param.name}\`: ${description}`;
    }));
  }

  pushSection("Returns", normalizeDocText(documentation.returns));
  pushSection("Value", normalizeDocText(documentation.value));

  if (documentation.exceptions && documentation.exceptions.length > 0) {
    pushSection("Exceptions", documentation.exceptions.map((exception) => {
      const head = exception.type ? `\`${exception.type}\`` : "_Unknown_";
      return exception.description?.trim() ? `- ${head}: ${exception.description.trim()}` : `- ${head}`;
    }));
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
        const code = example.code.replace(/\r\n?/gu, "\n");
        exampleLines.push(example.language ? `\`\`\`${example.language}` : "```", code, "```");
      }
    });
    pushSection("Examples", exampleLines);
  }

  if (documentation.links && documentation.links.length > 0) {
    pushSection("Links", documentation.links.map((link) => {
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
    }));
  }

  if (documentation.rawFragments && documentation.rawFragments.length > 0) {
    pushSection("Additional Documentation", documentation.rawFragments.map((fragment) => `- ${fragment}`));
  }

  if (documentation.unsupportedTags && documentation.unsupportedTags.length > 0) {
    pushSection("Unsupported Doc Tags", documentation.unsupportedTags.map((tag) => `- \`${tag}\``));
  }

  return sections;
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
// Dependencies
// ============================================================================

/**
 * Composes the `Dependencies` section of a Live Doc.
 *
 * @remarks
 * A dependency that resolves inside the workspace becomes one line per imported
 * symbol, each linking to the symbol's anchor in the target doc, or one line
 * for the whole module when no symbol is named. An external dependency keeps
 * its specifier and the symbols taken from it. A dependency observed from a
 * contract or from configuration carries its basis as a qualifier, on lines of
 * its own even when a source-observed dependency names the same file.
 *
 * @param args.analysis - Analyzer output describing imported and re-exported modules.
 * @param args.docDir - Directory containing the Live Doc being written.
 * @param args.liveDocsRootAbsolute - Absolute path to the Live Docs mirror root.
 * @param args.docExtension - File extension for Live Docs (e.g., ".mdmd.md").
 * @param args.headings - Symbol heading info for anchor resolution within the current file.
 * @param args.symbolIndex - The workspace symbol index, for anchors in other files.
 */
export function composeDependencies(args: {
  analysis: SourceAnalysisResult;
  docDir: string;
  liveDocsRootAbsolute: string;
  docExtension: string;
  headings: PublicSymbolHeadingInfo[];
  symbolIndex?: WorkspaceSymbolIndex;
}): Dependency[] {
  if (args.analysis.dependencies.length === 0) {
    return [];
  }

  const slugIndex = buildSymbolSlugIndex(args.headings);
  const grouped = new Map<
    string,
    { entry: DependencyEntry; symbols: Set<string>; targets: Record<string, string> }
  >();

  for (const dependency of args.analysis.dependencies) {
    // A separator that sorts before every character keeps `a` before `a/b`, as it was before the basis joined the key.
    const key = `${displayDependencyKey(dependency)}\u0000${dependency.basis ?? ""}`;
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
  const dependencies: Dependency[] = [];

  for (const key of keys) {
    const bucket = grouped.get(key)!;
    const dependency = bucket.entry;
    const qualifiers: string[] = [];
    if (dependency.kind === "export") {
      qualifiers.push("re-export");
    }
    if (dependency.isTypeOnly) {
      qualifiers.push("type-only");
    }
    if (dependency.basis) {
      qualifiers.push(dependency.basis);
    }

    if (dependency.resolvedPath) {
      const moduleLabel = toModuleLabel(dependency.resolvedPath);
      const docAbsolute = path.resolve(
        args.liveDocsRootAbsolute,
        `${dependency.resolvedPath}${args.docExtension}`
      );
      const docRelative = formatRelativePathFromDoc(args.docDir, docAbsolute);
      const symbols = Array.from(bucket.symbols).sort();

      if (symbols.length === 0) {
        dependencies.push({ label: inlineLabel(moduleLabel), link: docRelative, qualifiers });
        continue;
      }

      for (const symbolName of symbols) {
        const anchorName = bucket.targets[symbolName] ?? symbolName;
        const workspaceSlug = resolveSymbolSlugFromIndex(anchorName, dependency.resolvedPath, args.symbolIndex);
        const slug =
          workspaceSlug ?? resolveSymbolSlug(anchorName, slugIndex) ?? createSymbolSlug(anchorName);
        const fragment = slug ? `#${slug}` : "";
        // Avoid redundancy like "Reader.Reader" when the symbol is named like its module (common in Java)
        const label =
          symbolName.toLowerCase() === moduleLabel.toLowerCase()
            ? symbolName
            : `${moduleLabel}.${symbolName}`;
        dependencies.push({ label: inlineLabel(label), link: `${docRelative}${fragment}`, qualifiers });
      }
      continue;
    }

    const externalSymbols = Array.from(bucket.symbols).sort().map(inlineLabel);
    const external: Dependency = { label: inlineLabel(dependency.specifier), qualifiers };
    if (externalSymbols.length > 0) {
      external.symbols = externalSymbols;
    }
    dependencies.push(external);
  }

  return dependencies;
}

/** The text inside an inline-code span: backticks cannot appear in it. */
function inlineLabel(value: string): string {
  return formatInlineCode(value).slice(1, -1);
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
 * Resolves a symbol's anchor from the workspace-wide symbol index, filtered to
 * the file that declares it, so a disambiguated heading (`symbol-analyzer-class`)
 * is linked by its real slug.
 */
function resolveSymbolSlugFromIndex(
  symbolName: string,
  targetSourcePath: string,
  index: WorkspaceSymbolIndex | undefined
): string | undefined {
  if (!index || !symbolName || !targetSourcePath) {
    return undefined;
  }

  const normalizedTarget = targetSourcePath.replace(/\\/gu, "/");
  const locations = index.get(symbolName) ?? index.get(symbolName.toLowerCase());
  if (!locations || locations.length === 0) {
    return undefined;
  }

  const matchingLocation = locations.find((loc) => loc.sourcePath.replace(/\\/gu, "/") === normalizedTarget);
  return matchingLocation?.anchor;
}

// ============================================================================
// Re-Exported Symbol Anchors
// ============================================================================

/**
 * Composes the `Re-Exported Symbol Anchors` section: one anchor per symbol a
 * barrel re-exports, linking to the module it comes from.
 */
export function composeReExports(args: {
  reExports: ReExportedSymbolInfo[];
  docDir: string;
  liveDocsRootAbsolute: string;
  docExtension: string;
}): ReExport[] {
  const sorted = [...args.reExports].sort((a, b) => a.name.localeCompare(b.name));

  return sorted.map((entry) => {
    const slugValue = createSymbolSlug(entry.name);
    const flags: string[] = [];
    if (entry.isTypeOnly) {
      flags.push("type-only");
    }
    const reExport: ReExport = { name: entry.name, slug: slugValue, flags };
    if (entry.sourceModulePath) {
      const moduleDocAbsolute = path.resolve(
        args.liveDocsRootAbsolute,
        `${entry.sourceModulePath}${args.docExtension}`
      );
      const relative = formatRelativePathFromDoc(args.docDir, moduleDocAbsolute);
      const fragment = slugValue ? `#${slugValue}` : "";
      reExport.from = { label: inlineLabel(toModuleLabel(entry.sourceModulePath)), link: `${relative}${fragment}` };
    }
    return reExport;
  });
}
