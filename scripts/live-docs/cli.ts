/**
 * What every Live Docs command shares at its edge: the version it prints, read
 * from the manifest of the package that does its work; the configuration it
 * reads; how it ends, with a refused argument said on one line and a pointer to
 * its help; and a quiet end when the reader closes the pipe.
 *
 * @module
 */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import type { LiveDocumentationConfigInput } from "@live-documentation/engine/config/liveDocumentationConfig";

/** The version of one of this repository's packages, from its manifest: a command prints its package's version, never a constant of its own. */
export async function packageVersion(packageName: "engine" | "generator"): Promise<string> {
  const manifest = path.resolve(__dirname, "..", "..", "packages", packageName, "package.json");
  const { version } = JSON.parse(await fs.readFile(manifest, "utf8")) as { version: string };
  return version;
}

/** Ends the process quietly when the reader closes the pipe before the listing is done, as `head` does, instead of dying with a stack trace. */
export function endQuietlyWhenThePipeCloses(): void {
  process.stdout.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EPIPE") {
      process.exit(0);
    }
    throw error;
  });
}

/** A command line the command refuses: one plain sentence, printed with where its options are listed and never with a stack. */
export class UsageError extends Error {}

/** The value after an option, refused when it is missing or is itself an option. */
export function optionValue(argv: string[], index: number, flag: string): string {
  const value = argv[index];
  if (value === undefined || value.startsWith("-")) {
    throw new UsageError(`${flag} takes a value.`);
  }
  return value;
}

/**
 * Runs a command to its end, by the name of the npm script that runs it: a
 * refused command line prints one line, naming what was refused and how to list
 * the options; any other failure prints its message; both exit 1.
 */
export function runCommand(name: string, main: () => Promise<void>): void {
  main().catch((error: unknown) => {
    if (error instanceof UsageError) {
      console.error(`${name}: ${error.message} Run "npm run ${name} -- --help" to list the options.`);
    } else {
      console.error(`${name} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    process.exitCode = 1;
  });
}

/**
 * The configuration a command reads: the file given, else the workspace's own
 * `.live-docs.config.json` when it has one, else nothing, which leaves the
 * shipped defaults. The history command reads its lens by the same rule.
 */
export async function readConfiguration(workspaceRoot: string, configPath: string | undefined): Promise<LiveDocumentationConfigInput> {
  const file = configPath === undefined ? path.join(workspaceRoot, ".live-docs.config.json") : path.resolve(configPath);
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as LiveDocumentationConfigInput;
  } catch (error) {
    if (configPath === undefined && (error as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }
    throw new Error(`cannot read the configuration at ${file}: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
}
