import * as assert from "node:assert";
import * as vscode from "vscode";

suite("US5: Template transform ripple detection", () => {
  let workspaceUri: vscode.Uri;
  let templateUri: vscode.Uri;
  let transformScriptUri: vscode.Uri;
  let outputConfigUri: vscode.Uri;

  suiteSetup(async function (this: Mocha.Context) {
    this.timeout(60000);

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    assert.ok(workspaceFolder, "Test workspace must be opened");
    workspaceUri = workspaceFolder.uri;

    templateUri = vscode.Uri.joinPath(workspaceUri, "templates", "config.template.yaml");
    transformScriptUri = vscode.Uri.joinPath(workspaceUri, "scripts", "applyTemplate.ts");
    outputConfigUri = vscode.Uri.joinPath(workspaceUri, "config", "web.config");

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

  test("Template edit ripples through transform pipeline", async function (this: Mocha.Context) {
    this.timeout(45000);
    await clearDiagnostics();

    const document = await vscode.workspace.openTextDocument(templateUri);
    const originalText = document.getText();
    const updatedText = originalText.replace("telemetry: ${TELEMETRY}", "telemetry: ${TELEMETRY}-patched");
    await replaceDocumentContents(templateUri, document, updatedText);

    try {
      await waitForDiagnostics(transformScriptUri, 15000);
      const scriptDiagnostics = vscode.languages.getDiagnostics(transformScriptUri);
      const docDiagnostic = scriptDiagnostics.find((diag) => diag.code === "doc-drift");
      assert.ok(docDiagnostic, "Transform script should receive documentation drift diagnostic");

      await waitForDiagnostics(outputConfigUri, 15000);
      const configDiagnostics = vscode.languages.getDiagnostics(outputConfigUri);
      const configDiagnostic = configDiagnostics.find((diag) => diag.code === "doc-drift");
      assert.ok(configDiagnostic, "Generated config should receive ripple diagnostic");

      const enriched = configDiagnostic as vscode.Diagnostic & {
        data?: { depth?: number; path?: string[] };
      };
      const diagnosticData = enriched.data;
      assert.ok(diagnosticData, "Diagnostic should include metadata payload");
      assert.ok(
        (diagnosticData?.depth ?? 0) >= 2,
        `Expected depth >= 2, received ${diagnosticData?.depth ?? "unknown"}`
      );
      assert.ok(
        Array.isArray(diagnosticData?.path) && diagnosticData.path.length >= 2,
        "Diagnostic path should describe transform chain"
      );
    } finally {
      const currentDoc = await vscode.workspace.openTextDocument(templateUri);
      await replaceDocumentContents(templateUri, currentDoc, originalText);
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
