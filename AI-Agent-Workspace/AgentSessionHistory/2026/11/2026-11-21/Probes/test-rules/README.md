# What makes a file a test, language by language: each runner's rule beside today's

A record of 2026-11-21, historical evidence written by a builder for the root, on the day branch at `a11f7d007`. It answers the owner's question of that day, "Should any architecture be in place to scope test file matching patterns in some way?", with a guard, an oracle per language, a measurement on real code, the open fork, and a design that is not built yet. Nothing under `packages/` changed but one new test file.

## The guard

[`archetype.languages.test.ts`](../../../../../../../packages/engine/src/live-docs/archetype.languages.test.ts) holds one table across every language the engine reads: TypeScript and JavaScript, Python, Go, Rust with `Cargo.toml`, Java with `pom.xml`, the .NET readers (C#, project files, solutions, `.config`, ASP.NET markup), Ruby, PowerShell, SQL, C and C++, and the files no runner runs (JSON, CSS, HTML, data, CI). Each row is a path, `resolveArchetype`'s answer today, and what that language's runner says of it. Where the two disagree the row carries a mark, which says why it is pinned and does not bless it:

- `wrong`: wrong whatever "test" comes to mean, since nothing runs the file and it is not there for the tests. Examples: dom-testing-library's `src/queries/test-id.ts`, the `getByTestId` query; a TypeScript `runTests.ts` called a test by C#'s `NameTests` rule; `.github/workflows/test.yml`; Sinatra's shipped `lib/sinatra/test_helpers.rb`.
- `fork`: the runner does not run it, but it exists for the tests (`test-utils.tsx`, `conftest.py`, `spec_helper.rb`, a test project's model class). Whether it is right depends on the fork below.
- `project`: the answer depends on a project's own runner configuration, which no naming rule can see (AL-Go's `*.Test.ps1`, a Jest `testMatch`, a project that references xunit but not the test SDK).

The last case of the table checks that a row is marked exactly when today's answer and the runner's differ. The reviewer's cases are all there: `test-utils.tsx`, `Test-DbaPath.ps1`, `RunTests.psm1`, `Name.Tests.ps1`, `LatestTests.cs` beside `Contest.cs`, and files under a sample root's own `tests/`.

**It can fail.** Undoing the PowerShell confinement (the folder-only test and the `test.js` name rule applied to every file, as on 2026-11-19 before `3d3343ced`) turns four rows red, none of them PowerShell ([the run](records/guard-red-without-confinement.txt)): `src/test-utils.tsx` and `src/queries/test-id.ts` (TypeScript), `Source/tSQLt.Tests.view.sql` (SQL) and `ci/test-complete` (a CI script). The edit was then undone, and `archetype.ts` has no diff.

## Each runner's rule, and where it comes from

Some rules were **asked** of the runner itself, and its answer is kept as a record. Others are the **documented** default applied to the project's own configuration, read as text. The documented route was used wherever asking would mean building, importing or running someone's code: `pytest --collect-only` imports modules and runs `conftest.py`; Jest and Vitest evaluate a project's configuration as code; `dotnet test --list-tests` builds; Maven downloads and runs plugins; Pester's discovery runs each test file's top level; `rspec --dry-run` loads the spec files. The quotes and URLs were read on 2026-11-21 by an outside-research subagent of the builder's tier.

| Language | Runner and rule | Source | Route |
| --- | --- | --- | --- |
| TypeScript, JavaScript | Vitest `include` `**/*.{test,spec}.?(c\|m)[jt]s?(x)`, `exclude` node_modules and .git (from 4.0; 2.x also excluded `dist`, `cypress` and tool configs) | `defaultInclude` in this repository's `node_modules/vitest/dist/config.js` (4.1.12); [vitest.dev/config/include](https://vitest.dev/config/include) | Asked: `npx vitest list --filesOnly` on this repository, [record](records/vitest-list.txt). The tidepool sample declares `vitest ^2.1.0`, so its 2.x default applies |
| | Jest `testMatch` `**/__tests__/**/*.?([mc])[jt]s?(x)`, `**/?(*.)+(spec\|test).?([mc])[jt]s?(x)`, which "will also find files called test.js or spec.js" | [jestjs.io/docs/configuration](https://jestjs.io/docs/configuration), `jest-config` `Defaults.ts` at v30.5.2 | Documented: dom-testing-library's own `jest.config.js` projects, over kcd-scripts 13.0.0's published config (roots `src`, testMatch `**/__tests__/**`, ignoring `/__tests__/helpers/` and `/__tests__/utils/`), read as text from unpkg |
| | Playwright: this repository's `tests/e2e/playwright.config.ts`, `testMatch: "**/*.spec.ts"` | the configuration | Documented |
| Python | pytest `python_files` `test_*.py *_test.py`, `norecursedirs`, `testpaths`; `conftest.py` is loaded as a plugin, not collected | pytest 9.2.0's own `_pytest/python.py` and `main.py`, in this machine's pytest environment | Asked of pytest's own matcher ([`pytest_files.py`](scripts/pytest_files.py)): its `fnmatch_ex` and `path_matches_patterns` over the files, with the project's `testpaths` read from `pyproject.toml`, and no project module imported. Records: [samples](records/pytest-samples.txt), [click](records/pytest-click.txt) |
| | unittest and Django: `test*.py` | [docs.python.org unittest](https://docs.python.org/3/library/unittest.html); `django/test/runner.py` | Documented; no measured project uses them |
| Go | `go test` compiles `*_test.go`; the go tool ignores `testdata` and names beginning `_` or `.` | `go help test`, go1.27.4 | Asked: `go list -e -f …TestGoFiles…XTestGoFiles…`, modules fetched from proxy.golang.org into a scratch module cache, nothing built. Records: [rosetta](records/go-list-go-rosetta.txt), [depot](records/go-list-go-depot.txt), [cobra](records/go-list-cobra.txt) |
| Rust | Cargo's test targets, `tests/*.rs` and `tests/*/main.rs` unless `autotests` is false, each target's own `mod` tree; a module under `#[cfg(test)]` is compiled for tests only; a unit test inside an implementation file leaves the file an implementation | [Cargo targets](https://doc.rust-lang.org/cargo/reference/cargo-targets.html), `targets.rs` at Cargo 0.101.0 | Asked: `cargo metadata --no-deps --offline` (cargo 1.100.0) for the targets, [records](records/), then the `mod` declarations read from the target roots and from `#[cfg(test)]` |
| Java | Maven Surefire includes `**/Test*.java`, `**/*Test.java`, `**/*Tests.java`, `**/*TestCase.java`; Failsafe `IT*`, `*IT`, `*ITCase`; under `testSourceDirectory`, by default `src/test/java` | [Surefire test mojo](https://maven.apache.org/surefire/maven-surefire-plugin/test-mojo.html), [Super POM](https://maven.apache.org/ref/current/maven-model-builder/super-pom.html) | Documented, with each `pom.xml`'s own `testSourceDirectory`. Gradle picks test classes by their compiled content and is not measured |
| .NET | No name makes a test. `dotnet test` runs a project with `IsTestProject` true, which `Microsoft.NET.Test.Sdk`'s props set (also MSTest.Sdk); the framework then finds the tests by their attributes | `Microsoft.NET.Test.Sdk.props` at vstest v18.12.0; `Microsoft.TestPlatform.targets` ("Skipping running test for project …") | Documented: each project file read as text; a file of a test project holds tests when it carries `[Fact]`, `[Theory]`, `[Test]`, `[TestCase]`, `[TestFixture]`, `[TestClass]` or `[TestMethod]` |
| Ruby | RSpec `--pattern` `spec/**{,/*/**}/*_spec.rb` under `spec`; Minitest's `TestTask` `test/**/test_*.rb`, `test/**/*_test.rb`; Rails `test/**/*_test.rb` | `rspec-core` `configuration.rb` at 3.13.7; `minitest` 6.1.0; `railties` 8.1 | Documented, with sinatra's `Rakefile` and factory_bot's `.rspec` |
| PowerShell | Pester `Run.TestExtension` `.Tests.ps1`; a file named to `Invoke-Pester` runs whatever its name | Pester `RunConfiguration.cs` at 5.9.1 and 6.2.0 | Documented, with AL-Go's `Tests/runtests.ps1` (`*.Test.ps1` in the three folders its CI names) and dbatools' workflow, which gives `Invoke-Pester` the file `gh-actions.ps1` and two siblings by name |
| SQL | tSQLt: a procedure whose name begins with `test` in a schema made a test class by `tSQLt.NewTestClass`; no file name counts | [tsqlt.org NewTestClass](https://tsqlt.org/user-guide/test-creation-and-execution/newtestclass/) | Documented, read in each `.sql` file's text |
| C, C++ | No runner names files. CTest runs what `add_test` registers | [cmake.org add_test](https://cmake.org/cmake/help/latest/command/add_test.html) | Documented, with cJSON's `tests/CMakeLists.txt`. The rosetta samples register nothing |

## The measurement

[`measure.mts`](scripts/measure.mts) walks each corpus and drops what discovery never documents (documents, lock files, `.git`, `node_modules`, binary files, which are assets). It then sets three answers side by side for every file: `resolveArchetype` today; **the runner**, meaning whether the language's runner selects the file as a test (reading (a) below); and **for the tests**, meaning the runner's answer or a file inside a test folder of the ecosystem's layout (`test`, `tests`, `spec`, `__tests__`, `__mocks__`, `__snapshots__`, `testdata`, `src/test/`), a .NET test project's file, or a support file the runner loads (`conftest.py`, a configured Jest setup file). That second answer is reading (b), turned into a rule. It is a stated approximation, not an oracle.

[`causes.mjs`](scripts/causes.mjs) sorts the disagreements by what can be seen of their cause. Run from the checkout's root: `npx tsx <record>/scripts/measure.mts <out.tsv>`, then `node <record>/scripts/causes.mjs <out.tsv> runner` (or `forTests`). The corpora's folders are named at the script's head. The full lists: [against the runner](disagreements-with-the-runner.tsv) and [against for-the-tests](disagreements-with-for-the-tests.tsv), with their [counts](counts-against-the-runner.txt) and [counts](counts-against-for-the-tests.txt).

| Corpus | Commit | Files | Tests today | By the runner (a) | For the tests (b) |
| --- | --- | ---: | ---: | ---: | ---: |
| this repository (sample roots, `.mdmd` and `AI-Agent-Workspace` aside) | `a11f7d007` and the guard | 763 | 398 | 350 | 399 |
| the sample programs (`tests/integration/programs`, under this repository's configuration) | `a11f7d007` | 354 | 46 | 33 | 34 |
| dbatools | `067b215bf843ec3573a79226ac9d2b871d1440cb` | 1,976 | 793 | 760 | 792 |
| AL-Go | `403f36ab563291207687c513c8dedd93f683f8ce` | 378 | 93 | 59 | 90 |
| AzureStack-Tools | `0e4a9f32c4677e2ee3b687032e0472b890a772b6` | 131 | 1 | 1 | 1 |
| tSQLt | `4a921d0dacfb1d66b3db124c58158c80e5e910e6` | 453 | 95 | 86 | 88 |
| DNN Platform | `9bc6b06f4f15d11f6e52446505ec3117a7c84200` | 8,714 | 627 | 208 | 607 |
| mojoPortal | `ecbaf7f406ad656ed13b7fb3390ffc881a79f9a3` | 6,716 | 22 | 0 | 21 |
| FluentValidation (xunit) | `5903fa65863ec66dabf10646b9c09b33130a03e8` | 252 | 81 | 61 | 73 |
| click (pytest) | `08b803cf32ceb2ae6a772c62d5da42757a897d44` | 122 | 60 | 43 | 59 |
| cobra (go test) | `adbc8813901bba65827259daa8e22ff94ec1f30e` | 46 | 18 | 17 | 17 |
| ripgrep (cargo) | `61f43ca6f29e64afc31792e94d855c6800db12dd` | 169 | 20 | 16 | 20 |
| gson (Maven) | `e5f02ab6c24567d3ca5200afc4076337746b3349` | 298 | 176 | 141 | 151 |
| factory_bot (RSpec) | `cf9b56fbdd0d8a54bc5ff54ec701feb9c4559083` | 177 | 86 | 73 | 86 |
| sinatra (Minitest; RSpec in two sub-gems) | `2e3f79139154b8bfdaad7ad516f35dcb0e70446a` | 274 | 132 | 76 | 197 |
| dom-testing-library (Jest) | `6049cc0bc7cf2201625c476c95fa6299d0e2fa8b` | 95 | 35 | 29 | 37 |
| cJSON (CTest) | `6d9f2443ab071f86e5d9b43025a40929ec41c46c` | 210 | 168 | 18 | 167 |
| **all** | | **21,128** | | | |

dbatools, AL-Go, AzureStack-Tools, tSQLt, DNN Platform and mojoPortal are the PowerShell, SQL and .NET builders' corpora, at the commits [the joining's account](../readers-gathering/README.md) names. The other nine were cloned anonymously and shallow on 2026-11-21. Nothing of any corpus is committed. 25 files are of a language with no runner measured in their corpus, and are left out of the disagreements: this repository's five oracle programs in C#, Java and PowerShell, which no runner names; cJSON's 2 Python and 16 Ruby scripts; one Ruby file in ripgrep; one Python file in FluentValidation.

### Today against the runner: 884 files, 873 of them called tests where no runner runs them

| Cause | Files | Languages (files) | Examples |
| --- | ---: | --- | --- |
| Data, expectations or configuration in a test folder | 374 | files no runner runs | cJSON's `tests/inputs/*`, this repository's `tests/integration/live-docs/expected/*.json`, `tests/tsconfig.json`, Jest's `__snapshots__/*.snap` |
| Code in a test folder that the runner does not select | 381 | C# 162, C/C++ 73, TS/JS 69, Ruby 28, PowerShell 20, Python 16, SQL 5, Java 4 | DNN's and FluentValidation's helpers in test projects; cJSON's vendored `tests/unity/`; `conftest.py`, `spec_helper.rb`, `spec/support/**`; this repository's `tests/page-scan/stand-ins/*.mjs`, `tests/e2e/*.ts` helpers |
| A folder name holding the word test, which no runner names | 57 | Java 19, C# 18, other 20 | gson's `test-shrinker/src/main/java/**`, `test-jpms/**`; FluentValidation's `FluentValidation.Tests.Benchmarks/**`; tSQLt's `Tests.SA/`, `TestUtil/` |
| The word test in the file's own name | 35 | TS/JS 18, other 15, C 1, SQL 1 | dom-testing-library's `src/queries/test-id.ts`; DNN's vendored CodeMirror `mode/*/test.js` (a test under Jest's default, not under Vitest's; DNN declares no runner and Vitest's was taken); cobra's and click's `.github/workflows/test*.yml`; ripgrep's `ci/test-complete`; mojoPortal's `Web/Data/test.config` |
| Named by another language's rule, or by a rule this project does not run | 30 | other 7, C/C++ 6, C# 5, SQL 4, TS/JS 4, Java 3, Ruby 1 | the rosetta samples' `test_helpers.c`, `PipelineTests.cs` (xunit without the test SDK, so `dotnet test` skips the project), `PipelineTest.java` (the pom's `sourceDirectory` is `src`, with no test source); DNN's `Build/Tasks/RunUnitTests.cs`; Sinatra's `lib/sinatra/test_helpers.rb`; tSQLt's own `Source/tSQLt.Tests.view.sql` |
| Run by the runner, today working code | 11 | SQL 4, TS/JS 3, PowerShell 3, Rust 1 | tSQLt's `TestUtilTests/*.class.sql` and `Examples/TestThatExamplesAreDeployed.sql` (test classes); dom-testing-library's `src/__node_tests__/*.js` (its Jest project's `testMatch`); dbatools' `.github/scripts/gh-actions.ps1` and two siblings (named to `Invoke-Pester`); ripgrep's `crates/searcher/src/testutil.rs` (`#[cfg(test)] mod testutil;`) |

### Today against for-the-tests: 196 files

| Direction | Files | What they are |
| --- | ---: | --- |
| Test today, neither run nor there for the tests | 104 | The last four kinds of the table above, without their test folders: working code named or placed by the word (35), folders whose names hold the word (40), and other languages' name rules (29) |
| Working code today, there for the tests | 92 | 67 of sinatra-contrib's templates and data under `spec/` (today's `spec` rule counts only `.rb`, where its `tests` rule counts every file); 10 AL-Go fixtures under `Tests/ReviewAgent/fixtures/` (the `fixtures` rule, written for this repository's own samples, reads any folder of that name as a sample's); 3 of DNN's Jest `__mocks__`; this repository's `tests/page-scan/fixtures.ts`, by the same `fixtures` rule; and the 11 files a runner runs, from the table above |

### What the measurement says

- Most of the disagreement with the runners is one question, not many bugs. 755 of the 884 are files in a test folder that no runner runs. Whether those count as tests is the fork below.
- The rest are rules that cross languages or projects, and the guard now pins each kind: C#'s `NameTests` rule read on TypeScript, SQL and JavaScript; the `test_` prefix of Python and C read on Ruby's shipped `test_helpers.rb`; the word anywhere in a path read on CI workflows, editor plugins and a benchmark project; AL-Go's own `*.Test.ps1` read on every PowerShell project; this repository's `fixtures` rule read on everyone's `fixtures` folders.
- The 2026-11-19 regression was of this kind. A rule measured on one language's corpora (`Test-DbaPath.ps1`) was applied to all of them. The confinement of 2026-11-21 left the same shape elsewhere: `RunTests.psm1` is working code, while `.github/workflows/test.yml` and DNN's `RunUnitTests.cs`, which do the same job in YAML and C#, are still tests.

## The fork: what "test" means for the map

**What the record says the Tests kind is for.** The owner has not said in so many words; these are the nearest statements found in `direction.md`, `owner.md`, the decisions log and the summaries.

- **The archetype is what a runner starts.** The decisions log, [Entry Points Are Written on the Entry](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15) (2026-10-15): "A test is an entry by its archetype and carries no line", and among the alternatives, reading the runners' include globs was refused "when the test archetype already says what a runner starts (the sweep found the globs matched all but two test files, both tooling inputs)". The pathfinder makes every test an entry (`pathfind.ts`, `isEntry`).
- **The switches set what a picture counts.** The owner on 2026-11-18 ([Turn 9](../../../2026-11-18/2026-11-18.1.record.md#turn-9)): "I would hope to see different structures depending on which permutation of file types I have active." Earlier, on 2025-11-24, they noted that "without test files enabled, the visualization code appeared as an isolated constellation" ([the summary](../../../../../2025/11/Summarized/2025-11-24.SUMMARIZED.md)). In both, the Tests switch takes away the testing apparatus and leaves the working code.
- **Two more readers of the archetype.** The Knowledge Sources panel lists "symbols used only by tests" and leaves tests out of "unreferenced" (`sources-facts.ts`). The test-backed card means a test uses the file. Both assume that a helper's users are tests.

**Reading (a): a test is a file its runner would run.** On the measured code, 884 files change: 873 tests become working code and 11 working files become tests. What follows:

- With Tests switched off, the helpers, fixtures, stand-ins, `conftest.py`, `spec_helper.rb` and test projects' models stay on the map as working code, wired to nothing that is shown. DNN keeps 419 such files, cJSON 132.
- Their symbols fill "used only by tests".
- A helper becomes "test-backed", because a test uses it.
- A support file the runner loads and nothing imports (`conftest.py`, `tests/setup-env.js`, `spec_helper.rb` by `--require`) has no entry reason and is reported unreachable. Keeping it reachable needs a new entry reason for runner support, which is a change to the grammar.

**Reading (b): a test is a file that exists for the tests,** run by the runner or not. On the measured code, 196 files change. 104 working files called tests by a word or another language's rule become working code. 92 files of test folders, test classes and test-only modules become tests. Every file the runner runs is still a test, and a test is still an entry. What follows:

- Switching Tests off takes away the whole testing apparatus, which is how the owner has used the switch.
- The cost is in reachability: an unused helper inside a test folder is an entry, and so is never reported unreachable.

**A third reading, for completeness: both facts, kept apart.** The archetype says (b), and a file its runner runs carries an `Entry: test` line, as the manifests' `command` already does. Reachability would then walk from what the runner runs, and an unused helper would show as unreachable. It costs a line in the grammar and a runner-aware entry rule per language, and it can follow (b) without undoing it.

**Recommendation: (b).** It is the reading the product already assumes in three places (the switches, "used only by tests", the test-backed card). It is the smaller change from today, and almost all of that change is a fix: working code that the word or a foreign rule called a test. Each language's test folders and test-only code come from that language's own layout and runner: Cargo's `tests/` and `#[cfg(test)]`, Maven's `src/test/`, a .NET test project, RSpec's `spec/`, pytest's `conftest.py` and `testpaths`, Go's `testdata`. They do not come from the word "test" anywhere in a path. The third reading is the natural next step if reachability inside test folders matters to the owner, and it is not needed for (b).

## The design for milestone two (not built)

**Where each rule lives.** In one table in `archetype.ts`, keyed by language, beside the guard's table and in the same order. It does not live in the readers, for three reasons. Files no reader reads need an answer too (fixture data, CI workflows, `.snap`). Some languages are read by several readers (the .NET readers; the TypeScript compiler path, which is no adapter). And the readers are another builder's files today. A language's entry gives its extensions, its runner's default name rule, and its layout's test roots:

| Language | Name rule (the runner's default) | Test roots (its layout) | Needs a fact from a reader |
| --- | --- | --- | --- |
| TS/JS | `*.test.*`, `*.spec.*` (Vitest, Jest); a file in `__tests__/`, `__mocks__/`, `__snapshots__/` | `test/`, `tests/` | later, a project's `testMatch` or `include` |
| Python | `test_*.py`, `*_test.py`; `conftest.py` | `test/`, `tests/`, a configured `testpaths` | later, `python_files` and `testpaths` from `pyproject.toml`, `pytest.ini`, `setup.cfg`, `tox.ini` |
| Go | `*_test.go` | `testdata/` | none |
| Rust | none by name (`helpers_test.rs` is a test only as a `#[cfg(test)]` module) | a package's `tests/` (beside its `Cargo.toml`) | yes: `#[cfg(test)] mod x;` makes `x.rs` test-only, so the Rust reader would report it |
| Java | Surefire's `Test*`, `*Test`, `*Tests`, `*TestCase` | `src/test/` (or the pom's `testSourceDirectory`) | later, the pom's `testSourceDirectory` |
| .NET | none by name | the folder of a project that sets `IsTestProject` or references `Microsoft.NET.Test.Sdk` / `MSTest.Sdk` | yes: the project reader already reads every `.csproj` |
| Ruby | `*_spec.rb`, `*_test.rb`, `test_*.rb` | `spec/`, `test/` | none |
| PowerShell | `*.Tests.ps1` (Pester) | `test/`, `tests/` | later, a project's own filter (AL-Go's `*.Test.ps1`) |
| SQL | none by name | `test/`, `tests/` | yes: a `tSQLt.NewTestClass` schema's `test*` procedures, which the SQL reader sees |
| C, C++ | none | `test/`, `tests/` | later, CTest's `add_test` |
| no runner's language | none | inside a root that one of the languages above marks, never by its own name | none |

**What remains shared, and the evidence for it.** A folder named exactly `test` or `tests` (one whole segment, either case) is a test root in every measured ecosystem: pytest's projects, Minitest, Cargo, Jest projects, Pester (dbatools, AL-Go's `Tests/`), CTest (cJSON) and .NET solutions (DNN's `Tests/`). The word inside a longer name is not shared. `FluentValidation.Tests.Benchmarks`, gson's `test-shrinker`, `test-id.ts`, `test.yml` and `RunUnitTests.cs` are among the 92 rows of the first table that the word alone causes, and no runner takes any of them. (mojoPortal's editor plugin, `plugins/test/`, shows that even the whole segment can be a shipped thing's name; that one is pinned `wrong`.) The `fixtures` rule is not shared either: it is this repository's own sample convention, and the configuration's `sampleRoots` already carries it.

**What stays the same.**

- A configuration override (`archetypeOverrides`) still wins first, unchanged.
- Binary content is still an asset before any rule.
- A sample root is still read from its own root: the path inside the sample is what the language's rule sees, and the project facts (a `.csproj`, a `Cargo.toml`) lie inside the sample, so they are read as they would be in its own repository.

**A project's own runner configuration, later, without a second mechanism.** The generator's first pass already builds an index of what manifests declare (the entry index, beside the symbol index). Each project reader that sees a runner's configuration would add that project's test patterns and roots, keyed by its folder. The language's rule would read the nearest entry for the file's folder, and fall back to the runner's default where there is none. That same index also carries what a reader learns of a file that its path cannot show: a .NET test project, Rust's `#[cfg(test)]`, tSQLt's test classes.

- The readers that would contribute already exist: the JSON reader (`package.json`'s `jest` key), the pyproject reader, the project reader (`.csproj`), the pom reader and the Cargo reader.
- Configuration written as code (`vitest.config.ts`, `jest.config.js`) is not evaluated, as the decision of 2026-10-15 refused. Only literal values written in place would be read.
- The guard grows one row per moved answer, each with the runner's word beside it.

**What it would change, measured.** On the corpora above, the moves are the 196 rows of the second table, each listed in [the file](disagreements-with-for-the-tests.tsv), less what a project's own configuration adds later. On this repository, one file moves: `tests/page-scan/fixtures.ts` becomes a test, like its siblings. The guard's `wrong` rows would turn to agree, and its `fork` rows would stay as they are under (b).
