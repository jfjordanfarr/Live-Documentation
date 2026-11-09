from pathlib import Path
import subprocess, json, hashlib, os, time, difflib
ROOT=Path('/tmp/live-docs-20261108-defaults')
OUT=Path('/tmp/live-docs-20261108-defaults-focused');OUT.mkdir(exist_ok=True)
CAP=ROOT/'scripts/layout-lab/capture.ts';HIDDEN=ROOT/'tests/e2e/local-map-hidden.spec.ts'
original={p:p.read_bytes() for p in (CAP,HIDDEN)}
for p,b in original.items():(OUT/(p.name+'.original')).write_bytes(b)
(OUT/'original-helper-sha256.json').write_text(json.dumps({str(p):hashlib.sha256(b).hexdigest() for p,b in original.items()},indent=2)+'\n')
def change(s,old,new):
 assert s.count(old)==1,(old[:100],s.count(old))
 return s.replace(old,new)
c=original[CAP].decode()
c=change(c,'export async function captureFromPage(page: Page, run: ScopeRun): Promise<Capture> {','''export async function captureFromPage(page: Page, run: ScopeRun): Promise<Capture> {
  const diagSetup = Date.now();
  const diagHost = (phase: string): void => console.log("__LD_CAPTURE_HOST__", JSON.stringify({ phase, epoch: Date.now(), elapsed: Date.now() - diagSetup }));
  page.on("console", message => { if (message.text().startsWith("__LD_CAPTURE__")) console.log(message.text()); });
  diagHost("setup-entry");''')
c=change(c,'  await page.waitForSelector("#map-container .branch-mode", { timeout: 30_000 });','  await page.waitForSelector("#map-container .branch-mode", { timeout: 30_000 });\n  diagHost("branch-ready");')
c=change(c,'  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached", timeout: 15_000 });','  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached", timeout: 15_000 });\n  diagHost("wires-ready");')
c=change(c,'  await admitCompiledFunctions(page);\n  const { titleChecks, ...read } = await readCapture(page);','  await admitCompiledFunctions(page);\n  diagHost("pretext-ready");\n  const { titleChecks, ...read } = await readCapture(page);\n  diagHost("capture-result");')
c=change(c,'function readCapture(page: Page): Promise<PageCapture & { titleChecks: TitleCheck[] }> {\n  return page.evaluate(({ tolerance }) => {','''function readCapture(page: Page): Promise<PageCapture & { titleChecks: TitleCheck[] }> {
  console.log("__LD_CAPTURE_HOST__", JSON.stringify({ phase: "evaluate-issued", epoch: Date.now() }));
  const pending = page.evaluate(({ tolerance }) => {
    const diagStart = performance.now();
    const diag = (phase: string, extra: object = {}): void => console.log("__LD_CAPTURE__", JSON.stringify({ phase, epoch: performance.timeOrigin + performance.now(), elapsed: performance.now() - diagStart, ...extra }));
    diag("callback-entry");
    const diagCards: Array<{ id: string; rows: number; total: number; rowsMs: number; probesMs: number }> = [];''')
c=change(c,'    const roomOf = (title: HTMLElement): TitleRoom | null => rooms.get(title) ?? null;','''    const roomOf = (title: HTMLElement): TitleRoom | null => rooms.get(title) ?? null;
    diag("title-rooms", { cards: document.querySelectorAll("#map-container .node-card").length, rows: document.querySelectorAll("#map-container .symbol-row").length, titles: rooms.size });''')
c=change(c,'    wrappers.forEach((wrapper, i) => Object.assign(wrapper.style, { width: saved[i][0], maxWidth: saved[i][1] }));','    wrappers.forEach((wrapper, i) => Object.assign(wrapper.style, { width: saved[i][0], maxWidth: saved[i][1] }));\n    diag("natural-widths-restored", { wrappers: wrappers.length });')
c=change(c,'    wrappers.forEach((wrapper, i) => {\n      // A closed directory','    wrappers.forEach((wrapper, i) => {\n      const diagCardStart = performance.now();\n      // A closed directory')
c=change(c,'      {\n        // A dot of the stylesheet','      const diagRowsEnd = performance.now();\n      {\n        // A dot of the stylesheet')
c=change(c,'      const chip = (element: Element): ChipCapture => {','      const diagProbesEnd = performance.now();\n      const chip = (element: Element): ChipCapture => {')
c=change(c,'    });\n    for (const row of unmeasuredControls)','''      const diagCard = { id, rows: rows.length, total: performance.now() - diagCardStart, rowsMs: diagRowsEnd - diagCardStart, probesMs: diagProbesEnd - diagRowsEnd };
      diagCards.push(diagCard);
      if (diagCards.length % 10 === 0 || diagCard.total > 500) diag("card-progress", { count: diagCards.length, card: diagCard });
    });
    diag("cards-complete", { count: diagCards.length, timings: diagCards });
    for (const row of unmeasuredControls)''')
c=change(c,'    return {\n      userAgent: navigator.userAgent,','    diag("labels-complete", { labels: Object.keys(labels).length, fonts: Object.keys(fonts).length });\n    diag("before-return");\n    return {\n      userAgent: navigator.userAgent,')
c=change(c,'  }, { tolerance: TEXT_TOLERANCE });\n}','''  }, { tolerance: TEXT_TOLERANCE });
  return pending.then(value => { console.log("__LD_CAPTURE_HOST__", JSON.stringify({ phase: "evaluate-returned", epoch: Date.now() })); return value; }, error => { console.log("__LD_CAPTURE_HOST__", JSON.stringify({ phase: "evaluate-rejected", epoch: Date.now(), error: String(error) })); throw error; });
}''')
h=original[HIDDEN].decode()
start='test("the search pauses while the page is hidden and resumes when it is visible again", async ({ page }) => {'
h=change(h,start,start+'''
  page.on("console", message => { if (message.text().startsWith("__LD_VISIBILITY__")) console.log(message.text()); });''')
needle='''  await open(page);
  expect((await read(page)).status).toBe("running");'''
h=change(h,needle,'''  await open(page);
  await page.evaluate(() => {
    const map = document.querySelector<HTMLElement>("#map-container")!;
    let previous = "";
    const snapshot = (phase: string): void => {
      const root = map.querySelector<HTMLElement>(".local-placed");
      const data = { phase, epoch: performance.timeOrigin + performance.now(), visibility: document.visibilityState,
        camera: map.dataset.camera ?? "", moving: root?.dataset.moving ?? "", search: root?.dataset.searchStatus ?? "",
        tried: root?.dataset.searchTried, next: root?.dataset.searchNext, adopted: root?.dataset.searchAdopted,
        alignmentTried: root?.dataset.searchAlignmentTried, alignmentAdopted: root?.dataset.searchAlignmentAdopted,
        shown: root?.dataset.searchShown, best: root?.dataset.searchBest, cards: map.querySelectorAll(".node-card").length };
      const identity = JSON.stringify({ ...data, epoch: 0 });
      if (phase !== "mutation" || identity !== previous) console.log("__LD_VISIBILITY__", JSON.stringify(data));
      previous = identity;
    };
    (window as unknown as { __ldVisibilitySnapshot: typeof snapshot }).__ldVisibilitySnapshot = snapshot;
    new MutationObserver(() => snapshot("mutation")).observe(map, { subtree: true, attributes: true, attributeFilter: ["data-camera", "data-moving", "data-search-status", "data-search-tried", "data-search-next", "data-search-adopted", "data-search-alignment-tried", "data-search-alignment-adopted", "data-search-shown", "data-search-best"] });
    snapshot("after-open");
  });
  expect((await read(page)).status).toBe("running");''')
h=change(h,'    document.dispatchEvent(new Event("visibilitychange"));','''    document.dispatchEvent(new Event("visibilitychange"));
    const snapshot = (window as unknown as { __ldVisibilitySnapshot: (phase: string) => void }).__ldVisibilitySnapshot;
    snapshot(`dispatched-${value}`);
    if (value === "visible") setTimeout(() => snapshot("deadline-callback-actual-time"), 45_000);''')
h=change(h,'''  await setVisibility("visible");
  await localMapSettled(page, 45_000);
  expect((await read(page)).tried''','''  await setVisibility("visible");
  console.log("__LD_VISIBILITY_HOST__", JSON.stringify({ phase: "wait-issued", epoch: Date.now(), requestedDeadline: Date.now() + 45_000 }));
  try { await localMapSettled(page, 45_000); }
  finally {
    console.log("__LD_VISIBILITY_HOST__", JSON.stringify({ phase: "wait-ended", epoch: Date.now() }));
    await page.evaluate(() => (window as unknown as { __ldVisibilitySnapshot: (phase: string) => void }).__ldVisibilitySnapshot("wait-final-actual-time"));
  }
  expect((await read(page)).tried''')
try:
 for p,s in [(CAP,c),(HIDDEN,h)]:
  p.write_text(s)
  (OUT/(p.name+'.diagnostic.patch')).write_text(''.join(difflib.unified_diff(original[p].decode().splitlines(True),s.splitlines(True),fromfile=str(p),tofile=str(p)+'.diagnostic')))
 env=dict(os.environ,LIVE_DOCS_E2E_PORT='8911')
 cases=[('capture','tests/e2e/layout-lab.spec.ts','the layout lab reproduces the page to the pixel: repository, chain$'),('visibility','tests/e2e/local-map-hidden.spec.ts','the search pauses while the page is hidden and resumes when it is visible again$')]
 results=[]
 for label,spec,grep in cases:
  command=['node_modules/.bin/playwright','test','--config','tests/e2e/playwright.config.ts',spec,'--grep',grep,'--output',str(OUT/(label+'-results'))]
  before=time.time()
  with (OUT/(label+'.log')).open('w') as log:
   result=subprocess.run(command,cwd=ROOT,env=env,stdout=log,stderr=subprocess.STDOUT)
  results.append({'case':label,'command':command,'startedEpoch':before*1000,'duration':time.time()-before,'exitCode':result.returncode})
  print(label,result.returncode,flush=True)
 (OUT/'run-results.json').write_text(json.dumps(results,indent=2)+'\n')
finally:
 for p,b in original.items():p.write_bytes(b)
 (OUT/'restored-helper-sha256.json').write_text(json.dumps({str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in original},indent=2)+'\n')
 print('Exact helper bytes restored',flush=True)
