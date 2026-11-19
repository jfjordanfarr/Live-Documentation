// From look-change-trace.cjs's JSON (OUT): for every change of look, the frames from the one before it to 500 ms after
// it (ms since the frame before each), the longest of them, and the frames over 50 ms among them.
// `node edge-frames.cjs result.json [...more]`.
const fs = require('node:fs');
for (const file of process.argv.slice(2)) {
  for (const run of JSON.parse(fs.readFileSync(file))) {
    console.log(`${file.split('/').pop()} run ${run.run} (${run.census.elements} elements in the map)`);
    for (const edge of run.edges) {
      const all = [edge.frameMs, ...edge.after];
      console.log(`  ${edge.change.padEnd(24)} at scale ${String(edge.scale).padEnd(6)} longest ${String(Math.max(...all)).padStart(4)} ms; over 50 ms: ${all.filter(ms => ms > 50).join(', ') || 'none'}`);
    }
  }
}
