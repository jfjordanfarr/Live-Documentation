// Live Documentation Language Server
// Thin LSP shell — diagnostics subsystem removed 2026-02-18 (Dev Day 71).
// Future: lint-as-diagnostics (live-docs:lint → Problems panel)
import {
  Connection,
  DidChangeConfigurationNotification,
  InitializeParams,
  InitializeResult,
  ProposedFeatures,
  TextDocumentChangeEvent,
  TextDocumentSyncKind,
  TextDocuments,
  TextDocumentsConfiguration,
  createConnection
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

import { resolveWorkspaceRoot } from "./runtime/environment";

const connection: Connection = createConnection(ProposedFeatures.all);

const textDocumentConfig: TextDocumentsConfiguration<TextDocument> = {
  create: (uri, languageId, version, content): TextDocument =>
    TextDocument.create(uri, languageId, version, content),
  update: (document, changes, version): TextDocument =>
    TextDocument.update(document, changes, version)
};

const documents: TextDocuments<TextDocument> = new TextDocuments(textDocumentConfig);

let workspaceRootPath: string | undefined;

connection.onInitialize((params: InitializeParams): InitializeResult => {
  connection.console.info("live-documentation server starting up");
  workspaceRootPath = resolveWorkspaceRoot(params);
  connection.console.info(`workspace root: ${workspaceRootPath ?? "(none)"}`);

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental
    }
  };
});

connection.onInitialized(() => {
  connection.console.info("live-documentation server initialised");
  void connection.client.register(DidChangeConfigurationNotification.type, undefined);
});

connection.onShutdown(() => {
  connection.console.info("live-documentation server shutdown complete");
});

documents.onDidSave((event: TextDocumentChangeEvent<TextDocument>) => {
  connection.console.info(`[save] ${event.document.uri}`);
  // Future: debounced notification to extension for lint-as-diagnostics
});

documents.listen(connection);
void connection.listen();
