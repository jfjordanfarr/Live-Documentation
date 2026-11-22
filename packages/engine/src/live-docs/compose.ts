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

import type { LiveDocumentationConfig } from "../config/liveDocumentationConfig";
import { getSyntaxByPath } from "../languages";
import { compareText } from "../tooling/compareText";
import { slug } from "../tooling/githubSlugger";
import { matchesPathPattern } from "./archetype";
import { RESERVED_HEADING_NAMES } from "./coreConstants";
import type {
  DeclaredBy,
  PublicSymbolEntry,
  PublicSymbolHeadingInfo,
  SourceAnalysisResult,
  DependencyEntry,
  ReExportedSymbolInfo,
  SymbolDocumentationTarget,
  TypeReference,
  ResolvedSymbolLocation,
  WorkspaceSymbolIndex
} from "./coreTypes";
import {
  formatRelativePathFromDoc,
  createSymbolSlug,
  toModuleLabel,
  displayDependencyKey,
  createProximityAwareComparator
} from "./coreUtils";
import { documentationReferenceLine, encodeLinkPath, LINKS_SECTION, symbolName, type CitedBy, type Dependency, type DocSection, type Entry, type ReExport, type ReferenceLine, type SymbolBlock, type TypeRef } from "./document";
import { MANIFEST_KINDS, OPENING_KINDS, isToolingFile } from "./openings";

/**
 * The link from a doc's folder to a file: the relative path, written as a link's path ({@link encodeLinkPath}), so
 * that a path holding a space, a parenthesis or a `#` opens the file in a markdown viewer and resolves in the graph.
 */
function linkTo(docDir: string, targetAbsolute: string): string {
  return encodeLinkPath(formatRelativePathFromDoc(docDir, targetAbsolute));
}

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

    const slugValue = createSymbolSlug(symbol.name);
    const slugKindKey = `${slugValue}::${kindLabel}`;
    slugCounts.set(slugValue, (slugCounts.get(slugValue) ?? 0) + 1);
    slugKindCounts.set(slugKindKey, (slugKindCounts.get(slugKindKey) ?? 0) + 1);
  }

  const kindOccurrences = new Map<string, number>();

  for (const symbol of symbols) {
    const normalizedNameKey = normalizeSymbolNameKey(symbol.name);
    const kindLabel = symbol.kind ?? "symbol";
    const nameKindKey = `${normalizedNameKey}::${kindLabel}`;
    const initialSlug = createSymbolSlug(symbol.name);
    const slugKindKey = `${initialSlug}::${kindLabel}`;

    let occurrence = 0;
    let occurrenceKey: string | undefined;

    const duplicateNameCount = nameCounts.get(normalizedNameKey) ?? 0;
    const duplicateKindCount = nameKindCounts.get(nameKindKey) ?? 0;
    const slugCollisionCount = slugCounts.get(initialSlug) ?? 0;
    const slugKindCollisionCount = slugKindCounts.get(slugKindKey) ?? 0;
    const normalizedName = normalizedNameKey;
    const isReservedHeadingName = RESERVED_HEADING_NAMES.has(normalizedName);
    const baseSlug = initialSlug;

    const shouldDisambiguateByName = duplicateNameCount > 1;
    const shouldDisambiguateBySlug = !shouldDisambiguateByName && slugCollisionCount > 1;

    if (shouldDisambiguateByName) {
      occurrenceKey = nameKindKey;
    } else if (shouldDisambiguateBySlug) {
      occurrenceKey = slugKindKey;
    }

    if (occurrenceKey) {
      occurrence = (kindOccurrences.get(occurrenceKey) ?? 0) + 1;
      kindOccurrences.set(occurrenceKey, occurrence);
    }

    // What the heading adds to the name in parentheses, where two symbols share one name or anchor or the name is reserved.
    let suffix: string | undefined;
    if (shouldDisambiguateByName || shouldDisambiguateBySlug) {
      const kindSpecificCount = shouldDisambiguateByName ? duplicateKindCount : slugKindCollisionCount;
      if (kindSpecificCount === 1 && symbol.kind) {
        suffix = symbol.kind;
      } else {
        const labelBase = symbol.kind ? `${symbol.kind} overload` : "variant";
        const ordinal = occurrence > 0 ? occurrence : 1;
        suffix = `${labelBase} ${ordinal}`;
      }
    } else if (isReservedHeadingName || symbolName(symbol) !== symbol.name) {
      // A reserved name, and a name that itself ends in a parenthesised word, which a reader of the heading would take
      // for a suffix: `build (prod)` is written `build (prod) (key)`, so that the heading's name is `build (prod)`.
      suffix = symbol.kind ?? "symbol";
    }
    const displayName = suffix === undefined ? symbol.name : `${symbol.name} (${suffix})`;

    // A reserved name keeps the anchor of its bare name. A disambiguated one is anchored by its bare name's anchor and
    // the suffix, which for a name the slug keeps is the anchor of the name it displays, and for a name of punctuation
    // only keeps its code points, so that adding `$` never changes the anchor of `$$`.
    const disambiguated = shouldDisambiguateByName || shouldDisambiguateBySlug;
    const resolvedSlug = suffix === undefined || !disambiguated ? baseSlug : `${baseSlug}-${slug(`\`${suffix}\``)}`;
    infos.push({
      symbol,
      displayName,
      slug: resolvedSlug
    });
  }

  ensureUniqueSymbolSlugs(infos);

  return infos;
}

function ensureUniqueSymbolSlugs(headings: { slug: string }[]): void {
  const used = new Set<string>();
  const suffixCounts = new Map<string, number>();

  for (const heading of headings) {
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
 * @param args.dependencies - The known module providers for imported signature types.
 * @param args.liveDocsRootAbsolute - Absolute path of the Live Docs root.
 */
export function composeSymbolBlocks(args: {
  headings: PublicSymbolHeadingInfo[];
  docDir: string;
  sourceAbsolute: string;
  sourceRelativePath: string;
  symbolIndex?: WorkspaceSymbolIndex;
  liveDocsRootAbsolute?: string;
  dependencies?: readonly DependencyEntry[];
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
      sections: composeDocSections(symbol, (target) => documentationLink(target, args))
    };
    if (symbol.location) {
      block.source = {
        path: linkTo(args.docDir, args.sourceAbsolute),
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

/** Resolve only recorded import/re-export providers; an unresolved import never falls back to a namesake. */
function resolveImportedType(
  binding: Extract<NonNullable<TypeReference["binding"]>, { kind: "import" }>,
  dependencies: readonly DependencyEntry[],
  index: WorkspaceSymbolIndex
): ResolvedTypeLocation | undefined {
  const dependency = dependencies.find(entry => entry.specifier === binding.specifier && (entry.kind === "import" || entry.kind === "require"));
  if (!dependency?.resolvedPath) return undefined;
  const name = dependency.symbolTargets?.[binding.exportedName] ?? binding.exportedName;
  const at = (sourcePath: string, exportedName: string): ResolvedSymbolLocation | undefined => {
    const candidates = index.get(exportedName) ?? [];
    return candidates.filter(location => location.sourcePath === sourcePath)
      .sort((a, b) => Number(Boolean(a.isReExport)) - Number(Boolean(b.isReExport)))[0];
  };
  let location = at(dependency.resolvedPath, name);
  if (!location) return undefined;
  const visited = new Set<string>();
  // Each step is an explicit provider carried by the index, not a search for a declaration of the same name.
  while (location.reExport) {
    const provider = location.reExport;
    const key = JSON.stringify([provider.sourcePath, provider.exportedName]);
    if (visited.has(key)) break;
    visited.add(key);
    const declared = at(provider.sourcePath, provider.exportedName);
    if (!declared) break;
    location = declared;
  }
  return { location, isSelfReference: false };
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
  args: { docDir: string; sourceRelativePath: string; symbolIndex?: WorkspaceSymbolIndex; liveDocsRootAbsolute?: string; dependencies?: readonly DependencyEntry[] }
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
  args: { docDir: string; sourceRelativePath: string; symbolIndex?: WorkspaceSymbolIndex; liveDocsRootAbsolute?: string; dependencies?: readonly DependencyEntry[] }
): TypeRef {
  const type: TypeRef = { name: ref.name };

  const resolved = args.symbolIndex && ref.binding?.kind !== "bound"
    ? ref.binding?.kind === "import"
      ? resolveImportedType(ref.binding, args.dependencies ?? [], args.symbolIndex)
      : resolveTypeToLiveDoc(ref.name, args.symbolIndex, args.sourceRelativePath)
    : undefined;

  if (resolved && args.liveDocsRootAbsolute) {
    const { location, isSelfReference } = resolved;
    const fragment = location.anchor ? `#${location.anchor}` : "";
    if (isSelfReference) {
      type.link = fragment;
    } else {
      // liveDocPath is workspace-relative; the Live Docs root sits two levels below the workspace root.
      const targetDocAbsolute = path.resolve(args.liveDocsRootAbsolute, "..", "..", location.liveDocPath);
      type.link = `${linkTo(args.docDir, targetDocAbsolute)}${fragment}`;
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

/**
 * The link to the declaration a documentation reference names, as the reader resolved it: within the doc when this
 * file declares it, else to the doc of the file that does, each at the anchor of the symbol at the target's line (an
 * overload's own), or of the first of its name in that file. Undefined where no doc of the workspace index answers for
 * the file and symbol, so that the line stays the name as written.
 */
function documentationLink(
  target: SymbolDocumentationTarget,
  args: { headings: PublicSymbolHeadingInfo[]; docDir: string; sourceRelativePath: string; symbolIndex?: WorkspaceSymbolIndex; liveDocsRootAbsolute?: string }
): string | undefined {
  if (target.path === args.sourceRelativePath) {
    const named = args.headings.filter((info) => info.symbol.name === target.symbol);
    const heading = named.find((info) => info.symbol.location?.line === target.line) ?? named[0];
    return heading?.slug ? `#${heading.slug}` : undefined;
  }
  if (!args.symbolIndex || !args.liveDocsRootAbsolute) return undefined;
  const located = (args.symbolIndex.get(target.symbol) ?? []).filter((location) => location.sourcePath === target.path && !location.isReExport);
  const location = located.find((candidate) => candidate.line === target.line) ?? located[0];
  if (!location) return undefined;
  // liveDocPath is workspace-relative; the Live Docs root sits two levels below the workspace root.
  const targetDocAbsolute = path.resolve(args.liveDocsRootAbsolute, "..", "..", location.liveDocPath);
  return `${linkTo(args.docDir, targetDocAbsolute)}${location.anchor ? `#${location.anchor}` : ""}`;
}

function composeDocSections(symbol: PublicSymbolEntry, linkFor: (target: SymbolDocumentationTarget) => string | undefined): DocSection[] {
  const documentation = symbol.documentation;
  if (!documentation) {
    return [];
  }

  const sections: DocSection[] = [];
  const pushSection = (title: string, body: string[] | undefined): void => {
    // A section's body is lines: an item that spans several, a description of many lines, is split into them as
    // example code is, at a line or paragraph separator too, and blank lines at its end go, since a blank line followed
    // by the next heading ends a body. It is prose, so a lone surrogate, which no file can hold, and a control
    // character other than a tab, which would make git take the doc for a binary file, are each the U+FFFD that stands
    // for a character not shown; a name holding one is written so that it reads back (`document.ts`).
    const lines = (body ?? []).flatMap((line) => line.replace(PROSE_UNSHOWN, "\ufffd").split(/\r\n?|\n|\u2028|\u2029/u));
    while (lines.length > 0 && lines[lines.length - 1] === "") {
      lines.pop();
    }
    if (lines.length === 0) {
      return;
    }
    sections.push({ title, body: lines });
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
        // One by one: a spread of many lines into one call exceeds the engine's limit on its arguments.
        for (const line of descriptionLines) {
          exampleLines.push(line);
        }
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
    pushSection(LINKS_SECTION, documentation.links.flatMap((link) => {
      switch (link.kind) {
        case "href": {
          const label = link.text?.trim() || link.target;
          return [`- [${label}](${link.target})`];
        }
        case "cref": {
          // The author's word, a line for each declaration it names; the name as written where it names none.
          const reference = { name: link.target, element: link.element, text: link.text?.trim() || undefined };
          const links = Array.from(new Set((link.targets ?? []).map(linkFor).filter((target): target is string => target !== undefined)));
          return links.length > 0
            ? links.map((target) => documentationReferenceLine({ ...reference, link: target }))
            : [documentationReferenceLine(reference)];
        }
        default: {
          const suffix = link.text?.trim() ? ` — ${link.text.trim()}` : "";
          return [`- ${link.target}${suffix}`];
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

/** What prose in a section body cannot hold as itself: a lone surrogate, and a control character other than a tab or a line break. */
// eslint-disable-next-line no-control-regex -- the control characters are what a doc's prose cannot hold
const PROSE_UNSHOWN = /\p{Cs}|[\x00-\x08\x0b\x0c\x0e-\x1f]/gu;

function normalizeDocText(value?: string): string[] | undefined {
  if (!value) {
    return undefined;
  }

  // `trimEnd` strips what `\s+$` would, in linear time: the pattern takes time quadratic in a long run of spaces that
  // something other than a space follows.
  const lines = value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd());

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
 * symbol, linking to a target anchor when the workspace index knows it and to
 * the file otherwise, or one line for the whole module when no symbol is named. An external dependency keeps
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
    { entry: DependencyEntry; entries: DependencyEntry[]; symbols: Set<string>; targets: Record<string, string> }
  >();

  for (const dependency of args.analysis.dependencies) {
    // A separator that sorts before every character keeps `a` before `a/b`, as it was before the basis joined the key.
    const key = `${displayDependencyKey(dependency)}\u0000${dependency.basis ?? ""}`;
    const bucket =
      grouped.get(key) ?? {
        entry: dependency,
        entries: [],
        symbols: new Set<string>(),
        targets: {}
      };
    bucket.entries.push(dependency);
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
    // Type-only by a written `type`, each name's own or its statement's (2026-11-22): a line of one name is type-only
    // when every statement of the group that brings the name types it, and a line of the whole module when every
    // statement of the group brings only types. Before, the group's first statement's modifier stood for every line.
    const qualifiersOf = (typeOnly: boolean): string[] => [
      ...(dependency.kind === "export" ? ["re-export"] : []),
      ...(typeOnly ? ["type-only"] : []),
      ...(dependency.basis ? [dependency.basis] : [])
    ];
    const qualifiers = qualifiersOf(bucket.entries.every((entry) => entry.isTypeOnly));
    const nameQualifiers = (name: string): string[] =>
      qualifiersOf(bucket.entries.every((entry) => !entry.symbols.includes(name) || entry.isTypeOnly || Boolean(entry.typeOnlySymbols?.includes(name))));

    if (dependency.resolvedPath) {
      const moduleLabel = toModuleLabel(dependency.resolvedPath);
      const docAbsolute = path.resolve(
        args.liveDocsRootAbsolute,
        `${dependency.resolvedPath}${args.docExtension}`
      );
      const docRelative = linkTo(args.docDir, docAbsolute);
      const symbols = Array.from(bucket.symbols).sort();

      if (symbols.length === 0) {
        dependencies.push({ label: moduleLabel, link: docRelative, qualifiers });
        continue;
      }

      for (const symbolName of symbols) {
        const anchorName = bucket.targets[symbolName] ?? symbolName;
        const workspaceSlug = resolveSymbolSlugFromIndex(anchorName, dependency.resolvedPath, args.symbolIndex);
        // With a workspace index, only an anchor actually published by the target is known.
        // Standalone composition retains its historical best-effort slug.
        const slug = args.symbolIndex
          ? workspaceSlug
          : resolveSymbolSlug(anchorName, slugIndex) ?? createSymbolSlug(anchorName);
        const fragment = slug ? `#${slug}` : "";
        // Avoid redundancy like "Reader.Reader" when the symbol is named like its module (common in Java)
        const label =
          symbolName.toLowerCase() === moduleLabel.toLowerCase()
            ? symbolName
            : `${moduleLabel}.${symbolName}`;
        dependencies.push({ label, link: `${docRelative}${fragment}`, qualifiers: nameQualifiers(symbolName) });
      }
      continue;
    }

    const externalSymbols = Array.from(bucket.symbols).sort();
    const external: Dependency = { label: dependency.specifier, qualifiers };
    if (externalSymbols.length > 0) {
      external.symbols = externalSymbols;
    }
    dependencies.push(external);
  }

  return dependencies;
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
  index: WorkspaceSymbolIndex | undefined,
  kind?: string
): string | undefined {
  if (!index || !symbolName || !targetSourcePath) {
    return undefined;
  }

  const normalizedTarget = targetSourcePath.replace(/\\/gu, "/");
  const locations = index.get(symbolName) ?? index.get(symbolName.toLowerCase());
  if (!locations || locations.length === 0) {
    return undefined;
  }

  const matching = locations.filter((loc) => loc.sourcePath.replace(/\\/gu, "/") === normalizedTarget);
  const matchingLocation = (kind ? matching.find((loc) => loc.kind === kind) : undefined) ?? matching[0];
  return matchingLocation?.anchor;
}

// ============================================================================
// Cited By
// ============================================================================

/**
 * Composes the `Cited By` section: one line per document whose markdown links
 * name the file or its doc, the document's workspace-relative path as the
 * label and a link to it relative to the doc, in path order, so that a doc is
 * written the same way every run. Which documents cite the file is the
 * engine's rule, `citingDocuments`.
 *
 * @param args.documents - The citing documents' workspace-relative paths.
 * @param args.docDir - Absolute directory of the Live Doc being written; links are relative to it.
 * @param args.workspaceRoot - Absolute path of the workspace, where the documents' paths start.
 */
export function composeCitedBy(args: { documents: readonly string[]; docDir: string; workspaceRoot: string }): CitedBy[] {
  return [...args.documents].sort().map((document) => ({
    label: document,
    link: linkTo(args.docDir, path.resolve(args.workspaceRoot, document))
  }));
}

// ============================================================================
// Entries
// ============================================================================

/**
 * Composes the `Entry` lines of a doc: why something outside the code starts
 * the file, in a fixed order so that a doc is written the same way every run.
 *
 * @remarks
 * `program` comes from the file's own analysis, its symbol linked when the doc
 * has it. `command` and `module` come from the manifests that declare the file,
 * as the workspace entry index recorded them. `opening` is one line per route,
 * address, procedure, table, view or function the file serves. A file is
 * `tooling` by its name or place ({@link isToolingFile}) or by what it
 * publishes, a package or a project, which makes a manifest known only by its
 * content, a PowerShell module's `.psd1`, one. `declared` is the
 * configuration's `entryPoints`. A test is an entry by its archetype and gets
 * no line here.
 *
 * @param args.analysis - The file's analysis, for the program entry point.
 * @param args.sourceRelativePath - Workspace-relative source path, for the rules by name.
 * @param args.headings - The symbols with their anchors, for the program's symbol, the openings and a manifest's package.
 * @param args.declaredBy - What manifests declare about the file.
 * @param args.config - The configuration, for the declared entry points.
 * @param args.docDir - Absolute directory of the Live Doc being written; links are relative to it.
 * @param args.liveDocsRootAbsolute - Absolute path to the Live Docs root.
 * @param args.docExtension - File extension for Live Docs.
 */
export function composeEntries(args: {
  analysis: SourceAnalysisResult;
  sourceRelativePath: string;
  headings: PublicSymbolHeadingInfo[];
  declaredBy: readonly DeclaredBy[];
  config: Pick<LiveDocumentationConfig, "entryPoints">;
  docDir: string;
  liveDocsRootAbsolute: string;
  docExtension: string;
}): Entry[] {
  const entries: Entry[] = [];

  const program = args.analysis.program;
  if (program) {
    if (program.symbol === undefined) {
      entries.push({ reason: "program" });
    } else {
      // The heading at the declaration's line tells the entry from a namesake; without a line, the first by name.
      const named = args.headings.filter((info) => info.symbol.name === program.symbol);
      const heading = named.find((info) => program.line !== undefined && info.symbol.location?.line === program.line) ?? named[0];
      entries.push({ reason: "program", symbol: heading?.slug ? { name: program.symbol, link: `#${heading.slug}` } : { name: program.symbol } });
    }
  }

  const declarerOf = (declarer: string): { label: string; link: string } => ({
    label: declarer,
    link: linkTo(args.docDir, path.resolve(args.liveDocsRootAbsolute, `${declarer}${args.docExtension}`))
  });
  const commands = args.declaredBy
    .filter((declared) => declared.reason === "command")
    .sort((a, b) => compareText(a.name ?? "", b.name ?? "") || compareText(a.declarer, b.declarer));
  for (const declared of commands) {
    entries.push({ reason: "command", command: declared.name ?? "", declarer: declarerOf(declared.declarer) });
  }
  const modules = args.declaredBy.filter((declared) => declared.reason === "module").sort((a, b) => compareText(a.declarer, b.declarer));
  for (const declared of modules) {
    entries.push({ reason: "module", declarer: declarerOf(declared.declarer) });
  }

  for (const info of args.headings) {
    if (OPENING_KINDS.has(info.symbol.kind) && info.slug) {
      entries.push({ reason: "opening", symbol: { name: info.symbol.name, link: `#${info.slug}` } });
    }
  }

  if (isToolingFile(args.sourceRelativePath) || args.headings.some((info) => MANIFEST_KINDS.has(info.symbol.kind))) {
    entries.push({ reason: "tooling" });
  }

  if (args.config.entryPoints.some((pattern) => matchesPathPattern(args.sourceRelativePath, pattern))) {
    entries.push({ reason: "declared" });
  }

  return entries;
}

// ============================================================================
// Re-Exported Symbol Anchors
// ============================================================================

/**
 * A file's re-exports in the order its doc writes them, by name, each with its anchor: its name's anchor, and where it
 * is already a public symbol's or another re-export's, as `Foo` and `foo` share one, told apart as two symbols' anchors
 * are (`symbol-foo-1`). One doc's anchors are one namespace, its public symbols' first. The doc's headings
 * ({@link composeReExports}) and the workspace index (`discovery.ts`) both take the anchors from here, so that a link to
 * a re-export lands on the heading it names.
 *
 * @param headings - The file's public symbol headings, whose anchors stand as they are.
 */
export function anchorReExports<T extends { name: string }>(reExports: readonly T[], headings: readonly { slug: string }[]): Array<{ entry: T; slug: string }> {
  const anchored = [...reExports].sort((a, b) => compareText(a.name, b.name)).map((entry) => ({ entry, slug: createSymbolSlug(entry.name) }));
  ensureUniqueSymbolSlugs([...headings.map(({ slug: taken }) => ({ slug: taken })), ...anchored]);
  return anchored;
}

/**
 * Composes the `Re-Exported Symbol Anchors` section: one anchor per symbol a
 * barrel re-exports. Its own heading uses the exported name; the provider link
 * uses that provider's actual indexed heading when the workspace index is present.
 */
export function composeReExports(args: {
  reExports: ReExportedSymbolInfo[];
  /** The file's public symbol headings, whose anchors a re-export's is held apart from. */
  headings: readonly { slug: string }[];
  docDir: string;
  liveDocsRootAbsolute: string;
  docExtension: string;
  symbolIndex?: WorkspaceSymbolIndex;
}): ReExport[] {
  return anchorReExports(args.reExports, args.headings).map(({ entry, slug: slugValue }) => {
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
      const relative = linkTo(args.docDir, moduleDocAbsolute);
      const providerSlug = args.symbolIndex
        ? resolveSymbolSlugFromIndex(entry.name, entry.sourceModulePath, args.symbolIndex, entry.kind)
        : createSymbolSlug(entry.name);
      const fragment = providerSlug ? `#${providerSlug}` : "";
      reExport.from = { label: toModuleLabel(entry.sourceModulePath), link: `${relative}${fragment}` };
    }
    return reExport;
  });
}
