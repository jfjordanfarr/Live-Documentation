/**
 * Two helpers for merging a builder's branch, where both sides have changed one Live Doc.
 *
 * A Live Doc holds words a person wrote (its Authored part) and words the generator writes (its metadata and its
 * generated regions). When a merge conflicts in what the generator writes, either side will do, since
 * `npm run live-docs:generate` writes it again; but taking one side's whole file also takes that side's Authored part,
 * and loses what the other side wrote there even where git had merged it cleanly. That happened on 2026-11-22: a
 * paragraph of a file's Notes was lost at a merge and found by reading every merge of the day again.
 *
 * - `resolve <doc…>` takes the incoming side inside each conflict's markers and nowhere else, and refuses a conflict
 *   in the Authored part, which a person must read. Run it on the conflicted docs, then regenerate.
 * - `audit <base> [<ref>…]` reads every merge since `<base>` on the current branch (and on any other named branch) and
 *   names each Live Doc whose Authored part one side had changed and the merge did not keep, or that both had changed.
 *
 * Usage: `npx tsx --tsconfig ./tsconfig.base.json scripts/doc-tools/merged-live-docs.ts resolve <doc…>`
 *        `npx tsx --tsconfig ./tsconfig.base.json scripts/doc-tools/merged-live-docs.ts audit <base> [<ref>…]`
 */
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

const AUTHORED_HEADING = /^## Authored[ \t]*$/m;
const AFTER_AUTHORED = /^(## Generated[ \t]*$|<!-- LIVE-DOC:BEGIN)/m;
const CONFLICT = /^<<<<<<< [^\n]*\n([\s\S]*?)^=======\n([\s\S]*?)^>>>>>>> [^\n]*\n/gm;
const MARKER = /^(<<<<<<<|=======$|>>>>>>>)/m;

/** Where a doc's Authored part begins and ends, as offsets; nothing when the doc has none. */
function authoredSpan(text: string): { start: number; end: number } | undefined {
  const heading = AUTHORED_HEADING.exec(text);
  if (!heading) return undefined;
  const after = AFTER_AUTHORED.exec(text.slice(heading.index));
  return { start: heading.index, end: after ? heading.index + after.index : text.length };
}

/** A doc's Authored part, heading and all; empty when the doc has none. */
export function authoredPart(text: string): string {
  const span = authoredSpan(text);
  return span ? text.slice(span.start, span.end) : "";
}

/**
 * A conflicted doc with the incoming side taken inside each conflict, and how many there were. Throws on a conflict
 * that begins in the Authored part, and on a marker left standing (a conflict within a conflict, or a damaged one).
 */
export function resolveGeneratedConflicts(text: string): { text: string; conflicts: number } {
  const span = authoredSpan(text);
  let conflicts = 0;
  const resolved = text.replace(CONFLICT, (_whole, _ours: string, theirs: string, offset: number) => {
    if (span && offset >= span.start && offset < span.end) {
      const line = text.slice(0, offset).split("\n").length;
      throw new Error(`a conflict in the Authored part, at line ${line}: read both sides and write it by hand`);
    }
    conflicts += 1;
    return theirs;
  });
  if (MARKER.test(resolved)) throw new Error("a conflict marker is left standing after every whole conflict was resolved");
  return { text: resolved, conflicts };
}

/** What a merge did with a doc's Authored part, from the part at the merge's base, on each side and after it. */
export type AuthoredVerdict = "kept" | "ours not kept" | "theirs not kept" | "both changed, one taken";

/**
 * `kept`: the merge holds, whole, the part of the one side that changed it. `ours not kept` and `theirs not kept`: one
 * side changed the part and the merge holds something else, the other's unchanged copy or a piece. `both changed, one
 * taken`: both sides changed it differently and the merge holds exactly one of them, so the other's words may be gone.
 * Where both changed it and the merge holds neither, it was joined by hand, which no comparison can judge: `kept`.
 */
export function authoredVerdict(parts: { base: string; ours: string; theirs: string; merged: string }): AuthoredVerdict {
  const { base, ours, theirs, merged } = parts;
  if (ours !== base && theirs !== base && ours !== theirs) return merged === ours || merged === theirs ? "both changed, one taken" : "kept";
  const oursUnchanged = ours === base;
  if (merged === (oursUnchanged ? theirs : ours)) return "kept";
  return oursUnchanged ? "theirs not kept" : "ours not kept";
}

function git(...args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 1 << 28 });
}

function shown(revision: string, file: string): string | undefined {
  try { return git("show", `${revision}:${file}`); } catch { return undefined; }
}

/** The folder of the mirror, from the workspace's configuration. */
function mirrorFolder(): string {
  const config = JSON.parse(fs.readFileSync(".live-docs.config.json", "utf8")) as { root: string; baseLayer: string };
  return path.posix.join(config.root, config.baseLayer);
}

function audit(base: string, refs: string[]): number {
  const mirror = mirrorFolder();
  const merges = git("rev-list", "--merges", "HEAD", ...refs, `^${base}`).trim().split("\n").filter(Boolean).reverse();
  let found = 0;
  for (const merge of merges) {
    const [ours, theirs] = git("rev-parse", `${merge}^1`, `${merge}^2`).trim().split("\n");
    const from = git("merge-base", ours, theirs).trim();
    const changedBy = (side: string): string[] => git("diff", "--name-only", from, side, "--", mirror).trim().split("\n").filter(Boolean);
    const byOurs = new Set(changedBy(ours));
    for (const file of changedBy(theirs).filter(name => byOurs.has(name))) {
      const merged = shown(merge, file);
      if (merged === undefined) continue;
      const verdict = authoredVerdict({
        base: authoredPart(shown(from, file) ?? ""),
        ours: authoredPart(shown(ours, file) ?? ""),
        theirs: authoredPart(shown(theirs, file) ?? ""),
        merged: authoredPart(merged)
      });
      if (verdict === "kept") continue;
      found += 1;
      console.log(`${verdict}: ${merge.slice(0, 9)} ${file}`);
    }
  }
  console.log(`${merges.length} merges read; ${found} docs to look at`);
  return found === 0 ? 0 : 1;
}

function resolve(files: string[]): number {
  let failed = 0;
  for (const file of files) {
    try {
      const { text, conflicts } = resolveGeneratedConflicts(fs.readFileSync(file, "utf8"));
      fs.writeFileSync(file, text);
      console.log(`${conflicts} conflicts resolved to the incoming side: ${file}`);
    } catch (error) {
      failed += 1;
      console.error(`${file}: ${(error as Error).message}; the file is left as it was`);
    }
  }
  return failed === 0 ? 0 : 1;
}

if (require.main === module) {
  const [command, ...rest] = process.argv.slice(2);
  if (command === "resolve" && rest.length > 0) process.exit(resolve(rest));
  if (command === "audit" && rest.length > 0) process.exit(audit(rest[0], rest.slice(1)));
  console.error("usage: merged-live-docs.ts resolve <doc…> | audit <base> [<ref>…]");
  process.exit(2);
}
