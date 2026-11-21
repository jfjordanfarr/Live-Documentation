// The probe's JSON as Markdown tables: one row a run, the ease's frames and its worst frame with what filled it.
import fs from 'node:fs';
import path from 'node:path';
const dir = process.argv[2];
const rows = [];
for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) for (const r of JSON.parse(fs.readFileSync(path.join(dir, file)))) rows.push(r);
const order = { 'then-neighbours': 0, 'then-neighbours-after': 1, 'then-neighbours-before': 2 };
const subjects = { estate: 0, pathfind: 1, heavy: 2 };
rows.sort((a, b) => (a.condition > b.condition ? 1 : a.condition < b.condition ? -1 : 0) || subjects[a.subject] - subjects[b.subject] || order[a.arrival] - order[b.arrival] || a.run - b.run);
console.log('| Condition | Subject | Arrival | Run | Rest before the ease (ms) | Ease (ms) | Frames | Median | 90th | Worst (ms) | Worst at (ms, scale) | Worst: style (elements) / layout / paint / script | Look change at (ms, scale) |');
console.log('| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |');
for (const r of rows) {
  const e = r.ease, w = r.worstFrame;
  const look = r.changes.filter(c => /connections/.test(c.state) && !/reading\|reading/.test(c.state))[0];
  const firstConn = r.changes.find(c => c.state.startsWith('connections'));
  console.log(`| ${r.condition} | ${r.subject} | ${r.arrival.replace('then-neighbours', 'TN')} | ${r.run} | ${r.restBeforeEase ?? ''} | ${e?.ms ?? ''} | ${e?.frames ?? ''} | ${e?.median ?? ''} | ${e?.p90 ?? ''} | ${e?.worst ?? ''} | ${w ? `${w.at}, ${w.k}` : ''} | ${w ? `${w.style} (${w.styles.map(s => s.elements).join('+')}) / ${w.layout} / ${w.paint} / ${w.script}` : ''} | ${firstConn ? `${firstConn.at}, ${firstConn.k}` : ''} |`);
}
