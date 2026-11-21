// The model behind the trial page of what a scan leaves out, shared by the page and by its terminal twin: a walk of a
// folder, from any source that can list a folder and read a small text file, with the engine's `leaveOut` deciding each
// folder before it is entered; and what a person is shown of it, grouped by the reason a thing is left out. Pure of
// any browser or Node module, so that both hosts run the same code. A trial for strangers and the owner, not the
// product: `Probes/leave-out/README.md`, the fourth leg.
import { leaveOut } from "../../../../../../../../packages/engine/src/tooling/leaveOut";

/** The tool's own output folder, never scanned. */
export const OWN_OUTPUT = ".live-documentation";

/** The few plain words that say why something is left out, by its rule. */
export function reasonOf(rule) {
  switch (rule.kind) {
    case "evidence":
      return ["Build output beside a project", "Build output beside a project", "NuGet packages", "Node packages"][rule.index] ?? rule.pattern;
    case "gitignore":
      return `.gitignore: ${rule.pattern}`;
    case "tfignore":
      return `.tfignore: ${rule.pattern}`;
    case "own output":
      return "The tool's own output";
    case "version control":
      return "Version control's own folder";
    case "person":
      return `Your pattern: ${rule.pattern}`;
    default:
      return "Left out";
  }
}

/** A key that gathers left-out things under one reason: the same rule, and for an ignore file the same pattern, whichever file holds it. */
const groupKey = (rule) => (rule.kind === "gitignore" || rule.kind === "tfignore" ? `${rule.kind} ${rule.pattern}` : rule.kind === "evidence" ? `evidence ${rule.index === 1 ? 0 : rule.index}` : rule.kind === "person" ? `person ${rule.index}` : rule.kind);

/** A pattern of the person's own naming exactly one folder from the top, by git's rules: `/a/b/`, with its specials escaped. */
export function folderPattern(path) {
  return `/${path.replace(/[\\*?[\]!#]/gu, (character) => `\\${character}`)}/`;
}

const pause = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Walks a source with `leaveOut`. A source has `list(path)`, resolving to the entries of a folder (`{ name, kind }`,
 * kind "file" or "folder"), `text(path)`, resolving to a file's text or undefined, and `lazy`, true where folders are
 * listed only when asked (a directory handle) and false where everything was listed before (a folder input), so that a
 * folder left out whole can be counted there and is "not looked inside" here. Listings are kept on the source, so that
 * a walk again after a change asks only for what it had not listed. `progress(folders)` is told as it goes, and the
 * walk hands the thread back between folders, so that a page keeps drawing.
 */
export async function walk(source, { evidenceApplied, person }, progress = () => undefined) {
  source.listed ??= new Map();
  source.texts ??= new Map();
  let listMs = 0;
  let decideMs = 0;
  let listings = 0;
  const list = async (path) => {
    if (source.listed.has(path)) return source.listed.get(path);
    const started = performance.now();
    const entries = await source.list(path);
    for (const entry of entries) {
      if (entry.kind === "file" && (entry.name === ".gitignore" || entry.name.toLowerCase() === ".tfignore")) {
        const file = path ? `${path}/${entry.name}` : entry.name;
        source.texts.set(file, await source.text(file));
      }
    }
    listMs += performance.now() - started;
    listings += 1;
    source.listed.set(path, entries);
    return entries;
  };
  const names = (path) => (source.listed.get(path) ?? []).map((entry) => (entry.kind === "folder" ? `${entry.name}/` : entry.name));
  const ignoreFiles = (path) => names(path).filter((name) => name === ".gitignore" || name.toLowerCase() === ".tfignore")
    .map((name) => ({ path: path ? `${path}/${name}` : name, text: source.texts.get(path ? `${path}/${name}` : name) ?? "" }));

  // Git's one setting a listing cannot give, read from the repository's own file.
  const top = await list("");
  let gitIgnoreCase = false;
  if (top.some((entry) => entry.name === ".git" && entry.kind === "folder")) {
    const config = await source.text(".git/config");
    gitIgnoreCase = /^\s*ignorecase\s*=\s*true\s*$/imu.test(config ?? "");
  }
  const decide = leaveOut({ ignoreFiles, gitIgnoreCase, ownOutput: [OWN_OUTPUT], person, evidence: { names, apply: evidenceApplied } });

  const root = { path: "", name: "", kept: true, folders: [], filesKept: 0, filesLeftOut: 0, unlisted: false };
  const groups = new Map();
  const kept = [];
  const notes = new Map();
  const leftOutFolder = (path, verdict) => {
    const key = groupKey(verdict.rule);
    const group = groups.get(key) ?? groups.set(key, { reason: reasonOf(verdict.rule), rule: verdict.rule, folders: [], files: [] }).get(key);
    group.folders.push({ path, files: source.lazy ? null : countBeneath(source, path) });
    for (const note of verdict.notes ?? []) notes.set(note, path);
  };
  let folders = 0;
  const visit = async (node) => {
    const entries = await list(node.path);
    folders += 1;
    if (folders % 20 === 0) {
      progress(folders);
      await pause();
    }
    for (const entry of entries) {
      const path = node.path ? `${node.path}/${entry.name}` : entry.name;
      if (entry.kind === "folder") {
        // The evidence rules look one level into `packages` and two into `node_modules` before deciding.
        const look = { packages: 1, node_modules: 2 }[entry.name.toLowerCase()];
        if (look) {
          const inner = await list(path);
          if (look === 2) for (const child of inner.filter((each) => each.kind === "folder").slice(0, 3)) await list(`${path}/${child.name}`);
        }
        const started = performance.now();
        const verdict = decide.folder(path);
        decideMs += performance.now() - started;
        const child = { path, name: entry.name, kept: !verdict.prunable, rule: verdict.rule, evidence: verdict.evidence, folders: [], filesKept: 0, filesLeftOut: 0, unlisted: verdict.prunable && source.lazy };
        node.folders.push(child);
        if (verdict.prunable) {
          leftOutFolder(path, verdict);
          child.filesLeftOut = source.lazy ? 0 : countBeneath(source, path);
        } else {
          await visit(child);
        }
        node.filesKept += child.filesKept;
        node.filesLeftOut += child.filesLeftOut;
      } else {
        const started = performance.now();
        const verdict = decide.file(path);
        decideMs += performance.now() - started;
        if (verdict.kept) {
          kept.push(path);
          node.filesKept += 1;
        } else {
          const key = groupKey(verdict.rule);
          const group = groups.get(key) ?? groups.set(key, { reason: reasonOf(verdict.rule), rule: verdict.rule, folders: [], files: [] }).get(key);
          group.files.push(path);
          node.filesLeftOut += 1;
        }
      }
    }
    node.folders.sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1));
  };
  const started = performance.now();
  await visit(root);
  progress(folders);
  const offered = [];
  const gather = (node) => {
    if (node.evidence) offered.push({ path: node.path, reason: reasonOf(node.evidence) });
    node.folders.forEach(gather);
  };
  gather(root);
  return {
    root,
    kept,
    groups: [...groups.values()].sort((a, b) => b.folders.length * 1000 + b.files.length - (a.folders.length * 1000 + a.files.length)),
    notes: [...notes].map(([note, folder]) => ({ note, folder })),
    offered,
    gitIgnoreCase,
    timings: { totalMs: performance.now() - started, listMs, decideMs, listings, folders }
  };
}

/** How many files a source that listed everything holds beneath a folder: counted once for every folder, then looked up. */
function countBeneath(source, path) {
  if (!source.beneath) {
    source.beneath = new Map();
    for (const file of source.allFiles ?? []) {
      for (let at = file.lastIndexOf("/"); at > 0; at = file.lastIndexOf("/", at - 1)) {
        const folder = file.slice(0, at);
        source.beneath.set(folder, (source.beneath.get(folder) ?? 0) + 1);
      }
    }
  }
  return source.beneath.get(path) ?? 0;
}

/** What will be read, by kind of file (its extension) and by top folder, largest first. */
export function readSummary(kept) {
  const byKind = new Map();
  const byTop = new Map();
  for (const file of kept) {
    const name = file.slice(file.lastIndexOf("/") + 1);
    const dot = name.lastIndexOf(".");
    const kind = dot > 0 ? name.slice(dot).toLowerCase() : "(no extension)";
    byKind.set(kind, (byKind.get(kind) ?? 0) + 1);
    const top = file.includes("/") ? file.slice(0, file.indexOf("/")) : "(top)";
    byTop.set(top, (byTop.get(top) ?? 0) + 1);
  }
  const sorted = (map) => [...map].sort((a, b) => b[1] - a[1]);
  return { byKind: sorted(byKind), byTop: sorted(byTop) };
}

/** The totals line: files that will be read, files left out (counted where they were listed), folders not looked inside. */
export function totals(result) {
  const leftOutFiles = result.groups.reduce((sum, group) => sum + group.files.length + group.folders.reduce((inner, folder) => inner + (folder.files ?? 0), 0), 0);
  const notLookedInside = result.groups.reduce((sum, group) => sum + group.folders.filter((folder) => folder.files === null).length, 0);
  const foldersLeftOut = result.groups.reduce((sum, group) => sum + group.folders.length, 0);
  return { read: result.kept.length, leftOutFiles, foldersLeftOut, notLookedInside };
}
