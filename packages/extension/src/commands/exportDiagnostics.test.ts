import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { ListOutstandingDiagnosticsResult } from "@live-documentation/shared/contracts/diagnostics";
import { createVscodeMock, type SharedVscodeMock } from "../testUtils/vscodeMock";

const TEST_TIMEOUT_MS = 15000;
let vscodeMock: SharedVscodeMock;
let mockCommands: SharedVscodeMock["commands"];
let mockWindow: SharedVscodeMock["window"];
let mockWorkspace: SharedVscodeMock["workspace"];
let registerExportDiagnosticsCommand: typeof import("./exportDiagnostics").registerExportDiagnosticsCommand;

vi.mock("node:fs/promises", () => ({
  default: {
    writeFile: vi.fn()
  },
  writeFile: vi.fn()
}));

describe("exportDiagnostics", () => {
  beforeAll(async () => {
    vscodeMock = createVscodeMock();
    vi.doMock("vscode", () => vscodeMock.module);
    ({ registerExportDiagnosticsCommand } = await import("./exportDiagnostics"));
    mockCommands = vscodeMock.commands;
    mockWindow = vscodeMock.window;
    mockWorkspace = vscodeMock.workspace;
  }, 30000);

  afterAll(() => {
    vi.doUnmock("vscode");
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockCommands.registerCommand.mockReset();
    mockWindow.showQuickPick.mockReset();
    mockWindow.showInformationMessage.mockReset();
    mockWindow.showErrorMessage.mockReset();
    mockWindow.showSaveDialog.mockReset();
    mockWorkspace.openTextDocument.mockReset?.();

    mockCommands.registerCommand.mockReturnValue({ dispose: vi.fn() });
    mockWindow.showQuickPick.mockResolvedValue(undefined);
    mockWindow.showInformationMessage.mockResolvedValue(undefined);
    mockWindow.showErrorMessage.mockResolvedValue(undefined);
    mockWindow.showSaveDialog.mockResolvedValue(undefined);
  });

  it("registers the export command", async () => {
    const mockClient = {
      sendRequest: vi.fn()
    } as unknown;

    registerExportDiagnosticsCommand(mockClient as never);

    expect(mockCommands.registerCommand).toHaveBeenCalledWith(
      "linkDiagnostics.exportDiagnostics",
      expect.any(Function)
    );
  }, TEST_TIMEOUT_MS);

  it("exports diagnostics in CSV format", async () => {
    const mockResult: ListOutstandingDiagnosticsResult = {
      generatedAt: "2025-10-22T10:00:00.000Z",
      diagnostics: [
        {
          recordId: "record-1",
          message: "Test diagnostic",
          severity: "warning",
          changeEventId: "change-1",
          createdAt: "2025-10-22T09:00:00.000Z",
          linkIds: ["link-1"],
          target: { id: "target-1", uri: "file:///path/to/target.ts" },
          trigger: { id: "trigger-1", uri: "file:///path/to/trigger.ts" }
        }
      ]
    };

    mockWindow.showQuickPick.mockResolvedValue({ label: "CSV", key: "csv" });
    mockWindow.showSaveDialog.mockResolvedValue({ fsPath: "/export/diagnostics.csv" });

    const mockClient = {
      sendRequest: vi.fn().mockResolvedValue(mockResult)
    };

    registerExportDiagnosticsCommand(mockClient as never);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const handler = mockCommands.registerCommand.mock.calls[0][1] as () => Promise<void>;
    await handler();

    expect(mockClient.sendRequest).toHaveBeenCalledWith("linkDiagnostics/diagnostics/list");
    expect(mockWindow.showSaveDialog).toHaveBeenCalled();
  }, TEST_TIMEOUT_MS);

  it("shows message when no diagnostics exist", async () => {
    const mockResult: ListOutstandingDiagnosticsResult = {
      generatedAt: "2025-10-22T10:00:00.000Z",
      diagnostics: []
    };

    mockWindow.showQuickPick.mockResolvedValue({ label: "JSON", key: "json" });

    const mockClient = {
      sendRequest: vi.fn().mockResolvedValue(mockResult)
    };

    registerExportDiagnosticsCommand(mockClient as never);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const handler = mockCommands.registerCommand.mock.calls[0][1] as () => Promise<void>;
    await handler();

    expect(mockWindow.showInformationMessage).toHaveBeenCalledWith(
      "No outstanding diagnostics to export."
    );
  }, TEST_TIMEOUT_MS);

  it("handles cancellation gracefully", async () => {
    mockWindow.showQuickPick.mockResolvedValue(undefined);

    const mockClient = {
      sendRequest: vi.fn()
    };

    registerExportDiagnosticsCommand(mockClient as never);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const handler = mockCommands.registerCommand.mock.calls[0][1] as () => Promise<void>;
    await handler();

    expect(mockClient.sendRequest).not.toHaveBeenCalled();
  }, TEST_TIMEOUT_MS);
});
