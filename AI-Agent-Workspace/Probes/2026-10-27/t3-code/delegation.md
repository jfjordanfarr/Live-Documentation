# How T3 Code delegates across providers

Historical source investigation, 2026-10-27, pinned to T3 Code **v0.1.3**, commit `d2c440312e5f39d59827ed466838a623516454d6`. The accompanying map and walkthrough are being prepared. This explanation concerns T3-owned child tasks; it is not a live-provider test or a recommendation to replace an existing development environment.

T3 exposes a delegation tool to a running agent. The tool selects a provider and model for a new child thread, submits work through T3's durable orchestration system, and makes the result available to the parent. The parent and child can use different providers. **The child starts from the task brief and optional role instruction; the parent's conversation is not copied into it.** This is different from changing the provider of an existing conversation.

## The request

The [tool definitions](https://github.com/pingdotgg/t3code/blob/d2c440312e5f39d59827ed466838a623516454d6/apps/server/src/mcp/toolkits/orchestrator/tools.ts#L68) expose `delegate_task`, `task_status` and `task_cancel`. Their [handlers](https://github.com/pingdotgg/t3code/blob/d2c440312e5f39d59827ed466838a623516454d6/apps/server/src/mcp/toolkits/orchestrator/handlers.ts#L19) obtain the authenticated caller context and invoke the MCP service.

[OrchestratorMcpService](https://github.com/pingdotgg/t3code/blob/d2c440312e5f39d59827ed466838a623516454d6/apps/server/src/mcp/OrchestratorMcpService.ts#L2136) requires an active parent run belonging to the calling provider session. It resolves the target model and permitted runtime/interaction modes, prepares worktree isolation when requested, and submits a `delegated_task.request` command. Its `taskPrompt` function at line 812 constructs the child's initial prompt from the task and optional role. Shared-checkout or worktree access is separate from conversation inheritance.

[ThreadManagementService](https://github.com/pingdotgg/t3code/blob/d2c440312e5f39d59827ed466838a623516454d6/apps/server/src/orchestration-v2/ThreadManagementService.ts#L679) checks that the target provider instance is enabled for the project and forwards the command to the orchestrator. This is the common command boundary, rather than a special direct route from MCP to a provider.

## The child executes

[Orchestrator](https://github.com/pingdotgg/t3code/blob/d2c440312e5f39d59827ed466838a623516454d6/apps/server/src/orchestration-v2/Orchestrator.ts#L7128) creates the delegated task and child execution. At line 7336 it dispatches the child's message using `command.task` and the selected model, with no copied attachments. It records a consumed `subagent_spawn` transfer connecting the parent and child. That transfer describes their lineage; its existence does not imply a copy of the parent conversation.

Provider work proceeds through queued effects. [EffectWorker](https://github.com/pingdotgg/t3code/blob/d2c440312e5f39d59827ed466838a623516454d6/apps/server/src/orchestration-v2/EffectWorker.ts#L142) handles `provider-turn.start` by calling [ProviderTurnStartService](https://github.com/pingdotgg/t3code/blob/d2c440312e5f39d59827ed466838a623516454d6/apps/server/src/orchestration-v2/ProviderTurnStartService.ts). [ProviderSessionManager](https://github.com/pingdotgg/t3code/blob/d2c440312e5f39d59827ed466838a623516454d6/apps/server/src/orchestration-v2/ProviderSessionManager.ts) manages provider sessions and MCP credentials; [ProviderAdapterRegistry](https://github.com/pingdotgg/t3code/blob/d2c440312e5f39d59827ed466838a623516454d6/apps/server/src/orchestration-v2/ProviderAdapterRegistry.ts) resolves an instance to its adapter. A dependency map can expose these components and their imports. Their runtime order needs the implementation and the lifecycle documentation as evidence.

## The result returns

The [released lifecycle documentation](https://github.com/pingdotgg/t3code/blob/d2c440312e5f39d59827ed466838a623516454d6/docs/orchestration-v2/orchestrator-mcp-server.md#delegated-task-lifecycle) describes terminal provider events triggering parent finalization, including replay after restart. In [Orchestrator's finalization code](https://github.com/pingdotgg/t3code/blob/d2c440312e5f39d59827ed466838a623516454d6/apps/server/src/orchestration-v2/Orchestrator.ts#L11103), T3 checks the child's outcome and pending continuation, obtains the result, and updates the parent's task. It checks for an existing `subagent_result` transfer before writing another, then records the transfer and plans delivery.

The MCP service distinguishes waiting and asynchronous delegation: waiting ordinarily returns through the blocking tool call; asynchronous work can wake the parent. `task_status` can retrieve the result and mark it delivered. A finished provider turn is not necessarily a finished task when child or background work remains. These are implemented lifecycle rules, not proof that every provider interruption, cancellation or restart succeeds in practice.

The [delegation contract](https://github.com/pingdotgg/t3code/blob/d2c440312e5f39d59827ed466838a623516454d6/docs/orchestration-v2/orchestrator-mcp-server.md#delegate_task) makes two further distinctions useful for long investigations. A wait timeout leaves the child running. A follow-up through `t3_thread_send` can continue in the same child's conversation, but after completion it creates a new task rather than rewriting the old task's published result. A new `delegate_task` call starts from its new brief.

## What this establishes, and what remains a trial

The cross-provider mechanism is substantive: selection, child lineage, execution, results and cancellation have explicit implementations. A good task brief remains essential because the delegation contract does not transfer the parent's history. Existing-conversation provider switching has its own [portable-handoff contract](https://github.com/pingdotgg/t3code/blob/d2c440312e5f39d59827ed466838a623516454d6/docs/user/portable-handoffs.md).

This investigation has not authenticated either provider or executed a T3 task. The upstream integration coverage described in the lifecycle document replaces external providers with deterministic adapters. A migration decision still needs a live trial of both delegation directions, follow-up delivery, cancellation and restart, long-session continuity, the desired model/effort choices, browser work, repository instructions and the root conversation record. The dated research review and newcomer walkthrough preserve the separate evidence for those questions.
