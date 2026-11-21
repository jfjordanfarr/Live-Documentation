// The model behind the trial page of what a scan leaves out, shared by the page and by its terminal twin: a walk of a
// folder, from any source that can list a folder and read a small text file, with the engine's `leaveOut` deciding each
// folder before it is entered by the one list the person sees; and what a person is shown of it, by the line of the
// list that left each thing out. Pure of any browser or Node module, so that both hosts run the same code. A trial for
// strangers and the owner, not the product: `Probes/leave-out/README.md`, the eighth leg.
import { leaveOut } from "../../../../../../../../packages/engine/src/tooling/leaveOut";

/** The tool's own output folder, never scanned. */
export const OWN_OUTPUT = ".live-documentation";

/** A path of the person's own naming exactly one folder or file from the top, by git's rules, its specials escaped. */
export function folderPattern(path) {
  return `/${path.replace(/[\\*?[\]!#]/gu, (character) => `\\${character}`)}/`;
}
export const filePattern = (path) => folderPattern(path).slice(0, -1);

const pause = () => new Promise((resolve) => setTimeout(resolve, 0));
const isIgnoreFile = (name) => name === ".gitignore" || name.toLowerCase() === ".tfignore";

/** The kind of a file: its extension, lower-cased, or "(no extension)". */
export function kindOf(file) {
  const name = file.slice(file.lastIndexOf("/") + 1);
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot).toLowerCase() : "(no extension)";
}

/**
 * Walks a source with `leaveOut` over the one list. A source has `list(path)`, resolving to the entries of a folder
 * (`{ name, kind }`, kind "file" or "folder"), `text(path)`, resolving to a file's text or undefined, `lazy`, true where
 * folders are listed only when asked (a directory handle) and false where everything was listed before (a folder
 * input), and, when not lazy, `allFiles`, so that what a folder left out whole holds can be counted. Listings and the
 * texts of the ignore files met are kept on the source, so that a walk again after an edit asks only for what it had
 * not listed. `progress(folders)` is told as it goes.
 */
export async function walk(source, { list, ignoreCase }, progress = () => undefined) {
  source.listed ??= new Map();
  source.texts ??= new Map();
  let listMs = 0;
  let decideMs = 0;
  let listings = 0;
  // The time spent counting, by kind, what each folder left out whole holds.
  let countMs = 0;
  const listFolder = async (path) => {
    if (source.listed.has(path)) return source.listed.get(path);
    const started = performance.now();
    const entries = await source.list(path);
    for (const entry of entries) {
      if (entry.kind === "file" && isIgnoreFile(entry.name)) {
        const file = path ? `${path}/${entry.name}` : entry.name;
        source.texts.set(file, await source.text(file));
      }
    }
    listMs += performance.now() - started;
    listings += 1;
    source.listed.set(path, entries);
    return entries;
  };

  // Git's one setting a listing cannot give, read from the repository's own file, offered for the list's case setting.
  const top = await listFolder("");
  let gitIgnoreCase;
  if (top.some((entry) => entry.name === ".git" && entry.kind === "folder")) {
    const config = await source.text(".git/config");
    gitIgnoreCase = /^\s*ignorecase\s*=\s*true\s*$/imu.test(config ?? "");
  }
  const decide = leaveOut({ list, ignoreCase, ownOutput: [OWN_OUTPUT] });

  const fresh = (fields) => ({ folders: [], filesKept: 0, looseKept: 0, ...fields });
  const root = fresh({ path: "", name: "", kept: true });
  const kept = [];
  // What each line of the list left out, by its number; and what stands outside the list.
  const byLine = new Map();
  const fixed = new Map();
  const notes = new Map();
  const groupOf = (verdict) => {
    if (verdict.fixed) return fixed.get(verdict.fixed) ?? fixed.set(verdict.fixed, { fixed: verdict.fixed, folders: [], files: [], kinds: new Map() }).get(verdict.fixed);
    const key = verdict.line.number;
    return byLine.get(key) ?? byLine.set(key, { line: verdict.line, folders: [], files: [], kinds: new Map() }).get(key);
  };
  const beneath = (path) => (source.lazy ? null : filesBeneath(source, path));
  let folders = 0;
  // The thread is handed back every 30 ms of work, not every so many folders: a page keeps drawing, and a walk is not
  // slowed by a pause it does not need (a browser holds each pause to at least 4 ms).
  let worked = performance.now();
  const visit = async (node) => {
    const entries = await listFolder(node.path);
    folders += 1;
    if (performance.now() - worked > 30) {
      progress(folders);
      await pause();
      worked = performance.now();
    }
    for (const entry of entries) {
      const path = node.path ? `${node.path}/${entry.name}` : entry.name;
      if (entry.kind === "folder") {
        const started = performance.now();
        const verdict = decide.folder(path);
        decideMs += performance.now() - started;
        if (verdict.prunable) {
          const group = groupOf(verdict);
          const counting = performance.now();
          const inside = beneath(path);
          group.folders.push({ path, files: inside === null ? null : inside.length });
          for (const file of inside ?? []) {
            const kind = kindOf(file);
            group.kinds.set(kind, (group.kinds.get(kind) ?? 0) + 1);
          }
          countMs += performance.now() - counting;
          for (const note of verdict.notes ?? []) {
            const said = /^line (\d+), `(.*)`, may name files/u.exec(note);
            if (!said) continue;
            const known = notes.get(said[1]) ?? notes.set(said[1], { number: Number(said[1]), text: said[2], folders: [] }).get(said[1]);
            known.folders.push(path);
          }
          continue;
        }
        const child = fresh({ path, name: entry.name, kept: true });
        node.folders.push(child);
        await visit(child);
        node.filesKept += child.filesKept;
      } else {
        const started = performance.now();
        const verdict = decide.file(path);
        decideMs += performance.now() - started;
        if (verdict.kept) {
          kept.push(path);
          node.filesKept += 1;
          node.looseKept += 1;
        } else {
          const group = groupOf(verdict);
          group.files.push(path);
          group.kinds.set(kindOf(path), (group.kinds.get(kindOf(path)) ?? 0) + 1);
        }
      }
    }
    node.folders.sort((a, b) => b.filesKept - a.filesKept);
  };
  const started = performance.now();
  await visit(root);
  progress(folders);
  // The ignore files met, as sources to offer: those in folders the walk entered.
  const found = [...source.texts].filter(([file]) => source.listed.has(file.includes("/") ? file.slice(0, file.lastIndexOf("/")) : ""))
    .map(([file, text]) => ({ path: file, kind: file.endsWith(".gitignore") ? ".gitignore" : ".tfignore", text: text ?? "" }))
    .sort((a, b) => a.path.split("/").length - b.path.split("/").length || (a.path < b.path ? -1 : 1));
  const count = (group) => group.files.length + group.folders.reduce((sum, folder) => sum + (folder.files ?? 0), 0);
  return {
    root,
    kept,
    lines: [...byLine.values()].map((group) => ({ ...group, leftOut: count(group) })).sort((a, b) => a.line.number - b.line.number),
    fixed: [...fixed.values()].map((group) => ({ ...group, leftOut: count(group) })),
    notes: [...notes.values()],
    found,
    gitIgnoreCase,
    timings: { totalMs: performance.now() - started, listMs, decideMs, countMs, listings, folders }
  };
}

/** The files a source that listed everything holds beneath a folder: gathered once for every folder, then looked up. */
function filesBeneath(source, path) {
  if (!source.beneath) {
    source.beneath = new Map();
    for (const file of source.allFiles ?? []) {
      for (let at = file.lastIndexOf("/"); at > 0; at = file.lastIndexOf("/", at - 1)) {
        const folder = file.slice(0, at);
        if (!source.beneath.has(folder)) source.beneath.set(folder, []);
        source.beneath.get(folder).push(file);
      }
    }
  }
  return source.beneath.get(path) ?? [];
}

/** Every folder the source has listed, and the names each holds, a folder's with a trailing `/`: for proposals. */
export function listingOf(source) {
  const folders = [...source.listed.keys()].filter((folder) => folder !== "");
  const names = (folder) => (source.listed.get(folder) ?? []).map((entry) => (entry.kind === "folder" ? `${entry.name}/` : entry.name));
  return { folders, names };
}

/** What will be read, by kind of file, largest first. */
export function byKind(kept) {
  const kinds = new Map();
  for (const file of kept) kinds.set(kindOf(file), (kinds.get(kindOf(file)) ?? 0) + 1);
  return [...kinds].sort((a, b) => b[1] - a[1]);
}

/** The totals: files that will be read, files left out (counted where they were listed), folders not looked inside. */
export function totals(result) {
  const groups = [...result.lines, ...result.fixed];
  return {
    read: result.kept.length,
    leftOutFiles: groups.reduce((sum, group) => sum + group.leftOut, 0),
    notLookedInside: groups.reduce((sum, group) => sum + group.folders.filter((folder) => folder.files === null).length, 0)
  };
}
