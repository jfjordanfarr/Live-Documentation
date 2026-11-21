// Reads the report of `../readers-gathering/history-summary-causes.cjs` (an old history cache set beside a new one,
// summary by summary) and classes every differing file entry under the change of the evening of 2026-11-21 that could
// make it, by the field that differs and the reader whose file it is; an entry no change of that evening could make is
// classed UNEXPECTED. Each class is then read by hand, file by file at its commits, to confirm its cause. Prints each
// class with its counts, its paths and its first examples, and writes every entry's class to a JSON file beside.
//
//   node history-classify-tonight.cjs <report.json> <classes.json> [examples]
"use strict";
const fs = require("node:fs");
const path = require("node:path");

const report = JSON.parse(fs.readFileSync(path.resolve(process.argv[2]), "utf8"));
const out = process.argv[3];
const EXAMPLES = Number(process.argv[4] ?? 3);
const parse = (items) => (items ?? []).map((item) => JSON.parse(item));

/** The language a path's reader reads, by its name, as the adapters' registry dispatches. */
function readerOf(file) {
  const lower = file.toLowerCase();
  const base = path.posix.basename(lower);
  const ext = path.posix.extname(lower);
  if (base === "cargo.toml" || ext === ".rs") return "Rust";
  if (ext === ".cs") return "C#";
  if (ext === ".rb") return "Ruby";
  if (ext === ".css") return "CSS";
  if (ext === ".html" || ext === ".htm") return "HTML";
  if ([".aspx", ".ascx", ".master", ".ashx", ".asmx", ".asax", ".svc", ".cshtml", ".razor"].includes(ext)) return "ASP.NET";
  if ([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".mts", ".cts"].includes(ext)) return "TypeScript and JavaScript";
  if ([".ps1", ".psm1", ".psd1"].includes(ext)) return "PowerShell";
  if (ext === ".sql") return "SQL";
  if ([".csproj", ".vbproj", ".fsproj", ".sln", ".slnx", ".config"].includes(ext)) return ".NET XML";
  return `other (${ext || base})`;
}

/**
 * The change of the evening a field's difference in a reader's file falls under. The test rules (by language, with
 * the three reader facts) change a file's archetype; the comment guard and its second round change what a reader of
 * C#, Ruby, CSS, HTML, ASP.NET markup or a script's DOM calls draws from a comment, a string, a `#if false` section or
 * a text element's text, and a Rust crate's name; the PowerShell path without its extension and the SQL family change
 * what those readers resolve and declare. Positions are not in a summary, and `leaveOut.ts` is called by nothing.
 */
const MEANT = {
  "C#": "the comment guard: C#'s comments, `#if false` sections and string escapes",
  Ruby: "the comment guard: Ruby's comments, data after __END__ and heredocs",
  CSS: "the comment guard: CSS's comments",
  HTML: "the comment guard: HTML's comments and the text of script, style, textarea and title",
  "ASP.NET": "the comment guard: markup comments and text elements, for ids and script tags",
  "TypeScript and JavaScript": "the comment guard: the DOM heuristic's calls from the syntax tree and its markup without comments",
  PowerShell: "PowerShell: a relative path without an extension read as Windows runs it",
  SQL: "SQL: IF NOT EXISTS, backticks, TEMP and virtual tables, the trigger's body",
  Rust: "the comment guard: a crate's name read by the TOML parser",
  ".NET XML": "the comment guard's shared write-over (no fact expected)"
};

function classOf(file) {
  if (file.change !== "changed") return [`UNEXPECTED: a file entry ${file.change}`];
  const reader = readerOf(file.path);
  const classes = [];
  for (const [field, change] of Object.entries(file.fields)) {
    if (field === "archetype") {
      classes.push(`the test rules: archetype ${change.before} to ${change.after}`);
      continue;
    }
    if (field === "authored") {
      classes.push("UNEXPECTED: an authored text changed");
      continue;
    }
    const meant = MEANT[reader];
    let shape = change.reordered ? "reordered" : "";
    if (!shape && (field === "dependencies" || field === "symbols" || field === "entries")) {
      const removed = parse(change.removed);
      const added = parse(change.added);
      shape = [removed.length ? "lost" : "", added.length ? "gained" : ""].filter(Boolean).join(" and ");
    }
    classes.push(meant ? `${meant}: ${field} ${shape}` : `UNEXPECTED: ${reader}: ${field} ${shape}`);
  }
  return [...new Set(classes)];
}

const classes = new Map();
const entries = [];
for (const commit of report.commits) {
  for (const file of commit.files) {
    const kinds = classOf(file);
    entries.push({ commit: commit.commit, path: file.path, classes: kinds, fields: file.fields });
    for (const kind of kinds) {
      const entry = classes.get(kind) ?? { entries: 0, commits: new Set(), paths: new Set(), examples: [] };
      entry.entries += 1;
      entry.commits.add(commit.commit);
      entry.paths.add(file.path);
      if (entry.examples.length < EXAMPLES && !entry.examples.some((e) => e.path === file.path)) entry.examples.push({ commit: commit.commit.slice(0, 10), path: file.path, fields: file.fields });
      classes.set(kind, entry);
    }
  }
  if (commit.docLinks) entries.push({ commit: commit.commit, classes: ["UNEXPECTED: the links between docs changed"], docLinks: commit.docLinks });
  if (commit.format) entries.push({ commit: commit.commit, classes: ["UNEXPECTED: the summary's format changed"] });
}
if (out) fs.writeFileSync(out, JSON.stringify(entries, null, 1));
console.log(`summaries the same ${report.same}, differing ${report.differing}, only in the old cache ${report.onlyOld}, only in the new ${report.onlyNew.length}`);
for (const [kind, entry] of [...classes].sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(`\n## ${kind}: ${entry.entries} entries, ${entry.commits.size} commits, ${entry.paths.size} paths`);
  console.log(`   paths: ${[...entry.paths].slice(0, 15).join(", ")}${entry.paths.size > 15 ? ", …" : ""}`);
  for (const example of entry.examples) console.log(`   e.g. ${example.commit} ${example.path}: ${JSON.stringify(example.fields).slice(0, 600)}`);
}
const unexpected = entries.filter((entry) => entry.classes.some((kind) => kind.startsWith("UNEXPECTED")));
console.log(`\nentries under a class no change of the evening was meant to make: ${unexpected.length}`);
