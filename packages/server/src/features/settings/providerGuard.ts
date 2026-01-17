import { Connection } from "vscode-languageserver";

import type { LinkRelationshipKind } from "@live-documentation/shared/domain/artifacts";

export interface RippleExtensionSettings {
  maxDepth?: number;
  maxResults?: number;
  allowedKinds?: LinkRelationshipKind[];
  documentKinds?: LinkRelationshipKind[];
  codeKinds?: LinkRelationshipKind[];
}

export interface ExtensionSettings {
  storagePath?: string;
  enableDiagnostics?: boolean;
  llmProviderMode?: "prompt" | "local-only" | "disabled";
  debounceMs?: number;
  noiseSuppression?: {
    level?: "low" | "medium" | "high";
    minConfidence?: number;
    maxDepth?: number;
    maxPerChange?: number;
    maxPerArtifact?: number;
  };
  ripple?: RippleExtensionSettings;
}

export class ProviderGuard {
  private settings: ExtensionSettings = {};

  constructor(private readonly connection: Connection) {}

  apply(settings: ExtensionSettings | undefined): void {
    if (!settings) {
      return;
    }

    this.settings = { ...this.settings, ...settings };

    if (!this.settings.enableDiagnostics) {
      this.connection.console.info(
        "Diagnostics remain disabled until provider consent is recorded on the client."
      );
    }
  }

  getSettings(): ExtensionSettings {
    return this.settings;
  }

  areDiagnosticsEnabled(): boolean {
    return Boolean(this.settings.enableDiagnostics);
  }
}
