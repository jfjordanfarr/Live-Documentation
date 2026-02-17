import { Connection } from "vscode-languageserver";

import type { LinkRelationshipKind } from "@live-documentation/shared/domain/artifacts";

/**
 * User-configurable settings for the ripple (change-impact) analysis.
 */
export interface RippleExtensionSettings {
  /** Maximum graph traversal depth for ripple propagation. */
  maxDepth?: number;
  /** Maximum number of impacted files returned. */
  maxResults?: number;
  /** Relationship kinds eligible for ripple propagation. */
  allowedKinds?: LinkRelationshipKind[];
  /** Relationship kinds treated as documentation links. */
  documentKinds?: LinkRelationshipKind[];
  /** Relationship kinds treated as code links. */
  codeKinds?: LinkRelationshipKind[];
}

/**
 * Extension-wide settings received from the VS Code client via
 * `workspace/didChangeConfiguration`.
 */
export interface ExtensionSettings {
  /** Path to the extension's persistent storage directory. */
  storagePath?: string;
  /** Whether link-aware diagnostics are enabled. */
  enableDiagnostics?: boolean;
  /** Debounce interval in milliseconds for diagnostic refresh. */
  debounceMs?: number;
  /** Noise suppression thresholds for diagnostic output. */
  noiseSuppression?: {
    level?: "low" | "medium" | "high";
    minConfidence?: number;
    maxDepth?: number;
    maxPerChange?: number;
    maxPerArtifact?: number;
  };
  /** Ripple analysis configuration. */
  ripple?: RippleExtensionSettings;
}

/**
 * Manages extension settings received from the VS Code client and
 * gates features (e.g. diagnostics) that require explicit user consent.
 *
 * The guard ensures diagnostics remain disabled until the client
 * records provider consent, preventing premature diagnostic noise.
 */
export class ProviderGuard {
  private settings: ExtensionSettings = {};

  constructor(private readonly connection: Connection) {}

  /**
   * Merges incoming settings with the current state.
   *
   * Logs an informational message when diagnostics remain disabled,
   * reminding operators that provider consent has not been recorded.
   */
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

  /** Returns the current merged settings snapshot. */
  getSettings(): ExtensionSettings {
    return this.settings;
  }

  /** Whether diagnostics have been enabled via client-side consent. */
  areDiagnosticsEnabled(): boolean {
    return Boolean(this.settings.enableDiagnostics);
  }
}
