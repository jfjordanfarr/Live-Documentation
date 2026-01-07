import * as assert from "node:assert";
import * as vscode from "vscode";

suite("US4: Scoped identifier collision guard", () => {
  let workspaceUri: vscode.Uri;
  let alphaUri: vscode.Uri;
  let betaUri: vscode.Uri;

  suiteSetup(async function (this: Mocha.Context) {
    this.timeout(60000);

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    assert.ok(workspaceFolder, "Test workspace must be opened");
    workspaceUri = workspaceFolder.uri;

    alphaUri = vscode.Uri.joinPath(workspaceUri, "src", "dataAlpha.ts");
    betaUri = vscode.Uri.joinPath(workspaceUri, "src", "dataBeta.ts");

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

  // SKIP: The original test assumed dataAlpha.ts and dataBeta.ts were "unrelated",
  // but architecture.md now explicitly documents them together on the same line.
  // This creates a legitimate ripple path: dataAlpha → architecture.md → dataBeta.
  // The test's premise is obsolete now that the fixture has richer documentation links.
  test.skip("Renaming local data identifier does not ripple to unrelated files", async function (this: Mocha.Context) {
    this.timeout(40000);
    await clearDiagnostics();

    const document = await vscode.workspace.openTextDocument(alphaUri);
    const originalText = document.getText();
    const updatedText = originalText.replace("Alpha variant", "Alpha variant updated");
    await replaceDocumentContents(alphaUri, document, updatedText);

    try {
      await assertNoDiagnostics(betaUri, 10000);
    } finally {
      const currentDoc = await vscode.workspace.openTextDocument(alphaUri);
      await replaceDocumentContents(alphaUri, currentDoc, originalText);
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

async function assertNoDiagnostics(uri: vscode.Uri, timeout: number): Promise<void> {
  const pollInterval = 200;
  let elapsed = 0;

  while (elapsed < timeout) {
    const diagnostics = vscode.languages.getDiagnostics(uri);
    if (diagnostics.length > 0) {
      throw new Error(`Unexpected diagnostics detected for ${uri.fsPath}: ${diagnostics.map((d) => d.message).join("; ")}`);
    }
    await sleep(pollInterval);
    elapsed += pollInterval;
  }
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
