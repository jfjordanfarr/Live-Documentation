void (async () => {
  const { default: Database } = await import("better-sqlite3");
  const path = await import("node:path");

  const dbPath =
    process.argv[2] ??
    path.join(
      __dirname,
      "..",
      "..",
      "tests",
      "integration",
      "fixtures",
      "simple-workspace",
      ".live-documentation",
      "live-documentation.db"
    );

  console.log("Reading graph from", dbPath);
  const db = new Database(dbPath, { readonly: true });

  const stmtArtifacts = db.prepare(
    "SELECT id, uri, layer, language FROM knowledge_artifacts ORDER BY id LIMIT 20"
  );
  console.log("Artifacts sample:");
  for (const row of stmtArtifacts.all()) {
    console.log(row);
  }

  const stmtLinks = db.prepare(
    "SELECT source_id, target_id, kind FROM knowledge_links WHERE source_id IN (SELECT id FROM knowledge_artifacts WHERE uri LIKE '%architecture.md%') OR target_id IN (SELECT id FROM knowledge_artifacts WHERE uri LIKE '%architecture.md%')"
  );
  console.log("Links touching architecture.md:");
  for (const row of stmtLinks.all()) {
    console.log(row);
  }

  db.close();
})().catch(error => {
  console.error("Failed to inspect knowledge graph", error);
  process.exitCode = 1;
});
