import { exec } from "child_process";
import * as fs from "fs/promises";
import { createServer } from "http";
import * as path from "path";

import { snapshotWorkspace } from "../graph-tools/snapshot-workspace";

const PORT = 3002; // Different port than standard visualize

async function main() {
  console.log("Starting fresh run...");
  console.log("Analyzing workspace graph for Circuit Board...");

  // 1. Generate the graph data
  const { artifacts, links } = await snapshotWorkspace({
    workspaceRoot: process.cwd(),
    quiet: true,
    skipDb: true,
    outputPath: path.join("data", "graph-snapshots", "visualize-circuit-temp.json")
  });

  console.log(`Raw Graph: ${artifacts.length} nodes, ${links.length} edges.`);

  // --- FILTERING: Live Documentation Only ---
  const LIVE_DOCS_ROOT = ".mdmd/layer-4";
  const filteredArtifacts = artifacts.filter(a => a.uri.includes(LIVE_DOCS_ROOT));
  const filteredArtifactIds = new Set(filteredArtifacts.map(a => a.id));

  console.log(`Filtered Nodes: ${filteredArtifacts.length}`);

  // --- LAYOUT: Group by Directory (PCB Zones) ---
  const nodes = [];
  const groups = new Map(); // DirPath -> { x, y, width, height, nodes: [] }

  // 1. Group nodes by directory
  filteredArtifacts.forEach(node => {
    const relativePath = node.uri.replace(LIVE_DOCS_ROOT, "").replace(/^\//, "");
    const dir = path.dirname(relativePath);

    if (!groups.has(dir)) {
      groups.set(dir, { nodes: [] });
    }
    groups.get(dir).nodes.push(node);
  });

  // 2. Layout Groups (Simple Grid of Groups)
  const GROUP_PADDING = 50;
  const NODE_WIDTH = 160;
  const NODE_HEIGHT = 80;
  const COLS_PER_GROUP = 4;

  let groupX = 0;
  let groupY = 0;
  let maxHeightInRow = 0;
  const MAX_ROW_WIDTH = 2000;

  Array.from(groups.entries()).forEach(([dirName, group]) => {
    // Calculate group dimensions
    const nodeCount = group.nodes.length;
    const rows = Math.ceil(nodeCount / COLS_PER_GROUP);
    const cols = Math.min(nodeCount, COLS_PER_GROUP);

    const groupW = cols * (NODE_WIDTH + 20) + 40;
    const groupH = rows * (NODE_HEIGHT + 20) + 40;

    // Wrap groups if too wide
    if (groupX + groupW > MAX_ROW_WIDTH) {
      groupX = 0;
      groupY += maxHeightInRow + GROUP_PADDING;
      maxHeightInRow = 0;
    }

    // Position nodes within group
    group.nodes.forEach((node, i) => {
      const col = i % COLS_PER_GROUP;
      const row = Math.floor(i / COLS_PER_GROUP);

      nodes.push({
        id: node.id,
        name: path.basename(node.uri).replace(".mdmd.md", ""),
        path: node.uri,
        group: dirName,
        x: groupX + 20 + col * (NODE_WIDTH + 20),
        y: groupY + 40 + row * (NODE_HEIGHT + 20),
        width: NODE_WIDTH,
        height: NODE_HEIGHT
      });
    });

    groupX += groupW + GROUP_PADDING;
    maxHeightInRow = Math.max(maxHeightInRow, groupH);
  });

  // --- INHERITANCE EXTRACTION ---
  // Heuristic: Read source files and regex match "class X extends Y"
  const inheritanceLinks = [];
  console.log("Extracting inheritance...");

  for (const node of filteredArtifacts) {
    try {
      // 1. Get the MDMD file path (normalize to forward slashes)
      const mdmdPath = node.uri.replace("file:///", "").replace("file://", "").replace(/\\/g, "/");

      // 2. Determine source path
      // Remove .mdmd/layer-4/ segment
      const sourcePath = mdmdPath.replace(".mdmd/layer-4/", "").replace(".mdmd.md", "");

      const content = await fs.readFile(sourcePath, "utf-8");

      // Debug: Log first few files
      if (inheritanceLinks.length === 0 && Math.random() < 0.1) {
        // console.log(`Checked: ${sourcePath}`);
      }

      if (sourcePath.includes("inferenceAccuracy.ts")) {
        console.log(`DEBUG: Checking ${sourcePath}`);
        // console.log(`DEBUG: Content length: ${content.length}`);
        const match = content.match(/class\s+\w+[\s\n]+extends[\s\n]+(\w+)/);
        console.log(`DEBUG: Match result: ${match ? match[1] : "null"}`);
      }

      // Match extends (multiline friendly)
      const extendsMatch = content.match(/class\s+\w+[\s\n]+extends[\s\n]+(\w+)/);
      if (extendsMatch) {
        const parentName = extendsMatch[1];
        // console.log(`Found extends: ${parentName} in ${path.basename(sourcePath)}`);

        let parentNode = null;

        // Strategy 1: Check if parentName matches a file name directly (e.g. class Foo in Foo.ts)
        parentNode = filteredArtifacts.find(n => {
          const name = path.basename(n.uri).replace(".mdmd.md", "");
          return name === parentName || name === parentName + ".ts";
        });

        // Strategy 2: Resolve via Import
        if (!parentNode) {
          // Regex to find import ... from "modulePath"
          // Handles: import { X } from "path"; import { X as Y } from "path"; import X from "path";
          // We look for parentName in the import clause.
          const importRegex = new RegExp(`import\\s+(?:{[^}]*?\\b${parentName}\\b[^}]*}|\\b${parentName}\\b)\\s+from\\s+['"](.*?)['"]`, 's');
          const importMatch = content.match(importRegex);

          if (importMatch) {
            const modulePath = importMatch[1];
            // console.log(`Found import for ${parentName}: ${modulePath}`);

            // Normalize module path for matching
            // e.g. @live-documentation/shared/telemetry/inferenceAccuracy -> shared/telemetry/inferenceAccuracy
            const cleanModulePath = modulePath.replace("@live-documentation/", "packages/");

            // Try to find a node that ends with this path
            parentNode = filteredArtifacts.find(n => {
              const nodePath = n.uri.replace("file:///", "").replace("file://", "");
              // Check if node path contains the module path (ignoring extension differences)
              return nodePath.includes(cleanModulePath) && !nodePath.includes("node_modules");
            });
          }
        }

        if (parentNode) {
          console.log(`Linked: ${path.basename(sourcePath)} -> ${parentName}`);
          inheritanceLinks.push({
            source: node.id,
            target: parentNode.id,
            kind: "extends"
          });
        }
      }

      // Match implements (multiline friendly)
      const implementsMatch = content.match(/class\s+\w+[\s\n]+implements[\s\n]+([\w,\s]+)/);
      if (implementsMatch) {
        const interfaces = implementsMatch[1].split(",").map(s => s.trim());
        for (const iface of interfaces) {
          // Clean up interface name (remove generics, newlines)
          const cleanIface = iface.split('<')[0].replace(/[\n\r]/g, '').trim();

          let ifaceNode = filteredArtifacts.find(n => {
            const name = path.basename(n.uri).replace(".mdmd.md", "");
            return name === cleanIface || name === cleanIface + ".ts";
          });

          // Strategy 2: Resolve via Import (for interfaces)
          if (!ifaceNode) {
            const importRegex = new RegExp(`import\\s+(?:{[^}]*?\\b${cleanIface}\\b[^}]*}|\\b${cleanIface}\\b)\\s+from\\s+['"](.*?)['"]`, 's');
            const importMatch = content.match(importRegex);
            if (importMatch) {
              const modulePath = importMatch[1];
              const cleanModulePath = modulePath.replace("@live-documentation/", "packages/");
              ifaceNode = filteredArtifacts.find(n => {
                const nodePath = n.uri.replace("file:///", "").replace("file://", "");
                return nodePath.includes(cleanModulePath) && !nodePath.includes("node_modules");
              });
            }
          }

          if (ifaceNode) {
            console.log(`Linked: ${path.basename(sourcePath)} -> ${cleanIface}`);
            inheritanceLinks.push({
              source: node.id,
              target: ifaceNode.id,
              kind: "implements"
            });
          }
        }
      }

    } catch {
      // Ignore errors (file not found, etc)
    }
  }
  console.log(`Found ${inheritanceLinks.length} inheritance links.`);

  // --- INDUCED LINKS ---
  // 1. Map Code Artifacts to the Docs that reference them
  const codeToDocs = new Map(); // CodeID -> Set<DocID>

  for (const link of links) {
    if (filteredArtifactIds.has(link.sourceId) && !filteredArtifactIds.has(link.targetId)) {
      if (!codeToDocs.has(link.targetId)) {
        codeToDocs.set(link.targetId, new Set());
      }
      codeToDocs.get(link.targetId).add(link.sourceId);
    }
  }

  // 2. Find connections between Docs based on connections between their Code
  const inducedLinks = [];
  for (const link of links) {
    const sourceDocs = codeToDocs.get(link.sourceId);
    const targetDocs = codeToDocs.get(link.targetId);

    if (sourceDocs && targetDocs) {
      for (const sourceDocId of sourceDocs) {
        for (const targetDocId of targetDocs) {
          if (sourceDocId !== targetDocId) {
            inducedLinks.push({
              source: sourceDocId,
              target: targetDocId,
              kind: link.kind || "induced" // Preserve original kind (import, extends, etc.)
            });
          }
        }
      }
    }
  }

  const directLinks = links
    .filter(l => filteredArtifactIds.has(l.sourceId) && filteredArtifactIds.has(l.targetId))
    .map(l => ({
      source: l.sourceId,
      target: l.targetId,
      kind: l.kind || "coupling"
    }));

  const allEdges = [...directLinks, ...inducedLinks, ...inheritanceLinks];

  // Deduplicate edges
  const uniqueEdgesMap = new Map();
  allEdges.forEach(e => {
    const key = `${e.source}|${e.target}`;
    if (!uniqueEdgesMap.has(key)) {
      uniqueEdgesMap.set(key, e);
    }
  });
  const edges = Array.from(uniqueEdgesMap.values());

  // Debug: Check edge kinds
  const kinds = new Set(edges.map(e => e.kind));
  console.log("Edge Kinds:", Array.from(kinds));

  console.log(`Filtered Edges: ${edges.length}`);

  // Debug: Find most connected nodes
  const connCounts = new Map();
  edges.forEach(e => {
    connCounts.set(e.source, (connCounts.get(e.source) || 0) + 1);
    connCounts.set(e.target, (connCounts.get(e.target) || 0) + 1);
  });

  const topNodes = [...connCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => {
      const node = filteredArtifacts.find(n => n.id === id);
      return `${node ? path.basename(node.uri) : id} (${count})`;
    });

  console.log("Top Connected Nodes:", topNodes);

  // --- HTML GENERATION ---
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Live Docs - Circuit Board</title>
  <style>
    :root {
      --bg: #1e1e1e;
      --chip-bg: #252526;
      --chip-border: #454545;
      --text-main: #d4d4d4;
      --text-sub: #888;
      --accent: #007acc;
      --wire-coupling: #4caf50;
      --wire-inheritance: #ffc107;
    }
    body { background-color: var(--bg); color: var(--text-main); font-family: 'Segoe UI', sans-serif; overflow: hidden; margin: 0; }
    
    #canvas { width: 100vw; height: 100vh; display: block; cursor: grab; }
    #canvas:active { cursor: grabbing; }
    
    /* Chip Styles */
    .chip-rect { fill: var(--chip-bg); stroke: var(--chip-border); stroke-width: 1; rx: 6; transition: all 0.2s ease; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }
    .chip:hover .chip-rect { stroke: var(--accent); stroke-width: 2; fill: #2d2d30; filter: drop-shadow(0 4px 8px rgba(0,122,204,0.3)); }
    .chip.active .chip-rect { stroke: var(--accent); stroke-width: 3; fill: #333; }
    
    .chip-text { fill: #e0e0e0; font-size: 12px; font-family: 'Consolas', monospace; pointer-events: none; font-weight: 600; }
    .chip-subtext { fill: var(--text-sub); font-size: 10px; font-family: sans-serif; pointer-events: none; }
    
    /* Wire Styles */
    .wire { fill: none; stroke-width: 1.5; opacity: 0.3; transition: all 0.3s ease; stroke-linecap: round; stroke-linejoin: round; }
    .wire.coupling { stroke: var(--wire-coupling); }
    .wire.import { stroke: var(--wire-coupling); }
    .wire.export { stroke: var(--wire-coupling); }
    .wire.induced { stroke: var(--wire-coupling); }
    
    /* Inheritance Styles */
    .wire.extends, .wire.implements { 
        stroke: var(--wire-inheritance); 
        stroke-width: 2.5; 
        opacity: 0.8; 
        stroke-dasharray: 5, 3; /* Dashed line for inheritance */
    }
    
    /* Highlight States */
    .dimmed { opacity: 0.05; transition: opacity 0.3s; }
    .highlighted-node .chip-rect { stroke: #fff; stroke-width: 2; }
    .highlighted-wire { opacity: 0.9 !important; stroke-width: 2.5 !important; filter: drop-shadow(0 0 3px currentColor); }
    
    /* Detail Panel (Glassmorphism) */
    #detail-panel {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 350px;
      max-height: 90vh;
      background: rgba(30, 30, 30, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      transform: translateX(400px);
      transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
      overflow-y: auto;
      z-index: 100;
    }
    #detail-panel.visible { transform: translateX(0); }
    
    .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; }
    .panel-title { font-size: 18px; font-weight: bold; color: #fff; margin: 0; word-break: break-all; }
    .panel-subtitle { font-size: 12px; color: var(--accent); margin-top: 4px; }
    .btn-close { background: none; border: none; color: #888; cursor: pointer; font-size: 20px; }
    .btn-close:hover { color: #fff; }
    
    .panel-section { margin-bottom: 20px; }
    .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 8px; font-weight: bold; }
    .tag { display: inline-block; padding: 4px 8px; border-radius: 4px; background: rgba(255,255,255,0.05); font-size: 11px; margin-right: 6px; margin-bottom: 6px; border: 1px solid rgba(255,255,255,0.05); }
    .tag.coupling { border-color: var(--wire-coupling); color: var(--wire-coupling); }
    .tag.inheritance { border-color: var(--wire-inheritance); color: var(--wire-inheritance); }
    
    .action-btn {
      display: block; width: 100%; padding: 10px; margin-top: 10px;
      background: var(--accent); color: white; border: none; border-radius: 6px;
      cursor: pointer; font-weight: bold; text-align: center; text-decoration: none;
      transition: background 0.2s;
    }
    .action-btn:hover { background: #0063a5; }

    /* Controls */
    #controls { position: fixed; bottom: 20px; left: 20px; display: flex; gap: 10px; }
    .control-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); color: #ccc; padding: 8px 12px; border-radius: 6px; cursor: pointer; backdrop-filter: blur(4px); }
    .control-btn:hover { background: rgba(255,255,255,0.2); color: #fff; }
  </style>
</head>
<body>
  <svg id="canvas">
    <defs>
      <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#2a2a2a" stroke-width="1"/>
      </pattern>
      <marker id="arrow-coupling" markerWidth="10" markerHeight="10" refX="20" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="#4caf50" />
      </marker>
    </defs>
    <rect width="100%" height="100%" fill="#1e1e1e" />
    <rect width="100%" height="100%" fill="url(#grid)" opacity="0.5" />
    
    <g id="zoom-layer">
      <g id="wires"></g>
      <g id="chips"></g>
    </g>
  </svg>

  <div id="detail-panel">
    <div class="panel-header">
      <div>
        <h2 class="panel-title" id="detail-title">Component</h2>
        <div class="panel-subtitle" id="detail-path">path/to/file.ts</div>
      </div>
      <button class="btn-close" onclick="closePanel()">×</button>
    </div>
    
    <div class="panel-section">
      <div class="section-title">Connections</div>
      <div id="detail-connections"></div>
    </div>

    <div class="panel-section">
      <div class="section-title">Actions</div>
      <a href="#" id="btn-open-editor" class="action-btn">Open in Editor</a>
    </div>
  </div>

  <div id="controls">
    <button class="control-btn" onclick="resetView()">Reset View</button>
    <button class="control-btn" onclick="toggleWires()">Toggle Wires</button>
  </div>

  <script>
    const data = {
      nodes: ${JSON.stringify(nodes)},
      edges: ${JSON.stringify(edges)}
    };

    const canvas = document.getElementById('canvas');
    const zoomLayer = document.getElementById('zoom-layer');
    const chipsGroup = document.getElementById('chips');
    const wiresGroup = document.getElementById('wires');
    const detailPanel = document.getElementById('detail-panel');
    
    let scale = 1;
    let panX = 0;
    let panY = 0;
    let isDragging = false;
    let startX, startY;
    let selectedNodeId = null;

    // Initial Render
    render();

    function render() {
      // Render Wires
      data.edges.forEach(edge => {
        const source = data.nodes.find(n => n.id === edge.source);
        const target = data.nodes.find(n => n.id === edge.target);
        
        if (source && target) {
          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          const d = getOrthogonalPath(source, target);
          path.setAttribute("d", d);
          path.setAttribute("class", \`wire \${edge.kind || 'coupling'}\`);
          path.setAttribute("data-source", source.id);
          path.setAttribute("data-target", target.id);
          wiresGroup.appendChild(path);
        }
      });

      // Render Chips
      data.nodes.forEach(node => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("transform", \`translate(\${node.x}, \${node.y})\`);
        g.setAttribute("class", "chip");
        g.setAttribute("data-id", node.id);
        
        // Chip Body
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("width", node.width);
        rect.setAttribute("height", node.height);
        rect.setAttribute("class", "chip-rect");
        
        // Label
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", 10);
        text.setAttribute("y", 25);
        text.setAttribute("class", "chip-text");
        text.textContent = node.name;

        // Subtext (Path)
        const subtext = document.createElementNS("http://www.w3.org/2000/svg", "text");
        subtext.setAttribute("x", 10);
        subtext.setAttribute("y", 45);
        subtext.setAttribute("class", "chip-subtext");
        // Truncate path
        const shortPath = node.path.split('/').slice(-2).join('/');
        subtext.textContent = shortPath;

        g.appendChild(rect);
        g.appendChild(text);
        g.appendChild(subtext);
        
        // Events
        g.addEventListener('mouseenter', () => highlight(node.id));
        g.addEventListener('mouseleave', () => clearHighlight());
        g.addEventListener('click', (e) => {
          e.stopPropagation();
          selectNode(node);
        });

        chipsGroup.appendChild(g);
      });
    }

    function getOrthogonalPath(source, target) {
      // Simple orthogonal routing: Start -> MidX -> MidY -> End
      // Add random offset to avoid overlap
      const offset = (Math.random() - 0.5) * 20;
      
      const x1 = source.x + source.width / 2;
      const y1 = source.y + source.height / 2;
      const x2 = target.x + target.width / 2;
      const y2 = target.y + target.height / 2;
      
      const midX = (x1 + x2) / 2 + offset;
      
      return \`M \${x1} \${y1} L \${midX} \${y1} L \${midX} \${y2} L \${x2} \${y2}\`;
    }

    // --- INTERACTION ---
    
    function highlight(nodeId) {
      if (selectedNodeId) return; // Don't override selection
      
      document.querySelectorAll('.chip').forEach(el => {
        if (el.getAttribute('data-id') === nodeId) {
          el.classList.add('highlighted-node');
        } else {
          el.classList.add('dimmed');
        }
      });
      
      document.querySelectorAll('.wire').forEach(el => {
        if (el.getAttribute('data-source') === nodeId || el.getAttribute('data-target') === nodeId) {
          el.classList.add('highlighted-wire');
          // Highlight connected nodes
          const otherId = el.getAttribute('data-source') === nodeId ? el.getAttribute('data-target') : el.getAttribute('data-source');
          document.querySelector(\`.chip[data-id="\${otherId}"]\`)?.classList.remove('dimmed');
          document.querySelector(\`.chip[data-id="\${otherId}"]\`)?.classList.add('highlighted-node');
        } else {
          el.classList.add('dimmed');
        }
      });
    }

    function clearHighlight() {
      if (selectedNodeId) return;
      
      document.querySelectorAll('.chip, .wire').forEach(el => {
        el.classList.remove('dimmed', 'highlighted-node', 'highlighted-wire');
      });
    }

    function selectNode(node) {
      selectedNodeId = node.id;
      
      // Clear previous highlights
      document.querySelectorAll('.chip, .wire').forEach(el => {
        el.classList.remove('dimmed', 'highlighted-node', 'highlighted-wire');
      });
      
      // Apply highlight
      highlight(node.id);
      
      // Show Panel
      document.getElementById('detail-title').textContent = node.name;
      document.getElementById('detail-path').textContent = node.path;
      document.getElementById('detail-panel').classList.add('visible');
      
      // Populate Connections
      const container = document.getElementById('detail-connections');
      container.innerHTML = '';
      
      const connectedEdges = data.edges.filter(e => e.source === node.id || e.target === node.id);
      if (connectedEdges.length === 0) {
        container.innerHTML = '<div style="color: #666; font-style: italic;">No connections found.</div>';
      } else {
        connectedEdges.forEach(e => {
          const isSource = e.source === node.id;
          const otherId = isSource ? e.target : e.source;
          const otherNode = data.nodes.find(n => n.id === otherId);
          const kind = e.kind || 'coupling';
          
          const div = document.createElement('div');
          div.style.marginBottom = '8px';
          div.innerHTML = \`
            <span class="tag \${kind}">\${kind}</span>
            \${isSource ? '→' : '←'} 
            \${otherNode ? otherNode.name : otherId}
          \`;
          container.appendChild(div);
        });
      }

      // Setup Open Button
      const btn = document.getElementById('btn-open-editor');
      btn.onclick = (e) => {
        e.preventDefault();
        fetch(\`/open?path=\${encodeURIComponent(node.path)}\`);
      };
    }

    function closePanel() {
      document.getElementById('detail-panel').classList.remove('visible');
      selectedNodeId = null;
      clearHighlight();
    }
    
    function resetView() {
      panX = 0; panY = 0; scale = 1;
      updateTransform();
    }
    
    function toggleWires() {
      wiresGroup.style.display = wiresGroup.style.display === 'none' ? 'block' : 'none';
    }

    // --- PAN / ZOOM ---
    canvas.addEventListener('mousedown', e => {
      isDragging = true;
      startX = e.clientX - panX;
      startY = e.clientY - panY;
    });
    
    canvas.addEventListener('mousemove', e => {
      if (isDragging) {
        panX = e.clientX - startX;
        panY = e.clientY - startY;
        updateTransform();
      }
    });
    
    canvas.addEventListener('mouseup', () => isDragging = false);
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      scale *= delta;
      updateTransform();
    });

    function updateTransform() {
      zoomLayer.setAttribute('transform', \`translate(\${panX}, \${panY}) scale(\${scale})\`);
    }

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
        console.log(`Opening file: ${realPath}`);
        exec(`code "${realPath}"`);
      }
      res.writeHead(200);
      res.end("OK");
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  });

  server.listen(PORT, () => {
    console.log(`Circuit Board server running at http://localhost:${PORT}`);
    const startCommand = process.platform === "win32" ? "start" : "open";
    exec(`${startCommand} http://localhost:${PORT}`);
  });
}

main().catch(console.error);
