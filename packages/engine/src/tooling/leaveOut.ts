/**
 * What a scan leaves out, decided on a folder's listing before anything is
 * read, by one list of patterns the person sees: the function both hosts
 * share, the command line over a disk and a page over a folder a person
 * picked. It reads nothing and imports nothing of Node: it is given the list's
 * text, whether its names match without regard to case, and the folders the
 * tool itself writes to, and answers for each path whether it is kept, or left
 * out and by which line of the list.
 *
 * @remarks
 * **The list is the truth.** It is read as one `.gitignore` at the top of the
 * scanned folder, by git's own rules, ported from git's `dir.c` and
 * `wildmatch.c` (git 2.56) and held to `git check-ignore` by
 * `leaveOut.oracle.test.ts`: `#` begins a comment; trailing spaces are dropped
 * unless escaped; `!` negates; a trailing `/` matches folders only; a pattern
 * with no other slash matches a name at any depth, any other is anchored at the
 * top; `*` and `?` stop at `/`, `**` crosses it at a segment's edge, `[...]`
 * is a class; the last matching line wins. **A folder left out is left out
 * whole**: it is not entered, and a `!` line keeps nothing beneath it ("It is
 * not possible to re-include a file if a parent directory of that file is
 * excluded"); where a `!` line could have named something there, the folder's
 * answer carries a note with the line. Two things stand outside the list,
 * shown and never scanned: a version control's own folder and the tool's own
 * output.
 *
 * **Ignore files are sources, taken into the list** when the person chooses
 * (the owner, 2026-11-21: "use (replace current ignore pattern in browser
 * window), integrate (add to current ignore pattern in browser window), or
 * ignore"). {@link fromGitignores} rewrites a folder's `.gitignore` files as
 * lines of the one list that decide as the files did in place, held to git by
 * `leaveOut.oracle.test.ts`; {@link fromTfignores} rewrites `.tfignore` files
 * by TFVC's rules as Microsoft's open-source client implements them, held to
 * that client's recorded verdicts by `leaveOut.tfvc.test.ts`. What a rewrite
 * cannot carry is said, never dropped in silence.
 *
 * **Proposals, never applied in silence.** {@link proposeLines} reads a
 * listing for what its folders are (build output beside a project file, NuGet's
 * packages, node's packages) and proposes lines naming them, for the person to
 * take into the list or not.
 *
 * Origin: the owner's ask of 2026-11-21 for "a good solid way to create ignore
 * patterns on what they scan, before they scan it", their model of that
 * evening ("The list the user sees for ignore patterns is the source of truth
 * for our software, and we can take that in from other ignore patterns as
 * needed"), and the design of one engine with two hosts
 * (`.mdmd/layer-3/engine-and-hosts.mdmd.md`).
 *
 * @module
 */

/** An ignore file the listing names, at its path relative to the scanned folder, with its text. */
export interface IgnoreFileText {
  path: string;
  text: string;
}

/** The line of the list that decided a path: its number from 1, and its text as written. */
export interface DecidingLine {
  number: number;
  text: string;
}

/**
 * The answer for one path: kept or left out; the line that decided, if one did (a kept path's line is a `!` that
 * re-included it); `fixed` where the path is a version control's own or the tool's own output, which no line can keep;
 * and, for a path left out with its folder, the `!` lines that could have named it.
 */
export interface LeaveOutVerdict {
  kept: boolean;
  line?: DecidingLine;
  fixed?: "version control" | "own output";
  notes?: string[];
}

/** The answer for a folder, and whether nothing beneath it can be kept, so that a walk need not go in. */
export interface FolderVerdict extends LeaveOutVerdict {
  prunable: boolean;
}

/** What decides a scan's leaving out. */
export interface LeaveOutInput {
  /** The list, in `.gitignore`'s syntax, as the person sees it. */
  list: string;
  /** Whether the list's names match without regard to case: the list's own setting. */
  ignoreCase: boolean;
  /** The folders the tool writes to, relative: never scanned. */
  ownOutput?: readonly string[];
}

/** The decider of one list: a file's verdict and a folder's, the folder's with whether a walk may leave it unlisted. */
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
// The decider: one list, read as one .gitignore at the top
// ---------------------------------------------------------------------------

const nameOf = (path: string): string => path.slice(path.lastIndexOf("/") + 1);

/** The last matching pattern of one list, as git's `last_matching_pattern_from_list`. */
function lastMatching(patterns: readonly GitPattern[], path: string, isDir: boolean, ignoreCase: boolean): GitPattern | undefined {
  for (let i = patterns.length - 1; i >= 0; i--) if (gitMatches(patterns[i], path, isDir, ignoreCase)) return patterns[i];
  return undefined;
}

/** Whether a negation could name something inside `folder`, part by part as git would match it. */
function couldNameInside(pattern: GitPattern, folder: string, ignoreCase: boolean): boolean {
  if (pattern.noDir) return true;
  const inside = folder.split("/");
  const named = (pattern.pattern.startsWith("/") ? pattern.pattern.slice(1) : pattern.pattern).split("/");
  // A path inside the folder has more parts than the folder. The pattern must agree with each of the folder's parts as
  // globs, and then name more parts, or any number with `**`.
  for (let i = 0; i < inside.length; i++) {
    const part = named[i];
    if (part === undefined) return false;
    if (part.includes("**")) return true;
    if (!wildmatch(part, inside[i], true, ignoreCase)) return false;
  }
  return named.length > inside.length;
}

/** The decider of one list. Each folder's answer is kept, so that a walk asks of each folder once, before going in. */
export function leaveOut(input: LeaveOutInput): LeaveOut {
  const patterns = gitPatterns(input.list, "");
  const ignoreCase = input.ignoreCase;
  const ownOutput = new Set((input.ownOutput ?? []).map((folder) => folder.toLowerCase()));
  const states = new Map<string, { verdict: LeaveOutVerdict; whole: boolean }>();

  const judge = (path: string, isDir: boolean): LeaveOutVerdict => {
    // A `.git` that is a file points a worktree or a submodule at its repository, and is the version control's too.
    if (VERSION_CONTROL.test(nameOf(path))) return { kept: false, fixed: "version control" };
    if (isDir && ownOutput.has(path.toLowerCase())) return { kept: false, fixed: "own output" };
    const pattern = lastMatching(patterns, path, isDir, ignoreCase);
    return pattern ? { kept: pattern.negative, line: { number: pattern.line, text: pattern.original } } : { kept: true };
  };

  const stateOf = (folder: string): { verdict: LeaveOutVerdict; whole: boolean } => {
    const known = states.get(folder);
    if (known) return known;
    let state: { verdict: LeaveOutVerdict; whole: boolean };
    if (folder === "") state = { verdict: { kept: true }, whole: false };
    else {
      const parent = stateOf(folderOf(folder));
      if (parent.whole) state = parent;
      else {
        const verdict = judge(folder, true);
        if (verdict.kept) state = { verdict, whole: false };
        else {
          const notes = verdict.fixed ? [] : patterns.filter((pattern) => pattern.negative && couldNameInside(pattern, folder, ignoreCase))
            .map((pattern) => `line ${pattern.line}, \`${pattern.original}\`, may name files inside folders left out whole; they are not looked for`);
          state = { verdict: notes.length > 0 ? { ...verdict, notes } : verdict, whole: true };
        }
      }
    }
    states.set(folder, state);
    return state;
  };

  return {
    file: (path) => {
      const parent = stateOf(folderOf(path));
      return parent.whole ? parent.verdict : judge(path, false);
    },
    folder: (path) => {
      const state = stateOf(path);
      return { ...state.verdict, prunable: state.whole };
    }
  };
}

// ---------------------------------------------------------------------------
// Taking ignore files into the one list
// ---------------------------------------------------------------------------

/** One kind of ignore file rewritten as lines of the one list, and what the rewrite could not carry. */
export interface TakenIn {
  /** The lines, each file's after a comment naming it, the shallowest file first so that a deeper file's line wins. */
  lines: string[];
  /** What the rewrite could not carry exactly, a sentence each, to be said where the lines are taken in. */
  differences: string[];
  /** Where each line came from, beside it: the file and its line, or nothing for a comment naming a file. */
  from: Array<{ file: string; line: number } | undefined>;
  /** Whether the lines decide as their files did only when the list's names match without regard to case. */
  needsIgnoreCase: boolean;
}

/** A folder's path written so that git's matcher reads each of its characters literally. */
const literal = (text: string): string => text.replace(/[\\*?[]/gu, (character) => `\\${character}`);

/** A line that would begin a comment or a negation, escaped so that it does neither. */
const asLine = (text: string): string => (text.startsWith("#") || text.startsWith("!") ? `\\${text}` : text);

const depthOf = (file: string): number => file.split("/").length;
const shallowFirst = (a: IgnoreFileText, b: IgnoreFileText): number => depthOf(a.path) - depthOf(b.path) || (a.path < b.path ? -1 : a.path > b.path ? 1 : 0);

/**
 * A folder's `.gitignore` files as lines of the one list that decide as the files did in place: each line of a file in
 * a folder below the top has that folder put in front (`docs/*.md` in `sub/` becomes `sub/docs/*.md`, a name alone
 * becomes `sub/**` and the name, so that it still matches at any depth below `sub`), anchoring and `!` and a trailing
 * `/` kept; the files go shallowest first, so that the last matching line is the deepest file's, as git asks the
 * deepest file first. Names match as the repository's `core.ignorecase` says, which the list's own setting must follow.
 */
export function fromGitignores(files: readonly IgnoreFileText[], listing?: { folders: readonly string[]; ignoreCase: boolean }): TakenIn {
  const lines: string[] = [];
  const from: TakenIn["from"] = [];
  const differences: string[] = [];
  for (const file of [...files].sort(shallowFirst)) {
    const base = folderOf(file.path);
    const patterns = gitPatterns(file.text, base);
    if (patterns.length === 0) continue;
    // The one difference a list cannot remove: in place a file speaks for its own folder alone, and a list whose names
    // match without regard to case reaches a folder spelled otherwise, which only a disk that tells case apart can hold.
    const twins = base !== "" && listing?.ignoreCase ? listing.folders.filter((folder) => folder !== base && folder.toLowerCase() === base.toLowerCase()) : [];
    if (twins.length > 0) differences.push(`${file.path} speaks in place for ${base}/ alone; in the list, whose names match without regard to case, its lines reach ${twins.map((twin) => `${twin}/`).join(", ")} as well.`);
    lines.push(`# ${file.path}`);
    from.push(undefined);
    for (const pattern of patterns) {
      from.push({ file: file.path, line: pattern.line });
      if (base === "") {
        lines.push(pattern.original);
        continue;
      }
      const body = pattern.noDir ? `${literal(base)}/**/${pattern.pattern}` : `${literal(base)}/${pattern.pattern.replace(/^\//u, "")}`;
      lines.push(`${pattern.negative ? `!${body}` : asLine(body)}${pattern.mustBeDir ? "/" : ""}`);
    }
  }
  return { lines, differences, from, needsIgnoreCase: false };
}

/**
 * A folder's `.tfignore` files as lines of the one list, by TFVC's rules as Team Explorer Everywhere reads them: `\`
 * becomes `/`; a leading separator, "this folder only", anchors the line at its file's folder (`/bin`), else the name
 * matches at any depth below it (`sub/**` and the name); a path before the name names a folder literally; only `*` and
 * `?` are wildcards, every other character is written literally. An exclusion in TFVC leaves out whatever lies
 * beneath a folder it names even where a `!` keeps the folder itself, so where any file has a `!`, each exclusion is
 * followed by the same line with `/**`. Names match without regard to case, so the list must too.
 */
export function fromTfignores(files: readonly IgnoreFileText[]): TakenIn {
  const lines: string[] = [];
  const from: TakenIn["from"] = [];
  const differences: string[] = [];
  const read = [...files].sort(shallowFirst).map((file) => ({ file, entries: tfEntries(file.text, folderOf(file.path)) }));
  const anyNegation = read.some(({ entries }) => entries.some((entry) => !entry.excluded));
  for (const { file, entries } of read) {
    if (entries.length === 0) continue;
    lines.push(`# ${file.path}`);
    from.push(undefined);
    for (const entry of entries) {
      const wild = (text: string): string => text.replace(/[\\[]/gu, (character) => `\\${character}`);
      const name = entry.shape === "endsWith" ? `*${literal(entry.name)}` : entry.shape === "startsWith" ? `${literal(entry.name)}*` : entry.shape === "complex" ? wild(entry.name) : literal(entry.name);
      if (entry.shape === "complex" && entry.name.endsWith(".")) {
        differences.push(`${file.path} line ${entry.line}, \`${entry.original}\`: TFVC lets a final "." match a name with no extension; the list's line does not.`);
      }
      const folder = entry.folder === "" ? "" : `${literal(entry.folder)}/`;
      const body = entry.recursive ? (folder === "" ? name : `${folder}**/${name}`) : `/${folder}${name}`;
      const line = `${entry.excluded ? asLine(body) : `!${body}`}${entry.folderOnly ? "/" : ""}`;
      lines.push(line);
      from.push({ file: file.path, line: entry.line });
      if (entry.excluded && anyNegation) {
        lines.push(`${entry.folderOnly ? line.slice(0, -1) : line}/**`);
        from.push({ file: file.path, line: entry.line });
      }
    }
  }
  return { lines, differences, from, needsIgnoreCase: true };
}

// ---------------------------------------------------------------------------
// Lines proposed from what the folders hold
// ---------------------------------------------------------------------------

/** A line proposed for the list, the rule of what the folders are that proposed it, and the folders it names. */
export interface ProposedLine {
  line: string;
  rule: string;
  folders: string[];
}

/**
 * Lines naming the folders a listing shows to be build output or packages, by the evidence rules, for the person to
 * take into the list or not. A name alone (`bin/`) is proposed only where it leaves out no folder of that name that
 * the exact lines would keep, and, for a list that matches case, only where every such folder is spelled alike; else
 * one anchored line a folder (`/src/App/bin/`). A folder inside another proposed folder is not named again.
 */
export function proposeLines(folders: readonly string[], names: (folder: string) => readonly string[], ignoreCase: boolean): ProposedLine[] {
  const found = EVIDENCE.map((rule) => ({ rule, named: folders.filter((folder) => nameOf(folder).toLowerCase() === rule.name), recognised: [] as string[] }));
  for (const each of found) each.recognised = each.named.filter((folder) => each.rule.holds(folder, names));
  const all = found.flatMap((each) => each.recognised);
  const inside = (folder: string): boolean => all.some((other) => other !== folder && folder.toLowerCase().startsWith(`${other.toLowerCase()}/`));
  const proposed: ProposedLine[] = [];
  for (const { rule, named, recognised } of found) {
    const outer = recognised.filter((folder) => !inside(folder));
    if (outer.length === 0) continue;
    const spellings = new Set(outer.map(nameOf));
    const keptByExact = named.filter((folder) => !recognised.includes(folder) && !inside(folder));
    if (keptByExact.length === 0 && (ignoreCase || spellings.size === 1)) proposed.push({ line: `${[...spellings][0]}/`, rule: rule.pattern, folders: outer });
    else for (const folder of outer) proposed.push({ line: `/${literal(folder)}/`, rule: rule.pattern, folders: [folder] });
  }
  return proposed;
}
