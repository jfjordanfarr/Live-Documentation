// Stands in for `node:url` in the scanning page: a file URL made from a POSIX path, and the path read back from one, by
// Node's rules (lib/internal/url.js) over the browser's own `URL`.
import { counted } from "./calls.mjs";
import { rules } from "./path.mjs";

export const pathToFileURL = counted("url.pathToFileURL", (filepath) => {
  let resolved = rules.resolve(filepath);
  // `resolve` drops a trailing slash, which Node keeps.
  if (filepath.endsWith("/") && !resolved.endsWith("/")) resolved += "/";
  resolved = resolved.replace(/%/gu, "%25").replace(/\\/gu, "%5C").replace(/\n/gu, "%0A").replace(/\r/gu, "%0D").replace(/\t/gu, "%09");
  const url = new URL("file://");
  url.pathname = resolved.replace(/\?/gu, "%3F").replace(/#/gu, "%23");
  return url;
});

export const fileURLToPath = counted("url.fileURLToPath", (value) => {
  const url = typeof value === "string" ? new URL(value) : value;
  if (url.protocol !== "file:") throw Object.assign(new TypeError("The URL must be of scheme file"), { code: "ERR_INVALID_URL_SCHEME" });
  if (url.hostname !== "") throw Object.assign(new TypeError('File URL host must be "localhost" or empty on linux'), { code: "ERR_INVALID_FILE_URL_HOST" });
  if (/%2f/iu.test(url.pathname)) throw Object.assign(new TypeError("File URL path must not include encoded / characters"), { code: "ERR_INVALID_FILE_URL_PATH" });
  return decodeURIComponent(url.pathname);
});

export default { pathToFileURL, fileURLToPath };
