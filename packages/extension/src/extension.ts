import * as path from "path";
import process from "process";
import * as vscode from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from "vscode-languageclient/node";

import {
  FEEDS_READY_REQUEST,
  RESET_DIAGNOSTIC_STATE_NOTIFICATION,
  type FeedsReadyResult
} from "@live-documentation/shared/contracts/diagnostics";
import { RebindRequiredPayload } from "@live-documentation/shared/contracts/maintenance";

import { registerAcknowledgementWorkflow } from "./commands/acknowledgeDiagnostic";
import { registerExportDiagnosticsCommand } from "./commands/exportDiagnostics";
import { registerOverrideLinkCommand } from "./commands/overrideLink";
import { registerDependencyQuickPick } from "./diagnostics/dependencyQuickPick";
import { registerDocDiagnosticProvider } from "./diagnostics/docDiagnosticProvider";
import { showRebindPrompt } from "./prompts/rebindPrompt";
import { registerSymbolBridge } from "./services/symbolBridge";
import { ConfigService } from "./settings/configService";
import { registerDiagnosticsTreeView } from "./views/diagnosticsTree";
import { registerFileMaintenanceWatcher } from "./watchers/fileMaintenance";

const SETTINGS_NOTIFICATION = "linkDiagnostics/settings/update";
const REBIND_NOTIFICATION = "linkDiagnostics/maintenance/rebindRequired";

let client: LanguageClient | undefined;
let configService: ConfigService | undefined;
let clientReady = false;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const serverModule = context.asAbsolutePath(path.join("..", "server", "dist", "main.js"));

  configService = new ConfigService();
  context.subscriptions.push(configService);

  console.log("linkAwareDiagnostics configuration", configService.settings);

  const isTestMode = context.extensionMode === vscode.ExtensionMode.Test;

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc, options: { env: process.env } },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: { env: { ...process.env, DEBUG_LINK_AWARE: "1" } }
    }
  };

  const initializationOptions = {
    storagePath: context.globalStorageUri.fsPath,
    settings: configService.settings,
    testModeOverrides: isTestMode
      ? {
          enableDiagnostics: true
        }
      : undefined
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: "file", language: "markdown" },
      { scheme: "file", language: "plaintext" },
      { scheme: "file", language: "typescript" },
      { scheme: "file", language: "javascript" },
      { scheme: "file", language: "tsx" },
      { scheme: "file", language: "jsx" },
      { scheme: "file", language: "yaml" }
    ],
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher("**/*.{md,markdown,ts,js,tsx,jsx,yaml,yml}")
    },
    initializationOptions,
    diagnosticCollectionName: "Link Diagnostics"
  };

  const createdClient = new LanguageClient(
    "linkAwareDiagnostics",
    "Link-Aware Diagnostics",
    serverOptions,
    clientOptions
  );
  client = createdClient;

  context.subscriptions.push(
    vscode.commands.registerCommand("linkAwareDiagnostics.isServerReady", async () => {
      // Short-circuit on client readiness to avoid blocking unrelated tests.
      if (!client) {
        console.log("isServerReady invoked", false);
        return false;
      }
      if (clientReady) {
        // If client is ready, briefly wait for feeds (if any) to become healthy, but cap the wait to avoid blocking.
        try {
          const deadline = Date.now() + 3000; // up to 3s soft wait
          let last: FeedsReadyResult | undefined;
          do {
            last = await client.sendRequest<FeedsReadyResult>(FEEDS_READY_REQUEST);
            const hasFeeds = typeof last?.configuredFeeds === "number" && last.configuredFeeds > 0;
            if (!hasFeeds || last.ready) {
              console.log(
                "isServerReady invoked",
                true,
                hasFeeds
                  ? `(feeds: configured=${last.configuredFeeds}, healthy=${last.healthyFeeds})`
                  : "(no feeds)"
              );
              return true;
            }
            await new Promise(res => setTimeout(res, 200));
          } while (Date.now() < deadline);

          // Soft timeout reached; proceed to not block tests.
          console.log(
            "isServerReady invoked",
            true,
            last
              ? `(feeds: configured=${last.configuredFeeds}, healthy=${last.healthyFeeds}; soft-timeout)`
              : "(feeds probe failed; soft-timeout)"
          );
          return true;
        } catch (err) {
          console.warn("feeds readiness request failed during soft-wait", err);
          console.log("isServerReady invoked", true, "(client ready; feeds probe error)");
          return true;
        }
      }
      try {
        const result = await client.sendRequest<FeedsReadyResult>(FEEDS_READY_REQUEST);
        const hasFeeds = typeof result?.configuredFeeds === "number" && result.configuredFeeds > 0;
        const ready = hasFeeds ? Boolean(result?.ready) : Boolean(clientReady);
        console.log(
          "isServerReady invoked",
          ready,
          hasFeeds ? `(feeds: configured=${result.configuredFeeds}, healthy=${result.healthyFeeds})` : "(no feeds)"
        );
        return ready;
      } catch (err) {
        console.warn("feeds readiness request failed", err);
        // If the request fails (e.g., early startup), rely on client readiness
        return Boolean(clientReady);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("linkAwareDiagnostics.clearAllDiagnostics", () => {
      client?.diagnostics?.clear();
      if (client) {
        void client.sendNotification(RESET_DIAGNOSTIC_STATE_NOTIFICATION);
      }
      return true;
    })
  );

  clientReady = false;
  await createdClient.start();
  clientReady = true;

  const activeClient = client;
  const activeConfigService = configService;
  if (!activeClient || !activeConfigService) {
    return;
  }

  context.subscriptions.push(
    activeConfigService.onDidChange(settings => {
      void activeClient.sendNotification(SETTINGS_NOTIFICATION, settings);
    })
  );

  await activeClient.sendNotification(SETTINGS_NOTIFICATION, activeConfigService.settings);

  context.subscriptions.push(
    activeClient.onNotification(REBIND_NOTIFICATION, (payload: RebindRequiredPayload) => {
      void showRebindPrompt(payload);
    })
  );

  context.subscriptions.push(registerFileMaintenanceWatcher(activeClient));
  context.subscriptions.push(registerOverrideLinkCommand(activeClient));
  const diagnosticsTree = registerDiagnosticsTreeView(activeClient);
  context.subscriptions.push(diagnosticsTree);
  context.subscriptions.push(
    registerAcknowledgementWorkflow(activeClient, {
      onAcknowledged: () => {
        void diagnosticsTree.provider.refresh();
      }
    })
  );
  context.subscriptions.push(registerDocDiagnosticProvider());
  context.subscriptions.push(registerDependencyQuickPick(activeClient));
  context.subscriptions.push(registerSymbolBridge(activeClient));
  context.subscriptions.push(registerExportDiagnosticsCommand(activeClient));

  context.subscriptions.push(
    vscode.languages.onDidChangeDiagnostics(event => {
      for (const uri of event.uris) {
        const diagnostics = vscode.languages.getDiagnostics(uri);
        if (!diagnostics.some(diagnostic => diagnostic.code === "doc-drift")) {
          continue;
        }

        const uriString = uri.toString();
        if (vscode.workspace.textDocuments.some(document => document.uri.toString() === uriString)) {
          continue;
        }

        void vscode.workspace.openTextDocument(uri).then(
          undefined,
          (error: unknown) => {
            console.warn(
              `Failed to preload document for diagnostics: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        );
      }
    })
  );

}

export async function deactivate(): Promise<void> {
  if (!client) {
    return;
  }

  await client.stop();
  client = undefined;
  clientReady = false;
}
