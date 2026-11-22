// Compares this repository's whole docs and index, as generated now, with a copy saved before a change, byte for byte.
//   node compare-docs.mjs <saved copy of .mdmd> <.mdmd now> [<source path edited> ...]
// Prints each doc that differs or exists on one side alone. The docs of the source files the change edited are listed
// apart, since their own lines move with their source; every other doc must be the same bytes. The index is compared
// with the nodes of the edited files' docs taken out, so that what moved elsewhere in the graph shows.
import fs from "node:fs";
import path from "node:path";

const [saved, now, ...edited] = process.argv.slice(2);
const editedDocs = new Set(edited.map((source) => `layer-4/${source}.mdmd.md`));
const filesUnder = (root) => fs.readdirSync(root, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile()).map((entry) => path.relative(root, path.join(entry.parentPath, entry.name)).split(path.sep).join("/"));
const before = new Set(filesUnder(saved));
const after = new Set(filesUnder(now));
const differing = [];
const editedDiffering = [];
for (const file of new Set([...before, ...after])) {
  if (file === "index.json") continue;
  const same = before.has(file) && after.has(file) && fs.readFileSync(path.join(saved, file)).equals(fs.readFileSync(path.join(now, file)));
  if (same) continue;
  (editedDocs.has(file) ? editedDiffering : differing).push(`${file}${before.has(file) ? "" : " (new)"}${after.has(file) ? "" : " (gone)"}`);
}
// The edited files' own nodes, and their edges into the other files' nodes (`inbound`: the files that use a file), move
// with the edit itself: a new import of an edited file shows in the inbound list of the file it imports.
const editedSources = new Set(edited);
const graphOf = (root) => {
  const graph = JSON.parse(fs.readFileSync(path.join(root, "index.json"), "utf8"));
  for (const key of Object.keys(graph.files ?? {})) {
    if (editedSources.has(key)) delete graph.files[key];
    else if (Array.isArray(graph.files[key].inbound)) graph.files[key].inbound = graph.files[key].inbound.filter((from) => !editedSources.has(from));
  }
  return JSON.stringify(graph);
};
const indexSame = graphOf(saved) === graphOf(now);
console.log(JSON.stringify({ docs: after.size, differing, editedDiffering, indexSameButForEditedFiles: indexSame }, null, 1));
process.exitCode = differing.length === 0 && indexSame ? 0 : 1;
