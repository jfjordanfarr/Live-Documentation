import { execFile } from "child_process";
import { createServer } from "http";
import * as path from "path";

import { snapshotWorkspace } from "../graph-tools/snapshot-workspace";

const PORT = 3003; // Port for Sonar

async function main() {
  const targetArg = process.argv[2]; // Allow passing target file
  console.log("Analyzing workspace graph for Sonar...");

  // 1. Generate the graph data
  const { artifacts, links } = await snapshotWorkspace({
    workspaceRoot: process.cwd(),
    quiet: true,
    skipDb: true,
    outputPath: path.join("data", "graph-snapshots", "visualize-sonar-temp.json")
  });

  const LIVE_DOCS_ROOT = ".mdmd/layer-4";
  const filteredArtifacts = artifacts.filter(a => a.uri.includes(LIVE_DOCS_ROOT));
  const artifactMap = new Map(filteredArtifacts.map(a => [a.id, a]));
  const filteredArtifactIds = new Set(filteredArtifacts.map(a => a.id));

  // --- INDUCED LINKS ---
  const codeToDocs = new Map();
  links.forEach(link => {
    if (filteredArtifactIds.has(link.sourceId) && !filteredArtifactIds.has(link.targetId)) {
      if (!codeToDocs.has(link.targetId)) codeToDocs.set(link.targetId, new Set());
      codeToDocs.get(link.targetId).add(link.sourceId);
    }
  });

  const inducedLinks = [];
  links.forEach(link => {
    const sourceDocs = codeToDocs.get(link.sourceId);
    const targetDocs = codeToDocs.get(link.targetId);
    if (sourceDocs && targetDocs) {
      sourceDocs.forEach(s => {
        targetDocs.forEach(t => {
          if (s !== t) inducedLinks.push({ sourceId: s, targetId: t, kind: "induced" });
        });
      });
    }
  });

  const directLinks = links.filter(l => filteredArtifactIds.has(l.sourceId) && filteredArtifactIds.has(l.targetId));
  const allLinks = [...directLinks, ...inducedLinks];

  console.log(`Total Edges (Direct + Induced): ${allLinks.length}`);

  // 2. Identify Target Node
  let targetNode = null;
  if (targetArg) {
    targetNode = filteredArtifacts.find(a => a.uri.includes(targetArg));
  }

  if (!targetNode) {
    // Default to a node with many connections if none specified
    // Count connections
    const connectionCounts = new Map();
    allLinks.forEach(l => {
      connectionCounts.set(l.sourceId, (connectionCounts.get(l.sourceId) || 0) + 1);
      connectionCounts.set(l.targetId, (connectionCounts.get(l.targetId) || 0) + 1);
    });

    // Sort by count
    const sorted = [...connectionCounts.entries()].sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      targetNode = artifactMap.get(sorted[0][0]);
    } else if (filteredArtifacts.length > 0) {
      // Fallback to first artifact
      console.log("No connections found, falling back to first artifact.");
      targetNode = filteredArtifacts[0];
    }
  }

  if (!targetNode) {
    console.error("No suitable target node found. (No artifacts filtered?)");
    return;
  }

  console.log(`Sonar Target: ${path.basename(targetNode.uri)}`);

  // 3. BFS for "Rings" (Impact Radius)
  const visited = new Set([targetNode.id]);
  const queue = [{ id: targetNode.id, dist: 0 }];
  const MAX_DIST = 3;

  const nodesToRender = new Map();
  nodesToRender.set(targetNode.id, { ...targetNode, dist: 0 });

  const edgesToRender = [];

  while (queue.length > 0) {
    const { id, dist } = queue.shift();

    if (dist >= MAX_DIST) continue;

    // Find neighbors
    const neighbors = allLinks.filter(l => l.sourceId === id || l.targetId === id);

    neighbors.forEach(link => {
      const otherId = link.sourceId === id ? link.targetId : link.sourceId;

      if (artifactMap.has(otherId)) {
        // Add edge
        edgesToRender.push({
          source: link.sourceId,
          target: link.targetId,
          kind: link.kind || "coupling"
        });

        if (!visited.has(otherId)) {
          visited.add(otherId);
          const otherNode = artifactMap.get(otherId);
          nodesToRender.set(otherId, { ...otherNode, dist: dist + 1 });
          queue.push({ id: otherId, dist: dist + 1 });
        }
      }
    });
  }

  // Prepare Data for Client
  const clientNodes = Array.from(nodesToRender.values()).map(n => ({
    id: n.id,
    name: path.basename(n.uri).replace(".mdmd.md", ""),
    path: n.uri,
    dist: n.dist,
    // Random angle for initial layout (will be fixed by force sim or radial layout)
    angle: Math.random() * Math.PI * 2
  }));

  const clientEdges = edgesToRender.map(e => ({
    source: e.source,
    target: e.target,
    kind: e.kind
  }));

  // --- HTML GENERATION ---
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Live Docs - Sonar</title>
  <style>
    body { background-color: #001a00; color: #00ff00; font-family: 'Courier New', monospace; overflow: hidden; margin: 0; }
    #canvas { width: 100vw; height: 100vh; display: block; }
    
    .radar-circle { fill: none; stroke: #003300; stroke-width: 1; }
    .radar-axis { stroke: #003300; stroke-width: 1; }
    
    .node-circle { fill: #001a00; stroke: #00ff00; stroke-width: 2; transition: all 0.3s; }
    .node-circle:hover { fill: #00ff00; stroke: #fff; cursor: pointer; }
    .node-circle.target { fill: #00ff00; stroke: #fff; stroke-width: 4; }
    
    .node-label { fill: #00cc00; font-size: 10px; pointer-events: none; text-anchor: middle; opacity: 0.8; }
    
    .link { stroke: #004400; stroke-width: 1; opacity: 0.5; }
    .link.active { stroke: #00ff00; opacity: 1; }
    
    .scan-line {
      transform-origin: center;
      animation: scan 4s linear infinite;
      fill: url(#scan-gradient);
    }
    
    @keyframes scan {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    #info {
      position: absolute;
      top: 20px;
      left: 20px;
      background: rgba(0, 20, 0, 0.8);
      border: 1px solid #00ff00;
      padding: 15px;
      max-width: 300px;
      pointer-events: none;
    }
    h1 { margin: 0 0 10px 0; font-size: 18px; text-transform: uppercase; letter-spacing: 2px; }
    .stat { font-size: 12px; color: #00cc00; margin-bottom: 5px; }
  </style>
</head>
<body>
  <div id="info">
    <h1>Sonar Scan</h1>
    <div class="stat">TARGET: <span id="target-name"></span></div>
    <div class="stat">NODES: <span id="node-count"></span></div>
    <div class="stat">RADIUS: ${MAX_DIST} HOPS</div>
  </div>

  <svg id="canvas" viewBox="-500 -500 1000 1000">
    <defs>
      <radialGradient id="scan-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stop-color="rgba(0, 255, 0, 0)" />
        <stop offset="80%" stop-color="rgba(0, 255, 0, 0.1)" />
        <stop offset="100%" stop-color="rgba(0, 255, 0, 0.5)" />
      </radialGradient>
    </defs>
    
    <g id="radar-grid">
      <circle r="100" class="radar-circle" />
      <circle r="200" class="radar-circle" />
      <circle r="300" class="radar-circle" />
      <line x1="-400" y1="0" x2="400" y2="0" class="radar-axis" />
      <line x1="0" y1="-400" x2="0" y2="400" class="radar-axis" />
    </g>
    
    <g id="links"></g>
    <g id="nodes"></g>
    
    <path id="scanner" d="M 0 0 L 400 -50 A 400 400 0 0 1 400 50 Z" class="scan-line" opacity="0.3" />
  </svg>

  <script>
    const data = {
      nodes: ${JSON.stringify(clientNodes)},
      edges: ${JSON.stringify(clientEdges)}
    };

    document.getElementById('target-name').textContent = data.nodes.find(n => n.dist === 0)?.name || 'Unknown';
    document.getElementById('node-count').textContent = data.nodes.length;

    const nodesGroup = document.getElementById('nodes');
    const linksGroup = document.getElementById('links');

    // --- LAYOUT: Radial ---
    // Dist 0: Center (0,0)
    // Dist 1: r=150
    // Dist 2: r=250
    // Dist 3: r=350
    
    const RADIUS_STEP = 120;
    
    // Group nodes by distance
    const byDist = [[], [], [], []];
    data.nodes.forEach(n => {
        if (n.dist < 4) byDist[n.dist].push(n);
    });

    // Assign positions
    data.nodes.forEach(n => {
      if (n.dist === 0) {
        n.x = 0;
        n.y = 0;
      } else {
        // Distribute evenly on ring
        const count = byDist[n.dist].length;
        const index = byDist[n.dist].indexOf(n);
        const angle = (index / count) * Math.PI * 2 + (n.dist * 0.5); // Offset rings
        const r = n.dist * RADIUS_STEP;
        n.x = Math.cos(angle) * r;
        n.y = Math.sin(angle) * r;
      }
    });

    // Render Links
    data.edges.forEach(e => {
      const s = data.nodes.find(n => n.id === e.source);
      const t = data.nodes.find(n => n.id === e.target);
      
      if (s && t) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", s.x);
        line.setAttribute("y1", s.y);
        line.setAttribute("x2", t.x);
        line.setAttribute("y2", t.y);
        line.setAttribute("class", "link");
        linksGroup.appendChild(line);
      }
    });

    // Render Nodes
    data.nodes.forEach(n => {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("transform", \`translate(\${n.x}, \${n.y})\`);
      
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("r", n.dist === 0 ? 10 : 6);
      circle.setAttribute("class", \`node-circle \${n.dist === 0 ? 'target' : ''}\`);
      
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("y", -15);
      label.setAttribute("class", "node-label");
      label.textContent = n.name;

      g.appendChild(circle);
      g.appendChild(label);
      
      // Click to open
      g.addEventListener('click', () => {
         fetch(\`/open?path=\${encodeURIComponent(n.path)}\`);
      });

      nodesGroup.appendChild(g);
    });

  </script>
</body>
</html>
  `;

  const server = createServer((req, res) => {
    if (req.url && req.url.startsWith('/open')) {
      const url = new URL(req.url, `http://localhost:${PORT}`);
      const filePath = url.searchParams.get('path');
      if (filePath) {
        let realPath = filePath.replace("file:///", "").replace("file://", "");
        realPath = realPath.replace(/\.mdmd\.md$/, "");
        realPath = realPath.replace(".mdmd/layer-4/", "");
        
        // Resolve to absolute path and validate it's within workspace
        const absolutePath = path.resolve(process.cwd(), realPath);
        const workspaceRoot = process.cwd();
        if (!absolutePath.startsWith(workspaceRoot + path.sep) && absolutePath !== workspaceRoot) {
          console.error(`Rejected path outside workspace: ${absolutePath}`);
          res.writeHead(400);
          res.end("Invalid path");
          return;
        }
        
        console.log(`Opening file: ${absolutePath}`);
        execFile('code', [absolutePath]);
      }
      res.writeHead(200);
      res.end("OK");
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  });

  server.listen(PORT, () => {
    console.log(`Sonar server running at http://localhost:${PORT}`);
    if (process.platform === "win32") {
      execFile('cmd', ['/c', 'start', `http://localhost:${PORT}`]);
    } else {
      execFile('open', [`http://localhost:${PORT}`]);
    }
  });
}

main().catch(console.error);
