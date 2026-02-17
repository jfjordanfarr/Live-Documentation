import * as vscode from "vscode";

/**
 * User-facing configuration for the Link-Aware Diagnostics extension,
 * read from `linkAwareDiagnostics.*` VS Code settings.
 */
export interface LinkDiagnosticsSettings {
  /** Noise-suppression thresholds for diagnostic output. */
  noiseSuppression: {
    level: "low" | "medium" | "high";
    minConfidence?: number;
    maxDepth?: number;
    maxPerChange?: number;
    maxPerArtifact?: number;
  };
  /** Persistent storage directory path. */
  storagePath?: string;
  /** Whether diagnostics are enabled. */
  enableDiagnostics: boolean;
  /** Debounce interval in milliseconds for diagnostic refresh. */
  debounceMs: number;
}

/**
 * Reactive configuration service that reads `linkAwareDiagnostics.*`
 * settings and fires change events when they update.
 *
 * Subscribes to `workspace.onDidChangeConfiguration` on construction
 * and disposes the subscription when {@link dispose} is called.
 */
export class ConfigService implements vscode.Disposable {
  private readonly emitter = new vscode.EventEmitter<LinkDiagnosticsSettings>();
  private readonly subscription: vscode.Disposable;
  private current: LinkDiagnosticsSettings;

  constructor(private readonly section = "linkAwareDiagnostics") {
    this.current = this.readSettings();
  this.subscription = vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
      if (!event.affectsConfiguration(this.section)) {
        return;
      }

      this.current = this.readSettings();
      this.emitter.fire(this.current);
    });
  }

  /** Current snapshot of the extension settings. */
  get settings(): LinkDiagnosticsSettings {
    return this.current;
  }

  /** Registers a listener that fires whenever settings change. */
  onDidChange(listener: (settings: LinkDiagnosticsSettings) => void): vscode.Disposable {
    return this.emitter.event(listener);
  }

  /** Forces a re-read of settings and fires the change event. */
  refresh(): void {
    this.current = this.readSettings();
    this.emitter.fire(this.current);
  }

  /** Disposes the configuration-change subscription and event emitter. */
  dispose(): void {
    this.subscription.dispose();
    this.emitter.dispose();
  }

  private readSettings(): LinkDiagnosticsSettings {
    const config = vscode.workspace.getConfiguration(this.section);
    return {
      noiseSuppression: {
        level: config.get("noiseSuppression.level", "medium"),
        minConfidence: config.get("noiseSuppression.minConfidence"),
        maxDepth: config.get("noiseSuppression.maxDepth"),
        maxPerChange: config.get("noiseSuppression.maxPerChange"),
        maxPerArtifact: config.get("noiseSuppression.maxPerArtifact")
      },
      storagePath: config.get("storagePath", "") || undefined,
      enableDiagnostics: config.get("enableDiagnostics", false),
      debounceMs: config.get("debounce.ms", 1000)
    };
  }
}
