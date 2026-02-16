/**
 * LSP protocol contracts for diagnostic acknowledgement, listing,
 * assessment, and export.
 *
 * Request/notification method strings defined here are shared between
 * the VS Code extension client (`packages/extension`) and the language
 * server (`packages/server`). All request interfaces follow the
 * `{Params, Result}` pair convention consumed by `vscode-languageclient`.
 *
 * Created 2025-10-21 (commit `3f11c3d`) as part of the T042/T043
 * diagnostic acknowledgement feature.
 *
 * @module
 */

import type { LlmAssessment } from "../domain/artifacts";

// ─────────────────────────────────────────────────────────────────────────────
// Acknowledge Diagnostic
// ─────────────────────────────────────────────────────────────────────────────

/** LSP method for acknowledging (dismissing) a single diagnostic record. */
export const ACKNOWLEDGE_DIAGNOSTIC_REQUEST = "linkDiagnostics/diagnostics/acknowledge";

/** Parameters for {@link ACKNOWLEDGE_DIAGNOSTIC_REQUEST}. */
export interface AcknowledgeDiagnosticParams {
  diagnosticId: string;
  actor: string;
  notes?: string;
}

/** Possible outcomes when acknowledging a diagnostic. */
export type AcknowledgeDiagnosticStatus = "acknowledged" | "already_acknowledged" | "not_found";

/** Response payload for {@link ACKNOWLEDGE_DIAGNOSTIC_REQUEST}. */
export interface AcknowledgeDiagnosticResult {
  status: AcknowledgeDiagnosticStatus;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  recordId?: string;
  targetUri?: string;
  triggerUri?: string;
}

/** Server → client notification sent after a diagnostic is acknowledged. */
export const DIAGNOSTIC_ACKNOWLEDGED_NOTIFICATION = "linkDiagnostics/diagnostics/acknowledged";

/** Payload for {@link DIAGNOSTIC_ACKNOWLEDGED_NOTIFICATION}. */
export interface DiagnosticAcknowledgedPayload {
  recordId: string;
  targetUri?: string;
  triggerUri?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Reset & List
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Server → client notification requesting a full diagnostic state reset
 * (e.g. after a feed reconnection or sqlite rebuild).
 */
export const RESET_DIAGNOSTIC_STATE_NOTIFICATION = "linkDiagnostics/diagnostics/resetState";

/** LSP method for listing all outstanding (unresolved) diagnostics. */
export const LIST_OUTSTANDING_DIAGNOSTICS_REQUEST = "linkDiagnostics/diagnostics/list";

/** Lightweight artifact summary embedded in each outstanding diagnostic. */
export interface DiagnosticArtifactSummary {
  id: string;
  uri?: string;
  layer?: string;
  language?: string;
}

/** A single outstanding diagnostic record as returned by the list request. */
export interface OutstandingDiagnosticSummary {
  recordId: string;
  message: string;
  severity: "warning" | "info" | "hint";
  changeEventId: string;
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  linkIds: string[];
  target?: DiagnosticArtifactSummary;
  trigger?: DiagnosticArtifactSummary;
  llmAssessment?: LlmAssessment;
}

/** Response payload for {@link LIST_OUTSTANDING_DIAGNOSTICS_REQUEST}. */
export interface ListOutstandingDiagnosticsResult {
  generatedAt: string;
  diagnostics: OutstandingDiagnosticSummary[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Assessment & Export
// ─────────────────────────────────────────────────────────────────────────────

/** LSP method for attaching an LLM assessment to a diagnostic record. */
export const SET_DIAGNOSTIC_ASSESSMENT_REQUEST = "linkDiagnostics/diagnostics/setAssessment";

/** Parameters for {@link SET_DIAGNOSTIC_ASSESSMENT_REQUEST}. */
export interface SetDiagnosticAssessmentParams {
  diagnosticId: string;
  assessment?: LlmAssessment;
}

/** Response payload for {@link SET_DIAGNOSTIC_ASSESSMENT_REQUEST}. */
export interface SetDiagnosticAssessmentResult {
  diagnosticId: string;
  updatedAt: string;
  assessment?: LlmAssessment;
}

/** LSP method for exporting all diagnostics as markdown or JSON. */
export const EXPORT_DIAGNOSTICS_REQUEST = "linkDiagnostics/diagnostics/export";

/** Response payload for {@link EXPORT_DIAGNOSTICS_REQUEST}. */
export interface ExportDiagnosticsResult {
  generatedAt: string;
  format: "markdown" | "json";
  content: string;
  total: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Health / Ready
// ─────────────────────────────────────────────────────────────────────────────

/** LSP method to query whether diagnostic feeds are ready. */
export const FEEDS_READY_REQUEST = "linkDiagnostics/feeds/ready";

/** Response payload for {@link FEEDS_READY_REQUEST}. */
export interface FeedsReadyResult {
  ready: boolean;
  configuredFeeds: number;
  healthyFeeds: number;
}
