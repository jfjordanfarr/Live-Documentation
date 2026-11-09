test("native symbol wires gather by file pair and directory shells reverse their containment order", async ({ page }) => {
  await page.goto("/?view=local&node=scripts/slopcop/symbolReferences.ts");
  const card = (name: string) => page.locator(`#map-container .node-card[data-id="scripts/slopcop/${name}"]`);
  await card("symbolReferences.ts").getByRole("button", { name: "Pin symbolReferences.ts", exact: true }).click();
  await card("check-symbols.ts").getByRole("button", { name: "Pin check-symbols.ts", exact: true }).click();
  await localMapSettled(page);
  await page.mouse.move(1500, 950);
  await expect(page.locator('#map-container .local-directory-band[data-directory=""]')).toBeVisible();
  const nativeWires = await page.locator("#map-connections .connection-path").count();
  expect(nativeWires).toBeGreaterThan(10);
  for (const button of ["3D", "2D"]) {
    // The sampler stands before the click and records every frame from the layer's first to its last: installed after
    // four round trips to a page busy drawing the transition, it could miss the fold window entirely (2026-11-05).
    const recording = page.evaluate(async () => {
      const samples: Array<{ fold: number; root: number; children: number[] }> = [];
      let wires = 0, pairs = 0;
      await new Promise<void>(resolve => {
        let seen = false;
        const sample = (): void => {
          const layer = document.querySelector<HTMLElement>(".perspective-transition[data-graph-files]");
          if (!layer) { if (seen) resolve(); else requestAnimationFrame(sample); return; }
          seen = true;
          wires = Number(layer.dataset.symbolWires);
          pairs = Number(layer.dataset.filePairs);
          const root = layer.querySelector<HTMLElement>('[data-transition-directory=""]')!;
          const children = [...layer.querySelectorAll<HTMLElement>('[data-depth="1"]')];
          samples.push({ fold: Number(layer.dataset.wireFold), root: Number(root.style.opacity), children: children.map(child => Number(child.style.opacity)) });
          requestAnimationFrame(sample);
        }; requestAnimationFrame(sample);
      });
      return { samples, wires, pairs };
    });
    await page.getByRole("button", { name: button, exact: true }).click();
    const { samples: frames, wires, pairs } = await recording;
    expect(wires).toBe(nativeWires);
    expect(pairs).toBeGreaterThan(1);
    expect(pairs).toBeLessThan(nativeWires);
    expect(frames.length).toBeGreaterThan(5);
    expect(frames.some(frame => frame.fold > 0 && frame.fold < 1)).toBe(true);
    expect(frames.every(frame => frame.children.length === 2 && frame.children.every(child => child >= frame.root))).toBe(true);
    if (button === "2D") {
      expect(frames.some(frame => frame.root === 0 && frame.children.some(child => child > 0))).toBe(true);
    }
  }
  await expect(card("symbolReferences.ts").locator('.symbol-row[data-symbol="SymbolIssueKind"]')).toHaveClass(/symbol-pinned/);
  expect(await page.locator("#map-connections .connection-path").count()).toBe(nativeWires);
});
