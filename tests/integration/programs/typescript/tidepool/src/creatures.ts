import { between, type Rng } from "./rng";
import type { TideState } from "./tide";

export type Species = "crab" | "anemone" | "shrimp" | "starfish";

export interface Creature {
  id: number;
  species: Species;
  x: number;
  y: number;
  hunger: number;
}

const SPEEDS: Record<Species, number> = { crab: 2, anemone: 0, shrimp: 3, starfish: 1 };

let nextId = 1;

/** A new creature somewhere in a pool of the given size. */
export function spawnCreature(rng: Rng, species: Species, width: number, height: number): Creature {
  return { id: nextId++, species, x: between(rng, 0, width - 1), y: between(rng, 0, height - 1), hunger: 0 };
}

/** One minute of a creature's life: it wanders more when the tide covers it, and grows hungrier. */
export function moveCreature(creature: Creature, tide: TideState, rng: Rng): Creature {
  const reach = Math.round(SPEEDS[creature.species] * tide.level);
  return {
    ...creature,
    x: creature.x + between(rng, -reach, reach),
    y: creature.y + between(rng, -reach, reach),
    hunger: Math.min(10, creature.hunger + 1)
  };
}

/** Feeding settles a creature's hunger. */
export function feed(creature: Creature): Creature {
  return { ...creature, hunger: 0 };
}
