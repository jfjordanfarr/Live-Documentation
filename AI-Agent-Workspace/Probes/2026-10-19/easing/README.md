# Continuous 3D easing: force comparisons

_Historical experiment begun October 19, 2026; still in progress. This records a probe, not a chosen production design. The owner authorized continuous easing in [the weekend chat](../../../ChatHistory/2026/10/2026-10-17.1.record.md#turn-10) and revised-force experiments in [today's Turn 4](../../../ChatHistory/2026/10/2026-10-19.1.record.md#turn-4)._

## Question and controlled comparisons

The current update gives the forces a share of alpha and then cools on a fixed schedule. Holding that share steady removes the schedule but does not make the existing force model reach rest. The first question is whether the force rules themselves introduce movement, before selecting a motion-based stopping criterion.

The disposable page uses the shipped graph projection, symbol-based sphere sizes, link rest lengths, coupling weights and Three force-graph renderer. Every model starts from the same 300-tick cold layout for its subject, layout and tuning. The estate Structure case has 53 spheres. Its gravity is 0.01 and spring strength 0.25, the owner's current defaults. Reference links do not pull or draw in this structure comparison. The four models are:

1. Shipped update: alpha share 0.1, decay 0.0228, velocity decay 0.4, stopping at effective alpha 0.001.
2. Existing forces with constant alpha 1 and velocity decay 0.8.
3. Central springs at current positions, with each spring impulse divided equally between its endpoints; existing Barnes–Hut repulsion, constant alpha 1 and velocity decay 0.8.
4. Those central springs with exact symmetric repulsion, one contribution per pair, the same nominal charge and distance bounds; constant alpha 1 and velocity decay 0.8.

The changes between models include both the force rule and damping; the page lets damping be varied separately. They are complete candidate behaviors, not a claim that one isolated variable explains every difference. Equal reactions and current-position spring directions were isolated separately in the headless diagnostic below. The exact pair sum is not equivalent to the default approximation and changes the large graph's shape.

## Pictures and recording

The root built the page and inspected all four pictures, captured with the installed Playwright Chromium at 1600×1000. The common initial pose is computed by the existing layout. After each candidate reaches 300 rendered ticks, the capture explicitly pauses it and fits the camera. A pause at 300 is a comparison point, **not** a claim that the candidate settled. The shipped model stops itself at 200 update ticks. The camera is refitted for each still, so these are comparisons of composition rather than absolute extent; the motion readout is in world units. The recording shows the switches and intervening movement at the actual browser cadence, with no simulated clock.

- [Shipped cooling](estate-structure-shipped.png): stops after 200 update ticks, RMS move about 0.001 world units on its last displayed tick.
- [Existing forces held steady](estate-structure-constant-300.png): RMS move 0.101 at 300 ticks.
- [Balanced springs](estate-structure-balanced-300.png): RMS move 0.092 at 300 ticks.
- [Balanced springs and exact repulsion](estate-structure-exact-300.png): RMS move 0.113 at 300 ticks.
- [The browser recording](estate-structure-comparison.webm).

The root's initial visual reading was that the estate's recognizable branch structure survived these changes, with fewer conspicuous overlaps in the balanced comparisons. The owner's subsequent [Turn 8 review](../../../ChatHistory/2026/10/2026-10-19.1.record.md#turn-8) rejected all four candidates: Existing, constant had the best early movement and shape, but continued to drift, with only modest settling after 2,000 ticks. That behavior is the reference for further experiments, not a chosen production default. A still does not establish convergence or orientation through a history jump.

The page is served temporarily at `http://localhost:8900/probes/easing/`. Its source and bundle are disposable and are not committed. The production Explorer has not changed in this experiment.

## Headless diagnostic

The root's initial constant-share experiment used the same current forces after the current 300-tick cold layout. At share 0.1, the estate still moved RMS 0.0322 / maximum 0.0567 world units per tick at tick 3,000. This repository's 1,120-node structure picture still moved RMS 0.1393 / maximum 0.3764. Exact repulsion at share 1 did not eliminate estate movement: RMS 0.0453 / maximum 0.1055 at tick 3,000.

A delegated numerical diagnostic, reviewed by the root, then isolated the spring rules under exact repulsion. D3's spring divides the reaction by endpoint degree and computes its direction from predicted positions, including velocity. The degree bias creates unequal reactions; the predicted direction can leave a torque even after the reaction is made equal.

| Estate Structure, same cold start and nominal force parameters | Ticks | RMS movement per tick | Observation |
| --- | ---: | ---: | --- |
| Existing biased springs, exact repulsion, velocity decay 0.4 | 20,000 | 0.0728 | Still moving; centroid motion is tiny, so this is not simple translation |
| Equal reactions, predicted positions, exact repulsion, decay 0.4 | 20,000 | 0.00887 | Less motion, but not rest |
| Equal reactions, predicted positions, exact repulsion, decay 0.8 | 40,000 | 0.00163 | Persistent spin estimate about 2.5×10⁻⁶ radians/tick |
| Equal reactions, current positions, exact repulsion, decay 0.8 | 40,000 | 0.000347 | Spin at floating-point noise; remaining shape relaxation still declining |

Removing collision produced identical trajectories in these estate controls, so collision was inactive there and does not explain their movement. This does not establish that collision is harmless in every scene. A stronger damper reduces visible movement without proving equilibrium: the first-tick RMS move fell fourfold between velocity decay 0.8 and 0.95 while the underlying force residual stayed the same. A stop condition must account for that distinction.

The exact pair loop and D3's exact mode agreed numerically on the measured initial repository trajectories. At 1,120 nodes, the direct pair implementation took about 21 ms/tick, D3's exact tree traversal about 250 ms/tick, and the default approximation about 27 ms/tick on this dev box. These are headless measurements, not browser frame rates or a claim about larger graphs; exact pairs have quadratic cost. The direct force also expands the large graph more than the approximation at the same nominal charge. Both repository layouts remained visibly active after 1,000 candidate ticks.

## A fifth candidate: force-driven relaxation

After the owner's rejection of the first four candidates, the next probe keeps the current-position symmetric springs and exact pair repulsion, expresses the field as an energy, and uses FIRE to approach a stationary point. The method follows [Bitzek et al., Structural Relaxation Made Simple (2006)](https://www.math.uni-bielefeld.de/~gaehler/papers/fire.pdf): adaptive velocity mixing and step sizes based on the alignment of force and movement. This finds a local stationary arrangement, not a guaranteed globally best drawing. It replaces the collision impulse with an explicit soft overlap penalty; this is a material change, and stationary overlaps are possible in other configurations. The page reports overlaps rather than silently treating rest as geometric validity.

The scratch force/energy oracle used finite differences on separated and overlapping three-body cases (error below 5×10⁻⁹), a touching case (about 7.5×10⁻⁶ at a 10⁻⁵ interval), and finite separating forces at coincidence. These checks support the field calculation, not its visual quality. An uncapped repository trial still had force RMS 0.0661 at 1,000 ticks and made individual steps up to roughly 78 world units; a large capped-FIRE trial was not run after the owner reported its odd motion and the root withheld it.

The integrator bounds each sphere's displacement to 1.2 world units per rendered tick by reducing the global step before movement. The probe also offers 0.6 and 2.4. It stops after ten consecutive steps with force RMS below 0.0001, maximum force below 0.001 and maximum motion below 0.001. These are numerical tolerances checked against actual imbalance and movement, not a deadline or a tick budget. No production tolerances or defaults are selected.

The root built the fifth option and captured it with installed Chromium at 1600×1000. Both runs started from the same cold-layout rule used above, gravity 0.01 and springs 0.25. The actual stopped state was:

| Estate layout | Spheres | Rendered ticks | Force RMS | Maximum force | Maximum motion | Overlaps |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Structure | 53 | 1,267 | 0.0000798 | 0.0001886 | 0.0001802 | 0 |
| Connections | 35 | 1,112 | 0.00000357 | 0.00000983 | 0.00000934 | 0 |

The text readout refreshes every ten ticks, so the pictured counter is slightly earlier than the final diagnostic. The camera is fitted before the early picture and again at rest; extent is not comparable from fitted stills alone.

- [Structure early](estate-structure-relax-early.png) and [at rest](estate-structure-relax-rest.png).
- [Connections early](estate-connections-relax-early.png) and [at rest](estate-connections-relax-rest.png).
- [The actual-cadence browser recording](estate-relax-comparison.webm).

The root inspected all four stills and sampled the recording at nine timestamps from 2 through 48 seconds. The branching structure remains recognizable, but the Connections layout rearranges substantially while the solver descends. The diagnostic also shows a temporary near-stop followed by renewed motion (Connections tick 300 RMS 0.003, tick 500 RMS 0.542). Numerical convergence does not establish the smoothness or shape the owner wants. The owner then inspected it in [Turn 10](../../../ChatHistory/2026/10/2026-10-19.1.record.md#turn-10) and reported an odd waking-and-sleeping, writhing journey before rest. FIRE resets all velocities and shrinks its step when force and motion oppose, then accelerates again; the optimizer itself explains these visible pulses. It passes the numerical settling criterion but fails the continuous-motion objective. No new production force has been adopted; the next comparison must avoid those global restarts.

## A smooth control without optimizer restarts

The sixth option uses ordinary constant-mass damped velocity-Verlet against the same conservative field as the fifth: fixed timestep 0.5 and drag 0.2, with 0.25 offered as a gentler timestep. There is no power-triggered velocity reset, cooling schedule or changing timestep. One solver step is one rendered tick. This is a control for the owner's waking-and-sleeping complaint, not a selected production design.

The root built it, inspected four estate pictures and captured the two layouts at the actual browser cadence. Each was explicitly paused after 1,000 rendered ticks for comparison; **neither reached rest**. At the displayed tick 1,000, Structure moved RMS 0.0802 / maximum 0.260 world units with force RMS 0.0314; Connections moved RMS 0.0369 / maximum 0.0859 with force RMS 0.0145. Both had zero overlaps. The frame instrument counted another six to eight ticks before the automated pause took effect.

- [Structure early](estate-structure-smooth-early.png) and [paused after 1,000 ticks](estate-structure-smooth-1000.png).
- [Connections early](estate-connections-smooth-early.png) and [paused after 1,000 ticks](estate-connections-smooth-1000.png).
- [The browser recording](estate-smooth-comparison.webm).

The delegated headless check at timestep 0.5 found force RMS 0.00175 / 0.00130 after 3,000 estate ticks, no overlaps, and monotonically decreasing potential and total energy in both runs. Movement starts near Existing/constant's pace but accelerates strongly: RMS about 4.00 / 3.44 by tick ten. A 0.25 timestep softens early motion but slows convergence. A separate fixed per-node mobility control did not remove that tradeoff and was not added to the page. The exact-charge equilibrium remains far from the preferred early picture, so the root asked the owner to judge motion and shape before a production choice. In [Turn 12](../../../ChatHistory/2026/10/2026-10-19.1.record.md#turn-12), the owner reported “Balanced forces smooth damping so far is quite natural!” This supports its motion; it does not establish convergence or the large graph's behavior.

## Limits of a physical resting state

A soft collision penalty is not a hard clearance constraint. For two equal spheres with required separation 13, spring rest length 13, spring coefficient 0.25, collision stiffness 3, gravity 0.3 and charge zero, the model's symmetric force balance has separation about 12.405: nearly 0.595 penetration despite zero force residual. This is an analytic counterexample, not a captured default scene. The readout reports overlaps separately; force balance alone does not establish a valid resting picture.

With zero gravity, unbounded positive repulsion and disconnected components, this energy has no finite minimum: separating the components continues reducing it. An eventual universal stop cannot be promised for those settings. The demonstrated estate cases use positive gravity and had zero overlaps; they do not prove arbitrary settings safe.

## Still unresolved

- A production stopping criterion based on actual motion, force residual and geometric validity, which cannot mistake stronger damping or a stationary overlap for a settled valid picture.
- Whether the faster force-driven relaxation preserves the preferred early movement and shape; the estate measurements establish convergence for those cases only.
- Larger-graph cost and the visible consequences of exact versus approximate repulsion.
- Scrubs, large jumps, births/deaths and direct node drags in the actual Explorer, after a candidate is selected; these four stills do not prove those journeys.

The current force module and its mirror remain unchanged. The experimental code is isolated under the session's ignored scratch folder, and useful findings are preserved here rather than as a subagent transcript.
