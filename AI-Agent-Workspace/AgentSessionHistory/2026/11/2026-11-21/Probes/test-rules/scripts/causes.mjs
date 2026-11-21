// Classes each disagreement between today's archetype and a reading of "test" by its observable cause.
// Usage: node causes.mjs <measurement.tsv> <column: runner|forTests> [--rows]
import fs from "node:fs";
import path from "node:path";

const [file, column, flag] = process.argv.slice(2);
const lines = fs.readFileSync(file, "utf8").trim().split("\n");
const head = lines[0].split("\t");
const col = head.indexOf(column);
const TEST_FOLDER = /^(?:test|tests|spec|__tests__|__node_tests__|__mocks__|__snapshots__|testdata)$/i;
const inTestFolder = rel => rel.split("/").slice(0, -1).some(s => TEST_FOLDER.test(s)) || /(?:^|\/)src\/test\//.test(rel);
const NAME_RULES = [
  [/\.(test|spec)\.[^.]+$/, "name.test.ext / name.spec.ext"],
  [/_test\.[^.]+$/, "name_test.ext"],
  [/^test_[^.]+\.[^.]+$/, "test_name.ext"],
  [/Tests?\.[^.]+$/, "NameTest.ext / NameTests.ext"],
  [/_spec\.[^.]+$/, "name_spec.ext"],
  [/\.Tests?\.ps1$/i, "Name.Tests.ps1 / Name.Test.ps1"]
];
const nameRule = rel => NAME_RULES.find(([re]) => re.test(path.posix.basename(rel)))?.[1];

function cause(lang, rel, today, other) {
  const code = !lang.startsWith("other");
  if (today === "test") {
    if (inTestFolder(rel)) return code ? "code in a test folder that the runner does not select (helpers, stand-ins, setup, configuration)" : "data, expectations or configuration in a test folder";
    const rule = nameRule(rel);
    if (rule) return `named by today's rule ${rule}, which this language's runner does not hold or this project does not run`;
    if (/\btests?\b|__tests__/i.test(path.posix.dirname(rel))) return "a folder whose name holds the word test (TestUtil, Tests.SA, Foo.Tests) but which no runner names";
    if (/\btests?\b/i.test(path.posix.basename(rel))) return "the word test in the file's own name (test-utils, test.js, Test-Thing)";
    if (/\bspec\b/.test(rel)) return "Ruby: the word spec in the path";
    return "other";
  }
  if (lang === "C#") return ".NET: a file of a test project holding tests, its name without Test";
  if (lang === "Rust") return "Rust: a module compiled only for tests, its name without _test";
  if (lang === "PowerShell") return "PowerShell: a file the project's own Pester run names";
  if (lang === "TypeScript/JavaScript") return "JavaScript: the project's own runner configuration (testMatch)";
  if (lang === "SQL") return "tSQLt: a test class's procedures in a file not named for tests";
  return `${lang}: other`;
}

const byCause = new Map();
const byLang = new Map();
const byCorpus = new Map();
const rows = [];
for (const line of lines.slice(1)) {
  const f = line.split("\t");
  const [corpus, lang, rel, today] = f;
  const other = f[col];
  if (other === "no runner measured" || other === today) continue;
  const c = `${today} where ${column} says ${other}: ${cause(lang, rel, today, other)}`;
  const key = `${lang}\t${c}`;
  byCause.set(key, (byCause.get(key) ?? 0) + 1);
  byLang.set(lang, (byLang.get(lang) ?? 0) + 1);
  byCorpus.set(corpus, (byCorpus.get(corpus) ?? 0) + 1);
  rows.push([corpus, lang, rel, today, other, c].join("\t"));
}
if (flag === "--rows") { console.log(rows.join("\n")); process.exit(0); }
console.log("By language and cause:");
for (const [k, v] of [...byCause].sort((a, b) => a[0].localeCompare(b[0]))) console.log(`${String(v).padStart(5)}  ${k}`);
console.log("\nBy language:");
for (const [k, v] of [...byLang].sort((a, b) => b[1] - a[1])) console.log(`${String(v).padStart(5)}  ${k}`);
console.log("\nBy corpus:");
for (const [k, v] of [...byCorpus].sort((a, b) => b[1] - a[1])) console.log(`${String(v).padStart(5)}  ${k}`);
