import * as assert from "node:assert";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

const { generateLiveDocs } = require(
  path.join(
    __dirname,
    "../../../../packages/server/dist/features/live-docs/generator"
  )
) as typeof import("../../../packages/server/dist/features/live-docs/generator");

const {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  LIVE_DOCUMENTATION_FILE_EXTENSION,
  normalizeLiveDocumentationConfig
} = require(
  path.join(
    __dirname,
    "../../../../packages/shared/dist/config/liveDocumentationConfig"
  )
) as typeof import("../../../packages/shared/dist/config/liveDocumentationConfig");

const DEFAULT_LIVE_DOC_ROOT = DEFAULT_LIVE_DOCUMENTATION_CONFIG.root;
const DEFAULT_LIVE_DOC_LAYER = DEFAULT_LIVE_DOCUMENTATION_CONFIG.baseLayer;

suite("Live Docs polyglot fixtures", () => {
  test("generates C# docs for advanced fixture", async function () {
    this.timeout(20000);

    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "live-docs-csharp-"));

    try {
      const fixtureRoot = path.join(__dirname, "../../fixtures/csharp-advanced-symbols");
      await fs.cp(fixtureRoot, workspaceRoot, { recursive: true });

      const config = normalizeLiveDocumentationConfig({
        ...DEFAULT_LIVE_DOCUMENTATION_CONFIG,
        glob: ["src/**/*.cs"]
      });

      const result = await generateLiveDocs({
        workspaceRoot,
        config,
        changedOnly: false,
        dryRun: false,
        now: () => new Date("2024-01-01T00:00:00.000Z")
      });

      assert.ok(result.processed > 0, "Expected at least one processed source file");

      const widgetRegistryDoc = path.join(
        workspaceRoot,
        DEFAULT_LIVE_DOC_ROOT,
        DEFAULT_LIVE_DOC_LAYER,
        "src",
        "Diagnostics",
        `WidgetRegistry.cs${LIVE_DOCUMENTATION_FILE_EXTENSION}`
      );
      const widgetDocContent = await fs.readFile(widgetRegistryDoc, "utf8");
      assert.match(widgetDocContent, /#### `WidgetRegistry`/);
      assert.match(widgetDocContent, /#### `WidgetRegisteredEventArgs \(class\)`/);
      assert.match(widgetDocContent, /_No dependencies documented yet_/);
      assert.match(
        widgetDocContent,
        /##### `WidgetRegistry` — Summary\s+Maintains widget registrations and surfaces change notifications\./
      );
      assert.match(
        widgetDocContent,
        /##### `WidgetRegistry` — Remarks[\s\S]*Widget registries coordinate cross-module widget discovery\.[\s\S]*Thread-safety is provided by a concurrent dictionary shared by all callers\./
      );
      assert.match(
        widgetDocContent,
        /##### `WidgetRegistry` — Links[\s\S]*- `\.\.\/\.\.\/docs\/registry\.md` — Widget architecture/
      );
      assert.match(
        widgetDocContent,
        /#### `WidgetRegistered`[\s\S]*?##### `WidgetRegistered` — Summary\s+Raised when a widget is successfully added to the registry\./
      );
      assert.match(
        widgetDocContent,
        /##### `WidgetRegistered` — Remarks[\s\S]*Subscribers receive `WidgetRegisteredEventArgs` instances describing the change\./
      );
      assert.match(
        widgetDocContent,
        /#### `All`[\s\S]*?##### `All` — Summary\s+Returns all registered widgets in insertion order\./
      );
      assert.match(
        widgetDocContent,
        /##### `All` — Value\s+The ordered collection of registered widgets\./
      );
      assert.match(
        widgetDocContent,
        /#### `Resolve`[\s\S]*?##### `Resolve` — Summary\s+Resolves a widget by name or returns `null` when not found\./
      );
      assert.match(
        widgetDocContent,
        /##### `Resolve` — Parameters[\s\S]*- `name`: The widget name used to locate existing registrations\./
      );
      assert.match(
        widgetDocContent,
        /##### `Resolve` — Returns\s+The registered widget, or `null` when the name is unknown\./
      );
      assert.match(
        widgetDocContent,
        /##### `Resolve` — Remarks\s+Lookup is case-insensitive\./
      );
      assert.match(
        widgetDocContent,
        /##### `Resolve` — Exceptions[\s\S]*- `ArgumentNullException`: Thrown when `name` is `null`\./
      );
      assert.match(
        widgetDocContent,
        /#### `TryMerge`[\s\S]*?##### `TryMerge` — Summary\s+Attempts to merge an incoming widget into the stored entry\./
      );
      assert.match(
        widgetDocContent,
        /##### `TryMerge` — Parameters[\s\S]*- `widget`: The incoming widget to merge\./
      );
      assert.match(
        widgetDocContent,
        /##### `TryMerge` — Returns\s+`true` when the widget merged successfully; otherwise `false`\./
      );
      assert.match(
        widgetDocContent,
        /##### `TryMerge` — Remarks\s+Delegates to `BaseWidget.TryMerge\(BaseWidget\)` for the merge semantics\./
      );
      assert.match(
        widgetDocContent,
        /##### `TryMerge` — Links[\s\S]*- `Resolve\(string\)`/
      );
      assert.match(
        widgetDocContent,
        /#### `Widget`[\s\S]*?##### `Widget` — Summary\s+The widget that triggered the event\./
      );
      assert.match(
        widgetDocContent,
        /##### `Widget` — Value\s+The widget instance passed to the registration event\./
      );
      assert.match(
        widgetDocContent,
        /#### `RegisteredAt`[\s\S]*?##### `RegisteredAt` — Summary\s+Time when the widget was registered\./
      );
      assert.match(
        widgetDocContent,
        /##### `RegisteredAt` — Value\s+A UTC timestamp captured at registration time\./
      );
      assert.match(
        widgetDocContent,
        /#### `OnWidgetRegistered`[\s\S]*?##### `OnWidgetRegistered` — Additional Documentation[\s\S]*- <inheritdoc cref="WidgetRegistered"\/>/
      );
      assert.match(
        widgetDocContent,
        /#### `TryRegister`[\s\S]*?##### `TryRegister` — Parameters[\s\S]*- `widget`: The widget instance being registered\./
      );
      assert.match(
        widgetDocContent,
        /##### `TryRegister` — Returns\s+`true` when the widget is added; otherwise `false`\./
      );
      assert.match(
        widgetDocContent,
        /##### `TryRegister` — Exceptions[\s\S]*- `ArgumentNullException`: Thrown when `widget` is `null`\./
      );
      assert.match(
        widgetDocContent,
        /##### `TryRegister` — Examples[\s\S]*Registers a widget and inspects the resulting event payload\.[\s\S]*```csharp[\s\S]*registry\.TryRegister\(widget\);[\s\S]*```/
      );
      assert.match(
        widgetDocContent,
        /##### `TryRegister` — Links[\s\S]*- `WidgetRegistered`/
      );

      const extensionsDoc = path.join(
        workspaceRoot,
        DEFAULT_LIVE_DOC_ROOT,
        DEFAULT_LIVE_DOC_LAYER,
        "src",
        "Diagnostics",
        "Extensions",
        `WidgetExtensions.cs${LIVE_DOCUMENTATION_FILE_EXTENSION}`
      );
      const extensionsDocContent = await fs.readFile(extensionsDoc, "utf8");
      assert.match(extensionsDocContent, /#### `WidgetExtensions`/);
      assert.match(extensionsDocContent, /LinkAware\.Diagnostics/);
      assert.match(
        extensionsDocContent,
        /##### `WidgetExtensions` — Summary\s+Provides helpers for flattening widget dependency graphs\./
      );
    } finally {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  test("generates Java docs for basic fixture", async function () {
    this.timeout(20000);

    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "live-docs-java-"));

    try {
      const fixtureRoot = path.join(
        __dirname,
        "../../benchmarks/fixtures/java/basic"
      );
      await fs.cp(fixtureRoot, workspaceRoot, { recursive: true });

      const config = normalizeLiveDocumentationConfig({
        ...DEFAULT_LIVE_DOCUMENTATION_CONFIG,
        glob: ["src/**/*.java"]
      });

      const result = await generateLiveDocs({
        workspaceRoot,
        config,
        changedOnly: false,
        dryRun: false,
        now: () => new Date("2024-01-01T00:00:00.000Z")
      });

      assert.ok(result.processed > 0, "Expected at least one processed source file");

      const appDoc = await fs.readFile(
        path.join(
          workspaceRoot,
          DEFAULT_LIVE_DOC_ROOT,
          DEFAULT_LIVE_DOC_LAYER,
          "src",
          "com",
          "example",
          "app",
          `App.java${LIVE_DOCUMENTATION_FILE_EXTENSION}`
        ),
        "utf8"
      );
      assert.match(appDoc, /#### `App`/);
      assert.match(appDoc, /##### `App` — Summary\s+Entry point for the reporting pipeline used by the fixture\./);
      assert.match(
        appDoc,
        /##### `run` — Summary\s+Runs the reporting pipeline for the supplied dataset\./
      );
      assert.match(
        appDoc,
        /##### `run` — Parameters[\s\S]*- `dataset`: dataset identifier used to load records/
      );
      assert.match(
        appDoc,
        /##### `run` — Returns\s+formatted report summary/i
      );
      assert.match(
        appDoc,
        /##### `run` — Exceptions[\s\S]*- `IllegalArgumentException`: if `dataset` is null or blank/
      );
      assert.match(
        appDoc,
        /##### `run` — Links[\s\S]*`Reader#load\(String\)`/
      );
      // Dependencies are now resolved to markdown links pointing to Live Doc files
      assert.match(
        appDoc,
        /### Dependencies[\s\S]*\[`Reader`\]\(\.\.\/data\/Reader\.java/
      );

      const readerDoc = await fs.readFile(
        path.join(
          workspaceRoot,
          DEFAULT_LIVE_DOC_ROOT,
          DEFAULT_LIVE_DOC_LAYER,
          "src",
          "com",
          "example",
          "data",
          `Reader.java${LIVE_DOCUMENTATION_FILE_EXTENSION}`
        ),
        "utf8"
      );
      assert.match(
        readerDoc,
        /##### `Reader` — Summary\s+Loads synthetic records for the fixtures\./
      );
      assert.match(
        readerDoc,
        /##### `load` — Examples[\s\S]*Reader\.load\("baseline"\)/
      );

      const recordDoc = await fs.readFile(
        path.join(
          workspaceRoot,
          DEFAULT_LIVE_DOC_ROOT,
          DEFAULT_LIVE_DOC_LAYER,
          "src",
          "com",
          "example",
          "model",
          `Record.java${LIVE_DOCUMENTATION_FILE_EXTENSION}`
        ),
        "utf8"
      );
      assert.match(recordDoc, /#### `Record`/);
      assert.match(
        recordDoc,
        /##### `Record` — Parameters[\s\S]*- `dataset`: dataset identifier associated with each metric/
      );
      assert.match(
        recordDoc,
        /##### `Record` — Parameters[\s\S]*- `value`: metric value captured for the dataset/
      );

      const catalogDoc = await fs.readFile(
        path.join(
          workspaceRoot,
          DEFAULT_LIVE_DOC_ROOT,
          DEFAULT_LIVE_DOC_LAYER,
          "src",
          "com",
          "example",
          "data",
          `Catalog.java${LIVE_DOCUMENTATION_FILE_EXTENSION}`
        ),
        "utf8"
      );
      assert.match(
        catalogDoc,
        /##### `describe` — Returns\s+Caption describing the dataset or `Unknown Dataset`/
      );
    } finally {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  test("generates Python docs for basics fixture", async function () {
    this.timeout(20000);

    const workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "live-docs-python-"));

    try {
      const fixtureRoot = path.join(
        __dirname,
        "../../benchmarks/fixtures/python/basics"
      );
      await fs.cp(fixtureRoot, workspaceRoot, { recursive: true });

      const config = normalizeLiveDocumentationConfig({
        ...DEFAULT_LIVE_DOCUMENTATION_CONFIG,
        glob: ["src/**/*.py"]
      });

      const result = await generateLiveDocs({
        workspaceRoot,
        config,
        changedOnly: false,
        dryRun: false,
        now: () => new Date("2024-01-01T00:00:00.000Z")
      });

      assert.ok(result.processed > 0, "Expected at least one processed source file");

      const mainDocPath = path.join(
        workspaceRoot,
        DEFAULT_LIVE_DOC_ROOT,
        DEFAULT_LIVE_DOC_LAYER,
        "src",
        `main.py${LIVE_DOCUMENTATION_FILE_EXTENSION}`
      );
      const mainDoc = await fs.readFile(mainDocPath, "utf8");
      assert.match(mainDoc, /#### `run`/);
      assert.match(mainDoc, /### Dependencies[\s\S]*util\.summarize_values/);

      const utilDocPath = path.join(
        workspaceRoot,
        DEFAULT_LIVE_DOC_ROOT,
        DEFAULT_LIVE_DOC_LAYER,
        "src",
        `util.py${LIVE_DOCUMENTATION_FILE_EXTENSION}`
      );
      const utilDoc = await fs.readFile(utilDocPath, "utf8");
      assert.match(utilDoc, /#### `summarize_values`/);
    } finally {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  });
});
