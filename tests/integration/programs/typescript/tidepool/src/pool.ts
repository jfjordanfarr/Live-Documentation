import harbour from "../levels/harbour.json";
import rockpool from "../levels/rockpool.json";
import { feed, moveCreature, spawnCreature, type Creature, type Species } from "./creatures";
import type { Rng } from "./rng";
import { tideAt, type TideState } from "./tide";

/** A level as its JSON file describes it. */
export interface Level {
  name: string;
  width: number;
  height: number;
  creatures: Record<string, number>;
}

export const LEVELS: Record<string, Level> = { rockpool, harbour };

/** The pool and everything living in it. */
export class Pool {
  creatures: Creature[] = [];
  tide: TideState = tideAt(0);

  constructor(readonly level: Level, private readonly rng: Rng) {}

  add(species: Species): Creature {
    const creature = spawnCreature(this.rng, species, this.level.width, this.level.height);
    this.creatures.push(creature);
    return creature;
  }

  feedAt(x: number, y: number): number {
    let fed = 0;
    this.creatures = this.creatures.map((creature) => {
      if (Math.abs(creature.x - x) + Math.abs(creature.y - y) > 1) return creature;
      fed++;
      return feed(creature);
    });
    return fed;
  }

  step(minute: number): void {
    this.tide = tideAt(minute);
    this.creatures = this.creatures.map((creature) => moveCreature(creature, this.tide, this.rng));
  }
}

/** A pool stocked as its level asks. */
export function loadPool(name: string, rng: Rng): Pool {
  const level = LEVELS[name] ?? LEVELS.rockpool;
  const pool = new Pool(level, rng);
  for (const [species, count] of Object.entries(level.creatures)) {
    for (let i = 0; i < count; i++) pool.add(species as Species);
  }
  return pool;
}
