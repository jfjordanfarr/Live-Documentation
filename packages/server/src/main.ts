// Live Documentation: .mdmd/layer-4/language-server-runtime/languageServerRuntime.mdmd.md#source-breadcrumbs
import * as path from "node:path";
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
  GraphStore,
  INSPECT_DEPENDENCIES_REQUEST,
  LinkInferenceOrchestrator,
  createRelationshipRuleProvider,
  OVERRIDE_LINK_REQUEST,
  OverrideLinkRequest,
  OverrideLinkResponse,
  ACKNOWLEDGE_DIAGNOSTIC_REQUEST,
  type AcknowledgeDiagnosticParams,
  type AcknowledgeDiagnosticResult,
  DIAGNOSTIC_ACKNOWLEDGED_NOTIFICATION,
  type DiagnosticAcknowledgedPayload,
  RESET_DIAGNOSTIC_STATE_NOTIFICATION,
  LIST_OUTSTANDING_DIAGNOSTICS_REQUEST,
  type ListOutstandingDiagnosticsResult,
  SET_DIAGNOSTIC_ASSESSMENT_REQUEST,
  type SetDiagnosticAssessmentParams,
  type SetDiagnosticAssessmentResult,
  FEEDS_READY_REQUEST,
  type FeedsReadyResult,
  LATENCY_SUMMARY_REQUEST,
  type LatencySummaryRequest,
  type LatencySummaryResponse,
  type InspectDependenciesParams,
  type InspectDependenciesResult,
  INSPECT_SYMBOL_NEIGHBORS_REQUEST,
  type InspectSymbolNeighborsParams,
  type InspectSymbolNeighborsResult
} from "@live-documentation/shared";

import { ChangeQueue, QueuedChange } from "./features/changeEvents/changeQueue";
import { inspectDependencies } from "./features/dependencies/inspectDependencies";
import { inspectSymbolNeighbors } from "./features/dependencies/symbolNeighbors";
import { AcknowledgementService } from "./features/diagnostics/acknowledgementService";
import { DiagnosticPublisher } from "./features/diagnostics/diagnosticPublisher";
import { HysteresisController } from "./features/diagnostics/hysteresisController";
import { buildOutstandingDiagnosticsResult } from "./features/diagnostics/listOutstandingDiagnostics";
import { LlmIngestionOrchestrator } from "./features/knowledge/llmIngestionOrchestrator";
import { createStaticFeedWorkspaceProvider } from "./features/knowledge/staticFeedWorkspaceProvider";
import { createSymbolBridgeProvider } from "./features/knowledge/symbolBridgeProvider";
import { createWorkspaceIndexProvider } from "./features/knowledge/workspaceIndexProvider";
import {
  handleArtifactDeleted,
  handleArtifactRenamed
} from "./features/maintenance/removeOrphans";
import { applyOverrideLink } from "./features/overrides/overrideLink";
import { ExtensionSettings, ProviderGuard } from "./features/settings/providerGuard";
import {
  DEFAULT_RUNTIME_SETTINGS,
  RuntimeSettings,
  deriveRuntimeSettings
} from "./features/settings/settingsBridge";
import { ArtifactWatcher } from "./features/watchers/artifactWatcher";
import { createChangeProcessor } from "./runtime/changeProcessor";
import { ensureDirectory, resolveDatabasePath, resolveWorkspaceRoot } from "./runtime/environment";
import { KnowledgeFeedController } from "./runtime/knowledgeFeeds";
import { createDefaultRelationshipExtractor, LlmIngestionManager } from "./runtime/llmIngestion";
import {
  extractExtensionSettings,
  extractTestModeOverrides,
  mergeExtensionSettings
} from "./runtime/settings";
import { DriftHistoryStore } from "./telemetry/driftHistoryStore";
import { LatencyTracker } from "./telemetry/latencyTracker";

const SETTINGS_NOTIFICATION = "linkDiagnostics/settings/update";
const FILE_DELETED_NOTIFICATION = "linkDiagnostics/files/deleted";
const FILE_RENAMED_NOTIFICATION = "linkDiagnostics/files/renamed";

const connection: Connection = createConnection(ProposedFeatures.all);

const textDocumentConfig: TextDocumentsConfiguration<TextDocument> = {
  create: (uri, languageId, version, content): TextDocument =>
    TextDocument.create(uri, languageId, version, content),
  update: (document, changes, version): TextDocument =>
    TextDocument.update(document, changes, version)
};

const documents: TextDocuments<TextDocument> = new TextDocuments(textDocumentConfig);

const linkInferenceOrchestrator = new LinkInferenceOrchestrator();
const diagnosticPublisher = new DiagnosticPublisher(connection);

let graphStore: GraphStore | null = null;
const providerGuard = new ProviderGuard(connection);
const knowledgeFeedController = new KnowledgeFeedController({
  connection,
  now: () => new Date()
});
const hysteresisController = new HysteresisController();
let acknowledgementService: AcknowledgementService | null = null;
let driftHistoryStore: DriftHistoryStore | null = null;
let llmIngestionManager: LlmIngestionManager | null = null;
let latencyTracker: LatencyTracker | null = null;

let changeQueue: ChangeQueue | null = null;
let runtimeSettings: RuntimeSettings = DEFAULT_RUNTIME_SETTINGS;
let artifactWatcher: ArtifactWatcher | null = null;
let workspaceRootPath: string | undefined;
let storageDirectory: string | null = null;

const changeProcessor = createChangeProcessor({
  connection,
  providerGuard,
  hysteresisController,
  initialContext: {
    graphStore: null,
    artifactWatcher: null,
    runtimeSettings,
    acknowledgements: null,
    llmIngestionManager: null,
    latencyTracker: null
  },
  diagnosticSender: diagnosticPublisher
});
changeProcessor.updateContext({ runtimeSettings });

connection.onInitialize((params: InitializeParams): InitializeResult => {
  connection.console.info("live-documentation server starting up");
  diagnosticPublisher.clear();

  const initialSettings = extractExtensionSettings(params.initializationOptions);
  const forcedSettings = mergeExtensionSettings(
    initialSettings,
    extractTestModeOverrides(params.initializationOptions)
  );
  providerGuard.apply(forcedSettings);
  workspaceRootPath = resolveWorkspaceRoot(params);

  const storageFile = resolveDatabasePath(params, providerGuard.getSettings());
  storageDirectory = path.dirname(storageFile);
  ensureDirectory(storageDirectory);
  graphStore = new GraphStore({ dbPath: storageFile });
  driftHistoryStore = new DriftHistoryStore({
    graphStore,
    now: () => new Date()
  });

  latencyTracker = new LatencyTracker({
    logger: {
      warn: message => connection.console.warn(message),
      info: message => connection.console.info(message)
    }
  });
  changeProcessor.updateContext({ latencyTracker });

  const relationshipExtractor = createDefaultRelationshipExtractor({
    connection,
    providerGuard
  });

  const llmOrchestrator = new LlmIngestionOrchestrator({
    graphStore,
    providerGuard,
    relationshipExtractor,
    storageDirectory,
    logger: connection.console,
    now: () => new Date()
  });

  llmIngestionManager = new LlmIngestionManager({
    orchestrator: llmOrchestrator,
    connection
  });

  runtimeSettings = deriveRuntimeSettings(providerGuard.getSettings());
  changeProcessor.updateContext({ runtimeSettings });

  acknowledgementService = new AcknowledgementService({
    graphStore,
    hysteresis: hysteresisController,
    runtimeSettings,
    driftHistory: driftHistoryStore,
    logger: connection.console,
    now: () => new Date()
  });
  changeProcessor.updateContext({ acknowledgements: acknowledgementService });

  changeQueue?.dispose();
  changeQueue = new ChangeQueue({
    debounceMs: runtimeSettings.debounceMs,
    onFlush: changes => changeProcessor.process(changes),
    onEnqueue: change => latencyTracker?.recordEnqueue(change.uri)
  });

  artifactWatcher = new ArtifactWatcher({
    documents,
    graphStore,
    orchestrator: linkInferenceOrchestrator,
    logger: connection.console,
    now: () => new Date()
  });

  changeProcessor.updateContext({ graphStore, artifactWatcher, llmIngestionManager, latencyTracker });

  const workspaceProviders = [];

  if (workspaceRootPath) {
    workspaceProviders.push(
      createWorkspaceIndexProvider({
        rootPath: workspaceRootPath,
        implementationGlobs: ["src"],
        logger: connection.console
      })
    );

    workspaceProviders.push(
      createRelationshipRuleProvider({
        workspaceRoot: workspaceRootPath,
        logger: {
          info: message => connection.console.info(message),
          warn: message => connection.console.warn(message)
        }
      })
    );

    // Fallback: contribute static feed links as workspace evidences so tests don't race on feed readiness
    workspaceProviders.push(
      createStaticFeedWorkspaceProvider({
        rootPath: workspaceRootPath,
        logger: connection.console
      })
    );
  }

  workspaceProviders.push(
    createSymbolBridgeProvider({
      connection,
      logger: {
        info: message => connection.console.info(message),
        warn: message => connection.console.warn(message)
      },
      maxSeeds: 50
    })
  );

  artifactWatcher.setWorkspaceProviders(workspaceProviders);

  void knowledgeFeedController.initialize({
    graphStore,
    artifactWatcher,
    storageDirectory,
    workspaceRoot: workspaceRootPath
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
  connection.console.info("live-documentation server initialised");
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

  void knowledgeFeedController.dispose();

  artifactWatcher = null;
  storageDirectory = null;

  if (graphStore) {
    graphStore.close();
    graphStore = null;
  }

  changeProcessor.updateContext({
    graphStore: null,
    artifactWatcher: null,
    acknowledgements: null,
    llmIngestionManager: null,
    latencyTracker: null
  });

  acknowledgementService = null;
  driftHistoryStore = null;
  llmIngestionManager = null;
  latencyTracker = null;
  diagnosticPublisher.clear();

  connection.console.info("live-documentation server shutdown complete");
});

connection.onDidChangeConfiguration((change: DidChangeConfigurationParams) => {
  const settingsCandidate = extractExtensionSettings(change.settings);
  providerGuard.apply(settingsCandidate);
  void syncRuntimeSettings().then(() => {
    connection.console.info("settings updated");
  });
});

connection.onNotification(SETTINGS_NOTIFICATION, (settings: ExtensionSettings) => {
  providerGuard.apply(settings);
  void syncRuntimeSettings().then(() => {
    connection.console.info("settings forwarded from client");
  });
});

connection.onNotification(FILE_DELETED_NOTIFICATION, (payload: { uri: string }) => {
  connection.console.info(`received delete notification for ${payload.uri}`);
  if (!graphStore) {
    return;
  }

  handleArtifactDeleted(connection, graphStore, payload.uri, diagnosticPublisher);
});

connection.onNotification(
  FILE_RENAMED_NOTIFICATION,
  (payload: { oldUri: string; newUri: string }) => {
    connection.console.info(`received rename notification ${payload.oldUri} -> ${payload.newUri}`);
    if (!graphStore) {
      return;
    }

    handleArtifactRenamed(connection, graphStore, payload.oldUri, payload.newUri, diagnosticPublisher);
  }
);

connection.onRequest(
  OVERRIDE_LINK_REQUEST,
  (payload: OverrideLinkRequest): OverrideLinkResponse => {
    if (!graphStore) {
      throw new Error("Graph store is not initialised");
    }

    try {
      const result = applyOverrideLink(graphStore, payload);
      connection.console.info(
        `override link recorded for ${payload.source.uri} -> ${payload.target.uri}`
      );
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      connection.console.error(`failed to apply link override: ${message}`);
      throw error;
    }
  }
);

connection.onRequest(
  INSPECT_DEPENDENCIES_REQUEST,
  (payload: InspectDependenciesParams): InspectDependenciesResult => {
    if (!graphStore) {
      throw new Error("Graph store is not initialised");
    }

    const result = inspectDependencies({
      graphStore,
      uri: payload.uri,
      maxDepth: payload.maxDepth,
      linkKinds: payload.linkKinds
    });

    connection.console.info(
      `inspected dependencies for ${payload.uri} -> ${result.summary.totalDependents} dependents (max depth ${result.summary.maxDepthReached})`
    );

    return result;
  }
);

connection.onRequest(
  INSPECT_SYMBOL_NEIGHBORS_REQUEST,
  (payload: InspectSymbolNeighborsParams): InspectSymbolNeighborsResult => {
    if (!graphStore) {
      throw new Error("Graph store is not initialised");
    }

    const result = inspectSymbolNeighbors({
      graphStore,
      artifactId: payload.artifactId,
      artifactUri: payload.uri,
      maxDepth: payload.maxDepth,
      maxResults: payload.maxResults,
      linkKinds: payload.linkKinds
    });

    const targetLabel = payload.artifactId ?? payload.uri ?? "<unknown>";
    connection.console.info(
      `inspected symbol neighbors for ${targetLabel} -> ${result.summary.totalNeighbors} neighbors (max depth ${result.summary.maxDepthReached})`
    );

    return result;
  }
);

connection.onRequest(
  ACKNOWLEDGE_DIAGNOSTIC_REQUEST,
  (payload: AcknowledgeDiagnosticParams): AcknowledgeDiagnosticResult => {
    if (!acknowledgementService || !graphStore) {
      throw new Error("Acknowledgement service is not available");
    }

    const outcome = acknowledgementService.acknowledgeDiagnostic(payload);
    if (outcome.kind === "not_found") {
      return { status: "not_found" };
    }

    const record = outcome.record;
    const targetArtifact = graphStore.getArtifactById(record.artifactId ?? "");
    const triggerArtifact = graphStore.getArtifactById(record.triggerArtifactId ?? "");

    const notification: DiagnosticAcknowledgedPayload = {
      recordId: record.id,
      targetUri: targetArtifact?.uri,
      triggerUri: triggerArtifact?.uri
    };

    void connection.sendNotification(DIAGNOSTIC_ACKNOWLEDGED_NOTIFICATION, notification);
    diagnosticPublisher.removeByRecordId(targetArtifact?.uri, record.id);

    return {
      status: outcome.kind === "acknowledged" ? "acknowledged" : "already_acknowledged",
      acknowledgedAt: record.acknowledgedAt ?? record.createdAt,
      acknowledgedBy: record.acknowledgedBy,
      recordId: record.id,
      targetUri: targetArtifact?.uri,
      triggerUri: triggerArtifact?.uri
    } satisfies AcknowledgeDiagnosticResult;
  }
);

connection.onRequest(
  LIST_OUTSTANDING_DIAGNOSTICS_REQUEST,
  (): ListOutstandingDiagnosticsResult => {
    if (!acknowledgementService || !graphStore) {
      throw new Error("Acknowledgement service is not available");
    }

    const diagnostics = acknowledgementService.listActiveDiagnostics();
    return buildOutstandingDiagnosticsResult(diagnostics, graphStore);
  }
);

connection.onRequest(
  SET_DIAGNOSTIC_ASSESSMENT_REQUEST,
  (payload: SetDiagnosticAssessmentParams): SetDiagnosticAssessmentResult => {
    if (!graphStore) {
      throw new Error("Graph store is not available");
    }

    const existing = graphStore.getDiagnosticById(payload.diagnosticId);
    if (!existing) {
      throw new Error(`Diagnostic ${payload.diagnosticId} not found`);
    }

    graphStore.updateDiagnosticAssessment({ id: payload.diagnosticId, assessment: payload.assessment });

    const updated = graphStore.getDiagnosticById(payload.diagnosticId);
    connection.console.info(
      `[diagnostics] stored LLM assessment for ${payload.diagnosticId} (assessment=${payload.assessment ? "set" : "cleared"})`
    );

    return {
      diagnosticId: payload.diagnosticId,
      updatedAt: new Date().toISOString(),
      assessment: updated?.llmAssessment
    } satisfies SetDiagnosticAssessmentResult;
  }
);

// Report whether knowledge feeds have been discovered and are healthy.
connection.onRequest(
  FEEDS_READY_REQUEST,
  (): FeedsReadyResult => {
    const healthyCount = knowledgeFeedController.getHealthyFeeds().length;
    const configuredCount = knowledgeFeedController.getConfiguredFeedCount();
    connection.console.info(
      `feeds readiness probe: configured=${configuredCount}, healthy=${healthyCount}, workspaceRoot=${Boolean(
        workspaceRootPath
      )}`
    );
    return {
      // Ready when no feeds are configured (nothing to wait on), or when all configured feeds are healthy
      ready: configuredCount === 0 || healthyCount >= configuredCount,
      configuredFeeds: configuredCount,
      healthyFeeds: healthyCount
    } satisfies FeedsReadyResult;
  }
);

connection.onRequest(
  LATENCY_SUMMARY_REQUEST,
  (payload: LatencySummaryRequest = {}): LatencySummaryResponse => {
    if (!latencyTracker) {
      throw new Error("Latency tracker is not available");
    }

    const summary = latencyTracker.snapshot({
      reset: payload.reset,
      maxSamples: payload.maxSamples
    });

    connection.console.info(
      `[latency] summary requested (reset=${Boolean(payload.reset)}, recentSamples=${summary.recentSamples.length})`
    );

    return { summary } satisfies LatencySummaryResponse;
  }
);

connection.onNotification(RESET_DIAGNOSTIC_STATE_NOTIFICATION, () => {
  hysteresisController.reset();
  diagnosticPublisher.clear();
  connection.console.info("diagnostic state reset via client request");
});

documents.onDidSave((event: TextDocumentChangeEvent<TextDocument>) => {
  const payload: QueuedChange = {
    uri: event.document.uri,
    languageId: event.document.languageId,
    version: event.document.version
  };

  if (changeQueue) {
    changeQueue.enqueue(payload);
  } else {
    latencyTracker?.recordEnqueue(payload.uri);
    void changeProcessor.process([payload]);
  }
});

documents.listen(connection);
void connection.listen();

async function syncRuntimeSettings(): Promise<void> {
  runtimeSettings = deriveRuntimeSettings(providerGuard.getSettings());
  changeQueue?.updateDebounceWindow(runtimeSettings.debounceMs);
  changeProcessor.updateContext({ runtimeSettings });
  acknowledgementService?.updateRuntimeSettings(runtimeSettings);

  await knowledgeFeedController.initialize({
    graphStore,
    artifactWatcher,
    storageDirectory,
    workspaceRoot: workspaceRootPath
  });

  if (llmIngestionManager) {
    changeProcessor.updateContext({ llmIngestionManager });
  }

  connection.console.info(
    `runtime settings updated (debounce=${runtimeSettings.debounceMs}ms, noise=${runtimeSettings.noiseSuppression.level})`
  );
}