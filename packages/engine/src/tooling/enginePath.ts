/**
 * Pure engine path arithmetic with zero Node imports (Step 9 of `.mdmd/layer-3/engine-and-hosts.mdmd.md`).
 *
 * @remarks
 * Implements the POSIX path rules used across the engine and generator (`basename`, `dirname`, `extname`,
 * `isAbsolute`, `join`, `normalize`, `relative`, `resolve`, `sep`, and `posix`) so the browser scanning page needs
 * no `node:path` stand-in, while also handling Windows drive-letter (`C:\work\Shop`, `C:/work/Shop`) and UNC
 * (`\\server\share\...`) workspace paths on the top-level functions so Node runs on Windows work identically.
 *
 * The `posix` namespace is strictly POSIX and never translates backslashes, matching `node:path.posix`.
 *
 * @module
 */

const SLASH = 47; // '/'
const DOT = 46; // '.'

const WINDOWS_DRIVE_PREFIX = /^[A-Za-z]:(?:[\\/]|$)/u;
const WINDOWS_ABSOLUTE_DRIVE = /^[A-Za-z]:[\\/]/u;
const WINDOWS_UNC_BACKSLASH = /^\\\\[^\\/]+[\\/][^\\/]+/u;
const WINDOWS_UNC_SLASH = /^\/\/[^/]+\/[^/]+/u;

function checkString(value: unknown, name: string): asserts value is string {
  if (typeof value !== "string") {
    throw new TypeError(`The "${name}" argument must be of type string. Received ${typeof value}`);
  }
}

function hasWindowsPrefix(value: string): boolean {
  return WINDOWS_DRIVE_PREFIX.test(value) || WINDOWS_UNC_BACKSLASH.test(value);
}

/** Resolves `.` and `..` segments of a POSIX path without its leading root, matching Node's `normalizeString`. */
function normalizeStringPosix(path: string, allowAboveRoot: boolean): string {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let code = 0;
  for (let i = 0; i <= path.length; ++i) {
    if (i < path.length) code = path.charCodeAt(i);
    else if (code === SLASH) break;
    else code = SLASH;
    if (code === SLASH) {
      if (lastSlash === i - 1 || dots === 1) {
        // Empty segment or `.`: nothing to emit.
      } else if (dots === 2) {
        if (
          res.length < 2 ||
          lastSegmentLength !== 2 ||
          res.charCodeAt(res.length - 1) !== DOT ||
          res.charCodeAt(res.length - 2) !== DOT
        ) {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = i;
            dots = 0;
            continue;
          } else if (res.length !== 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) res += `/${path.slice(lastSlash + 1, i)}`;
        else res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === DOT && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function posixResolve(...args: string[]): string {
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    const segment = i >= 0 ? args[i] : "/";
    checkString(segment, `paths[${i}]`);
    if (segment.length === 0) continue;
    resolvedPath = `${segment}/${resolvedPath}`;
    resolvedAbsolute = segment.charCodeAt(0) === SLASH;
  }
  resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute) return `/${resolvedPath}`;
  return resolvedPath.length > 0 ? resolvedPath : ".";
}

function posixNormalize(path: string): string {
  checkString(path, "path");
  if (path.length === 0) return ".";
  const absolute = path.charCodeAt(0) === SLASH;
  const trailingSeparator = path.charCodeAt(path.length - 1) === SLASH;
  let normalized = normalizeStringPosix(path, !absolute);
  if (normalized.length === 0) {
    if (absolute) return "/";
    return trailingSeparator ? "./" : ".";
  }
  if (trailingSeparator) normalized += "/";
  return absolute ? `/${normalized}` : normalized;
}

function posixIsAbsolute(path: string): boolean {
  checkString(path, "path");
  return path.length > 0 && path.charCodeAt(0) === SLASH;
}

function posixJoin(...args: string[]): string {
  if (args.length === 0) return ".";
  const parts: string[] = [];
  for (const arg of args) {
    checkString(arg, "path");
    if (arg.length > 0) parts.push(arg);
  }
  if (parts.length === 0) return ".";
  return posixNormalize(parts.join("/"));
}

function posixRelative(from: string, to: string): string {
  checkString(from, "from");
  checkString(to, "to");
  if (from === to) return "";
  const resolvedFrom = posixResolve(from);
  const resolvedTo = posixResolve(to);
  if (resolvedFrom === resolvedTo) return "";
  const fromStart = 1;
  const fromEnd = resolvedFrom.length;
  const fromLen = fromEnd - fromStart;
  const toStart = 1;
  const toLen = resolvedTo.length - toStart;
  const length = fromLen < toLen ? fromLen : toLen;
  let lastCommonSep = -1;
  let i = 0;
  for (; i < length; i++) {
    const fromCode = resolvedFrom.charCodeAt(fromStart + i);
    if (fromCode !== resolvedTo.charCodeAt(toStart + i)) break;
    else if (fromCode === SLASH) lastCommonSep = i;
  }
  if (i === length) {
    if (toLen > length) {
      if (resolvedTo.charCodeAt(toStart + i) === SLASH) return resolvedTo.slice(toStart + i + 1);
      if (i === 0) return resolvedTo.slice(toStart + i);
    } else if (fromLen > length) {
      if (resolvedFrom.charCodeAt(fromStart + i) === SLASH) lastCommonSep = i;
      else if (i === 0) lastCommonSep = 0;
    }
  }
  let out = "";
  for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
    if (i === fromEnd || resolvedFrom.charCodeAt(i) === SLASH) out += out.length === 0 ? ".." : "/..";
  }
  return `${out}${resolvedTo.slice(toStart + lastCommonSep)}`;
}

function posixDirname(path: string): string {
  checkString(path, "path");
  if (path.length === 0) return ".";
  const hasRoot = path.charCodeAt(0) === SLASH;
  let end = -1;
  let matchedSlash = true;
  for (let i = path.length - 1; i >= 1; --i) {
    if (path.charCodeAt(i) === SLASH) {
      if (!matchedSlash) {
        end = i;
        break;
      }
    } else {
      matchedSlash = false;
    }
  }
  if (end === -1) return hasRoot ? "/" : ".";
  if (hasRoot && end === 1) return "//";
  return path.slice(0, end);
}

function posixBasename(path: string, suffix?: string): string {
  if (suffix !== undefined) checkString(suffix, "suffix");
  checkString(path, "path");
  let start = 0;
  let end = -1;
  let matchedSlash = true;
  if (suffix !== undefined && suffix.length > 0 && suffix.length <= path.length) {
    if (suffix === path) return "";
    let extIdx = suffix.length - 1;
    let firstNonSlashEnd = -1;
    for (let i = path.length - 1; i >= 0; --i) {
      const code = path.charCodeAt(i);
      if (code === SLASH) {
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else {
        if (firstNonSlashEnd === -1) {
          matchedSlash = false;
          firstNonSlashEnd = i + 1;
        }
        if (extIdx >= 0) {
          if (code === suffix.charCodeAt(extIdx)) {
            if (--extIdx === -1) end = i;
          } else {
            extIdx = -1;
            end = firstNonSlashEnd;
          }
        }
      }
    }
    if (start === end) end = firstNonSlashEnd;
    else if (end === -1) end = path.length;
    return path.slice(start, end);
  }
  for (let i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === SLASH) {
      if (!matchedSlash) {
        start = i + 1;
        break;
      }
    } else if (end === -1) {
      matchedSlash = false;
      end = i + 1;
    }
  }
  if (end === -1) return "";
  return path.slice(start, end);
}

function posixExtname(path: string): string {
  checkString(path, "path");
  let startDot = -1;
  let startPart = 0;
  let end = -1;
  let matchedSlash = true;
  let preDotState = 0;
  for (let i = path.length - 1; i >= 0; --i) {
    const code = path.charCodeAt(i);
    if (code === SLASH) {
      if (!matchedSlash) {
        startPart = i + 1;
        break;
      }
      continue;
    }
    if (end === -1) {
      matchedSlash = false;
      end = i + 1;
    }
    if (code === DOT) {
      if (startDot === -1) startDot = i;
      else if (preDotState !== 1) preDotState = 1;
    } else if (startDot !== -1) {
      preDotState = -1;
    }
  }
  if (
    startDot === -1 ||
    end === -1 ||
    preDotState === 0 ||
    (preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)
  ) {
    return "";
  }
  return path.slice(startDot, end);
}

/** Splits a Windows drive (`C:/...`) or UNC (`//server/share/...`) root from a slash-normalized path. */
function splitWindowsRoot(slashed: string): { root: string; rest: string; absolute: boolean } | undefined {
  if (WINDOWS_DRIVE_PREFIX.test(slashed)) {
    const drive = slashed.slice(0, 2);
    const rest = slashed.slice(2);
    return { root: drive, rest, absolute: rest.startsWith("/") };
  }
  const unc = WINDOWS_UNC_SLASH.exec(slashed);
  if (unc) {
    return { root: unc[0], rest: slashed.slice(unc[0].length) || "/", absolute: true };
  }
  return undefined;
}

/** Path separator used throughout the engine (`"/"`). */
export const sep = "/";

/** Returns whether `path` is absolute (POSIX leading `/` or Windows drive/UNC root). */
export function isAbsolute(path: string): boolean {
  checkString(path, "path");
  if (path.length === 0) return false;
  return path.charCodeAt(0) === SLASH || WINDOWS_ABSOLUTE_DRIVE.test(path) || WINDOWS_UNC_BACKSLASH.test(path);
}

/** Normalises a slash-form path already known to carry a Windows drive or UNC prefix. */
function normalizeWindowsSlashed(slashed: string): string {
  const split = splitWindowsRoot(slashed);
  if (!split) return posixNormalize(slashed);
  if (split.rest.length === 0) return `${split.root}.`;
  const normalizedRest = posixNormalize(split.rest);
  if (split.root.startsWith("//")) {
    return normalizedRest === "/" ? `${split.root}/` : `${split.root}${normalizedRest}`;
  }
  return `${split.root}${normalizedRest}`;
}

/** Normalises `.` and `..` segments, preserving POSIX roots as well as Windows drive or UNC roots. */
export function normalize(path: string): string {
  checkString(path, "path");
  if (!hasWindowsPrefix(path)) return posixNormalize(path);
  return normalizeWindowsSlashed(path.replace(/\\/gu, "/"));
}

/** Joins path segments with `"/"` and normalises the result, preserving Windows drive/UNC prefixes when present. */
export function join(...args: string[]): string {
  if (args.length === 0) return ".";
  let windows = false;
  const parts: string[] = [];
  for (const arg of args) {
    checkString(arg, "path");
    if (arg.length > 0) {
      if (!windows && hasWindowsPrefix(arg)) windows = true;
      parts.push(arg);
    }
  }
  if (parts.length === 0) return ".";
  if (!windows) return posixNormalize(parts.join("/"));
  return normalizeWindowsSlashed(parts.map((part) => part.replace(/\\/gu, "/")).join("/"));
}

/** Resolves a sequence of paths into an absolute path (using `"/"` as root when no argument is absolute). */
export function resolve(...args: string[]): string {
  for (let i = 0; i < args.length; i++) {
    checkString(args[i], `paths[${i}]`);
  }
  let resolvedPath = "";
  let resolvedRoot = "";
  let resolvedAbsolute = false;
  let windows = false;

  for (let i = args.length - 1; i >= 0 && !resolvedAbsolute; i--) {
    const raw = args[i];
    if (raw.length === 0) continue;
    const isWin = hasWindowsPrefix(raw);
    if (isWin) windows = true;
    const segment = windows || isWin ? raw.replace(/\\/gu, "/") : raw;
    const split = isWin ? splitWindowsRoot(segment) : undefined;
    if (split) {
      resolvedPath = resolvedPath.length > 0 ? `${split.rest}/${resolvedPath}` : split.rest;
      resolvedRoot = split.root;
      if (split.absolute) {
        resolvedAbsolute = true;
      }
      continue;
    }
    resolvedPath = resolvedPath.length > 0 ? `${segment}/${resolvedPath}` : segment;
    if (segment.charCodeAt(0) === SLASH) {
      resolvedAbsolute = true;
    }
  }

  if (resolvedRoot) {
    if (windows) resolvedPath = resolvedPath.replace(/\\/gu, "/");
    const body = normalizeStringPosix(resolvedPath, !resolvedAbsolute);
    if (resolvedAbsolute) {
      return `${resolvedRoot}/${body}`;
    }
    return body.length > 0 ? `${resolvedRoot}${body}` : `${resolvedRoot}.`;
  }

  if (!resolvedAbsolute) {
    // No absolute segment was passed: anchor at `"/"`, matching the scanning page's POSIX root.
    resolvedAbsolute = true;
  }
  if (windows) resolvedPath = resolvedPath.replace(/\\/gu, "/");
  const normalized = normalizeStringPosix(resolvedPath, !resolvedAbsolute);
  return `/${normalized}`;
}

/** Computes the relative path from `from` to `to`, handling both POSIX and Windows drive/UNC roots. */
export function relative(from: string, to: string): string {
  checkString(from, "from");
  checkString(to, "to");
  if (from === to) return "";
  const resolvedFrom = resolve(from);
  const resolvedTo = resolve(to);
  if (resolvedFrom === resolvedTo) return "";

  const winFrom = splitWindowsRoot(resolvedFrom);
  const winTo = splitWindowsRoot(resolvedTo);

  if (winFrom || winTo) {
    if (!winFrom || !winTo) return resolvedTo;
    if (winFrom.root.toLowerCase() !== winTo.root.toLowerCase()) return resolvedTo;
    return posixRelative(winFrom.rest || "/", winTo.rest || "/");
  }
  return posixRelative(resolvedFrom, resolvedTo);
}

/** Returns the directory name of `path`. */
export function dirname(path: string): string {
  checkString(path, "path");
  if (!hasWindowsPrefix(path)) return posixDirname(path);
  const slashed = path.replace(/\\/gu, "/");
  const split = splitWindowsRoot(slashed);
  if (!split) return posixDirname(slashed);
  if (split.rest.length === 0) return `${split.root}.`;
  const dir = posixDirname(split.rest);
  if (split.root.startsWith("//")) {
    return dir === "/" ? `${split.root}/` : `${split.root}${dir}`;
  }
  return `${split.root}${dir}`;
}

/** Returns the last segment of `path`, optionally stripping a trailing `suffix`. */
export function basename(path: string, suffix?: string): string {
  if (suffix !== undefined) checkString(suffix, "suffix");
  checkString(path, "path");
  if (!hasWindowsPrefix(path)) return posixBasename(path, suffix);
  const slashed = path.replace(/\\/gu, "/");
  const split = splitWindowsRoot(slashed);
  if (!split) return posixBasename(slashed, suffix);
  return posixBasename(split.rest, suffix);
}

/** Returns the extension of `path` (from the last `.` in the final segment to end of string). */
export function extname(path: string): string {
  checkString(path, "path");
  if (!hasWindowsPrefix(path)) return posixExtname(path);
  const slashed = path.replace(/\\/gu, "/");
  const split = splitWindowsRoot(slashed);
  if (!split) return posixExtname(slashed);
  return posixExtname(split.rest);
}

/** Strict POSIX path functions, matching `node:path.posix`. */
export interface EnginePosixPath {
  readonly sep: string;
  readonly basename: typeof posixBasename;
  readonly dirname: typeof posixDirname;
  readonly extname: typeof posixExtname;
  readonly isAbsolute: typeof posixIsAbsolute;
  readonly join: typeof posixJoin;
  readonly normalize: typeof posixNormalize;
  readonly relative: typeof posixRelative;
  readonly resolve: typeof posixResolve;
  readonly posix: EnginePosixPath;
}

const posixApi: {
  sep: string;
  basename: typeof posixBasename;
  dirname: typeof posixDirname;
  extname: typeof posixExtname;
  isAbsolute: typeof posixIsAbsolute;
  join: typeof posixJoin;
  normalize: typeof posixNormalize;
  relative: typeof posixRelative;
  resolve: typeof posixResolve;
  posix?: EnginePosixPath;
} = {
  sep,
  basename: posixBasename,
  dirname: posixDirname,
  extname: posixExtname,
  isAbsolute: posixIsAbsolute,
  join: posixJoin,
  normalize: posixNormalize,
  relative: posixRelative,
  resolve: posixResolve
};
posixApi.posix = posixApi as EnginePosixPath;

/** Strict POSIX path namespace (`node:path.posix` equivalent). */
export const posix: EnginePosixPath = posixApi as EnginePosixPath;

/** Default export matching `import path from "node:path"` across the engine and generator core. */
const enginePath = {
  sep,
  basename,
  dirname,
  extname,
  isAbsolute,
  join,
  normalize,
  relative,
  resolve,
  posix
};

export default enginePath;
