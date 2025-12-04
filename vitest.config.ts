import path from "node:path";
import { defineConfig } from "vitest/config";

const sharedSrc = path.resolve(__dirname, "packages/shared/src");
const scriptsSrc = path.resolve(__dirname, "packages/scripts/src");

const toPosix = (value: string): string => value.split(path.sep).join("/");

const withTrailingSeparator = (value: string): string => {
  const normalized = toPosix(value);
  return normalized.endsWith("/") ? normalized : `${normalized}/`;
};

const sharedSrcEntry = toPosix(path.join(sharedSrc, "index.ts"));
const scriptsSrcEntry = toPosix(path.join(scriptsSrc, "index.ts"));

export default defineConfig({
  resolve: {
    alias: [
      {
        find: "@copilot-improvement/shared",
        replacement: sharedSrcEntry
      },
      {
        find: /^@live-documentation\/shared$/u,
        replacement: sharedSrcEntry
      },
      {
        find: /^@live-documentation\/shared\/(.+)$/u,
        replacement: `${withTrailingSeparator(sharedSrc)}$1`
      },
      {
        find: /^@live-documentation\/scripts$/u,
        replacement: scriptsSrcEntry
      },
      {
        find: /^@live-documentation\/scripts\/(.+)$/u,
        replacement: `${withTrailingSeparator(scriptsSrc)}$1`
      }
    ]
  },
  test: {
    globals: true,
    environment: "node",
    include: [
      "packages/shared/src/**/*.test.ts",
      "packages/server/src/**/*.test.ts",
      "packages/extension/src/**/*.test.ts",
      "packages/scripts/src/**/*.test.ts",
      "scripts/**/*.test.ts",
      "tests/integration/slopcop/**/*.test.ts"
    ],
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 1
      }
    },
    coverage: {
      enabled: true,
      reporter: ["text-summary", "html"],
      reportsDirectory: "coverage",
      include: ["packages/**/src/**/*.{ts,tsx}"],
      exclude: [
        "scripts/**/*.ts",
        "tests/**",
        "AI-Agent-Workspace/**",
        ".vscode-test/**",
        "coverage/**",
        "packages/extension/src/extension.ts"
      ]
    }
  }
});
