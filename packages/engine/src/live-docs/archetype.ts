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

import path from "node:path";

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
import { unmarkedUtf16 } from "../tooling/sourceText";
import { SUPPORTED_SCRIPT_EXTENSIONS } from "./coreConstants";
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
 * Three languages are interim (`interim`): .NET, where a test project's
 * reference to the test SDK makes its files tests; Rust, where a module
 * declared under `#[cfg(test)]` is compiled for the tests alone; SQL, where
 * tSQLt's test classes are the tests. Each needs a fact a reader sees and a path
 * does not, so until the readers report it their files keep the reading of
 * before the table exactly ({@link interimReading}), and so does a file of no
 * runner's language in a folder named as a test project is named
 * ({@link isInterimTestProjectFolder}), so that nothing of theirs gets worse
 * while it waits.
 */
interface TestRule {
  /** The extensions of the language's files, lowercase with the dot. */
  readonly extensions: readonly string[];
  /** Exact names of the language's files that their extension does not give: its manifest. */
  readonly fileNames?: readonly string[];
  /** The runner's default name of a test file, tested against the file's own name: a test wherever it lies. */
  readonly name?: RegExp;
  /** Folders of the layout whose files, of this language or of none, are there for the tests: a segment, or a run of segments. */
  readonly roots?: readonly string[];
  /** Folders whose files of this language alone are there for the tests. */
  readonly ownRoots?: readonly string[];
  /** Read as before the table until a reader reports the fact the honest rule needs ({@link interimReading}). */
  readonly interim?: true;
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
  // Interim: a test project's files, by the project's reference to Microsoft.NET.Test.Sdk, MSTest.Sdk or IsTestProject.
  // The .NET readers' files: C#, project files, solutions, .config and ASP.NET markup.
  ".NET": { extensions: [...csharpSyntax.extensions, ".csproj", ".vbproj", ".fsproj", ".sln", ".slnx", ".config", ".aspx", ".ascx", ".master", ".ashx", ".asmx", ".asax", ".svc", ".cshtml", ".razor"], interim: true },
  // Interim: Cargo's tests/ and the modules declared under #[cfg(test)].
  Rust: { extensions: rustSyntax.extensions, fileNames: ["Cargo.toml"], interim: true },
  // Interim: tSQLt's test classes, whose test* procedures are the tests; no file name counts. With the database
  // projects (`.sqlproj`) that hold them, as tSQLt's own TestUtilTests.sqlproj.
  SQL: { extensions: [".sql", ".sqlproj"], interim: true }
};

/** The roots in which a file of no runner's language is a test: the shared ones and every language's `roots`. */
const ROOTS_OF_EVERY_FILE: readonly string[] = [...SHARED_ROOTS, ...Object.values(TEST_RULES).flatMap(rule => rule.roots ?? [])];

/** The rule of the language a file belongs to, by its exact name or its extension; none for a file of no runner's language. */
function testRuleOf(basename: string): TestRule | undefined {
  const extension = path.extname(basename).toLowerCase();
  const rules = Object.values(TEST_RULES);
  return rules.find(rule => rule.fileNames?.includes(basename)) ?? (extension ? rules.find(rule => rule.extensions.includes(extension)) : undefined);
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
 * Determines which Live Documentation archetype applies to a given source file.
 *
 * @remarks
 * Explicit `archetypeOverrides` from the configuration take precedence. Then a
 * binary file is an asset, wherever it lies (`binary` is the caller's reading of
 * the content, {@link isBinaryContent}); the asset extensions of discovery say
 * which files are found, and the content says what they are. Then the rule of
 * tests of the file's own language decides ({@link TEST_RULES}), and within a
 * sample root it reads the path inside the sample, so that a sample's own
 * `tests/` folder is a test folder and the harness around the sample is not.
 * Everything else is implementation: a sample's manifest, configuration, data or
 * SQL file is as much its code as it is anywhere else (the owner's rule of
 * 2026-10-16, which retired the fixtures-era rule that called every non-code
 * file under a sample root an asset). A folder named `fixtures` is a sample's
 * only where the configuration's `sampleRoots` name it.
 *
 * @param sourcePath - Workspace-relative source path using forward slashes.
 * @param config - Live Documentation configuration containing archetype overrides.
 * @param binary - Whether the file's content is binary; false when not known.
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
  binary = false
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

  const basename = path.basename(sourcePath);
  const rule = testRuleOf(basename);
  if (rule?.interim) {
    return interimReading(sourcePath, config);
  }

  // Within a sample root, the path inside the sample: the sample is read as it would be as its own repository.
  const sampleRoot = sampleRootOf(sourcePath, config);
  const inner = sampleRoot === undefined || sampleRoot === "." ? sourcePath : sourcePath.slice(sampleRoot.length + 1);
  const folders = path.posix.dirname(inner).split("/").filter(folder => folder !== "." && folder !== "");
  if (rule === undefined) {
    return withinRoot(folders, ROOTS_OF_EVERY_FILE) || folders.some(isInterimTestProjectFolder) ? "test" : "implementation";
  }
  if (rule.name?.test(basename) || withinRoot(folders, [...SHARED_ROOTS, ...(rule.roots ?? []), ...(rule.ownRoots ?? [])])) {
    return "test";
  }
  return "implementation";
}

/**
 * Interim, beside {@link interimReading}: a folder named as a .NET or database test project is named, a dotted name
 * with `Test` or `Tests` as one of its parts (`FluentValidation.Tests`, tSQLt's `Tests.SA`). A file of no runner's
 * language inside one (a `.resx`, `xunit.runner.json`, a `.sqlproj`) is there for that project's tests, which the
 * project's reference to the test SDK will say once the readers report it; until then the folder's name keeps the
 * answer it had before the table.
 */
function isInterimTestProjectFolder(folder: string): boolean {
  return folder.includes(".") && /(?:^|\.)tests?(?:\.|$)/i.test(folder);
}

/** The longest configured sample root that holds the path, `.` for a sample opened as its own workspace. */
function sampleRootOf(sourcePath: string, config: LiveDocumentationConfig): string | undefined {
  return [...config.sampleRoots].sort((a, b) => b.length - a.length)
    .find(root => root === "." || sourcePath === root || sourcePath.startsWith(`${root}/`));
}

/**
 * Interim, for the languages whose honest rule needs a reader's fact (.NET's test
 * projects, Rust's `#[cfg(test)]` modules, tSQLt's test classes): the reading of
 * before the table, exactly, for their files alone, until the readers report the
 * fact through the first pass's index. Every language's name is a test name here
 * (`FooTests.cs`, `foo_test.rs`), the word anywhere in the path makes a test, and
 * a folder named `fixtures` or `__fixtures__` is read as a sample's.
 */
function interimReading(sourcePath: string, config: LiveDocumentationConfig): LiveDocumentationArchetype {
  const basename = path.basename(sourcePath);
  if (/\.(test|spec)\.[^.]+$/.test(basename) || /_test\.[^.]+$/.test(basename) || /^test_[^.]+\.[^.]+$/.test(basename) ||
      /Tests?\.[^.]+$/.test(basename) || /_spec\.[^.]+$/.test(basename)) {
    return "test";
  }
  const sampleRoot = sampleRootOf(sourcePath, config);
  if (sampleRoot !== undefined || sourcePath.includes("/__fixtures__/") || /\bfixtures\b/.test(sourcePath)) {
    const fixtureRoot = sourcePath.match(/^(.*\/)?(?:__fixtures__|fixtures)\//)?.[0];
    const samplePath = sampleRoot === "." ? sourcePath
      : sampleRoot !== undefined ? sourcePath.slice(sampleRoot.length + 1)
      : fixtureRoot ? sourcePath.slice(fixtureRoot.length) : "";
    return /(?:^|\/)(?:tests?|__tests__)(?:\/|$)/i.test(path.posix.dirname(samplePath)) ? "test" : "implementation";
  }
  return /\btests?\b|__tests__/i.test(sourcePath) ? "test" : "implementation";
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
