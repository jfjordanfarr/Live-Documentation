# Re-applies, to a copy of the engine, the move of the TypeScript resolution's probe onto the run's listing that was
# made and undone on 2026-11-22, so that the two can be compared on real inputs (left-out-imports.mts):
#   python3 listed-resolution.py <copy of the engine>/packages/engine/src/live-docs/dependencies.ts
# A file is asked of the listing handed as `files` (`pathKind`), else of the disk, as at the tip.
import re
import sys

file = sys.argv[1]
text = open(file).read()
pairs = [
    ("export async function collectDependencies(params: {\n  sourceFile: ts.SourceFile;\n  absolutePath: string;\n  workspaceRoot: string;\n}): Promise<DependencyEntry[]> {",
     "export async function collectDependencies(params: {\n  sourceFile: ts.SourceFile;\n  absolutePath: string;\n  workspaceRoot: string;\n  files?: ListedFiles;\n}): Promise<DependencyEntry[]> {"),
    ("export async function resolveDependency(\n  specifier: string,\n  fromFile: string,\n  workspaceRoot: string\n): Promise<string | undefined> {\n  if (!specifier.startsWith(\".\")) {\n    return resolveWorkspaceAlias(specifier, workspaceRoot);\n  }\n\n  const base = path.resolve(path.dirname(fromFile), specifier);\n  const resolved = await resolveWithExtensions(base);",
     "export async function resolveDependency(\n  specifier: string,\n  fromFile: string,\n  workspaceRoot: string,\n  files?: ListedFiles\n): Promise<string | undefined> {\n  if (!specifier.startsWith(\".\")) {\n    return resolveWorkspaceAlias(specifier, workspaceRoot, files);\n  }\n\n  const base = path.resolve(path.dirname(fromFile), specifier);\n  const resolved = await resolveWithExtensions(base, files);"),
    ("async function resolveWorkspaceAlias(\n  specifier: string,\n  workspaceRoot: string\n): Promise<string | undefined> {",
     "async function resolveWorkspaceAlias(\n  specifier: string,\n  workspaceRoot: string,\n  files?: ListedFiles\n): Promise<string | undefined> {"),
    ("  const matched = await resolveWithExtensions(candidateBase);", "  const matched = await resolveWithExtensions(candidateBase, files);"),
    ("async function resolveAliasCandidates(\n  workspaceRoot: string,\n  candidates: string[]\n): Promise<string | undefined> {\n  for (const candidate of candidates) {\n    const matched = await resolveWithExtensions(candidate);",
     "async function resolveAliasCandidates(\n  workspaceRoot: string,\n  candidates: string[],\n  files?: ListedFiles\n): Promise<string | undefined> {\n  for (const candidate of candidates) {\n    const matched = await resolveWithExtensions(candidate, files);"),
    ("async function resolveWithExtensions(basePath: string): Promise<string | undefined> {", "async function resolveWithExtensions(basePath: string, files?: ListedFiles): Promise<string | undefined> {"),
    ("    if (await fileExists(candidate)) {", "    if (files ? pathKind(candidate, files) === \"file\" : await fileExists(candidate)) {"),
]
for old, new in pairs:
    assert text.count(old) == 1, (old[:80], text.count(old))
    text = text.replace(old, new)
text, aliases = re.subn(r"resolveAliasCandidates\(workspaceRoot, (\[[^\]]*\]|candidates)\)", r"resolveAliasCandidates(workspaceRoot, \1, files)", text)
text, dependencies = re.subn(r"resolveDependency\(specifier, params\.absolutePath, params\.workspaceRoot\)", "resolveDependency(specifier, params.absolutePath, params.workspaceRoot, params.files)", text)
assert aliases == 4 and dependencies == 3, (aliases, dependencies)
# The re-export walk asks the same listing: a provider behind `export *` is followed only where the listing holds it.
for walk in ("  const dependencies = await collectDependencies({\n    sourceFile,\n    absolutePath: normalized,\n    workspaceRoot: params.workspaceRoot\n  });",):
    assert text.count(walk) == 1, walk
    text = text.replace(walk, walk.replace("workspaceRoot: params.workspaceRoot\n", "workspaceRoot: params.workspaceRoot,\n    files: params.reads as ListedFiles | undefined\n"))
text = text.replace('import { readSourceText, type SourceReads, throwIfMachineFailure } from "../tooling/sourceText";', 'import { readSourceText, type SourceReads, throwIfMachineFailure } from "../tooling/sourceText";\nimport { type ListedFiles, pathKind } from "../tooling/workspaceProbes";')
open(file, "w").write(text)
print("applied")
