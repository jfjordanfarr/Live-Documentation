# Theo and UI hill climbing

Historical research, November 4, 2026, requested in [Turn 6](../ChatHistory/2026/11/2026-11-04.1.record.md#turn-6). The proposed Explorer experiment below is the root agent's recommendation; no workflow or product change has been adopted.

Theo's [Agents Sucked At UI (Until Today)](https://www.youtube.com/watch?v=xq0eB8vxeqk), published November 3, describes repeatedly improving T3 Code using screenshot reviews from several models. Its useful contribution here is an explicit feedback loop with comparative visual evidence. Our experiment should optimize what a viewer can understand and do, while independently protecting the documented facts.

## The repeatable method

Theo's published [council skill](https://github.com/t3dotgg/tstack/blob/1085050f3baed1ac724caa4a8166145fb2ac88af/skills/council/SKILL.md), read at its October 28 revision, supplies the review protocol:

1. Address known issues and run relevant checks before asking for review.
2. Give three strong models from different providers the request and relevant context. Reviewers do not edit the implementation.
3. Collect their findings, disagreements and scores. The lead agent decides which recommendations merit changes and prevents scope from expanding merely to satisfy reviewers.
4. After fixes, request another review. Count each complete review pass as a round and retain the scores by reviewer and round; report missing scores honestly.

The skill specifies neither a UI rubric nor a universal passing score. Its generic provider selection also differs from the personalized panel discussed in the video. It is [MIT licensed](https://github.com/t3dotgg/tstack/blob/1085050f3baed1ac724caa4a8166145fb2ac88af/LICENSE), and Theo's [README](https://github.com/t3dotgg/tstack/blob/1085050f3baed1ac724caa4a8166145fb2ac88af/README.md) describes the skills as starting points to adapt.

For the UI experiment, Theo added before/current screenshots and later competing applications, reset the reviewing context, and raised his target from 9 to 9.5 and then 10. He also requested annotated comparisons so he could see the changes. Useful video entry points are [the brief at 6:16](https://www.youtube.com/watch?v=xq0eB8vxeqk&t=376s), [annotated evidence at 11:39](https://www.youtube.com/watch?v=xq0eB8vxeqk&t=699s), and [comparison with other applications at 13:54](https://www.youtube.com/watch?v=xq0eB8vxeqk&t=834s).

## The public implementation record

These PRs document the progression. Their dates establish work on October 25–26; the video's publication date is later. The tables are the authors' recorded review outcomes, not independently reproduced ratings.

| Stage | What the primary record establishes |
| --- | --- |
| [Initial polish, 24776](https://github.com/pingdotgg/t3code/pull/24776) | Three rounds: initial scores of 6, 6 and 6.5 reach 9. Changes include actual medium/semibold font support, consistent radii and clearer hierarchy. One clipping complaint disappeared on examining a full-resolution crop, without a code change. This PR was superseded. |
| [Comparative review, 24837](https://github.com/pingdotgg/t3code/pull/24837) | Fresh screenshots include competing applications. The earlier candidate initially scores 7.4 from Sol. Five rounds end with Sol and Opus at 9, Muse at 7.9; some requested changes are explicitly declined to hold scope. It was superseded too. |
| [Combined redesign, 24865](https://github.com/pingdotgg/t3code/pull/24865) | Merged October 25. Eighteen recorded rounds combine the first follow-up, the 9.5 pass and merge review. Seeded data, a 1280×832 frame and annotated screenshots make the comparisons inspectable. Most changes sit behind a reversible Beta setting. |
| [Color and further refinement, 25251](https://github.com/pingdotgg/t3code/pull/25251) | Merged October 26. Restores meaningful color while keeping neutral structure. Thirteen rounds eventually cover fourteen categories, including accessibility, responsiveness, motion and copy. The PR also records concrete checks: light syntax contrast across code surfaces and smooth chat placement across window widths. |

The [annotated comparison](https://files.tslop.org/2026/10/ui-95-annotated-main-vs-pr-s11-a5faf45d.png) shows the intermediate redesign's hierarchy and control changes. It is useful for judging those pictures; it cannot establish how the app feels throughout an interaction.

## How to interpret the scores

Theo reports roughly 17.6 hours of parallel agent runtime and approximate usage valuations of $250 before the extra refinement and $400 including it; these were subscription-based estimates, not a reproducible price quote. See [21:18 onward](https://www.youtube.com/watch?v=xq0eB8vxeqk&t=1278s).

The scores are sensitive to evidence and context. At [20:19](https://www.youtube.com/watch?v=xq0eB8vxeqk&t=1219s), Theo notes that unchanged reference screenshots received different scores and suggests withholding the target score from reviewers. The [combined PR](https://github.com/pingdotgg/t3code/pull/24865) also records reference-score movement and a disagreement between one reviewer's table and its conclusion. A score needs its evidence and reasoning beside it.

My assessment: the case supports trying repeated model critique as a design-improvement process. The meaningful result is a changed interface that survives inspection. Agreement on a number alone does not establish that someone can learn an unfamiliar codebase, recover their place after navigation, or use the interface on a phone. Those need their own evidence. A review can also improve by receiving a clearer screenshot, as the initial PR demonstrates; that must remain distinguishable from an implementation improvement.

## A proposed Explorer experiment

Start with one complete 2D learning journey. The [vision](../../.mdmd/layer-1/vision.mdmd.md) makes understanding software the purpose, and [current direction](../Memory/direction.md#next) asks for a portrait card that teaches its subject before outward exploration. The owner's [payment-cycle observation](../ChatHistory/2026/11/2026-11-04.1.record.md#turn-5) gives us a concrete test: a correct return wire should help a viewer recognize the three-file relationship.

| Task for a reviewer using the interface | Evidence to collect |
| --- | --- |
| Open a shared portrait card and explain what its subject does. | Which information was found, what remained hidden, and a screenshot of the actual reading frame. |
| Follow one offering to something that uses it, then return. | The path taken, any mistaken direction or identity, and whether the original subject remains recognizable. |
| Explain the payment cycle. | The reviewer's answer from the UI, checked separately against the three-file path in the Live Docs and inspect CLI. |
| Read a long description, close it, zoom outward and back, then reopen the shared link. | Whether text, focus, pins, reading choices and bearings survive the journey. |

Use the same source graph, content, starting URL, viewport and browser configuration for baseline and candidates. Include a normal estate case and a dense repository case, desktop and phone, and keyboard interaction. Keep one additional case for the final review that was not used to guide every change. Screenshots should be accompanied by the actual journeys or short recordings when motion matters.

Give reviewers candidate labels in varied order, the same task brief and the same evidence. Withhold target scores, earlier reviewers' ratings and the builder's account of why a candidate is better. Ask each reviewer to explain its preference with visible evidence and report uncertainty. If they cannot operate the page, identify that review as a review of pictures only. External reference apps can inform typography and control quality; they cannot serve as ground truth for our graph semantics.

Keep distinct measures: visual hierarchy, reading, discoverability, navigation continuity, and accurate interpretation of relationships. Have the lead compare task answers against independently derived facts. A high aesthetic rating cannot compensate for reversed or missing relationships, concealed information, unreadable text, lost state or a broken keyboard path. These constraints give the search a useful boundary while leaving room for substantially better pictures.

One implementation agent should make a bounded set of changes, capture new evidence, and request fresh reviews. Preserve each candidate and a compact record of changes, findings, task outcomes and scores. Compare disagreement directly rather than averaging away a failed task. Set an iteration and resource budget before starting; use a final fresh review and the owner's visual judgment to choose among surviving candidates. Add browser regressions for accepted behavior and run the applicable product gate.

This makes success concrete: another person can explain and navigate the software more accurately and comfortably. Passing checks remains necessary, and the improvement has to be visible in the same learning journey.

## Source coverage

Read YouTube's own transcript through its final caption at 31:39, all four PR descriptions, and the pinned council skill and README; inspected the linked annotated comparison. The player reported an unsupported browser, so this was a transcript and published-evidence review, not a viewing of the complete moving video. Caption mirrors helped locate passages, but the conclusions above use the original transcript and Theo's repositories. No model council was run and no skill was installed.

## November 4 follow up for this workspace

In [Turn 7](../ChatHistory/2026/11/2026-11-04.1.record.md#turn-7), the owner specifies GPT-6.1 Sol as the subagent model for this experiment and asks the lead to select the next work from the preferences already supplied. The proposed adaptation uses fresh Sol review contexts and explicit criteria. Provider diversity is not a precondition for this local experiment; the historical description of Theo's protocol above remains accurate.

The lead's chosen next task is the 2D portrait-card and outward-learning journey. Start by grading the existing build, then address its largest observed weakness and compare the resulting journey with the baseline. The first scope includes one ordinary estate subject, one dense repository subject, long descriptions, desktop and phone. It tests the remaining name-click alternatives in context without treating either as already selected.

| Criterion | What a strong result looks like |
| --- | --- |
| Visual hierarchy and appeal | The subject leads; the card feels coherent and carefully composed; controls and neighboring content have a clear visual order. |
| Reading | Names, purpose and useful symbol explanations are readable at the starting frame, and more content is easy to reach. |
| Controls and state | A person can predict an action and tell what is retained, temporarily previewed, or deliberately open. |
| Navigation continuity | Following, returning, opening text and changing scale preserve recognizable subjects and context. |
| Interpreting relationships | A person can identify what offers, what uses, and what the picture omits or sends backward, with answers checked against the docs. |

Use the same descriptive anchors on each dimension: 1–3 means an ordinary task fails; 4–6 means it works with substantial guessing or friction; 7–8 means it is clear with identifiable rough edges; 9–10 means it is clear and coherent with no consequential friction observed in the tested journey. Every grade must name the evidence and explain the remaining weakness. These are proposed evaluation anchors, not measured results or a claim that a perfect interface exists.

Keep dimensions separate, preserve factual and accessibility checks, and compare actual preferences between matched candidates. A new review context receives neither the previous score nor a requested passing number. The useful output is a visibly and behaviorally better journey, with before/after evidence for the owner, not a newly built evaluation framework as an end in itself.
