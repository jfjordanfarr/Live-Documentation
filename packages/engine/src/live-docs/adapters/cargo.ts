/**
 * Cargo manifests (`Cargo.toml`): the crate a manifest names, what it stands
 * on, and the targets it writes.
 *
 * @remarks
 * The crate is `[package].name`; a workspace's root manifest with no
 * `[package]` publishes no symbol and is still a manifest a tool reads. The
 * dependencies are those of `[dependencies]`, `[dev-dependencies]` and
 * `[build-dependencies]`, and of the same three under each
 * `[target.<cfg>]`, in the inline and the table forms, named by the
 * `package` they rename when they rename one. A dependency with a `path` is
 * linked to the `Cargo.toml` there when the workspace holds it; any other is
 * linked to the workspace manifest that publishes its name, or kept external
 * as `name@version`. One written `workspace = true` is read as the entry of
 * that name in `[workspace.dependencies]` of the workspace's root manifest,
 * the nearest above that has a `[workspace]` (or the one `[package].workspace`
 * names), its path taken from that manifest's folder; without one it is the
 * name alone. `[workspace].members` are what the workspace contains, not what
 * a crate stands on, and are not written; nor are `[patch]` and `[replace]`.
 *
 * The targets the manifest writes are the entries it declares: each `[[bin]]`
 * and `[[example]]` is a command by its name on the file at its `path`, or
 * where Cargo looks for it without one; `[lib]` is the package's module, on its
 * `path` or `src/lib.rs`. What Cargo infers from the file system without a
 * table (`src/main.rs`, `src/bin/*.rs`) is the Rust adapter's `program` mark
 * and is not repeated here; `[[test]]` and `[[bench]]` are tests by their
 * archetype.
 *
 * @module
 */
import path from "node:path";

import type { DeclaredEntry, SourceAnalysisResult } from "../coreTypes";
import type { LanguageAdapter } from "./index";
import {
  ManifestDependencies, manifestContext, manifestIn, packageSymbols, publishedName, readToml, sortDeclared, stringOf, tableOf, workspaceFile,
  type ManifestContext
} from "./manifest";

const CARGO_TOML = "Cargo.toml";
const DEPENDENCY_TABLES = ["dependencies", "dev-dependencies", "build-dependencies"] as const;

/** A dependency as written, and the folder its `path` is relative to. */
interface WrittenDependency {
  key: string;
  spec: unknown;
  directory: string;
}

/** Language adapter for Cargo manifests: the crate as a symbol, its dependencies, and the targets it declares. */
export const cargoAdapter: LanguageAdapter = {
  id:         "cargo",
  extensions: [],
  fileNames:  [CARGO_TOML],
  async analyze(input): Promise<SourceAnalysisResult | null> {
    const manifest = await readToml(input.absolutePath);
    if (!manifest) return { symbols: [], dependencies: [] };
    const context = manifestContext(input);
    const directory = path.dirname(input.absolutePath);
    const crate = tableOf(manifest.package);
    const crateName = stringOf(crate?.name);

    const written: WrittenDependency[] = [];
    const tables = [manifest, ...Object.values(tableOf(manifest.target) ?? {})].map(tableOf);
    for (const table of tables) {
      for (const field of DEPENDENCY_TABLES) {
        for (const [key, spec] of Object.entries(tableOf(table?.[field]) ?? {})) {
          written.push({ key, spec, directory });
        }
      }
    }

    const inherited = written.some(({ spec }) => tableOf(spec)?.workspace === true) ? await workspaceDependencies(directory, crate, context) : undefined;
    const dependencies = new ManifestDependencies();
    for (const dependency of written) {
      addDependency(dependencies, inherit(dependency, inherited), context);
    }

    const declares = declaredTargets(manifest, crateName, directory, context);
    const symbols = packageSymbols(crateName);
    return declares.length > 0 ? { symbols, dependencies: dependencies.entries(), declares } : { symbols, dependencies: dependencies.entries() };
  }
};

/** A dependency written `workspace = true`, read as the workspace's entry of that name when there is one; the name alone otherwise. */
function inherit(dependency: WrittenDependency, inherited: WrittenDependency[] | undefined): WrittenDependency {
  const spec = tableOf(dependency.spec);
  if (spec?.workspace !== true) return dependency;
  const entry = inherited?.find((candidate) => candidate.key === dependency.key);
  if (entry) return entry;
  return { key: dependency.key, spec: {}, directory: dependency.directory };
}

/** Writes one dependency: by its path when the workspace holds the crate there, by its name otherwise. */
function addDependency(dependencies: ManifestDependencies, dependency: WrittenDependency, context: ManifestContext): void {
  const spec = tableOf(dependency.spec);
  const name = stringOf(spec?.package) ?? dependency.key;
  const version = typeof dependency.spec === "string" ? dependency.spec : stringOf(spec?.version);
  const pathWritten = stringOf(spec?.path);
  const linked = pathWritten ? manifestIn(pathWritten, dependency.directory, CARGO_TOML, context) : undefined;
  if (linked) {
    dependencies.link(linked, publishedName(linked, name, context));
  } else {
    dependencies.byName(name, version, CARGO_TOML, context);
  }
}

/**
 * The `[workspace.dependencies]` of the workspace's root manifest, each with
 * that manifest's folder: the manifest `[package].workspace` names, or the
 * nearest manifest with a `[workspace]` from this one's folder upward, within
 * the workspace.
 */
async function workspaceDependencies(directory: string, crate: Record<string, unknown> | undefined, context: ManifestContext): Promise<WrittenDependency[] | undefined> {
  const named = stringOf(crate?.workspace);
  const candidates: string[] = [];
  if (named) {
    candidates.push(path.resolve(directory, named));
  } else {
    for (let folder = directory; ; folder = path.dirname(folder)) {
      const relative = path.relative(context.workspaceRoot, folder);
      if (relative.startsWith("..") || path.isAbsolute(relative)) break;
      candidates.push(folder);
      if (folder === path.dirname(folder)) break;
    }
  }
  for (const folder of candidates) {
    const manifestPath = path.join(folder, CARGO_TOML);
    if (manifestPath !== context.absolutePath && !workspaceFile(manifestPath, context)) continue;
    const root = tableOf((await readToml(manifestPath))?.workspace);
    if (root) {
      return Object.entries(tableOf(root.dependencies) ?? {}).map(([key, spec]) => ({ key, spec, directory: folder }));
    }
  }
  return undefined;
}

/** The files the manifest's `[[bin]]`, `[[example]]` and `[lib]` tables start, when the workspace holds them. */
function declaredTargets(manifest: Record<string, unknown>, crateName: string | undefined, directory: string, context: ManifestContext): DeclaredEntry[] {
  const fileAt = (...candidates: string[]): string | undefined => {
    for (const candidate of candidates) {
      const file = workspaceFile(path.resolve(directory, candidate), context);
      if (file) return file;
    }
    return undefined;
  };
  const declared: DeclaredEntry[] = [];
  const commands = (field: string, defaults: (name: string) => string[]): void => {
    const targets = Array.isArray(manifest[field]) ? (manifest[field] as unknown[]) : [];
    for (const target of targets.map(tableOf)) {
      const name = stringOf(target?.name);
      if (!name) continue;
      const written = stringOf(target?.path);
      const file = written ? fileAt(written) : fileAt(...defaults(name));
      if (file) declared.push({ reason: "command", file, name });
    }
  };
  // Cargo looks for a binary without a path under src/bin, and at src/main.rs for the one named after the package.
  commands("bin", (name) => [`src/bin/${name}.rs`, `src/bin/${name}/main.rs`, ...(name === crateName ? ["src/main.rs"] : [])]);
  commands("example", (name) => [`examples/${name}.rs`, `examples/${name}/main.rs`]);
  const lib = tableOf(manifest.lib);
  if (lib) {
    const file = fileAt(stringOf(lib.path) ?? "src/lib.rs");
    if (file) declared.push({ reason: "module", file });
  }
  return sortDeclared(declared);
}
