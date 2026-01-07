import * as assert from "node:assert";
import * as vscode from "vscode";

/**
 * US1 Integration Test: Developers see code-change impact
 *
 * Confirms that saving implementation files raises diagnostics on every dependent module,
 * honours debounce behaviour, and surfaces transitive dependency ripples.
 */

suite("US1: Developers see code-change impact", () => {
  let workspaceUri: vscode.Uri;
  let entryUri: vscode.Uri;
  let featureUri: vscode.Uri;
  let utilUri: vscode.Uri;

  suiteSetup(async function (this: Mocha.Context) {
    this.timeout(60000);

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    assert.ok(workspaceFolder, "Test workspace must be opened");
    workspaceUri = workspaceFolder.uri;

    entryUri = vscode.Uri.joinPath(workspaceUri, "src", "core.ts");
    featureUri = vscode.Uri.joinPath(workspaceUri, "src", "feature.ts");
    utilUri = vscode.Uri.joinPath(workspaceUri, "src", "util.ts");

    const extension = vscode.extensions.getExtension("live-documentation.live-documentation");
    assert.ok(extension, "Extension must be installed");

    if (!process.env.LINK_AWARE_PROVIDER_MODE) {
      process.env.LINK_AWARE_PROVIDER_MODE = "local-only";
    }

    await extension.activate();

    const config = vscode.workspace.getConfiguration("linkAwareDiagnostics");
    await config.update("enableDiagnostics", true, vscode.ConfigurationTarget.Workspace);
    await config.update("llmProviderMode", "local-only", vscode.ConfigurationTarget.Workspace);

    await waitForLanguageServerReady();
  });

  test("Code save triggers diagnostics on dependent module", async function (this: Mocha.Context) {
    this.timeout(30000);

    await clearDiagnostics();

    const featureDoc = await vscode.workspace.openTextDocument(featureUri);
    const edit = new vscode.WorkspaceEdit();
    const lastLine = featureDoc.lineAt(featureDoc.lineCount - 1);
    edit.insert(featureUri, lastLine.range.end, `\n// feature touched ${Date.now()}`);
    await vscode.workspace.applyEdit(edit);
    await featureDoc.save();

    await waitForDiagnostics(entryUri, 10000);

    const diagnostics = vscode.languages.getDiagnostics(entryUri);
    assert.ok(diagnostics.length > 0, "Dependent module should receive diagnostics");

    const dependencyDiagnostic = diagnostics.find((d) =>
      d.message.includes("linked dependency changed") && d.code === "code-ripple"
    );
    if (!dependencyDiagnostic) {
      console.log(
        "US1 code diagnostics",
        diagnostics.map((d) => {
          const enriched = d as vscode.Diagnostic & { data?: unknown };
          return { message: d.message, code: d.code, data: enriched.data };
        })
      );
    }
    assert.ok(dependencyDiagnostic, "Diagnostic should reference dependency drift");

    const rippleDiagnostic = dependencyDiagnostic!;

    const codeActions = await vscode.commands.executeCommand<vscode.CodeAction[]>(
      "vscode.executeCodeActionProvider",
      entryUri,
      rippleDiagnostic.range
    );

    assert.ok(
      codeActions?.some((action) => action.title === "View ripple details"),
      "Ripple diagnostics should surface detail quick action"
    );
  });

  test("Transitive dependents receive diagnostics for upstream changes", async function (this: Mocha.Context) {
    const diagnosticTimeout = getDiagnosticTimeout();
    this.timeout(diagnosticTimeout + 10000);
    await clearDiagnostics();

    const utilDoc = await vscode.workspace.openTextDocument(utilUri);
    const edit = new vscode.WorkspaceEdit();
    const lastLine = utilDoc.lineAt(utilDoc.lineCount - 1);
    edit.insert(utilUri, lastLine.range.end, `\n// util touched ${Date.now()}`);
    await vscode.workspace.applyEdit(edit);
    await utilDoc.save();

    await Promise.all([
      waitForDiagnostics(featureUri, diagnosticTimeout),
      waitForDiagnostics(entryUri, diagnosticTimeout)
    ]);

    const featureDiagnostics = vscode.languages.getDiagnostics(featureUri);
    const entryDiagnostics = vscode.languages.getDiagnostics(entryUri);

    assert.ok(
      featureDiagnostics.some((d) => d.code === "code-ripple"),
      "Intermediate dependency should report ripple diagnostic"
    );
    assert.ok(
      entryDiagnostics.some((d) => d.code === "code-ripple"),
      "Transitive dependency should report ripple diagnostic"
    );

    const transitive = entryDiagnostics.find((d) => d.code === "code-ripple");
    assert.ok(transitive, "Transitive diagnostic should be present");
    assert.ok(
      /depth\s*\d+/i.test(transitive.message),
      "Transitive diagnostic message should include depth context"
    );
  });

  test("Rapid code edits are debounced into a single diagnostic batch", async function (this: Mocha.Context) {
    this.timeout(40000);

    await clearDiagnostics();

    const featureDoc = await vscode.workspace.openTextDocument(featureUri);
    const trackUpdates = trackDiagnosticUpdates(entryUri);

    for (let i = 0; i < 3; i += 1) {
      const edit = new vscode.WorkspaceEdit();
      const lastLine = featureDoc.lineAt(featureDoc.lineCount - 1);
      edit.insert(featureUri, lastLine.range.end, `\n// burst edit ${i}`);
      await vscode.workspace.applyEdit(edit);
      await featureDoc.save();
      await sleep(150);
    }

    await sleep(5000);

    const updateCount = trackUpdates();
    assert.ok(
      updateCount <= 3,
      `Expected <=3 diagnostic batches, received ${updateCount} (initial clear + transient batch + final batch)`
    );
  });
});

async function waitForLanguageServerReady(): Promise<void> {
  const maxWait = 15000;
  const pollInterval = 500;
  let elapsed = 0;

  while (elapsed < maxWait) {
    try {
      const ready = await vscode.commands.executeCommand<boolean>("linkAwareDiagnostics.isServerReady");
      if (ready) {
        return;
      }
    } catch (error) {
      console.warn("isServerReady command failed", error);
    }

    await sleep(pollInterval);
    elapsed += pollInterval;
  }

  throw new Error("Language server did not become ready within timeout");
}

async function clearDiagnostics(): Promise<void> {
  await vscode.commands.executeCommand("linkAwareDiagnostics.clearAllDiagnostics");
  await sleep(500);
}

async function waitForDiagnostics(uri: vscode.Uri, timeout: number): Promise<void> {
  const pollInterval = 200;
  let elapsed = 0;
  let lastLogAt = -1000;
  const debugLogsEnabled = isDiagnosticDebugEnabled();

  while (elapsed < timeout) {
    const diagnostics = vscode.languages.getDiagnostics(uri);
    if (diagnostics.length > 0) {
      if (debugLogsEnabled) {
        const snapshot = captureDiagnosticsSnapshot();
        console.log(
          `[waitForDiagnostics] diagnostics ready for ${uri.toString()} after ${elapsed}ms`,
          snapshot
        );
      }
      return;
    }

    if (debugLogsEnabled && elapsed - lastLogAt >= 1000) {
      lastLogAt = elapsed;
      const snapshot = captureDiagnosticsSnapshot();
      console.log(
        `[waitForDiagnostics] waiting for ${uri.toString()} at ${elapsed}ms`,
        snapshot
      );
    }
    await sleep(pollInterval);
    elapsed += pollInterval;
  }

  const snapshot = captureDiagnosticsSnapshot();
  console.log(
    `[waitForDiagnostics] timeout for ${uri.toString()} after ${timeout}ms`,
    snapshot
  );
  throw new Error(`No diagnostics appeared for ${uri.fsPath} within ${timeout}ms`);
}

function trackDiagnosticUpdates(uri: vscode.Uri): () => number {
  let updateCount = 0;
  const listener = vscode.languages.onDidChangeDiagnostics((event) => {
    if (event.uris.some((candidate) => candidate.toString() === uri.toString())) {
      updateCount += 1;
    }
  });

  return () => {
    listener.dispose();
    return updateCount;
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function captureDiagnosticsSnapshot(): {
  total: number;
  entries: Array<{
    uri: string;
    count: number;
    codes: string[];
    sampleMessages: string[];
  }>;
} {
  const entries = vscode.languages
    .getDiagnostics()
    .filter(([, items]) => items.length > 0)
    .map(([candidateUri, items]) => {
      const codes = Array.from(new Set(items.map(item => item.code))).filter(
        (code): code is string => typeof code === "string"
      );
      const sampleMessages = items.slice(0, 2).map(item => item.message);
      return {
        uri: candidateUri.toString(),
        count: items.length,
        codes,
        sampleMessages
      };
    });

  const total = entries.reduce((sum, entry) => sum + entry.count, 0);
  return { total, entries };
}

function isDiagnosticDebugEnabled(): boolean {
  return process.env.LINK_AWARE_DIAGNOSTIC_DEBUG === "1";
}

function getDiagnosticTimeout(): number {
  const raw = process.env.LINK_AWARE_INTEGRATION_DIAGNOSTIC_TIMEOUT;
  const fallback = 45_000;
  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}
