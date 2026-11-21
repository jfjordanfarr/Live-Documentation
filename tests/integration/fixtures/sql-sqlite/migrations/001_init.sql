-- Schema bootstrapped for the knowledge graph projections.
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
