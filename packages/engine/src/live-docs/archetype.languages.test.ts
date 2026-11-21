import { describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig, type LiveDocumentationArchetype } from "../config/liveDocumentationConfig";
import { resolveArchetype } from "./archetype";

/**
 * One table of names across every language the engine reads, pinning what `resolveArchetype` answers today, so that a
 * change made for one language cannot move another in silence (2026-11-21: the PowerShell reading of 2026-11-19 had
 * moved `src/test-utils.tsx` and three more, and only a reviewer reading the diff caught it).
 *
 * Each row is a path, today's answer, and what the language's own test runner says of the same file: its default, or
 * where a row names a project, that project's own configuration of it. The runners' rules and the measurement they
 * come from are kept in the record of 2026-11-21,
 * `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/test-rules/README.md`. Where today and the runner
 * disagree, the row carries a mark, and the mark does not bless today's answer, it only says why it is pinned:
 *
 * - `wrong`: believed wrong whatever "test" comes to mean for the map, since the file is neither run by a runner nor
 *   there for the tests (working code, a shipped plugin, a CI workflow).
 * - `fork`: the runner does not run it, but it exists for the tests (a helper, a fixture, a setup file, an expectation):
 *   right if a test is a file there for the tests, wrong if a test is a file the runner runs. Not decided here.
 * - `project`: the answer turns on a project's own runner configuration, which no rule of names can see (AL-Go's
 *   `*.Test.ps1`, a Jest `testMatch`, a project that references a test framework but not the test SDK).
 *
 * A row with no mark agrees with its runner. The last case below holds the marks to that, so that a row cannot keep a
 * mark it no longer needs, nor lose one silently.
 */
type Mark = "wrong" | "fork" | "project";
type Row = readonly [path: string, today: LiveDocumentationArchetype, runner: LiveDocumentationArchetype, mark?: Mark, why?: string];

const T = "test" as const;
const I = "implementation" as const;

const LANGUAGES: Record<string, readonly Row[]> = {
  // Vitest's default include `**/*.{test,spec}.?(c|m)[jt]s?(x)`; Jest's default testMatch adds `**/__tests__/**` and a
  // file named `test.js`. Read by the TypeScript compiler's reader, not an adapter.
  "TypeScript and JavaScript": [
    ["src/main.test.ts", T, T],
    ["src/main.spec.tsx", T, T],
    ["src/contest.ts", I, I],
    ["vitest.config.ts", I, I],
    ["src/__tests__/helpers.ts", T, T, undefined, "Jest's default takes any file under __tests__; Vitest's would not"],
    ["src/test-utils.tsx", T, I, "fork", "a helper the tests import; no runner runs it (the reviewer's case of 2026-11-21)"],
    ["tests/setup-env.js", T, I, "fork", "Jest loads it as setupFilesAfterEnv; it holds no test (dom-testing-library)"],
    ["src/__tests__/__snapshots__/get-by-errors.js.snap", T, I, "fork", "Jest's own snapshot, read by the tests"],
    ["tests/e2e/playwright.config.ts", T, I, "fork", "the runner's configuration (this repository)"],
    ["src/queries/test-id.ts", T, I, "wrong", "dom-testing-library's getByTestId query: working code, named for the attribute it reads"],
    ["scripts/runTests.ts", T, I, "wrong", "C#'s NameTests rule read on a TypeScript file that runs tests"],
    ["mode/css/test.js", T, T, undefined, "Jest's default names test.js; Vitest's would not"],
    ["src/__node_tests__/screen.js", I, T, "project", "dom-testing-library's Jest project names **/__node_tests__/**.js"],
    ["tests/page-scan/fixtures.ts", I, I, undefined, "the word fixtures in the name takes it for a fixture's file; in a test folder, with its tests"]
  ],
  // pytest's python_files default `test_*.py *_test.py`, read from pytest 9.2.0's own source; conftest.py is a plugin.
  Python: [
    ["tests/test_basic.py", T, T],
    ["src/money_test.py", T, T],
    ["src/testing.py", I, I],
    ["tests/conftest.py", T, I, "fork", "pytest loads it as a plugin and collects no test from it (click)"],
    ["tests/__init__.py", T, I, "fork", "a package marker of the test folder (click)"],
    ["tests/typing/typing_path.py", T, I, "fork", "checked by a type checker, not run by pytest (click)"],
    ["polls/tests.py", T, T, undefined, "unittest's and Django's default pattern test*.py; pytest's default would not take it"]
  ],
  // `go test` compiles `*_test.go`, and ignores a folder named testdata (go help test, go list).
  Go: [
    ["stock/item_test.go", T, T],
    ["go.mod", I, I],
    ["stock/testdata/input.json", I, I, undefined, "the go tool ignores testdata; it is there for the tests"],
    ["cmd/test/main.go", T, I, "wrong", "a package named test is a package; only _test.go is a test"]
  ],
  // Cargo's test targets (tests/*.rs, as cargo metadata lists them) and what they declare; #[cfg(test)] modules.
  Rust: [
    ["tests/report.rs", T, T],
    ["tests/util.rs", T, T, undefined, "a module of ripgrep's tests/tests.rs target, compiled into it alone"],
    ["src/helpers_test.rs", T, T, undefined, "declared under #[cfg(test)] in the rosetta sample's main.rs"],
    ["Cargo.toml", I, I],
    ["crates/searcher/src/testutil.rs", I, T, "wrong", "ripgrep declares it #[cfg(test)] mod testutil: compiled for the tests only"]
  ],
  // Maven: Surefire's default includes Test*, *Test, *Tests, *TestCase under the test source folder, src/test/java.
  Java: [
    ["src/test/java/com/acme/StoreTest.java", T, T],
    ["src/main/java/com/acme/Contest.java", I, I],
    ["pom.xml", I, I],
    ["src/test/java/com/acme/support/Fixtures.java", T, I, "fork", "test source Surefire does not select"],
    ["test-shrinker/src/main/java/com/example/Main.java", T, I, "fork", "gson's module of code for the shrinker's tests, as main source"],
    ["src/com/rosetta/app/PipelineTest.java", T, I, "project", "the rosetta sample's pom sets sourceDirectory src and no test source"]
  ],
  // .NET: no name makes a test; `dotnet test` runs a project that sets IsTestProject (Microsoft.NET.Test.Sdk's props
  // do), and the framework finds the tests in it by their attributes. The .NET readers read .cs, project files,
  // solutions, .config and ASP.NET markup.
  ".NET": [
    ["src/Estate/ParcelTests.cs", T, T, undefined, "a file of a test project holding tests"],
    ["src/App/LatestTests.cs", T, T, undefined, "the reviewer's case: named Tests, in a test project"],
    ["src/App/Contest.cs", I, I, undefined, "the reviewer's case beside it: the word inside a name is no test"],
    ["Views/Home/Index.cshtml", I, I],
    ["Estate.sln", I, I],
    ["src/FluentValidation.Tests/Person.cs", T, I, "fork", "a model the tests use, in the test project"],
    ["src/FluentValidation.Tests/FluentValidation.Tests.csproj", T, I, "fork", "the test project's own file"],
    ["DNN Platform/Tests/DNN.Integration.Test.Framework/Helpers/FileHelper.cs", T, I, "fork", "DNN's helper library for its integration tests"],
    ["src/FluentValidation.Tests.Benchmarks/Program.cs", T, I, "wrong", "a benchmark program, not a test project"],
    ["Web/Data/test.config", T, I, "wrong", "mojoPortal's configuration file of that name"],
    ["Pages/Test.razor", T, I, "wrong", "a page named Test is a page"]
  ],
  // RSpec's default pattern spec/**/*_spec.rb; Minitest's TestTask test/**/test_*.rb and test/**/*_test.rb.
  Ruby: [
    ["spec/models/user_spec.rb", T, T],
    ["test/routing_test.rb", T, T],
    ["spec/support/matchers/trait.rb", T, I, "fork", "a matcher the specs load (factory_bot)"],
    ["spec/spec_helper.rb", T, I, "fork", "loaded by .rspec's --require"],
    ["test/integration_helper.rb", T, I, "fork", "required by sinatra's tests"],
    ["sinatra-contrib/lib/sinatra/test_helpers.rb", T, I, "wrong", "Sinatra::TestHelpers, shipped in the gem's lib for its users"],
    ["sinatra-contrib/spec/content_for/layout.erb", I, I, undefined, "a template the specs render: spec/ counts only for .rb, where tests/ counts for every file"]
  ],
  // Pester's Run.TestExtension `.Tests.ps1` (Pester 5.9.1 and 6.2.0); a project may name files or another filter.
  PowerShell: [
    ["public/Get-Thing.Tests.ps1", T, T],
    ["public/Test-DbaPath.ps1", I, I, undefined, "named for its approved verb (dbatools)"],
    ["Actions/RunTests/RunTests.psm1", I, I, undefined, "AL-Go's module that runs tests"],
    ["Build/Pester.Tests.psd1", I, I, undefined, "Pester takes .ps1 files only"],
    ["Tests/RunTests.Test.ps1", T, T, undefined, "AL-Go's own runtests.ps1 gives Pester *.Test.ps1"],
    ["src/Get-Thing.Test.ps1", T, I, "project", "AL-Go's filter, applied to every project; Pester's default would not take it"],
    [".github/scripts/gh-actions.ps1", I, T, "project", "dbatools' workflow gives this file to Invoke-Pester by name"],
    ["tests/appveyor.pester.ps1", T, I, "fork", "dbatools' script that starts the runner"],
    ["tests/Get-Thing.ps1", T, I, "fork", "a script in the test folder"],
    ["Tests/TestActionsHelper.psm1", T, I, "fork", "AL-Go's helper module for its tests"]
  ],
  // tSQLt: a test is a procedure named test* in a schema made a test class by tSQLt.NewTestClass; no file name counts.
  SQL: [
    ["Tests/tSQLt.AssertEqualsTable.class.sql", T, T],
    ["TestUtilTests/tSQLt_testutil_test.class.sql", I, T, "wrong", "creates a test class and its test procedures"],
    ["Examples/TestThatExamplesAreDeployed.sql", I, T, "wrong", "creates a test class and its test procedures"],
    ["Source/tSQLt.Tests.view.sql", T, I, "wrong", "tSQLt's own view that lists tests: the framework's source"]
  ],
  // C and C++: no runner names files; CTest runs what add_test registers (cJSON's tests/CMakeLists.txt).
  "C and C++": [
    ["tests/parse_number.c", T, T, undefined, "registered by cJSON's add_test"],
    ["cJSON.c", I, I],
    ["tests/unity/src/unity.c", T, I, "fork", "the test framework cJSON vendors"],
    ["tests/common.h", T, I, "fork", "a header cJSON's tests include"],
    ["src/test_helpers.c", T, I, "project", "the rosetta sample: nothing registers it; it was written to stand for a test"]
  ],
  // Files no reader reads, and the format readers (JSON, CSS, HTML): no runner runs them as tests.
  "Files no runner runs": [
    ["styles/site.css", I, I],
    ["tests/fixtures/page.html", I, I, undefined, "a folder named fixtures is read as a sample's, in any repository: under tests/, for the tests"],
    ["tests/data/sherlock.txt", T, I, "fork", "ripgrep's test data"],
    ["tests/tsconfig.json", T, I, "fork", "the tests' compiler configuration (this repository)"],
    ["src/__tests__/.eslintrc", T, I, "fork", "the tests' lint configuration"],
    ["tests/integration/live-docs/expected/repository-entries.json", T, I, "fork", "an expectation the tests read (this repository)"],
    [".github/workflows/test.yml", T, I, "wrong", "a CI workflow that runs tests: what RunTests.psm1 is to PowerShell"],
    ["ci/test-complete", T, I, "wrong", "ripgrep's CI script"],
    ["plugins/test/css/test.css", T, I, "wrong", "mojoPortal's editor ships a plugin named test"]
  ]
};

describe("what counts as a test, in every language the engine reads", () => {
  const config = normalizeLiveDocumentationConfig({});
  for (const [language, rows] of Object.entries(LANGUAGES)) {
    it.each(rows.map(row => [row[0], row[1], row[3] ?? "agrees with its runner"] as const))(`${language}: %s is %s today (%s)`, (file, today) => {
      expect(resolveArchetype(file, config)).toBe(today);
    });
  }

  it("keeps each mark honest: a row is marked exactly where today and its runner disagree", () => {
    const misplaced = Object.values(LANGUAGES).flat().filter(([, today, runner, mark]) => (mark !== undefined) !== (today !== runner));
    expect(misplaced).toEqual([]);
  });
});

describe("a sample root is read as it would be outside one", () => {
  // This repository's own sample roots: inside one, a path is read from the sample's root; around it, as the harness.
  const config = normalizeLiveDocumentationConfig({ sampleRoots: ["tests/integration/programs"] });
  it.each([
    ["tests/integration/programs/rust/stockroom/tests/report.rs", T],
    ["tests/integration/programs/python/ledger/tests/test_money.py", T],
    ["tests/integration/programs/python/ledger/ledger/money.py", I],
    ["tests/integration/programs/go/depot/stock/item_test.go", T],
    ["tests/integration/programs/powershell/rollout/Invoke-Rollout.ps1", I],
    ["tests/integration/programs/rosetta-manifest.json", I],
    // A row where today and the runner disagree, pinned as above: tidepool's helper, which Vitest does not run.
    ["tests/integration/programs/typescript/tidepool/tests/helpers.ts", T],
    // The rosetta sample's project references xunit but not the test SDK, so `dotnet test` skips it.
    ["tests/integration/programs/csharp/rosetta/src/App/PipelineTests.cs", T]
  ] as const)("%s is %s", (file, today) => {
    expect(resolveArchetype(file, config)).toBe(today);
  });

  it("reads the same paths otherwise without the sample root, as any other repository's tests/ folder", () => {
    const plain = normalizeLiveDocumentationConfig({});
    expect(resolveArchetype("tests/integration/programs/python/ledger/ledger/money.py", plain)).toBe(T);
    expect(resolveArchetype("tests/integration/programs/powershell/rollout/Invoke-Rollout.ps1", plain)).toBe(T);
  });
});

describe("a configuration override wins over every language's rule", () => {
  it("names a file's role ahead of its name and its folder", () => {
    const config = normalizeLiveDocumentationConfig({ archetypeOverrides: { "scripts/runTests.ts": "implementation", "tools/**": "test" } });
    expect(resolveArchetype("scripts/runTests.ts", config)).toBe(I);
    expect(resolveArchetype("tools/Get-Thing.ps1", config)).toBe(T);
  });
});
