// Sets today's resolveArchetype beside each language's own test runner, file by file, over real code.
// Usage: npx tsx measure.ts <out.tsv>   (run from the worktree root, so that the engine and picomatch resolve)
// Every runner answer comes from a kept record of the runner itself (vitest list, go list, cargo metadata, pytest's own
// matcher) or from the runner's documented default applied to the project's own configuration, read as text.
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const WT = process.cwd();
const require = createRequire(path.join(WT, "package.json"));
const picomatch = require("picomatch") as (glob: string | string[], options?: object) => (p: string) => boolean;
// ARCHETYPE_MODULE names another copy of archetype.ts beside it, as the reading before a change was measured.
const { resolveArchetype, isBinaryContent } = await import(path.join(WT, "packages/engine/src/live-docs", process.env.ARCHETYPE_MODULE ?? "archetype.ts"));
const { normalizeLiveDocumentationConfig } = await import(path.join(WT, "packages/engine/src/config/liveDocumentationConfig.ts"));

// Where the corpora were on 2026-11-21: the builders' copies, this builder's clones, and its copies of the Go and Rust
// code (go list and cargo metadata were run on copies, so that nothing was written beside a corpus).
const S = "/tmp/claude-1000/-workspaces-Live-Documentation/1501b25e-9b79-43c7-b25c-c8b29500c331/scratchpad";
const SCRATCH = `${S}/test-rules-builder`;
const RECORDS = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "records");
const CORPORA = `${S}/readers-builder-2/corpora`;
const CLONES = `${SCRATCH}/clones`;
const PROGRAMS = path.join(WT, "tests/integration/programs");

// ---------------------------------------------------------------------------------------------------------------
// What discovery would document: not .git or node_modules, no document, no lock file, no binary (an asset).
const DOCUMENT_SUFFIXES = new Set([".md", ".markdown", ".rst", ".adoc", ".asciidoc"]);
const DOCUMENT_NAME = /^(?:readme|licen[cs]e|unlicense|copying|notice|changelog|authors|contributing)(?:[-_][a-z0-9-]+(?:\.[0-9]+)*)?(?:\.txt)?$/iu;
const LOCK = new Set(["package-lock.json", "yarn.lock", "pnpm-lock.yaml", "Cargo.lock", "Gemfile.lock", "go.sum", "poetry.lock", "packages.lock.json"]);
function walk(root: string, skip: (rel: string) => boolean = () => false): string[] {
  const out: string[] = [];
  const visit = (dir: string): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      const rel = path.relative(root, abs).split(path.sep).join("/");
      if (entry.name === ".git" || entry.name === "node_modules" || skip(rel)) continue;
      if (entry.isDirectory()) visit(abs);
      else if (entry.isFile()) {
        const dot = entry.name.lastIndexOf(".");
        if ((dot > 0 && DOCUMENT_SUFFIXES.has(entry.name.slice(dot).toLowerCase())) || DOCUMENT_NAME.test(entry.name) || LOCK.has(entry.name)) continue;
        const fd = fs.openSync(abs, "r");
        const head = Buffer.alloc(8000);
        const n = fs.readSync(fd, head, 0, 8000, 0);
        fs.closeSync(fd);
        if (isBinaryContent(head.subarray(0, n))) continue;
        out.push(rel);
      }
    }
  };
  visit(root);
  return out.sort();
}

const LANG: Record<string, string> = {
  ".ts": "TypeScript/JavaScript", ".tsx": "TypeScript/JavaScript", ".mts": "TypeScript/JavaScript", ".cts": "TypeScript/JavaScript",
  ".js": "TypeScript/JavaScript", ".jsx": "TypeScript/JavaScript", ".mjs": "TypeScript/JavaScript", ".cjs": "TypeScript/JavaScript",
  ".py": "Python", ".go": "Go", ".rs": "Rust", ".java": "Java", ".cs": "C#", ".rb": "Ruby",
  ".ps1": "PowerShell", ".psm1": "PowerShell", ".psd1": "PowerShell", ".sql": "SQL",
  ".c": "C/C++", ".h": "C/C++", ".cpp": "C/C++", ".cc": "C/C++", ".cxx": "C/C++", ".hpp": "C/C++", ".hh": "C/C++", ".hxx": "C/C++", ".inl": "C/C++"
};
const langOf = (rel: string): string => LANG[path.extname(rel).toLowerCase()] ?? "other (no runner runs it)";
const read = (abs: string): string => { try { return fs.readFileSync(abs, "utf8"); } catch { return ""; } };

// The folders an ecosystem's runners or layouts name for tests: reading (b)'s operational boundary, stated, not an oracle.
const TEST_FOLDER = /^(?:test|tests|spec|__tests__|__node_tests__|__mocks__|__snapshots__|testdata)$/i;
const inTestFolder = (rel: string): boolean => rel.split("/").slice(0, -1).some(s => TEST_FOLDER.test(s)) || /(?:^|\/)src\/test\//.test(rel);

// ---------------------------------------------------------------------------------------------------------------
// Runner oracles. Each returns, for a file of its language, whether the runner selects it as a test file.
type Oracle = (rel: string, abs: string) => boolean;
const NOT_RUN: Oracle = () => false;

// Vitest: a kept `vitest list --filesOnly` of this repository; for a sample, the default of its declared major.
const vitestDefault4 = picomatch("**/*.{test,spec}.?(c|m)[jt]s?(x)");
const vitest2Exclude = picomatch(["**/node_modules/**", "**/dist/**", "**/cypress/**", "**/.{idea,git,cache,output,temp}/**", "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*"]);
const vitestDefault2: Oracle = rel => vitestDefault4(rel) && !vitest2Exclude(rel);

// Go: a kept `go list` per module: every file `go test` compiles as a test (on any platform: an ignored `_test.go` is
// a test held out by build constraints on this one).
function goTests(recordFile: string): Set<string> {
  const set = new Set<string>();
  for (const line of read(recordFile).split("\n")) {
    const [dir, , tests, xtests, ignored] = line.split("|");
    if (!dir || tests === undefined) continue;
    for (const name of [...tests.split(","), ...xtests.split(","), ...ignored.split(",").filter(n => n.endsWith("_test.go"))]) if (name) set.add(`${dir}/${name}`);
  }
  return set;
}

// Rust: a kept `cargo metadata --no-deps` per package: the test targets' roots, every module they declare (compiled into
// the test crate only), and every module declared under #[cfg(test)] from any crate's file (compiled for tests only).
function rustTests(recordFiles: string[], root: string): Set<string> {
  const roots = new Set<string>();
  const testRoots: string[] = [];
  for (const file of recordFiles) for (const line of read(file).split("\n")) {
    const [, kind, , src] = line.split("|");
    if (!src) continue;
    roots.add(src);
    if (kind === "test") testRoots.push(src);
  }
  const moduleFile = (from: string, name: string): string | undefined => {
    const base = path.posix.basename(from);
    const dir = roots.has(from) || base === "mod.rs" || base === "lib.rs" || base === "main.rs" ? path.posix.dirname(from) : from.replace(/\.rs$/, "");
    for (const candidate of [`${dir}/${name}.rs`, `${dir}/${name}/mod.rs`]) if (fs.existsSync(path.join(root, candidate))) return candidate;
    return undefined;
  };
  const tests = new Set<string>();
  const all = (from: string): void => {
    if (tests.has(from)) return;
    tests.add(from);
    for (const m of read(path.join(root, from)).matchAll(/^\s*(?:pub(?:\([^)]*\))?\s+)?mod\s+(\w+)\s*;/gm)) { const f = moduleFile(from, m[1]); if (f) all(f); }
  };
  testRoots.forEach(all);
  const rsFiles = walk(root).filter(f => f.endsWith(".rs"));
  for (const file of rsFiles) for (const m of read(path.join(root, file)).matchAll(/#\[cfg\(test\)\]\s*(?:pub(?:\([^)]*\))?\s+)?mod\s+(\w+)\s*;/g)) { const f = moduleFile(file, m[1]); if (f) all(f); }
  return tests;
}

// Maven: Surefire's and Failsafe's default includes, by the source file's class name, under each pom's test source dir.
const SUREFIRE = /^(?:Test.*|.*Test|.*Tests|.*TestCase)\.java$/;
const FAILSAFE = /^(?:IT.*|.*IT|.*ITCase)\.java$/;
function mavenTestDirs(root: string, files: string[]): string[] {
  return files.filter(f => path.posix.basename(f) === "pom.xml").map(pom => {
    const dir = path.posix.dirname(pom);
    const configured = read(path.join(root, pom)).match(/<testSourceDirectory>\s*([^<]+?)\s*<\/testSourceDirectory>/)?.[1];
    const test = (configured ?? "src/test/java").replace(/^\$\{(?:project\.)?basedir\}\//, "");
    return `${dir === "." ? "" : `${dir}/`}${test}/`;
  });
}

// .NET: a test project is one that sets IsTestProject (Microsoft.NET.Test.Sdk's props do), or MSTest.Sdk; a file of it
// holds tests when it carries a test framework's attribute. A project referencing a framework without the SDK is not run.
const TEST_ATTRIBUTE = /\[\s*(?:Fact|Theory|Test|TestCase|TestCaseSource|TestFixture|TestClass|TestMethod|DataTestMethod)\s*[\](,]/;
function dotnetProjects(root: string, files: string[]): Map<string, { test: boolean; framework: boolean }> {
  const projects = new Map<string, { test: boolean; framework: boolean }>();
  for (const f of files.filter(f => /\.(cs|vb|fs)proj$/i.test(f))) {
    const text = read(path.join(root, f));
    projects.set(path.posix.dirname(f), {
      test: /Microsoft\.NET\.Test\.Sdk|Sdk\s*=\s*"MSTest\.Sdk|<IsTestProject>\s*true/i.test(text),
      framework: /\b(?:xunit|nunit|MSTest\.TestFramework|Microsoft\.VisualStudio\.QualityTools\.UnitTestFramework)\b/i.test(text)
    });
  }
  return projects;
}
const projectOf = (projects: Map<string, unknown>, rel: string): string | undefined => {
  for (let dir = path.posix.dirname(rel); ; dir = path.posix.dirname(dir)) {
    if (projects.has(dir)) return dir;
    if (dir === "." || dir === "/" || dir === "") return projects.has(".") ? "." : undefined;
  }
};

// Pester: `Run.TestExtension` ".Tests.ps1" by default (Get-ChildItem -Filter, without regard to case on Windows).
const PESTER = /\.Tests\.ps1$/i;

// tSQLt: a procedure whose name begins with "test" in a schema made a test class by tSQLt.NewTestClass.
function tsqltTests(root: string, files: string[]): Oracle {
  const classes = new Set<string>();
  for (const f of files.filter(f => f.toLowerCase().endsWith(".sql"))) for (const m of read(path.join(root, f)).matchAll(/NewTestClass\s+(?:@ClassName\s*=\s*)?N?'([^']+)'/gi)) classes.add(m[1].toLowerCase());
  return (rel, abs) => {
    for (const m of read(abs).matchAll(/CREATE\s+(?:OR\s+ALTER\s+)?PROC(?:EDURE)?\s+\[?([^\].\s]+)\]?\.\[?([^\]\s(]+)/gi)) if (classes.has(m[1].toLowerCase()) && /^test/i.test(m[2])) return true;
    return false;
  };
}

// ---------------------------------------------------------------------------------------------------------------
interface Corpus {
  name: string;
  root: string;
  prefix: string;
  config: unknown;
  skip?: (rel: string) => boolean;
  oracles: (files: string[]) => Partial<Record<string, Oracle>>;
  support?: (rel: string, abs: string) => boolean;
}

const repoConfig = normalizeLiveDocumentationConfig(JSON.parse(read(path.join(WT, ".live-docs.config.json"))));
const plain = normalizeLiveDocumentationConfig({});
const vitestRepo = new Set(read(`${RECORDS}/vitest-list.txt`).split("\n").map(l => l.replace(/^\[[^\]]+\]\s*/, "").trim()).filter(Boolean));
const playwright = picomatch("**/*.spec.ts");
const pytestSamples = new Set(read(`${RECORDS}/pytest-samples.txt`).split("\n").filter(Boolean));
const pytestClick = new Set(read(`${RECORDS}/pytest-click.txt`).split("\n").filter(Boolean).map(l => l.replace(/^click\//, "")));

const corpora: Corpus[] = [
  {
    name: "this repository", root: WT, prefix: "", config: repoConfig,
    skip: rel => /^(?:\.claude|\.mdmd|AI-Agent-Workspace|tests\/integration\/programs|tests\/integration\/fixtures|coverage|test-results|playwright-report)(?:\/|$)/.test(rel) || /(?:^|\/)(?:dist|out)(?:\/|$)/.test(rel),
    oracles: () => ({ "TypeScript/JavaScript": rel => vitestRepo.has(rel) || (rel.startsWith("tests/e2e/") && playwright(rel.slice("tests/e2e/".length))) })
  },
  {
    name: "the sample programs", root: PROGRAMS, prefix: "tests/integration/programs/", config: repoConfig,
    oracles: files => {
      const go = new Set([...goTests(`${RECORDS}/go-list-go-rosetta.txt`), ...goTests(`${RECORDS}/go-list-go-depot.txt`)]);
      const rust = rustTests(fs.readdirSync(RECORDS).filter(f => f.startsWith("cargo-metadata-rust-")).map(f => `${RECORDS}/${f}`), path.join(SCRATCH, "copies"));
      const maven = mavenTestDirs(PROGRAMS, files);
      const projects = dotnetProjects(PROGRAMS, files);
      return {
        "TypeScript/JavaScript": rel => rel.startsWith("typescript/tidepool/") ? vitestDefault2(rel.slice("typescript/tidepool/".length)) : vitestDefault4(rel),
        Python: rel => pytestSamples.has(rel),
        Go: rel => go.has(rel),
        Rust: rel => rust.has(rel),
        Java: rel => maven.some(d => rel.startsWith(d)) && (SUREFIRE.test(path.posix.basename(rel)) || FAILSAFE.test(path.posix.basename(rel))),
        "C#": (rel, abs) => { const p = projectOf(projects, rel); return p !== undefined && projects.get(p)!.test && TEST_ATTRIBUTE.test(read(abs)); },
        Ruby: rel => /^ruby\/[^/]+\/spec\/(?:.*\/)?[^/]*_spec\.rb$/.test(rel),
        PowerShell: rel => PESTER.test(rel),
        "C/C++": NOT_RUN, SQL: NOT_RUN
      };
    }
  },
  {
    name: "dbatools", root: `${CORPORA}/dbatools`, prefix: "", config: plain,
    oracles: files => ({ PowerShell: rel => PESTER.test(rel) || /^\.github\/scripts\/gh-(?:win|mac)?actions\.ps1$/.test(rel), SQL: tsqltTests(`${CORPORA}/dbatools`, files), "C#": NOT_RUN })
  },
  {
    name: "AL-Go", root: `${CORPORA}/algo`, prefix: "", config: plain,
    // CI.yaml runs Tests/runtests.ps1 -Path Tests, Tests/WorkflowSanitation and Tests/MarkdownLinks, which gives Pester
    // Get-ChildItem (Join-Path $Path "*.Test.ps1"); and Invoke-Pester -Path Tests/ReviewAgent, by Pester's default.
    oracles: () => ({ PowerShell: rel => PESTER.test(rel) || /^Tests\/(?:WorkflowSanitation\/|MarkdownLinks\/)?[^/]+\.Test\.ps1$/i.test(rel) })
  },
  { name: "AzureStack-Tools", root: `${CORPORA}/azurestack`, prefix: "", config: plain, oracles: () => ({ PowerShell: rel => PESTER.test(rel) }) },
  {
    name: "tSQLt", root: `${CORPORA}/tsqlt`, prefix: "", config: plain,
    oracles: files => {
      const projects = dotnetProjects(`${CORPORA}/tsqlt`, files);
      return { SQL: tsqltTests(`${CORPORA}/tsqlt`, files), PowerShell: rel => PESTER.test(rel), "C#": (rel, abs) => { const p = projectOf(projects, rel); return p !== undefined && projects.get(p)!.test && TEST_ATTRIBUTE.test(read(abs)); } };
    }
  },
  ...[["DNN Platform", `${CORPORA}/dnn`], ["mojoPortal", `${CORPORA}/mojoportal`], ["FluentValidation", `${CLONES}/FluentValidation`]].map(([name, root]): Corpus => ({
    name, root, prefix: "", config: plain,
    skip: rel => /(?:^|\/)(?:bin|obj)(?:\/|$)/.test(rel) && name !== "dbatools",
    oracles: files => {
      const projects = dotnetProjects(root, files);
      const test: Oracle = (rel, abs) => { const p = projectOf(projects, rel); return p !== undefined && projects.get(p)!.test && TEST_ATTRIBUTE.test(read(abs)); };
      return { "C#": test, SQL: tsqltTests(root, files), PowerShell: rel => PESTER.test(rel), "TypeScript/JavaScript": rel => vitestDefault4(rel) };
    },
    support: (() => {
      let projects: ReturnType<typeof dotnetProjects> | undefined;
      return (rel: string): boolean => { projects ??= dotnetProjects(root, walkCache.get(root)!); const p = projectOf(projects, rel); return p !== undefined && projects.get(p)!.test; };
    })()
  })),
  { name: "click (pytest)", root: `${CLONES}/click`, prefix: "", config: plain, oracles: () => ({ Python: rel => pytestClick.has(rel) }), support: rel => path.posix.basename(rel) === "conftest.py" },
  { name: "cobra (go test)", root: `${CLONES}/cobra`, prefix: "", config: plain, oracles: () => { const go = goTests(`${RECORDS}/go-list-cobra.txt`); return { Go: rel => go.has(`cobra/${rel}`) }; } },
  {
    name: "ripgrep (cargo)", root: `${CLONES}/ripgrep`, prefix: "", config: plain,
    oracles: () => { const rust = rustTests([`${RECORDS}/cargo-metadata-ripgrep.txt`], path.join(SCRATCH, "copies")); return { Rust: rel => rust.has(`ripgrep/${rel}`) }; }
  },
  {
    name: "gson (Maven)", root: `${CLONES}/gson`, prefix: "", config: plain,
    oracles: files => { const dirs = mavenTestDirs(`${CLONES}/gson`, files); return { Java: rel => dirs.some(d => rel.startsWith(d)) && (SUREFIRE.test(path.posix.basename(rel)) || FAILSAFE.test(path.posix.basename(rel))) }; },
    support: rel => /(?:^|\/)src\/test\//.test(rel)
  },
  { name: "factory_bot (RSpec)", root: `${CLONES}/factory_bot`, prefix: "", config: plain, oracles: () => ({ Ruby: rel => /^spec\/(?:.*\/)?[^/]*_spec\.rb$/.test(rel) }) },
  {
    name: "sinatra (Minitest, RSpec)", root: `${CLONES}/sinatra`, prefix: "", config: plain,
    // The root Rakefile's Minitest::TestTask (default test_globs); rack-protection and sinatra-contrib run RSpec.
    oracles: () => ({ Ruby: rel => /^test\/(?:.*\/)?(?:test_[^/]*|[^/]*_test)\.rb$/.test(rel) || /^(?:rack-protection|sinatra-contrib)\/spec\/(?:.*\/)?[^/]*_spec\.rb$/.test(rel) })
  },
  {
    name: "dom-testing-library (Jest)", root: `${CLONES}/dom-testing-library`, prefix: "", config: plain,
    // kcd-scripts 13's Jest config: roots <rootDir>/src, testMatch **/__tests__/**/*.+(js|jsx|ts|tsx), and the ignores; the
    // node project's testMatch **/__node_tests__/**.js; tests/setup-env.js loaded by the runner as setupFilesAfterEnv.
    oracles: () => {
      const dom = picomatch("**/__tests__/**/*.+(js|jsx|ts|tsx)");
      const node = picomatch("**/__node_tests__/**.js");
      const ignored = (rel: string): boolean => ["/node_modules/", "/__fixtures__/", "/fixtures/", "/__tests__/helpers/", "/__tests__/utils/", "__mocks__"].some(p => `/${rel}`.includes(p));
      return { "TypeScript/JavaScript": rel => rel.startsWith("src/") && !ignored(rel) && (dom(rel) || node(rel)) };
    },
    support: rel => rel === "tests/setup-env.js"
  },
  {
    name: "cJSON (CTest)", root: `${CLONES}/cJSON`, prefix: "", config: plain,
    oracles: () => {
      const cmake = read(`${CLONES}/cJSON/tests/CMakeLists.txt`);
      const names = new Set([...cmake.matchAll(/set\((?:unity_tests|cjson_utils_tests)\s+([^)]*)\)/g)].flatMap(m => m[1].split(/\s+/).filter(Boolean)));
      // The top CMakeLists.txt registers test.c too: add_executable("${TEST_CJSON}" test.c), then add_test(NAME ${TEST_CJSON} …).
      const top = [...read(`${CLONES}/cJSON/CMakeLists.txt`).matchAll(/add_executable\("\$\{TEST_CJSON\}"\s+([^)\s]+)\)/g)].map(m => m[1]);
      return { "C/C++": rel => (rel.startsWith("tests/") && names.has(path.posix.basename(rel).replace(/\.c$/, ""))) || top.includes(rel) };
    }
  }
];

// The readers' facts, as the generator's first pass gathers them (`buildWorkspaceIndexes`), over the files whose readers
// report them: the project files, the Rust and the SQL files; every file of the corpus is in its file index. Unless
// NO_FACTS is set, as the reading before the facts was measured.
const { buildWorkspaceIndexes } = await import(path.join(WT, "packages/engine/src/live-docs/discovery.ts"));
const RUST_ORACLE: Record<string, (rel: string) => boolean> = {
  "the sample programs": (() => { const set = rustTests(fs.readdirSync(RECORDS).filter(f => f.startsWith("cargo-metadata-rust-")).map(f => `${RECORDS}/${f}`), path.join(SCRATCH, "copies")); return (rel: string) => set.has(rel); })(),
  "ripgrep (cargo)": (() => { const set = rustTests([`${RECORDS}/cargo-metadata-ripgrep.txt`], path.join(SCRATCH, "copies")); return (rel: string) => set.has(`ripgrep/${rel}`); })()
};
const facts: string[] = ["corpus\tlanguage\tsubject\toracle\treader"];
const factCounts = new Map<string, { agree: number; differ: number }>();
const tally = (corpus: string, lang: string, subject: string, oracle: boolean, reader: boolean): void => {
  const key = `${corpus}\t${lang}`;
  const count = factCounts.get(key) ?? { agree: 0, differ: 0 };
  if (oracle === reader) count.agree += 1;
  else { count.differ += 1; facts.push([corpus, lang, subject, oracle, reader].join("\t")); }
  factCounts.set(key, count);
};

const walkCache = new Map<string, string[]>();
const rows: string[] = ["corpus\tlanguage\tpath\ttoday\trunner\tforTests"];
for (const corpus of corpora) {
  const files = walk(corpus.root, corpus.skip);
  walkCache.set(corpus.root, files);
  const oracles = corpus.oracles(files);
  const workspaceRoot = corpus.prefix ? WT : corpus.root;
  const readOnly = files.filter(rel => /\.(?:csproj|vbproj|fsproj|rs|sql)$/i.test(rel));
  const index = process.env.NO_FACTS ? undefined : (await buildWorkspaceIndexes({
    targetFiles: readOnly.map(rel => path.join(corpus.root, rel)), workspaceRoot, liveDocsRoot: ".mdmd/layer-4", docExtension: ".mdmd.md",
    fileIndex: new Set(files.map(rel => `${corpus.prefix}${rel}`))
  })).tests;
  if (index) {
    // Each fact against its oracle: a project's test flag against vstest's rule, a script against tSQLt's, a Rust file
    // against cargo metadata's targets and the compiler's #[cfg(test)] (a file under a tests/ folder is the shared root's).
    for (const [dir, project] of dotnetProjects(corpus.root, files)) {
      tally(corpus.name, ".NET project", dir, project.test, index.projects.get(`${corpus.prefix}${dir === "." ? "" : dir}`.replace(/\/$/, "")) === true);
    }
    const sql = tsqltTests(corpus.root, files);
    for (const rel of files.filter(f => f.toLowerCase().endsWith(".sql"))) tally(corpus.name, "SQL", rel, sql(rel, path.join(corpus.root, rel)), index.files.has(`${corpus.prefix}${rel}`));
    const rust = RUST_ORACLE[corpus.name];
    if (rust) for (const rel of files.filter(f => f.endsWith(".rs"))) tally(corpus.name, "Rust", rel, rust(rel), index.files.has(`${corpus.prefix}${rel}`) || /(?:^|\/)tests\//.test(rel));
  }
  for (const rel of files) {
    const lang = langOf(rel);
    const abs = path.join(corpus.root, rel);
    const today = resolveArchetype(`${corpus.prefix}${rel}`, corpus.config, false, index);
    const oracle = oracles[lang] ?? (lang.startsWith("other") ? NOT_RUN : undefined);
    const runner = oracle ? (oracle(rel, abs) ? "test" : "implementation") : "no runner measured";
    const forTests = runner === "test" || inTestFolder(rel) || path.posix.basename(rel) === "conftest.py" || (corpus.support?.(rel, abs) ?? false) ? "test" : "implementation";
    rows.push([corpus.name, lang, rel, today, runner, forTests].join("\t"));
  }
}
fs.writeFileSync(process.argv[2], `${rows.join("\n")}\n`);
console.log(`${rows.length - 1} files`);
if (process.argv[3]) {
  const counts = [...factCounts].map(([key, { agree, differ }]) => `${key}\t${agree} agree\t${differ} differ`);
  fs.writeFileSync(process.argv[3], `${counts.join("\n")}\n\n${facts.join("\n")}\n`);
}
