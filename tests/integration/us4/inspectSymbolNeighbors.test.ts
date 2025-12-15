import * as assert from "node:assert";
import * as vscode from "vscode";

declare global {
  // eslint-disable-next-line no-var
  var __linkAwareDiagnosticsTestHooks: {
    window?: Partial<Pick<typeof vscode.window, "showQuickPick" | "showInformationMessage" | "showErrorMessage">>;
  } | undefined;
}

suite("US4: Inspect Symbol Neighbors command", () => {
  let workspaceUri: vscode.Uri;
  let featureUri: vscode.Uri;

  suiteSetup(async function (this: Mocha.Context) {
    this.timeout(60000);

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    assert.ok(workspaceFolder, "Test workspace must be opened");
    workspaceUri = workspaceFolder.uri;
    featureUri = vscode.Uri.joinPath(workspaceUri, "src", "feature.ts");

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

  test("Command executes without error and surfaces empty-state messaging", async function (this: Mocha.Context) {
    this.timeout(20000);

    const document = await vscode.workspace.openTextDocument(featureUri);
    await vscode.window.showTextDocument(document, { preview: false });

    const infoMessages: string[] = [];
    const errorMessages: string[] = [];
    const quickPickInvocations: Array<{
      items: readonly vscode.QuickPickItem[];
      options: vscode.QuickPickOptions | undefined;
    }> = [];

    const stubInfo: typeof vscode.window.showInformationMessage = async (
      message: string,
      ...rest: Array<string | vscode.MessageItem | vscode.MessageOptions>
    ) => {
      infoMessages.push(message);
      const candidates = rest.filter((entry): entry is string | vscode.MessageItem => {
        if (typeof entry === "string") {
          return true;
        }
        return typeof entry === "object" && entry !== null && "title" in entry;
      });
      return (candidates[0] ?? undefined) as never;
    };

    const stubError: typeof vscode.window.showErrorMessage = async (
      message: string,
      ...rest: Array<string | vscode.MessageItem | vscode.MessageOptions>
    ) => {
      errorMessages.push(message);
      const candidates = rest.filter((entry): entry is string | vscode.MessageItem => {
        if (typeof entry === "string") {
          return true;
        }
        return typeof entry === "object" && entry !== null && "title" in entry;
      });
      return (candidates[0] ?? undefined) as never;
    };

    const stubQuickPick: typeof vscode.window.showQuickPick = async <T extends vscode.QuickPickItem>(
      items: readonly T[] | Thenable<readonly T[]>,
      options?: vscode.QuickPickOptions,
      _token?: vscode.CancellationToken
    ) => {
      const resolvedItems = await items;
      quickPickInvocations.push({ items: resolvedItems, options });

      if (options?.canPickMany) {
        return resolvedItems as unknown as T[];
      }

      const firstItem = resolvedItems[0];
      return firstItem ?? undefined;
    };

    const previousHooks = globalThis.__linkAwareDiagnosticsTestHooks;
    globalThis.__linkAwareDiagnosticsTestHooks = {
      ...(previousHooks ?? {}),
      window: {
        ...(previousHooks?.window ?? {}),
        showInformationMessage: stubInfo,
        showErrorMessage: stubError,
        showQuickPick: stubQuickPick
      }
    };

    try {
      await vscode.commands.executeCommand("linkDiagnostics.inspectSymbolNeighbors");
    } finally {
      if (previousHooks) {
        globalThis.__linkAwareDiagnosticsTestHooks = previousHooks;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete globalThis.__linkAwareDiagnosticsTestHooks;
      }
    }

    assert.strictEqual(
      infoMessages.length,
      0,
      "Command should not surface empty-state messaging when neighbors exist"
    );

    assert.strictEqual(
      errorMessages.length,
      0,
      `Command should not show error messaging (received: ${errorMessages.join(" | ")})`
    );

    assert.ok(
      quickPickInvocations.length > 0,
      "Command should present a quick pick with neighboring artifacts"
    );

    const [{ items, options }] = quickPickInvocations;
    assert.ok(Array.isArray(items) && items.length > 0, "Quick pick should list at least one neighbor");
    assert.ok(
      typeof options?.placeHolder === "string" && /\bneighbor(s)?\b/i.test(options.placeHolder),
      "Quick pick placeholder should describe neighbor count"
    );
  });
});

async function waitForLanguageServerReady(): Promise<void> {
  const maxWait = 15000;
  const pollInterval = 500;
  let elapsed = 0;

  while (elapsed < maxWait) {
    try {
      const ready = await vscode.commands.executeCommand<boolean>(
        "linkAwareDiagnostics.isServerReady"
      );
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
  return new Promise(resolve => setTimeout(resolve, ms));
}
