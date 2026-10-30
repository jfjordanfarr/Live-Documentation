import { expect, test, type Page } from "@playwright/test";

/**
 * The Tuning block at the size the remediation checklist names, 1280×800: every control explains itself on hover and to
 * a screen reader, with no sentence drawn on screen.
 */
test.use({ viewport: { width: 1280, height: 800 } });

const generator = "packages/generator/src/generator.ts";

/** Open Tuning the way a person does, from the map's toolbar. */
async function openTuning(page: Page): Promise<void> {
  await page.getByRole("button", { name: /^Layout tuning/ }).click();
  await expect(page.locator(".sidebar-details")).toHaveAttribute("open", "");
}

test("every tuning control explains what changing it does, as its tooltip and its description", async ({ page }) => {
  await page.goto(`/?view=local&node=${generator}`);
  await page.locator(".local-placed").waitFor();
  await openTuning(page);
  const controls = page.locator(".tuning-content input[type=range], .tuning-content select");
  await expect(controls).toHaveCount(43);
  const facts = await controls.evaluateAll(elements => elements.map(element => {
    const describedBy = element.getAttribute("aria-describedby") ?? "";
    const description = document.getElementById(describedBy);
    const label = element.closest("label");
    return {
      id: element.id,
      title: element.getAttribute("title") ?? "",
      labelTitle: label?.getAttribute("title") ?? "",
      description: description?.textContent ?? null,
      descriptionInsideLabel: description !== null && label !== null && label.contains(description),
      descriptionBox: description ? description.getBoundingClientRect().width * description.getBoundingClientRect().height : null
    };
  }));
  for (const fact of facts) {
    expect(fact.title, fact.id).not.toBe("");
    expect(fact.description, fact.id).toBe(fact.title);
    expect(fact.labelTitle, fact.id).toBe(fact.title);
    // Outside the label, so the sentence describes the control without joining its name; drawn nowhere.
    expect(fact.descriptionInsideLabel, fact.id).toBe(false);
    expect(fact.descriptionBox, fact.id).toBeLessThanOrEqual(1);
  }
  // The accessibility tree agrees: a control's name is its label, its description the sentence. In 2D the 2D group is open.
  const sentence = (id: string): string => facts.find(fact => fact.id === id)!.title;
  await expect(page.getByRole("slider", { name: /^Column Gap/ })).toHaveAccessibleDescription(sentence("tuning-column-gap"));
  await expect(page.getByRole("slider", { name: /^Column Gap/ })).toHaveAccessibleName(/^Column Gap\b/);
  await expect(page.getByRole("combobox", { name: /^Symbol Order/ })).toHaveAccessibleDescription(sentence("tuning-symbol-order"));
});

/** The 3D layout's three groups, each named by one word, with the levers in the order a person reaches for them. */
const SPATIAL_GROUPS = {
  Forces: ["tuning-force-charge", "tuning-force-link-strength", "tuning-force-gravity", "tuning-force-tether", "tuning-force-cited-by-pull",
    "tuning-force-charge-range", "tuning-force-update-energy", "tuning-force-approximation"],
  Spacing: ["tuning-force-link-gap", "tuning-force-coupling", "tuning-force-collision-gap"],
  Appearance: ["tuning-force-node-size", "tuning-force-symbol-scale", "tuning-force-link-width", "tuning-force-node-zoom-resistance",
    "tuning-force-wire-zoom-resistance"]
};

test("the 3D levers stand in forces, spacing and appearance, and a lever still moves its readout", async ({ page }) => {
  await page.goto("/samples/estate/?view=local&mode=3d&node=Portal/Services/GatewayClient.cs");
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25000 });
  await openTuning(page);
  const spatial = page.locator('details[data-tuning-perspective="3d"]').filter({ has: page.locator(":scope > summary", { hasText: "3D Layout" }) });
  await expect(spatial).toHaveAttribute("open", "");
  const groups = spatial.locator(":scope > details.tuning-subsection");
  await expect(groups.locator(":scope > summary")).toHaveText(Object.keys(SPATIAL_GROUPS));
  for (const [name, ids] of Object.entries(SPATIAL_GROUPS)) {
    const group = groups.filter({ has: page.locator(":scope > summary", { hasText: name }) });
    await expect(group).toHaveAttribute("open", "");
    expect(await group.locator("input[type=range]").evaluateAll(inputs => inputs.map(input => input.id)), name).toEqual(ids);
  }
  // Every 3D lever is in one of the three groups, and none is left beside them.
  await expect(spatial.locator("input[type=range]")).toHaveCount(Object.values(SPATIAL_GROUPS).flat().length);
  await expect(spatial.locator(":scope > label")).toHaveCount(0);

  const gravity = page.getByRole("slider", { name: /^Gravity/ });
  await expect(gravity).toBeVisible();
  await expect(gravity).toHaveAccessibleDescription(/drawn to the centre/);
  await gravity.focus();
  await page.keyboard.press("ArrowRight");
  await expect(gravity).toHaveValue("0.03");
  await expect(page.locator("#tuning-force-gravity-value")).toHaveText("0.03");
});

test("the legend stands before Tuning, and Export reads at the panel's type size", async ({ page }) => {
  await page.goto(`/?view=local&node=${generator}`);
  await page.locator(".local-placed").waitFor();
  await openTuning(page);
  await expect(page.locator("#local-legend")).toBeVisible();
  const order = await page.locator("#map-legend").evaluate(legend =>
    legend.compareDocumentPosition(document.querySelector(".sidebar-details")!) & Node.DOCUMENT_POSITION_FOLLOWING);
  expect(order, "Tuning follows the legend").toBeTruthy();
  const exportButton = page.getByRole("button", { name: "Export layout settings", exact: true });
  await exportButton.scrollIntoViewIfNeeded();
  await expect(exportButton).toBeVisible();
  const sizes = await page.evaluate(() => ({
    label: getComputedStyle(document.querySelector(".tuning-slider span")!).fontSize,
    select: getComputedStyle(document.querySelector(".tuning-slider select")!).fontSize,
    exportButton: getComputedStyle(document.getElementById("export-layout-settings")!).fontSize
  }));
  expect(sizes.exportButton).toBe(sizes.label);
  expect(sizes.select).toBe(sizes.label);
});
