// Reads history-summary-causes.cjs's report and classes every differing file entry by the kind of change it is, so that
// each class can be named with the reader's change that makes it. Prints each class with its count of entries and of
// commits, and the first examples, field by field.
//
//   node history-classify-causes.cjs <report.json> [examples]
"use strict";
const report = require(require("node:path").resolve(process.argv[2]));
const EXAMPLES = Number(process.argv[3] ?? 3);
const parse = (items) => (items ?? []).map((item) => JSON.parse(item));

/** The kinds of change one file entry shows, each a short name. */
function kindsOf(file) {
  if (file.change !== "changed") return [`${file.reader}: file ${file.change}`];
  const kinds = [];
  for (const [field, change] of Object.entries(file.fields)) {
    if (change.reordered) { kinds.push(`${file.reader}: ${field} reordered`); continue; }
    if (field === "entries") {
      for (const entry of parse(change.removed)) kinds.push(`${file.reader}: entry removed (${entry.reason})`);
      for (const entry of parse(change.added)) kinds.push(`${file.reader}: entry added (${entry.reason})`);
    } else if (field === "symbols") {
      const removed = parse(change.removed);
      const added = parse(change.added);
      const names = (list) => new Set(list.map((symbol) => `${symbol.kind} ${symbol.name}`));
      const was = names(removed);
      const now = names(added);
      const gone = [...was].filter((name) => !now.has(name));
      const come = [...now].filter((name) => !was.has(name));
      if (gone.length) kinds.push(`${file.reader}: symbols removed`);
      if (come.length) kinds.push(`${file.reader}: symbols added`);
      if (!gone.length && !come.length) kinds.push(`${file.reader}: symbols' details changed`);
    } else if (field === "dependencies") {
      const removed = parse(change.removed);
      const added = parse(change.added);
      const resolvedOf = (list) => list.filter((d) => d.to);
      const unresolvedOf = (list) => list.filter((d) => !d.to);
      const sameTargetRenamed = resolvedOf(added).some((d) => resolvedOf(removed).some((r) => r.to === d.to && r.label !== d.label));
      if (sameTargetRenamed) kinds.push(`${file.reader}: dependency on the same file, now naming what is used`);
      const removedTargets = new Set(resolvedOf(removed).map((d) => d.to));
      const addedTargets = new Set(resolvedOf(added).map((d) => d.to));
      if ([...addedTargets].some((t) => !removedTargets.has(t))) kinds.push(`${file.reader}: dependency on a file added`);
      if ([...removedTargets].some((t) => !addedTargets.has(t))) kinds.push(`${file.reader}: dependency on a file removed`);
      if (unresolvedOf(added).length) kinds.push(`${file.reader}: unresolved line added`);
      if (unresolvedOf(removed).length) kinds.push(`${file.reader}: unresolved line removed`);
      if (!kinds.some((k) => k.startsWith(`${file.reader}: dependency`) || k.startsWith(`${file.reader}: unresolved`))) kinds.push(`${file.reader}: dependency details changed`);
    } else {
      kinds.push(`${file.reader}: ${field} changed`);
    }
  }
  return [...new Set(kinds)];
}

const classes = new Map();
for (const commit of report.commits) {
  for (const file of commit.files) {
    for (const kind of kindsOf(file)) {
      const entry = classes.get(kind) ?? { entries: 0, commits: new Set(), paths: new Set(), examples: [] };
      entry.entries += 1;
      entry.commits.add(commit.commit);
      entry.paths.add(file.path);
      if (entry.examples.length < EXAMPLES && ![...entry.examples].some((e) => e.path === file.path)) entry.examples.push({ commit: commit.commit.slice(0, 10), path: file.path, fields: file.fields });
      classes.set(kind, entry);
    }
  }
}
console.log(`summaries the same ${report.same}, differing ${report.differing}, only in the old cache ${report.onlyOld}, only in the new ${report.onlyNew.length}`);
for (const [kind, entry] of [...classes].sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(`\n## ${kind}: ${entry.entries} entries, ${entry.commits.size} commits, ${entry.paths.size} paths`);
  console.log(`   paths: ${[...entry.paths].slice(0, 12).join(", ")}${entry.paths.size > 12 ? ", …" : ""}`);
  for (const example of entry.examples) console.log(`   e.g. ${example.commit} ${example.path}: ${JSON.stringify(example.fields).slice(0, 700)}`);
}
