# Connections layout candidates

_Historical headless probe, October 24, 2026, for the owner's [Connections-only visual tuning request](../../../ChatHistory/2026/10/2026-10-24.1.record.md#turn-12). These are candidates for the root agent's visual review, not a claim that a metric measures beauty. The initial comparison changed no product source; a subsequent integration repair is recorded below._

## What was measured

The built `resistance/explorer-data.json` supplied 872 visible files and 2,037 counted file pairs: tests on, assets and documentation overlays off. The probe called the product's `explorerGraphOf`, `spatialGraphOf`, `easeSpatialLayout`, `spatialNodeRadius`, and `frameCameraSpheres` directly. Every run started from the library's deterministic seed. All nine Connections runs reached stillness with finite positions and no intersecting world-space spheres.

Projected node contacts were measured after fitting each arrangement independently into a 1,320 × 950 canvas, with a 50-degree perspective camera and the framing function's 70-pixel padding. Three horizontal bearings, 0, 0.75 and 1.5 radians, prevent one pleasing angle from deciding the result. Projected radii use each node's depth and the proposed resistance formula; these are circle-footprint estimates, not pixel captures, label measurements or visibility through intervening spheres. “Contacting nodes” counts each node once if its projected circle touches another. Close views, cursor picking and journeys remain for the root's browser review.

Common settings: `charge 60`, `collisionGap 5`, `nodeSize 4`, `symbolScale 1`, `chargeRange 0`, `updateEnergy 1`, `citedByPull 1`. The gap is 60 and coupling is 1 except where named. Width and resistance do not affect these force arrangements. The table's projected measurements use **node resistance 0.25** only as a common comparison point; it is not a recommendation established by this probe.

| Force settings (gravity / spring / tether) | Gap or coupling exception | Ticks to still | Median node diameter, px | Contacting nodes of 872 | Median edge length, world units |
| --- | --- | ---: | ---: | ---: | ---: |
| Current: .01 / .25 / .01 | — | 388 | 3.14–3.28 | 132–164 | 151.7 |
| Wider, stronger: .01 / .75 / .02 | — | 383 | 3.19–3.29 | 209–234 | 107.1 |
| Middle, moderate spring: .025 / .5 / .02 | — | 494 | 4.62–4.70 | 169–198 | 112.3 |
| Middle, stronger spring: .025 / .75 / .02 | — | 401 | 4.58–4.64 | 205–222 | 102.4 |
| Dense, stronger spring: .05 / 1 / .03 | — | 464 | 5.91–6.07 | 242–256 | 92.0 |
| Dense, original spring: .05 / .25 / .03 | — | 428 | 6.02–6.18 | 195–221 | 118.6 |
| Middle, wider gap: .025 / .75 / .02 | gap 100 | 399 | 4.63–4.77 | 171–193 | 128.2 |
| Middle, mild coupling: .025 / .75 / .02 | coupling .3 | 385 | 4.58–4.60 | 213–218 | 105.7 |
| Middle, strong coupling: .025 / .75 / .02 | coupling 2 | 364 | 4.60–4.69 | 209–226 | 100.2 |

The first important interaction is between forces and rendering: fitting the whole graph does not make fixed-radius spheres the same apparent size in every arrangement. At ordinary perspective, median node diameter rises from about 2.1 pixels at current forces to 3.5 at the middle candidates and 4.9 at the dense stronger-spring candidate. At node resistance 0.5 it is about 4.8, 6.2 and 7.3 pixels respectively. Force candidates therefore need their own node-size/resistance review, especially at zoomed-out scales.

Increasing the gap from 60 to 100 reduces projected contacts, but it also reduces the share of nonisolated nodes whose nearest world-space neighbour has a direct edge to them, from 64% to 57%. Those nearest neighbours are still within two graph hops in about 98% of cases. Stronger springs tighten stars whose leaves need not connect directly to one another; a higher nearest-edge percentage is not automatically the better functional cluster. Similarly, five-neighbour package agreement varies only from 80% to 82%; directories are a weak functional proxy and do not choose the winner.

## Candidate sets for the root to look at

Use the shared settings above, with these three force sets. Keep wire width and the two resistance values adjustable while comparing them.

1. **Middle, moderate spring:** `linkGap 60, coupling 1, gravity .025, linkStrength .5, tether .02`. The first candidate to inspect: a larger, more discernible node footprint than current forces, moderate projected contact, and the least movement over the tested filter journeys after accounting for the graph's size.
2. **Middle, wider gap:** `linkGap 100, coupling 1, gravity .025, linkStrength .75, tether .02`. A comparison for opening crowded local stars without enlarging the whole field substantially. Its weaker nearest-edge alignment is the tradeoff to inspect by following actual wires. Filter journeys were not measured for this set.
3. **Dense, stronger spring:** `linkGap 60, coupling 1, gravity .05, linkStrength 1, tether .03`. A useful upper comparison for pronounced constellations. The [October 22 visual probe](../../2026-10-22/3d-tuning/README.md) preferred the stronger-spring texture; these new measurements show why node size needs to come down, or resistance remain low, if the denser arrangement is chosen.

The wider `.01/.75/.02` arrangement is still worth a quick picture if the root finds the middle candidates too compressed. Its node contacts are already higher than the middle moderate-spring set despite the smaller apparent nodes, so it is not the most promising quantitative starting point.

## Navigation check

The existing `measureDrift` routine toggled all 241 test files off and back on twice, retaining the unchanged positions and placing returning nodes through the product's carry rule. Each row below is the mean displacement of the nodes that stayed, measured after a full off/on cycle. Dividing by the starting RMS radius avoids rewarding a candidate merely for being smaller in world units.

| Force set | Cycle-one move / starting RMS radius | Cycle-two move / starting RMS radius | Removal/restore settle ticks | Final RMS radius / start |
| --- | ---: | ---: | ---: | ---: |
| Current | 7.9% | 5.6% | 123–223 | .970 |
| Middle, moderate spring | 4.6% | 2.1% | 130–144 | .973 |
| Middle, stronger spring | 4.7% | 2.5% | 132–238 | .972 |
| Dense, stronger spring | 3.9% | 1.6% | 138–183 | .977 |

No candidate's field grew through these two cycles. This establishes a useful bounded comparison, not long-run drift immunity. The result does not establish the feel of motion: no browser was started by this delegated probe, and the root still needs to watch the transitions.

## Scope and cautions for implementation

The earlier probe found that `linkStrength 1` destabilizes this repository's **Structure** layout; its explicit integration can feel too much total stiffness at a many-leaf hub. The initial comparison did not fix that defect. Before promoting stronger shared springs, the root requested the review and repair recorded below. The user explicitly deferred Structure's visual tuning.

The older gravity recommendation also partly compensated for the old camera starting inside the graph. Today's framing removes that rationale. Choose gravity for the relationships and usable screen-space geometry, not for fitting the previous camera distance. Bounded repulsion was left at zero: the earlier probe found its middle range could prevent stillness, and that behaviour is not needed to compare these candidates.

This work did not change the graph, documentation lens, engine, generator, configuration or dependencies. It did not tune label density, draw browser screenshots, test the estate, step history, or select final width/resistance defaults. Those remain the root's visual work.

## Integration review and repair

After its first visual comparison, the root favored the middle `.025/.5/.02` force settings and requested a force-preserving repair of the degree-dependent instability before adopting stronger shared springs. The current graph confirmed the old finding: its 1,160-node Structure picture stayed finite at spring .25 and .5, but produced NaN at .75, 1 and 2. The old `easeSpatialLayout` then incorrectly reported `still: true`; `moveMax` ignored NaN comparisons, and the extent calculation could become infinite. All tested Connections values .25 through 2 stayed finite on this graph, which does not make a general bound on other graphs.

For one linear mode, Verlet requires `h² × strength × stiffness < 4`. A Structure hub's leaf springs each retain the full spring setting because every leaf has degree one. The field divides their forces equally between their two ends, so the largest eigenvalue of the linear spring part is bounded by the largest sum of incident spring strengths. Gravity and a held tether add their stiffness. That spring bound alone addresses the measured hub failure, but active collision and repulsion curvature can also be large at a crowded seed.

The implementation therefore accumulates the **local positive-curvature bound** during the existing pair-force pass, without another quadratic pass. Each active pair adds twice `charge / distance²` above one unit, plus twice the collision stiffness when inside its clearance, to its two endpoints' incident-stiffness sums. Capped repulsion below one unit has zero positive radial curvature. Negative transverse curvature cannot increase this upper bound. The bound also includes springs, gravity and an active tether.

Each outer tick still advances 0.5 time units. It uses smaller internal Verlet steps so that `h² × strength × localStiffness ≤ 2`, rechecks stiffness at each endpoint, and retries a candidate step if the new configuration needs a shorter one. Partial steps reserve five percent of their permitted time for smoothly increasing curvature; simply halving on every small increase caused needless repeated force evaluations. Drag uses each accepted step's actual duration. Fixed nodes remain fixed through every substep, and rejected steps change neither positions nor velocity. Stillness receives each sphere's total distance travelled over the accepted steps, so a stiff oscillation cannot appear motionless because its endpoint returns near its start.

The qualification “local” matters: active contacts can change inside a step, and a nonzero repulsion range is a hard force cutoff. This is not an unconditional global stability proof for every nonsmooth configuration. Non-finite supplied coordinates, anchors and velocities, non-finite force/stiffness arithmetic, and non-finite resulting travel or extent fail explicitly instead of being called still. The headless entry checks supplied values before D3 can treat NaN as a request for a replacement seed.

The final implementation was compared with the committed original physics, over the same graph and seeded positions. Gravity was .025 and tether .02 throughout. These are headless elapsed times on this devcontainer, excluding rendering; force-evaluation counts include rejected candidates and are the more portable cost measure.

| Layout / spring | Original outcome | Repaired outcome | Force evaluations per outer tick, mean / max | Median / p95 tick time, repaired |
| --- | --- | --- | ---: | ---: |
| Connections / .5 | Still, 494 ticks, 2.18 s | Still, 484 ticks, 2.78 s | 1.20 / 7 | 4.64 / 10.59 ms |
| Structure / .5 | Still, 423 ticks, 3.07 s | Still, 477 ticks, 12.11 s | 3.04 / 8 | 23.67 / 38.58 ms |
| Structure / 1 | Non-finite at tick 428 | Still, 418 ticks, 15.85 s | 3.06 / 9 | 37.33 / 46.12 ms |

The selected Connections case's original median tick was 4.21 ms. Its repaired first ten ticks used `7, 3, 2, 2, 2, 2, 2, 5, 2, 2` force evaluations; most later ticks use one. Structure's additional cost is material and must be checked in the browser, even though its visual tuning remains deferred. The root must re-view the final positions and motion because resolving the crowded seed more accurately changes the unfolding path.

The focused suite passed 47 Physics, Layout and layout-lab tests, including a 192-leaf star at spring .25 that settles at its original rest lengths, exact elapsed-time drag on a common translation, a collision entered midstep, fixed nodes, positive-curvature components, travel through a stiff oscillation, explicit non-finite failures, and bit-for-bit preservation of the original one-step arithmetic in a weak field. The existing energy-slope, energy-loss, conservation and easing assertions remain. The dated October 21 gravity-off counterexample keeps its original forces and thresholds beside separate compact-equilibrium assertions for today's defaults. Explorer TypeScript compilation passed. Browser acceptance and the full repository gate belong to the root's remaining work.
