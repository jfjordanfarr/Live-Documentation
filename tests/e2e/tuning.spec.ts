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
  // Card Text, Slot Lines, Text Resistance, Name Growth and Control Resistance joined the 2D layout group on 2026-11-05
  // (the card composition comparison and its ladder); Group Wrappers and then Shell Depth joined the 3D layout group the
  // same day. Zoom Looks joined the 2D layout group on 2026-11-10 (the trial of three looks beside the card ladder), and
  // Opened Directory on 2026-11-12 (the trial of an opened directory in flow order beside the grid), and Width Cost on
  // 2026-11-13 (beside Height Cost, so that the price can choose how an opened directory stands), and Closed Directory
  // the same day (the trial of three looks for a closed directory beside the box), and Zoomed Out Fully the same day
  // (the trial of the overview look drawn as files only). Skin's Shape and Cells' Colour joined it on 2026-11-15 (the
  // skin with cells as a closed directory's default look, in three shapes and two colourings), and Descriptions Zoomed
  // Out the same day (a description's first line kept in the connections look, in three forms beside hidden). Return
  // Cost joined it on 2026-11-16 (the continuing search's price of a reference read backward through a cycle). Palette
  // joined on 2026-11-17 in a group of its own, Colour (the proposed palette of meanings beside today's), and Marbles
  // beside it the same day (the trial of a file drawn as glass of its kind, veined by what it offers and uses). Hidden
  // Files joined the 2D layout group the same day (the trial of cells in place of a drawn directory's "+2 files"), and Beyond
  // the Hops the 3D layout group on 2026-11-18 (the trial of the next step past the hops beside everything), and
  // Arrival the 2D layout group on 2026-11-19 (how the camera meets a new subject).
  await expect(controls).toHaveCount(70);
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

/** The 3D layout's four groups, each named by one word, with the levers in the order a person reaches for them; Discovery since 2026-10-31. */
const SPATIAL_GROUPS = {
  Discovery: ["tuning-force-hops", "tuning-force-shell-depth", "tuning-force-reveal-frames"],
  Forces: ["tuning-force-charge", "tuning-force-link-strength", "tuning-force-gravity", "tuning-force-component-separation", "tuning-force-tether", "tuning-force-cited-by-pull",
    "tuning-force-charge-range", "tuning-force-update-energy", "tuning-force-approximation"],
  Spacing: ["tuning-force-link-gap", "tuning-force-coupling", "tuning-force-collision-gap"],
  Appearance: ["tuning-force-node-size", "tuning-force-symbol-scale", "tuning-force-link-width", "tuning-force-node-zoom-resistance",
    "tuning-force-name-at", "tuning-force-wire-zoom-resistance"]
};

test("the 3D levers stand in discovery, forces, spacing and appearance, and a lever still moves its readout", async ({ page }) => {
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
  // Every 3D lever is in one of the four groups, and none is left beside them.
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

/**
 * The marble's code is compiled into the 3D map's shaders only while marbles are drawn (2026-11-17), so that the choice
 * off costs a frame nothing; each choice then builds the spheres' programs again. Both must compile, and the picture
 * must change with the choice: a program that does not compile is said on the page's console and draws nothing.
 */
test("marbles on and off each compile, and the 3D picture changes with the choice", async ({ page }) => {
  const said: string[] = [];
  page.on("pageerror", error => said.push(String(error)));
  page.on("console", message => { if (message.type() === "error" || /shader|program/i.test(message.text())) said.push(message.text().slice(0, 300)); });
  await page.goto("/samples/estate/?view=local&mode=3d&node=Portal/Services/GatewayClient.cs");
  await expect(page.locator("#graph-svg")).toHaveAttribute("aria-busy", "false", { timeout: 25000 });
  await openTuning(page);
  await page.locator(".sidebar-details summary", { hasText: /^Colour$/ }).click();
  const marbles = page.locator("#tuning-marbles");
  // Off is the default again since 2026-11-19 (on was on 2026-11-18 and 19), so the picture opens plain and the case
  // turns the marbles on and off again.
  await expect(marbles).toHaveValue("off");
  // The pointer parked off the picture, and a moment for the frame the choice asks for.
  const drawn = async (): Promise<Buffer> => { await page.mouse.move(640, 30); await page.waitForTimeout(800); return page.locator("#graph-svg canvas").first().screenshot(); };
  const plain = await drawn();
  await marbles.selectOption("on");
  const marbled = await drawn();
  expect(marbled.equals(plain), "the spheres are drawn as marbles").toBe(false);
  await marbles.selectOption("off");
  const plainAgain = await drawn();
  expect(plainAgain.equals(marbled), "and as plain spheres again").toBe(false);
  expect(said, "neither choice's programs fail to compile").toEqual([]);
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
