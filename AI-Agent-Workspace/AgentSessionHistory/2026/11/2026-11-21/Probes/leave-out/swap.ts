/**
 * A record of the third leg of 2026-11-21: it ran against commit d99fd0b7f and calls the layered `leaveOut` ({ ignoreFiles, evidence, person }) that the eighth leg replaced with one list (commit 9d7bfdaf9); it no longer runs against the present function, and its results stand in the README as measured then.
 *
 * What would change if discovery's way of leaving files out were swapped for the engine's `leaveOut`, without wiring
 * it in: on this repository and on a copy of every fixture outside any repository (as a scan of it runs), the files
 * today's discovery keeps (`discoverTargetFiles` and `discoverDocuments`: glob, git's word through `gitIgnored.ts`, the
 * configuration's own exclusions, and its rules by name) against the files a lazy walk with `leaveOut` keeps, with the
 * evidence rules applied and with them only reported. Every difference is printed with its cause. Reads the folders;
 * the fixtures are copied to a scratch folder first.
 *
 *   tsx --tsconfig tsconfig.base.json <this file> <repository folder>
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { normalizeLiveDocumentationConfig, type LiveDocumentationConfig } from "../../../../../../../packages/engine/src/config/liveDocumentationConfig";
import { matchesPathPattern } from "../../../../../../../packages/engine/src/live-docs/archetype";
import { discoverDocuments, discoverTargetFiles } from "../../../../../../../packages/engine/src/live-docs/discovery";
import { gitIgnored } from "../../../../../../../packages/engine/src/tooling/gitIgnored";
import { leaveOut, type IgnoreFileText } from "../../../../../../../packages/engine/src/tooling/leaveOut";
import { copyFixture } from "../../../../../../../scripts/oracle/fixture";
import { FIXTURES } from "../../../../../../../tests/page-scan/fixtures";

const LOCK_FILES = new Set(["package-lock.json", "npm-shrinkwrap.json", "devcontainer-lock.json", ".devcontainer-lock.json", "yarn.lock", "pnpm-lock.yaml"]);

/** The files a lazy walk keeps with `leaveOut`, and the folders evidence finds, with their files, when only reported. */
function functionKeeps(root: string, config: LiveDocumentationConfig, apply: boolean): { kept: Set<string>; ruleOf: Map<string, string>; reported: Array<{ folder: string; rule: string; files: number }> } {
  const names = new Map<string, string[]>();
  const namesIn = (folder: string): string[] => {
    const known = names.get(folder);
    if (known) return known;
    let found: string[] = [];
    try {
      found = fs.readdirSync(path.join(root, folder), { withFileTypes: true }).map((entry) => (entry.isDirectory() ? `${entry.name}/` : entry.name));
    } catch {
      found = [];
    }
    names.set(folder, found);
    return found;
  };
  const ignoreFilesIn = (folder: string): IgnoreFileText[] => namesIn(folder).filter((name) => name === ".gitignore" || name.toLowerCase() === ".tfignore")
    .map((name) => ({ path: folder ? `${folder}/${name}` : name, text: fs.readFileSync(path.join(root, folder, name), "utf8") }));
  const own = path.posix.join(config.root.replace(/^\.\//u, ""), config.baseLayer);
  const decide = leaveOut({ ignoreFiles: ignoreFilesIn, gitIgnoreCase: false, ownOutput: [own], evidence: { names: namesIn, apply } });
  const kept = new Set<string>();
  const ruleOf = new Map<string, string>();
  const reported: Array<{ folder: string; rule: string; files: number }> = [];
  const count = (folder: string): number => namesIn(folder).reduce((sum, name) => sum + (name.endsWith("/") ? count(folder ? `${folder}/${name.slice(0, -1)}` : name.slice(0, -1)) : 1), 0);
  const walk = (folder: string): void => {
    for (const name of namesIn(folder)) {
      const at = folder ? `${folder}/${name.replace(/\/$/u, "")}` : name.replace(/\/$/u, "");
      if (name.endsWith("/")) {
        const verdict = decide.folder(at);
        if (verdict.evidence) reported.push({ folder: at, rule: verdict.evidence.kind === "evidence" ? verdict.evidence.pattern : verdict.evidence.kind, files: count(at) });
        if (verdict.prunable) {
          const rule = verdict.rule!;
          const said = rule.kind === "gitignore" || rule.kind === "tfignore" ? `${rule.file}:${rule.line} ${rule.pattern}` : rule.kind === "evidence" ? `evidence: ${rule.pattern}` : `${rule.kind} ${"folder" in rule ? rule.folder : rule.pattern}`;
          ruleOf.set(at, said);
        } else walk(at);
      } else if (decide.file(at).kept) kept.add(at);
      else {
        const rule = decide.file(at).rule!;
        ruleOf.set(at, rule.kind === "gitignore" || rule.kind === "tfignore" ? `${rule.file}:${rule.line} ${rule.pattern}` : rule.kind);
      }
    }
  };
  walk("");
  return { kept, ruleOf, reported };
}

/** Why discovery leaves out a file the function keeps. */
function discoveryCause(root: string, file: string, config: LiveDocumentationConfig, ignoredByGit: Set<string>): string {
  const segments = file.split("/");
  if (segments.includes("node_modules")) return "discovery leaves out every node_modules by its name";
  if (LOCK_FILES.has(segments[segments.length - 1])) return "a lock file, by its name";
  if (config.exclude.some((pattern) => matchesPathPattern(file, pattern))) return "the configuration's exclude";
  const docsRoot = config.root.replace(/^\.\//u, "").replace(/\/$/u, "");
  if (file === docsRoot || file.startsWith(`${docsRoot}/`)) return "within the docs root, not a document";
  if (ignoredByGit.has(file)) return "git's word, which a listing cannot have";
  return "another of discovery's rules";
}

/** Why the function leaves out a file discovery keeps: the rule of the folder above it that it left out, or its own. */
function functionCause(file: string, ruleOf: Map<string, string>, tracked: Set<string>): string {
  const parts = file.split("/");
  for (let end = parts.length; end >= 1; end--) {
    const rule = ruleOf.get(parts.slice(0, end).join("/"));
    if (rule) return tracked.has(file) ? `${rule}, though git tracks the file, which a listing cannot know` : rule;
  }
  return "?";
}

async function compare(label: string, root: string, config: LiveDocumentationConfig): Promise<void> {
  const targets = await discoverTargetFiles({ workspaceRoot: root, config, include: new Set(), changedOnly: false });
  const documents = await discoverDocuments({ workspaceRoot: root, config });
  const discovered = new Set([...targets.map((file) => path.relative(root, file).split(path.sep).join("/")), ...documents]);
  for (const apply of [true, false]) {
    const { kept, ruleOf, reported } = functionKeeps(root, config, apply);
    const onlyDiscovery = [...discovered].filter((file) => !kept.has(file)).sort();
    const onlyFunction = [...kept].filter((file) => !discovered.has(file)).sort();
    const ignoredByGit = gitIgnored(root, onlyFunction) ?? new Set<string>();
    const listed = spawnSync("git", ["-C", root, "ls-files", "-z"], { encoding: "utf8", maxBuffer: 1 << 28 });
    const tracked = new Set(listed.status === 0 ? listed.stdout.split("\0").filter(Boolean) : []);
    const causes = new Map<string, string[]>();
    for (const file of onlyDiscovery) {
      const cause = `kept by discovery, left out by the function: ${functionCause(file, ruleOf, tracked)}`;
      causes.set(cause, [...(causes.get(cause) ?? []), file]);
    }
    for (const file of onlyFunction) {
      const cause = `kept by the function, left out by discovery: ${discoveryCause(root, file, config, ignoredByGit)}`;
      causes.set(cause, [...(causes.get(cause) ?? []), file]);
    }
    console.log(`## ${label}, evidence ${apply ? "applied" : "reported"}: discovery ${discovered.size}, the function ${kept.size}, ${onlyDiscovery.length + onlyFunction.length} differences`);
    for (const [cause, files] of [...causes].sort((a, b) => b[1].length - a[1].length)) console.log(`- ${files.length}: ${cause}; such as ${files.slice(0, 4).join(", ")}`);
    if (!apply) for (const entry of reported) console.log(`- evidence would leave out ${entry.folder} (${entry.files} files): ${entry.rule}`);
  }
}

async function main(): Promise<void> {
  const repo = path.resolve(process.argv[2] ?? ".");
  await compare("this repository", repo, normalizeLiveDocumentationConfig(JSON.parse(fs.readFileSync(path.join(repo, ".live-docs.config.json"), "utf8"))));
  for (const fixture of FIXTURES) {
    const copy = copyFixture(fixture.absolute, "leave-out-swap-");
    try {
      await compare(fixture.name, copy, normalizeLiveDocumentationConfig());
    } finally {
      fs.rmSync(copy, { recursive: true, force: true });
    }
  }
}

void main();
