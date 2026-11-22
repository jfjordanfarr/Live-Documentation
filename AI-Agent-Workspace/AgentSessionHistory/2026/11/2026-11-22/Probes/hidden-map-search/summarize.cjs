const d = require(process.argv[2]);
const full = process.argv[3] === "full";
const rows = d.rows;
if (full) for (const r of rows) console.log([r.phase, r.wall, r.camera || "-", r.arrival || "-", r.moving || "-", r.status, r.tried, r.alignmentTried, r.cycleTried, r.next, r.adopted, r.alignmentAdopted, r.cards, r.wires].join("\t"));
const back = rows.find(r => r.phase === "back") || rows[0];
const end = rows.find(r => r.status !== "running") || rows[rows.length - 1];
const last = rows[rows.length - 1];
const L = d.long;
const sum = L.reduce((a, b) => a + b, 0);
console.log(JSON.stringify({
  cards: last.cards, wires: last.wires, seeds: last.tried, joins: last.alignmentTried, cycles: last.cycleTried, adopted: last.adopted, joinsAdopted: last.alignmentAdopted, status: last.status,
  loadToDrawn_ms: rows[0].wall, backToEnd_ms: end.wall - back.wall, drawnToEnd_ms: end.wall - rows[0].wall,
  longtasks: L.length, longSum_ms: sum, longMax_ms: Math.max(...L), longPerTrial_ms: Math.round(sum / (last.tried + last.alignmentTried + last.cycleTried))
}));
