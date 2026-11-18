# T3 Code as an unfamiliar mapping case

Historical investigation dated 2026-10-27, prompted by the owner's [Turn 2](../ChatHistory/2026/10/2026-10-27.1.record.md#turn-2). This is a source review for discussion, not a migration decision, a runtime evaluation or evidence that Live Documentation has mapped T3 successfully.

## Evidence boundary

Read public upstream documentation, selected tool/schema source, release metadata, issue reports and a merged repair through the GitHub connector. Web search identified the canonical repository and site; no third-party account is used as authority below. The initial GitHub call requested authentication and was retried after the connector said it had been accepted.

The repository API identifies [pingdotgg/t3code](https://github.com/pingdotgg/t3code) as a TypeScript project. At inspection, main was [36d4d711b79c73eb33131944f73ea4a8c6156484](https://github.com/pingdotgg/t3code/commit/36d4d711b79c73eb33131944f73ea4a8c6156484). The latest non-prerelease was [v0.1.3](https://github.com/pingdotgg/t3code/releases/tag/v0.1.3), published October 27 at 06:09:26 UTC, with target `d2c440312e5f39d59827ed466838a623516454d6`. Main and the release are different checkpoints. No provider process, installation, delegation or migration was performed here.

## What is already present

| Question | Evidence and practical meaning |
| --- | --- |
| Can one provider delegate to another? | The [v0.1.3 orchestration document](https://github.com/pingdotgg/t3code/blob/v0.1.3/docs/orchestration-v2/orchestrator-mcp-server.md) describes `delegate_task` creating a T3-owned child thread on a selected provider/model, with status, cancellation and result delivery. It describes injection for both Codex and Claude and cross-provider integration coverage. This is implemented architecture, not merely an open feature request; it has not been exercised by this investigation. |
| What context does a child get? | The same document explicitly limits the child to the task prompt and optional role instruction. It does not copy the parent conversation. The [tool declaration on inspected main](https://github.com/pingdotgg/t3code/blob/36d4d711b79c73eb33131944f73ea4a8c6156484/apps/server/src/mcp/toolkits/orchestrator/tools.ts#L68) repeats that contract. Brief construction therefore matters for our long sessions. |
| Can the provider change within one conversation? | [Portable handoffs](https://github.com/pingdotgg/t3code/blob/36d4d711b79c73eb33131944f73ea4a8c6156484/docs/user/portable-handoffs.md) describe transferring short conversations intact and selecting a budgeted subset of longer ones, with retrieval references. Reasoning, tool-call state and attachments are not transferred. This is distinct from child delegation and is not complete native-session portability. |
| Can agents outside T3 interact with it? | [Outside agents](https://github.com/pingdotgg/t3code/blob/36d4d711b79c73eb33131944f73ea4a8c6156484/docs/user/outside-agents.md) documents authenticated MCP access to projects and threads, with read-only and stronger permission choices. This opens a possible coexistence trial with the present environment; no connection was configured here. |
| Are provider and reasoning choices inspectable? | The [current schema](https://github.com/pingdotgg/t3code/blob/36d4d711b79c73eb33131944f73ea4a8c6156484/packages/contracts/src/orchestratorMcp.ts) exposes provider/model/options and `canRunCrossProviderChildTask`; the capabilities tool advertises available models and options. That is not proof that the owner's authenticated environment offers every desired model or effort setting. |

The orchestration document fetched at v0.1.3 was byte-identical to the inspected-main version. Its verification section describes real orchestration/persistence with deterministic replacement provider adapters. That is useful integration coverage; it is not a live-provider reliability measurement.

## Stability evidence that matters to this owner

- The [v0.1.3 release notes](https://github.com/pingdotgg/t3code/releases/tag/v0.1.3) include fixes for resuming Codex parents after native children finish, stopping a thread's subagents, and notifying parents after delegated background runs. Those shipped repairs show both real capability and active work on lifecycle correctness.
- [Issue 25891](https://github.com/pingdotgg/t3code/issues/25891), opened October 27 and still open at inspection, reports GPT-6.1-Sol review children repeatedly compacting and never delivering terminal completion to the parent on macOS with `0.1.3-nightly.20261026.3726`. This is a reporter's observation on that nightly, not our reproduction and not a finding about every stable installation. Its guessed cause remains unverified.
- [PR 25675](https://github.com/pingdotgg/t3code/pull/25675) merged October 27 at 14:17:36 UTC. It bounds a hung delegated-stop effect so later work can run, including after restart. This merge postdates v0.1.3's release. Its own evidence limits the repair to interruptible hangs. The upstream test and runtime claims have not been rerun here.
- The [installation guide](https://github.com/pingdotgg/t3code/blob/36d4d711b79c73eb33131944f73ea4a8c6156484/docs/user/install.md) documents desktop, web and mobile access, server-side provider installation and Windows/WSL support. These do not establish complete equivalence to the owner's Windows-backed Linux devcontainer workflow. That needs a trial of the actual checkout, tools, authentication and file access.

Inference: the cross-harness feature is substantial enough to investigate seriously. The evidence does not justify recommending a wholesale switch today. A small trial should test both delegation directions, follow-up delivery, cancellation, restart, long-context continuity, actual model/effort selection, screenshots/browser work, project instructions/skills and the root-only conversation record. Preserve the current environment until the comparison answers those questions.

## What this would test in Live Documentation

The owner's question supplies a concrete subject: trace how a cross-provider task is requested, launched, represented and returned, and identify which conclusions require source or runtime evidence beyond the map. Begin with a fixed upstream snapshot and the computed Local Map. Record where generation, discovery, search, initial framing, evidence or sharing obstruct the investigation. Add authored explanation afterward so the initial computed value remains distinguishable.

The root already has upstream documentation and source clues from this research; a later walkthrough must not credit the Explorer for facts learned here. It should record the provenance of each finding and distinguish connections visible in Live Docs from behavioural conclusions checked in source or runtime.

The source tree is also a nontrivial discovery case: the recursive Git tree response was not truncated and includes checked-in `.repos/` reference source. The [root package manifest](https://github.com/pingdotgg/t3code/blob/36d4d711b79c73eb33131944f73ea4a8c6156484/package.json) has multiple application/package workspaces and native Rust build commands. No scan boundary or exclusions have been selected; do not curate the input invisibly to make the first map look good.

The agent's proposed sequence is to put this mapping rehearsal ahead of the history-panel repair. The history repair remains useful, but it does not answer the larger introductory-journey question. The owner has endorsed the unfamiliar-codebase direction and proposed T3; they have not yet accepted this detailed execution plan, a launch-surface design or a test-suite cleanup.
