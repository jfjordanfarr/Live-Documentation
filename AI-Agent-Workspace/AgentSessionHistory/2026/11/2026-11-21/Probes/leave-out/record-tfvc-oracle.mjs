#!/usr/bin/env node
// Records what Microsoft's own TFVC code decides for a set of trees with `.tfignore` files, so that the engine's
// `leaveOut` can be held to it by a test that needs neither Java nor Microsoft's sources
// (`packages/engine/src/tooling/leaveOut.tfvc.test.ts`). The oracle is Team Explorer Everywhere's matcher
// (`IgnoreFile`, `IgnoreEntry`, `LocalItemExclusionEvaluator`, MIT, commit 21e0e598), compiled unchanged with a small
// driver that walks a tree and prints, for each file, TFVC's change scanner's verdict and the `.tfignore` and line
// that decided it; it was built for this probe in a scratch folder and is described in this folder's README.
//
//   node record-tfvc-oracle.mjs <oracle folder> <fixtures folder of trees> <out.json>
//
// Every tree is run with no global exclusion list (`--global none`), since a page cannot know a server's list. The
// named trees are the oracle's own fixtures; the rest are made at random from a fixed seed.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [oracle, treesFolder, out] = process.argv.slice(2);

function walk(root, relative = "", found = []) {
  for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const child = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory()) walk(root, child, found);
    else found.push(child);
  }
  return found;
}

/** A `.tfignore` as TFVC decodes it: by its byte-order mark, else the platform's code page, which Latin-1 stands for here. */
function textOf(file) {
  const bytes = fs.readFileSync(file);
  return bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf ? bytes.toString("utf8") : bytes.toString("latin1");
}

function ask(root) {
  const run = spawnSync("bash", [path.join(oracle, "run.sh"), root, "--global", "none"], { encoding: "utf8", maxBuffer: 1 << 26 });
  if (run.status !== 0) throw new Error(run.stderr);
  const verdicts = [];
  for (const line of run.stdout.trim().split("\n").slice(1)) {
    const [kind, file, scan, , source, number] = line.split("\t");
    if (kind !== "file") continue;
    verdicts.push({ path: file, excluded: scan === "excluded", source: source === "-" ? null : source, line: number === "-" ? null : Number(number) });
  }
  return verdicts;
}

function record(name, root) {
  const files = walk(root);
  const tfignores = Object.fromEntries(files.filter((file) => path.posix.basename(file).toLowerCase() === ".tfignore").map((file) => [file, textOf(path.join(root, file))]));
  return { name, files, tfignores, verdicts: ask(root) };
}

const trees = [];
for (const name of fs.readdirSync(treesFolder).sort()) trees.push(record(name, path.join(treesFolder, name)));

// Random trees: names and lines from small alphabets, so that wildcards, prefixes and nesting meet often.
let seed = 20261121;
const random = (n) => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed % n;
};
const names = ["a", "b", "ab", "x.cs", "y.dll", "log", "bin", "obj", "pkg", "k.txt", "name.", "z"];
const parts = ["a", "b", "x", "*", "?", "*.cs", "*.dll", "bin", "obj", "pkg", "k*", "*b", "a?", "*.*"];
const scratch = path.join(path.dirname(out), "random-trees");
fs.rmSync(scratch, { recursive: true, force: true });
for (let round = 0; round < 40; round++) {
  const root = path.join(scratch, `random-${round}`);
  const files = new Set();
  for (let i = 0; i < 14; i++) files.add(Array.from({ length: 1 + random(3) }, () => names[random(names.length)]).join("/"));
  const all = [...files];
  const keptFiles = all.filter((file) => !all.some((other) => other.startsWith(`${file}/`)));
  for (const file of keptFiles) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), "");
  }
  const line = () => `${["", "", "!", "\\", "!\\"][random(5)]}${random(4) === 0 ? `${names[random(names.length)]}\\` : ""}${parts[random(parts.length)]}${random(6) === 0 ? "\\" : ""}`;
  fs.writeFileSync(path.join(root, ".tfignore"), `${Array.from({ length: 1 + random(4) }, line).join("\r\n")}\r\n`);
  const folder = keptFiles.find((file) => file.includes("/"))?.split("/")[0];
  if (folder && random(2) === 0) fs.writeFileSync(path.join(root, folder, ".tfignore"), `${line()}\n${line()}\n`);
  trees.push(record(`random-${round}`, root));
}
fs.rmSync(scratch, { recursive: true, force: true });
fs.writeFileSync(out, `${JSON.stringify({ oracle: "Team Explorer Everywhere 21e0e598, LocalItemExclusionEvaluator, scanner's verdict, no global list", trees }, null, 1)}\n`);
console.log(`recorded ${trees.length} trees, ${trees.reduce((sum, tree) => sum + tree.verdicts.length, 0)} verdicts`);
