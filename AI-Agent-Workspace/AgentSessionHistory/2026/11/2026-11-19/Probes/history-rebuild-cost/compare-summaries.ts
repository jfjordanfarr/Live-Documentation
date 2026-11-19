/**
 * Holds every commit's summary in a new history cache to the same commit's summary in an old one, field by field,
 * and sorts each difference into those a change of the joined round meant and those it did not.
 *
 * Run from the repository's root (read only on both caches):
 *   npx tsx --tsconfig ./tsconfig.base.json AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/history-rebuild-cost/compare-summaries.ts \
 *     .mdmd/history/c186af7356b58191 .mdmd/history/<new key> [--samples 5] [--json report.json]
 *
 * What "the same" means across the lens that changed on purpose:
 * - `lens` and `format` are set aside: the key moved with the code, and format 4 keeps citing documents by path.
 * - The new summary keeps every linked and citing document; the old one was made under the old configuration's
 *   bundle exclusions. The new one is read through `bundledSummary` with the old configuration's `bundleExclude`
 *   (`.live-docs.config.json` at c84fd00f, the old cache's head), so that the two are held to one exclusion.
 * - Every other field must be equal, unless a branch of the joining is meant to move it, and then the difference is
 *   listed as meant, with the branch's name, for a person to read its samples:
 *   - `docLinks`, `citedBy`: the markdown links' branch (CommonMark's rule for what is a link).
 *   - `entries`: the script entries' branch (package scripts read as a shell splits them).
 *   - `symbols`, `dependencies`, `reExports`, `archetype` of a file whose bytes at the commit are not plain UTF-8: the
 *     Windows branch's one reading step (UTF-16, Windows-1252, a byte-order mark). Of a file that is plain UTF-8
 *     these are faults.
 *   - a symbol's `name` or `slug` that holds a character the names' branch writes otherwise (a backtick, a
 *     backslash, a control character, an asterisk, an underscore): the names' branch.
 * - Anything else is a fault: a file present in one and not the other, `authored`, `unread`, `unwritten`, or a field
 *   above outside what its branch explains. The script exits 1 when it finds a fault.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";

import { bundledSummary } from "../../../../../../../packages/engine/src/live-docs/history/bundled";
import type { CommitSummary, SummaryFile } from "../../../../../../../packages/engine/src/live-docs/history/summary";

const [oldFolder, newFolder, ...rest] = process.argv.slice(2);
const samplesWanted = Number(rest[rest.indexOf("--samples") + 1] ?? 5) || 5;
const reportFile = rest.includes("--json") ? rest[rest.indexOf("--json") + 1] : undefined;
if (!oldFolder || !newFolder) {
  console.error("usage: compare-summaries.ts <old cache folder> <new cache folder> [--samples N] [--json report.json]");
  process.exit(2);
}

const OLD_HEAD = "c84fd00f42290e7930aa179cdf3e5c00895c4127";
const oldBundleExclude = (JSON.parse(execFileSync("git", ["show", `${OLD_HEAD}:.live-docs.config.json`], { encoding: "utf8" })) as { bundleExclude?: string[] }).bundleExclude ?? [];

const read = (file: string): CommitSummary => JSON.parse(gunzipSync(readFileSync(file)).toString("utf8")) as CommitSummary;
const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

/** Whether a file's bytes at a commit are plain UTF-8: no byte-order mark, no zero byte, and valid UTF-8. */
const plainCache = new Map<string, boolean>();
function plainUtf8(commit: string, file: string): boolean {
  const key = `${commit}:${file}`;
  let answer = plainCache.get(key);
  if (answer === undefined) {
    try {
      const bytes = execFileSync("git", ["cat-file", "blob", key], { maxBuffer: 1 << 30 });
      const marked = (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) || (bytes[0] === 0xff && bytes[1] === 0xfe) || (bytes[0] === 0xfe && bytes[1] === 0xff);
      answer = !marked && !bytes.includes(0) && (() => {
        try {
          new TextDecoder("utf-8", { fatal: true }).decode(bytes);
          return true;
        } catch {
          return false;
        }
      })();
    } catch {
      answer = true;
    }
    plainCache.set(key, answer);
  }
  return answer;
}

const NAME_CHARACTERS = /[`\\*_\u0000-\u001f]/u;

interface Finding {
  commit: string;
  file?: string;
  field: string;
  verdict: "meant" | "fault";
  because: string;
  old: unknown;
  new: unknown;
}

const findings: Finding[] = [];
const counts = new Map<string, number>();
let compared = 0;
let identical = 0;
const missingNew: string[] = [];

for (const name of readdirSync(oldFolder).filter((entry) => entry.endsWith(".json.gz") && !entry.endsWith(".index.json.gz")).sort()) {
  const commit = name.slice(0, -".json.gz".length);
  const newFile = path.join(newFolder, name);
  if (!existsSync(newFile)) {
    missingNew.push(commit);
    continue;
  }
  compared += 1;
  const before = read(path.join(oldFolder, name));
  const after = bundledSummary(read(newFile), oldBundleExclude);
  const note = (finding: Finding): void => {
    findings.push(finding);
    const key = `${finding.verdict} ${finding.field}: ${finding.because}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  };
  let differs = false;
  if (!same(before.docLinks, after.docLinks)) {
    differs = true;
    note({ commit, field: "docLinks", verdict: "meant", because: "the markdown links' branch", old: before.docLinks.length, new: after.docLinks.length });
  }
  if (!same(before.unwritten ?? [], after.unwritten ?? [])) {
    differs = true;
    note({ commit, field: "unwritten", verdict: "fault", because: "no branch moves what a tree leaves unwritten here", old: before.unwritten, new: after.unwritten });
  }
  const oldFiles = new Map(before.files.map((file) => [file.path, file]));
  const newFiles = new Map(after.files.map((file) => [file.path, file]));
  for (const file of new Set([...oldFiles.keys(), ...newFiles.keys()])) {
    const a = oldFiles.get(file);
    const b = newFiles.get(file);
    if (!a || !b) {
      differs = true;
      note({ commit, file, field: "files", verdict: "fault", because: a ? "a file the new summary lacks" : "a file only the new summary holds", old: Boolean(a), new: Boolean(b) });
      continue;
    }
    for (const field of ["archetype", "entries", "symbols", "dependencies", "reExports", "citedBy", "authored", "unread"] as Array<keyof SummaryFile>) {
      if (same(a[field] ?? null, b[field] ?? null)) continue;
      differs = true;
      let verdict: Finding["verdict"] = "fault";
      let because = "no branch of the joining is meant to move it";
      if (field === "citedBy") {
        verdict = "meant";
        because = "the markdown links' branch";
      } else if (field === "entries") {
        verdict = "meant";
        because = "the script entries' branch";
      } else if (["symbols", "dependencies", "reExports", "archetype"].includes(field) && !plainUtf8(commit, file)) {
        verdict = "meant";
        because = "the Windows branch's reading step, on a file that is not plain UTF-8";
      } else if (field === "symbols" && [...(a.symbols ?? []), ...(b.symbols ?? [])].some((symbol) => NAME_CHARACTERS.test(symbol.name))) {
        verdict = "meant";
        because = "the names' branch, on a name it writes otherwise";
      }
      note({ commit, file, field, verdict, because, old: a[field], new: b[field] });
    }
  }
  if (!differs) identical += 1;
}

console.log(`compared ${compared} commits: ${identical} identical, ${compared - identical} with differences; ${missingNew.length} of the old cache's commits not in the new one${missingNew.length ? ` (${missingNew.slice(0, 3).map((id) => id.slice(0, 8)).join(", ")}${missingNew.length > 3 ? ", ..." : ""})` : ""}`);
for (const [key, count] of [...counts].sort((x, y) => (x[0] < y[0] ? -1 : 1))) {
  console.log(`  ${count}\t${key}`);
  for (const finding of findings.filter((entry) => `${entry.verdict} ${entry.field}: ${entry.because}` === key).slice(0, samplesWanted)) {
    console.log(`      ${finding.commit.slice(0, 8)} ${finding.file ?? ""}: ${JSON.stringify(finding.old).slice(0, 140)} -> ${JSON.stringify(finding.new).slice(0, 140)}`);
  }
}
if (reportFile) writeFileSync(reportFile, JSON.stringify(findings, null, 1));
const faults = findings.filter((finding) => finding.verdict === "fault").length;
console.log(faults === 0 ? "no fault: every difference is one a branch of the joining means" : `${faults} faults: differences no branch of the joining explains, to run down`);
process.exitCode = faults === 0 ? 0 : 1;
