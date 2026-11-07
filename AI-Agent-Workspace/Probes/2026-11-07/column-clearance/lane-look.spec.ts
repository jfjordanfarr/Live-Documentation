import { test } from "@playwright/test";
import { LOCAL_MAP, dragBy, localRetainUrl, localMapSettled } from "../still-picture";
import { CHAIN_REPOSITORY } from "../scopes";

test("lane look", async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto(localRetainUrl("/", CHAIN_REPOSITORY));
  await page.waitForSelector("#map-container .branch-mode", { timeout: 20_000 });
  await page.waitForSelector("#map-connections .connection-path:not(.bundle-run)", { state: "attached", timeout: 10_000 });
  await page.waitForTimeout(900);
  await page.evaluate(() => { const el = [...document.querySelectorAll<HTMLElement>("#map-container .local-pass-through")].find(el => el.dataset.lane === "5\0scripts/layout-lab\0after:"); if (el) el.id = "probe-lane"; });
  const lane = page.locator("#probe-lane");
  const box = (await lane.boundingBox())!;
  const frame = (await page.locator("#view-map").boundingBox())!;
  // Bring the lane's right end to the frame's centre, in steps the drag helper can make inside the frame.
  let dx = frame.x + frame.width / 2 - (box.x + box.width), dy = frame.y + frame.height / 2 - box.y;
  while (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
    const step = await dragBy(page, LOCAL_MAP, Math.max(-500, Math.min(500, dx)), Math.max(-300, Math.min(300, dy)));
    dx -= step.dx; dy -= step.dy;
    if (step.dx === 0 && step.dy === 0) break;
  }
  await localMapSettled(page);
  await page.screenshot({ path: process.env.SHOT!, fullPage: false });
  const geometry = await page.evaluate(() => {
    const lane = document.querySelector<HTMLElement>("#probe-lane")!;
    const r = lane.getBoundingClientRect();
    const membrane = document.querySelector<SVGGeometryElement>('#map-container .local-membrane-shape[data-directory="scripts/layout-lab"]')!;
    const m = membrane.getBoundingClientRect();
    const wires = [...document.querySelectorAll<SVGGeometryElement>("#map-connections .connection-path")].filter(el => (el.dataset.edge ?? el.getAttribute("data-key") ?? "").includes("history-scrubber.spec.ts")).map(el => ({ attrs: Object.fromEntries([...el.attributes].filter(a => a.name !== "d" && a.name !== "style").map(a => [a.name, a.value.slice(0, 120)])), d: (el.getAttribute("d") ?? "").slice(0, 300) }));
    return { lane: [r.left, r.top, r.width, r.height], membrane: [m.left, m.top, m.width, m.height], wires };
  });
  console.log(JSON.stringify(geometry, null, 1));
});
