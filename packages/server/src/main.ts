// Live Documentation: .mdmd/layer-4/language-server-runtime/languageServerRuntime.mdmd.md#source-breadcrumbs
// Simplified Language Server - GraphStore infrastructure removed in favor of Live Doc-based analysis
import {
  Connection,
  DidChangeConfigurationNotification,
  DidChangeConfigurationParams,
  InitializeParams,
  InitializeResult,
  ProposedFeatures,
  TextDocumentChangeEvent,
  TextDocumentSyncKind,
  TextDocuments,
  TextDocumentsConfiguration,
  createConnection,
  DocumentDiagnosticRequest,
  type DocumentDiagnosticParams
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

import {
  FEEDS_READY_REQUEST,
  type FeedsReadyResult
} from "@live-documentation/shared";

import { ChangeQueue, QueuedChange } from "./features/changeEvents/changeQueue";
import { DiagnosticPublisher } from "./features/diagnostics/diagnosticPublisher";
import { HysteresisController } from "./features/diagnostics/hysteresisController";
import { ExtensionSettings, ProviderGuard } from "./features/settings/providerGuard";
import {
  DEFAULT_RUNTIME_SETTINGS,
  RuntimeSettings,
  deriveRuntimeSettings
} from "./features/settings/settingsBridge";
import { resolveWorkspaceRoot } from "./runtime/environment";
import {
  extractExtensionSettings,
  extractTestModeOverrides,
  mergeExtensionSettings
} from "./runtime/settings";

const SETTINGS_NOTIFICATION = "linkDiagnostics/settings/update";

const connection: Connection = createConnection(ProposedFeatures.all);

const textDocumentConfig: TextDocumentsConfiguration<TextDocument> = {
  create: (uri, languageId, version, content): TextDocument =>
    TextDocument.create(uri, languageId, version, content),
  update: (document, changes, version): TextDocument =>
    TextDocument.update(document, changes, version)
};

const documents: TextDocuments<TextDocument> = new TextDocuments(textDocumentConfig);
const diagnosticPublisher = new DiagnosticPublisher(connection);
const providerGuard = new ProviderGuard(connection);
const hysteresisController = new HysteresisController();

let changeQueue: ChangeQueue | null = null;
let runtimeSettings: RuntimeSettings = DEFAULT_RUNTIME_SETTINGS;
let workspaceRootPath: string | undefined;

connection.onInitialize((params: InitializeParams): InitializeResult => {
  connection.console.info("live-documentation server starting up (stateless mode)");
  diagnosticPublisher.clear();

  const initialSettings = extractExtensionSettings(params.initializationOptions);
  const forcedSettings = mergeExtensionSettings(
    initialSettings,
    extractTestModeOverrides(params.initializationOptions)
  );
  providerGuard.apply(forcedSettings);
  workspaceRootPath = resolveWorkspaceRoot(params);

  runtimeSettings = deriveRuntimeSettings(providerGuard.getSettings());

  changeQueue?.dispose();
  changeQueue = new ChangeQueue({
    debounceMs: runtimeSettings.debounceMs,
    onFlush: changes => processChanges(changes),
    onEnqueue: () => { /* latency tracking removed */ }
  });

  connection.console.info(
    `runtime settings initialised (debounce=${runtimeSettings.debounceMs}ms, noise=${runtimeSettings.noiseSuppression.level})`
  );

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      diagnosticProvider: {
        interFileDependencies: true,
        workspaceDiagnostics: false
      }
    }
  };
});

connection.onInitialized(() => {
  connection.console.info("live-documentation server initialised (stateless mode)");
  void connection.client.register(DidChangeConfigurationNotification.type, undefined);
});

connection.onRequest(
  DocumentDiagnosticRequest.type,
  (params: DocumentDiagnosticParams) => {
    return diagnosticPublisher.buildDocumentReport(params.textDocument.uri, params.previousResultId);
  }
);

connection.onShutdown(() => {
  changeQueue?.dispose();
  changeQueue = null;
  diagnosticPublisher.clear();
  connection.console.info("live-documentation server shutdown complete");
});

connection.onDidChangeConfiguration((change: DidChangeConfigurationParams) => {
  const settingsCandidate = extractExtensionSettings(change.settings);
  providerGuard.apply(settingsCandidate);
  syncRuntimeSettings();
  connection.console.info("settings updated");
});

connection.onNotification(SETTINGS_NOTIFICATION, (settings: ExtensionSettings) => {
  providerGuard.apply(settings);
  syncRuntimeSettings();
  connection.console.info("settings forwarded from client");
});

// Feed readiness - always ready in stateless mode (no feeds to wait on)
connection.onRequest(
  FEEDS_READY_REQUEST,
  (): FeedsReadyResult => {
    return {
      ready: true,
      configuredFeeds: 0,
      healthyFeeds: 0
    } satisfies FeedsReadyResult;
  }
);

documents.onDidSave((event: TextDocumentChangeEvent<TextDocument>) => {
  const payload: QueuedChange = {
    uri: event.document.uri,
    languageId: event.document.languageId,
    version: event.document.version
  };

  if (changeQueue) {
    changeQueue.enqueue(payload);
  } else {
    void processChanges([payload]);
  }
});

documents.listen(connection);
void connection.listen();

/**
 * Process file changes in stateless mode.
 * 
 * In the future, this could:
 * 1. Trigger `live-docs:generate --changed` for affected files
 * 2. Run `live-docs:lint` and surface broken links as diagnostics
 * 
 * For now, it just logs changes.
 */
function processChanges(changes: QueuedChange[]): void {
  for (const change of changes) {
    connection.console.info(`[stateless] file changed: ${change.uri}`);
  }
  
  // TODO: Wire in buildLiveDocGraph() + lint for stateless diagnostics
  // The extension can call live-docs:lint and surface results as diagnostics
}

function syncRuntimeSettings(): void {
  runtimeSettings = deriveRuntimeSettings(providerGuard.getSettings());
  changeQueue?.updateDebounceWindow(runtimeSettings.debounceMs);
  connection.console.info(
    `runtime settings updated (debounce=${runtimeSettings.debounceMs}ms, noise=${runtimeSettings.noiseSuppression.level})`
  );
}

// Suppress unused variable warning for workspaceRootPath (will be used when live-docs:lint integration is added)
void workspaceRootPath;
// Suppress unused variable warning for hysteresisController (preserved for future diagnostic debouncing)
void hysteresisController;
