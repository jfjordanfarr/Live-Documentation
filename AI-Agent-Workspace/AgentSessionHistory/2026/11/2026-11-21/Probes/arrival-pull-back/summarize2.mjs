// The second round's numbers as one table: each run's ease, its worst frame, the elements restyled where the look
// changed, and the restyles in the other frames of the motion, where cards entering the window take their style late.
import fs from 'node:fs';
import path from 'node:path';
const dir = process.argv[2];
console.log('| Run | Subject | # | Ease (ms) | Frames | Median | 90th | Worst (ms) | Worst at (scale) | Look change: frame (ms), elements restyled | Other frames: most restyled in one, frames restyling over 200 |');
console.log('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |');
for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) for (const r of JSON.parse(fs.readFileSync(path.join(dir, file)))) {
  const e = r.ease, w = r.worstFrame;
  const look = (r.lookFrames ?? []).filter(l => l.look !== 'reading' || r.arrival === 'reading');
  const change = look.filter(l => (l.styles ?? []).length).map(l => `${l.ms} ms, ${l.styles.reduce((s, x) => s + (x.elements ?? 0), 0)}`).join('; ');
  const changeAts = new Set(look.map(l => l.at));
  const others = (r.everyFrame ?? []).filter(f => !changeAts.has(f.at));
  const most = Math.max(0, ...others.map(f => f.restyled));
  const many = others.filter(f => f.restyled > 200).length;
  console.log(`| ${file.replace('.json', '')} | ${r.subject} | ${r.run} | ${e?.ms ?? ''} | ${e?.frames ?? ''} | ${e?.median ?? ''} | ${e?.p90 ?? ''} | ${e?.worst ?? ''} | ${w ? w.k : ''} | ${change} | ${most}, ${many} |`);
}
