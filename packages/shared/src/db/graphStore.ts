import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

import {
  mapArtifactRow,
  mapLinkRow,
  mapLlmEdgeProvenanceRow,
  mapDiagnosticRow,
  mapDriftHistoryRow
} from "./graphStore.mappers";
import {
  ArtifactRow,
  DiagnosticRow,
  DriftHistoryAckRow,
  DriftHistoryCountRow,
  DriftHistoryRow,
  DriftHistorySummary,
  FindDiagnosticByChangeEventOptions,
  LinkedArtifactRow,
  LinkRow,
  ListDriftHistoryOptions,
  LlmEdgeProvenanceRow,
  UpdateDiagnosticStatusOptions
} from "./graphStore.types";
import {
  AcknowledgementAction,
  ChangeEvent,
  DiagnosticRecord,
  DiagnosticStatus,
  DriftHistoryEntry,
  DriftHistoryStatus,
  LlmAssessment,
  LlmEdgeProvenance,
  KnowledgeArtifact,
  KnowledgeSnapshot,
  LinkRelationship,
  LinkRelationshipKind
} from "../domain/artifacts";

// Re-export types for consumers
export type {
  DriftHistorySummary,
  ListDriftHistoryOptions
} from "./graphStore.types";

export interface GraphStoreOptions {
  /** Absolute path to the SQLite database file. */
  dbPath: string;
}

export interface LinkedArtifactSummary {
  artifact: KnowledgeArtifact;
  linkId: string;
  kind: LinkRelationshipKind;
  confidence: number;
  direction: "incoming" | "outgoing";
}

const JSON_SPACES = 0;

const BETTER_SQLITE_MODULE_VERSION = process.versions.modules ?? "";
const BETTER_SQLITE_MODULE_VERSION_NUMBER = Number(BETTER_SQLITE_MODULE_VERSION || "0");
const BETTER_SQLITE_NATIVE_BINDING = resolveBetterSqliteNativeBinding(BETTER_SQLITE_MODULE_VERSION);
const NEEDS_EXPLICIT_NATIVE_BINDING = BETTER_SQLITE_MODULE_VERSION_NUMBER >= 136;

function resolveBetterSqliteNativeBinding(moduleVersion: string | undefined): string | undefined {
  if (!moduleVersion) {
    return undefined;
  }

  try {
    const packagePath = require.resolve("better-sqlite3/package.json");
    const moduleRoot = path.dirname(packagePath);
    const candidate = path.join(
      moduleRoot,
      "build",
      "Release",
      `abi-${moduleVersion}`,
      "better_sqlite3.node"
    );

    return fs.existsSync(candidate) ? candidate : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Thin wrapper around better-sqlite3 that materialises our knowledge-graph projections. The
 * implementation deliberately keeps schema bootstrapping local so the store can be rebuilt after
 * cache deletion without bespoke tooling.
 */
export class GraphStore {
  private readonly db: Database.Database;

  constructor(private readonly options: GraphStoreOptions) {
    if (NEEDS_EXPLICIT_NATIVE_BINDING && !BETTER_SQLITE_NATIVE_BINDING) {
      throw new Error(
        `better-sqlite3 native binding for ABI ${BETTER_SQLITE_MODULE_VERSION} was not found. ` +
          `Run "npm run rebuild:better-sqlite3:force" to regenerate Electron-compatible binaries.`
      );
    }

    const databaseOptions: Database.Options | undefined = BETTER_SQLITE_NATIVE_BINDING
      ? { nativeBinding: BETTER_SQLITE_NATIVE_BINDING }
      : undefined;

    this.db = new Database(options.dbPath, databaseOptions);
    this.configure();
    this.ensureSchema();
  }

  close(): void {
    this.db.close();
  }

  upsertArtifact(artifact: KnowledgeArtifact): KnowledgeArtifact {
    const existingByUri = this.db
      .prepare("SELECT id FROM artifacts WHERE uri = ?")
      .get(artifact.uri) as { id: string } | undefined;

    const idToUse = existingByUri?.id ?? artifact.id;

    const statement = this.db.prepare(`
      INSERT INTO artifacts (id, uri, layer, language, owner, last_synchronized_at, hash, metadata)
      VALUES (@id, @uri, @layer, @language, @owner, @lastSynchronizedAt, @hash, @metadata)
      ON CONFLICT(id) DO UPDATE SET
        uri = excluded.uri,
        layer = excluded.layer,
        language = excluded.language,
        owner = excluded.owner,
        last_synchronized_at = excluded.last_synchronized_at,
        hash = excluded.hash,
        metadata = excluded.metadata;
    `);

    statement.run({
      id: idToUse,
      uri: artifact.uri,
      layer: artifact.layer,
      language: artifact.language ?? null,
      owner: artifact.owner ?? null,
      lastSynchronizedAt: artifact.lastSynchronizedAt ?? null,
      hash: artifact.hash ?? null,
      metadata: artifact.metadata ? JSON.stringify(artifact.metadata, null, JSON_SPACES) : null
    });

    const stored = this.getArtifactById(idToUse);
    if (!stored) {
      throw new Error(`Failed to persist artifact with id ${idToUse}`);
    }

    return stored;
  }

  removeArtifact(id: string): void {
    this.db.prepare("DELETE FROM artifacts WHERE id = ?").run(id);
  }

  removeArtifactByUri(uri: string): void {
    this.db.prepare("DELETE FROM artifacts WHERE uri = ?").run(uri);
  }

  getArtifactById(id: string): KnowledgeArtifact | undefined {
    const row = this.db
      .prepare(
        `SELECT id, uri, layer, language, owner, last_synchronized_at, hash, metadata FROM artifacts WHERE id = ?`
      )
      .get(id);

    if (!row) {
      return undefined;
    }

    return mapArtifactRow(row as ArtifactRow);
  }

  getArtifactByUri(uri: string): KnowledgeArtifact | undefined {
    const row = this.db
      .prepare(
        `SELECT id, uri, layer, language, owner, last_synchronized_at, hash, metadata FROM artifacts WHERE uri = ?`
      )
      .get(uri);

    if (!row) {
      return undefined;
    }

    return mapArtifactRow(row as ArtifactRow);
  }

  listArtifacts(): KnowledgeArtifact[] {
    const rows = this.db
      .prepare(
        `SELECT id, uri, layer, language, owner, last_synchronized_at, hash, metadata FROM artifacts`
      )
      .all() as ArtifactRow[];

    return rows.map(row => mapArtifactRow(row));
  }

  listLinkedArtifacts(
    artifactId: string,
    filter?: { kinds?: LinkRelationshipKind[] }
  ): LinkedArtifactSummary[] {
    const kinds = filter?.kinds ?? [];
    const conditions = ["(l.source_id = @artifactId OR l.target_id = @artifactId)"];
    const parameters: Record<string, unknown> = { artifactId };

    if (kinds.length > 0) {
      const placeholders: string[] = [];
      kinds.forEach((kind, index) => {
        const token = `kind_${index}`;
        placeholders.push(`@${token}`);
        parameters[token] = kind;
      });
      conditions.push(`l.kind IN (${placeholders.join(", ")})`);
    }

    const whereClause = conditions.join(" AND ");

    const rows = this.db
      .prepare(
        `
        SELECT
          l.id AS link_id,
          l.kind AS link_kind,
          l.confidence AS link_confidence,
          l.source_id AS source_id,
          l.target_id AS target_id,
          a.id AS artifact_id,
          a.uri AS artifact_uri,
          a.layer AS artifact_layer,
          a.language AS artifact_language,
          a.owner AS artifact_owner,
          a.last_synchronized_at AS artifact_last_synchronized_at,
          a.hash AS artifact_hash,
          a.metadata AS artifact_metadata
        FROM links l
        JOIN artifacts a ON a.id = CASE WHEN l.source_id = @artifactId THEN l.target_id ELSE l.source_id END
        WHERE ${whereClause}
      `
      )
      .all(parameters) as LinkedArtifactRow[];

    return rows.map(row => {
      const direction = row.source_id === artifactId ? "outgoing" : "incoming";

      const artifactRow: ArtifactRow = {
        id: row.artifact_id,
        uri: row.artifact_uri,
        layer: row.artifact_layer,
        language: row.artifact_language,
        owner: row.artifact_owner,
        last_synchronized_at: row.artifact_last_synchronized_at,
        hash: row.artifact_hash,
        metadata: row.artifact_metadata
      };

      return {
        linkId: row.link_id,
        kind: row.link_kind,
        confidence: row.link_confidence,
        direction,
        artifact: mapArtifactRow(artifactRow)
      };
    });
  }

  upsertLink(link: LinkRelationship): void {
    const existing = this.db
      .prepare(
        `SELECT id FROM links WHERE source_id = ? AND target_id = ? AND kind = ?`
      )
      .get(link.sourceId, link.targetId, link.kind) as { id: string } | undefined;

    const idToUse = existing?.id ?? link.id;

    const statement = this.db.prepare(`
      INSERT INTO links (id, source_id, target_id, kind, confidence, created_at, created_by)
      VALUES (@id, @sourceId, @targetId, @kind, @confidence, @createdAt, @createdBy)
      ON CONFLICT(id) DO UPDATE SET
        source_id = excluded.source_id,
        target_id = excluded.target_id,
        kind = excluded.kind,
        confidence = excluded.confidence,
        created_at = excluded.created_at,
        created_by = excluded.created_by;
    `);

    statement.run({
      id: idToUse,
      sourceId: link.sourceId,
      targetId: link.targetId,
      kind: link.kind,
      confidence: Math.max(0, Math.min(1, link.confidence)),
      createdAt: link.createdAt,
      createdBy: link.createdBy
    });
  }

  removeLink(id: string): void {
    this.db.prepare("DELETE FROM links WHERE id = ?").run(id);
  }

  getLink(sourceId: string, targetId: string, kind: LinkRelationshipKind): LinkRelationship | undefined {
    const row = this.db
      .prepare(
        `SELECT id, source_id, target_id, kind, confidence, created_at, created_by FROM links WHERE source_id = ? AND target_id = ? AND kind = ?`
      )
      .get(sourceId, targetId, kind) as LinkRow | undefined;

    if (!row) {
      return undefined;
    }

    return mapLinkRow(row);
  }

  storeLlmEdgeProvenance(provenance: LlmEdgeProvenance): void {
    const statement = this.db.prepare(
      `
      INSERT INTO llm_edge_provenance (
        link_id,
        template_id,
        template_version,
        prompt_hash,
        model_id,
        issued_at,
        created_at,
        confidence_tier,
        calibrated_confidence,
        raw_confidence,
        diagnostics_eligible,
        shadowed,
        supporting_chunks,
        promotion_criteria,
        rationale
      ) VALUES (
        @linkId,
        @templateId,
        @templateVersion,
        @promptHash,
        @modelId,
        @issuedAt,
        @createdAt,
        @confidenceTier,
        @calibratedConfidence,
        @rawConfidence,
        @diagnosticsEligible,
        @shadowed,
        @supportingChunks,
        @promotionCriteria,
        @rationale
      )
      ON CONFLICT(link_id) DO UPDATE SET
        template_id = excluded.template_id,
        template_version = excluded.template_version,
        prompt_hash = excluded.prompt_hash,
        model_id = excluded.model_id,
        issued_at = excluded.issued_at,
        created_at = excluded.created_at,
        confidence_tier = excluded.confidence_tier,
        calibrated_confidence = excluded.calibrated_confidence,
        raw_confidence = excluded.raw_confidence,
        diagnostics_eligible = excluded.diagnostics_eligible,
        shadowed = excluded.shadowed,
        supporting_chunks = excluded.supporting_chunks,
        promotion_criteria = excluded.promotion_criteria,
        rationale = excluded.rationale;
      `
    );

    statement.run({
      linkId: provenance.linkId,
      templateId: provenance.templateId,
      templateVersion: provenance.templateVersion,
      promptHash: provenance.promptHash,
      modelId: provenance.modelId,
      issuedAt: provenance.issuedAt,
      createdAt: provenance.createdAt,
      confidenceTier: provenance.confidenceTier,
      calibratedConfidence: provenance.calibratedConfidence,
      rawConfidence: typeof provenance.rawConfidence === "number" ? provenance.rawConfidence : null,
      diagnosticsEligible: provenance.diagnosticsEligible ? 1 : 0,
      shadowed: provenance.shadowed ? 1 : 0,
      supportingChunks: provenance.supportingChunks
        ? JSON.stringify(provenance.supportingChunks, null, JSON_SPACES)
        : null,
      promotionCriteria: provenance.promotionCriteria
        ? JSON.stringify(provenance.promotionCriteria, null, JSON_SPACES)
        : null,
      rationale: provenance.rationale ?? null
    });
  }

  getLlmEdgeProvenance(linkId: string): LlmEdgeProvenance | undefined {
    const row = this.db
      .prepare(
        `
        SELECT
          link_id,
          template_id,
          template_version,
          prompt_hash,
          model_id,
          issued_at,
          created_at,
          confidence_tier,
          calibrated_confidence,
          raw_confidence,
          diagnostics_eligible,
          shadowed,
          supporting_chunks,
          promotion_criteria,
          rationale
        FROM llm_edge_provenance
        WHERE link_id = @linkId
      `
      )
      .get({ linkId }) as LlmEdgeProvenanceRow | undefined;

    if (!row) {
      return undefined;
    }

    return mapLlmEdgeProvenanceRow(row);
  }

  recordChangeEvent(change: ChangeEvent): void {
    const statement = this.db.prepare(`
      INSERT INTO change_events (id, artifact_id, detected_at, summary, change_type, ranges, provenance)
      VALUES (@id, @artifactId, @detectedAt, @summary, @changeType, @ranges, @provenance)
      ON CONFLICT(id) DO UPDATE SET
        artifact_id = excluded.artifact_id,
        detected_at = excluded.detected_at,
        summary = excluded.summary,
        change_type = excluded.change_type,
        ranges = excluded.ranges,
        provenance = excluded.provenance;
    `);

    statement.run({
      ...change,
      ranges: JSON.stringify(change.ranges, null, JSON_SPACES)
    });
  }

  storeDiagnostic(diagnostic: DiagnosticRecord): void {
    const statement = this.db.prepare(`
      INSERT INTO diagnostics (
        id,
        artifact_id,
        trigger_artifact_id,
        change_event_id,
        message,
        severity,
        status,
        created_at,
        acknowledged_at,
        acknowledged_by,
        link_ids,
        llm_assessment
      ) VALUES (
        @id,
        @artifactId,
        @triggerArtifactId,
        @changeEventId,
        @message,
        @severity,
        @status,
        @createdAt,
        @acknowledgedAt,
        @acknowledgedBy,
        @linkIds,
        @llmAssessment
      )
      ON CONFLICT(id) DO UPDATE SET
        artifact_id = excluded.artifact_id,
        trigger_artifact_id = excluded.trigger_artifact_id,
        change_event_id = excluded.change_event_id,
        message = excluded.message,
        severity = excluded.severity,
        status = excluded.status,
        created_at = excluded.created_at,
        acknowledged_at = excluded.acknowledged_at,
        acknowledged_by = excluded.acknowledged_by,
        link_ids = excluded.link_ids,
        llm_assessment = excluded.llm_assessment;
    `);

    statement.run({
      ...diagnostic,
      acknowledgedAt: diagnostic.acknowledgedAt ?? null,
      acknowledgedBy: diagnostic.acknowledgedBy ?? null,
      linkIds: JSON.stringify(diagnostic.linkIds, null, JSON_SPACES),
      llmAssessment: diagnostic.llmAssessment
        ? JSON.stringify(diagnostic.llmAssessment, null, JSON_SPACES)
        : null
    });
  }

  updateDiagnosticAssessment(options: { id: string; assessment?: LlmAssessment }): void {
    this.db
      .prepare(
        `
        UPDATE diagnostics
        SET llm_assessment = @llmAssessment
        WHERE id = @id
      `
      )
      .run({
        id: options.id,
        llmAssessment: options.assessment
          ? JSON.stringify(options.assessment, null, JSON_SPACES)
          : null
      });
  }

  logAcknowledgement(action: AcknowledgementAction): void {
    this.db.prepare(`
      INSERT INTO acknowledgements (id, diagnostic_id, actor, action, notes, timestamp)
      VALUES (@id, @diagnosticId, @actor, @action, @notes, @timestamp)
    `).run({
      ...action,
      notes: action.notes ?? null
    });
  }

  recordDriftHistory(entry: DriftHistoryEntry): void {
    this.db.prepare(`
      INSERT INTO drift_history (
        id,
        diagnostic_id,
        change_event_id,
        trigger_artifact_id,
        target_artifact_id,
        status,
        severity,
        recorded_at,
        actor,
        notes,
        metadata
      ) VALUES (
        @id,
        @diagnosticId,
        @changeEventId,
        @triggerArtifactId,
        @targetArtifactId,
        @status,
        @severity,
        @recordedAt,
        @actor,
        @notes,
        @metadata
      )
    `).run({
      ...entry,
      actor: entry.actor ?? null,
      notes: entry.notes ?? null,
      metadata: entry.metadata ? JSON.stringify(entry.metadata, null, JSON_SPACES) : null
    });
  }

  listDriftHistory(options: ListDriftHistoryOptions = {}): DriftHistoryEntry[] {
    const where: string[] = [];
    const parameters: Record<string, unknown> = {};

    if (options.changeEventId) {
      where.push("change_event_id = @changeEventId");
      parameters.changeEventId = options.changeEventId;
    }

    if (options.targetArtifactId) {
      where.push("target_artifact_id = @targetArtifactId");
      parameters.targetArtifactId = options.targetArtifactId;
    }

    if (options.diagnosticId) {
      where.push("diagnostic_id = @diagnosticId");
      parameters.diagnosticId = options.diagnosticId;
    }

    if (options.status) {
      where.push("status = @status");
      parameters.status = options.status;
    }

    const clause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
    const limitClause = typeof options.limit === "number" ? "LIMIT @limit" : "";
    if (limitClause) {
      parameters.limit = options.limit;
    }

    const rows = this.db
      .prepare(
        `
        SELECT
          id,
          diagnostic_id,
          change_event_id,
          trigger_artifact_id,
          target_artifact_id,
          status,
          severity,
          recorded_at,
          actor,
          notes,
          metadata
        FROM drift_history
        ${clause}
        ORDER BY datetime(recorded_at) DESC
        ${limitClause}
      `
      )
      .all(parameters) as DriftHistoryRow[];

    return rows.map(row => mapDriftHistoryRow(row));
  }

  summarizeDriftHistory(changeEventId: string): DriftHistorySummary {
    const totals = this.db
      .prepare(
        `
        SELECT status, COUNT(*) as count
        FROM drift_history
        WHERE change_event_id = @changeEventId
        GROUP BY status
      `
      )
      .all({ changeEventId }) as DriftHistoryCountRow[];

    const statusCounts: Record<DriftHistoryStatus, number> = {
      emitted: 0,
      acknowledged: 0
    };

    for (const row of totals) {
      const status = row.status as DriftHistoryStatus;
      if (statusCounts[status] !== undefined) {
        statusCounts[status] = row.count;
      }
    }

    const lastAck = this.db
      .prepare(
        `
        SELECT recorded_at, actor
        FROM drift_history
        WHERE change_event_id = @changeEventId AND status = 'acknowledged'
        ORDER BY datetime(recorded_at) DESC
        LIMIT 1
      `
      )
      .get({ changeEventId }) as DriftHistoryAckRow | undefined;

    return {
      changeEventId,
      totals: statusCounts,
      lastAcknowledgedAt: lastAck?.recorded_at ?? null,
      lastAcknowledgedBy: lastAck?.actor ?? null
    };
  }

  listDiagnosticsByStatus(status: DiagnosticStatus): DiagnosticRecord[] {
    const rows = this.db
      .prepare(`
        SELECT
          id,
          artifact_id,
          trigger_artifact_id,
          change_event_id,
          message,
          severity,
          status,
          created_at,
          acknowledged_at,
          acknowledged_by,
          link_ids,
          llm_assessment
        FROM diagnostics
        WHERE status = @status
        ORDER BY datetime(created_at) DESC
      `)
      .all({ status }) as DiagnosticRow[];

    return rows.map(row => mapDiagnosticRow(row));
  }

  getDiagnosticById(id: string): DiagnosticRecord | undefined {
    const row = this.db
      .prepare(`
        SELECT
          id,
          artifact_id,
          trigger_artifact_id,
          change_event_id,
          message,
          severity,
          status,
          created_at,
          acknowledged_at,
          acknowledged_by,
          link_ids,
          llm_assessment
        FROM diagnostics
        WHERE id = ?
      `)
      .get(id) as DiagnosticRow | undefined;

    if (!row) {
      return undefined;
    }

    return mapDiagnosticRow(row);
  }

  updateDiagnosticStatus(options: UpdateDiagnosticStatusOptions): void {
    this.db
      .prepare(`
        UPDATE diagnostics
        SET
          status = @status,
          acknowledged_at = @acknowledgedAt,
          acknowledged_by = @acknowledgedBy
        WHERE id = @id
      `)
      .run({
        id: options.id,
        status: options.status,
        acknowledgedAt: options.acknowledgedAt ?? null,
        acknowledgedBy: options.acknowledgedBy ?? null
      });
  }

  findDiagnosticByChangeEvent(options: FindDiagnosticByChangeEventOptions): DiagnosticRecord | undefined {
    const row = this.db
      .prepare(`
        SELECT
          id,
          artifact_id,
          trigger_artifact_id,
          change_event_id,
          message,
          severity,
          status,
          created_at,
          acknowledged_at,
          acknowledged_by,
          link_ids,
          llm_assessment
        FROM diagnostics
        WHERE change_event_id = @changeEventId
          AND artifact_id = @artifactId
          AND trigger_artifact_id = @triggerArtifactId
      `)
      .get(options) as DiagnosticRow | undefined;

    if (!row) {
      return undefined;
    }

    return mapDiagnosticRow(row);
  }

  storeSnapshot(snapshot: KnowledgeSnapshot): void {
    this.db.prepare(`
      INSERT INTO snapshots (id, label, created_at, artifact_count, edge_count, payload_hash, metadata)
      VALUES (@id, @label, @createdAt, @artifactCount, @edgeCount, @payloadHash, @metadata)
      ON CONFLICT(id) DO UPDATE SET
        label = excluded.label,
        created_at = excluded.created_at,
        artifact_count = excluded.artifact_count,
        edge_count = excluded.edge_count,
        payload_hash = excluded.payload_hash,
        metadata = excluded.metadata;
    `).run({
      ...snapshot,
      metadata: snapshot.metadata ? JSON.stringify(snapshot.metadata, null, JSON_SPACES) : null
    });
  }

  private configure(): void {
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
  }

  private ensureSchema(): void {
    // Keeping the schema bootstrap here avoids complicated external migration orchestration while we
    // stand up the initial prototype. Later migrations can layer on top of this foundation.
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS artifacts (
        id TEXT PRIMARY KEY,
        uri TEXT NOT NULL UNIQUE,
        layer TEXT NOT NULL,
        language TEXT,
        owner TEXT,
        last_synchronized_at TEXT,
        hash TEXT,
        metadata TEXT
      );

      CREATE TABLE IF NOT EXISTS links (
        id TEXT PRIMARY KEY,
        source_id TEXT NOT NULL,
        target_id TEXT NOT NULL,
        kind TEXT NOT NULL,
        confidence REAL NOT NULL,
        created_at TEXT NOT NULL,
        created_by TEXT NOT NULL,
        FOREIGN KEY (source_id) REFERENCES artifacts (id) ON DELETE CASCADE,
        FOREIGN KEY (target_id) REFERENCES artifacts (id) ON DELETE CASCADE
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_links_unique ON links (source_id, target_id, kind);

      CREATE TABLE IF NOT EXISTS llm_edge_provenance (
        link_id TEXT PRIMARY KEY,
        template_id TEXT NOT NULL,
        template_version TEXT NOT NULL,
        prompt_hash TEXT NOT NULL,
        model_id TEXT NOT NULL,
        issued_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        confidence_tier TEXT NOT NULL,
        calibrated_confidence REAL NOT NULL,
        raw_confidence REAL,
        diagnostics_eligible INTEGER NOT NULL,
        shadowed INTEGER NOT NULL,
        supporting_chunks TEXT,
        promotion_criteria TEXT,
        rationale TEXT,
        FOREIGN KEY (link_id) REFERENCES links (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS change_events (
        id TEXT PRIMARY KEY,
        artifact_id TEXT NOT NULL,
        detected_at TEXT NOT NULL,
        summary TEXT NOT NULL,
        change_type TEXT NOT NULL,
        ranges TEXT NOT NULL,
        provenance TEXT NOT NULL,
        FOREIGN KEY (artifact_id) REFERENCES artifacts (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS diagnostics (
        id TEXT PRIMARY KEY,
        artifact_id TEXT NOT NULL,
        trigger_artifact_id TEXT NOT NULL,
        change_event_id TEXT NOT NULL,
        message TEXT NOT NULL,
        severity TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        acknowledged_at TEXT,
        acknowledged_by TEXT,
        link_ids TEXT NOT NULL,
        llm_assessment TEXT,
        FOREIGN KEY (artifact_id) REFERENCES artifacts (id) ON DELETE CASCADE,
        FOREIGN KEY (trigger_artifact_id) REFERENCES artifacts (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS acknowledgements (
        id TEXT PRIMARY KEY,
        diagnostic_id TEXT NOT NULL,
        actor TEXT NOT NULL,
        action TEXT NOT NULL,
        notes TEXT,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (diagnostic_id) REFERENCES diagnostics (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS snapshots (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        created_at TEXT NOT NULL,
        artifact_count INTEGER NOT NULL,
        edge_count INTEGER NOT NULL,
        payload_hash TEXT NOT NULL,
        metadata TEXT
      );

      CREATE TABLE IF NOT EXISTS drift_history (
        id TEXT PRIMARY KEY,
        diagnostic_id TEXT NOT NULL,
        change_event_id TEXT NOT NULL,
        trigger_artifact_id TEXT NOT NULL,
        target_artifact_id TEXT NOT NULL,
        status TEXT NOT NULL,
        severity TEXT NOT NULL,
        recorded_at TEXT NOT NULL,
        actor TEXT,
        notes TEXT,
        metadata TEXT,
        FOREIGN KEY (diagnostic_id) REFERENCES diagnostics (id) ON DELETE CASCADE,
        FOREIGN KEY (change_event_id) REFERENCES change_events (id) ON DELETE CASCADE,
        FOREIGN KEY (trigger_artifact_id) REFERENCES artifacts (id) ON DELETE CASCADE,
        FOREIGN KEY (target_artifact_id) REFERENCES artifacts (id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_drift_history_change_target ON drift_history (change_event_id, target_artifact_id);
      CREATE INDEX IF NOT EXISTS idx_drift_history_diagnostic ON drift_history (diagnostic_id, recorded_at DESC);
    `);

    try {
      this.db.prepare(`ALTER TABLE diagnostics ADD COLUMN change_event_id TEXT`).run();
    } catch (error) {
      // Ignore if column already exists.
      const message = error instanceof Error ? error.message : String(error);
      if (!/duplicate column name/i.test(message)) {
        throw error;
      }
    }
  }

}
