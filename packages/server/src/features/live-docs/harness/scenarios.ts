import type { LiveDocumentationConfigInput } from "@live-documentation/shared/config/liveDocumentationConfig";

/** Describes a single headless harness scenario with its fixture path and generator config. */
export interface HeadlessHarnessScenario {
  name: string;
  description: string;
  /** Fixture path relative to the repository root. */
  fixturePath: string;
  /** Glob patterns forwarded to the Live Docs generator. */
  glob: string[];
  /** Optional include overrides passed directly to the generator. */
  include?: string[];
  /** Additional Live Documentation configuration overrides. */
  config?: Partial<LiveDocumentationConfigInput>;
  /** Whether the scenario should materialise System views. */
  system?: boolean;
}

/** Built-in headless harness scenarios for polyglot integration testing. */
export const HEADLESS_HARNESS_SCENARIOS: readonly HeadlessHarnessScenario[] = [
  {
    name: "ruby-cli",
    description: "Ruby CLI fixture exercising YARD docstrings and dependency edges.",
    fixturePath: "tests/integration/benchmarks/fixtures/ruby/cli",
    glob: ["lib/**/*.rb"],
    include: [],
    system: true
  },
  {
    name: "python-basics",
    description: "Python basics fixture validating reStructuredText docstrings.",
    fixturePath: "tests/integration/benchmarks/fixtures/python/basics",
    glob: ["src/**/*.py"],
    system: true
  },
  {
    name: "csharp-advanced",
    description: "C# advanced symbols fixture covering XML doc comments and inheritance.",
    fixturePath: "tests/integration/benchmarks/fixtures/csharp-advanced-symbols",
    glob: ["**/*.cs"],
    system: true
  }
];

/** Returns a mutable copy of all built-in headless harness scenarios. */
export function listScenarios(): HeadlessHarnessScenario[] {
  return [...HEADLESS_HARNESS_SCENARIOS];
}

/** Looks up a built-in scenario by its `name` field. */
export function getScenarioByName(name: string): HeadlessHarnessScenario | undefined {
  return HEADLESS_HARNESS_SCENARIOS.find((scenario) => scenario.name === name);
}
