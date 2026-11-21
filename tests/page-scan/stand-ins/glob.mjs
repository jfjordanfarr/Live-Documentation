// Stands in for the `glob` package in the scanning page. Glob itself walks a folder through Node's `fs` (by
// `path-scurry`), which a page lacks; this walks the stand-in for `node:fs` instead, and matches with minimatch, the
// matcher glob uses, by glob's own rules: a pattern matched with the caller's `dot`, an `ignore` pattern matched with
// `dot` always on, against a path and against it with a slash after it, and one ending in `**` keeping the walk out of
// the folder it names (glob's `Ignore`). A caller's own `fs` (its `readdir`) is walked through, as glob walks it, so
// that the folders discovery reads as empty (`foldersReadAsEmpty`, `tooling/gitIgnored.ts`) read as empty here too. A
// folder whose read fails reads as empty, as in glob. The walk goes in name order; glob promises no order.
import { Minimatch } from "minimatch";

import { counted } from "./calls.mjs";
import { tree } from "./fs.mjs";
import { rules } from "./path.mjs";

/** A folder's entries through the caller's `fs` when it gives one, else straight from the tree. */
function folderReader(fs) {
  if (fs?.readdir) {
    return (folder) => new Promise((answer) => fs.readdir(folder, { withFileTypes: true }, (error, entries) => answer(error ? [] : entries)));
  }
  return async (folder) => {
    try {
      return tree.entries(folder);
    } catch {
      return [];
    }
  };
}

/** A match as glob's `withFileTypes` gives it: a path object, of which the scan asks these. */
function pathObject(cwd, relative, folder) {
  const full = relative === "" ? cwd : cwd === "/" ? `/${relative}` : `${cwd}/${relative}`;
  return {
    name: rules.basename(full),
    fullpath: () => full,
    relative: () => relative,
    isFile: () => !folder,
    isDirectory: () => folder,
    isSymbolicLink: () => false
  };
}

export const glob = counted("glob.glob", async (patterns, options = {}) => {
  const cwd = rules.resolve(options.cwd ?? "/");
  const shared = { windowsPathsNoEscape: !!options.windowsPathsNoEscape, nocase: !!options.nocase };
  const matchers = (Array.isArray(patterns) ? patterns : [patterns]).map((pattern) => new Minimatch(pattern, { ...shared, dot: !!options.dot }));
  const ignores = (Array.isArray(options.ignore) ? options.ignore : options.ignore ? [options.ignore] : []).map((pattern) => ({
    matcher: new Minimatch(pattern, { ...shared, dot: true, nocomment: true, nonegate: true }),
    children: pattern.endsWith("**")
  }));
  const ignored = (relative, children) => ignores.some((ignore) => (!children || ignore.children) && (ignore.matcher.match(relative) || ignore.matcher.match(`${relative}/`)));
  const read = folderReader(options.fs);
  const found = [];
  const visit = async (relative) => {
    for (const entry of await read(relative === "" ? cwd : pathObject(cwd, relative, true).fullpath())) {
      const child = relative === "" ? entry.name : `${relative}/${entry.name}`;
      const folder = entry.isDirectory();
      if (!ignored(child, false) && !(folder && options.nodir) && matchers.some((matcher) => matcher.match(child))) found.push(pathObject(cwd, child, folder));
      if (folder && !ignored(child, true)) await visit(child);
    }
  };
  await visit("");
  if (options.withFileTypes) return found;
  return found.map((match) => (options.absolute ? match.fullpath() : match.relative()));
});

export default { glob };
