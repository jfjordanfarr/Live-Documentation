// Live Documentation VS Code Extension
// Thin CLI wrapper — diagnostics subsystem removed 2026-02-18 (Dev Day 71).
// Future: lint-as-diagnostics, smart file watching, prompt helpers.
import * as path from "path";
import process from "process";
import * as vscode from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from "vscode-languageclient/node";

let client: LanguageClient | undefined;
let clientReady = false;

/** Activates the Live Documentation VS Code extension and starts the language server. */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const serverModule = context.asAbsolutePath(path.join("..", "server", "dist", "main.js"));

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc, options: { env: process.env } },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: { env: { ...process.env, DEBUG_LINK_AWARE: "1" } }
    }
  };

  const initializationOptions = {
    storagePath: context.globalStorageUri.fsPath
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
    initializationOptions
  };

  const createdClient = new LanguageClient(
    "liveDocumentation",
    "Live Documentation",
    serverOptions,
    clientOptions
  );
  client = createdClient;

  context.subscriptions.push(
    vscode.commands.registerCommand("liveDocumentation.isServerReady", () => {
      return clientReady;
    })
  );

  clientReady = false;
  await createdClient.start();
  clientReady = true;
}

/** Stops the language server and cleans up the extension resources. */
export async function deactivate(): Promise<void> {
  if (!client) {
    return;
  }

  await client.stop();
  client = undefined;
  clientReady = false;
}
