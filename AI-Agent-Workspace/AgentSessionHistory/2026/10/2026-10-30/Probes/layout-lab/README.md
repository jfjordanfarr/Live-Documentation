# October 30, 2026 — the order step's starts on today's docs

Run by the root agent with `npm run layout:lab -- restarts <scope>` over captures of the page built from today's docs (`a9612c85` plus the labels pass in progress), after the day's gate failed `tests/e2e/local-map-search.spec.ts:44` on this repository's five-file scope: the search adopted a boundary alignment of the ranking's own picture and no seed beat it, where the spec's premise, measured on October 6 and 8, said a seeded start beats the ranking's bare order there. Two hybrid bundles, today's page code over the morning's docs and the morning's code over today's docs, had shown the failure follows the docs, not the code.

- [repository, five files](repository-five-files-restarts.md): the ranking's order is within 1.2 % of the shortest start (seed 5), the full score prefers seed 3, and the simulated search moves nowhere at any churn cost. The premise no longer holds here.
- [repository, chain](repository-chain-restarts.md): the ranking's order is the shortest by far; seed 3 wins only through fewer crossings, at churn costs up to 200.
- [estate, five files](estate-five-files-restarts.md): seed 3 and seed 5 are 11 % shorter than the ranking's order with no pairs swapped, so the search adopts at any churn cost; the premise holds strongly on the sample, whose docs do not change with this repository's code.
- [estate, chain](estate-chain-restarts.md): seed 8 is 5.8 % shorter with two pairs swapped and wins at every churn cost tried.

The captures are rebuilt on demand and not kept.
