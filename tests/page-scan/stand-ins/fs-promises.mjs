// Stands in for `node:fs/promises` in the scanning page: the same functions as `promises` of the stand-in for
// `node:fs`, over the same tree, counted under the same names.
import { promises } from "./fs.mjs";

export const { readFile, writeFile, stat, mkdir, readdir, rm, rmdir } = promises;
export default promises;
