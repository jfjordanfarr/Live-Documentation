// Better-paired quotation check: straight quotes are paired in order within a line (paragraph), all lengths, then filtered to >=12.
import fs from 'node:fs';
const [oldF, newF, mode] = process.argv.slice(2);
const oldText = fs.readFileSync(oldF, 'utf8'), newText = fs.readFileSync(newF, 'utf8');
function quotes(text, withLine=false) {
  const out = []; const odd = [];
  text.split('\n').forEach((line, i) => {
    const l = line.replace(/\\"/g, '\u0001');
    // strip inline code spans so quotes inside code don't pair
    const noCode = l.replace(/`[^`]*`/g, m => m.replace(/"/g, '\u0002'));
    let n = 0;
    for (const m of noCode.matchAll(/"([^"]*)"|“([^”]*)”/g)) {
      const q = (m[1] ?? m[2]).replace(/\u0001/g, '"').replace(/\u0002/g, '"').trim();
      if (q.length >= 12) out.push(withLine ? [q, i + 1] : q);
    }
    const c = (noCode.match(/"/g) || []).length; if (c % 2) odd.push(i + 1);
  });
  return { out, odd };
}
const flat = t => t.replace(/\\"/g, '"').replace(/\s+/g, ' ');
const bare = t => t.replace(/[_*`]/g, '').replace(/\s*\.\.\.\s*|\s*…\s*/g, ' ').replace(/\s+/g, ' ');
const oP = flat(oldText), nP = flat(newText), oB = bare(oP), nB = bare(nP);
const O = quotes(oldText, true), N = quotes(newText, true);
const inv = N.out.filter(([q]) => !oP.includes(q) && !oB.includes(bare(q)));
const miss = [], part = [];
const seen = new Set();
for (const [q, ln] of O.out) {
  if (seen.has(q)) continue; seen.add(q);
  if (nP.includes(q) || nB.includes(bare(q))) continue;
  const w = bare(q).split(' '); let kept = false;
  for (let a = 0; a + 8 <= w.length && !kept; a++) kept = nB.includes(w.slice(a, a + 8).join(' '));
  (kept ? part : miss).push([q, ln]);
}
console.log(JSON.stringify({ oldQ: O.out.length, newQ: N.out.length, notInOld: inv.length, missing: miss.length, partial: part.length, oddOld: O.odd, oddNew: N.odd }));
if (mode === '--list') {
  const show = (t, l) => { console.log(`\n== ${t} (${l.length})`); for (const [q, ln] of l) console.log(`  [${ln}] ${q}`); };
  show('new not in old', inv); show('old missing', miss); show('old partial', part);
}
