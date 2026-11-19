// Scratch shim for the probe: `node:path` as POSIX, from pathe.
import * as pathe from "pathe";
const path = { ...pathe.posix, sep: "/", delimiter: ":", posix: pathe.posix, win32: pathe.win32 };
export default path;
export const { join, resolve, relative, dirname, basename, extname, normalize, isAbsolute, parse, format } = path;
export const sep = "/";
export const delimiter = ":";
export const posix = pathe.posix;
export const win32 = pathe.win32;
