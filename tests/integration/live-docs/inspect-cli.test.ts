import * as assert from "node:assert";
import * as fs from "node:fs";
import { spawnSync } from "node:child_process";
import * as path from "node:path";

interface InspectRunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

interface InspectNodeDescriptor {
  codePath: string;
  docPath?: string;
  symbols?: Array<{
    name: string;
    summary?: string;
    remarks?: string;
    parameters?: Array<{ name: string; description?: string }>;
  }>;
}

const repoRoot = findRepoRoot(__dirname);
const tsxCli = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
const tsconfigPath = path.join(repoRoot, "tsconfig.base.json");
const inspectScript = path.join(repoRoot, "scripts", "live-docs", "inspect.ts");

const fixtures = {
  webforms: path.join(
    repoRoot,
    "tests",
    "integration",
    "fixtures",
    "webforms-appsettings",
    "workspace"
  ),
  razor: path.join(
    repoRoot,
    "tests",
    "integration",
    "fixtures",
    "razor-appsettings",
    "workspace"
  ),
  spa: path.join(
    repoRoot,
    "tests",
    "integration",
    "fixtures",
    "spa-runtime-config",
    "workspace"
  ),
  reflection: path.join(
    repoRoot,
    "tests",
    "integration",
    "fixtures",
    "csharp-reflection",
    "workspace"
  ),
  blazor: path.join(
    repoRoot,
    "tests",
    "integration",
    "fixtures",
    "blazor-telemetry",
    "workspace"
  ),
  queueWorker: path.join(
    repoRoot,
    "tests",
    "integration",
    "fixtures",
    "queue-worker",
    "workspace"
  ),
  powershell: path.join(
    repoRoot,
    "tests",
    "integration",
    "fixtures",
    "powershell-compendium",
    "workspace"
  )
} as const;

function runInspectCli(workspace: string, args: string[]): InspectRunResult {
  const result = spawnSync(
    process.execPath,
    [
      tsxCli,
      "--tsconfig",
      tsconfigPath,
      inspectScript,
      "--workspace",
      workspace,
      ...args
    ],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1"
      }
    }
  );

  if (result.error) {
    throw result.error;
  }

  return {
    exitCode: result.status ?? 0,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? ""
  };
}

function findRepoRoot(startDir: string): string {
  let current = path.resolve(startDir);

  while (true) {
    const candidate = path.join(current, "package.json");
    if (fs.existsSync(candidate)) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error("Unable to locate repository root from inspect CLI integration test.");
    }
    current = parent;
  }
}

suite("Live Docs inspect CLI", () => {
  test("finds a dependency path from the WebForms telemetry script to Web.config", () => {
    const run = runInspectCli(fixtures.webforms, [
      "--from",
      "packages/site/Scripts/app-insights.js",
      "--to",
      "Web.config",
      "--json"
    ]);

    assert.strictEqual(run.exitCode, 0, `inspect exited ${run.exitCode}:\n${run.stderr || run.stdout}`);
    const payload = JSON.parse(run.stdout) as {
      kind: string;
      direction: string;
      length: number;
      nodes: InspectNodeDescriptor[];
      hops: unknown[];
    };

    assert.strictEqual(payload.kind, "path");
    assert.strictEqual(payload.direction, "outbound");
    assert.strictEqual(payload.length, 3);
    assert.deepStrictEqual(
      payload.nodes.map(node => node.codePath),
      [
        "packages/site/Scripts/app-insights.js",
        "packages/site/Default.aspx",
        "packages/site/Default.aspx.cs",
        "Web.config"
      ]
    );
    assert.strictEqual(payload.hops.length, 3);
  });

  test("enumerates terminal outbound paths when no --to target is supplied", () => {
    const run = runInspectCli(fixtures.webforms, [
      "--from",
      "packages/site/Scripts/app-insights.js",
      "--direction",
      "outbound",
      "--json"
    ]);

    assert.strictEqual(run.exitCode, 0, `inspect exited ${run.exitCode}:\n${run.stderr || run.stdout}`);
    const payload = JSON.parse(run.stdout) as {
      kind: string;
      direction: string;
      terminalPaths: Array<{ nodes: InspectNodeDescriptor[] }>;
    };

    assert.strictEqual(payload.kind, "fanout");
    assert.strictEqual(payload.direction, "outbound");
    assert.ok(payload.terminalPaths.length > 0);

    const terminalPath = payload.terminalPaths.find(entry =>
      entry.nodes.some(node => node.codePath === "Web.config")
    );

    assert.ok(terminalPath, "expected to discover Web.config terminal path");
    assert.deepStrictEqual(
      terminalPath!.nodes.map(node => node.codePath),
      [
        "packages/site/Scripts/app-insights.js",
        "packages/site/Default.aspx",
        "packages/site/Default.aspx.cs",
        "Web.config"
      ]
    );
  });

  test("traces Razor telemetry chain back to appsettings", () => {
    const run = runInspectCli(fixtures.razor, [
      "--from",
      "wwwroot/js/telemetry.js",
      "--to",
      "appsettings.json",
      "--json"
    ]);

    assert.strictEqual(run.exitCode, 0, `inspect exited ${run.exitCode}:\n${run.stderr || run.stdout}`);
    const payload = JSON.parse(run.stdout) as {
      kind: string;
      direction: string;
      length: number;
      nodes: InspectNodeDescriptor[];
    };

    assert.strictEqual(payload.kind, "path");
    assert.strictEqual(payload.direction, "outbound");
    assert.strictEqual(payload.length, 3);
    assert.deepStrictEqual(
      payload.nodes.map(node => node.codePath),
      [
        "wwwroot/js/telemetry.js",
        "Pages/Index.cshtml",
        "Pages/Index.cshtml.cs",
        "appsettings.json"
      ]
    );
  });

  test("resolves Blazor host telemetry chain", () => {
    const run = runInspectCli(fixtures.blazor, [
      "--from",
      "wwwroot/js/blazor-telemetry.js",
      "--to",
      "appsettings.json",
      "--json"
    ]);

    assert.strictEqual(run.exitCode, 0, `inspect exited ${run.exitCode}:\n${run.stderr || run.stdout}`);
    const payload = JSON.parse(run.stdout) as {
      kind: string;
      direction: string;
      length: number;
      nodes: InspectNodeDescriptor[];
    };

    assert.strictEqual(payload.kind, "path");
    assert.strictEqual(payload.direction, "outbound");
    assert.strictEqual(payload.length, 3);
    assert.deepStrictEqual(
      payload.nodes.map(node => node.codePath),
      [
        "wwwroot/js/blazor-telemetry.js",
        "Pages/_Host.cshtml",
        "Pages/_Host.cshtml.cs",
        "appsettings.json"
      ]
    );
  });

  test("links queue enqueue calls to workers and configuration", () => {
    const run = runInspectCli(fixtures.queueWorker, [
      "--from",
      "Controllers/TelemetryController.cs",
      "--to",
      "appsettings.json",
      "--json"
    ]);

    assert.strictEqual(run.exitCode, 0, `inspect exited ${run.exitCode}:\n${run.stderr || run.stdout}`);
    const payload = JSON.parse(run.stdout) as {
      kind: string;
      direction: string;
      length: number;
      nodes: InspectNodeDescriptor[];
    };

    assert.strictEqual(payload.kind, "path");
    assert.strictEqual(payload.direction, "outbound");
    assert.strictEqual(payload.length, 2);
    assert.deepStrictEqual(
      payload.nodes.map(node => node.codePath),
      [
        "Controllers/TelemetryController.cs",
        "Workers/TelemetryWorker.cs",
        "appsettings.json"
      ]
    );
  });

  test("finds inbound dependencies from configuration back to the queue controller", () => {
    const run = runInspectCli(fixtures.queueWorker, [
      "--from",
      "appsettings.json",
      "--to",
      "Controllers/TelemetryController.cs",
      "--direction",
      "inbound",
      "--json"
    ]);

    assert.strictEqual(run.exitCode, 0, `inspect exited ${run.exitCode}:\n${run.stderr || run.stdout}`);
    const payload = JSON.parse(run.stdout) as {
      kind: string;
      direction: string;
      length: number;
      nodes: InspectNodeDescriptor[];
    };

    assert.strictEqual(payload.kind, "path");
    assert.strictEqual(payload.direction, "inbound");
    assert.strictEqual(payload.length, 2);
    assert.deepStrictEqual(
      payload.nodes.map(node => node.codePath),
      [
        "appsettings.json",
        "Workers/TelemetryWorker.cs",
        "Controllers/TelemetryController.cs"
      ]
    );
  });

  test("resolves SPA alias imports to concrete modules", () => {
    const run = runInspectCli(fixtures.spa, [
      "--from",
      "src/bootstrap.ts",
      "--to",
      "src/config/runtime.ts",
      "--json"
    ]);

    assert.strictEqual(run.exitCode, 0, `inspect exited ${run.exitCode}:\n${run.stderr || run.stdout}`);
    const payload = JSON.parse(run.stdout) as {
      kind: string;
      length: number;
      nodes: InspectNodeDescriptor[];
    };

    assert.strictEqual(payload.kind, "path");
    assert.strictEqual(payload.length, 1);
    assert.deepStrictEqual(
      payload.nodes.map(node => node.codePath),
      ["src/bootstrap.ts", "src/config/runtime.ts"]
    );
  });

  test("follows reflection-based handlers to their implementation", () => {
    const run = runInspectCli(fixtures.reflection, [
      "--from",
      "Services/ReflectionFactory.cs",
      "--to",
      "Services/TelemetryHandler.cs",
      "--json"
    ]);

    assert.strictEqual(run.exitCode, 0, `inspect exited ${run.exitCode}:\n${run.stderr || run.stdout}`);
    const payload = JSON.parse(run.stdout) as {
      kind: string;
      length: number;
      nodes: InspectNodeDescriptor[];
    };

    assert.strictEqual(payload.kind, "path");
    assert.strictEqual(payload.length, 1);
    assert.deepStrictEqual(
      payload.nodes.map(node => node.codePath),
      ["Services/ReflectionFactory.cs", "Services/TelemetryHandler.cs"]
    );
  });

  test("connects PowerShell scripts to dot-sourced helpers", () => {
    const run = runInspectCli(fixtures.powershell, [
      "--from",
      "scripts/deploy.ps1",
      "--to",
      "scripts/common/logging.ps1",
      "--json",
      "--verbose"
    ]);

    assert.strictEqual(run.exitCode, 0, `inspect exited ${run.exitCode}:\n${run.stderr || run.stdout}`);
    const payload = JSON.parse(run.stdout) as {
      kind: string;
      direction: string;
      length: number;
      nodes: InspectNodeDescriptor[];
    };

    assert.strictEqual(payload.kind, "path");
    assert.strictEqual(payload.direction, "outbound");
    assert.strictEqual(payload.length, 1);
    assert.deepStrictEqual(
      payload.nodes.map(node => node.codePath),
      ["scripts/deploy.ps1", "scripts/common/logging.ps1"]
    );

    const deployNode = payload.nodes.find(node => node.codePath === "scripts/deploy.ps1");
    assert.ok(deployNode?.symbols?.length, "expected Invoke-Deployment metadata");
    const invokeDeploymentDoc = deployNode!.symbols!.find(symbol => symbol.name === "Invoke-Deployment");
    assert.ok(invokeDeploymentDoc, "expected Invoke-Deployment symbol documentation");
    assert.strictEqual(
      invokeDeploymentDoc?.summary,
      "Deploys compiled artifacts to the requested region."
    );
    assert.strictEqual(
      invokeDeploymentDoc?.remarks,
      "Wraps shared logging and inventory refresh helpers so deployments stay observable."
    );
    assert.deepStrictEqual(invokeDeploymentDoc?.parameters, [
      {
        name: "Region",
        description: "The geographic region to target during deployment operations."
      }
    ]);

    const loggingNode = payload.nodes.find(node => node.codePath === "scripts/common/logging.ps1");
    assert.ok(loggingNode?.symbols?.length, "expected Write-DeploymentLog metadata");
    const loggingDoc = loggingNode!.symbols!.find(symbol => symbol.name === "Write-DeploymentLog");
    assert.ok(loggingDoc, "expected Write-DeploymentLog documentation");
    assert.strictEqual(
      loggingDoc?.summary,
      "Writes a deployment log entry to standard output."
    );
    assert.deepStrictEqual(loggingDoc?.parameters, [
      {
        name: "Message",
        description: "The content to emit in the log entry."
      }
    ]);
  });

  test("reports when no path connects disconnected artefacts", () => {
    const run = runInspectCli(fixtures.queueWorker, [
      "--from",
      "Services/TelemetryScheduler.cs",
      "--to",
      "Controllers/TelemetryController.cs",
      "--json"
    ]);

    assert.strictEqual(run.exitCode, 1, `inspect exited ${run.exitCode}:\n${run.stderr || run.stdout}`);
    const payload = JSON.parse(run.stdout) as {
      kind: string;
      frontier: Array<{ reason: string }>;
    };

    assert.strictEqual(payload.kind, "not-found");
    assert.ok(
      payload.frontier.some(entry => entry.reason === "terminal"),
      "expected to surface terminal frontier entries"
    );
  });

  test("honours max-depth limits when searching", () => {
    const run = runInspectCli(fixtures.queueWorker, [
      "--from",
      "Controllers/TelemetryController.cs",
      "--to",
      "appsettings.json",
      "--direction",
      "outbound",
      "--max-depth",
      "1",
      "--json"
    ]);

    assert.strictEqual(run.exitCode, 1, `inspect exited ${run.exitCode}:\n${run.stderr || run.stdout}`);
    const payload = JSON.parse(run.stdout) as {
      kind: string;
      frontier: Array<{ reason: string }>;
    };

    assert.strictEqual(payload.kind, "not-found");
    assert.ok(
      payload.frontier.some(entry => entry.reason === "max-depth"),
      "expected max-depth frontier marker"
    );
  });
});
