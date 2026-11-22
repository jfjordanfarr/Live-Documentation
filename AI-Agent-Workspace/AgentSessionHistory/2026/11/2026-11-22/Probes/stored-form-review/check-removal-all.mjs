// Probe of 2026-11-22 (not product code), the stored form's review: every refusal in the module taken out once, in a
// copy, and the package's unit and blind suites run against the copy. A refusal whose removal fails no case is a check
// with no case. The module itself is never touched: the copy lives in a folder of the repository's root that this
// script makes and removes, so that the copy's tests resolve the workspace's packages.
//
//   node <this folder>/check-removal-all.mjs <repository root> <out.json> [--fuzz <site,...>]
//
// With `--fuzz`, only the sites named are taken out, and the fuzzer's suite is run too.
import { execFile } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const [root, out, flag, fuzzSites] = process.argv.slice(2);
const withFuzz = flag === "--fuzz";
const work = path.join(root, ".review-check-removal");
const source = readFileSync(path.join(root, "packages/stored-form/src/storedForm.ts"), "utf8");

// Each `refuse(` but the function's own definition becomes `refuseAt(k, `; site k is skipped when it is disabled.
let k = 0;
const sites = [];
const lines = source.split("\n");
const instrumented = lines
  .map((line, i) =>
    line.includes("function refuse(")
      ? line
      : line.replace(/\brefuse\(/gu, () => {
          sites.push({ site: k, line: i + 1, text: line.trim().slice(0, 140) });
          return `refuseAt(${k++}, `;
        })
  )
  .join("\n")
  .replace(
    "function refuse(reason: string): never {",
    'const DISABLED = Number((globalThis as unknown as { process?: { env: Record<string, string | undefined> } }).process?.env.STORED_FORM_DISABLE ?? "-1");\nfunction refuseAt(k: number, reason: string): never {\n  if (k === DISABLED) return undefined as never;\n  throw new Refusal(reason);\n}\nfunction refuse(reason: string): never {'
  );

rmSync(work, { recursive: true, force: true });
mkdirSync(path.join(work, "src"), { recursive: true });
writeFileSync(path.join(work, "src/storedForm.ts"), instrumented);
cpSync(path.join(root, "packages/stored-form/test"), path.join(work, "test"), { recursive: true });
const suites = ["test/storedForm.test.ts", "test/storedForm.blind.test.ts", ...(withFuzz ? ["test/storedForm.fuzz.test.ts"] : [])];
writeFileSync(path.join(work, "vitest.config.mjs"), `export default { test: { globals: true, environment: "node", include: ${JSON.stringify(suites)}, testTimeout: 600000 } };\n`);

async function failures(disabled) {
  const report = path.join(work, `report-${disabled}.json`);
  try {
    await run("npx", ["vitest", "run", "--config", "vitest.config.mjs", "--reporter=json", `--outputFile=${report}`], { cwd: work, env: { ...process.env, STORED_FORM_DISABLE: String(disabled) }, maxBuffer: 1 << 26 });
  } catch {
    // A run with failures exits non-zero; the report says which.
  }
  const tests = JSON.parse(readFileSync(report, "utf8")).testResults.flatMap((r) => r.assertionResults);
  // The case that greps the module's source for `globalThis.` fails on every copy, since the copy reads its switch so.
  return tests.filter((t) => t.status !== "passed" && !t.title.includes("imports nothing")).map((t) => t.title);
}

const results = [];
try {
  const baseline = await failures(-1);
  if (baseline.length > 0) throw new Error(`the copy fails with nothing taken out: ${baseline.join("; ")}`);
  const chosen = withFuzz ? fuzzSites.split(",").map(Number) : sites.map((s) => s.site);
  const queue = [...chosen];
  const worker = async () => {
    for (let site = queue.shift(); site !== undefined; site = queue.shift()) {
      const failed = await failures(site);
      results.push({ ...sites[site], failed });
      process.stdout.write(`${site}${failed.length === 0 ? "!" : ""} `);
    }
  };
  await Promise.all([worker(), worker()]);
} finally {
  rmSync(work, { recursive: true, force: true });
}
results.sort((a, b) => a.site - b.site);
writeFileSync(out, `${JSON.stringify({ suites, sites: sites.length, unguarded: results.filter((r) => r.failed.length === 0).map((r) => r.site), results }, null, 1)}\n`);
console.log(`\n${results.filter((r) => r.failed.length === 0).length} of ${results.length} refusals taken out fail no case`);
