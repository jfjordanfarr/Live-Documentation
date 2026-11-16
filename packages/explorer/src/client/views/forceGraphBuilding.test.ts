import { describe, expect, it } from "vitest";

import { BUILDING_HOLD, BUILDING_SIGN_DELAY, buildingPhase, nextBuilding, nodePointer, NOT_BUILDING, type Building, type BuildingWork } from "./forceGraphBuilding";

const WORK: BuildingWork = { work: true, flight: false }, FLIGHT: BuildingWork = { work: false, flight: true }, NONE: BuildingWork = { work: false, flight: false };

/** Follow the map's work frame by frame from rest: each step is the work seen and the time it was seen. */
function frames(steps: ReadonlyArray<[BuildingWork, number]>, from: Building = NOT_BUILDING): Building[] {
  const seen: Building[] = [];
  let building = from;
  for (const [work, now] of steps) seen.push(building = nextBuilding(building, work, now));
  return seen;
}

describe("a building", () => {
  it("begins with the work and keeps the time it began while the work goes on", () => {
    expect(frames([[WORK, 100], [WORK, 116], [WORK, 132]])).toEqual([{ since: 100, quietSince: null }, { since: 100, quietSince: null }, { since: 100, quietSince: null }]);
  });

  it("ends only once the work has stopped for the hold, so that a short lull between packing and the reveal is one building", () => {
    const [, lull, resumed, quiet, held, ended] = frames([[WORK, 0], [NONE, 50], [WORK, 50 + BUILDING_HOLD - 1], [NONE, 400], [NONE, 400 + BUILDING_HOLD - 1], [NONE, 400 + BUILDING_HOLD]]);
    expect(lull).toEqual({ since: 0, quietSince: 50 });
    expect(resumed, "the work came back within the hold: the same building").toEqual({ since: 0, quietSince: null });
    expect(quiet).toEqual({ since: 0, quietSince: 400 });
    expect(held).toEqual({ since: 0, quietSince: 400 });
    expect(ended).toBe(NOT_BUILDING);
  });

  it("continues through the camera's framing flight, which never begins one", () => {
    expect(frames([[FLIGHT, 0], [FLIGHT, 16]])).toEqual([NOT_BUILDING, NOT_BUILDING]);
    const [, flying, landed, ended] = frames([[WORK, 0], [FLIGHT, 100], [NONE, 650], [NONE, 650 + BUILDING_HOLD]]);
    expect(flying).toEqual({ since: 0, quietSince: null });
    expect(landed).toEqual({ since: 0, quietSince: 650 });
    expect(ended).toBe(NOT_BUILDING);
  });

  it("returns the very building it holds when nothing changes, so the view sees nothing to apply", () => {
    const building: Building = { since: 5, quietSince: null }, quiet: Building = { since: 5, quietSince: 10 };
    expect(nextBuilding(building, WORK, 20)).toBe(building);
    expect(nextBuilding(quiet, NONE, 20)).toBe(quiet);
    expect(nextBuilding(NOT_BUILDING, NONE, 20)).toBe(NOT_BUILDING);
  });
});

describe("the sign of a building", () => {
  it("waits for the building to have lasted its delay, so that a quick update does not flash it", () => {
    const building: Building = { since: 1000, quietSince: null };
    expect(buildingPhase(NOT_BUILDING, 1000)).toBe("idle");
    expect(buildingPhase(building, 1000)).toBe("begun");
    expect(buildingPhase(building, 1000 + BUILDING_SIGN_DELAY - 1)).toBe("begun");
    expect(buildingPhase(building, 1000 + BUILDING_SIGN_DELAY)).toBe("shown");
    expect(buildingPhase({ since: 1000, quietSince: 1400 }, 1500), "shown through the hold").toBe("shown");
  });
});

describe("what a pointer may begin on a node", () => {
  it("while the map builds: nothing, moved or not", () => {
    expect(nodePointer({ building: true, movedSinceBuilding: false })).toEqual({ hover: false, press: false });
    expect(nodePointer({ building: true, movedSinceBuilding: true })).toEqual({ hover: false, press: false });
  });

  it("after it: a press always, and a hover only once the pointer has moved since building began", () => {
    expect(nodePointer({ building: false, movedSinceBuilding: false })).toEqual({ hover: false, press: true });
    expect(nodePointer({ building: false, movedSinceBuilding: true })).toEqual({ hover: true, press: true });
  });
});
