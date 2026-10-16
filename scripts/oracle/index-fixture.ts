#!/usr/bin/env node
/**
 * Produces a fixture's compiler-derived expected edges.
 *
 * Copies the fixture to a temporary directory, runs the indexer for its language
 * over the copy, and writes every file-to-file edge the compiler resolved to
 * `<fixture>/expected/compiler-edges.json`. Nothing is trimmed to fit an analyzer: the
 * file lists all indexed documents, all edges with the symbols that carry them, and any
 * symbol whose definition the project leaves ambiguous. An indexer that is not a SCIP
 * indexer reads the copy itself and keeps the rest of what its tool said in a record
 * beside the edges.
 *
 * The indexer is chosen by what the fixture contains, in this order:
 *
 *   .sln or .csproj at the root   scip-dotnet      needs the dotnet SDK; the tool is built for an
 *                                                  older runtime, so it runs with DOTNET_ROLL_FORWARD=Major
 *   go.mod                        scip-go
 *   Cargo.toml                    rust-analyzer    its `scip` subcommand; crates are read from Cargo's
 *                                                  conventional layout (lib, main, src/bin, tests, examples, benches)
 *   pom.xml                       scip-java        drives Maven, which downloads its plugins on first use
 *   tsconfig.json                 scip-typescript  the copy in this repository's node_modules
 *   compile_commands.json         scip-clang       C and C++ from the fixture's own compilation
 *                                                  database, whose `directory` entries say "." and are
 *                                                  rewritten to the working copy before indexing
 *   any .py file                  scip-python      the fixture directory's name is the project name;
 *                                                  the tool crashes without a --project-version
 *   any .ps1 or .psm1 file        pwsh             PowerShell's own parser over every .ps1, .psm1 and
 *                                                  .psd1, through `powershell-ast.ps1`; its whole record
 *                                                  is written beside the edges as `powershell-ast.json`
 *
 * Usage:
 *   npm run oracle:index -- <fixture-dir>
 */
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { writeOracleEdges, writePowerShellAst } from "./files";
import { copyFixture, listFixtureFiles } from "./fixture";
import { edgesFromPowerShellAst, parsePowerShellFixture, POWERSHELL_EXTENSIONS } from "./powershell-edges";
import { cargoProjects, convertScipIndex, readProjects, type OracleEdges, type OracleProject } from "./scip-edges";

interface Detected {
  projectFile?: string;
}

interface IndexerBase {
  name: string;
  /** Recognises the fixture from its file list; the project file when the language has one. */
  detect(files: string[]): Detected | undefined;
}

/** A SCIP indexer: a command that writes `index.scip`, whose edges `scip-edges` derives. */
interface ScipIndexer extends IndexerBase {
  /** Makes the working copy ready for the indexer, when the fixture cannot be indexed as it lies. */
  prepare?(workDir: string): void;
  /** The command that writes `index.scip` into the working copy. */
  command(fixture: { name: string; projectFile?: string }): { command: string; args: string[] };
  /** The version the CLI reports, for a tool that misreports its own inside the index. */
  reportedVersion?(env: NodeJS.ProcessEnv): string;
  /** The fixture's projects and their references, when the language has a solution structure. */
  projects?(workDir: string, projectFile: string): OracleProject[];
}

/** What an indexer that reads the working copy itself found: the edges, and the rest of what its tool said, written beside them. */
interface Reading {
  edges: OracleEdges;
  /** Writes the tool's whole record into the expectations directory and returns the file it wrote. */
  writeBeside(outputDir: string, fixtureDir: string): string;
}

/** An indexer that is not SCIP: it reads the working copy's files itself. */
interface ReadingIndexer extends IndexerBase {
  read(workDir: string, files: string[], projects: OracleProject[]): Reading;
}

type Indexer = ScipIndexer | ReadingIndexer;

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
    name:   "scip-clang",
    detect: (files) => marker(files, "compile_commands.json"),
    prepare(workDir) {
      // A fixture's compilation database cannot know where it will be copied, so its entries say
      // `"directory": "."`; scip-clang resolves every path against that directory and wants it absolute.
      const databasePath = path.join(workDir, "compile_commands.json");
      const database     = JSON.parse(fs.readFileSync(databasePath, "utf8")) as Array<Record<string, unknown>>;
      const prepared     = database.map((entry) => ({ ...entry, directory: workDir }));
      fs.writeFileSync(databasePath, `${JSON.stringify(prepared, null, 2)}\n`);
    },
    command: () => ({ command: "scip-clang", args: ["--compdb-path=compile_commands.json", "--index-output-path=index.scip", "--no-progress-report"] })
  },
  {
    name:    "scip-python",
    detect:  (files) => (files.some((file) => file.endsWith(".py")) ? {} : undefined),
    command: ({ name }) => ({ command: "scip-python", args: ["index", ".", "--project-name", name, "--project-version", "0", "--output", "index.scip"] })
  },
  {
    name:   "pwsh",
    detect: (files) => (files.some((file) => /\.(ps1|psm1)$/iu.test(file)) ? {} : undefined),
    read(workDir, files, projects) {
      const ast = parsePowerShellFixture(workDir, files.filter((file) => POWERSHELL_EXTENSIONS.includes(path.extname(file).toLowerCase())));
      return {
        edges: edgesFromPowerShellAst(ast, projects),
        writeBeside(outputDir, fixtureDir) {
          const file = path.join(outputDir, "powershell-ast.json");
          writePowerShellAst(file, fixtureDir, ast);
          return file;
        }
      };
    }
  }
];

/** The one project of a fixture without a solution structure. */
function wholeFixture(name: string): OracleProject[] {
  return [{ name, directory: ".", references: [] }];
}

/** Runs a SCIP indexer over the working copy and derives its edges. */
function indexWithScip(indexer: ScipIndexer, workDir: string, fixture: { name: string; projectFile?: string }): OracleEdges {
  indexer.prepare?.(workDir);
  const { command, args } = indexer.command(fixture);
  const indexed = spawnSync(command, args, { cwd: workDir, env: ENV, encoding: "utf8" });
  if (indexed.error) {
    throw new Error(`${indexer.name} could not be run: ${indexed.error.message}`);
  }
  if (indexed.status !== 0) {
    process.stderr.write(indexed.stdout);
    process.stderr.write(indexed.stderr);
    throw new Error(`${indexer.name} exited with ${indexed.status}`);
  }
  return convertScipIndex(fs.readFileSync(path.join(workDir, "index.scip")), {
    projects:    fixture.projectFile && indexer.projects ? indexer.projects(workDir, fixture.projectFile) : wholeFixture(fixture.name),
    projectFile: fixture.projectFile,
    tool:        indexer.reportedVersion?.(ENV)
  });
}

function detectIndexer(fixtureDir: string): { indexer: Indexer; projectFile?: string } {
  const files = listFixtureFiles(fixtureDir);
  for (const indexer of INDEXERS) {
    const detected = indexer.detect(files);
    if (detected) {
      return { indexer, ...detected };
    }
  }
  throw new Error(`no indexer applies to ${fixtureDir}: it has no .sln, .csproj, go.mod, Cargo.toml, pom.xml, tsconfig.json, compile_commands.json, .py, .ps1 or .psm1 file`);
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
    let reading: Reading | undefined;
    let result: OracleEdges;
    if ("read" in indexer) {
      reading = indexer.read(workDir, listFixtureFiles(workDir), wholeFixture(name));
      result  = reading.edges;
    } else {
      result = indexWithScip(indexer, workDir, { name, projectFile });
    }

    const outputDir  = path.join(fixtureDir, "expected");
    const outputPath = path.join(outputDir, "compiler-edges.json");
    writeOracleEdges(outputPath, fixtureDir, result);
    const beside = reading?.writeBeside(outputDir, fixtureDir);

    const outside = result.outside.length > 0 ? `, ${result.outside.length} outside the fixture` : "";
    console.log(`${result.tool}: ${result.documents.length} documents, ${result.edges.length} edges, ${result.ambiguous.length} ambiguous${outside}`);
    console.log(`Wrote ${path.relative(process.cwd(), outputPath)}`);
    if (beside) console.log(`Wrote ${path.relative(process.cwd(), beside)}`);
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}

main();
