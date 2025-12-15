import * as assert from "node:assert";
import * as path from "node:path";
import * as os from "node:os";
import { promises as fs, existsSync } from "node:fs";
import Database from "better-sqlite3";
import * as vscode from "vscode";

/**
 * US3 Integration Test: Leads resolve alerts efficiently
 *
 * This suite is a placeholder while the acknowledgement service (T043) and related
 * commands are implemented. The tests are currently skipped to keep CI green, but
 * they document the acceptance criteria for the acknowledgement workflow.
 */

suite("US3: Diagnostics acknowledgement workflow", () => {
  let workspaceUri: vscode.Uri;
  let _sourceDocUri: vscode.Uri;
  let _targetCodeUri: vscode.Uri;
  let storageDir: string;

  suiteSetup(async function (this: Mocha.Context) {
    this.timeout(60000);

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    assert.ok(workspaceFolder, "Test workspace must be opened");
    workspaceUri = workspaceFolder.uri;

    _sourceDocUri = vscode.Uri.joinPath(workspaceUri, "docs", "link-source.md");
    _targetCodeUri = vscode.Uri.joinPath(workspaceUri, "src", "core.ts");
    storageDir = path.join(workspaceUri.fsPath, ".live-documentation-test");
    await fs.mkdir(storageDir, { recursive: true });

    const config = vscode.workspace.getConfiguration("linkAwareDiagnostics");
    await config.update("enableDiagnostics", true, vscode.ConfigurationTarget.Workspace);
    await config.update("llmProviderMode", "local-only", vscode.ConfigurationTarget.Workspace);
    await config.update("storagePath", storageDir, vscode.ConfigurationTarget.Workspace);

    const extension = vscode.extensions.getExtension("live-documentation.live-documentation");
    assert.ok(extension, "Extension must be installed");

    if (!process.env.LINK_AWARE_PROVIDER_MODE) {
      process.env.LINK_AWARE_PROVIDER_MODE = "local-only";
    }

    await extension.activate();

    await waitForLanguageServerReady();
  });

  test("Lead acknowledges diagnostic to clear until next change", async function (this: Mocha.Context) {
    this.timeout(60000);

    await clearDiagnostics();

    const sourceDoc = await vscode.workspace.openTextDocument(_sourceDocUri);

    // Trigger initial documentation drift diagnostic.
    await appendText(sourceDoc, "\n\n## Acknowledgement Flow\nInitial change to trigger diagnostics.");
    await sourceDoc.save();

    const initial = await waitForDiagnosticWithRecord(_targetCodeUri, 20000);
    assert.ok(initial.recordId, "Diagnostic should include persistent record identifier");

    const acknowledgementPayload =
      initial.diagnostic.data && typeof initial.diagnostic.data === "object"
        ? initial.diagnostic.data
        : { recordId: initial.recordId };

    await vscode.commands.executeCommand("linkDiagnostics.acknowledgeDiagnostic", {
      diagnostic: initial.diagnostic,
      data: acknowledgementPayload,
      uri: _targetCodeUri
    });

    await waitForDiagnosticAbsence(_targetCodeUri, initial.recordId, 10000);

    const changeEventId = extractChangeEventId(initial.diagnostic);
    if (!changeEventId) {
      throw new Error("Diagnostic should include change event identifier");
    }

  const dbPath = await locateDatabasePath(storageDir, workspaceUri.fsPath, 10000);
  const driftDb = openReadonlyDatabase(dbPath);
    try {
      const rows = driftDb
        .prepare(
          `SELECT status, actor
           FROM drift_history
           WHERE diagnostic_id = ?`
        )
        .all(initial.recordId) as Array<{ status: string; actor: string | null }>;

      assert.ok(rows.some(row => row.status === "acknowledged"), "Drift history should capture acknowledgement entries");

      const summaryRows = driftDb
        .prepare(
          `SELECT status, COUNT(*) AS count
           FROM drift_history
           WHERE change_event_id = ?
           GROUP BY status`
        )
        .all(changeEventId) as Array<{ status: string; count: number }>;
      const summaryMap = new Map(summaryRows.map(row => [row.status, row.count]));
      assert.ok((summaryMap.get("acknowledged") ?? 0) >= 1, "Change event summary should reflect acknowledged entries");
    } finally {
      driftDb.close();
    }

    // Introduce a new change event to ensure acknowledgements only suppress existing records.
    await appendText(sourceDoc, "\n\n## Follow-up Change\nSubsequent edit to re-trigger diagnostics.");
    await sourceDoc.save();

    const subsequent = await waitForDiagnosticWithRecord(_targetCodeUri, 20000);
    assert.ok(subsequent.recordId, "Subsequent diagnostic should include persistent record identifier");
    assert.notStrictEqual(subsequent.recordId, initial.recordId, "New change event should emit new diagnostic record");
  });

  test.skip("Export diagnostics includes acknowledgement metadata", async function (this: Mocha.Context) {
    this.timeout(60000);
    // Export workflow (planned for T045):
    // 1. Trigger at least one diagnostic and acknowledge it via the acknowledgement command.
    // 2. Execute the export command (expected: linkDiagnostics.exportDiagnostics) and capture
    //    the resulting artifact.
    // 3. Verify that the exported payload marks the diagnostic as acknowledged, including
    //    timestamp and actor, so leads can share state externally.
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function clearDiagnostics(): Promise<void> {
  await vscode.commands.executeCommand("linkAwareDiagnostics.clearAllDiagnostics");
  await sleep(500);
}

async function appendText(document: vscode.TextDocument, text: string): Promise<void> {
  const edit = new vscode.WorkspaceEdit();
  const lastLine = document.lineAt(document.lineCount - 1);
  edit.insert(document.uri, lastLine.range.end, text);
  const applied = await vscode.workspace.applyEdit(edit);
  assert.ok(applied, "Workspace edit should apply successfully");
}

interface DiagnosticWithRecordId extends vscode.Diagnostic {
  data?: Record<string, unknown> & { recordId?: string };
}

function openReadonlyDatabase(dbPath: string): Database.Database {
  const nativeBinding = resolveBetterSqliteNativeBinding();
  const options: Database.Options = nativeBinding
    ? { readonly: true, nativeBinding }
    : { readonly: true };
  return new Database(dbPath, options);
}

function resolveBetterSqliteNativeBinding(): string | undefined {
  const moduleVersion = process.versions.modules;
  if (!moduleVersion) {
    return undefined;
  }

  let packageDir: string;
  try {
    const packageJsonPath = require.resolve("better-sqlite3/package.json");
    packageDir = path.dirname(packageJsonPath);
  } catch {
    return undefined;
  }

  const candidate = path.join(
    packageDir,
    "build",
    "Release",
    `abi-${moduleVersion}`,
    "better_sqlite3.node"
  );

  return existsSync(candidate) ? candidate : undefined;
}

function extractChangeEventId(diagnostic: vscode.Diagnostic): string | undefined {
  const candidate = (diagnostic as DiagnosticWithRecordId).data;
  if (!candidate || typeof candidate !== "object") {
    return undefined;
  }

  const value = (candidate as Record<string, unknown>).changeEventId;
  return typeof value === "string" ? value : undefined;
}

async function waitForDiagnosticWithRecord(
  uri: vscode.Uri,
  timeout: number
): Promise<{ diagnostic: DiagnosticWithRecordId; recordId: string }> {
  const pollInterval = 200;
  let elapsed = 0;

  while (elapsed < timeout) {
    const diagnostics = vscode.languages.getDiagnostics(uri) as DiagnosticWithRecordId[];
    const match = diagnostics.find((candidate) => typeof candidate.data?.recordId === "string");
    if (match && match.data && typeof match.data.recordId === "string") {
      return { diagnostic: match, recordId: match.data.recordId };
    }

    await sleep(pollInterval);
    elapsed += pollInterval;
  }

  throw new Error(`Timed out waiting for diagnostic with recordId on ${uri.fsPath}`);
}

async function waitForDiagnosticAbsence(uri: vscode.Uri, recordId: string, timeout: number): Promise<void> {
  const pollInterval = 200;
  let elapsed = 0;

  while (elapsed < timeout) {
    const diagnostics = vscode.languages.getDiagnostics(uri) as DiagnosticWithRecordId[];
    const stillPresent = diagnostics.some((candidate) => candidate.data?.recordId === recordId);
    if (!stillPresent) {
      return;
    }

    await sleep(pollInterval);
    elapsed += pollInterval;
  }

  throw new Error(`Diagnostic ${recordId} still present for ${uri.fsPath} after ${timeout}ms`);
}

async function locateDatabasePath(storageDir: string, workspacePath: string, timeout: number): Promise<string> {
  const pollInterval = 200;
  let elapsed = 0;
  const primary = path.join(storageDir, "live-documentation.db");
  const fallbackWorkspace = path.join(workspacePath, ".live-documentation", "live-documentation.db");
  const fallbackTemp = path.join(os.tmpdir(), "live-documentation", "live-documentation.db");
  const candidates = [primary, fallbackWorkspace, fallbackTemp];

  while (elapsed < timeout) {
    for (const candidate of candidates) {
      try {
        await fs.stat(candidate);
        return candidate;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw error;
        }
      }
    }

    await sleep(pollInterval);
    elapsed += pollInterval;
  }

  throw new Error(
    `Drift history database not found within ${timeout}ms (checked: ${candidates.join(", ")})`
  );
}
