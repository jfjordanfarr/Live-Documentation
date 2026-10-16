/**
 * What the package manifests share: the package as one symbol, what the
 * package stands on as dependencies, and the files a manifest names, each
 * looked up among the workspace's files.
 *
 * @remarks
 * A dependency on a package the workspace holds is linked to the manifest
 * that publishes it, found by the path the manifest writes or by the name that
 * manifest publishes; any other is external, `name@version` with the version
 * or range as written, or the name alone when none is written. A manifest
 * links only to a manifest of its own kind, so that a crate is never taken for
 * an npm package of the same name.
 *
 * @module
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { parse as parseToml } from "smol-toml";

import { normalizeWorkspacePath } from "../../tooling/pathUtils";
import type { DeclaredEntry, DependencyEntry, PublicSymbolEntry, ResolvedSymbolLocation, WorkspaceSymbolIndex } from "../coreTypes";
import { PACKAGE_KIND } from "../openings";
import type { WorkspaceFileIndex } from "./index";

/** What an adapter is given about the manifest it reads. */
export interface ManifestContext {
  absolutePath: string;
  workspaceRoot: string;
  /** The manifest's own workspace-relative path. */
  thisFile: string;
  fileIndex?: WorkspaceFileIndex;
  symbolIndex?: WorkspaceSymbolIndex;
}

/** The context of the manifest at `absolutePath`. */
export function manifestContext(input: { absolutePath: string; workspaceRoot: string; fileIndex?: WorkspaceFileIndex; symbolIndex?: WorkspaceSymbolIndex }): ManifestContext {
  return { ...input, thisFile: normalizeWorkspacePath(path.relative(input.workspaceRoot, input.absolutePath)) };
}

/** A TOML table as a record, or `undefined` for anything else (an array, a string, a date). */
export function tableOf(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value) || value instanceof Date) return undefined;
  return value as Record<string, unknown>;
}

/** A non-empty string, or `undefined`. */
export function stringOf(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/** A TOML document's root table, or `undefined` when the file cannot be read or is not valid TOML. */
export async function readToml(absolutePath: string): Promise<Record<string, unknown> | undefined> {
  try {
    return tableOf(parseToml(await fs.readFile(absolutePath, "utf8")));
  } catch {
    return undefined;
  }
}

/** The package a manifest names, as its one public symbol at line 1; none without a name. */
export function packageSymbols(name: string | undefined): PublicSymbolEntry[] {
  return name ? [{ name, kind: PACKAGE_KIND, location: { line: 1, character: 1 } }] : [];
}

/** The workspace-relative path of `absolute` when it is a workspace file other than the manifest itself. */
export function workspaceFile(absolute: string, context: ManifestContext): string | undefined {
  const relative = normalizeWorkspacePath(path.relative(context.workspaceRoot, absolute));
  if (relative.startsWith("../") || path.isAbsolute(relative) || relative === context.thisFile) return undefined;
  return context.fileIndex?.has(relative) ? relative : undefined;
}

/** The manifest named `manifestName` in the directory a manifest writes, relative to `fromDirectory`, when the workspace holds it. */
export function manifestIn(directory: string, fromDirectory: string, manifestName: string, context: ManifestContext): string | undefined {
  return workspaceFile(path.join(path.resolve(fromDirectory, directory.replace(/\\/gu, "/")), manifestName), context);
}

interface PublishedPackage {
  name: string;
  location: ResolvedSymbolLocation;
}

const packageCache = new WeakMap<WorkspaceSymbolIndex, PublishedPackage[]>();

/** Every package the workspace's manifests publish, read once per index. */
function publishedPackages(symbolIndex: WorkspaceSymbolIndex): PublishedPackage[] {
  let packages = packageCache.get(symbolIndex);
  if (!packages) {
    packages = [];
    for (const [name, locations] of symbolIndex) {
      for (const location of locations) {
        if (location.kind === PACKAGE_KIND) packages.push({ name, location });
      }
    }
    packageCache.set(symbolIndex, packages);
  }
  return packages;
}

/**
 * The workspace manifests named `manifestName` that publish the package
 * `name`, the manifest itself left out, with the name each publishes. Names
 * are compared after `normalize`, for an ecosystem whose names are compared
 * loosely (Python's).
 */
export function manifestsPublishing(name: string, manifestName: string, context: ManifestContext, normalize: (name: string) => string = (value) => value): PublishedPackage[] {
  if (!context.symbolIndex) return [];
  const wanted = normalize(name);
  return publishedPackages(context.symbolIndex).filter((published) =>
    published.location.sourcePath !== context.thisFile
    && path.posix.basename(published.location.sourcePath) === manifestName
    && normalize(published.name) === wanted);
}

/** The package a workspace manifest publishes, by the index, or `fallback` when the index does not say. */
export function publishedName(manifest: string, fallback: string, context: ManifestContext): string {
  if (context.symbolIndex) {
    const published = publishedPackages(context.symbolIndex).find((candidate) => candidate.location.sourcePath === manifest);
    if (published) return published.name;
  }
  return fallback;
}

/** What one manifest stands on, gathered and then written in the precedents' order: linked manifests by path, then externals by name. */
export class ManifestDependencies {
  private readonly linked = new Map<string, Set<string>>();
  private readonly external = new Set<string>();

  /** A dependency on the workspace manifest `file`, which publishes `name`. */
  link(file: string, name: string): void {
    const names = this.linked.get(file) ?? new Set<string>();
    names.add(name);
    this.linked.set(file, names);
  }

  /** A dependency outside the workspace: `name@version`, or the name alone. */
  externalPackage(name: string, version?: string): void {
    this.external.add(version ? `${name}@${version}` : name);
  }

  /**
   * A dependency by name: linked to every workspace manifest named
   * `manifestName` that publishes it, external otherwise.
   */
  byName(name: string, version: string | undefined, manifestName: string, context: ManifestContext, normalize?: (name: string) => string): void {
    const published = manifestsPublishing(name, manifestName, context, normalize);
    if (published.length === 0) {
      this.externalPackage(name, version);
      return;
    }
    for (const found of published) this.link(found.location.sourcePath, found.name);
  }

  /** The dependencies gathered: the linked manifests in path order, each with the names it publishes, then the externals in order. */
  entries(): DependencyEntry[] {
    const dependencies: DependencyEntry[] = Array.from(this.linked.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([file, names]) => ({ specifier: file, resolvedPath: file, symbols: Array.from(names).sort(), kind: "import" as const }));
    for (const specifier of Array.from(this.external).sort()) {
      dependencies.push({ specifier, symbols: [], kind: "import" });
    }
    return dependencies;
  }
}

/** Declared entries without repeats, in path order, then by reason and name. */
export function sortDeclared(declared: Iterable<DeclaredEntry>): DeclaredEntry[] {
  const unique = new Map<string, DeclaredEntry>();
  for (const entry of declared) unique.set(`${entry.reason}\u0000${entry.file}\u0000${entry.name ?? ""}`, entry);
  return Array.from(unique.values()).sort((a, b) => a.file.localeCompare(b.file) || a.reason.localeCompare(b.reason) || (a.name ?? "").localeCompare(b.name ?? ""));
}
