# The creatures

Four species live in the pool, each with its own speed in [creatures.ts](../src/creatures.ts): anemones stay put, starfish creep, crabs scuttle and shrimp dart. Each grows hungrier every minute and is settled by feeding.

A level's JSON file says how many of each to start with: [the rock pool](../levels/rockpool.json) and [the harbour wall](../levels/harbour.json). Each species has a cell on [the sprite sheet](../src/render/sheet.png), in the order [sprites.ts](../src/render/sprites.ts) keeps.

Points are counted in [score.ts](../src/score.ts): ten for every creature, less its hunger.
