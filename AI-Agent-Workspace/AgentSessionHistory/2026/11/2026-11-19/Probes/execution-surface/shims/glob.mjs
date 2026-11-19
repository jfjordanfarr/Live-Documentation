// Scratch shim for the probe: `glob` answered from the in-memory tree by minimatch, the same matcher glob uses.
import { minimatch } from "minimatch";
import { listFiles } from "./fs.mjs";

export async function glob(patterns, options = {}) {
  const list = Array.isArray(patterns) ? patterns : [patterns];
  const cwd = (options.cwd ?? "/").replace(/\\/g, "/").replace(/\/$/, "");
  const prefix = cwd + "/";
  const ignore = Array.isArray(options.ignore) ? options.ignore : options.ignore ? [options.ignore] : [];
  const mm = { dot: !!options.dot, windowsPathsNoEscape: !!options.windowsPathsNoEscape };
  const out = [];
  for (const full of listFiles()) {
    if (!full.startsWith(prefix)) continue;
    const rel = full.slice(prefix.length);
    if (!list.some((p) => minimatch(rel, p, mm))) continue;
    if (ignore.some((p) => minimatch(rel, p, { ...mm, dot: true }))) continue;
    out.push(rel);
  }
  if (options.withFileTypes) {
    return out.map((rel) => ({ fullpath: () => prefix + rel, relative: () => rel, isSymbolicLink: () => false, isFile: () => true, isDirectory: () => false, name: rel.split("/").pop() }));
  }
  return options.absolute ? out.map((rel) => prefix + rel) : out;
}
export default { glob };
