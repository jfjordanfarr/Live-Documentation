#!/usr/bin/env node
import { execFile } from "node:child_process";
import * as fs from "node:fs/promises";
import { createServer } from "node:http";
import * as path from "node:path";
import process from "node:process";

import { snapshotWorkspace } from "../graph-tools/snapshot-workspace";

const PORT = 0; // Random free port

async function main() {
  console.log("Analyzing workspace graph...");

  // 1. Generate the graph data
  const { artifacts, links } = await snapshotWorkspace({
    workspaceRoot: process.cwd(),
    quiet: true,
    skipDb: true, // We don't need the SQLite DB for visualization
    outputPath: path.join("data", "graph-snapshots", "visualize-temp.json") // Temp output
  });

  console.log(`Raw Graph: ${artifacts.length} nodes, ${links.length} edges.`);

  // --- FILTERING: Live Documentation Only ---
  // We only want artifacts that are part of the generated Live Documentation.
  // In this workspace, that is the Layer 4 MDMD directory.
  const LIVE_DOCS_ROOT = ".mdmd/layer-4";

  const filteredArtifacts = artifacts.filter(a => a.uri.includes(LIVE_DOCS_ROOT));
  const filteredArtifactIds = new Set(filteredArtifacts.map(a => a.id));

  console.log(`Filtered Nodes: ${filteredArtifacts.length}`);

  // --- ENRICHMENT: Extract Archetype and Line Count ---
  console.log("Enriching nodes with metadata...");
  const enrichedNodes = await Promise.all(filteredArtifacts.map(async (node) => {
    let archetype = "unknown";
    let lineCount = 10; // Default size

    try {
      // 1. Read MDMD file content
      // Safest for local script:
      const filePath = process.platform === "win32" ? node.uri.replace("file:///", "") : node.uri.replace("file://", "");

      const content = await fs.readFile(filePath, "utf-8");

      // 2. Extract Archetype
      const archetypeMatch = content.match(/- Archetype:\s*(.+)/);
      if (archetypeMatch) {
        archetype = archetypeMatch[1].trim();
      }

      // 3. Extract Code Path and Count Lines
      const codePathMatch = content.match(/- Code Path:\s*(.+)/);
      if (codePathMatch) {
        const relativeCodePath = codePathMatch[1].trim();
        const absoluteCodePath = path.resolve(process.cwd(), relativeCodePath);

        try {
          const codeContent = await fs.readFile(absoluteCodePath, "utf-8");
          lineCount = codeContent.split("\n").length;
        } catch {
          // Code file might not exist or be readable
          // console.warn(`Could not read source for ${node.uri}`);
        }
      }
    } catch (e) {
      console.error(`Error processing node ${node.uri}:`, e);
    }

    return {
      id: node.id,
      name: path.basename(node.uri).replace(".mdmd.md", ""), // Clean up name
      path: node.uri,
      group: archetype, // Color by archetype
      val: Math.sqrt(lineCount) // Size by sqrt of lines for better visual scaling
    };
  }));

  // --- INDUCED LINKS: Project Code Dependencies onto Docs ---
  // 1. Map Code Artifacts to the Docs that reference them
  const codeToDocs = new Map<string, Set<string>>(); // CodeID -> Set<DocID>

  for (const link of links) {
    // If source is a Doc (in filtered set) and target is NOT (it's likely code)
    if (filteredArtifactIds.has(link.sourceId) && !filteredArtifactIds.has(link.targetId)) {
      // This is a Doc -> Code link (e.g. "documents" or "depends_on")
      if (!codeToDocs.has(link.targetId)) {
        codeToDocs.set(link.targetId, new Set());
      }
      codeToDocs.get(link.targetId)?.add(link.sourceId);
    }
  }

  // 2. Find connections between Docs based on connections between their Code
  const inducedLinks = [];

  for (const link of links) {
    // Check if this is a Code -> Code link (neither source nor target is in filtered set)
    // Optimization: Only check if both ends are mapped to at least one doc
    const sourceDocs = codeToDocs.get(link.sourceId);
    const targetDocs = codeToDocs.get(link.targetId);

    if (sourceDocs && targetDocs) {
      // We have a link between Code A and Code B, and both are documented.
      // Create synthetic links between all Docs covering A and all Docs covering B.
      for (const sourceDocId of sourceDocs) {
        for (const targetDocId of targetDocs) {
          if (sourceDocId !== targetDocId) {
            inducedLinks.push({
              sourceId: sourceDocId,
              targetId: targetDocId,
              kind: "induced"
            });
          }
        }
      }
    }
  }

  // Also include any direct links between docs (if any exist)
  const directLinks = links.filter(l =>
    filteredArtifactIds.has(l.sourceId) && filteredArtifactIds.has(l.targetId)
  );

  const allLinks = [...directLinks, ...inducedLinks];
  console.log(`Induced Edges: ${inducedLinks.length}, Direct Edges: ${directLinks.length}`);

  // --- WEIGHTING: Aggregate Links ---
  // Count connections between the same two nodes to determine "intensity"
  const linkCounts = new Map<string, number>();

  for (const link of allLinks) {
    const key = `${link.sourceId}|${link.targetId}`;
    linkCounts.set(key, (linkCounts.get(key) || 0) + 1);
  }

  // Create unique edges with weights
  const uniqueLinks = [];
  for (const [key, count] of linkCounts.entries()) {
    const [source, target] = key.split("|");
    uniqueLinks.push({
      source,
      target,
      weight: count // Intensity based on number of raw/induced links
    });
  }

  // 2. Transform to 3d-force-graph format
  const graphData = {
    nodes: enrichedNodes,
    links: uniqueLinks
  };

  // 3. Generate HTML
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Live Documentation - Visual Graph</title>
  <style> body { margin: 0; } </style>
  <script src="//unpkg.com/3d-force-graph"></script>
</head>
<body>
  <div id="3d-graph"></div>

  <script>
    const gData = ${JSON.stringify(graphData)};

    const Graph = ForceGraph3D()
      (document.getElementById('3d-graph'))
        .graphData(gData)
        .nodeAutoColorBy('group')
        .nodeLabel(node => \`${"${node.name}"} (${"${node.group}"})\`)
        // WEIGHTING VISUALIZATION
        .linkWidth(link => Math.sqrt(link.weight)) // Thicker lines for heavier links
        .linkDirectionalParticles(link => link.weight) // More particles for heavier links
        .linkDirectionalParticleSpeed(0.005)
        .onNodeClick(node => {
          // Aim at node from outside it
          const distance = 40;
          const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

          Graph.cameraPosition(
            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
            node, // lookAt ({ x, y, z })
            3000  // ms transition duration
          );
        });
  </script>
</body>
</html>
  `;

  // 4. Start Server
  const server = createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  });

  server.listen(PORT, () => {
    const address = server.address();
    if (typeof address === "object" && address) {
      const url = `http://localhost:${address.port}`;
      console.log(`Visualization server running at ${url}`);

      // 5. Open Browser
      if (process.platform === "win32") {
        execFile('cmd', ['/c', 'start', url]);
      } else {
        execFile('open', [url]);
      }
    }
  });
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
