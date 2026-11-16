import { feed, moveCreature, spawnCreature } from "../src/creatures";
import { createRng } from "../src/rng";
import { tideAt } from "../src/tide";

describe("creatures", () => {
  it("leaves an anemone where it is", () => {
    const rng = createRng(5);
    const anemone = spawnCreature(rng, "anemone", 8, 8);
    const moved = moveCreature(anemone, tideAt(0), rng);
    expect([moved.x, moved.y]).toEqual([anemone.x, anemone.y]);
  });

  it("settles hunger when fed", () => {
    const rng = createRng(5);
    const crab = moveCreature(spawnCreature(rng, "crab", 8, 8), tideAt(0), rng);
    expect(feed(crab).hunger).toBe(0);
  });
});
