import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import {
  DocumentSymbol,
  Location,
  Position,
  Range,
  SymbolKind,
  Uri,
  commands,
  workspace
} from "vscode";

import type { ArtifactSeed } from "@live-documentation/shared/inference/fallbackInference";

import { SymbolBridgeAnalyzer } from "./symbolBridge";

type CommandHandler = (...args: unknown[]) => unknown;

vi.mock("vscode", () => {
  class Uri {
    private readonly href: string;
    readonly scheme: string;
    readonly fsPath: string;

    private constructor(url: URL) {
      this.scheme = url.protocol.replace(":", "");
      this.href = url.href.replace(/\/$/, "");
      this.fsPath = decodeURIComponent(url.pathname);
    }

    toString(): string {
      return this.href;
    }

    static parse(value: string): Uri {
      return new Uri(new URL(value));
    }
  }

  class Position {
    constructor(public line: number, public character: number) {}
  }

  class Range {
    constructor(public start: Position, public end: Position) {}
  }

  class Location {
    constructor(public uri: Uri, public range: Range) {}
  }

  class DocumentSymbol {
    children: DocumentSymbol[] = [];

    constructor(
      public name: string,
      public detail: string,
      public kind: number,
      public range: Range,
      public selectionRange: Range
    ) {}
  }

  const SymbolKind = {
    Function: 11,
    Method: 6,
    Class: 4,
    Variable: 13,
    Interface: 8,
    Property: 7,
    Enum: 10,
    Namespace: 3,
    Module: 2
  } as const;

  const handlers = new Map<string, CommandHandler>();
  const openDocuments = new Map<string, { uri: Uri; languageId: string }>();

  const executeCommand = vi.fn((command: string, ...args: unknown[]) => {
    const handler = handlers.get(command);
    return handler ? handler(...args) : undefined;
  });

  const openTextDocument = vi.fn((uri: Uri | string) => {
    const key = typeof uri === "string" ? uri : uri.toString();
    const document = openDocuments.get(key);
    if (!document) {
      throw new Error(`No document registered for ${key}`);
    }
    return Promise.resolve(document);
  });

  const getWorkspaceFolder = vi.fn((uri: Uri | string) => {
    const candidate = typeof uri === "string" ? Uri.parse(uri) : uri;
    return candidate.scheme === "file" ? { uri: candidate } : undefined;
  });

  const workspace = {
    openTextDocument,
    textDocuments: [] as Array<{ uri: Uri; languageId: string }> ,
    getWorkspaceFolder,
    __setDocuments(documents: Array<{ uri: Uri; languageId: string }>) {
      openDocuments.clear();
      for (const document of documents) {
        openDocuments.set(document.uri.toString(), document);
      }
      this.textDocuments = documents;
    },
    __reset() {
      openDocuments.clear();
      openTextDocument.mockClear();
      getWorkspaceFolder.mockClear();
      this.textDocuments = [];
    }
  };

  const commands = {
    executeCommand,
    __setHandler(command: string, handler: CommandHandler) {
      handlers.set(command, handler);
    },
    __reset() {
      handlers.clear();
      executeCommand.mockClear();
    }
  };

  return {
    commands,
    workspace,
    DocumentSymbol,
    Location,
    Position,
    Range,
    SymbolKind,
    Uri
  };
});

type MockWorkspace = typeof workspace & {
  __setDocuments(documents: Array<{ uri: Uri; languageId: string }>): void;
  __reset(): void;
};

type MockCommands = typeof commands & {
  __setHandler(command: string, handler: (...args: unknown[]) => unknown): void;
  __reset(): void;
};

describe("SymbolBridgeAnalyzer", () => {
  const commandsMock = commands as MockCommands;
  const workspaceMock = workspace as MockWorkspace;

  beforeEach(() => {
    commandsMock.__reset();
    workspaceMock.__reset();
  });

  it("collects workspace references and returns link contribution", async () => {
    const analyzer = new SymbolBridgeAnalyzer();

    const sourceUri = Uri.parse("file:///repo/src/a.ts");
    const referencedUri = Uri.parse("file:///repo/src/b.ts");

    workspaceMock.__setDocuments([
      { uri: sourceUri, languageId: "typescript" },
      { uri: referencedUri, languageId: "typescript" }
    ]);

    const symbolRange = new Range(new Position(0, 0), new Position(0, 1));
    const symbol = new DocumentSymbol("foo", "", SymbolKind.Function, symbolRange, symbolRange);

    commandsMock.__setHandler(
      "vscode.executeDocumentSymbolProvider",
      ((uri: Uri) => {
        if (uri.toString() === sourceUri.toString()) {
          return [symbol];
        }
        return [];
      }) as CommandHandler
    );

    commandsMock.__setHandler(
      "vscode.executeReferenceProvider",
      ((uri: Uri) => {
        if (uri.toString() === sourceUri.toString()) {
          return [
            new Location(
              referencedUri,
              new Range(new Position(1, 0), new Position(1, 3))
            )
          ];
        }
        return [];
      }) as CommandHandler
    );

    const seeds: ArtifactSeed[] = [
      { uri: sourceUri.toString(), layer: "code", language: "typescript" }
    ];

    const result = await analyzer.collect({ seeds });

    expect(result.summary).toEqual(
      expect.objectContaining({
        filesAnalyzed: 1,
        symbolsVisited: 1,
        referencesResolved: 1
      })
    );

    expect(result.contribution.evidences).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceUri: referencedUri.toString(),
          targetUri: sourceUri.toString(),
          kind: "depends_on",
          createdBy: "workspace-symbols"
        })
      ])
    );

    expect(result.contribution.hints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceUri: referencedUri.toString(),
          targetUri: sourceUri.toString(),
          kind: "depends_on"
        })
      ])
    );

    expect(result.contribution.seeds).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ uri: referencedUri.toString(), layer: "code" })
      ])
    );
  });

  it("skips duplicate and unsupported seeds", async () => {
    const analyzer = new SymbolBridgeAnalyzer();

    const sourceUri = Uri.parse("file:///repo/src/a.ts");

    workspaceMock.__setDocuments([
      { uri: sourceUri, languageId: "typescript" }
    ]);

    commandsMock.__setHandler("vscode.executeDocumentSymbolProvider", (() => []) as CommandHandler);
    commandsMock.__setHandler("vscode.executeReferenceProvider", (() => []) as CommandHandler);

    const seeds: ArtifactSeed[] = [
      { uri: sourceUri.toString(), layer: "code", language: "typescript" },
      { uri: sourceUri.toString(), layer: "code", language: "typescript" },
      { uri: "file:///repo/docs/readme.md", layer: "requirements", language: "markdown" }
    ];

    const result = await analyzer.collect({ seeds });

    expect(result.summary).toEqual(
      expect.objectContaining({ filesAnalyzed: 1, symbolsVisited: 0, referencesResolved: 0 })
    );

    const openTextDocumentMock = workspace.openTextDocument as unknown as Mock;
    expect(openTextDocumentMock).toHaveBeenCalledTimes(1);
    expect(result.contribution.evidences).toBeUndefined();
    expect(result.contribution.hints).toBeUndefined();
    expect(result.contribution.seeds).toBeUndefined();
  });
});
