import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { describe, expect, it, beforeEach, afterEach } from "vitest";

import type { WorkspaceFileIndex } from "./index";
import { jsonAdapter } from "./json";

describe("JSON Adapter", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "json-adapter-test-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe("file index requirement", () => {
    it("returns empty dependencies when file index is not provided", async () => {
      const jsonPath = path.join(tempDir, "config.json");
      fs.writeFileSync(jsonPath, JSON.stringify({ file: "./src/index.ts" }));

      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(0);
    });

    it("returns empty dependencies when file index is empty", async () => {
      const jsonPath = path.join(tempDir, "config.json");
      fs.writeFileSync(jsonPath, JSON.stringify({ file: "./src/index.ts" }));

      const fileIndex: WorkspaceFileIndex = new Set();
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(0);
    });
  });

  describe("reference detection", () => {
    it("extracts relative path references with ./", async () => {
      const jsonPath = path.join(tempDir, "config.json");
      fs.writeFileSync(jsonPath, JSON.stringify({
        include: ["./src/index.ts"]
      }));

      const fileIndex: WorkspaceFileIndex = new Set(["src/index.ts"]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      expect(result!.dependencies[0].specifier).toBe("./src/index.ts");
      expect(result!.dependencies[0].resolvedPath).toBe("src/index.ts");
    });

    it("extracts relative path references with ../", async () => {
      // Create nested structure: tempDir/src/nested/config.json -> tempDir/lib/utils.ts
      const srcDir = path.join(tempDir, "src", "nested");
      const libDir = path.join(tempDir, "lib");
      fs.mkdirSync(srcDir, { recursive: true });
      fs.mkdirSync(libDir, { recursive: true });

      const jsonPath = path.join(srcDir, "config.json");
      fs.writeFileSync(jsonPath, JSON.stringify({
        util: "../../lib/utils.ts"
      }));

      const fileIndex: WorkspaceFileIndex = new Set(["lib/utils.ts"]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      expect(result!.dependencies[0].specifier).toBe("../../lib/utils.ts");
      expect(result!.dependencies[0].resolvedPath).toBe("lib/utils.ts");
    });

    it("extracts workspace-relative path references", async () => {
      const jsonPath = path.join(tempDir, "config.json");
      fs.writeFileSync(jsonPath, JSON.stringify({
        entry: "packages/engine/src/index.ts"
      }));

      const fileIndex: WorkspaceFileIndex = new Set([
        "packages/engine/src/index.ts"
      ]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      expect(result!.dependencies[0].specifier).toBe("packages/engine/src/index.ts");
      expect(result!.dependencies[0].resolvedPath).toBe("packages/engine/src/index.ts");
    });

    it("extracts bare filename references in same directory", async () => {
      const jsonPath = path.join(tempDir, "config.json");
      fs.writeFileSync(jsonPath, JSON.stringify({
        expected: "expected.json"
      }));

      const fileIndex: WorkspaceFileIndex = new Set(["expected.json"]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      expect(result!.dependencies[0].specifier).toBe("expected.json");
      expect(result!.dependencies[0].resolvedPath).toBe("expected.json");
    });

    it("handles nested objects and arrays", async () => {
      const jsonPath = path.join(tempDir, "config.json");
      fs.writeFileSync(jsonPath, JSON.stringify({
        files: {
          include: ["./src/a.ts", "./src/b.ts"],
          entry: "./src/main.ts"
        }
      }));

      const fileIndex: WorkspaceFileIndex = new Set([
        "src/a.ts",
        "src/b.ts",
        "src/main.ts"
      ]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(3);
      const resolvedPaths = result!.dependencies.map(d => d.resolvedPath);
      expect(resolvedPaths).toContain("src/a.ts");
      expect(resolvedPaths).toContain("src/b.ts");
      expect(resolvedPaths).toContain("src/main.ts");
    });
  });

  describe("non-path filtering", () => {
    it("ignores URLs", async () => {
      const jsonPath = path.join(tempDir, "package.json");
      fs.writeFileSync(jsonPath, JSON.stringify({
        homepage: "https://github.com/user/repo",
        repository: "git+https://github.com/user/repo.git"
      }));

      const fileIndex: WorkspaceFileIndex = new Set(["index.ts"]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(0);
    });

    it("ignores version strings", async () => {
      const jsonPath = path.join(tempDir, "deps.json");
      fs.writeFileSync(jsonPath, JSON.stringify({
        dependencies: {
          "lodash": "^4.17.21",
          "express": "~5.0.0",
          "vitest": ">=1.0.0"
        }
      }));

      const fileIndex: WorkspaceFileIndex = new Set(["index.ts"]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(0);
    });

    it("ignores glob patterns", async () => {
      const jsonPath = path.join(tempDir, "tsconfig.json");
      fs.writeFileSync(jsonPath, JSON.stringify({
        include: ["src/**/*.ts"],
        exclude: ["**/node_modules/**"]
      }));

      const fileIndex: WorkspaceFileIndex = new Set(["src/index.ts"]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(0);
    });

    it("ignores scoped npm package names", async () => {
      const jsonPath = path.join(tempDir, "deps.json");
      fs.writeFileSync(jsonPath, JSON.stringify({
        dependencies: {
          "@types/node": "^20.0.0"
        }
      }));

      const fileIndex: WorkspaceFileIndex = new Set(["index.ts"]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(0);
    });
  });

  describe("file index validation", () => {
    it("only includes references to files that exist in the index", async () => {
      const jsonPath = path.join(tempDir, "config.json");
      fs.writeFileSync(jsonPath, JSON.stringify({
        exists: "./src/exists.ts",
        missing: "./src/missing.ts"
      }));

      const fileIndex: WorkspaceFileIndex = new Set(["src/exists.ts"]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      expect(result!.dependencies[0].resolvedPath).toBe("src/exists.ts");
    });

    it("deduplicates references to the same file", async () => {
      const jsonPath = path.join(tempDir, "config.json");
      fs.writeFileSync(jsonPath, JSON.stringify({
        include: ["./src/index.ts"],
        entry: "./src/index.ts",
        main: "src/index.ts"
      }));

      const fileIndex: WorkspaceFileIndex = new Set(["src/index.ts"]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
    });
  });

  describe("invalid JSON handling", () => {
    it("returns empty analysis for invalid JSON", async () => {
      const jsonPath = path.join(tempDir, "invalid.json");
      fs.writeFileSync(jsonPath, "{ invalid json }");

      const fileIndex: WorkspaceFileIndex = new Set(["src/index.ts"]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.symbols).toHaveLength(0);
      expect(result!.dependencies).toHaveLength(0);
    });

    it("returns null for unreadable files", async () => {
      const jsonPath = path.join(tempDir, "nonexistent.json");

      const fileIndex: WorkspaceFileIndex = new Set(["src/index.ts"]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).toBeNull();
    });
  });

  describe("JSON with comments", () => {
    it("reads line comments, block comments and trailing commas as an editor does, keys and references alike", async () => {
      const jsonPath = path.join(tempDir, "tsconfig.json");
      fs.writeFileSync(jsonPath, [
        "// The compiler's options.",
        "{",
        '  "extends": "./tsconfig.base.json", // the shared base',
        '  "compilerOptions": {',
        '    /* emitted beside the sources */ "outDir": "dist",',
        '    "strict": true,',
        "  },",
        '  "include": ["src/index.ts", "src/**/*.ts",],',
        '  "homepage": "https://example.test/docs", // a string with slashes is not a comment',
        '  "note": "a, ]", /* nor is a comma before a bracket inside one a trailing comma */',
        "}",
        ""
      ].join("\n"));

      const fileIndex: WorkspaceFileIndex = new Set(["tsconfig.base.json", "src/index.ts"]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result?.symbols.map((symbol) => symbol.name)).toEqual([
        "extends",
        "compilerOptions",
        "compilerOptions:outDir",
        "compilerOptions:strict",
        "include",
        "homepage",
        "note"
      ]);
      expect(result?.dependencies.map((dependency) => [dependency.specifier, dependency.resolvedPath])).toEqual([
        ["src/index.ts", "src/index.ts"],
        ["./tsconfig.base.json", "tsconfig.base.json"]
      ]);
    });

    it("keeps a malformed document unread: a doubled comma is not a trailing comma", async () => {
      const jsonPath = path.join(tempDir, "broken.json");
      fs.writeFileSync(jsonPath, '{ "a": [1,,], }');

      const result = await jsonAdapter.analyze({ absolutePath: jsonPath, workspaceRoot: tempDir });

      expect(result).toEqual({ symbols: [], dependencies: [] });
    });

    it("reads a document that opens with a byte order mark", async () => {
      const jsonPath = path.join(tempDir, "settings.json");
      fs.writeFileSync(jsonPath, "\uFEFF{ \"editor.formatOnSave\": true }");

      const result = await jsonAdapter.analyze({ absolutePath: jsonPath, workspaceRoot: tempDir });

      expect(result?.symbols.map((symbol) => symbol.name)).toEqual(["editor.formatOnSave"]);
    });
  });

  describe("symbols output", () => {
    it("publishes every key path, joined the way IConfiguration addresses nested settings", async () => {
      const jsonPath = path.join(tempDir, "appsettings.json");
      fs.writeFileSync(jsonPath, JSON.stringify({
        entry: "./src/index.ts",
        Hangfire: { Queue: "telemetry", Workers: [1, 2] }
      }));

      const fileIndex: WorkspaceFileIndex = new Set(["src/index.ts"]);
      const result = await jsonAdapter.analyze({
        absolutePath: jsonPath,
        workspaceRoot: tempDir,
        fileIndex
      });

      expect(result).not.toBeNull();
      expect(result!.symbols.map((symbol) => `${symbol.kind} ${symbol.name}`)).toEqual([
        "key entry",
        "key Hangfire",
        "key Hangfire:Queue",
        "key Hangfire:Workers"
      ]);
    });
  });
});

describe("JSON Adapter on package.json", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "json-adapter-package-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("publishes the package, links workspace packages by name and keeps the rest external with their ranges", async () => {
    const manifestPath = path.join(tempDir, "packages", "explorer", "package.json");
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(manifestPath, JSON.stringify({
      name: "@live-documentation/explorer",
      version: "0.0.0",
      main: "./src/index.ts",
      scripts: { build: "tsc" },
      dependencies: { "@live-documentation/engine": "*", d3: "^7.9.0" },
      devDependencies: { vitest: "^3.0.0" },
      peerDependencies: { typescript: "" }
    }));
    const symbolIndex = new Map([
      ["@live-documentation/engine", [{ liveDocPath: "d", sourcePath: "packages/engine/package.json", anchor: "symbol-live-documentationengine", kind: "package" }]],
      // A crate of the same name as an npm package is not that package.
      ["d3", [{ liveDocPath: "d", sourcePath: "native/d3/Cargo.toml", anchor: "symbol-d3", kind: "package" }]]
    ]);

    const result = await jsonAdapter.analyze({ absolutePath: manifestPath, workspaceRoot: tempDir, fileIndex: new Set(["packages/explorer/src/index.ts"]), symbolIndex });

    expect(result?.symbols).toEqual([{ name: "@live-documentation/explorer", kind: "package", location: { line: 1, character: 1 } }]);
    expect(result?.dependencies).toEqual([
      { specifier: "packages/engine/package.json", resolvedPath: "packages/engine/package.json", symbols: ["@live-documentation/engine"], kind: "import" },
      { specifier: "d3@^7.9.0",      symbols: [], kind: "import" },
      { specifier: "typescript",     symbols: [], kind: "import" },
      { specifier: "vitest@^3.0.0",  symbols: [], kind: "import" }
    ]);
    expect(result?.declares).toEqual([{ reason: "module", file: "packages/explorer/src/index.ts" }]);
  });

  it("declares the file each script runs, flags and tooling inputs passed over, and nothing for a script that runs no workspace file", async () => {
    const manifestPath = path.join(tempDir, "package.json");
    fs.writeFileSync(manifestPath, JSON.stringify({
      name: "root",
      scripts: {
        "live-docs:generate": "tsx --tsconfig ./tsconfig.base.json scripts/live-docs/generate.ts --config ./.live-docs.config.json",
        verify: "node ./scripts/verify.mjs",
        lint: "eslint .",
        "test:unit": "vitest run --project unit",
        both: "npm run lint && node scripts/verify.mjs && tsx scripts/live-docs/lint.ts",
        quoted: 'node "scripts/verify.mjs" --json',
        config: "tsc -p tsconfig.base.json",
        vendored: "node node_modules/tsx/dist/cli.mjs scripts/verify.mjs",
        typed: "tsc -p tsconfig.json && tsc --noEmit -p src/client/tsconfig.json",
        quiet: "tsx --quiet scripts/live-docs/lint.ts",
        tested: "npx playwright test --config tests/e2e/playwright.config.ts"
      }
    }));
    const fileIndex = new Set(["tsconfig.base.json", "tsconfig.json", "src/client/tsconfig.json", "tests/e2e/playwright.config.ts", "scripts/live-docs/generate.ts", "scripts/verify.mjs", "scripts/live-docs/lint.ts", "node_modules/tsx/dist/cli.mjs"]);

    const result = await jsonAdapter.analyze({ absolutePath: manifestPath, workspaceRoot: tempDir, fileIndex });

    expect(result?.declares).toEqual([
      { reason: "command", file: "scripts/live-docs/generate.ts", name: "live-docs:generate" },
      { reason: "command", file: "scripts/live-docs/lint.ts", name: "both" },
      { reason: "command", file: "scripts/live-docs/lint.ts", name: "quiet" },
      { reason: "command", file: "scripts/verify.mjs", name: "both" },
      { reason: "command", file: "scripts/verify.mjs", name: "quoted" },
      { reason: "command", file: "scripts/verify.mjs", name: "vendored" },
      { reason: "command", file: "scripts/verify.mjs", name: "verify" }
    ]);
  });

  it("maps a built binary and main module back to their sources through the tsconfig beside the manifest", async () => {
    const packageDir = path.join(tempDir, "packages", "cli");
    fs.mkdirSync(path.join(packageDir, "src"), { recursive: true });
    fs.writeFileSync(path.join(packageDir, "package.json"), JSON.stringify({
      name: "@live-documentation/cli",
      main: "dist/index.js",
      bin: { "live-docs": "./dist/index.js", "live-docs-serve": "./dist/serve.mjs" }
    }));
    fs.writeFileSync(path.join(packageDir, "tsconfig.json"), JSON.stringify({ compilerOptions: { rootDir: "src", outDir: "dist" }, include: ["src/**/*.ts"] }));
    const fileIndex = new Set(["packages/cli/src/index.ts", "packages/cli/src/serve.mts", "packages/cli/package.json", "packages/cli/tsconfig.json"]);

    const result = await jsonAdapter.analyze({ absolutePath: path.join(packageDir, "package.json"), workspaceRoot: tempDir, fileIndex });

    expect(result?.declares).toEqual([
      { reason: "command", file: "packages/cli/src/index.ts", name: "live-docs" },
      { reason: "module", file: "packages/cli/src/index.ts" },
      { reason: "command", file: "packages/cli/src/serve.mts", name: "live-docs-serve" }
    ]);
  });

  it("declares a string bin under the package's name, looks under the package and its src without a rootDir, and declares nothing without a file index", async () => {
    const packageDir = path.join(tempDir, "tool");
    fs.mkdirSync(path.join(packageDir, "src"), { recursive: true });
    fs.writeFileSync(path.join(packageDir, "package.json"), JSON.stringify({ name: "tool", bin: "dist/run.js" }));
    fs.writeFileSync(path.join(packageDir, "tsconfig.json"), JSON.stringify({ compilerOptions: { outDir: "dist" } }));
    const fileIndex = new Set(["tool/src/run.ts"]);

    const result = await jsonAdapter.analyze({ absolutePath: path.join(packageDir, "package.json"), workspaceRoot: tempDir, fileIndex });
    expect(result?.declares).toEqual([{ reason: "command", file: "tool/src/run.ts", name: "tool" }]);

    const without = await jsonAdapter.analyze({ absolutePath: path.join(packageDir, "package.json"), workspaceRoot: tempDir });
    expect(without).not.toHaveProperty("declares");
  });
});

/**
 * The cases of the measurement of November 19, 2026
 * (`AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/script-entries/README.md`):
 * the two reviews' cases, the forms each wrapper documents, probes, and the real scripts whose
 * entries the tokenizer changed. Each is one script in a workspace holding the files it names.
 */
describe("JSON Adapter on package.json scripts, read as a shell reads them", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "json-adapter-scripts-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  /** The files one script declares, the script standing alone in a root manifest of a workspace holding `files`. */
  async function startedBy(script: string, files: string[]): Promise<string[]> {
    const manifestPath = path.join(tempDir, "package.json");
    fs.writeFileSync(manifestPath, JSON.stringify({ name: "root", scripts: { run: script } }));
    const result = await jsonAdapter.analyze({ absolutePath: manifestPath, workspaceRoot: tempDir, fileIndex: new Set(files) });
    return (result?.declares ?? []).map((entry) => entry.file);
  }

  // [what the case shows, the script, the workspace's files, the files the script declares]
  const right: Array<[string, string, string[], string[]]> = [
    // A quoted command line is a command of its own.
    ["each quoted command concurrently runs, through pnpm and yarn", 'concurrently "pnpm exec tsx scripts/a.ts" "yarn tsx scripts/b.ts"', ["scripts/a.ts", "scripts/b.ts"], ["scripts/a.ts", "scripts/b.ts"]],
    ["each quoted command concurrently runs, behind cross-env", 'concurrently "cross-env NODE_ENV=dev node a.js" "node b.js"', ["a.js", "b.js"], ["a.js", "b.js"]],
    ["a bundler's input and the next quoted command", 'concurrently "esbuild src/main.ts --watch" "node b.js"', ["src/main.ts", "b.js"], ["b.js", "src/main.ts"]],
    ["concurrently's README form, names before the commands", 'concurrently -n api,web "node scripts/api.mjs" "tsx scripts/web.ts --watch"', ["scripts/api.mjs", "scripts/web.ts"], ["scripts/api.mjs", "scripts/web.ts"]],
    ["start-server-and-test's server and test commands, an address between", "start-server-and-test 'node scripts/serve.mjs' http://localhost:3000 'node scripts/check.mjs'", ["scripts/serve.mjs", "scripts/check.mjs"], ["scripts/check.mjs", "scripts/serve.mjs"]],
    ["npm exec's command inside a quoted command", 'concurrently "npm exec -- tsx scripts/a.ts"', ["scripts/a.ts"], ["scripts/a.ts"]],
    ["a shell's command line, behind a variable", 'sh -c "NODE_ENV=prod node a.js"', ["a.js"], ["a.js"]],
    ["a shell's command line, with its own separators", "sh -c 'node scripts/api.mjs && node scripts/check.mjs'", ["scripts/api.mjs", "scripts/check.mjs"], ["scripts/api.mjs", "scripts/check.mjs"]],
    ["nodemon's command after --exec", 'nodemon --exec "vite-node src/main.ts"', ["src/main.ts"], ["src/main.ts"]],
    ["nodemon's command after --exec, a watched folder before it", 'nodemon --watch src --exec "tsx scripts/web.ts"', ["scripts/web.ts"], ["scripts/web.ts"]],
    ["cross-env's command, its variables before it", "cross-env NODE_ENV=production node scripts/serve.mjs", ["scripts/serve.mjs"], ["scripts/serve.mjs"]],
    ["npm-run-all names scripts, not files", "npm-run-all clean lint build:*", [], []],
    // A quoted path is one word, not a command line.
    ["a quoted path with a space is one path, not two words", 'node "scripts/my script.js"', ["scripts/my script.js", "script.js"], ["scripts/my script.js"]],
    ["a quoted data path with a space adds no stray half", 'node scripts/gen.mjs "./data/my input.json"', ["scripts/gen.mjs", "data/my input.json", "input.json"], ["scripts/gen.mjs"]],
    // What a command hands its program stays its arguments.
    ["data handed to a script after --", "node scripts/gen.mjs -- data/input.json", ["scripts/gen.mjs", "data/input.json"], ["scripts/gen.mjs"]],
    ["data handed to a script after -- with ./", "node scripts/gen.mjs -- ./data/input.json", ["scripts/gen.mjs", "data/input.json"], ["scripts/gen.mjs"]],
    ["an output path handed to a script after --", "tsx scripts/a.ts -- --out docs/x.md", ["scripts/a.ts", "docs/x.md"], ["scripts/a.ts"]],
    ["a word after -- that looks like a program is still an argument", "node scripts/gen.mjs -- go x.js", ["scripts/gen.mjs", "x.js"], ["scripts/gen.mjs"]],
    ["a file after -- and a flag is an argument", "tsx scripts/a.ts -- --watch x.js", ["scripts/a.ts", "x.js"], ["scripts/a.ts"]],
    ["the test a runner is handed after --", "vitest run -- tests/a.test.ts", ["tests/a.test.ts"], ["tests/a.test.ts"]],
    ["a data file passed with a flag", "python scripts/train.py --data data/train.csv --out models/", ["scripts/train.py", "data/train.csv"], ["scripts/train.py"]],
    // Comments, redirections and here-strings are not words of the command.
    ["what follows # is a comment", "node scripts/a.mjs # node scripts/b.mjs", ["scripts/a.mjs", "scripts/b.mjs"], ["scripts/a.mjs"]],
    ["a comment after a separator", "node a.js; # node b.js", ["a.js", "b.js"], ["a.js"]],
    ["a quoted # is not a comment, and names no command", "node a.js '# node b.js'", ["a.js", "b.js"], ["a.js"]],
    ["&> redirects one command and does not separate two", "node scripts/a.mjs &> scripts/b.mjs", ["scripts/a.mjs", "scripts/b.mjs"], ["scripts/a.mjs"]],
    ["the file a redirection writes", "node scripts/gen.mjs > src/generated.ts", ["scripts/gen.mjs", "src/generated.ts"], ["scripts/gen.mjs"]],
    ["the bundle a redirection writes (assertion-error's build)", "deno bundle mod.ts > index.js", ["index.js"], []],
    ["the bundle a piped redirection writes (immediate's build-js)", "browserify -s immediate ./lib/browser.js | derequire > dist/immediate.js", ["lib/browser.js", "dist/immediate.js"], ["lib/browser.js"]],
    ["a transform's input on stdin and its output (immediate's build-node)", "browserify-transform-cli inline-process-browser unreachable-branch-transform < ./lib/index.js > ./lib/browser.js", ["lib/index.js", "lib/browser.js"], []],
    ["text a here-string feeds", 'cat <<< "node b.js"', ["b.js"], []],
    // Paths as written on Windows, and files that need no reader.
    ["a backslash path", "node scripts\\a.ts", ["scripts/a.ts"], ["scripts/a.ts"]],
    ["shell scripts, run by bash and by themselves", "bash scripts/build.sh && ./scripts/deploy.sh", ["scripts/build.sh", "scripts/deploy.sh"], ["scripts/build.sh", "scripts/deploy.sh"]],
    ["an extensionless program node runs (http-server's start)", "node ./bin/http-server", ["bin/http-server"], ["bin/http-server"]],
    ["inline JavaScript names no file: its parentheses stay in its words", "node -e \"require('fs').copyFileSync('src/emit.ps1', 'dist/emit.ps1')\"", ["src/emit.ps1"], []],
    // Kept as today: arguable, and the same answer before and after.
    ["arguable, kept: a linter's input", "eslint src/a.ts", ["src/a.ts"], ["src/a.ts"]],
    ["arguable, kept: the first of two tests a runner is given, a test being an entry by its archetype", "mocha test/a.spec.js test/b.spec.js", ["test/a.spec.js", "test/b.spec.js"], ["test/a.spec.js"]]
  ];

  it.each(right)("declares %s", async (_case, script, files, expected) => {
    expect(await startedBy(script, files)).toEqual(expected);
  });

  // [what is wrong, the script, the workspace's files, the files declared today, the files a right answer declares]
  const knownWrong: Array<[string, string, string[], string[], string[]]> = [
    ["a wrapper's command after a bare -- is not read (dotenv)", "dotenv -e config/dev.env -- vite-node scripts/a.ts", ["config/dev.env", "scripts/a.ts"], ["config/dev.env"], ["scripts/a.ts"]],
    ["a wrapper's command after a bare -- is not read (dotenv's README form)", "dotenv -e .env.local -- node scripts/serve.mjs --port 3000", [".env.local", "scripts/serve.mjs"], [".env.local"], ["scripts/serve.mjs"]],
    ["a wrapper's command after a bare -- is not read (this repository's browser lane)", "node ./scripts/e2e-bundles.mjs && node ./scripts/browser-lane.mjs --label gate -- node ./scripts/e2e-passes.mjs", ["scripts/e2e-bundles.mjs", "scripts/browser-lane.mjs", "scripts/e2e-passes.mjs"], ["scripts/browser-lane.mjs", "scripts/e2e-bundles.mjs"], ["scripts/browser-lane.mjs", "scripts/e2e-bundles.mjs", "scripts/e2e-passes.mjs"]],
    ["an environment file standing first is taken for the program", "node --env-file .env src/server.js", [".env", "src/server.js"], [".env"], ["src/server.js"]],
    ["only the preloaded module is read, not the program after it", "node -r ./scripts/setup.js src/main.js", ["scripts/setup.js", "src/main.js"], ["scripts/setup.js"], ["scripts/setup.js", "src/main.js"]],
    ["a path after cd is resolved from the manifest's folder", "(cd x && node ../a.js)", ["a.js", "x/keep.txt"], [], ["a.js"]],
    ["a Windows variable is not expanded", "node %SCRIPTS%\\a.js", ["scripts/a.js"], [], ["scripts/a.js"]],
    ["a command substitution is not run", "node $(git rev-parse --show-toplevel)/scripts/a.js", ["scripts/a.js"], [], ["scripts/a.js"]],
    ["a tool's output standing before its input is taken for the program", "babel -o legacy.js index.js", ["legacy.js", "index.js"], ["legacy.js"], []],
    ["a copy's source is taken for the program", "cp src/a.js dist/ && node scripts/build.mjs", ["src/a.js", "scripts/build.mjs"], ["scripts/build.mjs", "src/a.js"], ["scripts/build.mjs"]],
    ["a quoted word that only mentions a command is read as one", 'echo "node b.js must run first" && node a.js', ["a.js", "b.js"], ["a.js", "b.js"], ["a.js"]],
    ["the file tee writes is taken for its program", "node scripts/check.mjs 2>&1 | tee check.log", ["scripts/check.mjs", "check.log"], ["check.log", "scripts/check.mjs"], ["scripts/check.mjs"]]
  ];

  it.each(knownWrong)("known wrong answer, pinned as it is: %s", async (_case, script, files, today, right) => {
    const declared = await startedBy(script, files);
    expect(declared).toEqual(today);
    expect(declared).not.toEqual(right);
  });

  it("reads a quoted word after -e as a command line, and finds no file in the engine's old copying build, whose dist path maps to a source", async () => {
    const packageDir = path.join(tempDir, "packages", "engine");
    fs.mkdirSync(packageDir, { recursive: true });
    fs.writeFileSync(path.join(packageDir, "tsconfig.json"), JSON.stringify({ compilerOptions: { rootDir: "src", outDir: "dist" } }));
    fs.writeFileSync(path.join(packageDir, "package.json"), JSON.stringify({
      name: "engine",
      scripts: {
        // The engine's build from late September to October 16, 2026: split at `(` and `)` as a shell splits them, its dist path would map back to the emitter's source.
        build: "tsc -p tsconfig.json && node -e \"require('node:fs').copyFileSync('src/live-docs/adapters/powershell.emit-ast.ps1', 'dist/live-docs/adapters/powershell.emit-ast.ps1')\"",
        // The same command line, read as a shell reads it, runs what it names.
        shell: "sh -c \"tsc -p tsconfig.json && node dist/live-docs/run.js\""
      }
    }));
    const fileIndex = new Set(["packages/engine/tsconfig.json", "packages/engine/src/live-docs/adapters/powershell.emit-ast.ps1", "packages/engine/src/live-docs/run.ts"]);

    const result = await jsonAdapter.analyze({ absolutePath: path.join(packageDir, "package.json"), workspaceRoot: tempDir, fileIndex });

    expect(result?.declares).toEqual([{ reason: "command", file: "packages/engine/src/live-docs/run.ts", name: "shell" }]);
  });
});
