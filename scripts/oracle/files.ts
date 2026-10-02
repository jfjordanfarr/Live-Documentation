/** Persist oracle paths relative to their JSON file; compare them relative to the fixture. */
import * as fs from "node:fs";
import path from "node:path";

import type { OracleEdges } from "./scip-edges";

/** A manually verified source relationship, with its evidence and optional deployment crossing. */
export interface HandVerifiedEdge {
  from: string;
  to: string;
  via: string;
  remote?: boolean;
}

/** The manually verified relationships stored alongside compiler expectations. */
export interface HandVerifiedEdges {
  convention?: string;
  edges: HandVerifiedEdge[];
}

/** Express a relative filesystem location from another directory, preserving absolute locations. */
export function rebasePath(value: string, fromDirectory: string, toDirectory: string): string {
  if (path.isAbsolute(value) || path.win32.isAbsolute(value)) return value;
  return path.relative(toDirectory, path.resolve(fromDirectory, value)).replace(/\\/g, "/") || ".";
}

/** Change only filesystem locations; keep all relationships, symbols, project references and ambiguity evidence. */
export function rebaseOracleEdges(graph: OracleEdges, fromDirectory: string, toDirectory: string): OracleEdges {
  const move = (value: string): string => rebasePath(value, fromDirectory, toDirectory);
  return {
    ...graph,
    ...(graph.projectFile !== undefined ? { projectFile: move(graph.projectFile) } : {}),
    projects: graph.projects.map(project => ({
      ...project,
      directory: move(project.directory),
      ...(project.members ? { members: project.members.map(move) } : {})
    })),
    documents: graph.documents.map(move),
    outside: graph.outside.map(move),
    edges: graph.edges.map(edge => ({ ...edge, from: move(edge.from), to: move(edge.to) })),
    ambiguous: graph.ambiguous.map(item => ({ ...item, from: move(item.from), candidates: item.candidates.map(move) }))
  };
}

/** Change the path coordinates of hand-verified edges without changing their evidence. */
export function rebaseHandVerifiedEdges(graph: HandVerifiedEdges, fromDirectory: string, toDirectory: string): HandVerifiedEdges {
  return {
    ...graph,
    edges: graph.edges.map(edge => ({
      ...edge,
      from: rebasePath(edge.from, fromDirectory, toDirectory),
      to: rebasePath(edge.to, fromDirectory, toDirectory)
    }))
  };
}

/** Write every compiler observation with locations relative to the file containing them. */
export function writeOracleEdges(file: string, fixtureDirectory: string, graph: OracleEdges): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(rebaseOracleEdges(graph, fixtureDirectory, path.dirname(file)), null, 2)}\n`, "utf8");
}

/** Read persisted compiler observations into the fixture-relative coordinates used by the comparison. */
export function readOracleEdges(file: string, fixtureDirectory: string): OracleEdges | undefined {
  if (!fs.existsSync(file)) return undefined;
  const graph = JSON.parse(fs.readFileSync(file, "utf8")) as OracleEdges;
  return rebaseOracleEdges(graph, path.dirname(file), fixtureDirectory);
}

/** Read hand-verified observations into fixture-relative coordinates. */
export function readHandVerifiedEdges(file: string, fixtureDirectory: string): HandVerifiedEdges | undefined {
  if (!fs.existsSync(file)) return undefined;
  const graph = JSON.parse(fs.readFileSync(file, "utf8")) as HandVerifiedEdges;
  return rebaseHandVerifiedEdges(graph, path.dirname(file), fixtureDirectory);
}
