import * as assert from "node:assert";
import * as vscode from "vscode";

suite("US3: Documentation link drift", () => {
  let workspaceUri: vscode.Uri;
  let sourceDocUri: vscode.Uri;
  let targetDocUri: vscode.Uri;

  suiteSetup(async function (this: Mocha.Context) {
    this.timeout(60000);

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    assert.ok(workspaceFolder, "Test workspace must be opened");
    workspaceUri = workspaceFolder.uri;

    sourceDocUri = vscode.Uri.joinPath(workspaceUri, "docs", "link-source.md");
    targetDocUri = vscode.Uri.joinPath(workspaceUri, "docs", "link-target.md");

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

  test("Renaming target document surfaces drift diagnostic", async function (this: Mocha.Context) {
    this.timeout(40000);

    await clearDiagnostics();

    const renameTargetUri = vscode.Uri.joinPath(workspaceUri, "docs", "link-target-renamed.md");

    // Rename the target file to simulate a broken documentation link.
    await vscode.workspace.fs.rename(targetDocUri, renameTargetUri, { overwrite: true });

    try {
      await waitForDiagnostics(sourceDocUri, 15000);
      const diagnostics = vscode.languages.getDiagnostics(sourceDocUri);
      assert.ok(diagnostics.length > 0, "Source document should receive diagnostics");

      const driftDiagnostic = diagnostics.find((diag) => diag.code === "doc-drift");
      assert.ok(driftDiagnostic, "Expected a documentation drift diagnostic");
      assert.ok(
        /linked documentation changed/i.test(driftDiagnostic.message),
        "Diagnostic message should reference linked documentation change"
      );
    } finally {
      // Restore file to original name for subsequent tests and reruns.
      await vscode.workspace.fs.rename(renameTargetUri, targetDocUri, { overwrite: true });
      await sleep(500);
      await clearDiagnostics();
    }
  });

  test("Broken markdown link path surfaces diagnostics", async function (this: Mocha.Context) {
    this.timeout(40000);

    await clearDiagnostics();

    const sourceDoc = await vscode.workspace.openTextDocument(sourceDocUri);
    const originalText = sourceDoc.getText();
    const brokenText = originalText.replace("./link-target.md", "./missing-target.md");
    await replaceDocumentContents(sourceDocUri, sourceDoc, brokenText);

    try {
      await waitForDiagnostics(sourceDocUri, 15000);
      const diagnostics = vscode.languages.getDiagnostics(sourceDocUri);
      assert.ok(diagnostics.length > 0, "Broken link should surface diagnostics");
      const driftDiagnostic = diagnostics.find((diag) => diag.code === "doc-drift");
      assert.ok(driftDiagnostic, "Expected doc-drift diagnostic for broken link");
    } finally {
      // Restore original content.
      const currentDoc = await vscode.workspace.openTextDocument(sourceDocUri);
      await replaceDocumentContents(sourceDocUri, currentDoc, originalText);
      await sleep(500);
      await clearDiagnostics();
    }
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function replaceDocumentContents(
  uri: vscode.Uri,
  document: vscode.TextDocument,
  content: string
): Promise<void> {
  const edit = new vscode.WorkspaceEdit();
  const lastLine = document.lineAt(document.lineCount - 1);
  const range = new vscode.Range(new vscode.Position(0, 0), lastLine.range.end);
  edit.replace(uri, range, content);
  await vscode.workspace.applyEdit(edit);
  await (await vscode.workspace.openTextDocument(uri)).save();
}
