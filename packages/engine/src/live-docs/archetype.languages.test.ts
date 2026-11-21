import { describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig, type LiveDocumentationArchetype } from "../config/liveDocumentationConfig";
import { resolveArchetype, TEST_RULES } from "./archetype";

/**
 * One table of names across every language the engine reads, pinning what `resolveArchetype` answers, so that a change
 * made for one language cannot move another in silence (2026-11-21: the PowerShell reading of 2026-11-19 had moved
 * `src/test-utils.tsx` and three more, and only a reviewer reading the diff caught it).
 *
 * Each row is a path, the answer, and what the language's own test runner says of the same file: its default, or where
 * a row names a project, that project's own configuration of it. A test is a file that exists for the tests, whether or
 * not the runner runs it (the reading decided on 2026-11-21). The runners' rules and the measurement they come from are
 * kept in the record of that day,
 * `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/test-rules/README.md`. Where the answer and the
 * runner disagree, the row carries a mark, which says why:
 *
 * - `for the tests`: the runner does not run it, but it exists for the tests (a helper, a fixture, a setup file, an
 *   expectation), so it is a test by the decided reading.
 * - `wrong`: the answer is wrong by the decided reading, and pinned so that its mending shows.
 * - `project`: the answer turns on a project's own runner configuration, which no rule of names can see (a Jest
 *   `testMatch`, files named to `Invoke-Pester`, a project that references a test framework but not the test SDK).
 * - `interim`: a file of .NET, Rust or SQL, which keeps the reading of before the table until a reader reports the
 *   fact the honest rule needs (a test project, a `#[cfg(test)]` module, a tSQLt test class); the reason says whether
 *   the answer is right meanwhile.
 *
 * One more mark stands where the answer and the runner agree: `missed`, a file that exists for the tests which the
 * rule does not take, since nothing in its path says so (a helper outside every test root). The last cases hold the
 * marks to these meanings, and hold the table to a block for every language of the rules.
 *
 * Rows of 2026-11-21's restructure that moved carry `moved:` in their reason, with the answer of before.
 */
type Mark = "for the tests" | "wrong" | "project" | "interim" | "missed";
type Row = readonly [path: string, answer: LiveDocumentationArchetype, runner: LiveDocumentationArchetype, mark?: Mark, why?: string];

const T = "test" as const;
const I = "implementation" as const;

const LANGUAGES: Record<string, readonly Row[]> = {
  // Vitest's default include `**/*.{test,spec}.?(c|m)[jt]s?(x)`; Jest's default testMatch adds `**/__tests__/**` and a
  // file named `test.js`; Jest's `__mocks__` and `__snapshots__`. Read by the TypeScript compiler's reader.
  "TypeScript and JavaScript": [
    ["src/main.test.ts", T, T],
    ["src/main.spec.tsx", T, T],
    ["src/contest.ts", I, I],
    ["src/attestation.ts", I, I],
    ["vitest.config.ts", I, I],
    ["mode/css/test.js", T, T, undefined, "Jest's default names test.js; Vitest's would not"],
    ["src/__tests__/helpers.ts", T, T, undefined, "Jest's default takes any file under __tests__; Vitest's would not"],
    ["tests/setup-env.js", T, I, "for the tests", "Jest loads it as setupFilesAfterEnv; it holds no test (dom-testing-library)"],
    ["src/__tests__/__snapshots__/get-by-errors.js.snap", T, I, "for the tests", "Jest's own snapshot, read by the tests"],
    ["tests/e2e/playwright.config.ts", T, I, "for the tests", "the runner's configuration (this repository)"],
    ["tests/page-scan/fixtures.ts", T, I, "for the tests", "moved: implementation before, since the word fixtures read it as a sample's; a helper in a test folder (this repository)"],
    ["src/__mocks__/helpers.js", T, I, "for the tests", "moved: implementation before; Jest's manual mock (DNN's Prompt.Web)"],
    ["src/__node_tests__/screen.js", I, T, "project", "dom-testing-library's Jest project names **/__node_tests__/**.js"],
    ["src/queries/test-id.ts", I, I, undefined, "moved: a test before, by the word; dom-testing-library's getByTestId query, working code"],
    ["scripts/runTests.ts", I, I, undefined, "moved: a test before, by C#'s NameTests rule; a script that runs tests is working code"],
    ["src/test-utils.tsx", I, I, "missed", "moved: a test before, by the word; a helper the tests import, outside every test root (the reviewer's case)"],
    ["src/test-helpers.ts", I, I, "missed", "moved: a test before, by the word; a helper outside every test root"],
    ["lib/test-setup.js", I, I, "missed", "moved: a test before, by the word; a setup file outside every test root"],
    ["mode/css/less_test.js", I, I, "missed", "moved: a test before, by Go's _test rule; CodeMirror's own test of the mode, vendored by DNN, which no JS runner's default names"],
    ["scripts/dnn.DataStructures.Tests.js", I, I, "missed", "moved: a test before, by C#'s NameTests rule; DNN's QUnit test, which runs what its page loads"]
  ],
  // pytest's python_files default `test_*.py *_test.py`, read from pytest 9.2.0's own source; conftest.py is a plugin.
  Python: [
    ["tests/test_basic.py", T, T],
    ["src/money_test.py", T, T],
    ["src/testing.py", I, I],
    ["polls/tests.py", T, T, undefined, "unittest's and Django's default pattern test*.py; pytest's default would not take it"],
    ["tests/conftest.py", T, I, "for the tests", "pytest loads it as a plugin and collects no test from it (click)"],
    ["src/conftest.py", T, I, "for the tests", "moved: implementation before; pytest's plugin of the tests wherever it lies"],
    ["tests/__init__.py", T, I, "for the tests", "a package marker of the test folder (click)"],
    ["tests/typing/typing_path.py", T, I, "for the tests", "checked by a type checker, not run by pytest (click)"]
  ],
  // `go test` compiles `*_test.go`, and ignores a folder named testdata (go help test, go list).
  Go: [
    ["stock/item_test.go", T, T],
    ["go.mod", I, I],
    ["stock/testdata/input.json", T, I, "for the tests", "moved: implementation before; the go tool's testdata"],
    ["cmd/test/main.go", T, I, "wrong", "a package named test is a package; only _test.go is a test, but test/ is every language's test root"]
  ],
  // Maven: Surefire's default includes Test*, *Test, *Tests, *TestCase under the test source folder, src/test/java.
  Java: [
    ["src/test/java/com/acme/StoreTest.java", T, T],
    ["src/main/java/com/acme/Contest.java", I, I],
    ["src/main/java/com/acme/TestExecutor.java", I, I],
    ["pom.xml", I, I],
    ["src/test/java/com/acme/support/Fixtures.java", T, I, "for the tests", "test source Surefire does not select"],
    ["src/com/rosetta/app/PipelineTest.java", T, I, "project", "the rosetta sample's pom sets sourceDirectory src and no test source"],
    ["test-shrinker/src/main/java/com/example/Main.java", I, I, "missed", "moved: a test before, by the word in test-shrinker; gson's module of code for its shrinker's tests"]
  ],
  // RSpec's default pattern spec/**/*_spec.rb; Minitest's TestTask test/**/test_*.rb and test/**/*_test.rb.
  Ruby: [
    ["spec/models/user_spec.rb", T, T],
    ["test/routing_test.rb", T, T],
    ["lib/rspec/core/example.rb", I, I],
    ["spec/support/matchers/trait.rb", T, I, "for the tests", "a matcher the specs load (factory_bot)"],
    ["spec/spec_helper.rb", T, I, "for the tests", "loaded by .rspec's --require"],
    ["test/integration_helper.rb", T, I, "for the tests", "required by sinatra's tests"],
    ["sinatra-contrib/lib/sinatra/test_helpers.rb", I, I, undefined, "moved: a test before, by the test_ prefix; Sinatra::TestHelpers, shipped in the gem's lib"],
    ["sinatra-contrib/spec/content_for/layout.erb", I, I, "missed", "a template the specs render: spec/ is Ruby's own root, since elsewhere spec/ names specifications"]
  ],
  // Pester's Run.TestExtension `.Tests.ps1` (Pester 5.9.1 and 6.2.0); a project may name files or another filter.
  PowerShell: [
    ["public/Get-Thing.Tests.ps1", T, T],
    ["src/Get-Thing.tests.ps1", T, T, undefined, "Pester's filter, without regard to case as on Windows"],
    ["public/Test-DbaPath.ps1", I, I, undefined, "named for its approved verb (dbatools)"],
    ["private/functions/flowcontrol/Test-Bound.ps1", I, I],
    ["Modules/Test-Module.psm1", I, I],
    ["Modules/Test-Data.psd1", I, I],
    ["Actions/RunTests/RunTests.psm1", I, I, undefined, "AL-Go's module that runs tests"],
    ["Actions/AnalyzeTests/AnalyzeTests.ps1", I, I],
    ["Build/tSQLt_BuildTests.ps1", I, I],
    ["Build/Pester.Tests.psd1", I, I, undefined, "Pester takes .ps1 files only"],
    ["Tests/RunTests.Test.ps1", T, T, undefined, "AL-Go's Tests/ folder; AL-Go's own runtests.ps1 gives Pester *.Test.ps1"],
    ["src/Get-Thing.Test.ps1", I, I, undefined, "moved: a test before, by AL-Go's filter applied to every project; Pester's default does not take it"],
    [".github/scripts/gh-actions.ps1", I, T, "project", "dbatools' workflow gives this file to Invoke-Pester by name"],
    ["tests/appveyor.pester.ps1", T, I, "for the tests", "dbatools' script that starts the runner"],
    ["tests/Get-Thing.ps1", T, I, "for the tests", "a script in the test folder"],
    ["Tests/TestActionsHelper.psm1", T, I, "for the tests", "AL-Go's helper module for its tests"]
  ],
  // C and C++: no runner names files; CTest runs what add_test registers (cJSON's CMakeLists.txt files).
  "C and C++": [
    ["tests/parse_number.c", T, T, undefined, "registered by cJSON's add_test"],
    ["test.c", T, T, undefined, "registered by cJSON's top CMakeLists.txt as cJSON_test"],
    ["cJSON.c", I, I],
    ["tests/unity/src/unity.c", T, I, "for the tests", "the test framework cJSON vendors"],
    ["tests/common.h", T, I, "for the tests", "a header cJSON's tests include"],
    ["src/test_helpers.c", T, I, "project", "the rosetta sample: nothing registers it; it was written to stand for a test"]
  ],
  // .NET: no name makes a test; `dotnet test` runs a project that sets IsTestProject (Microsoft.NET.Test.Sdk's props
  // do), and the framework finds the tests in it by their attributes. Interim until the project reader reports it.
  ".NET (interim)": [
    ["src/Estate/ParcelTests.cs", T, T, undefined, "a file of a test project holding tests"],
    ["src/App/LatestTests.cs", T, T, undefined, "the reviewer's case: named Tests, in a test project"],
    ["src/App/Contest.cs", I, I, undefined, "the reviewer's case beside it: the word inside a name is no test"],
    ["Views/Home/Index.cshtml", I, I],
    ["Estate.sln", I, I],
    ["src/FluentValidation.Tests/Person.cs", T, I, "interim", "right: a model the tests use, in the test project"],
    ["src/FluentValidation.Tests/FluentValidation.Tests.csproj", T, I, "interim", "right: the test project's own file"],
    ["DNN Platform/Tests/DNN.Integration.Test.Framework/Helpers/FileHelper.cs", T, I, "interim", "right: DNN's helper library for its integration tests"],
    ["Test/Helpers/Fake.cs", T, I, "interim", "right: a fake in a test folder"],
    ["src/FluentValidation.Tests.Benchmarks/Program.cs", T, I, "interim", "wrong: a benchmark program, not a test project"],
    ["Web/Data/test.config", T, I, "interim", "wrong: mojoPortal's configuration file of that name"],
    ["Pages/Test.razor", T, I, "interim", "wrong: a page named Test is a page"],
    ["src/Test-Thing.cs", T, I, "interim", "wrong: the word in a name"]
  ],
  // Cargo's test targets (tests/*.rs, as cargo metadata lists them) and what they declare; #[cfg(test)] modules.
  // Interim until the Rust reader reports a module declared under #[cfg(test)].
  "Rust (interim)": [
    ["tests/report.rs", T, T],
    ["tests/util.rs", T, T, undefined, "a module of ripgrep's tests/tests.rs target, compiled into it alone"],
    ["src/helpers_test.rs", T, T, undefined, "declared under #[cfg(test)] in the rosetta sample's main.rs"],
    ["Cargo.toml", I, I],
    ["crates/searcher/src/testutil.rs", I, T, "interim", "wrong: ripgrep declares it #[cfg(test)] mod testutil, compiled for the tests alone"]
  ],
  // tSQLt: a test is a procedure named test* in a schema made a test class by tSQLt.NewTestClass; no file name counts.
  // Interim until the SQL reader reports a test class.
  "SQL (interim)": [
    ["Tests/tSQLt.AssertEqualsTable.class.sql", T, T],
    ["Examples/Tests.sql", T, T, undefined, "tSQLt's example test class"],
    ["TestUtilTests/TestUtilTests.sqlproj", T, I, "interim", "right: the database project of tSQLt's TestUtilTests"],
    ["TestUtilTests/tSQLt_testutil_test.class.sql", I, T, "interim", "wrong: creates a test class and its test procedures"],
    ["Examples/TestThatExamplesAreDeployed.sql", I, T, "interim", "wrong: creates a test class and its test procedures"],
    ["Source/tSQLt.Tests.view.sql", T, I, "interim", "wrong: tSQLt's own view that lists tests, the framework's source"]
  ],
  // Files of no runner's language (data, configuration, markup, the JSON, CSS and HTML readers' files): a test only in
  // a test root, never by its own name.
  "Files no runner runs": [
    ["styles/site.css", I, I],
    ["docs/testing.md", I, I],
    ["src/__fixtures__/data.json", I, I, undefined, "a folder named __fixtures__ is no root, nor a sample's unless the configuration names it"],
    ["spec/openapi.yaml", I, I, undefined, "spec/ is Ruby's own root, and holds specifications elsewhere"],
    ["tests/data/sherlock.txt", T, I, "for the tests", "ripgrep's test data"],
    ["tests/tsconfig.json", T, I, "for the tests", "the tests' compiler configuration (this repository)"],
    ["src/__tests__/.eslintrc", T, I, "for the tests", "the tests' lint configuration"],
    ["tests/integration/live-docs/expected/repository-entries.json", T, I, "for the tests", "an expectation the tests read (this repository)"],
    ["src/test/resources/fixture.json", T, I, "for the tests", "Maven's test resources"],
    ["tests/fixtures/page.html", T, I, "for the tests", "moved: implementation before, since the word fixtures read it as a sample's"],
    ["Tests/ReviewAgent/fixtures/findings.json", T, I, "for the tests", "moved: implementation before, by the same rule (AL-Go)"],
    ["src/FluentValidation.Tests/xunit.runner.json", T, I, "interim", "right: in a folder named as a test project, kept until the project reader reports the project"],
    ["Tests.SA/Tests.SA.sqlproj", T, I, "interim", "right: tSQLt's database project of its SA tests"],
    ["e2eTests/pte/My App.Test/app.json", T, I, "interim", "right: AL-Go's test app for its end-to-end tests"],
    [".github/workflows/test.yml", I, I, undefined, "moved: a test before, by the word; a CI workflow that runs tests, as RunTests.psm1 is to PowerShell"],
    ["ci/test-complete", I, I, undefined, "moved: a test before, by the word; ripgrep's CI script"],
    ["plugins/test/css/test.css", T, I, "wrong", "mojoPortal's editor ships a plugin named test, in a folder that every language's root names"]
  ]
};

describe("what counts as a test, in every language the engine reads", () => {
  const config = normalizeLiveDocumentationConfig({});
  for (const [language, rows] of Object.entries(LANGUAGES)) {
    it.each(rows.map(row => [row[0], row[1], row[3] ?? "agrees with its runner"] as const))(`${language}: %s is %s (%s)`, (file, answer) => {
      expect(resolveArchetype(file, config)).toBe(answer);
    });
  }

  it("keeps each mark honest: a reason where the answer and the runner disagree, missed only where they agree", () => {
    const misplaced = Object.values(LANGUAGES).flat().filter(([, answer, runner, mark]) =>
      mark === "missed" ? answer !== runner : (mark !== undefined) !== (answer !== runner));
    expect(misplaced).toEqual([]);
  });

  it("holds a block for every language of the rules, named interim where its rule is", () => {
    const blocks = Object.keys(LANGUAGES).filter(block => block !== "Files no runner runs").sort();
    expect(blocks).toEqual(Object.entries(TEST_RULES).map(([language, rule]) => rule.interim ? `${language} (interim)` : language).sort());
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
    ["tests/integration/programs/ruby/rosetta/spec/helpers_spec.rb", T],
    ["tests/integration/programs/powershell/rollout/Invoke-Rollout.ps1", I],
    ["tests/integration/programs/rosetta-manifest.json", I],
    // tidepool's helper, which Vitest does not run: there for the tests.
    ["tests/integration/programs/typescript/tidepool/tests/helpers.ts", T],
    // The rosetta sample's project references xunit but not the test SDK, so `dotnet test` skips it (interim).
    ["tests/integration/programs/csharp/rosetta/src/App/PipelineTests.cs", T]
  ] as const)("%s is %s", (file, answer) => {
    expect(resolveArchetype(file, config)).toBe(answer);
  });

  it("reads the same paths otherwise without the sample root, as any other repository's tests/ folder", () => {
    const plain = normalizeLiveDocumentationConfig({});
    expect(resolveArchetype("tests/integration/programs/python/ledger/ledger/money.py", plain)).toBe(T);
    expect(resolveArchetype("tests/integration/programs/powershell/rollout/Invoke-Rollout.ps1", plain)).toBe(T);
  });
});

describe("a configuration override wins over every language's rule", () => {
  it("names a file's role ahead of its name and its folder", () => {
    const config = normalizeLiveDocumentationConfig({ archetypeOverrides: { "tests/runTests.ts": "implementation", "tools/**": "test" } });
    expect(resolveArchetype("tests/runTests.ts", config)).toBe(I);
    expect(resolveArchetype("tools/Get-Thing.ps1", config)).toBe(T);
  });
});
