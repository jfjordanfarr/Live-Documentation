/**
 * The folders the standing check scans in the page and under Node: every sample program
 * (`tests/integration/programs/<language>/<program>`) and every fixture (`tests/integration/fixtures/<fixture>`), so
 * that every reader the engine registers reads files of its own language somewhere in the set, and a sample added later
 * joins the check by being added. `fixtures.test.ts` holds that every reader is reached, and names which fixture
 * reaches which.
 */
import fs from "node:fs";
import path from "node:path";

const REPO = path.resolve(__dirname, "..", "..");

/** A folder the check scans: a short name (`csharp/estate`, `fixtures/link-targets`) and where it lies. */
export interface PageScanFixture {
  name: string;
  folder: string;
  absolute: string;
}

const folders = (parent: string): string[] =>
  fs.readdirSync(path.join(REPO, parent), { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => `${parent}/${entry.name}`);

export const FIXTURES: readonly PageScanFixture[] = [
  ...folders("tests/integration/programs").flatMap(folders),
  ...folders("tests/integration/fixtures")
].sort().map((folder) => ({
  name: folder.startsWith("tests/integration/programs/") ? folder.slice("tests/integration/programs/".length) : `fixtures/${path.basename(folder)}`,
  folder,
  absolute: path.join(REPO, folder)
}));
