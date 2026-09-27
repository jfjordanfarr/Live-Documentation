#!/usr/bin/env node
/**
 * Produces a fixture's compiler-derived expected edges.
 *
 * Copies the fixture to a temporary directory, runs scip-dotnet over its solution
 * (or lone project), and writes every file-to-file edge the compiler resolved to
 * `<fixture>/expected/compiler-edges.json`. Nothing is trimmed to fit an analyzer:
 * the file lists all indexed documents, all edges with the symbols that carry them,
 * and any symbol whose definition the solution leaves ambiguous.
 *
 * Usage:
 *   npm run oracle:index -- <fixture-dir>
 *
 * Needs the dotnet SDK and the scip-dotnet global tool. scip-dotnet is built for an
 * older runtime, so it is run with DOTNET_ROLL_FORWARD=Major.
 */
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

import { convertScipIndex, readProjects } from "./scip-edges";

const SKIPPED_ENTRIES = new Set(["bin", "obj", "expected", "index.scip"]);

function findProjectFile(fixtureDir: string): string {
  const entries   = fs.readdirSync(fixtureDir);
  const solutions = entries.filter((entry) => entry.endsWith(".sln"));
  const projects  = entries.filter((entry) => entry.endsWith(".csproj"));
  const found     = solutions.length > 0 ? solutions : projects;
  if (found.length !== 1) {
    throw new Error(`expected one .sln or .csproj at the root of ${fixtureDir}, found ${found.length}`);
  }
  return found[0];
}

function scipDotnetVersion(env: NodeJS.ProcessEnv): string {
  const result = spawnSync("scip-dotnet", ["--version"], { env, encoding: "utf8" });
  const line   = result.stdout.trim().split("\n")[0] ?? "";
  return line ? `scip-dotnet ${line.split("+")[0]}` : "scip-dotnet";
}

function main(): void {
  const [fixtureArg] = process.argv.slice(2);
  if (!fixtureArg || fixtureArg === "--help" || fixtureArg === "-h") {
    console.log("Usage: npm run oracle:index -- <fixture-dir>");
    process.exit(fixtureArg ? 0 : 1);
  }

  const fixtureDir  = path.resolve(fixtureArg);
  const projectFile = findProjectFile(fixtureDir);
  const env         = { ...process.env, DOTNET_ROLL_FORWARD: "Major", DOTNET_CLI_TELEMETRY_OPTOUT: "1", DOTNET_NOLOGO: "1" };
  const workDir     = fs.mkdtempSync(path.join(os.tmpdir(), "oracle-index-"));

  try {
    fs.cpSync(fixtureDir, workDir, {
      recursive: true,
      filter:    (source) => !SKIPPED_ENTRIES.has(path.basename(source))
    });

    const indexed = spawnSync("scip-dotnet", ["index", projectFile, "--output", "index.scip"], {
      cwd:      workDir,
      env,
      encoding: "utf8"
    });
    if (indexed.status !== 0) {
      process.stderr.write(indexed.stdout);
      process.stderr.write(indexed.stderr);
      throw new Error(`scip-dotnet exited with ${indexed.status}`);
    }

    const projects = readProjects(path.join(workDir, projectFile));
    const result   = convertScipIndex(fs.readFileSync(path.join(workDir, "index.scip")), projects, projectFile, scipDotnetVersion(env));

    const outputDir  = path.join(fixtureDir, "expected");
    const outputPath = path.join(outputDir, "compiler-edges.json");
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");

    console.log(`${result.tool}: ${result.documents.length} documents, ${result.edges.length} edges, ${result.ambiguous.length} ambiguous`);
    console.log(`Wrote ${path.relative(process.cwd(), outputPath)}`);
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}

main();
