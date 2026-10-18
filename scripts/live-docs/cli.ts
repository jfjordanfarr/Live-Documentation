/**
 * What every Live Docs command shares at its edge: the version it prints, read
 * from the manifest of the package that does its work, and a quiet end when
 * the reader closes the pipe.
 *
 * @module
 */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

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
