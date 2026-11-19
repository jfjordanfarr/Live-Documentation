// Offline: a raw trace written by look-change-trace.cjs (TRACE_OUT), read for every change of look it marks: each
// main-thread task from 20 ms before the mark to WINDOW ms after it that lasted more than 4 ms, with what filled it
// (scripts by function, style passes with the elements restyled, layouts with the objects laid out, paint, commit), and
// whether a style pass or layout ran inside a script (forced by a read). `node look-change-tasks.cjs trace.json [WINDOW]`.
const fs = require('node:fs');
const events = JSON.parse(fs.readFileSync(process.argv[2])).traceEvents;
const windowMs = Number(process.argv[3] || 600);
const marks = events.filter(e => String(e.name).startsWith('look:') && e.ph === 'I');
const main = events.find(e => e.name === 'thread_name' && e.args?.name === 'CrRendererMain' && marks.some(m => m.pid === e.pid));
const list = events.filter(e => e.pid === main.pid && e.tid === main.tid && e.ph === 'X' && e.dur > 0).sort((a, b) => a.ts - b.ts || b.dur - a.dur);
const stack = [], tops = [];
for (const e of list) {
  e.children = [];
  while (stack.length && stack[stack.length - 1].ts + stack[stack.length - 1].dur <= e.ts) stack.pop();
  const parent = stack[stack.length - 1];
  if (parent) { parent.children.push(e); e.parent = parent; } else tops.push(e);
  stack.push(e);
}
const SCRIPT = new Set(['FunctionCall', 'EvaluateScript', 'FireAnimationFrame', 'TimerFire', 'EventDispatch', 'v8.callFunction', 'FireIdleCallback']);
const scriptOf = e => { let found = null; for (let p = e.parent; p; p = p.parent) if (p.name === 'FunctionCall') { found = p; break; } return found; };
const where = e => { const d = e.args?.data ?? {}; return `${d.functionName || '(anon)'}:${d.lineNumber ?? ''}:${d.columnNumber ?? ''}`; };
const descend = (e, out = []) => { out.push(e); for (const c of e.children) descend(c, out); return out; };
const ms = us => +(us / 1000).toFixed(1);
for (const mark of marks) {
  console.log(`\n### ${mark.name}`);
  for (const task of tops.filter(t => t.ts + t.dur >= mark.ts - 20000 && t.ts <= mark.ts + windowMs * 1000 && t.dur > 4000)) {
    const all = descend(task);
    const sum = name => ms(all.filter(e => e.name === name).reduce((s, e) => s + e.dur, 0));
    const fired = all.filter(e => ['FireAnimationFrame', 'TimerFire', 'EventDispatch', 'FunctionCall'].includes(e.name) && !scriptOf(e) && e.dur > 1500).map(e => `${e.name}${e.args?.data?.type ? '(' + e.args.data.type + ')' : ''}${e.name === 'FunctionCall' ? ' ' + where(e) : ''} ${ms(e.dur)}`);
    const styles = all.filter(e => e.name === 'UpdateLayoutTree' && e.dur > 1500).map(e => `${ms(e.dur)}ms/${e.args?.elementCount ?? '?'}el${scriptOf(e) ? ' FORCED in ' + where(scriptOf(e)) : ''}`);
    const layouts = all.filter(e => e.name === 'Layout' && e.dur > 1500).map(e => `${ms(e.dur)}ms/${e.args?.beginData?.dirtyObjects ?? '?'}of${e.args?.beginData?.totalObjects ?? '?'}${scriptOf(e) ? ' FORCED in ' + where(scriptOf(e)) : ''}`);
    console.log(`task +${ms(task.ts - mark.ts)} ${ms(task.dur)}ms ${task.name}: style ${sum('UpdateLayoutTree')} layout ${sum('Layout')} prepaint ${sum('PrePaint')} paint ${sum('Paint')} layerize ${sum('Layerize')} commit ${sum('Commit')} script ${sum('FunctionCall')}`);
    if (fired.length) console.log('   scripts:', fired.join(' | '));
    if (styles.length) console.log('   styles:', styles.join(' | '));
    if (layouts.length) console.log('   layouts:', layouts.join(' | '));
  }
}
