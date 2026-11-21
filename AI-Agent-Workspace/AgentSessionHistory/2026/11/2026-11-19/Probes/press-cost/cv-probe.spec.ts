import { test } from "@playwright/test";

/** How the 2D map's content-visibility runs on a load straight into it, and on leaving it for the World Map (2026-11-20). */
test("cv probe", async ({ page }) => {
  await page.addInitScript(() => {
    const log: string[] = [];
    (window as unknown as { cvLog: string[] }).cvLog = log;
    const start = performance.now();
    const tick = (): void => {
      const map = document.getElementById("view-map");
      if (map) {
        const style = getComputedStyle(map);
        const entry = `${Math.round(performance.now() - start)} ${map.className} cv=${style.contentVisibility} op=${Number(style.opacity).toFixed(2)} inert=${map.inert}`;
        if (log.at(-1)?.split(" ").slice(1).join(" ") !== entry.split(" ").slice(1).join(" ")) log.push(entry);
      }
      if (performance.now() - start < 9000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.goto(`/?view=membrane&node=packages/explorer/src/client/index.ts`);
  await page.waitForTimeout(5000);
  await page.getByRole("button", { name: "World Map", exact: true }).click();
  await page.waitForTimeout(3000);
  console.log(`CV\n${(await page.evaluate(() => (window as unknown as { cvLog: string[] }).cvLog)).join("\n")}`);
});
