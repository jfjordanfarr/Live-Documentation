/**
 * A fixture is read in place and copied before anything runs over it. Build outputs
 * that a compiler or an indexer leaves behind are never part of a fixture, and neither
 * copy nor listing includes them.
 */
import * as fs from "node:fs";
import os from "node:os";
import path from "node:path";

const NOT_FIXTURE = new Set(["bin", "obj", "target", "node_modules", "__pycache__", "expected", "index.scip"]);

/** Copies the fixture, minus build outputs and its own `expected/` directory, to a fresh temporary directory. */
export function copyFixture(fixtureDir: string, prefix: string): string {
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  fs.cpSync(fixtureDir, workDir, {
    recursive: true,
    filter:    (source) => !NOT_FIXTURE.has(path.basename(source))
  });
  return workDir;
}

/** Every file of the fixture as a POSIX path relative to its root, minus build outputs and `expected/`. */
export function listFixtureFiles(fixtureDir: string): string[] {
  const files: string[] = [];
  const walk = (relative: string): void => {
    for (const entry of fs.readdirSync(path.join(fixtureDir, relative), { withFileTypes: true })) {
      if (NOT_FIXTURE.has(entry.name)) continue;
      const entryPath = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(entryPath);
      } else {
        files.push(entryPath);
      }
    }
  };
  walk("");
  return files.sort();
}
