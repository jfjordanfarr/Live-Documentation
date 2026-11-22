// Counts the probes a scan makes (stat, access, readdir) and sorts each by what a listing of the kept files could answer:
// a kept file, a folder holding kept files, absent on the disk, or there on the disk but outside the listing (where an
// answer from the listing would differ from the disk's).
//   tsx --tsconfig tsconfig.base.json probes.mts <corpus> <label>
import { createRequire } from "node:module";
import path from "node:path";

const fsSync = createRequire(import.meta.url)("node:fs") as typeof import("node:fs");
const [corpus, label] = process.argv.slice(2);
const work = path.join(path.dirname(corpus), `probe-${label}`);
fsSync.rmSync(work, { recursive: true, force: true });
fsSync.cpSync(corpus, work, { recursive: true });

const probes: Array<{ call: string; file: string; stack: string }> = [];
const wrap = (owner: Record<string, (...args: unknown[]) => unknown>, name: string, call: string): void => {
  const original = owner[name];
  owner[name] = function (this: unknown, ...args: unknown[]) {
    const where = (new Error().stack ?? "").split("\n").slice(2).find((line) => /packages\/(engine|generator)\/src/u.test(line)) ?? "";
    probes.push({ call, file: path.resolve(String(args[0])), stack: (/packages\/((?:engine|generator)\/src\/[^:]+)/u.exec(where)?.[1]) ?? "?" });
    return original.apply(this, args);
  };
};
const promises = fsSync.promises as unknown as Record<string, (...args: unknown[]) => unknown>;
for (const name of ["stat", "access", "readdir", "lstat"]) wrap(promises, name, `promises.${name}`);
const sync = fsSync as unknown as Record<string, (...args: unknown[]) => unknown>;
for (const name of ["statSync", "lstatSync", "readdirSync"]) wrap(sync, name, name);

const { generateLiveDocs } = await import("@live-documentation/generator/generator");
const { discoverTargetFiles } = await import("@live-documentation/engine/live-docs/discovery");
const { normalizeLiveDocumentationConfig } = await import("@live-documentation/engine/config/liveDocumentationConfig");
const quiet = (): undefined => undefined;
const config = normalizeLiveDocumentationConfig();
const kept = new Set((await discoverTargetFiles({ workspaceRoot: work, config, include: new Set(), changedOnly: false })).map((file) => path.resolve(file)));
const folders = new Set<string>();
for (const file of kept) for (let at = path.dirname(file); at.startsWith(work); at = path.dirname(at)) folders.add(at);
probes.length = 0;
await generateLiveDocs({ workspaceRoot: work, now: () => new Date("2026-01-01T00:00:00.000Z"), logger: { info: quiet, warn: quiet, error: quiet } });

const docsRoot = path.join(work, config.root);
const sorts: Record<string, number> = {};
const outside: Record<string, number> = {};
const examples: Record<string, string[]> = {};
/** The probes outside the workspace, by call and module, which a listing of it never answers. */
const beyond: Record<string, number> = {};
for (const probe of probes) {
  let sort: string;
  if (!probe.file.startsWith(`${work}/`) && probe.file !== work) {
    sort = "outside the workspace";
    const key = `${probe.call} by ${probe.stack}`;
    beyond[key] = (beyond[key] ?? 0) + 1;
  }
  else if (probe.file.startsWith(`${docsRoot}/`) || probe.file === docsRoot) sort = "the docs root (the sink's)";
  else if (kept.has(probe.file)) sort = "a kept file";
  else if (folders.has(probe.file) || probe.file === work) sort = "a folder of kept files";
  else if (!fsSync.existsSync(probe.file)) sort = "absent on the disk";
  else {
    sort = "on the disk, outside the listing";
    const key = `${probe.call} by ${probe.stack}`;
    outside[key] = (outside[key] ?? 0) + 1;
    (examples[key] ??= []).length < 3 && examples[key].push(path.relative(work, probe.file));
  }
  sorts[sort] = (sorts[sort] ?? 0) + 1;
}
console.log(JSON.stringify({ label, kept: kept.size, probes: probes.length, sorts, outside, examples, beyond }, null, 1));
fsSync.rmSync(work, { recursive: true, force: true });
