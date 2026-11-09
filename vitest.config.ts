import path from "node:path";
import { defaultExclude, defineConfig } from "vitest/config";

const engineSrc = path.resolve(__dirname, "packages/engine/src");
const explorerSrc = path.resolve(__dirname, "packages/explorer/src");
const generatorSrc = path.resolve(__dirname, "packages/generator/src");

// Suites measured to miss the unchanged five-second deadline under parallel load: numerical oracle comparisons and
// full-history replay work. They run in `unit-serial`, alone after every other file; all cases and coverage remain.
const serialUnitFiles = [
  "packages/explorer/src/client/views/forceGraphPhysics.test.ts",
  "packages/engine/src/live-docs/history/sequence.test.ts",
  "scripts/layout-lab/approximation.test.ts"
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
          include: ["tests/integration/live-docs/**/*.test.ts"],
          // Every suite here runs the generator over a fixture workspace or spawns
          // the CLI through tsx; both take seconds, not milliseconds.
          testTimeout: 120_000,
          hookTimeout: 180_000
        }
      }
    ],
    coverage: {
      enabled: true,
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
