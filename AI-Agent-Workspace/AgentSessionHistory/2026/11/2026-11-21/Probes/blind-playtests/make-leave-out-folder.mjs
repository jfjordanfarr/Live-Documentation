#!/usr/bin/env node
// Makes the folder the blind playtests of the choice before a scan are given (2026-11-21): the owner's shape, from
// `Probes/leave-out/make-folder.mjs`, made small enough that a browser lists it through a folder input within about
// 15 s. The full made folder (103,329 files) takes 65 to 71 s.
//
//   node make-leave-out-folder.mjs <DNN clone, read only> <folder to make>
//
// 1. `make-folder.mjs` makes the full folder from the clone: DNN without `.git`, its `.gitignore` files and the tool's
//    docs; `bin` and `obj` beside every project file; a NuGet-shaped `packages` folder at the top (600 packages) and in
//    each of the first 45 project folders (80 each); NuGet's recommended `.tfignore` in every third of those 45.
// 2. Each `packages` folder keeps its `repositories.config` and its first packages by name, 30 at the top and 4 in a
//    project folder; the rest are removed.
//    DNN's own top `Packages/` (one `repositories.config`) is removed: on a Windows drive it is the made `packages/`.
// 3. DNN's nested `.gitignore` files are put back where the clone has them; its top `.gitignore` is not, since a TFS
//    folder has none at its top, and that one file would leave out every `bin`, `obj` and `packages` by its own lines.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const [source, target] = process.argv.slice(2).map((p) => p && path.resolve(p));
if (!source || !target) { console.error("usage: make-leave-out-folder.mjs <DNN clone> <folder to make>"); process.exit(2); }
const maker = path.join(here, "..", "leave-out", "make-folder.mjs");
console.log(execFileSync(process.execPath, [maker, source, target], { encoding: "utf8" }).trim());
fs.rmSync(`${target}.manifest.json`, { force: true }); // describes the full folder, not this one

// DNN's own top `Packages/` holds one `repositories.config`, as the made top `packages/` does. On the owner's Windows
// drive the two names are one folder; here they would stand side by side, differing by case alone. DNN's goes.
const doubled = fs.readdirSync(target).filter((name) => name !== "packages" && name.toLowerCase() === "packages");
for (const name of doubled) fs.rmSync(path.join(target, name), { recursive: true });

const KEEP_TOP = 30;
const KEEP_IN_PROJECT = 4;
const packagesFolders = [];
const find = (relative) => {
  for (const entry of fs.readdirSync(path.join(target, relative), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const child = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.name === "packages" && fs.existsSync(path.join(target, child, "repositories.config"))) packagesFolders.push(child);
    else find(child);
  }
};
find("");
for (const folder of packagesFolders) {
  const keep = folder === "packages" ? KEEP_TOP : KEEP_IN_PROJECT;
  const packages = fs.readdirSync(path.join(target, folder), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
  for (const name of packages.slice(keep)) fs.rmSync(path.join(target, folder, name), { recursive: true });
}

const restored = [];
const putBack = (relative) => {
  for (const entry of fs.readdirSync(path.join(source, relative), { withFileTypes: true })) {
    const child = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory() && entry.name !== ".git") putBack(child);
    else if (entry.name === ".gitignore" && relative !== "") {
      fs.mkdirSync(path.join(target, relative), { recursive: true });
      fs.copyFileSync(path.join(source, child), path.join(target, child));
      restored.push(child);
    }
  }
};
putBack("");

const count = { files: 0, packages: 0, build: 0, gitignore: 0, tfignore: 0 };
const tally = (relative, under) => {
  for (const entry of fs.readdirSync(path.join(target, relative), { withFileTypes: true })) {
    const child = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      const kind = entry.name === "packages" && packagesFolders.includes(child) ? "packages" : ["bin", "obj"].includes(entry.name) ? "build" : under;
      tally(child, kind);
    } else {
      count.files += 1;
      if (under) count[under] += 1;
      if (entry.name === ".gitignore") count.gitignore += 1;
      if (entry.name === ".tfignore") count.tfignore += 1;
    }
  }
};
tally("", null);
console.log(JSON.stringify({ packagesFolders: packagesFolders.length, nestedGitignoreRestored: restored.length, ...count }));
