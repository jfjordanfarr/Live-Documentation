/**
 * What a scan leaves out, decided on a folder's listing before anything is
 * read: the one function both hosts share, the command line over a disk and a
 * page over a folder a person picked, so that the choice can be shown to a
 * person and changed before the scan. It reads nothing and imports nothing of
 * Node: it is given the listing's paths (relative, forward slashes, as
 * written), the texts of the ignore files the listing names, a starting list
 * and a person's own patterns, and answers for each path whether it is kept,
 * or left out and by which rule, file and line.
 *
 * @remarks
 * **`.gitignore`, by git's own rules**, ported from git's `dir.c` and
 * `wildmatch.c` (git 2.56) and held to `git check-ignore` rule for rule by the
 * tests beside this module: a comment begins with `#`; trailing spaces are
 * dropped unless escaped; `!` negates; a trailing `/` matches folders only; a
 * pattern with no slash but a trailing one matches a name at any depth, any
 * other is anchored at its file's folder; `*` and `?` stop at `/`, `**` crosses
 * it at a segment's edge, `[...]` is a class; the last matching line of a file
 * wins and a deeper file's opinion beats a shallower one's; and a path beneath
 * an ignored folder is ignored whatever follows, since git never looks inside
 * one ("It is not possible to re-include a file if a parent directory of that
 * file is excluded"), nor reads the `.gitignore` files there. Names are matched
 * as written, as git does where `core.ignorecase` is false. What a listing
 * cannot tell, and this function therefore cannot know: `.git/info/exclude`,
 * the person's global excludes file, and git's keeping of a file it tracks
 * beneath an ignored folder.
 *
 * **`.tfignore`, by TFVC's own rules** as Microsoft's open-source TFVC client
 * implements them (Team Explorer Everywhere, `IgnoreFile.java`,
 * `IgnoreEntry.java`, `LocalItemExclusionEvaluator.java` and
 * `ItemPath.matchesWildcardFile`, MIT; Visual Studio's own client is not
 * public, so these are TEE's rules, which it ports from it). A line is trimmed;
 * `#` begins a comment; `/` and `\` are one separator; `!` re-includes; a
 * leading separator keeps the pattern to its own folder, else it matches at any
 * depth; a trailing separator matches folders only; a path before the last
 * separator names a folder literally; only `*` and `?` are wildcards, and the
 * name is compared without regard to case. An exclusion that matches any part
 * of a path leaves the path out; an inclusion re-includes only the part it
 * names last. Within a file the last matching line wins; the deepest file with
 * an opinion decides, so a subfolder's file adds to its parent's rather than
 * replacing them. The folder part of a pattern is compared without regard to
 * case, as TEE compares it on Windows (on Linux it respects case). Two things
 * TEE does that this function does not: TFVC's global list of exclusions, which
 * a collection's server sends, and the skipping of TFVC's own `$tf` folders,
 * both left to the starting list.
 *
 * **Which rule wins:** a person's own patterns first, then the ignore files
 * (left out when either kind leaves a path out), then the starting list, which
 * applies only where no ignore file lies at or above a path's folder: it is
 * offered for a folder that has none. The person's patterns and the starting
 * list are read by git's rules, as if one `.gitignore` stood at the folder's
 * top. Whether everything under a folder is left out, so that a walk need not
 * go in, is reported by {@link LeaveOut.folder}, never assumed: git's rule
 * allows it, TFVC's change scanner does not (it judges every file beneath an
 * excluded folder, and a `!` line can keep one), though `tf add` does.
 *
 * Origin: the owner's ask of 2026-11-21 for "a good solid way to create ignore
 * patterns on what they scan, before they scan it", and the design of one
 * engine with two hosts (`.mdmd/layer-3/engine-and-hosts.mdmd.md`).
 *
 * @module
 */

/** An ignore file the listing names, at its path relative to the scanned folder, with its text. */
export interface IgnoreFileText {
  path: string;
  text: string;
}

/** The rule that decided a path: which file and line, which entry of the starting list, or which of the person's patterns. */
export type LeaveOutRule =
  | { kind: "gitignore" | "tfignore"; file: string; line: number; pattern: string }
  | { kind: "starting list"; index: number; pattern: string }
  | { kind: "person"; index: number; pattern: string };

/** The answer for one path: kept or left out, and the rule that decided, if any did (a kept path's rule is one that re-included it). */
export interface LeaveOutVerdict {
  kept: boolean;
  rule?: LeaveOutRule;
}

/** The answer for a folder, and whether nothing beneath it can be kept, so that a walk need not go in. */
export interface FolderVerdict extends LeaveOutVerdict {
  prunable: boolean;
  /** Why it can or cannot be pruned, in a sentence. */
  why: string;
}

/** What decides a scan's leaving out: the ignore files the listing names, a starting list and a person's patterns. */
export interface LeaveOutInput {
  ignoreFiles: readonly IgnoreFileText[];
  startingList?: readonly string[];
  person?: readonly string[];
}

/** The decider of one listing: a file's verdict and a folder's, the folder's with whether a walk may leave it unlisted. */
export interface LeaveOut {
  /** A file's verdict, its path relative to the scanned folder with forward slashes. */
  file(path: string): LeaveOutVerdict;
  /** A folder's verdict, and whether a walk may leave it unlisted. */
  folder(path: string): FolderVerdict;
}

// ---------------------------------------------------------------------------
// Git's wildmatch, ported from git's wildmatch.c
// ---------------------------------------------------------------------------

const MATCH = 0;
const NOMATCH = 1;
const ABORT_ALL = -1;
const ABORT_TO_STARSTAR = -2;

const CLASSES: Record<string, (c: string) => boolean> = {
  alnum: (c) => /[A-Za-z0-9]/u.test(c),
  alpha: (c) => /[A-Za-z]/u.test(c),
  blank: (c) => c === " " || c === "\t",
  cntrl: (c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127,
  digit: (c) => /[0-9]/u.test(c),
  graph: (c) => c.charCodeAt(0) > 32 && c.charCodeAt(0) < 127,
  lower: (c) => /[a-z]/u.test(c),
  print: (c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) < 127,
  punct: (c) => /[!-/:-@[-`{-~]/u.test(c),
  space: (c) => /[ \t\n\r\f\v]/u.test(c),
  upper: (c) => /[A-Z]/u.test(c),
  xdigit: (c) => /[0-9A-Fa-f]/u.test(c)
};

const isGlobSpecial = (c: string | undefined): boolean => c === "*" || c === "?" || c === "[" || c === "\\";

/** Git's `dowild`: whether `text` from `t` matches `pattern` from `p`, with or without `WM_PATHNAME`. */
function dowild(pattern: string, p: number, text: string, t: number, pathname: boolean): number {
  const start = p;
  for (; p < pattern.length; t++, p++) {
    let pc: string | undefined = pattern[p];
    let tc: string | undefined = text[t];
    if (tc === undefined && pc !== "*") return ABORT_ALL;
    switch (pc) {
      case "\\":
        p++;
        pc = pattern[p];
        if (tc !== pc) return NOMATCH;
        continue;
      case "?":
        if (pathname && tc === "/") return NOMATCH;
        continue;
      case "*": {
        let matchSlash: boolean;
        if (pattern[++p] === "*") {
          const prev = p - 2;
          while (pattern[++p] === "*") { /* a run of stars is one */ }
          if ((prev < start || pattern[prev] === "/") && (p >= pattern.length || pattern[p] === "/" || (pattern[p] === "\\" && pattern[p + 1] === "/"))) {
            if (pattern[p] === "/" && dowild(pattern, p + 1, text, t, pathname) === MATCH) return MATCH;
            matchSlash = true;
          } else {
            matchSlash = !pathname;
          }
        } else {
          matchSlash = !pathname;
        }
        if (p >= pattern.length) {
          if (!matchSlash && text.indexOf("/", t) !== -1) return NOMATCH;
          return MATCH;
        } else if (!matchSlash && pattern[p] === "/") {
          const slash = text.indexOf("/", t);
          if (slash === -1) return NOMATCH;
          t = slash;
          // The slash is consumed by the loop's own step.
          break;
        }
        for (;;) {
          if (tc === undefined) break;
          if (!isGlobSpecial(pattern[p])) {
            const literal = pattern[p];
            while ((tc = text[t]) !== undefined && (matchSlash || tc !== "/")) {
              if (tc === literal) break;
              t++;
            }
            if (tc !== literal) {
              if (matchSlash) return ABORT_ALL;
              break;
            }
          }
          const matched = dowild(pattern, p, text, t, pathname);
          if (matched !== NOMATCH) {
            if (!matchSlash || matched !== ABORT_TO_STARSTAR) return matched;
          } else if (!matchSlash && tc === "/") {
            return ABORT_TO_STARSTAR;
          }
          tc = text[++t];
        }
        return ABORT_ALL;
      }
      case "[": {
        pc = pattern[++p];
        if (pc === "^") pc = "!";
        const negated = pc === "!";
        if (negated) pc = pattern[++p];
        let prev: string | undefined;
        let matched = false;
        do {
          if (pc === undefined) return ABORT_ALL;
          if (pc === "\\") {
            pc = pattern[++p];
            if (pc === undefined) return ABORT_ALL;
            if (tc === pc) matched = true;
          } else if (pc === "-" && prev !== undefined && pattern[p + 1] !== undefined && pattern[p + 1] !== "]") {
            pc = pattern[++p];
            if (pc === "\\") {
              pc = pattern[++p];
              if (pc === undefined) return ABORT_ALL;
            }
            if (tc !== undefined && tc <= pc && tc >= prev) matched = true;
            pc = undefined;
          } else if (pc === "[" && pattern[p + 1] === ":") {
            const s = p + 2;
            let q = s;
            while (pattern[q] !== undefined && pattern[q] !== "]") q++;
            if (pattern[q] === undefined) return ABORT_ALL;
            if (q - s - 1 < 0 || pattern[q - 1] !== ":") {
              // No ":]": a plain `[` in the set.
              if (tc === "[") matched = true;
            } else {
              const test = CLASSES[pattern.slice(s, q - 1)];
              if (!test) return ABORT_ALL;
              if (tc !== undefined && test(tc)) matched = true;
              p = q;
              pc = undefined;
            }
          } else if (tc === pc) {
            matched = true;
          }
          prev = pc;
          pc = pattern[++p];
        } while (pc !== "]");
        if (matched === negated || (pathname && tc === "/")) return NOMATCH;
        continue;
      }
      default:
        if (tc !== pc) return NOMATCH;
        continue;
    }
  }
  return t < text.length ? NOMATCH : MATCH;
}

const wildmatch = (pattern: string, text: string, pathname: boolean): boolean => dowild(pattern, 0, text, 0, pathname) === MATCH;

// ---------------------------------------------------------------------------
// .gitignore
// ---------------------------------------------------------------------------

interface GitPattern {
  /** The folder of the file it stands in, relative, `""` for the top. */
  base: string;
  pattern: string;
  negative: boolean;
  mustBeDir: boolean;
  noDir: boolean;
  line: number;
  original: string;
}

/** Git's `trim_trailing_spaces`: unescaped trailing spaces dropped. */
function trimTrailingSpaces(line: string): string {
  let lastSpace = -1;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === " ") {
      if (lastSpace === -1) lastSpace = i;
    } else if (c === "\\") {
      i++;
      if (i >= line.length) return line;
      lastSpace = -1;
    } else {
      lastSpace = -1;
    }
  }
  return lastSpace === -1 ? line : line.slice(0, lastSpace);
}

/** The patterns of a `.gitignore`'s text, as git's `add_patterns_from_buffer` and `parse_path_pattern` read them. */
function gitPatterns(text: string, base: string): GitPattern[] {
  const patterns: GitPattern[] = [];
  const lines = (text.startsWith("\uFEFF") ? text.slice(1) : text).split("\n");
  // A last line without a newline is read as well.
  lines.forEach((raw, index) => {
    if (index === lines.length - 1 && raw === "") return;
    let entry = raw.endsWith("\r") ? raw.slice(0, -1) : raw;
    if (entry === "" || entry.startsWith("#")) return;
    entry = trimTrailingSpaces(entry);
    const original = entry;
    let negative = false;
    if (entry.startsWith("!")) {
      negative = true;
      entry = entry.slice(1);
    }
    let mustBeDir = false;
    if (entry.endsWith("/")) {
      mustBeDir = true;
      entry = entry.slice(0, -1);
    }
    const noDir = !entry.includes("/");
    patterns.push({ base, pattern: entry, negative, mustBeDir, noDir, line: index + 1, original });
  });
  return patterns;
}

/** Whether a git pattern matches a path (relative to the scanned folder), as git's `match_basename` and `match_pathname` do. */
function gitMatches(pattern: GitPattern, path: string, isDir: boolean): boolean {
  if (pattern.mustBeDir && !isDir) return false;
  if (pattern.base !== "" && !path.startsWith(`${pattern.base}/`)) return false;
  const relative = pattern.base === "" ? path : path.slice(pattern.base.length + 1);
  if (pattern.noDir) {
    const slash = relative.lastIndexOf("/");
    return wildmatch(pattern.pattern, slash === -1 ? relative : relative.slice(slash + 1), false);
  }
  const anchored = pattern.pattern.startsWith("/") ? pattern.pattern.slice(1) : pattern.pattern;
  return wildmatch(anchored, relative, true);
}

const folderOf = (path: string): string => {
  const slash = path.lastIndexOf("/");
  return slash === -1 ? "" : path.slice(0, slash);
};

/** Every folder above a path, the top (`""`) first. */
function foldersAbove(path: string): string[] {
  const parts = path.split("/");
  const folders = [""];
  for (let i = 1; i < parts.length; i++) folders.push(parts.slice(0, i).join("/"));
  return folders;
}

type Opinion = { excluded: boolean; rule: LeaveOutRule } | undefined;

/** The rule sets of one kind, by the folder their file stands in. */
type ByFolder<T> = Map<string, T[]>;

/** Git's opinion of one path, its own folder's files deepest first, the last matching line of a file winning. */
function gitOpinionOf(path: string, isDir: boolean, byFolder: ByFolder<GitPattern>, kind: "gitignore" | "starting list" | "person", fileOf: (folder: string) => string): Opinion {
  const folders = foldersAbove(path).reverse();
  for (const folder of folders) {
    const patterns = byFolder.get(folder);
    if (!patterns) continue;
    for (let i = patterns.length - 1; i >= 0; i--) {
      const pattern = patterns[i];
      if (!gitMatches(pattern, path, isDir)) continue;
      const rule: LeaveOutRule = kind === "gitignore"
        ? { kind, file: fileOf(folder), line: pattern.line, pattern: pattern.original }
        : { kind, index: pattern.line - 1, pattern: pattern.original };
      return { excluded: !pattern.negative, rule };
    }
  }
  return undefined;
}

/**
 * Git's word on a path: a folder above it that is ignored decides for it, the top first, as git never enters an
 * ignored folder; otherwise its own opinion.
 */
function gitJudge(path: string, isDir: boolean, byFolder: ByFolder<GitPattern>, kind: "gitignore" | "starting list" | "person", fileOf: (folder: string) => string): Opinion {
  const parts = path.split("/");
  for (let i = 1; i < parts.length; i++) {
    const above = gitOpinionOf(parts.slice(0, i).join("/"), true, byFolder, kind, fileOf);
    if (above?.excluded) return above;
  }
  return gitOpinionOf(path, isDir, byFolder, kind, fileOf);
}

// ---------------------------------------------------------------------------
// .tfignore, as Team Explorer Everywhere reads and applies it
// ---------------------------------------------------------------------------

interface TfEntry {
  /** The folder the entry applies under, relative, `""` for the top, in the case written. */
  folder: string;
  name: string;
  shape: "exact" | "endsWith" | "startsWith" | "complex";
  excluded: boolean;
  recursive: boolean;
  folderOnly: boolean;
  line: number;
  original: string;
}

const isWildcard = (text: string): boolean => text.includes("*") || text.includes("?");

/** The folders and name of a path as `java.io.File` would hold them: separators collapsed. */
function collapse(path: string): string {
  return path.split("/").filter((part) => part !== "").join("/");
}

/** Java's `String.trim`: every character at or below U+0020 off both ends. */
function javaTrim(text: string): string {
  let start = 0;
  let end = text.length;
  while (start < end && text.charCodeAt(start) <= 32) start++;
  while (end > start && text.charCodeAt(end - 1) <= 32) end--;
  return text.slice(start, end);
}

/** The entries of a `.tfignore`'s text, as `IgnoreFile.addExcludeEntry` reads each line. */
function tfEntries(text: string, base: string): TfEntry[] {
  const entries: TfEntry[] = [];
  text.split(/\r\n|\n|\r/u).forEach((raw, index) => {
    let pattern = raw.replace(/^[\uFEFF\uFFFE]/u, "");
    pattern = javaTrim(pattern);
    if (pattern === "" || pattern.startsWith("#")) return;
    const original = pattern;
    pattern = pattern.replace(/\\/gu, "/");
    let excluded = true;
    if (pattern.startsWith("!") && pattern.length > 1) {
      excluded = false;
      pattern = pattern.slice(1);
    }
    let recursive = true;
    if (pattern.startsWith("/")) {
      recursive = false;
      pattern = pattern.slice(1);
    }
    let folderOnly = false;
    if (pattern.endsWith("/")) {
      folderOnly = true;
      pattern = pattern.slice(0, -1);
    }
    pattern = javaTrim(pattern);
    const full = collapse(base === "" ? pattern : `${base}/${pattern}`);
    // A line that names nothing below its own folder (`\`, `!/`) has no name part to match: TEE would read it as the
    // folder itself, by its parent; it is left out here, and is a known gap.
    if (full === collapse(base)) return;
    const name = full.slice(full.lastIndexOf("/") + 1);
    let shape: TfEntry["shape"] = "exact";
    let match = name;
    if (isWildcard(name)) {
      if (name.length >= 2 && name[0] === "*" && !isWildcard(name.slice(1))) {
        shape = "endsWith";
        match = name.slice(1);
      } else if (name.length >= 2 && name[name.length - 1] === "*" && !isWildcard(name.slice(0, -1))) {
        shape = "startsWith";
        match = name.slice(0, -1);
      } else {
        shape = "complex";
      }
    }
    entries.push({ folder: folderOf(full), name: match, shape, excluded, recursive, folderOnly, line: index + 1, original });
  });
  return entries;
}

const lower = (text: string): string => text.toLowerCase();

/** `ItemPath.matchesWildcardFile`: `*` and `?`, without regard to case, with Visual Studio's rule on a trailing period. */
function tfWildcard(name: string, n: number, pattern: string, w: number): boolean {
  while (w < pattern.length) {
    if (pattern[w] === "*") {
      do {
        ++w;
      } while (w < pattern.length && pattern[w] === "*");
      for (;;) {
        if (tfWildcard(name, n, pattern, w)) return true;
        if (n === name.length) return false;
        if (name[n] === "." && name.lastIndexOf(".", name.length - 1) === n && pattern.length === w + 1 && pattern[w] === ".") return false;
        ++n;
      }
    }
    if (n === name.length) {
      return pattern[w] === "." && pattern.lastIndexOf(".", pattern.length - 1) === w && tfWildcard(name, n, pattern, w + 1);
    }
    if (lower(name[n]) !== lower(pattern[w]) && pattern[w] !== "?") return false;
    ++n;
    ++w;
  }
  return n === name.length || (name[n] === "." && n + 1 === name.length);
}

function tfNameMatches(entry: TfEntry, part: string): boolean {
  const name = lower(part);
  const match = lower(entry.name);
  if (entry.shape === "endsWith") return match.length <= name.length && name.endsWith(match);
  if (entry.shape === "startsWith") return match.length <= name.length && name.startsWith(match);
  if (entry.shape === "complex") return tfWildcard(part, 0, entry.name, 0);
  return name === match;
}

/** `IgnoreFile.isExcluded`: one file's opinion of a path, the last matching entry winning. */
function tfFileOpinion(entries: readonly TfEntry[], path: string, isFolder: boolean): TfEntry | undefined {
  const parts = path.split("/");
  let decided: TfEntry | undefined;
  for (const entry of entries) {
    const folderParts = entry.folder === "" ? [] : entry.folder.split("/");
    // `LocalPath.isChild`, without regard to case as on Windows: the entry applies only under its folder.
    if (folderParts.length >= parts.length) continue;
    if (folderParts.some((part, index) => lower(part) !== lower(parts[index]))) continue;
    for (let i = folderParts.length; i < parts.length; i++) {
      if (!entry.recursive && i > folderParts.length) break;
      const last = i === parts.length - 1;
      if (entry.folderOnly && !isFolder && last) break;
      if (!tfNameMatches(entry, parts[i])) continue;
      if (entry.excluded) decided = entry;
      else if (last) decided = entry;
    }
  }
  return decided;
}

/** TFVC's word on a path: the `.tfignore` files from its parent folder up to the top, deepest first, the first with an opinion deciding. */
function tfJudge(path: string, isFolder: boolean, byFolder: ByFolder<TfEntry>, fileOf: (folder: string) => string): Opinion {
  for (const folder of foldersAbove(path).reverse()) {
    const entries = byFolder.get(folder);
    if (!entries) continue;
    const entry = tfFileOpinion(entries, path, isFolder);
    if (entry) return { excluded: entry.excluded, rule: { kind: "tfignore", file: fileOf(folder), line: entry.line, pattern: entry.original } };
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// The one function
// ---------------------------------------------------------------------------

const nameOf = (path: string): string => path.slice(path.lastIndexOf("/") + 1);

/** The decider for one listing's ignore files, starting list and person's patterns. */
export function leaveOut(input: LeaveOutInput): LeaveOut {
  const git: ByFolder<GitPattern> = new Map();
  const tf: ByFolder<TfEntry> = new Map();
  const gitFiles = new Map<string, string>();
  const tfFiles = new Map<string, string>();
  const ruled = new Set<string>();
  for (const file of input.ignoreFiles) {
    const folder = folderOf(file.path);
    const name = nameOf(file.path);
    if (name === ".gitignore") {
      git.set(folder, gitPatterns(file.text, folder));
      gitFiles.set(folder, file.path);
      ruled.add(folder);
    } else if (lower(name) === ".tfignore") {
      tf.set(folder, tfEntries(file.text, folder));
      tfFiles.set(folder, file.path);
      ruled.add(folder);
    }
  }
  const asOneFile = (patterns: readonly string[] | undefined): ByFolder<GitPattern> => new Map([["", gitPatterns((patterns ?? []).join("\n"), "")]]);
  const person = asOneFile(input.person);
  const starting = asOneFile(input.startingList);
  const fileOf = (files: Map<string, string>) => (folder: string): string => files.get(folder) ?? folder;

  /**
   * The starting list's word, from the top down: it speaks for a path or a folder above it only while no ignore file
   * stands at or above that level, and a folder it leaves out decides for everything beneath, ignore files inside
   * among them, as git's rule has it; so a walk may leave such a folder unlisted.
   */
  const byStartingList = (path: string, isFolder: boolean): (Opinion & { above: boolean }) | undefined => {
    const parts = path.split("/");
    for (let i = 1; i <= parts.length; i++) {
      const prefix = parts.slice(0, i).join("/");
      if (foldersAbove(prefix).some((folder) => ruled.has(folder))) return undefined;
      const own = i === parts.length;
      const opinion = gitOpinionOf(prefix, own ? isFolder : true, starting, "starting list", () => "");
      if (own) return opinion && { ...opinion, above: false };
      if (opinion?.excluded) return { ...opinion, above: true };
    }
    return undefined;
  };

  const judge = (path: string, isFolder: boolean): LeaveOutVerdict => {
    const own = gitJudge(path, isFolder, person, "person", () => "");
    if (own) return { kept: !own.excluded, rule: own.rule };
    const start = byStartingList(path, isFolder);
    if (start?.above) return { kept: false, rule: start.rule };
    // A `.gitignore` inside a folder git ignores is never read, which `gitJudge` keeps by deciding at that folder.
    const byGit = gitJudge(path, isFolder, git, "gitignore", fileOf(gitFiles));
    const byTf = tfJudge(path, isFolder, tf, fileOf(tfFiles));
    if (byGit?.excluded) return { kept: false, rule: byGit.rule };
    if (byTf?.excluded) return { kept: false, rule: byTf.rule };
    if (byGit || byTf) return { kept: true, rule: (byGit ?? byTf)!.rule };
    if (start) return { kept: !start.excluded, rule: start.rule };
    return { kept: true };
  };

  const personNegates = gitPatterns((input.person ?? []).join("\n"), "").some((pattern) => pattern.negative);

  return {
    file: (path) => judge(path, false),
    folder: (path) => {
      const verdict = judge(path, true);
      if (verdict.kept) return { ...verdict, prunable: false, why: "the folder is kept" };
      const rule = verdict.rule!;
      if (rule.kind === "tfignore") {
        return { ...verdict, prunable: false, why: "TFVC's change scanner judges every file beneath an excluded folder, and a later `!` line or a .tfignore inside may keep one (tf add would not go in)" };
      }
      if (rule.kind !== "person" && personNegates) {
        return { ...verdict, prunable: false, why: "a person's pattern re-includes something, and may name a file beneath" };
      }
      if (rule.kind === "gitignore" && tf.size > 0) {
        return { ...verdict, prunable: true, why: "git never looks inside an ignored folder; a .tfignore cannot keep what a .gitignore leaves out" };
      }
      return { ...verdict, prunable: true, why: rule.kind === "gitignore" ? "git never looks inside an ignored folder" : "by git's rule, which the person's patterns and the starting list follow, nothing beneath an excluded folder is re-included" };
    }
  };
}
