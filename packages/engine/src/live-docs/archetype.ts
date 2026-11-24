/**
 * Archetype resolution for Live Documentation.
 *
 * @remarks
 * This module determines which archetype (implementation, test or asset)
 * applies to a given source file: a configuration override first, then the
 * file's content (a binary file is an asset, wherever it lies), then the rule of
 * tests of the file's own language ({@link TEST_RULES}), read within a sample
 * root as it would be outside one.
 *
 * @module
 */


import type {
  LiveDocumentationConfig,
  LiveDocumentationArchetype
} from "../config/liveDocumentationConfig";
import { cSyntax } from "../languages/c";
import { csharpSyntax } from "../languages/csharp";
import { goSyntax } from "../languages/go";
import { javaSyntax } from "../languages/java";
import { powershellSyntax } from "../languages/powershell";
import { pythonSyntax } from "../languages/python";
import { rubySyntax } from "../languages/ruby";
import { rustSyntax } from "../languages/rust";
import path from "../tooling/enginePath";
import { unmarkedUtf16 } from "../tooling/sourceText";
import { SUPPORTED_SCRIPT_EXTENSIONS } from "./coreConstants";
import type { WorkspaceTestIndex } from "./coreTypes";
import { UNREAD_NOTE } from "./document";

/** How much of a file's head {@link isBinaryContent} reads: git's own window for the same question. */
export const BINARY_SNIFF_BYTES = 8000;

/**
 * True when a file's content is binary: a NUL byte within its first
 * {@link BINARY_SNIFF_BYTES} bytes, as git decides it, except that a text file
 * in UTF-16 or UTF-32 announced by its byte order mark is text, since a
 * Windows PowerShell script is often written that way, and a head the one reading step reads as UTF-16 without a
 * mark (`unmarkedUtf16`) is text too (the joining of 2026-11-19). The dividing line is the
 * owner's (2026-10-16): "plaintext/near-plain-text versus binary. It should be
 * that simple." An archive that holds text would be text by that rule and
 * is not read today, since discovery admits no archive.
 */
export function isBinaryContent(head: Uint8Array): boolean {
  const [a, b, c, d] = head;
  if (head.length >= 2 && ((a === 0xff && b === 0xfe) || (a === 0xfe && b === 0xff))) return false;
  if (head.length >= 4 && a === 0 && b === 0 && c === 0xfe && d === 0xff) return false;
  // A head the one reading step reads as UTF-16 without a mark is text, by the step's own rule, not binary for its zeros.
  const sniffed = head.subarray(0, Math.min(head.length, BINARY_SNIFF_BYTES));
  if (unmarkedUtf16(sniffed.subarray(0, sniffed.length - (sniffed.length % 2))) !== undefined) return false;
  const limit = Math.min(head.length, BINARY_SNIFF_BYTES);
  for (let index = 0; index < limit; index += 1) {
    if (head[index] === 0) return true;
  }
  return false;
}

/**
 * What makes a file a test, language by language: the rule a language's own
 * test runner and project layout give, applied to that language's files only.
 *
 * @remarks
 * A test is a file that exists for the tests, whether or not the runner runs it
 * (reading (b) of the record of 2026-11-21, decided that day): a test file, its
 * helpers, fixtures and data. A language's entry names its files, the runner's
 * default `name` for a test file, and the `roots` of its layout, the folders
 * whose files are there for the tests. Every language shares one root, a whole
 * folder named `test` or `tests` (in any case): the only rule every measured
 * ecosystem holds. The word inside a longer name is no rule (`test-utils.tsx`,
 * `FluentValidation.Tests.Benchmarks/`, `.github/workflows/test.yml`), nor is a
 * name a runner of another language uses (`runTests.ts` by C#'s `NameTests`).
 * A file of no runner's language (data, configuration, markup) is a test only
 * inside a root: the shared one, or a language's `roots`; never by its own name,
 * and never inside an `ownRoots` folder, which holds that language's tests and
 * elsewhere names something else (Ruby's `spec/`; an OpenAPI `spec/`).
 *
 * Before 2026-11-21 one list of every language's names, and the word anywhere in
 * a path, was applied to every file, so that a change measured on one language
 * moved the others (`src/test-utils.tsx` on 2026-11-19, by PowerShell's rule).
 * The guard, `archetype.languages.test.ts`, holds a row per language and per
 * moved answer with the runner's word beside it; the runners' rules, their
 * sources and the measurement are in the record,
 * `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/test-rules/README.md`.
 *
 * Three languages need a fact a reader sees and a path does not, which the first
 * pass gathers into the {@link WorkspaceTestIndex}: in .NET, a test project (it
 * sets `IsTestProject`, which `Microsoft.NET.Test.Sdk` sets, or its SDK is
 * `MSTest.Sdk`) makes the files of its folder tests, .NET's and those of no
 * runner's language, the nearest project's folder deciding; in Rust, a module
 * declared under `#[cfg(test)]` is built for the tests alone, and so is every
 * module beneath it; in SQL, a script that creates a `test…` procedure in a
 * schema made a tSQLt test class holds tests. Without the index (a caller that
 * has none, a unit test) those facts are simply absent.
 */
interface TestRule {
  /** The extensions of the language's files, lowercase with the dot. */
  readonly extensions: readonly string[];
  /** The runner's default name of a test file, tested against the file's own name: a test wherever it lies. */
  readonly name?: RegExp;
  /** Folders of the layout whose files, of this language or of none, are there for the tests: a segment, or a run of segments. */
  readonly roots?: readonly string[];
  /** Folders whose files of this language alone are there for the tests. */
  readonly ownRoots?: readonly string[];
  /** A test project's folder holds this language's tests ({@link WorkspaceTestIndex.projects}). */
  readonly testProjects?: true;
}

/** The folder every language takes for a test root: a whole segment named `test` or `tests`, in any case. */
const SHARED_ROOTS: readonly string[] = ["test", "tests"];

/** Each language's rule of tests, from its runner's default and its layout; the runners' words are in the guard and the record. */
export const TEST_RULES: Readonly<Record<string, TestRule>> = {
  // Vitest's include `**/*.{test,spec}.?(c|m)[jt]s?(x)` and Jest's testMatch, which adds a file named test.js and any
  // file under __tests__; Jest's manual mocks and snapshots.
  "TypeScript and JavaScript": { extensions: [...SUPPORTED_SCRIPT_EXTENSIONS], name: /(?:^|\.)(?:test|spec)\.[^.]+$/, roots: ["__tests__", "__mocks__", "__snapshots__"] },
  // pytest's python_files `test_*.py *_test.py` and its conftest.py; unittest's and Django's tests.py.
  Python: { extensions: pythonSyntax.extensions, name: /^(?:test_.*|.*_test|conftest|tests?)\.py$/ },
  // `go test`'s `*_test.go`; the go tool's testdata.
  Go: { extensions: goSyntax.extensions, name: /_test\.go$/, roots: ["testdata"] },
  // Maven Surefire's `*Test`, `*Tests`, `*TestCase`; Maven's and Gradle's test source set.
  Java: { extensions: javaSyntax.extensions, name: /(?:Tests?|TestCase)\.java$/, roots: ["src/test"] },
  // RSpec's `*_spec.rb` under spec/, Minitest's `*_test.rb`; a `test_*.rb` only under test/ (Sinatra ships lib/sinatra/test_helpers.rb).
  Ruby: { extensions: rubySyntax.extensions, name: /_(?:spec|test)\.rb$/, ownRoots: ["spec"] },
  // Pester's Run.TestExtension `.Tests.ps1`, without regard to case as on Windows; a project's own filter (AL-Go's
  // `*.Test.ps1`) is that project's configuration. A verb's name (`Test-DbaPath.ps1`) is no test.
  PowerShell: { extensions: powershellSyntax.extensions, name: /\.Tests\.ps1$/i },
  // No runner names C or C++ files (CTest runs what add_test registers); the names its projects use, Ceedling's
  // `test_` prefix, GoogleTest's `_test` and `Test` suffixes, and a file named for the word (cJSON registers test.c).
  "C and C++": { extensions: cSyntax.extensions, name: /^tests?\.[^.]+$|^test_[^.]+\.[^.]+$|_test\.[^.]+$|Tests?\.[^.]+$/ },
  // No name makes a test for `dotnet test`: a test project does, its folder's files tests. The name the frameworks'
  // projects give a class of tests (`ParcelTests.cs`) is kept for a C# file outside one, where a project references a
  // framework without the test SDK (the rosetta sample). The .NET readers' files: C#, project files, solutions,
  // .config and ASP.NET markup.
  ".NET": { extensions: [...csharpSyntax.extensions, ".csproj", ".vbproj", ".fsproj", ".sln", ".slnx", ".config", ".aspx", ".ascx", ".master", ".ashx", ".asmx", ".asax", ".svc", ".cshtml", ".razor"], name: /Tests?\.cs$/, testProjects: true },
  // Cargo's tests/, the shared root, and the modules declared under #[cfg(test)], from the Rust reader. No name counts.
  Rust: { extensions: rustSyntax.extensions },
  // tSQLt's test classes, from the SQL reader: the scripts of their test* procedures. No file name counts.
  SQL: { extensions: [".sql"] }
};

/** The roots in which a file of no runner's language is a test: the shared ones and every language's `roots`. */
const ROOTS_OF_EVERY_FILE: readonly string[] = [...SHARED_ROOTS, ...Object.values(TEST_RULES).flatMap(rule => rule.roots ?? [])];

/** The rule of the language a file belongs to, by its extension; none for a file of no runner's language. */
function testRuleOf(basename: string): TestRule | undefined {
  const extension = path.extname(basename).toLowerCase();
  return extension ? Object.values(TEST_RULES).find(rule => rule.extensions.includes(extension)) : undefined;
}

/** True when one of the folders holding a file is a root: a whole segment, or a run of whole segments, without regard to case. */
function withinRoot(folders: readonly string[], roots: readonly string[]): boolean {
  const lower = folders.map(folder => folder.toLowerCase());
  return roots.some(root => {
    const run = root.toLowerCase().split("/");
    return lower.some((_, start) => run.every((segment, offset) => lower[start + offset] === segment));
  });
}

/**
 * True when the nearest .NET project holding the file, within its sample root if it lies in one, is a test project:
 * the project whose folder is the file's own or the closest above it, as an SDK project compiles every file beneath it.
 */
function inTestProject(sourcePath: string, sampleRoot: string | undefined, tests: WorkspaceTestIndex | undefined): boolean {
  if (!tests || tests.projects.size === 0) return false;
  const top = sampleRoot === undefined || sampleRoot === "." ? "" : sampleRoot;
  for (let folder = path.posix.dirname(sourcePath); ; folder = path.posix.dirname(folder)) {
    const key = folder === "." ? "" : folder;
    const test = tests.projects.get(key);
    if (test !== undefined) return test;
    if (key === top || key === "") return false;
  }
}

/**
 * Determines which Live Documentation archetype applies to a given source file.
 *
 * @remarks
 * Explicit `archetypeOverrides` from the configuration take precedence. Then a
 * binary file is an asset, wherever it lies (`binary` is the caller's reading of
 * the content, {@link isBinaryContent}); the asset extensions of discovery say
 * which files are found, and the content says what they are. Then the rule of
 * tests of the file's own language decides ({@link TEST_RULES}), with the facts
 * the readers report (`tests`), and within a sample root it reads the path
 * inside the sample, so that a sample's own `tests/` folder is a test folder and
 * the harness around the sample is not. Everything else is implementation: a
 * sample's manifest, configuration, data or SQL file is as much its code as it
 * is anywhere else (the owner's rule of 2026-10-16, which retired the
 * fixtures-era rule that called every non-code file under a sample root an
 * asset). A folder named `fixtures` is a sample's only where the
 * configuration's `sampleRoots` name it.
 *
 * @param sourcePath - Workspace-relative source path using forward slashes.
 * @param config - Live Documentation configuration containing archetype overrides.
 * @param binary - Whether the file's content is binary; false when not known.
 * @param tests - The readers' facts of which files exist for the tests, from the first pass; absent, none is known.
 *
 * @returns The archetype that should be reflected in the generated markdown metadata.
 *
 * @example
 * ```ts
 * const archetype = resolveArchetype("packages/app/src/main.test.ts", config);
 * // archetype === "test"
 * ```
 */
export function resolveArchetype(
  sourcePath: string,
  config: LiveDocumentationConfig,
  binary = false,
  tests?: WorkspaceTestIndex
): LiveDocumentationArchetype {
  const overrides = config.archetypeOverrides ?? {};
  for (const [pattern, archetype] of Object.entries(overrides)) {
    if (matchesPathPattern(sourcePath, pattern)) {
      return archetype;
    }
  }

  if (binary) {
    return "asset";
  }

  // What a reader saw that the path does not say: a Rust module built for the tests alone, a script of a tSQLt test class.
  if (tests?.files.has(sourcePath)) {
    return "test";
  }

  const basename = path.basename(sourcePath);
  const rule = testRuleOf(basename);
  // Within a sample root, the path inside the sample: the sample is read as it would be as its own repository.
  const sampleRoot = sampleRootOf(sourcePath, config);
  const inner = sampleRoot === undefined || sampleRoot === "." ? sourcePath : sourcePath.slice(sampleRoot.length + 1);
  const folders = path.posix.dirname(inner).split("/").filter(folder => folder !== "." && folder !== "");
  const testProject = (rule === undefined || rule.testProjects === true) && inTestProject(sourcePath, sampleRoot, tests);
  if (rule === undefined) {
    return testProject || withinRoot(folders, ROOTS_OF_EVERY_FILE) ? "test" : "implementation";
  }
  if (testProject || rule.name?.test(basename) || withinRoot(folders, [...SHARED_ROOTS, ...(rule.roots ?? []), ...(rule.ownRoots ?? [])])) {
    return "test";
  }
  return "implementation";
}

/** The longest configured sample root that holds the path, `.` for a sample opened as its own workspace. */
function sampleRootOf(sourcePath: string, config: LiveDocumentationConfig): string | undefined {
  return [...config.sampleRoots].sort((a, b) => b.length - a.length)
    .find(root => root === "." || sourcePath === root || sourcePath.startsWith(`${root}/`));
}

/**
 * Checks whether an authored markdown block carries information beyond the default placeholders and the note a doc of a file no reader handles starts with.
 *
 * @param authoredBlock - Raw markdown captured between the `## Authored` markers.
 *
 * @returns `true` when the block contains substantive content, otherwise `false`.
 */
export function hasMeaningfulAuthoredContent(authoredBlock?: string): boolean {
  if (!authoredBlock) {
    return false;
  }

  const normalized = authoredBlock.replace(/\r?\n/g, "\n").trim();
  if (!normalized) {
    return false;
  }

  const sanitized = normalized
    .replace(UNREAD_NOTE, "")
    .replace(/###\s+Purpose/gi, "")
    .replace(/###\s+Notes/gi, "")
    .replace(/_Pending authored purpose_/gi, "")
    .replace(/_Pending notes_/gi, "")
    .replace(/_Pending purpose_/gi, "")
    .replace(/_Pending_/gi, "")
    .replace(/\s+/g, "");

  return sanitized.length > 0;
}

/**
 * True when a workspace-relative path matches a configuration pattern: a path
 * exactly, or a glob in which `*` stands for anything within one segment and
 * `**` for anything across segments. The archetype overrides and the declared
 * entry points are read by this rule; `exclude` without regard to case where
 * git ignores case in the repository (`ignoreCase`).
 */
export function matchesPathPattern(sourcePath: string, pattern: string, ignoreCase = false): boolean {
  return new RegExp(globPatternToRegExp(pattern), ignoreCase ? "i" : "").test(sourcePath);
}

// ============================================================================
// Internal Helpers
// ============================================================================

function globPatternToRegExp(pattern: string): string {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "(.+?)")
    .replace(/\*/g, "([^/]*)");
  return `^${escaped}$`;
}
