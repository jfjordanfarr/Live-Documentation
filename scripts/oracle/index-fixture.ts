#!/usr/bin/env node
/**
 * Produces a fixture's compiler-derived expected edges.
 *
 * Copies the fixture to a temporary directory, runs the SCIP indexer for its language
 * over the copy, and writes every file-to-file edge the compiler resolved to
 * `<fixture>/expected/compiler-edges.json`. Nothing is trimmed to fit an analyzer: the
 * file lists all indexed documents, all edges with the symbols that carry them, and any
 * symbol whose definition the project leaves ambiguous.
 *
 * The indexer is chosen by what the fixture contains:
 *
 *   .sln or .csproj at the root   scip-dotnet      needs the dotnet SDK; the tool is built for an
 *                                                  older runtime, so it runs with DOTNET_ROLL_FORWARD=Major
 *   go.mod                        scip-go
 *   Cargo.toml                    rust-analyzer    its `scip` subcommand; crates are read from Cargo's
 *                                                  conventional layout (lib, main, src/bin, tests, examples, benches)
 *   pom.xml                       scip-java        drives Maven, which downloads its plugins on first use
 *   tsconfig.json                 scip-typescript  the copy in this repository's node_modules
 *   any .py file                  scip-python      the fixture directory's name is the project name;
 *                                                  the tool crashes without a --project-version
 *
 * Usage:
 *   npm run oracle:index -- <fixture-dir>
 */
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { writeOracleEdges } from "./files";
import { copyFixture, listFixtureFiles } from "./fixture";
import { cargoProjects, convertScipIndex, readProjects, type IndexContext, type OracleProject } from "./scip-edges";

interface Detected {
  projectFile?: string;
}

interface Indexer {
  name: string;
  /** Recognises the fixture from its file list; the project file when the language has one. */
  detect(files: string[]): Detected | undefined;
  /** The command that writes `index.scip` into the working copy. */
  command(fixture: { name: string; projectFile?: string }): { command: string; args: string[] };
  /** The version the CLI reports, for a tool that misreports its own inside the index. */
  reportedVersion?(env: NodeJS.ProcessEnv): string;
  /** The fixture's projects and their references, when the language has a solution structure. */
  projects?(workDir: string, projectFile: string): OracleProject[];
}

const ENV             = { ...process.env, DOTNET_ROLL_FORWARD: "Major", DOTNET_CLI_TELEMETRY_OPTOUT: "1", DOTNET_NOLOGO: "1" };
const SCIP_TYPESCRIPT = path.join(path.dirname(require.resolve("@sourcegraph/scip-typescript/package.json")), "dist", "src", "main.js");

function atRoot(files: string[], matches: (file: string) => boolean): string[] {
  return files.filter((file) => !file.includes("/") && matches(file));
}

function marker(files: string[], name: string): Detected | undefined {
  return files.includes(name) ? { projectFile: name } : undefined;
}

const INDEXERS: Indexer[] = [
  {
    name: "scip-dotnet",
    detect(files) {
      const solutions = atRoot(files, (file) => file.endsWith(".sln"));
      const projects  = atRoot(files, (file) => file.endsWith(".csproj"));
      const found     = solutions.length > 0 ? solutions : projects;
      if (found.length === 0) return undefined;
      if (found.length > 1) throw new Error(`expected one .sln or .csproj at the fixture root, found ${found.length}`);
      return { projectFile: found[0] };
    },
    command:  ({ projectFile }) => ({ command: "scip-dotnet", args: ["index", projectFile!, "--output", "index.scip"] }),
    reportedVersion(env) {
      const result = spawnSync("scip-dotnet", ["--version"], { env, encoding: "utf8" });
      const line   = result.stdout.trim().split("\n")[0] ?? "";
      return line ? `scip-dotnet ${line.split("+")[0]}` : "scip-dotnet";
    },
    projects: (workDir, projectFile) => readProjects(path.join(workDir, projectFile))
  },
  {
    name:    "scip-go",
    detect:  (files) => marker(files, "go.mod"),
    command: () => ({ command: "scip-go", args: ["--output", "index.scip"] })
  },
  {
    name:     "rust-analyzer",
    detect:   (files) => marker(files, "Cargo.toml"),
    command:  () => ({ command: "rust-analyzer", args: ["scip", ".", "--output", "index.scip"] }),
    projects: (workDir) => cargoProjects(workDir, listFixtureFiles(workDir))
  },
  {
    name:    "scip-java",
    detect:  (files) => marker(files, "pom.xml"),
    command: () => ({ command: "scip-java", args: ["index", "--output", "index.scip"] })
  },
  {
    name:    "scip-typescript",
    detect:  (files) => marker(files, "tsconfig.json"),
    command: () => ({ command: process.execPath, args: [SCIP_TYPESCRIPT, "index", "--output", "index.scip"] })
  },
  {
    name:    "scip-python",
    detect:  (files) => (files.some((file) => file.endsWith(".py")) ? {} : undefined),
    command: ({ name }) => ({ command: "scip-python", args: ["index", ".", "--project-name", name, "--project-version", "0", "--output", "index.scip"] })
  }
];

function detectIndexer(fixtureDir: string): { indexer: Indexer; projectFile?: string } {
  const files = listFixtureFiles(fixtureDir);
  for (const indexer of INDEXERS) {
    const detected = indexer.detect(files);
    if (detected) {
      return { indexer, ...detected };
    }
  }
  throw new Error(`no indexer applies to ${fixtureDir}: it has no .sln, .csproj, go.mod, Cargo.toml, pom.xml, tsconfig.json or .py file`);
}

function main(): void {
  const [fixtureArg] = process.argv.slice(2);
  if (!fixtureArg || fixtureArg === "--help" || fixtureArg === "-h") {
    console.log("Usage: npm run oracle:index -- <fixture-dir>");
    process.exit(fixtureArg ? 0 : 1);
  }

  const fixtureDir             = path.resolve(fixtureArg);
  const name                   = path.basename(fixtureDir);
  const { indexer, projectFile } = detectIndexer(fixtureDir);
  const workDir                = copyFixture(fixtureDir, "oracle-index-");

  try {
    const { command, args } = indexer.command({ name, projectFile });
    const indexed = spawnSync(command, args, { cwd: workDir, env: ENV, encoding: "utf8" });
    if (indexed.error) {
      throw new Error(`${indexer.name} could not be run: ${indexed.error.message}`);
    }
    if (indexed.status !== 0) {
      process.stderr.write(indexed.stdout);
      process.stderr.write(indexed.stderr);
      throw new Error(`${indexer.name} exited with ${indexed.status}`);
    }

    const context: IndexContext = {
      projects:    projectFile && indexer.projects ? indexer.projects(workDir, projectFile) : [{ name, directory: ".", references: [] }],
      projectFile,
      tool:        indexer.reportedVersion?.(ENV)
    };
    const result = convertScipIndex(fs.readFileSync(path.join(workDir, "index.scip")), context);

    const outputDir  = path.join(fixtureDir, "expected");
    const outputPath = path.join(outputDir, "compiler-edges.json");
    writeOracleEdges(outputPath, fixtureDir, result);

    const outside = result.outside.length > 0 ? `, ${result.outside.length} outside the fixture` : "";
    console.log(`${result.tool}: ${result.documents.length} documents, ${result.edges.length} edges, ${result.ambiguous.length} ambiguous${outside}`);
    console.log(`Wrote ${path.relative(process.cwd(), outputPath)}`);
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}

main();
