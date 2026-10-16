/**
 * Python project manifests (`pyproject.toml`): the distribution a manifest
 * names, what it stands on, and the commands its scripts start.
 *
 * @remarks
 * The distribution is `[project].name`, or Poetry's `[tool.poetry].name`;
 * with neither the manifest publishes no symbol. The dependencies are the
 * requirements of `[project].dependencies`, of every list under
 * `[project.optional-dependencies]` and of every group under
 * `[dependency-groups]` (an `{include-group = ...}` item names another group
 * and is passed over); when `[project]` has no dependency list, those of
 * Poetry's `[tool.poetry.dependencies]` (`python` passed over), and in either
 * case the groups of `[tool.poetry.group.<name>.dependencies]` and the older
 * `[tool.poetry.dev-dependencies]`. A requirement is written as its
 * distribution name and its version specifier joined with `@`, extras and
 * environment markers dropped (`requests[security]>=2.0; python_version<"3.12"`
 * is `requests@>=2.0`), a direct reference as `name@url`. A requirement whose
 * source is a path (a Poetry dependency's `path`, or `[tool.uv.sources]`) is
 * linked to the `pyproject.toml` there when the workspace holds it; any other is
 * linked to the workspace manifest that publishes its name, compared as Python
 * compares names, or kept external. `[build-system].requires` is what builds
 * the distribution, not what it stands on, and is not written.
 *
 * Each entry of `[project.scripts]`, `[project.gui-scripts]` and
 * `[tool.poetry.scripts]` is a command by its key on the module its
 * `module:function` value names: `module/path.py` or `module/path/__init__.py`
 * under the manifest's folder or its `src/`. A module the workspace does not
 * hold declares nothing.
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

const PYPROJECT_TOML = "pyproject.toml";

/** A distribution name as Python compares them: lowercase, with every run of `-`, `_` and `.` one `-` (PEP 503). */
export function normalizeDistributionName(name: string): string {
  return name.toLowerCase().replace(/[-_.]+/gu, "-");
}

/** A requirement reduced to what the docs write. */
export interface Requirement {
  name: string;
  /** The version specifier without spaces, or the URL of a direct reference. */
  version?: string;
}

const REQUIREMENT = /^\s*([A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?)\s*(?:\[[^\]]*\])?\s*([\s\S]*)$/u;

/** Reads a PEP 508 requirement: the name, then the specifier or the direct reference, extras and markers dropped. */
export function parseRequirement(text: string): Requirement | undefined {
  const match = REQUIREMENT.exec(text);
  if (!match) return undefined;
  const name = match[1];
  const rest = match[2].trim();
  if (rest.startsWith("@")) {
    const url = rest.slice(1).trim().split(/\s/u)[0];
    return url ? { name, version: url } : { name };
  }
  const specifier = rest.split(";")[0].replace(/[\s()]/gu, "");
  return specifier ? { name, version: specifier } : { name };
}

/** Language adapter for `pyproject.toml`: the distribution as a symbol, its requirements, and the modules its scripts start. */
export const pyprojectAdapter: LanguageAdapter = {
  id:         "pyproject",
  extensions: [],
  fileNames:  [PYPROJECT_TOML],
  async analyze(input): Promise<SourceAnalysisResult | null> {
    const manifest = await readToml(input.absolutePath);
    if (!manifest) return { symbols: [], dependencies: [] };
    const context = manifestContext(input);
    const directory = path.dirname(input.absolutePath);
    const project = tableOf(manifest.project);
    const tool = tableOf(manifest.tool);
    const poetry = tableOf(tool?.poetry);

    const requirements: Requirement[] = [];
    const fromList = (list: unknown): void => {
      for (const item of Array.isArray(list) ? list : []) {
        const requirement = typeof item === "string" ? parseRequirement(item) : undefined;
        if (requirement) requirements.push(requirement);
      }
    };
    fromList(project?.dependencies);
    for (const list of Object.values(tableOf(project?.["optional-dependencies"]) ?? {})) fromList(list);
    for (const list of Object.values(tableOf(manifest["dependency-groups"]) ?? {})) fromList(list);

    // A path a dependency is taken from, by normalized name: Poetry's path dependencies and uv's sources.
    const sources = new Map<string, string>();
    const poetryTables = [
      tableOf(poetry?.dependencies),
      tableOf(poetry?.["dev-dependencies"]),
      ...Object.values(tableOf(poetry?.group) ?? {}).map((group) => tableOf(tableOf(group)?.dependencies))
    ];
    for (const [index, table] of poetryTables.entries()) {
      // The main table is read only when [project] lists no dependencies; with a list, its entries refine that list's.
      const read = index > 0 || !Array.isArray(project?.dependencies);
      for (const [name, spec] of Object.entries(table ?? {})) {
        if (name === "python") continue;
        const source = stringOf(tableOf(spec)?.path);
        if (source) sources.set(normalizeDistributionName(name), source);
        if (read) requirements.push({ name, version: typeof spec === "string" ? spec : stringOf(tableOf(spec)?.version) });
      }
    }
    for (const [name, spec] of Object.entries(tableOf(tableOf(tool?.uv)?.sources) ?? {})) {
      const source = (Array.isArray(spec) ? spec : [spec]).map((candidate) => stringOf(tableOf(candidate)?.path)).find(Boolean);
      if (source) sources.set(normalizeDistributionName(name), source);
    }

    const dependencies = new ManifestDependencies();
    for (const requirement of requirements) {
      const source = sources.get(normalizeDistributionName(requirement.name));
      const linked = source ? manifestIn(source, directory, PYPROJECT_TOML, context) : undefined;
      if (linked) {
        dependencies.link(linked, publishedName(linked, requirement.name, context));
      } else {
        dependencies.byName(requirement.name, requirement.version, PYPROJECT_TOML, context, normalizeDistributionName);
      }
    }

    const scripts: Array<[string, unknown]> = [
      ...Object.entries(tableOf(project?.scripts) ?? {}),
      ...Object.entries(tableOf(project?.["gui-scripts"]) ?? {}),
      ...Object.entries(tableOf(poetry?.scripts) ?? {})
    ];
    const declares = sortDeclared(scripts.flatMap(([name, target]): DeclaredEntry[] => {
      const reference = typeof target === "string" ? target : stringOf(tableOf(target)?.callable);
      const file = reference ? moduleFile(reference, directory, context) : undefined;
      return file ? [{ reason: "command", file, name }] : [];
    }));

    const symbols = packageSymbols(stringOf(project?.name) ?? stringOf(poetry?.name));
    return declares.length > 0 ? { symbols, dependencies: dependencies.entries(), declares } : { symbols, dependencies: dependencies.entries() };
  }
};

/** The file of the module an entry point's `module:function [extras]` names, under the manifest's folder or its `src/`. */
function moduleFile(reference: string, directory: string, context: ManifestContext): string | undefined {
  const moduleName = reference.split(":")[0].trim().split(/[\s[]/u)[0];
  if (!/^[A-Za-z_][\w.]*$/u.test(moduleName)) return undefined;
  const modulePath = moduleName.split(".").join("/");
  for (const root of [directory, path.join(directory, "src")]) {
    for (const candidate of [`${modulePath}.py`, `${modulePath}/__init__.py`]) {
      const file = workspaceFile(path.join(root, candidate), context);
      if (file) return file;
    }
  }
  return undefined;
}
