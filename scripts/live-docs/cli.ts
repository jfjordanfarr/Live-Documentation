/**
 * What every Live Docs command shares at its edge: the version it prints, read
 * from the manifest of the package that does its work; the folder a person ran
 * it from, which every path they type is taken from; the configuration it
 * reads; how it ends, with a refused argument said on one line and a pointer to
 * its help; and a quiet end when the reader closes the pipe.
 *
 * @module
 */
import { statSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import type { LiveDocumentationConfigInput } from "@live-documentation/engine/config/liveDocumentationConfig";
import { gitIgnored } from "@live-documentation/engine/tooling/gitIgnored";

/**
 * The folder the person ran the command from: the workspace when they name
 * none, and where every path they type is taken from. `npm run` starts a
 * script in this checkout's own folder, wherever the person stands, and says
 * where they stood in `INIT_CWD`; that folder is the one meant, when npm
 * started this very script. A process started otherwise, by a test, by
 * another command or by a person running the script directly, inherits npm's
 * variables without having been started by it, and its own working directory
 * is the one meant.
 *
 * @param env - The environment, for `INIT_CWD` and the script npm ran (`npm_lifecycle_script`).
 * @param cwd - The process's working directory, where npm's script line is read from.
 * @param script - The script this process runs, as Node names it.
 */
export function invocationFolder(env: NodeJS.ProcessEnv = process.env, cwd: string = process.cwd(), script: string | undefined = process.argv[1]): string {
  const stoodIn = env.INIT_CWD;
  const ranByNpm = env.npm_lifecycle_script;
  if (!stoodIn || !ranByNpm || !script) {
    return cwd;
  }
  // A path's case is not the person's to get right on Windows, where npm and Node may spell a drive letter differently.
  const same = (a: string, b: string): boolean => process.platform === "win32" ? a.toLowerCase() === b.toLowerCase() : a === b;
  const words = ranByNpm.split(/\s+/u).map((word) => word.replace(/^["']|["']$/gu, "")).filter(Boolean);
  return words.some((word) => same(path.resolve(cwd, word), path.resolve(script))) ? path.resolve(stoodIn) : cwd;
}

/** A path the person typed, made absolute from the folder they ran the command from ({@link invocationFolder}). */
export function typedPath(typed: string): string {
  return path.resolve(invocationFolder(), typed);
}

/**
 * The folder a command works on: the one `--workspace` names, from where the
 * person ran the command, else that folder itself. A name that is no folder
 * is refused with the path looked for, since a mistyped one would otherwise
 * map nothing and say so as success, and `generate` would make the folder.
 */
export function workspaceFolder(given: string | undefined): string {
  const folder = given === undefined ? invocationFolder() : typedPath(given);
  const found = statSync(folder, { throwIfNoEntry: false });
  if (found === undefined) {
    throw new UsageError(`There is no folder at ${folder}; --workspace names the folder to work on.`);
  }
  if (!found.isDirectory()) {
    throw new UsageError(`${folder} is a file; --workspace names the folder to work on.`);
  }
  return folder;
}

/**
 * What a person must be told of how the files git ignores are found in a
 * folder, when it is not by git's own word: discovery then reads the folder's
 * own `.gitignore` alone (`keptByGitAndConfiguration` in the engine's
 * discovery), and what a nested `.gitignore`, `.git/info/exclude` or the global
 * excludes file hides, a .NET project's `bin/` and `obj/` above all, gets docs.
 * A warning when the folder lies in a repository git cannot be asked about, as
 * when git is not on the path or does not trust the folder's owner; a note when
 * no repository holds it; nothing when git answers.
 */
export function gitIgnoresUnasked(workspaceRoot: string): { warning: string } | { note: string } | undefined {
  if (gitIgnored(workspaceRoot, ["."]) !== null) {
    return undefined;
  }
  const own = path.join(workspaceRoot, ".gitignore");
  for (let folder = workspaceRoot; ; folder = path.dirname(folder)) {
    if (statSync(path.join(folder, ".git"), { throwIfNoEntry: false }) !== undefined) {
      return { warning: `git could not be asked what it ignores in ${workspaceRoot}, though it lies in the repository at ${folder}: git may not be on the path, or may not trust the folder's owner, which "git status" there will say. So only ${own} is read, and what another .gitignore, .git/info/exclude or the global excludes hide, such as bin/ and obj/, gets docs; name it in the configuration's exclude, or mend git.` };
    }
    if (path.dirname(folder) === folder) {
      return { note: `Not in a git repository, so of what to leave out only ${own} and the configuration's exclude are read.` };
    }
  }
}

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

/** The option every command takes, and none lists among its own: on a failure, print where it failed. */
const STACK_OPTION = "--stack";

/**
 * Runs a command to its end, by the name of the npm script that runs it: a
 * refused command line prints one line, naming what was refused and how to list
 * the options; any other failure prints its message, with how to see where it
 * failed, and with `--stack` on the command line, the stack of the failure and
 * of each failure that caused it; both exit 1.
 */
export function runCommand(name: string, main: () => Promise<void>): void {
  // Taken off the command line before the command reads it, so that every command takes it without a word of its own.
  const at = process.argv.indexOf(STACK_OPTION, 2);
  const withStack = at !== -1;
  if (withStack) {
    process.argv.splice(at, 1);
  }
  main().catch((error: unknown) => {
    if (error instanceof UsageError) {
      console.error(`${name}: ${error.message} Run "npm run ${name} -- --help" to list the options.`);
    } else if (withStack) {
      console.error(`${name} failed: ${stackOf(error)}`);
    } else {
      console.error(`${name} failed: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`To see where it failed, run the command again with ${STACK_OPTION}.`);
    }
    process.exitCode = 1;
  });
}

/** A failure's stack, then each cause's under "Caused by", as far as the chain goes. */
function stackOf(error: unknown): string {
  const lines: string[] = [];
  for (let current: unknown = error, depth = 0; current !== undefined && depth < 16; depth += 1) {
    lines.push(`${depth > 0 ? "Caused by: " : ""}${current instanceof Error ? (current.stack ?? current.message) : String(current)}`);
    current = current instanceof Error ? current.cause : undefined;
  }
  return lines.join("\n");
}

/**
 * A text file's characters, in whichever of the encodings Windows writes by
 * default it was saved: UTF-8 with or without a byte-order mark (Windows
 * PowerShell 5.1's `Set-Content -Encoding UTF8` writes the mark), or UTF-16
 * little- or big-endian after its mark (its `Out-File` and `>`). The mark
 * itself is not part of the text.
 */
export function decodeText(bytes: Uint8Array): string {
  const encoding = bytes[0] === 0xff && bytes[1] === 0xfe ? "utf-16le" : bytes[0] === 0xfe && bytes[1] === 0xff ? "utf-16be" : "utf-8";
  // The decoder drops the mark of the encoding it decodes.
  return new TextDecoder(encoding).decode(bytes);
}

/**
 * The configuration a command reads: the file given, from the folder the
 * command was run from ({@link typedPath}), else the workspace's own
 * `.live-docs.config.json` when it has one, else nothing, which leaves the
 * shipped defaults. The history command reads its lens by the same rule.
 * Saved by Windows PowerShell 5.1 with a byte-order mark, or as UTF-16, it is
 * read all the same ({@link decodeText}).
 */
export async function readConfiguration(workspaceRoot: string, configPath: string | undefined): Promise<LiveDocumentationConfigInput> {
  const file = configPath === undefined ? path.join(workspaceRoot, ".live-docs.config.json") : typedPath(configPath);
  try {
    return JSON.parse(decodeText(await fs.readFile(file))) as LiveDocumentationConfigInput;
  } catch (error) {
    if (configPath === undefined && (error as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }
    throw new Error(`cannot read the configuration at ${file}: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
}
