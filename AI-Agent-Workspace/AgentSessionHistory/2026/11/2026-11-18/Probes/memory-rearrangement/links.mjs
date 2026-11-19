import fs from 'node:fs';
const [oldF, newF] = process.argv.slice(2);
const o = fs.readFileSync(oldF, 'utf8'), n = fs.readFileSync(newF, 'utf8');
const targets = t => new Set([...t.matchAll(/\]\(([^)\s]+)\)/g)].map(m => m[1]));
const nt = targets(n);
const lost = [...targets(o)].filter(x => !nt.has(x));
const lines = o.split('\n');
let k = 0;
for (const tg of lost) {
  k++;
  console.log(`\n#${k} ${tg}`);
  lines.forEach((l, i) => {
    let at = -1;
    while ((at = l.indexOf('](' + tg + ')', at + 1)) !== -1) {
      const start = Math.max(0, at - 260);
      console.log(`  L${i + 1} {${l.slice(0, 70)}} …${l.slice(start, at + 1).replace(/\]\([^)]*\)/g, ']')}…${l.slice(at + tg.length + 3, at + tg.length + 120).replace(/\]\([^)]*\)/g, ']')}`);
    }
  });
}
