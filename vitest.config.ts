import path from "node:path";
import { defaultExclude, defineConfig } from "vitest/config";

const engineSrc = path.resolve(__dirname, "packages/engine/src");
const explorerSrc = path.resolve(__dirname, "packages/explorer/src");
const generatorSrc = path.resolve(__dirname, "packages/generator/src");

// Suites measured to miss the unchanged five-second deadline under parallel load: numerical oracle comparisons and
// full-history replay work. They run in `unit-serial`, alone after every other file; all cases remain.
const serialUnitFiles = [
  "packages/explorer/src/client/views/forceGraphPhysics.test.ts",
  "packages/engine/src/live-docs/history/sequence.test.ts",
  "scripts/layout-lab/approximation.test.ts",
  // The lens-key case reads the summarizing process's whole import closure with the TypeScript parser: 1.7 s alone,
  // past five seconds at a load of 20 to 40 (the joining of 2026-11-19). Its time is its own work, not the product's.
  "packages/generator/src/history/generatorIdentity.test.ts",
  // 200 names held to the reference CommonMark parser: 3.3 s alone, past five seconds under the same load. The
  // property is not trimmed and the bound not raised; the suite runs alone.
  "packages/engine/src/live-docs/document.fuzz.test.ts",
  // The stored form's suites: going on from four cuts of a scan of 773 files took 4.3 s at a load of 39, and 6.0 s
  // beside the fuzzer (2026-11-22); the fuzzer holds two 256 MiB buffers and a worker for 22 s. All cases remain.
  "packages/stored-form/test/storedForm.test.ts",
  "packages/stored-form/test/storedForm.fuzz.test.ts"
];

const toPosix = (value: string): string => value.split(path.sep).join("/");

const withTrailingSeparator = (value: string): string => {
  const normalized = toPosix(value);
  return normalized.endsWith("/") ? normalized : `${normalized}/`;
};

export default defineConfig({
  resolve: {
    // Prefer sources over any compiled twin sitting beside them; otherwise a stray
    // `foo.js` next to `foo.ts` is what the tests silently exercise.
    extensions: [".ts", ".tsx", ".mts", ".mjs", ".js", ".json"],
    alias: [
      {
        find: /^@live-documentation\/engine\/(.+)$/u,
        replacement: `${withTrailingSeparator(engineSrc)}$1`
      },
      {
        find: /^@live-documentation\/explorer\/(.+)$/u,
        replacement: `${withTrailingSeparator(explorerSrc)}$1`
      },
      {
        find: /^@live-documentation\/generator\/(.+)$/u,
        replacement: `${withTrailingSeparator(generatorSrc)}$1`
      }
    ]
  },
  test: {
    globals: true,
    environment: "node",
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: [
            "packages/engine/src/**/*.test.ts",
            "packages/generator/src/**/*.test.ts",
            "packages/explorer/src/**/*.test.ts",
            "packages/stored-form/test/**/*.test.ts",
            "scripts/**/*.test.ts",
            "tests/integration/slopcop/**/*.test.ts",
            "tests/e2e/**/*.test.ts"
          ],
          exclude: [...defaultExclude, ...serialUnitFiles]
        }
      },
      {
        extends: true,
        test: {
          name: "unit-serial",
          include: serialUnitFiles,
          // One worker, in a later group than every other project's files, so that nothing runs beside these
          // suites: parallel runs exceeded their unchanged deadlines. The measurements are in this file's Live Doc.
          maxWorkers: 1,
          sequence: { groupOrder: 1 }
        }
      },
      {
        extends: true,
        test: {
          name: "integration",
          // With the first, browserless level of the check that the engine runs in a page, which bundles the engine.
          include: ["tests/integration/live-docs/**/*.test.ts", "tests/page-scan/**/*.test.ts"],
          // Every suite here runs the generator over a fixture workspace or spawns
          // the CLI through tsx; both take seconds, not milliseconds.
          testTimeout: 120_000,
          hookTimeout: 180_000
        }
      }
    ],
    // Off unless asked for (`npx vitest run --coverage`). It was on from the scaffolding commit and nothing read its
    // report: no threshold, no CI artifact, and each run empties the folder the last one wrote. Its instrumentation
    // made the physics suite's exact-loop comparisons five times as slow: one case takes 0.9 to 1.1 s without it and
    // 4.9 to 6.1 s with it, against the five-second deadline (measured 2026-11-18, when the gate stopped on that case).
    coverage: {
      enabled: false,
      reporter: ["text-summary", "html"],
      reportsDirectory: "coverage",
      include: ["packages/**/src/**/*.{ts,tsx}"],
      exclude: [
        "scripts/**/*.ts",
        "tests/**",
        "AI-Agent-Workspace/**",
        "coverage/**"
      ]
    }
  }
});
