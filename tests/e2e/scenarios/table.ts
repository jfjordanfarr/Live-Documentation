/**
 * The scenario table: the first scenarios of the still-picture suite, written once in tokens and run over every
 * Rosetta program by swapping the token table (`tokens.ts`).
 *
 * A scenario is a map and an address, here an address template whose `{part}` tokens the harness resolves against
 * the map, a frame size, a floor that keeps the laws from passing on an empty page, and the relations and oracle
 * facts it is judged by beyond the laws, which every scenario is judged by. `replaces` names the cases of today's
 * suite whose still-picture promises the scenario carries, for the ledger; a case named there is not deleted by this
 * slice.
 */

import type { Floor } from "./judgments";

export interface Scenario {
  name: string;
  /**
   * What the address shows: a file in focus, files retained whole with the first as the subject, a directory opened
   * with nothing chosen, or the program's root with nothing chosen.
   */
  address:
    | { focus: string }
    | { retain: string[] }
    | { directory: string }
    | { root: true };
  viewport: { width: number; height: number };
  /** Presses of Zoom Out before reading, each awaited at rest: the camera's zoom is not in the address. */
  zoomOut?: number;
  /** The floor, in tokens. */
  floor: Floor;
  /** Load the address again and expect the same reading. */
  reload: boolean;
  /** Judge the wires at this file, a token, against the program's compiler edges. */
  oracleAt?: string;
  replaces: string[];
}

export const SCENARIOS: Scenario[] = [
  {
    name: "the processor in focus",
    address: { focus: "{processor}" },
    viewport: { width: 1600, height: 1000 },
    floor: { subject: "{processor}", drawn: ["{main}", "{helpers}"], minCards: 3, minWires: 2 },
    reload: true,
    oracleAt: "{processor}",
    replaces: ["still-picture.spec.ts:334", "local-map-tone.spec.ts:55", "local-map-tone.spec.ts:82"]
  },
  {
    name: "the processor in focus, three presses out",
    address: { focus: "{processor}" },
    viewport: { width: 1600, height: 1000 },
    zoomOut: 3,
    floor: { subject: "{processor}", minCards: 3, minWires: 2 },
    reload: false,
    replaces: []
  },
  {
    name: "the whole program retained",
    address: { retain: ["{main}", "{processor}", "{models*}", "{types*}", "{helpers}"] },
    viewport: { width: 1600, height: 1000 },
    // main uses models past processor's column, so the map must reserve a lane: the lanes' law is then never idle.
    floor: { subject: "{main}", pinned: ["{main}", "{processor}", "{models}", "{types}", "{helpers}"], minCards: 5, minWires: 5, lanes: true },
    reload: false,
    replaces: ["local-map-branches.spec.ts:276", "local-map-branches.spec.ts:362", "still-picture.spec.ts:378"]
  },
  {
    name: "a part's own directory opened, nothing chosen",
    address: { directory: "{models/}" },
    viewport: { width: 1440, height: 900 },
    floor: { drawn: ["{models}"], minCards: 1 },
    reload: false,
    replaces: ["local-map-framing.spec.ts:46", "local-map-tone.spec.ts:123"]
  },
  {
    name: "the program's root, nothing chosen",
    address: { root: true },
    viewport: { width: 1280, height: 800 },
    floor: { picture: true },
    reload: false,
    replaces: ["local-map-framing.spec.ts:101"]
  }
];
