/**
 * What a C# file's project lets it see: the projects whose types the compiler
 * binds its names against.
 *
 * A file belongs to the project in the nearest folder above it that holds a
 * project file (a system is a folder). Its project sees its own files and the
 * output of the projects it references with `ProjectReference`, except a
 * reference marked `ReferenceOutputAssembly="false"`, which orders the build
 * and gives the compiler nothing. What else it sees depends on the project's
 * form, as MSBuild has it:
 *
 * - an SDK-style project (`<Project Sdk="…">`) also sees what its references
 *   reference, transitively, unless it sets `DisableTransitiveProjectReferences`;
 * - a classic project gives the compiler only its direct references: the
 *   references of a reference are copied to the output folder but not passed
 *   to the compiler, so a name declared there does not bind.
 *
 * The reach is given in tiers, nearest first: the own project, the projects it
 * references directly, then those reached further. A project reference is
 * looked up in the workspace's files as Windows reads it (see `dotnetPaths`).
 *
 * @module dotnetProjects
 */
import { promises as fs } from "node:fs";
import path from "node:path";

import { folderOf, isProjectFile, joinWorkspacePath, nearestProjectFolder, workspaceFile } from "./dotnetPaths";
import type { WorkspaceFileIndex } from "./index";

const PROJECT_REFERENCE   = /<ProjectReference\b([^>]*?)(?:\/>|>([\s\S]*?)<\/ProjectReference>)/giu;
const SDK_ATTRIBUTE       = /<Project\b[^>]*?\bSdk\s*=\s*"[^"]+"/iu;
const SDK_ELEMENT         = /<Sdk\b[^>]*?\bName\s*=\s*"[^"]+"/iu;
const NO_TRANSITIVE       = /<DisableTransitiveProjectReferences>\s*true\s*<\/DisableTransitiveProjectReferences>/iu;
const NO_OUTPUT_REFERENCE = /\bReferenceOutputAssembly\s*(?:=\s*"\s*false\s*"|>\s*false\s*<)/iu;

/** One project, by its folder: what it references and whether references flow through it. */
interface ProjectNode {
  references: Set<string>;
  transitive: boolean;
}

/** The projects of a workspace, and what a file's project lets it see. */
export interface ProjectReach {
  /** The folder of the project a file belongs to, or undefined for a file no project holds. */
  projectOf(file: string): string | undefined;
  /** The project folders a file's project sees, nearest first: its own, its direct references, then further ones; undefined for a file no project holds. */
  tiersOf(file: string): string[][] | undefined;
}

const reachCache = new WeakMap<WorkspaceFileIndex, Promise<ProjectReach>>();

/** The workspace's project graph, read once per file index. */
export function projectReach(workspaceRoot: string, fileIndex: WorkspaceFileIndex | undefined): Promise<ProjectReach> {
  if (!fileIndex) return Promise.resolve({ projectOf: () => undefined, tiersOf: () => undefined });
  let pending = reachCache.get(fileIndex);
  if (!pending) {
    pending = buildReach(workspaceRoot, fileIndex);
    reachCache.set(fileIndex, pending);
  }
  return pending;
}

/** The project folders a project file references for its compiler, and whether it passes on its references' references. */
export function readProjectReferences(projectFile: string, content: string, fileIndex: WorkspaceFileIndex): { references: string[]; transitive: boolean } {
  const references: string[] = [];
  for (const match of content.matchAll(PROJECT_REFERENCE)) {
    const include = /\bInclude\s*=\s*"([^"]+)"/iu.exec(match[1])?.[1];
    if (!include || NO_OUTPUT_REFERENCE.test(match[1]) || NO_OUTPUT_REFERENCE.test(match[2] ?? "")) continue;
    const target = workspaceFile(joinWorkspacePath(folderOf(projectFile), include), fileIndex);
    if (target) references.push(folderOf(target));
  }
  const sdk = SDK_ATTRIBUTE.test(content) || SDK_ELEMENT.test(content);
  return { references, transitive: sdk && !NO_TRANSITIVE.test(content) };
}

async function buildReach(workspaceRoot: string, fileIndex: WorkspaceFileIndex): Promise<ProjectReach> {
  const nodes = new Map<string, ProjectNode>();
  for (const projectFile of Array.from(fileIndex).filter(isProjectFile).sort()) {
    let content: string;
    try {
      content = await fs.readFile(path.join(workspaceRoot, projectFile), "utf8");
    } catch {
      continue;
    }
    const { references, transitive } = readProjectReferences(projectFile, content, fileIndex);
    const folder = folderOf(projectFile);
    const node = nodes.get(folder) ?? { references: new Set<string>(), transitive: false };
    for (const reference of references) if (reference !== folder) node.references.add(reference);
    node.transitive ||= transitive;
    nodes.set(folder, node);
  }

  const tiers = new Map<string, string[][]>();
  const tiersOfProject = (project: string): string[][] => {
    let cached = tiers.get(project);
    if (cached) return cached;
    const node   = nodes.get(project);
    const direct = Array.from(node?.references ?? []).sort();
    const seen   = new Set([project, ...direct]);
    const further: string[] = [];
    if (node?.transitive) {
      const queue = [...direct];
      while (queue.length > 0) {
        for (const next of nodes.get(queue.shift()!)?.references ?? []) {
          if (seen.has(next)) continue;
          seen.add(next);
          further.push(next);
          queue.push(next);
        }
      }
    }
    cached = [[project], direct, further.sort()];
    tiers.set(project, cached);
    return cached;
  };

  return {
    projectOf: (file) => nearestProjectFolder(file, fileIndex),
    tiersOf:   (file) => {
      const project = nearestProjectFolder(file, fileIndex);
      return project === undefined ? undefined : tiersOfProject(project);
    }
  };
}
