// Imitates how NTFS looks a name up: a path that does not exist as spelled is found in any case, while the caller keeps
// the spelling it asked for. Only paths under FOLD_ROOT are folded, so that the tool's own files load as ever.
// Directory listings are untouched: they give names as stored, as NTFS does.
const fs = require("node:fs");
const path = require("node:path");

const root = process.env.FOLD_ROOT && path.resolve(process.env.FOLD_ROOT);
const realExists = fs.existsSync.bind(fs);
const realReaddir = fs.readdirSync.bind(fs);

function fold(candidate) {
  if (!root || typeof candidate !== "string") return candidate;
  const absolute = path.resolve(candidate);
  if (!absolute.toLowerCase().startsWith(root.toLowerCase()) || realExists(absolute)) return candidate;
  let current = path.parse(absolute).root;
  for (const part of absolute.slice(current.length).split(path.sep).filter(Boolean)) {
    let names;
    try {
      names = realReaddir(current);
    } catch {
      return candidate;
    }
    const hit = names.find((name) => name === part) ?? names.find((name) => name.toLowerCase() === part.toLowerCase());
    if (hit === undefined) return candidate;
    current = path.join(current, hit);
  }
  return current;
}

const wrap = (target, name) => {
  const original = target[name];
  if (typeof original !== "function") return;
  target[name] = function folded(first, ...rest) {
    return original.call(this, fold(first), ...rest);
  };
};

for (const name of ["existsSync", "statSync", "lstatSync", "accessSync", "readFileSync", "openSync", "stat", "lstat", "access", "readFile", "open", "realpathSync"]) wrap(fs, name);
for (const name of ["stat", "lstat", "access", "readFile", "open", "realpath"]) wrap(fs.promises, name);
