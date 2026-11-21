// Stands in for `node:path` in the scanning page: Node's POSIX rules, as Node itself writes them (lib/path.js), for the
// functions the scan calls. A page has no working directory, so a relative path resolves against `/`. Only what the
// scan's path calls is here; `node-needs.json` lists it, and its test holds this module to that list.
import { counted } from "./calls.mjs";

const SLASH = 47;
const DOT = 46;

function checkString(value, name) {
  if (typeof value !== "string") throw new TypeError(`The "${name}" argument must be of type string. Received ${typeof value}`);
}

/** Resolves `.` and `..` segments of a path without its root, as Node's `normalizeString` does for POSIX. */
function normalizeString(path, allowAboveRoot) {
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
        // An empty segment or `.`: nothing to add.
      } else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== DOT || res.charCodeAt(res.length - 2) !== DOT) {
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

function resolveRule(...args) {
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    const path = i >= 0 ? args[i] : "/";
    checkString(path, `paths[${i}]`);
    if (path.length === 0) continue;
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = path.charCodeAt(0) === SLASH;
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute) return `/${resolvedPath}`;
  return resolvedPath.length > 0 ? resolvedPath : ".";
}

function normalizeRule(path) {
  checkString(path, "path");
  if (path.length === 0) return ".";
  const absolute = path.charCodeAt(0) === SLASH;
  const trailingSeparator = path.charCodeAt(path.length - 1) === SLASH;
  let normalized = normalizeString(path, !absolute);
  if (normalized.length === 0) {
    if (absolute) return "/";
    return trailingSeparator ? "./" : ".";
  }
  if (trailingSeparator) normalized += "/";
  return absolute ? `/${normalized}` : normalized;
}

function isAbsoluteRule(path) {
  checkString(path, "path");
  return path.length > 0 && path.charCodeAt(0) === SLASH;
}

function joinRule(...args) {
  if (args.length === 0) return ".";
  const parts = [];
  for (const arg of args) {
    checkString(arg, "path");
    if (arg.length > 0) parts.push(arg);
  }
  if (parts.length === 0) return ".";
  return normalizeRule(parts.join("/"));
}

function relativeRule(from, to) {
  checkString(from, "from");
  checkString(to, "to");
  if (from === to) return "";
  from = resolveRule(from);
  to = resolveRule(to);
  if (from === to) return "";
  const fromStart = 1;
  const fromEnd = from.length;
  const fromLen = fromEnd - fromStart;
  const toStart = 1;
  const toLen = to.length - toStart;
  const length = fromLen < toLen ? fromLen : toLen;
  let lastCommonSep = -1;
  let i = 0;
  for (; i < length; i++) {
    const fromCode = from.charCodeAt(fromStart + i);
    if (fromCode !== to.charCodeAt(toStart + i)) break;
    else if (fromCode === SLASH) lastCommonSep = i;
  }
  if (i === length) {
    if (toLen > length) {
      // `from` is the exact base of `to`, or the root.
      if (to.charCodeAt(toStart + i) === SLASH) return to.slice(toStart + i + 1);
      if (i === 0) return to.slice(toStart + i);
    } else if (fromLen > length) {
      // `to` is the exact base of `from`, or the root.
      if (from.charCodeAt(fromStart + i) === SLASH) lastCommonSep = i;
      else if (i === 0) lastCommonSep = 0;
    }
  }
  let out = "";
  for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
    if (i === fromEnd || from.charCodeAt(i) === SLASH) out += out.length === 0 ? ".." : "/..";
  }
  return `${out}${to.slice(toStart + lastCommonSep)}`;
}

function dirnameRule(path) {
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

function basenameRule(path, suffix) {
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

function extnameRule(path) {
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
  if (startDot === -1 || end === -1 || preDotState === 0 || (preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)) return "";
  return path.slice(startDot, end);
}

/** The rules uncounted, for the other stand-ins' own use, so that the tally holds only the scan's calls. */
export const rules = {
  resolve: resolveRule, normalize: normalizeRule, isAbsolute: isAbsoluteRule, join: joinRule, relative: relativeRule,
  dirname: dirnameRule, basename: basenameRule, extname: extnameRule
};

export const resolve = counted("path.resolve", resolveRule);
export const normalize = counted("path.normalize", normalizeRule);
export const isAbsolute = counted("path.isAbsolute", isAbsoluteRule);
export const join = counted("path.join", joinRule);
export const relative = counted("path.relative", relativeRule);
export const dirname = counted("path.dirname", dirnameRule);
export const basename = counted("path.basename", basenameRule);
export const extname = counted("path.extname", extnameRule);
export const sep = "/";

/** The module as a default import sees it; `posix` is the same module, as on Linux. */
const path = { resolve, normalize, isAbsolute, join, relative, dirname, basename, extname, sep };
path.posix = path;
export const posix = path;
export default path;
