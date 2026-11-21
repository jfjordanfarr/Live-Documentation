// Sets every summary an old history cache and a new one both hold side by side, the lens key aside, and for each that
// differs names what differs file by file: each file entry added, gone or changed, and for a changed one which fields,
// classed by the reader whose files it is. Reads both caches, writes a JSON report.
//
//   node history-summary-causes.cjs <old cache folder> <new cache folder> <report.json>
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { gunzipSync } = require("node:zlib");

const [oldFolder, newFolder, reportFile] = process.argv.slice(2);
const LENS = /^\{"format":("[^"]*"),"lens":"[0-9a-f]{16}",/u;
const read = (file) => gunzipSync(fs.readFileSync(file)).toString("utf8");
const summaries = (folder) => new Set(fs.readdirSync(folder).filter((name) => name.endsWith(".json.gz") && !name.endsWith(".index.json.gz")));

function readerOf(file) {
  const lower = file.toLowerCase();
  const ext = path.posix.extname(lower);
  if (ext === ".sql") return "SQL";
  if ([".ps1", ".psm1", ".psd1"].includes(ext)) return "PowerShell";
  if (ext === ".cs") return "C#";
  if ([".csproj", ".vbproj", ".fsproj"].includes(ext)) return ".NET project";
  if ([".sln", ".slnx"].includes(ext)) return ".NET solution";
  if (ext === ".config") return ".NET configuration";
  if ([".aspx", ".ascx", ".master", ".ashx", ".asmx", ".asax", ".svc", ".cshtml", ".razor"].includes(ext)) return "ASP.NET";
  return "other";
}

const key = (value) => JSON.stringify(value);
function fieldsChanged(before, after) {
  const fields = new Set([...Object.keys(before), ...Object.keys(after)]);
  const changed = {};
  for (const field of fields) {
    if (key(before[field]) === key(after[field])) continue;
    if (Array.isArray(before[field]) || Array.isArray(after[field])) {
      const was = new Set((before[field] ?? []).map(key));
      const now = new Set((after[field] ?? []).map(key));
      changed[field] = { added: [...now].filter((item) => !was.has(item)), removed: [...was].filter((item) => !now.has(item)) };
      if (changed[field].added.length === 0 && changed[field].removed.length === 0) changed[field] = { reordered: true };
    } else {
      changed[field] = { before: before[field], after: after[field] };
    }
  }
  return changed;
}

const old = summaries(oldFolder);
const fresh = summaries(newFolder);
const report = { same: 0, differing: 0, onlyOld: [...old].filter((n) => !fresh.has(n)).length, onlyNew: [...fresh].filter((n) => !old.has(n)).map((n) => n.slice(0, 40)), commits: [] };
for (const name of [...old].filter((n) => fresh.has(n)).sort()) {
  const a = read(path.join(oldFolder, name));
  const b = read(path.join(newFolder, name));
  if (a.replace(LENS, '{"format":$1,"lens":"",') === b.replace(LENS, '{"format":$1,"lens":"",')) {
    report.same += 1;
    continue;
  }
  report.differing += 1;
  const before = JSON.parse(a);
  const after = JSON.parse(b);
  const commit = { commit: name.slice(0, 40), format: before.format === after.format ? undefined : [before.format, after.format], files: [], docLinks: undefined };
  const was = new Map(before.files.map((file) => [file.path, file]));
  const now = new Map(after.files.map((file) => [file.path, file]));
  for (const file of new Set([...was.keys(), ...now.keys()])) {
    const x = was.get(file);
    const y = now.get(file);
    if (x && y && key(x) === key(y)) continue;
    commit.files.push({ path: file, reader: readerOf(file), change: !x ? "added" : !y ? "gone" : "changed", fields: x && y ? fieldsChanged(x, y) : undefined });
  }
  if (key(before.docLinks) !== key(after.docLinks)) {
    const w = new Set(before.docLinks.map(key));
    const n = new Set(after.docLinks.map(key));
    commit.docLinks = { added: [...n].filter((l) => !w.has(l)), removed: [...w].filter((l) => !n.has(l)) };
  }
  for (const field of Object.keys(after)) {
    if (!["format", "lens", "commit", "files", "docLinks"].includes(field) && key(before[field]) !== key(after[field])) commit[`field:${field}`] = { before: before[field], after: after[field] };
  }
  report.commits.push(commit);
}
fs.writeFileSync(reportFile, JSON.stringify(report, null, 1));
const byReader = {};
for (const c of report.commits) for (const f of c.files) byReader[f.reader] = (byReader[f.reader] ?? 0) + 1;
console.log(`same ${report.same}, differing ${report.differing}, only in the old cache ${report.onlyOld}, only in the new ${report.onlyNew.length}`);
console.log("file entries differing, by reader:", JSON.stringify(byReader));
console.log("commits with a docLinks difference:", report.commits.filter((c) => c.docLinks).length, "; with another field:", report.commits.filter((c) => Object.keys(c).some((k) => k.startsWith("field:"))).length, "; format changed:", report.commits.filter((c) => c.format).length);
