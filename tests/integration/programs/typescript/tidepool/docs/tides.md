# The tide

The water rises and falls on a cosine over [`TIDE_PERIOD`](../src/tide.ts) minutes, starting at high water. The player can feed only at low water, below a fifth of the way up ([isLowWater](../src/tide.ts)), which is what makes the game a matter of timing: [Game.apply](../src/game.ts) refuses to feed otherwise.

The tide also sets how far each creature wanders ([moveCreature](../src/creatures.ts)) and how loud the surf and the gulls are ([mixer.ts](../src/audio/mixer.ts)).

The tests that pin this down are in [tide.test.ts](../tests/tide.test.ts).
