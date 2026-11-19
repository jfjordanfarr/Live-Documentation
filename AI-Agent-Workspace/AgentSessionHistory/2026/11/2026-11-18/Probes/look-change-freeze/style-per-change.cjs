// Offline, from a raw trace of look-change-trace.cjs (TRACE_OUT): for every change of look it marks, the style passes on
// the page's main thread from 500 ms before the mark (the frame that made the change, which the mark follows) to 450 ms
// after it (past the cross-fade's end at 200 ms), with the elements each restyled; how many restyled at least half as
// many elements as the largest (the whole map's passes); and the time of all of them. `node style-per-change.cjs trace.json`
const fs = require('node:fs');
const events = JSON.parse(fs.readFileSync(process.argv[2])).traceEvents;
const marks = events.filter(e => String(e.name).startsWith('look:') && e.ph === 'I');
const pid = marks[0]?.pid;
const main = events.find(e => e.name === 'thread_name' && e.args?.name === 'CrRendererMain' && e.pid === pid);
const styles = events.filter(e => e.pid === pid && e.tid === main.tid && e.ph === 'X' && e.name === 'UpdateLayoutTree').sort((a, b) => a.ts - b.ts);
for (const mark of marks) {
  const before = Number(process.argv[3] || 500) * 1000, after = Number(process.argv[4] || 450) * 1000;
  const near = styles.filter(e => e.ts > mark.ts - before && e.ts < mark.ts + after);
  const largest = Math.max(0, ...near.map(e => e.args?.elementCount ?? 0));
  const whole = near.filter(e => (e.args?.elementCount ?? 0) >= largest / 2);
  const big = near.filter(e => e.dur > 20_000).map(e => `${e.args?.elementCount}/${(e.dur / 1000).toFixed(0)}`);
  console.log(`${mark.name.slice(5).padEnd(24)} whole-map passes ${whole.length} (${whole.map(e => e.args?.elementCount).join(', ')}); style ${(near.reduce((s, e) => s + e.dur, 0) / 1000).toFixed(0)} ms in all; passes over 20 ms (elements/ms): ${big.join(' ')}`);
}
