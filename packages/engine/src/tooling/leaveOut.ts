/**
 * What a scan leaves out, decided on a folder's listing before anything is
 * read: the one function both hosts share, the command line over a disk and a
 * page over a folder a person picked, so that the choice can be shown to a
 * person and changed before the scan. It reads nothing and imports nothing of
 * Node: it is given the listing's paths (relative, forward slashes, as
 * written), the texts of the ignore files the listing names, the evidence
 * rules' setting, a person's own patterns and the folders the tool itself
 * writes to, and answers for each path whether it is kept, or left out and by
 * which rule, file and line.
 *
 * @remarks
 * **A folder left out is left out whole**, whichever rule leaves it out: it
 * is not entered, nothing beneath it is looked for, and a `!` line keeps a
 * file or folder only where the folder it lies in is kept. That is git's rule
 * ("It is not possible to re-include a file if a parent directory of that file
 * is excluded") and TFVC's in `tf add /recursive` (`FileSystemWalker.java`,
 * which skips an excluded folder unseen); TFVC's change scanner, which fills
 * Pending Changes, looks inside and lets a `!` line keep a file there, and that
 * reading is given up, by the root's ruling of 2026-11-21, so that a folder of
 * packages is never listed at all and the rule can be said in a sentence. What
 * is owed for it is said: where a `!` line could have named something inside a
 * folder left out whole, the folder's answer carries a note with the line.
 *
 * **`.gitignore`, by git's own rules**, ported from git's `dir.c` and
 * `wildmatch.c` (git 2.56) and held to `git check-ignore` rule for rule, with
 * `core.ignorecase` false and true, by `leaveOut.oracle.test.ts`: `#` begins a
 * comment; trailing spaces are dropped unless escaped; `!` negates; a trailing
 * `/` matches folders only; a pattern with no other slash matches a name at
 * any depth, any other is anchored at its file's folder; `*` and `?` stop at
 * `/`, `**` crosses it at a segment's edge, `[...]` is a class; the last
 * matching line of a file wins and a deeper file's opinion beats a
 * shallower's. Whether names match without regard to case is the
 * repository's own `core.ignorecase`, handed in (`gitIgnoreCase`), as git
 * itself matches; it is true in every repository made on Windows. What a
 * listing cannot tell: `.git/info/exclude`, the person's global excludes file,
 * and git's keeping of a file it tracks beneath an ignored folder.
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
 * case, as TEE compares it on Windows (on Linux it respects case). TFVC's global
 * list of exclusions, which a collection's server sends, is not applied here:
 * by the root's ruling of 2026-11-21 no list of names is, since each one
 * measured left out real source in folders that happened to bear its names.
 *
 * **The evidence rules** ({@link EVIDENCE}) leave a folder out by what it is,
 * read from the names it holds or stands beside, never by its name alone:
 * build output beside a project file, a folder of NuGet's packages, a folder of
 * node's packages. What a folder is holds beneath any ignore file, so they apply
 * wherever they find one, beneath a `.tfignore` and a `.gitignore` alike, as
 * TFVC adds its own defaults beside a `.tfignore`. In a git repository they can
 * leave out files git tracks (a committed `packages` folder), so they are one
 * setting: applied, or only reported on the folder's answer.
 *
 * **Which rule wins:** a version control's own folder (`.git`, `.hg`, `.svn`,
 * TFVC's `$tf` and `.tf`) and the tool's own output first, which are never
 * scanned whatever any rule says; then a person's own patterns, whose `!` keeps
 * what any rule below would leave out (on a folder, what it holds too, from a
 * `.tfignore` entry that matched it by that folder's name); then an ignore file that leaves a path
 * out (either kind); then the evidence rules; then an ignore file's `!`. The
 * person's patterns are read by git's rules without regard to case, since the
 * folders they will meet are Windows's.
 *
 * The decider keeps each folder's state, derived once from its parent's and the
 * ignore files in it, so that a walk asks of each folder once, before going in,
 * and of each file once.
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

/** The rule that decided a path. */
export type LeaveOutRule =
  | { kind: "own output" | "version control"; folder: string }
  | { kind: "gitignore" | "tfignore"; file: string; line: number; pattern: string }
  | { kind: "evidence"; index: number; pattern: string }
  | { kind: "person"; index: number; pattern: string };

/**
 * The answer for one path: kept or left out, and the rule that decided, if any did (a kept path's rule is one that
 * re-included it); for a path left out with its folder, the `!` lines that could have named it; and, where the evidence
 * rules are only reported, the rule that would have left a kept folder out.
 */
export interface LeaveOutVerdict {
  kept: boolean;
  rule?: LeaveOutRule;
  notes?: string[];
  evidence?: LeaveOutRule;
}

/** The answer for a folder, and whether nothing beneath it can be kept, so that a walk need not go in. */
export interface FolderVerdict extends LeaveOutVerdict {
  prunable: boolean;
  /** Why it can or cannot be pruned, in a sentence. */
  why: string;
}

/**
 * The evidence rules' setting: the names a folder holds (a folder's with a trailing `/`), which a lazy walk answers by
 * listing one level further; and whether a folder they find is left out (`apply`) or kept and reported.
 */
export interface EvidenceSetting {
  names: (folder: string) => readonly string[];
  apply: boolean;
}

/** What decides a scan's leaving out. */
export interface LeaveOutInput {
  /** The ignore files the listing names; or, for a walk that reads them as it goes, a folder's own. */
  ignoreFiles: readonly IgnoreFileText[] | ((folder: string) => readonly IgnoreFileText[]);
  /** The repository's `core.ignorecase`: whether `.gitignore` patterns match names without regard to case. */
  gitIgnoreCase?: boolean;
  evidence?: EvidenceSetting;
  person?: readonly string[];
  /** The folders the tool writes to, relative: never scanned. */
  ownOutput?: readonly string[];
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

const isUpper = (c: string | undefined): boolean => c !== undefined && c >= "A" && c <= "Z";
const isLower = (c: string | undefined): boolean => c !== undefined && c >= "a" && c <= "z";

/**
 * Git's `dowild`: whether `text` from `t` matches `pattern` from `p`, with or without `WM_PATHNAME` and `WM_CASEFOLD`.
 * Folding is git's own, quirks included: the text and the pattern's character in hand are folded to lower case, but an
 * escaped character and a class's members are compared as written.
 */
function dowild(pattern: string, p: number, text: string, t: number, pathname: boolean, fold: boolean): number {
  const start = p;
  for (; p < pattern.length; t++, p++) {
    let pc: string | undefined = pattern[p];
    let tc: string | undefined = text[t];
    if (tc === undefined && pc !== "*") return ABORT_ALL;
    if (fold && isUpper(tc)) tc = tc.toLowerCase();
    if (fold && isUpper(pc)) pc = pc.toLowerCase();
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
            if (pattern[p] === "/" && dowild(pattern, p + 1, text, t, pathname, fold) === MATCH) return MATCH;
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
            const literal = fold && isUpper(pattern[p]) ? pattern[p].toLowerCase() : pattern[p];
            while ((tc = text[t]) !== undefined && (matchSlash || tc !== "/")) {
              if (fold && isUpper(tc)) tc = tc.toLowerCase();
              if (tc === literal) break;
              t++;
            }
            if (tc !== literal) {
              if (matchSlash) return ABORT_ALL;
              break;
            }
          }
          const matched = dowild(pattern, p, text, t, pathname, fold);
          if (matched !== NOMATCH) {
            if (!matchSlash || matched !== ABORT_TO_STARSTAR) return matched;
          } else if (!matchSlash && tc === "/") {
            return ABORT_TO_STARSTAR;
          }
          tc = text[++t];
          if (fold && isUpper(tc)) tc = tc.toLowerCase();
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
            else if (fold && isLower(tc)) {
              const upper = tc.toUpperCase();
              if (upper <= pc && upper >= prev) matched = true;
            }
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
              const name = pattern.slice(s, q - 1);
              const test = CLASSES[name];
              if (!test) return ABORT_ALL;
              if (tc !== undefined && test(tc)) matched = true;
              else if (name === "upper" && fold && isLower(tc)) matched = true;
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

const wildmatch = (pattern: string, text: string, pathname: boolean, fold: boolean): boolean => dowild(pattern, 0, text, 0, pathname, fold) === MATCH;

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
  /** The longest run of plain characters the pattern holds, lower-cased: a text without it cannot match, which spares most calls of the matcher. */
  literal: string;
}

/** The longest run of characters outside any wildcard, class, escape or slash, lower-cased; a class read as wildmatch reads it. */
function longestLiteral(pattern: string): string {
  let best = "";
  let run = "";
  const end = (): void => {
    if (run.length > best.length) best = run;
    run = "";
  };
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    // A slash ends a run too: `**/` matches no folder at all, and takes its slash with it.
    if (c === "*" || c === "?" || c === "/") end();
    else if (c === "\\") {
      end();
      i++;
    } else if (c === "[") {
      end();
      let j = i + 1;
      if (pattern[j] === "!" || pattern[j] === "^") j++;
      if (pattern[j] === "]") j++;
      while (j < pattern.length && pattern[j] !== "]") {
        // A `[:name:]` inside the class ends at its own `:]`, and an escape takes the character after it.
        const close = pattern[j] === "[" && pattern[j + 1] === ":" ? pattern.indexOf(":]", j + 2) : -1;
        j = close !== -1 ? close + 2 : pattern[j] === "\\" ? j + 2 : j + 1;
      }
      i = j;
    } else run += c;
  }
  end();
  return best.toLowerCase();
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
    patterns.push({ base, pattern: entry, negative, mustBeDir, noDir, line: index + 1, original, literal: longestLiteral(entry.replace(/^\//u, "")) });
  });
  return patterns;
}

/** Whether a git pattern matches a path (relative to the scanned folder), as git's `match_basename` and `match_pathname` do. */
function gitMatches(pattern: GitPattern, path: string, isDir: boolean, ignoreCase: boolean): boolean {
  if (pattern.mustBeDir && !isDir) return false;
  if (pattern.base !== "") {
    const head = path.slice(0, pattern.base.length + 1);
    if (ignoreCase ? head.toLowerCase() !== `${pattern.base}/`.toLowerCase() : head !== `${pattern.base}/`) return false;
  }
  const relative = pattern.base === "" ? path : path.slice(pattern.base.length + 1);
  const text = pattern.noDir ? relative.slice(relative.lastIndexOf("/") + 1) : relative;
  if (pattern.literal !== "" && !text.toLowerCase().includes(pattern.literal)) return false;
  if (pattern.noDir) return wildmatch(pattern.pattern, text, false, ignoreCase);
  return wildmatch(pattern.pattern.startsWith("/") ? pattern.pattern.slice(1) : pattern.pattern, relative, true, ignoreCase);
}

const folderOf = (path: string): string => {
  const slash = path.lastIndexOf("/");
  return slash === -1 ? "" : path.slice(0, slash);
};

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
function tfFileOpinion(entries: readonly TfEntry[], path: string, isFolder: boolean, keptFrom = 0): TfEntry | undefined {
  const parts = path.split("/");
  let decided: TfEntry | undefined;
  for (const entry of entries) {
    const folderParts = entry.folder === "" ? [] : entry.folder.split("/");
    // `LocalPath.isChild`, without regard to case as on Windows: the entry applies only under its folder.
    if (folderParts.length >= parts.length) continue;
    if (folderParts.some((part, index) => lower(part) !== lower(parts[index]))) continue;
    // The first `keptFrom` folders of the path are a person's own keep and those above it: an entry no longer names them.
    for (let i = Math.max(folderParts.length, keptFrom); i < parts.length; i++) {
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

// ---------------------------------------------------------------------------
// The evidence rules: a folder left out by what it is, never by its name alone
// ---------------------------------------------------------------------------

/** A version control's own folder (or git's pointer file of that name): git's, Mercurial's, Subversion's, and TFVC's baseline folders (`BaselineFolder.java`). */
const VERSION_CONTROL = /^(?:\.git|\.hg|\.svn|\$tf(?:[1-9]|1[0-5])?|\.tf(?:[1-9]|1[0-5])?)$/iu;

const PROJECT_FILE = /\.(?:cs|vb|fs|vcx|sql|wix|nj)proj$/iu;
const NUGET_PACKAGE = /^[A-Za-z0-9_][A-Za-z0-9_.-]*?\.\d+(?:\.\d+){1,3}(?:-[0-9A-Za-z.-]+)?\/$/u;

/**
 * The evidence rules: each leaves a folder out only where what the folder holds, or what stands beside it, shows it
 * to be a build's output or a package manager's, by the names alone. `bin` and `obj` beside a project file; `packages`
 * holding NuGet's `<Id>.<Version>` folders or a `repositories.config`; `node_modules` holding a package's
 * `package.json` in one of its first three folders.
 */
export const EVIDENCE: ReadonlyArray<{ name: string; pattern: string; holds: (folder: string, names: (folder: string) => readonly string[]) => boolean }> = [
  { name: "bin", pattern: "bin/ beside a project file", holds: (folder, names) => names(folderOf(folder)).some((name) => PROJECT_FILE.test(name)) },
  { name: "obj", pattern: "obj/ beside a project file", holds: (folder, names) => names(folderOf(folder)).some((name) => PROJECT_FILE.test(name)) },
  { name: "packages", pattern: "packages/ holding NuGet's <Id>.<Version> folders or a repositories.config", holds: (folder, names) => names(folder).some((name) => name.toLowerCase() === "repositories.config" || NUGET_PACKAGE.test(name)) },
  {
    name: "node_modules",
    pattern: "node_modules/ holding packages with a package.json",
    holds: (folder, names) => names(folder).filter((name) => name.endsWith("/")).slice(0, 3).some((child) => names(`${folder}/${child.slice(0, -1)}`).includes("package.json"))
  }
];

// ---------------------------------------------------------------------------
// The decider, one folder's state at a time
// ---------------------------------------------------------------------------

const nameOf = (path: string): string => path.slice(path.lastIndexOf("/") + 1);

type Opinion = { excluded: boolean; rule: LeaveOutRule; negations?: string[] } | undefined;

/** The ignore files that speak for what a folder holds: those at and above it, the deepest last. */
interface FolderFiles {
  git: Array<{ file: string; patterns: GitPattern[] }>;
  tf: Array<{ file: string; entries: TfEntry[] }>;
}

/**
 * A folder's state, derived once from its parent's: left out whole, or the ignore files that speak for what it holds.
 * Those are asked for only when something inside the folder is decided, so that a walk which lists a folder after
 * deciding it, as a lazy one does, has read its ignore files by then.
 */
interface FolderState {
  verdict: LeaveOutVerdict;
  /** The verdict that leaves this folder, or one above it, out whole. */
  whole?: LeaveOutVerdict;
  files: () => FolderFiles;
  /**
   * How many folders of the path, from the top, end at the deepest that a person's own `!` kept, this one or one above
   * (0 for none). A `.tfignore` entry matches any folder of a path, as TFVC's does; a person who keeps a folder keeps
   * what it holds, so an entry no longer leaves a thing out by the name of that folder or one above it.
   */
  keptFrom: number;
}

/** The last matching pattern of one list, as git's `last_matching_pattern_from_list`. */
function lastMatching(patterns: readonly GitPattern[], path: string, isDir: boolean, ignoreCase: boolean): GitPattern | undefined {
  for (let i = patterns.length - 1; i >= 0; i--) if (gitMatches(patterns[i], path, isDir, ignoreCase)) return patterns[i];
  return undefined;
}

/** Whether a negation could name something inside `folder`, by what its pattern fixes of a path. */
function couldNameInside(pattern: GitPattern, folder: string, ignoreCase: boolean): boolean {
  if (pattern.noDir) return true;
  const fold = (text: string): string => (ignoreCase ? text.toLowerCase() : text);
  const inside = folder.split("/");
  const base = pattern.base === "" ? [] : pattern.base.split("/");
  const named = (pattern.pattern.startsWith("/") ? pattern.pattern.slice(1) : pattern.pattern).split("/");
  // A path inside the folder has more parts than the folder. The pattern must agree with each of the folder's parts,
  // its file's folder as written and its own parts as globs, and then name more parts, or any number with `**`.
  for (let i = 0; i < inside.length; i++) {
    if (i < base.length) {
      if (fold(base[i]) !== fold(inside[i])) return false;
      continue;
    }
    const part = named[i - base.length];
    if (part === undefined) return false;
    if (part.includes("**")) return true;
    if (!wildmatch(part, inside[i], true, ignoreCase)) return false;
  }
  return base.length + named.length > inside.length;
}

/** The decider for one listing's ignore files, evidence rules, person's patterns and the tool's own output. */
export function leaveOut(input: LeaveOutInput): LeaveOut {
  const ignoreCase = input.gitIgnoreCase === true;
  const byFolder = new Map<string, IgnoreFileText[]>();
  if (Array.isArray(input.ignoreFiles)) {
    for (const file of input.ignoreFiles as readonly IgnoreFileText[]) {
      const folder = folderOf(file.path);
      byFolder.set(folder, [...(byFolder.get(folder) ?? []), file]);
    }
  }
  const ignoreFilesIn = typeof input.ignoreFiles === "function" ? input.ignoreFiles : (folder: string) => byFolder.get(folder) ?? [];
  const person = gitPatterns((input.person ?? []).join("\n"), "");
  const evidence = input.evidence;
  const ownOutput = new Set((input.ownOutput ?? []).map((folder) => folder.toLowerCase()));
  const states = new Map<string, FolderState>();

  /** One path's verdict, its folder's state in hand. */
  const judge = (path: string, isDir: boolean, parent: FolderState): LeaveOutVerdict => {
    // A `.git` that is a file points a worktree or a submodule at its repository, and is the version control's too.
    if (VERSION_CONTROL.test(nameOf(path))) return { kept: false, rule: { kind: "version control", folder: path } };
    if (isDir && ownOutput.has(path.toLowerCase())) return { kept: false, rule: { kind: "own output", folder: path } };
    const own = lastMatching(person, path, isDir, true);
    if (own) return { kept: own.negative, rule: { kind: "person", index: own.line - 1, pattern: own.original } };
    let byGit: Opinion;
    for (let i = parent.files().git.length - 1; i >= 0 && !byGit; i--) {
      const pattern = lastMatching(parent.files().git[i].patterns, path, isDir, ignoreCase);
      if (pattern) byGit = { excluded: !pattern.negative, rule: { kind: "gitignore", file: parent.files().git[i].file, line: pattern.line, pattern: pattern.original } };
    }
    let byTf: Opinion;
    for (let i = parent.files().tf.length - 1; i >= 0 && !byTf; i--) {
      const entry = tfFileOpinion(parent.files().tf[i].entries, path, isDir, parent.keptFrom);
      if (entry) byTf = { excluded: entry.excluded, rule: { kind: "tfignore", file: parent.files().tf[i].file, line: entry.line, pattern: entry.original } };
    }
    if (byGit?.excluded) return { kept: false, rule: byGit.rule };
    if (byTf?.excluded) return { kept: false, rule: byTf.rule };
    let found: LeaveOutRule | undefined;
    if (evidence && isDir) {
      const index = EVIDENCE.findIndex((rule) => rule.name === nameOf(path).toLowerCase() && rule.holds(path, evidence.names));
      if (index !== -1) found = { kind: "evidence", index, pattern: EVIDENCE[index].pattern };
    }
    if (found && evidence?.apply) return { kept: false, rule: found };
    const kept: LeaveOutVerdict = byGit || byTf ? { kept: true, rule: (byGit ?? byTf)!.rule } : { kept: true };
    return found ? { ...kept, evidence: found } : kept;
  };

  /** The `!` lines at or above a folder left out whole that could have named something inside it. */
  const notesFor = (folder: string, parent: FolderState): string[] => {
    const notes: string[] = [];
    const say = (where: string, pattern: string) => notes.push(`${where}, \`${pattern}\`, may name files inside folders left out whole; they are not looked for`);
    for (const pattern of person) if (pattern.negative && couldNameInside(pattern, folder, true)) say(`the person's pattern ${pattern.line}`, pattern.original);
    for (const { file, patterns } of parent.files().git) for (const pattern of patterns) if (pattern.negative && couldNameInside(pattern, folder, ignoreCase)) say(`${file} line ${pattern.line}`, pattern.original);
    for (const { file, entries } of parent.files().tf) {
      for (const entry of entries) {
        if (entry.excluded) continue;
        const under = entry.folder === "" ? "" : `${entry.folder.toLowerCase()}/`;
        const at = `${folder.toLowerCase()}/`;
        if (under.startsWith(at) || (entry.recursive && at.startsWith(under))) say(`${file} line ${entry.line}`, entry.original);
      }
    }
    return notes;
  };

  /** A folder's own ignore files added to what it inherits. */
  const withOwnFiles = (folder: string, inherited: () => FolderFiles, verdict: LeaveOutVerdict, keptFrom: number): FolderState => {
    let known: FolderFiles | undefined;
    const files = (): FolderFiles => {
      if (known) return known;
      const above = inherited();
      const git = [...above.git];
      const tf = [...above.tf];
      for (const file of ignoreFilesIn(folder)) {
        const name = nameOf(file.path);
        if (name === ".gitignore") git.push({ file: file.path, patterns: gitPatterns(file.text, folder) });
        else if (name.toLowerCase() === ".tfignore") tf.push({ file: file.path, entries: tfEntries(file.text, folder) });
      }
      known = { git, tf };
      return known;
    };
    return { verdict, files, keptFrom };
  };

  const stateOf = (folder: string): FolderState => {
    const known = states.get(folder);
    if (known) return known;
    let state: FolderState;
    if (folder === "") {
      state = withOwnFiles("", () => ({ git: [], tf: [] }), { kept: true }, 0);
    } else {
      const parent = stateOf(folderOf(folder));
      if (parent.whole) {
        state = { ...parent, verdict: parent.whole };
      } else {
        const verdict = judge(folder, true, parent);
        if (verdict.kept) state = withOwnFiles(folder, parent.files, verdict, verdict.rule?.kind === "person" ? folder.split("/").length : parent.keptFrom);
        else {
          const notes = notesFor(folder, parent);
          const whole = notes.length > 0 ? { ...verdict, notes } : verdict;
          state = { ...parent, verdict: whole, whole };
        }
      }
    }
    states.set(folder, state);
    return state;
  };

  return {
    file: (path) => {
      const parent = stateOf(folderOf(path));
      return parent.whole ?? judge(path, false, parent);
    },
    folder: (path) => {
      const state = stateOf(path);
      if (state.whole) return { ...state.verdict, prunable: true, why: "a folder left out is left out whole: it is not entered, and nothing beneath it is looked for" };
      return { ...state.verdict, prunable: false, why: "the folder is kept" };
    }
  };
}
