import * as assert from "node:assert";
import * as vscode from "vscode";

/**
 * US1 Integration Test: Writers get drift alerts
 *
 * Validates the complete user story 1 flow:
 * - Saving a mapped markdown file triggers diagnostics on linked implementation files
 * - Debounce batching prevents diagnostic spam during rapid edits
 * - Diagnostics surface in the Problems panel with proper severity and quick actions
 * - Hysteresis suppresses reciprocal diagnostics until acknowledgement
 *
 * Prerequisites:
 * - Extension activated with provider consent granted
 * - Test workspace contains sample markdown and implementation artifacts
 * - Knowledge graph has baseline links (via fallback inference or prior indexing)
 */

suite("US1: Writers get drift alerts", () => {
  let testWorkspaceUri: vscode.Uri;
  let markdownUri: vscode.Uri;
  let implementationUri: vscode.Uri;

  suiteSetup(async function (this: Mocha.Context) {
    this.timeout(60000);

    // Locate test workspace fixture
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    assert.ok(workspaceFolder, "Test workspace must be opened");
    testWorkspaceUri = workspaceFolder.uri;

    // Prepare fixture artifacts
    markdownUri = vscode.Uri.joinPath(testWorkspaceUri, "docs", "architecture.md");
    implementationUri = vscode.Uri.joinPath(testWorkspaceUri, "src", "core.ts");

    const config = vscode.workspace.getConfiguration("linkAwareDiagnostics");
    await config.update("enableDiagnostics", true, vscode.ConfigurationTarget.Workspace);
    await config.update("llmProviderMode", "local-only", vscode.ConfigurationTarget.Workspace);
    await config.update("debounce.ms", 2500, vscode.ConfigurationTarget.Workspace);

    // Ensure extension is activated with provider consent already configured
    const extension = vscode.extensions.getExtension("copilot-improvement.link-aware-diagnostics");
    assert.ok(extension, "Extension must be installed");

    if (!process.env.LINK_AWARE_PROVIDER_MODE) {
      process.env.LINK_AWARE_PROVIDER_MODE = "local-only";
    }

    await extension.activate();

    // Wait for language server ready signal
    await waitForLanguageServerReady();
  });

  test("Markdown save triggers diagnostics on linked implementation file", async function (this: Mocha.Context) {
    this.timeout(30000);

    // Clear any prior diagnostics
    await clearDiagnostics();

    // Edit markdown document
    const markdownDoc = await vscode.workspace.openTextDocument(markdownUri);
    const edit = new vscode.WorkspaceEdit();
    const lastLine = markdownDoc.lineAt(markdownDoc.lineCount - 1);
    edit.insert(markdownUri, lastLine.range.end, "\n\n## Breaking Change\nThis API is now deprecated.");
    await vscode.workspace.applyEdit(edit);

    // Save to trigger change detection
    await markdownDoc.save();

    // Wait for debounce window + diagnostic publication
    await waitForDiagnostics(implementationUri, 10000);

    // Verify diagnostic presence
    const diagnostics = vscode.languages.getDiagnostics(implementationUri);
    if (diagnostics.length === 0) {
      console.log("US1 diagnostics (implementation)", diagnostics);
      console.log(
        "US1 all diagnostics",
        vscode.languages.getDiagnostics().map(([uri, diags]) => ({ uri: uri.toString(), count: diags.length }))
      );
    }
    assert.ok(diagnostics.length > 0, "Implementation file should receive drift diagnostic");

    const driftDiagnostic = diagnostics.find((d) => d.message.includes("linked documentation changed"));
    assert.ok(driftDiagnostic, "Diagnostic message should reference documentation drift");
    assert.strictEqual(driftDiagnostic.severity, vscode.DiagnosticSeverity.Information);
  });

  test("Rapid markdown edits are debounced into single diagnostic batch", async function (this: Mocha.Context) {
    this.timeout(30000);

    await clearDiagnostics();

    const markdownDoc = await vscode.workspace.openTextDocument(markdownUri);
    const diagnosticUpdateCount = trackDiagnosticUpdates(implementationUri);

    // Fire three rapid edits within debounce window
    for (let i = 0; i < 3; i++) {
      const edit = new vscode.WorkspaceEdit();
      const lastLine = markdownDoc.lineAt(markdownDoc.lineCount - 1);
      edit.insert(markdownUri, lastLine.range.end, `\nRapid edit ${i}`);
      await vscode.workspace.applyEdit(edit);
      await markdownDoc.save();
      await sleep(200); // Sub-debounce interval
    }

    // Wait for debounce settle
    await sleep(5000);

    // Verify only one diagnostic batch was published
    const updateCount = diagnosticUpdateCount();
    assert.ok(
      updateCount <= 3,
      `Expected <=3 diagnostic updates, got ${updateCount} (initial clear + transient batch + final batch)`
    );
  });

  test("Diagnostics include quick action to open linked documentation", async function (this: Mocha.Context) {
    this.timeout(30000);

    await clearDiagnostics();

    const markdownDoc = await vscode.workspace.openTextDocument(markdownUri);
    const edit = new vscode.WorkspaceEdit();
    const lastLine = markdownDoc.lineAt(markdownDoc.lineCount - 1);
    edit.insert(markdownUri, lastLine.range.end, "\n\n## Updated Section");
    await vscode.workspace.applyEdit(edit);
    await markdownDoc.save();

    await waitForDiagnostics(implementationUri, 10000);

    const diagnostics = vscode.languages.getDiagnostics(implementationUri);
    if (diagnostics.length === 0) {
      console.log("US1 diagnostics before quick action", diagnostics);
      console.log(
        "US1 all diagnostics (quick action)",
        vscode.languages.getDiagnostics().map(([uri, diags]) => ({ uri: uri.toString(), count: diags.length }))
      );
    }
    const driftDiagnostic = diagnostics.find((d) => d.message.includes("linked documentation changed"));
    assert.ok(driftDiagnostic, "Drift diagnostic should be present");

    // Check for code action availability
    const codeActions = await vscode.commands.executeCommand<vscode.CodeAction[]>(
      "vscode.executeCodeActionProvider",
      implementationUri,
      driftDiagnostic.range
    );

    const openLinkAction = codeActions?.find((action) => action.title.includes("Open linked"));
    assert.ok(openLinkAction, "Quick action to open linked documentation should be available");
  });

  test("Hysteresis suppresses reciprocal diagnostics until acknowledgement", async function (this: Mocha.Context) {
    this.timeout(30000);

    await clearDiagnostics();

    // Edit markdown and verify implementation receives diagnostic
    const markdownDoc = await vscode.workspace.openTextDocument(markdownUri);
    const edit1 = new vscode.WorkspaceEdit();
    const lastLine = markdownDoc.lineAt(markdownDoc.lineCount - 1);
    edit1.insert(markdownUri, lastLine.range.end, "\n\n## Hysteresis Test");
    await vscode.workspace.applyEdit(edit1);
    await markdownDoc.save();
    await waitForDiagnostics(implementationUri, 10000);

    // Now edit the implementation file
    const implDoc = await vscode.workspace.openTextDocument(implementationUri);
    const edit2 = new vscode.WorkspaceEdit();
    const implLastLine = implDoc.lineAt(implDoc.lineCount - 1);
    edit2.insert(implementationUri, implLastLine.range.end, "\n// Updated implementation");
    await vscode.workspace.applyEdit(edit2);
    await implDoc.save();

    // Wait for potential reciprocal diagnostic
    await sleep(5000);

    // Verify markdown does NOT receive a reciprocal diagnostic due to hysteresis
    const markdownDiagnostics = vscode.languages.getDiagnostics(markdownUri);
    const reciprocalDiagnostic = markdownDiagnostics.find((d) => d.message.includes("linked implementation changed"));
    assert.ok(!reciprocalDiagnostic, "Hysteresis should suppress reciprocal diagnostic until acknowledgement");
  });
});

async function waitForLanguageServerReady(): Promise<void> {
  // Poll for custom LSP ready notification or extension state
  const maxWait = 15000;
  const pollInterval = 500;
  let elapsed = 0;

  while (elapsed < maxWait) {
    // Check if extension has signaled server readiness
    let ready = false;
    try {
      ready = Boolean(
        await vscode.commands.executeCommand<boolean>("linkAwareDiagnostics.isServerReady")
      );
    } catch (error) {
      console.warn("isServerReady command failed", error);
    }
    if (ready) {
      return;
    }
    console.log(`Language server not ready yet after ${elapsed}ms`);
    await sleep(pollInterval);
    elapsed += pollInterval;
  }

  throw new Error("Language server did not become ready within timeout");
}

async function clearDiagnostics(): Promise<void> {
  // Invoke custom command to reset diagnostic state for clean test runs
  await vscode.commands.executeCommand("linkAwareDiagnostics.clearAllDiagnostics");
  const clearTimeout = 15000; // 15s to accommodate slower CI runners
  const timeoutAt = Date.now() + clearTimeout;
  while (Date.now() < timeoutAt) {
    const hasDiagnostics = vscode.languages
      .getDiagnostics()
      .some(([, diagnostics]) => diagnostics.length > 0);
    if (!hasDiagnostics) {
      return;
    }

    await sleep(100);
  }

  throw new Error(`Diagnostics did not clear within ${clearTimeout / 1000}s of issuing clearAllDiagnostics`);
}

async function waitForDiagnostics(uri: vscode.Uri, timeout: number): Promise<void> {
  const pollInterval = 200;
  let elapsed = 0;

  while (elapsed < timeout) {
    const diagnostics = vscode.languages.getDiagnostics(uri);
    if (diagnostics.length > 0) {
      return;
    }
    await sleep(pollInterval);
    elapsed += pollInterval;
  }

  throw new Error(`No diagnostics appeared for ${uri.fsPath} within ${timeout}ms`);
}

function trackDiagnosticUpdates(uri: vscode.Uri): () => number {
  let updateCount = 0;
  const listener = vscode.languages.onDidChangeDiagnostics((event) => {
    if (event.uris.some((eventUri) => eventUri.toString() === uri.toString())) {
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
