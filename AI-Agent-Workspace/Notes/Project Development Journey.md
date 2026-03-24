# **Project Development Journey**

## **Executive Summary**

*Status: Active Development (Mar 22, 2026\)*

"Copilot-Improvement-Experiments" began as an initiative to build an "IntelliSense for Documentation"—a system to prevent drift between markdown plans and implementation code.

Over the course of four months (Oct 2025–Feb 2026), the vision underwent a radical metamorphosis. It evolved from a passive IDE linter into a **"Universal Code Explorer"**—a 100% deterministic, visual, and self-aware command center. The system is capable of traversing deep relationships across 16+ languages, visualizing them via interactive maps, and performing "Chat Archaeology" to link every line of code back to the conversations that created it.

The project is built on the **"SpecKit"** methodology: a rigorous governance layer where the **Architect (User)** and **Agent (Copilot)** work as a cybernetic team. As of February 2026, the project has achieved "Stateless Purity," removing all database and AI-inference dependencies in favor of compiler-backed ground truth (SCIP) and file-system-driven intelligence.

"The Team" Defined (Crucial Context for AI Agents):

Throughout this document, "The Team" refers exclusively to the cybernetic collaboration between:

1. **The Architect (User):** Provides vision, auditing, governance, and final sign-off.  
2. **The Agent (GitHub Copilot/AI):** Executes implementation, scaffolding, and analysis under the Architect's supervision.  
   There are no other human developers. If a task is described as "The Team's responsibility," it means it is YOUR responsibility (as the Agent) to execute it under the Architect's guidance.

## **The Experience Vision: How It Works**

*The canonical workflows for interacting with the system.*

Following the **"Diagnostics Extinction"** (Feb 2026), the project moved away from IDE-centric "squiggly lines" toward a unified surface built on a single invariant: **every consumer—human or machine—reads from the same markdown-as-AST graph.** CLI commands, the Visual Explorer, the VS Code extension, static exports, CI pipelines, and AI coding assistants all share one source of truth. The experience is organized around six consumption surfaces and five user personas.

### **Consumption Surfaces**

Live Documentation is delivered through six channels, each backed by the same underlying graph:

| \# | Surface | Medium | Primary Consumers | Current Status |
| :---- | :---- | :---- | :---- | :---- |
| 1 | **CLI Suite** | Terminal (npm run live-docs:\*) | Engineers, CI pipelines, AI agents | Shipped |
| 2 | **Visual Explorer** | Browser (Static Build) | Architects, onboarders, leads | Shipped (npm run live-docs:visualize) |
| 3 | **VS Code Extension** | Editor (thin client) | Engineers, writers | In progress (thin shell shipped; lint-as-diagnostics planned) |
| 4 | **Static Export** | HTML \+ JSON bundle | Teams, stakeholders, offline consumers | Shipped (merged into visualize) |
| 5 | **Headless JSON API** | HTTP / \--json flags | AI agents, automation scripts, CI | Shipped (Local Map endpoint \+ all CLI \--json modes) |
| 6 | **Raw Markdown** | .md files in-repo | AI agents, wiki surfaces, git reviewers | Shipped (deterministic Layer-4 mirror) |

### **User Personas**

| Persona | How They Consume | What They Care About |
| :---- | :---- | :---- |
| **Engineers** | CLI (inspect \--from/--to), Local Map pathfinding, \--json in pre-merge scripts | "What breaks if I change this?" — impact analysis, dependency tracing, test coverage visibility |
| **Architects & Onboarders** | Explorer (Circuit Board for macro, Force Graph for clustering), Knowledge Sources panel | "How is this system structured?" — package boundaries, component clustering, orphan detection |
| **Technical Writers & PMs** | live-docs:lint in Problems panel, authored Purpose/Notes sections, wiki publishing | "Are the docs in sync with reality?" — structural validation, broken link detection |
| **AI Coding Assistants** | Raw markdown (Layer-4 Live Docs as structured context), \--json CLI output as prompt fuel, .github/instructions/\*.instructions.md for glob-gated context injection | "What does this file do, what depends on it, and what evidence exists?" — structured ground truth that fits in a context window. Live Docs are *designed* to be consumed by LLMs: each file has a deterministic, anchored surface (Public Symbols, Dependencies, Observed Evidence) that an agent can parse without heuristic scraping. |
| **CI Pipelines & Automation** | live-docs:lint exit codes, \--json reports, CI pre-merge hooks | "Is the codebase structurally sound?" — automated quality gates, regression detection, benchmark tracking |

### **Core Workflows**

#### **Explore Structure**

*Who: Architects, Onboarders*

Launch the **Visual Explorer** and use the fuzzy **Omnisearch** (Ctrl+P) to find symbols or files. Toggle between the macro **Circuit Board** (directory-level treemap), the focused **Local Map** (3-column symbol view), and the **Force Graph** (physics-based clustering). The **Knowledge Sources** panel shows exactly where the data comes from, including disconnected nodes that may indicate dead code or adapter gaps.

**Result:** Holographic understanding of system architecture without reading a single line of source code.

#### **Trace Impact**

*Who: Engineers, Security Auditors*

Select "FROM" and "TO" artifacts in the Local Map or run live-docs:inspect \--from A \--to B from the terminal. The system renders a hop-by-hop **FROM → VIA → TO** narrative. Clickable **Type Reference Badges** trace inheritance chains, trait implementations, and call sites across language boundaries. Adding \--json makes the same data available to automation or AI agents as structured prompt fuel.

**Result:** Deterministic impact analysis — "what exactly breaks if I change this?" — replacing architectural guesswork with traceable, shareable links.

#### **Recover Intent**

*Who: Leads, Researchers*

Enable **"Show Related Documentation"** in the Force Graph. Purple nodes representing "Soft Graph" artifacts (Chat Logs, Specs, READMEs) appear alongside the blue/green code nodes. Clicking a relationship jumps directly to the conversational history where a design decision was made. The same markdown is available in the detail panel's rendered markdown viewer and as downloadable exports.

**Result:** Retrieval of the "Human Intent" behind the logic, bridging *how* it works and *why* it was built.

#### **Validate Before Merge**

*Who: Developers, Maintainers*

Manage graph noise in plain markdown using \<\!-- live-docs:ignore \--\> comments. Run live-docs:lint to validate structural integrity — wire it into your CI pipeline or pre-commit hooks to block broken links before they land. The same lint findings surface in the VS Code Problems panel (via DiagnosticPublisher) for writers who prefer IDE feedback. No database, no state synchronization — the file system is the configuration.

**Result:** A high-signal graph maintained through purely stateless, git-versioned mechanisms.

#### **Consume as Structured Data**

*Who: AI Coding Assistants, CI Pipelines, Automation Scripts*

AI agents consume Layer-4 Live Docs directly as structured context (each file's Public Symbols, Dependencies, and Observed Evidence are deterministic markdown that fits in a context window). CLI commands with \--json flags produce machine-readable dependency chains, fan-out maps, and lint reports. CI pipelines run live-docs:lint as a quality gate. Static exports bundle the entire graph as explorer-data.json for offline tooling. The Explorer's /local-map?nodeId=\<path\> endpoint provides structured JSON for headless debugging.

**Result:** Humans and machines consume the *same* ground truth through different interfaces — no separate "AI mode" or "CI mode." The markdown is the API.

## **Part I: The Foundation (October 16–27)**

*The "Bootstrapping" Era. Building the brain, the graph, and the rules.*

### **Phase I: The "SpecKit" Genesis & The Writer's Loop**

Scope: Commits 1–4

The project began with Governance. The team established the "Constitution" and the "SpecKit" prompt library. The first feature ("Link-Aware Diagnostics") was built to detect drift between markdown plans and implementation code.

* **Key Tech:** Monorepo (Extension/Server/Shared), SQLite Graph, Inference-First Logic.  
* **Key Moment:** The "Node.js Saga" (Pivot to Node 20 LTS for stability).

### **Phase II: Generalization & The Developer's Loop**

Scope: Commits 5–8

The system generalized from "Markdown Watchers" to generic "Artifact Watchers," enabling Code-to-Code ripple detection.

* **Key Tech:** HysteresisController (preventing alert loops), ArtifactWatcher.

### **Phase III: The Semantic Layer**

Scope: Commits 9–14

The system became "smart" by ingesting VS Code Workspace Symbols and external Knowledge Graphs.

* **Key Tech:** SymbolBridge, KnowledgeGraphBridge, RippleAnalyzer.  
* **Governance:** Enforced the "500-line limit" refactor rule.

### **Phase IV: Visibility & Falsifiability**

Scope: Commits 15–21

The focus shifted to User Experience (Tree Views) and rigorous testing (Falsifiability Suites).

* **Key Tech:** Diagnostics Tree View, .mdmd (Meta-Documentation).

### **Phase V: Active Intelligence**

Scope: Commits 23–26

The system moved from "Passive Watching" to "Active Scanning" (Content-First Indexing) and adopted standard graph formats (LSIF/SCIP).

* **Key Tech:** Content-First Indexer, LSIF/SCIP Parsers.

### **Phase VI–X: Hardening the Core**

Scope: Commits 27–45

The team refined the engine for production:

* **Phase VI:** Noise Suppression & Persistence.  
* **Phase VII:** Tooling (Audits, Snapshots, Dry-Runs).  
* **Phase VIII:** **"SlopCop" (Internal Data Hygiene)** – An internal auditing engine to police the repo for broken links and invalid assets.  
* **Phase IX:** The "Semantic Bind" (Enforcing docs coverage for exported symbols).  
* **Phase X:** Meta-Testing (Verifying the test fixtures).

## **Part II: The Polyglot Pivot (Late October – Early November)**

*Moving beyond TypeScript. Proving accuracy mathematically.*

### **Phase XI: The Governance Merger**

Date: October 28, 2025

Scope: Commit 46 (Instruction Unification)

The team realized that the "SpecKit" prompts and the "MDMD" documentation were two sides of the same coin. They unified them into a single Instruction System (.github/instructions/).

* **The Shift:** Instead of just *asking* the AI to summarize, the project now had dedicated "Skill Files" (e.g., mdmd.layer4.instructions.md) that taught the AI how to write its own documentation.  
* **Vision Check:** The chat logs show a strong push from the Architect to make the documentation "self-describing" so the AI could maintain it without human intervention.

### **Phase XII: The Rules Engine & Native Governance**

Date: October 31, 2025

Scope: Commit 50 (Relationship Rules & Meta-Instructions)

As the graph grew, it became chaotic. The team implemented strict semantic guardrails and enhanced the AI context.

* **The Rules Engine:** Implemented RelationshipRuleProvider to validate every link before insertion into SQLite (Note: This module was later deleted in Feb 2026 during the Great Simplification).  
* **Native Governance:** Introduced .github/instructions/instructions.instructions.md with applyTo fields. This effectively "programs the programmer" by leveraging the AI coding assistant's native capability to ingest context-specific instructions based on file patterns.

### **Phase XIII: The Mathematical Proof (Polyglot Accuracy)**

Date: October 31 – November 1, 2025

Scope: Commits 48–52 (AST Benchmarks)

The Architect challenged the Agent: "How do we know this works for other languages?" This kicked off the "Accuracy Obsession."

* **The Experiment:** The team scaffolded benchmark fixtures for **C**, **Python**, and **Rust**.  
* **The Metric:** They implemented a test harness (astAccuracy.test.ts) that compares the *Inferred Graph* (what our tool guessed via regex/heuristics) against the *Ground Truth AST* (what the compiler knows).  
* **The Result:** The system achieved a **66.7% Precision/Recall** parity across all four languages (TS, C, Py, Rs). This mathematical proof validated the "Universal" part of the vision.

**Key Deliverables:**

* tests/integration/benchmarks/: A multi-language testbed.  
* astAccuracy.test.ts: The mathematical proof of the system's brain.

### **Phase XIV: The Oracle & The Materializer**

Dates: November 1–6, 2025

Scope: Commits 53–64

The team faced a scaling problem: Manually maintaining "expected" JSON graphs for every language was tedious and error-prone. Also, committing large vendor libraries (like ky) for testing was bloating the repo.

* **The "Vendor-then-Delete" Pivot:** In Commit 53, the team vendored the ky library. In Commit 54, they realized this was a mistake and replaced it with a **Fixture Materializer**.  
* **The "Fixture Materializer" (FixtureMaterializer):** A tool that dynamically clones specific commits of open-source libraries (e.g., ky for TS, libuv for C, requests for Python) into a temporary workspace *during the test run*. This keeps the repo lean while allowing testing against real-world complexity.  
* **The "Fixture Oracle" (FixtureOracle):** To generate the "Golden Master" truth for these dynamic fixtures, the team built language-specific Oracles.  
  * **TypeScript:** Uses ts-morph compiler API (Commit 58).  
  * **Python:** Spawns a subprocess to run a native python AST script (Commit 59).  
  * **Polyglot Explosion (Commit 61):** Added oracles for **C, Rust, Java, and Ruby**, proving the architecture scales to any language.  
* **The Java Proof (OkHttp):** Commit 64 introduced the **OkHttp** benchmark, proving the system can handle a massive, production-grade Java library with complex package structures.  
* **Self-Healing Benchmarks (Commit 62):** The team wired npm run safe:commit to automatically run regenerate-benchmarks \--write. This ensures that the "Expected Graph" is always updated to match the latest Oracle logic, turning the benchmarks into a living baseline rather than a manual chore.

**Key Deliverables:**

* FixtureOracle interface and implementations (C, Rust, Java, Ruby, Python, TypeScript).  
* FixtureMaterializer (Dynamic git cloning).  
* regenerate-benchmarks.ts (The automated truth maintenance script).  
* tests/integration/benchmarks/fixtures/java/okhttp (Real-world Java benchmark).

## **Part III: The "Live Documentation" Transformation (Mid-November)**

*The system begins to generate itself. The "Live Docs" era.*

### **Phase XV: The System Layer & The Rename**

Dates: November 9–22, 2025

Scope: Commits 56–57, 68–70, 74, 80–83, 90, 101, 103

The project outgrew its "Experiments" moniker. The vision shifted from "Diagnostics" to "Live Documentation"—a system that proactively generates docs rather than just linting them.

* **The "Stage 0" Pivot:** The team implemented a split between *ephemeral* docs (generated from code) and *persistent* docs (authored metadata). The .live-documentation/ folder is now a generated mirror of the repo, but it preserves "Purpose/Notes" blocks written by humans (Commit 11/15).  
* **The 11/15 Work Loss Incident:** During a routine cleanup, an overly broad git checkout \-- command wiped several hours of uncommitted work. This painful lesson led directly to new safeguards in the Copilot instructions: "Git Commands Need Extra Care" (prune surgically, never bulk-restore without stashing) and "Safeguard In-Flight Work" (keep explicit awareness of uncommitted changes). The incident reinforced that in a single-contributor LLM-driven workspace, *every mess is our mess*—there is no one else to blame.  
* **The LiveDocsGenerator (Commit 68):** This component was implemented to enable the **"Code Like Clay" methodology**. It reads the previous file, extracts the human sections using regex markers, and injects them into the new generation. This allows documentation to be both automated and authored, fulfilling the "molding" vision described in the governance docs.  
* **System Scaffolding (Commit 69):** The "Stage 0" concept was formalized with the scaffolding of the System Layer generator. This commit also updated the task list to reflect the massive scope expansion (13 closed tasks, 45 open tasks across 7 phases), cementing the new direction.  
* **System Mirroring (Commit 70):** The generator was extended to create a full directory mirror of the codebase in .live-documentation/system/. The team also hardened the anchor cleaning logic in audit-doc-coverage.ts to ensure "SlopCop" compliance for these new generated files.  
* **Core Refactor (Commit 81):** As the Live Docs logic grew, the team refactored the monolithic core.ts into parse.ts (extraction) and generate.ts (rendering), introducing a **Headless Harness** for faster, disk-free unit testing.  
* **MDMD Unification (Commit 82):** The team formalized **"Membrane Design MarkDown (MDMD)"** in the Copilot instructions. Crucially, they configured the generator to produce .mdmd files for the system mirror, effectively treating the generated artifacts as "Layer 4" specifications. This unifies "Authored Specs" and "Generated Docs" into a single, continuous hierarchy. The code also hardened configuration by replacing hardcoded paths with constants (DEFAULT\_LIVE\_DOC\_ROOT).  
* **Content Injection (Commit 83):** The team systematically populated hundreds of generated docs with authored "Purpose" and "Notes" sections, citing specific chat logs. This completed the "Stage 0" vision, turning the skeleton mirror into a rich, navigable document set.  
* **The Rename:** The repository was renamed to Live-Documentation to reflect this new identity. Commit 101 finally updated all internal package references (@copilot-improvement/shared \-\> @live-documentation/shared), resolving the long-standing "identity crisis" in the monorepo configuration.  
* **The Hosted Vision (Commit 80):** The team refactored file extensions from .mdmd.md to .md and updated the roadmap (CAP-007) to explicitly target **GitHub Pages** hosting. This established the goal that Live Docs should be a deployable static site, not just a VS Code feature.  
* **Workspace Migration (Commit 74):** A massive housekeeping commit updated all internal references to match the new repository structure, regenerated snapshots with new IDs, and cleaned up legacy chat artifacts.  
* **Anchor Stabilization (Commit 90):** The team hardened the anchor generation logic (LD-implementation-...) to ensure stable deep links even as content shifts, regenerating the entire doc set to lock in these robust IDs.  
* **Chat Archival (Commit 73):** The chat history was reorganized into a structured archive (2025/11/) to support long-term memory without cluttering the root.  
* **Package Clean-up (Commit 103):** The rename was finalized by purging old package aliases from tsconfig.json and updating vitest.config.ts to map @live-documentation/\* correctly.

### **Phase XVI: The Polyglot Adapters & The Docstring Bridge**

Dates: November 12–20, 2025

Scope: Commits 58–67, 71–72, 75–79, 84–95

With the Live Docs engine in place, the team proved its universality by implementing deep language support. This wasn't just about dependency graphs; it was about Semantic Extraction.

* **The Universal Docstring Normalizer (Commits 75–79):** The system implemented a "Docstring Bridge" that translates diverse documentation standards into a unified Markdown format for the Live Doc viewer.  
  * **Python:** Parses Google/NumPy style (Args:, Returns:).  
  * **Rust:** Parses Rustdoc (///, \# Panics).  
  * **Ruby:** Parses YARD (\# @param).  
  * **C:** Parses Doxygen (/\*\* @brief \*/).  
  * **Java:** Parses Javadoc and strips HTML tags.  
  * **PowerShell (Commit 95):** Parses Synopsis/Description/Parameter comments.  
* **C\# & ASP.NET:** Implemented csharpAdapter and aspnetAdapter (11/17) to handle complex, framework-heavy apps (Razor Pages, Controllers), parsing tags and XML docs.  
* **Hangfire & Queue Workers (Commit 89):** The csharp-queue-worker benchmark fixture modeled a **Hangfire** recurring job setup, proving the system can trace execution paths through job scheduling libraries.  
* **Roslyn Integration (Commit 66):** The team integrated a slice of the **Roslyn compiler source** as a benchmark fixture, proving the system can handle the "meta" case of analyzing a C\# compiler written in C\#.  
* **ASP.NET Core Support (Commits 86–87):** The team added specific support for **Blazor** and **ASP.NET Core** configurations (appsettings.json, Startup.cs). The graph can now trace telemetry from a Blazor client-side component all the way to the server-side controller, crossing the JS/C\# boundary.  
* **PowerShell Support (Commits 93–94):** The system expanded to DevOps/Automation by adding a powershellAdapter (11/20). It parses .ps1 dot-sourcing and .psm1 manifests, proving the "Universal" claim includes scripting and glue code.  
* **The Pathfinder (inspect-pathfinder):** A new CLI tool (11/18) allows developers to query the graph: "Show me the path from Artifact A to Artifact B." This is critical for debugging the complex webs of dependencies in framework apps. Commit 85 hardened this tool to support "fanout" queries (show all dependencies) and circular dependency detection.  
* **Heuristic Modularization (Commit 67):** The monolithic fallbackInference.ts was refactored into focused heuristic modules (e.g., pythonHeuristic, rustHeuristic), ensuring the system remains maintainable as languages are added.

**Key Deliverables:**

* cAdapter.ts, rubyAdapter.ts, csharpAdapter.ts, aspnetAdapter.ts, pythonAdapter.ts, rustAdapter.ts, javaAdapter.ts, powershellAdapter.ts.  
* inspect-pathfinder.ts (Graph debugging tool).  
* LiveDocsGenerator (The engine that writes the docs).  
* fallbackInference.ts (Refactored into inference/heuristics/ modules).

## **Part IV: The Visual Era (Late November)**

*Seeing the system. From "Squiggly Lines" to "Treemaps".*

### **Phase XVII: The Visualizer & The Dual-IDE Workflow**

Dates: November 19–24, 2025

Scope: Commits 11/20–11/22, 96–100, 102, 104-105

The team grew frustrated with text-only diagnostics. They needed to see the system structure.

* **The Visualizer Engine (live-docs:visualize):** A standalone webview application was built to render the graph.  
* **Interactive Stabilization (Commits 96–100):** The team pushed hard on usability.  
  * **Selection Glow (Commit 96):** Active nodes now have a visual highlight (red sphere), improving wayfinding in dense graphs.  
  * **Robust Navigation (Commit 100):** Synchronized the "Circuit" and "Local" views so clicking in one updates the other, fixing earlier state drift issues.  
  * **Error Resilience (Commit 99):** Hardened the server to handle missing docs gracefully, ensuring the visualizer doesn't crash on incomplete data.  
  * **Graph Rendering Fixes (Commit 102):** Patched the visualize-explorer CLI to ensure consistent rendering even with partial graph data, stabilizing the ForceGraph component.  
* **The "Antigravity" Collaboration:** The team adopted a dual-IDE workflow. The User leveraged **Gemini/Project IDX** ("Antigravity") for rapid UI/visualization prototyping, while **Copilot/VS Code** handled the backend integration. This "Play to Strengths" strategy accelerated the UI work.  
* **Local Map Modularization (Commit 104):** The monolithic localView.ts was decomposed into a proper MVC architecture (controller, render, connections, runtime). This mirrors the backend refactor, proving the frontend codebase is maturing.  
* **The Stacked Column Layout (Commit 105):** The "Local Map" view was completely redesigned. Instead of a chaotic web, it now uses a strict **3-Column Stack** (Inbound \-\> Center \-\> Outbound). This dramatically improves readability for complex nodes and aligns with the "Explorer" vision.  
* **Circuit Connector Stabilization (Commit 103):** Fixed jittery connectors in the Circuit View by caching anchor points.  
* **The Treemap Solver:** The team built a custom layout engine (layoutUtils.ts) to solve the "physics" of arranging thousands of nodes into a readable 4:3 canvas (11/24).  
* **Capability Tracking (Commit 98):** The Vision doc was updated with specific "Capability IDs" (CAP-001–CAP-008), formally tracking the visualization goals.

**Key Deliverables:**

* packages/scripts/src/live-docs/explorer/: The Visualization Client.  
* layoutUtils.ts: The Treemap Layout Solver.  
* live-docs:visualize: The CLI command to launch the explorer.

## **Part V: The Self-Reflection (December)**

*The machine looks in the mirror. Chat Archaeology, System Generation, and Static Publishing.*

### **Phase XVIII: Visual Maturation & The Frontend Refactor (Dec 1–5)**

Dates: December 1–5, 2025

Scope: Commits 12/2–12/4, 107–108, 112–114

The Visualizer evolved from a working prototype into a robust, architected application.

* **The "Stacked" Local Map:** The Local View was completely redesigned. Instead of a chaotic web, it now features **Three Stacked Columns**: Inbound (Left) \-\> Active Node (Center) \-\> Outbound (Right). This "single lane" approach dramatically improved readability.  
* **Bezier Connectors:** The connection lines were upgraded to smooth Bezier curves that route intelligently around nodes, replacing the previous straight lines.  
* **The Frontend Refactor (Commit 108):** Echoing the backend's earlier evolution, the frontend code grew too dense. The monolithic localView.ts was decomposed into a proper MVC-like structure (controller.ts, render.ts, connections.ts, runtime.ts).  
* **CSS Architecture:** The global styles.css was split into domain modules (circuit.css, local.css, shell.css), proving the frontend was no longer a "script" but an "app."  
* **Test-Backed Styling (Commit 108):** A "Purple Glow" visual treatment was added to nodes that have corresponding test files, bringing the "Test Coverage Indicator" feature to life.  
* **The "Battle of the Stacking Context" (12/5):** The chat logs reveal a fierce technical struggle with CSS Stacking Contexts. Overlaying interactive HTML cards with SVG connectors created complex z-index traps, requiring deep debugging of the browser's paint layers to ensure nodes remained clickable while lines appeared correctly layered.  
* **The "Internals" Node (Commit 113):** A major UI innovation. Every node card now has a special **"Internals"** row at the bottom. This captures dependencies that are *implementation details* (private imports) rather than public API contracts. It routes generic inbound connections to this bucket, cleaning up the graph.  
* **Interactive Polish (Commit 112):** The frontend received a "Phase A/B/C" upgrade including a **Tuning Panel** (live physics sliders), single-click sidebar focus, and clickable Type Reference badges.  
* **Viewport Refactor (Commit 114):** A technical debt cleanup creating a .viewport-layer to ensure HTML and SVG layers scale and pan in perfect unison, solving alignment drift.

### **Phase XIX: The Grand Refactor & Systems Depth (Dec 6\)**

Date: December 6, 2025

Scope: Commits 12/6.1–12/6.3, 109–111, 125, 121, 123

The system underwent a massive refactor to pay down technical debt and pushed into deep symbol analysis for systems languages.

* **The "Core" Refactor (Commit 125):** The shared core.ts file had ballooned to 3,254 lines. It was exploded into **14 focused modules** (rendering.ts, symbolExtraction.ts, dependencies.ts, etc.), decisively enforcing the "500-line limit" rule across the entire stack.  
* **The "Generator" Refactor (Commit 126):** The backend generator.ts (1847 lines) was decomposed into **10 capability modules** (plans/componentPlan.ts, rendering.ts, etc.). *Note: Committed early Dec 7 but represents the culmination of the Dec 6 refactor.* \* **Type Reference Extraction (Commit 109):** The typeScriptAdapter was upgraded to extract complex types (extends, implements, function return types, parameter types). It includes an isPrimitiveOrBuiltin filter to ignore noise (e.g., string, Promise). This is the backend logic that powers the "Cyan Lines" visualization.  
* **Type Resolution Engine (Commit 110):** The Live DocsGenerator now builds a symbolIndex to resolve type names (e.g., returns: Promise) to concrete file paths, creating clickable links instead of just text strings.  
* **Systems Language Depth (C/C++):** The cAdapter was upgraded to parse specific function declarations and macro usages, enabling the graph to trace individual C function calls across files (Commit 123). *Note: While the intent was C-focused, the implementation incidentally enables deep C++ support due to shared syntax.* \* **C\# Inheritance Visualization:** The C\# adapter was upgraded to parse inheritance (: BaseClass). The graph now shows class hierarchies, not just file imports.  
* **Chat Archaeology (Commit 121):** The team performed a massive documentation sweep, updating 30 Layer 3 docs to match the implemented reality and filling in "Purpose/Notes" sections by referencing historical chat logs.

### **Phase XX: The Static Era & System Stewardship (Dec 7\)**

Date: December 7, 2025

Scope: Commits 12/7.1–12/7.3, 126–129

The project matured from a "Development Tool" into a "Publishing Platform," while continuing to harden the core.

* **Static Explorer (Commit 127):** The entire visualization engine can now be bundled into a static HTML/JSON payload (4MB), ready for GitHub Pages hosting. It no longer requires a running Node server to view the graph. npm run live-docs:visualize:static.  
* **Headless Local Map API (Commit 127):** A new /local-map endpoint exposes the layout logic as JSON. This was a critical "Two-Birds-One-Stone" feature that enabled both the static site export AND easier debugging for LLMs (by providing structured data instead of screenshots).  
* **Markdown Detail Panel (Commit 127):** The sidebar now renders full Markdown, making the Explorer a complete documentation reader.  
* **The "French Corset" (Commits 128):** A specific UI refinement to self-loop connectors. The curves were tapered and aligned ("French Corset" style) to reduce visual clutter in the Local View.  
* **System Stewardship (Commit 126):** The team split system/generator.ts (1847 lines) into 10 capability modules and fixed a critical UTF-8 binary detection bug that was flagging files with box-drawing characters as binary. This reinforces the "Architectural Stewardship" theme.  
* **Stability & Performance (Commits 128-129):** Hardened the analysis engine against real-world data issues (skipping \>1MB files, fixing Windows drive letter casing). Added specific audit infrastructure to prevent barrel file re-export false positives in npm run graph:audit.

### **Phase XXI: Architectural Stewardship (Dec 8\)**

Date: December 8, 2025

Scope: Commits 130, 131, 132, 133

The team continued the aggressive paying down of technical debt while polishing the visualization and expanding language support.

* **"Big Four" Refactor (Commit 130):** The team modularized workspaceIndexProvider.ts (1461 lines) and graphStore.ts (1216 lines) into focused capabilities (directory scanning, MDMD parsing, SQL mappers). This completed the breakup of the project's largest files, adhering strictly to the "Independent Improvement" principle.  
* **Visual Tuning (Commit 131):** The "Semantic Coloring" (pink for extends, amber for implements) was removed to reduce visual noise. All connection lines now use a uniform blue-to-green gradient, letting the Reference Badges carry the semantic weight. Default tuning values were locked in (Column Gap=100, Hover Dim=0.4).  
* **Internals Highlighting (Commit 132):** Fixed a bug where hovering the "Internals" pseudo-symbol row failed to highlight connected neighbor symbols. This ensured bidirectional traceability even for private implementation details.  
* **Polyglot TypeReferences (Commit 133):** The symbol-level graph intelligence was expanded to **Ruby** (inheritance/mixins), **Rust** (trait implementations), **Java** (extends/implements), and **Python** (base classes). This proved that the "Universal Code Explorer" vision could scale to semantic details in any language.

### **Phase XXII: The Web Tier & Visual Polish (Dec 9\)**

Date: December 9, 2025

Scope: Commits 12/9.1–12/9.2, 134, 135

The system achieved "Full Stack" visibility and professional-grade polish.

* **The Web Tier (Commit 135):** New htmlAdapter and cssAdapter enable the graph to trace dependencies from React components \-\> CSS imports \-\> Image/Font assets.  
* **Document Root Detection (Commit 135):** Smart logic resolves server-relative paths (/assets/logo.png) by probing common roots (public, wwwroot, static).  
* **Binary Asset Stub Live Docs (Commit 135):** The system now generates "Stub Live Docs" for binary assets (images, fonts, videos), allowing them to participate in the dependency graph. Deleting banner.png will now correctly show a ripple effect on index.html.  
* **Sticky Highlighting (Commit 134):** A "Click-to-Pin" interaction model allows users (and mobile devices) to freeze the highlight state of a symbol, enabling deep path tracing without holding the mouse.  
* **Design System (Commit 134):** Hardcoded hex values were replaced with a unified theme.css variable system, standardizing the UI language.

### **Phase XXIII: Adapter Stewardship & Precision (Dec 10-11)**

Date: December 10–11, 2025

Scope: Commits 136, 137, 138, 139

The team continued the "Architectural Stewardship" campaign, focusing on precision engineering in the analysis layer.

* **Adapter Refactoring (Commit 136):** The python.ts (1145 lines) and csharp.ts (1120 lines) adapters were decomposed. The docstring parsing logic was extracted into focused modules (python.docstring.ts, csharp.xmldoc.ts), bringing all source files under the 1,000-line threshold.  
* **Barrel File Precision (Commit 136):** A critical flaw in test coverage metrics was identified where "Barrel Files" (files that just re-export others) were causing tests to be credited with covering *every* re-exported module. The team implemented isBarrelFile() heuristics to block this transitive expansion, restoring accurate precision metrics (\>90%).  
* **Symbol Extraction Precision (Commit 137):** Fixed a bug where JSDoc tags (like @param) were being extracted as symbols if they appeared in backticks. Restricted extraction to only H4 headings. This pushed symbol precision from 92% to **99.85%**.  
* **Disambiguation Suffixes (Commit 138):** Live Docs append suffixes like (interface) to symbols, but the analyzer returns bare names. The parser was updated to strip these suffixes, achieving **100% symbol precision**.  
* **Glob Pattern Support (Commit 139):** The C\# Oracle was updated to support glob patterns (minimatch) for include/exclude logic, fixing a recall issue in the Roslyn fixture where out-of-scope files were being analyzed.

### **Phase XXIV: Configuration & Vision Alignment (Dec 12\)**

Date: December 12, 2025

Scope: Commits 140, 141

The team finalized the separation between consumer defaults and repository-specific configuration, and solidified the strategic vision.

* **Configurable Defaults (Commit 140):** The CLI and Explorer were updated to switch consumer defaults to .live-documentation/source and .md extensions, aligning with the standard deployment model. However, the repository itself retained the legacy .mdmd configuration via a new .live-docs.config.json override file.  
* **Pipeline Hardening (Commit 140):** The livedocs \-- \--report pipeline was fixed to forward configuration correctly to the lint and report stages. Fixture verification was also updated to respect the configured base layer paths.  
* **Vision Refactor (Commit 141):** The team made a strategic decision to simplify the product vision. **SpecKit** (the prompt library) was formally classified as a **Prescriptive** tool (Design/Planning), while **Live Documentation** was classified as a **Descriptive** tool (Implementation Mirror). The "Bidirectional Authoring" feature (editing code via docstrings) was moved to the wishlist to focus on the core value proposition: **Drift Diagnostics**.  
* **Audit Correction (Commit 141):** Adjusted snapshot-workspace.ts to stop treating Spec-Kit design docs as Live Documentation mirrors, clearing spurious "missing implementation" audit flags.

### **Phase XXV: CI/CD & The Pipeline (Dec 13\)**

Date: December 13, 2025

Scope: Commits 142–148

After 141 commits of linear, local-only development, the team established a robust **CI/CD infrastructure** to enforce the "Safe to Commit" standard in the cloud.

* **Infrastructure Genesis (Commit 142):** Implemented a full suite of GitHub Actions workflows: ci.yml (headless integration tests), pages.yml (static explorer deployment), codeql.yml (security scanning), and dependabot.yml (automated updates).  
* **The Linux Reality Check (Commits 144, 146):** The integration test harness—developed on Windows—failed on Linux CI runners. The team fixed hardcoded assumptions about npm-cli.js paths and relaxed timeouts (5s → 15s) to accommodate slower cloud environments.  
* **Diagnostic Logic Fix (Commit 147):** A critical flake in US1 tests revealed a flaw: clearDiagnostics was waiting for *all* global diagnostics to clear. On CI, unrelated extensions (like TypeScript) kept this non-empty. The logic was aligned with US2 to simply wait for the command to execute.  
* **Static Site Hosting (Commit 145):** Fixed asset pathing (/static/ → ./static/) to allow the Live Docs Explorer to run when hosted on a GitHub Pages subpath.  
* **Pipeline Logic & Renaming (Commit 148):** \* **Gitignore Parity:** Updated the Live Docs generator to respect .gitignore, preventing the generation of stale docs for build artifacts (.d.ts, .js).  
  * **Pipeline Reorder:** Moved live-docs:generate *before* graph:audit in the safe:commit pipeline to prevent false positives.  
  * **Identity Sync:** Finally renamed the root package from copilot-improvement-experiments to live-documentation.

### **Phase XXVI: Cross-Platform Integrity (Dec 14\)**

Date: December 14, 2025

Scope: Commit 149

The team tackled the final friction point between Windows development and Linux CI: **Line Endings**.

* **Integrity Normalization:** The benchmark fixture verification failed on CI because git clone on Windows produced CRLF line endings, changing the file hashes compared to Linux (LF). The team updated the hashing algorithm to normalize line endings (CRLF → LF) before computing digests, ensuring consistent integrity checks across all platforms.

### **Phase XXVII: Identity Unification (Dec 14\)**

Date: December 14, 2025

Scope: Commit 150

With the CI/CD pipeline green and the integrity checks robust, the team executed the final cleanup of legacy branding to prepare for a public package release.

* **The Final Rename (Commit 150):** Purged the remaining "Copilot Improvement Experiments" and "Link-Aware Diagnostics" references.  
  * **Extension ID:** Switched from copilot-improvement.link-aware-diagnostics to live-documentation.live-documentation.  
  * **Runtime Paths:** The SQLite database now lives at .live-documentation/live-documentation.db.  
  * **Package Scopes:** Renamed @copilot-improvement/server to @live-documentation/server, unifying the monorepo namespaces.  
* **Terminology Cleanup:** Renamed mdmdParser.ts to liveDocParser.ts and mdmd-layer-audit.ts to layer-audit.ts, reducing the cognitive load of internal acronyms in favor of the clear product name: **Live Documentation**.

### **Phase XXVIII: CI Stabilization & The Linux Rollup Saga (Dec 15\)**

Date: December 15, 2025

Scope: Commits 151–154, 156

The team faced the final boss of cross-platform CI: npm ci vs optionalDependencies.

* **The Rollup Issue (Commits 152, 153):** The package-lock.json generated on Windows did not include the Linux binary for @rollup/rollup-linux-x64-gnu. This caused npm ci to fail on Linux runners. The team mitigated this by switching to npm install (to allow platform-specific resolution) and adding explicit installs for the missing binary.  
* **Test Hardening (Commit 154):** Integration tests for the "Acknowledgement Workflow" were flaky on slower CI runners. The timeout was increased from 20s to 30s to provide more headroom.  
* **Dependency Stewardship (Commits 155, 156):** Removed unused dependencies (zod from shared) and updated glob to fix security alerts, keeping the lockfile lean.

### **Phase XXIX: The Network Air-Gap (Dec 15\)**

Date: December 15, 2025

Scope: Commit 157

The "Offline-First" philosophy was upgraded to a **Security Guarantee**.

* **Layer 1 \- Static Analysis:** Implemented audit-network-usage.ts to scan the codebase for fetch, axios, http.get, and other network patterns.  
* **Layer 2 \- Runtime Enforcement:** Introduced a safeFetch() wrapper that throws NetworkPolicyViolation for any non-localhost URL.  
* **Layer 3 \- CI Verification:** The network audit now runs on every commit.  
* **Documentation:** Created SECURITY.md to formalize the project's data privacy stance and "Air-Gap" architecture.

### **Phase XXX: Packaging & Mobile Polish (Dec 15\)**

Date: December 15, 2025

Scope: Commits 158, 159

The team prepared the codebase for public consumption and real-world usage scenarios.

* **The CLI Package (Commit 158):** Created packages/cli to expose the live-docs command via npx, routing to the existing scripts.  
* **Pre-Publish Metadata:** Added description, keywords, license, and homepage fields to all package.json files, preparing for npm publish.  
* **Mobile Explorer Polish (Commit 159):** Fixed critical usability issues on mobile devices.  
  * **Scrolling:** Enabled overflow-y: auto on the sidebar for short viewports.  
  * **Touch:** Added touch-action: none to prevent the browser from hijacking pan gestures.  
  * **Selection:** Added user-select: none to prevent accidental text selection while dragging nodes.

### **Phase XXXI: The Explorer's Truth (Dec 16\)**

Date: December 16, 2025

Scope: Commits 174–177

Triggered by an architectural critique from NotebookLM (an AI evaluating the codebase), the team pivoted to focus on **Data Provenance** and **User Transparency**. The system needed to not just show the graph, but explain *why* the graph looked that way.

* **The Cybernetic Feedback Loop:** The "NotebookLM Critique" highlighted that users might mistrust the graph if they couldn't see its origins. The team immediately prioritized features to expose data quality and sources (Commit 177).  
* **The "Honest" Default (Commit 175):** The Explorer's default view was switched from the flashy "Circuit Board" (Macro) to the functional "Local Map" (Micro). This creates a shareable, URL-driven experience (?view=local\&node=...) that focuses the user on immediate utility rather than spectacle.  
* **Knowledge Sources View (Commit 177):** A new "4th View" was added to the Explorer. It serves as a dashboard for the system's own health, showing:  
  * **Data Provenance:** Whether data is from a static bundle or a live language server.  
  * **Health Warnings:** Automatically flagging "Tech Debt" hotspots like Hub Modules and Barrel Files (high fan-out/fan-in nodes).  
* **Persistence (Commit 176):** The Explorer now remembers user preferences (tuning, filters) via versioned localStorage, making it a true persistent application rather than just a transient viewer.  
* **Maintenance (Commit 174):** Addressed a breaking change in zod@4 (Dependabot) to keep the CI pipeline green.

### **Phase XXXII: The Pathfinder & The Debt Collector (Dec 17\)**

Date: December 17, 2025

Scope: Commits 178–182

The team focused on advanced "GPS-style" navigation within the graph and automating the governance rules.

* **Visual Pathfinding (Commits 180, 181):** A new **Pathfinding Toolbar** allows users to select a "Start" and "End" artifact/symbol. The system executes a BFS (Breadth-First Search) on the graph and visualizes the shortest path as a clickable "Hop Strip," solving the "How is A connected to B?" question visually.  
* **Symbol-Level Inspection (Commit 179):** The inspect CLI was upgraded to support symbol-specific pathfinding (--from "file.ts\#Symbol"). This enables precise debugging of dependency chains down to the function level.  
* **Focus & Pinning (Commit 178):** The Explorer interaction model was refined with **Click-to-Pin**. Pinning a symbol now dims all unrelated nodes and paths, allowing the user to trace specific data flows through a noisy graph.  
* **Automated Governance (Commit 182):** The team implemented a **Tech Debt Detector** script that runs as part of the safe:commit pipeline. It proactively warns on files violating the "1000-line limit" and flags files that haven't been touched in 30 days, turning the project's "Constitution" into executable code.  
* **UX Polish (Commit 182):** A collapsible sidebar was added to reclaim screen real estate, and the Force Graph now opens a detail panel on click instead of triggering a jarring navigation event.

### **Phase XXXIII: The Multi-Hop Revolution (Dec 18\)**

Date: December 18, 2025

Scope: Commits 183–184

The Local Map evolved from a static "Three-Column" view into a dynamic **"Path Mode"** engine capable of visualizing multi-step narrative journeys (FROM → VIA → TO).

* **Multi-Hop Architecture (Commit 184):** A massive frontend refactor transformed the visualizer.  
  * **Reactive State:** Introduced a StateStore (Observable pattern) to manage complex UI state, moving away from ad-hoc controller logic.  
  * **Pure Math:** Extracted layout and geometry logic into pure modules (layout-math.ts, connection-geometry.ts), backed by 153 new unit tests.  
  * **Path Mode UI:** The view now dynamically renders a **FROM / VIA / TO** column layout when a path is active, visualizing the entire hop sequence in a single linear narrative.  
* **Dual-Direction Pathfinder (Commit 183):** The CLI pathfinder was upgraded to support simultaneous **Outbound** (Dependency) and **Inbound** (Dependent) tracing. This allows developers to answer both "What does this break?" and "What breaks this?" in a single query.  
* **Precision Signal (Commit 184):** The team implemented a **Barrel File Resolution** fix. The resolution engine now intelligently prefers the "Origin Definition" over the "Re-export" when linking symbols, significantly reducing noise in the graph.

### **Phase XXXIV: The Great Decoupling (Dec 19\)**

Date: December 19, 2025

Scope: Commits 185–186

The project executed its largest-ever frontend refactor, breaking the monolithic Explorer client into focused, independent modules. This was coupled with a comprehensive audit and update of the documentation to match the current reality.

* **Frontend Extraction (Commit 186):** The explorer client was systematically decomposed to improve maintainability and testability.  
  * **CLI Logic:** inspect.ts was split into 11 modules (72% reduction in file size).  
  * **Viewer Client:** index.ts, render.ts, and controller.ts were exploded into specialized domains: bootstrap, persistence, panels, card-factory, layout-factory, and interaction-handlers.  
  * **Test Coverage:** This decoupling enabled the addition of **72 new unit tests** for the extracted pure functions, significantly increasing frontend reliability.  
* **Documentation Refresh (Commit 185):** A massive "Chat Archaeology" effort reconciled the public docs with the private code.  
  * **README Rewrite:** The project's "front door" was updated with a new tagline ("Universal Map for Any Codebase") and detailed sections on the Explorer's three views (Circuit, Local, Force).  
  * **Spec-Kit Verification:** The team used chat history to audit the completion status of 10+ major tasks (US1-3, CAP-030) and mark them as DONE in the tracking files.  
  * **Authored Content Injection:** "Purpose" and "Notes" sections were populated for 13+ Layer-4 files, ensuring that the generated documentation carries human context.

## **Part VI: The New Year (January 2026\)**

*The project returns from the holiday break. Focus shifts to data portability and visual hierarchy.*

### **Phase XXXV: The Export Era & Visual Identity (Jan 3\)**

Date: January 3, 2026

Scope: Commit 189

After a two-week holiday hiatus, the team returned with a focus on **Data Portability**—ensuring the "Live Documentation" wasnt trapped inside the tool.

* **The "Take It With You" Feature:** The Explorer received a massive capability upgrade: **Markdown Export**.  
  * **Single File:** A "Download Markdown" button in the detail panel allows users to extract the raw documentation for any specific node.  
  * **Bulk Export:** A new "Export Documentation" panel in the Knowledge Sources view creates a combined markdown file of the entire system, turning the graph back into a linear book.  
* **Archetype Badges:** The visual language was refined with **Archetype Badges**. Nodes now display Unicode icons (●/✔/◆) with color-coded borders to instantly denote their role (e.g., Test, Implementation, Specification) without reading text.  
* **Full Context Rendering:** A regex bug that limited the Detail Panel to showing only the "Purpose" section was fixed. The panel now renders the full \#\# Authored block (including "Notes"), ensuring no human context is hidden from the user.

### **Phase XXXVI: Security Hardening & The Generative Gate (Jan 6\)**

Date: January 6, 2026

Scope: Commits 194–198

The team returned to work with a focus on security hardening, resolving a subtle race condition in the test suite, and formally defining the strategic role of Generative AI.

* **Security Audit (Commits 194, 195):** The team proactively resolved multiple CodeQL security alerts.  
  * **Command Injection:** Replaced exec() with execFile() in all visualizer scripts to prevent shell injection, and added strict port validation (1–65535) to the server startup logic.  
  * **XSS Prevention:** Implemented rigorous HTML escaping for node names and archetype badges in the visualizer to prevent DOM injection attacks.  
* **The "Race Condition" Saga (Commits 196, 197):** A classic debugging narrative unfolded.  
  * *The Symptom:* Integration tests for diagnostics were flaking on CI.  
  * *The Band-Aid:* The team initially blamed "CI slowness" and bumped test timeouts from 60s to 90s (Commit 196).  
  * *The Root Cause:* A deeper investigation revealed that knowledgeFeedController.initialize() was being called without await in the settings sync logic. This meant tests were querying the system before it had finished re-indexing.  
  * *The Fix:* The team properly awaited the initialization promise, eliminating the race condition and allowing test timeouts to be reduced back to 45s (Commit 197).  
* **The Generative Gate (Commit 198):** The project codified its strategy for LLM integration, defining two distinct roles for AI:  
  * **Extractive AI (CAP-009):** Allowed to discover relationships (edges) between existing artifacts.  
  * **Generative AI (CAP-009):** Allowed to synthesize new documentation, but *only* under strict budget caps and with explicit user invocation.  
  * **Brownfield Respect (CAP-010):** The system adopted a "Bridge, Don't Replace" philosophy, ensuring that existing documentation is respected and linked, rather than overwritten.

### **Phase XXXVII: The Knowledge Bundle & Semantic Cleanup (Jan 7\)**

Date: January 7, 2026

Scope: Commits 199–205

The team dedicated a day to deep cleaning the repository structure and expanding the "Knowledge" concept.

* **Semantic Test Reorganization (Commit 199):** The test suite was completely reorganized. Deprecated "User Story" folders (us1/, us2/) were replaced with semantic domains: core/graph, core/ripple, and integrity/hygiene. This renaming reflects the transition from "active development" to "long-term maintenance."  
* **Deprecation (Commits 200, 201):** The team purged vestigial code, including the inspectSymbolNeighbors extension command (superseded by the CLI) and obsolete migration scripts.  
* **The Knowledge Bundle (Commits 204, 205):** The Explorer now recursively scans for linked markdown files (READMEs, Chat Logs, Specs) and **bundles them** into the static export and server view. This means the "Static Site" isn't just the graph; it's the *entire* relevant documentation tree, fully navigable offline.  
* **Parity & Polish (Commits 202, 203):** Fixed a critical "multiline regex gotcha" that was hiding authored "Notes" sections, and ensured that features like "Download All" work identically in both Server Mode and Static Mode.

### **Phase XXXVIII: The Context Graph (Jan 8\)**

Date: January 8, 2026

Scope: Commit 206

The team merged the "Knowledge Bundle" concept with the "Force Graph," turning the visualizer into a true map of *everything*. Not just code, but the *conversations* about the code.

* **Related Docs Nodes:** Implemented a "Show Related Docs" toggle that projects bundled markdown files (chat history, READMEs, specs) directly into the 3D Force Graph.  
* **Visual Language:** These context nodes are styled as "Purple Nodes" (related: prefix) to distinguish them from the blue/green code artifacts, creating a visual distinction between "The System" and "The Narrative."  
* **Brownfield Integration:** This fulfills CAP-010 (Brownfield Integration), allowing the system to map the "Soft Graph" (human intent) alongside the "Hard Graph" (compiler reality).  
* **Performance:** To prevent graph explosion, the scanner was refined to strictly use single-hop discovery, successfully mapping 452 links to 60 high-relevance bundled files without overwhelming the visualizer.

### **Phase XXXIX: Structured Export (Jan 9\)**

Date: January 9, 2026

Scope: Commits 207–208

The team completed the data portability vision by enabling structured ZIP exports directly from the client.

* **Client-Side Zip Generation (Commit 207):** Added jszip dependency to the frontend. This allows the Explorer to bundle hundreds of markdown files into a structured .zip archive entirely in the browser, respecting SECURITY.md (no cloud processing).  
* **Flexible Export Options:** The Export Panel now offers a matrix of choices:  
  * **Scope:** Live Docs Only / Related Docs Only / All Docs.  
  * **Format:** Single Markdown File (Concatenated) / ZIP Archive (Structured).  
* **Documentation Sync (Commit 208):** Updated the specification tracking to mark LD-1101/1102/1103 as complete, formally closing out the "Brownfield Integration" user story. This aligns the project management artifacts with the shipped code.

### **Phase XL: The Great Simplification (Jan 12\)**

Date: January 12, 2026

Scope: Commit 209

In a radical architectural pivot, the team deleted the SQLite database that had served as the project's state engine since Phase I.

* **"Live Docs ARE the Database":** The GraphStore and RippleAnalyzer were completely removed. The system now treats the file system (Live Docs) as the single source of truth for the graph.  
* **Stateless Architecture:** Broken link detection and diagnostics are now pure functions of the current file state, eliminating synchronization bugs where the database would drift from disk.  
* **Massive Cleanup:** \* **Deleted \~50+ files:** Including the entire SQLite layer and associated complexity.  
  * **Code Reduction:** Simplified the main server entry point from \~587 lines to \~160 lines (a 72% reduction).  
  * **Link Repair:** Fixed 83 broken internal links in documentation that were discovered during the rigorous audit accompanying this refactor.  
* **Strategic Implication:** This move solidifies the project's identity. It is not a database that *indexes* code; it is a tool that *reads* code and docs directly, enforcing the "Source is Truth" philosophy.

### **Phase XLI: The Three-Source Truth (Jan 13\)**

Date: January 13, 2026

Scope: Commits 210–212

Following the deletion of the database, the team aggressively pruned the remaining "Over-Engineering" from the system, specifically the external knowledge feed infrastructure.

* **Descoping LSIF/SCIP (Commit 210):** The complex "Knowledge Feed" system—designed to ingest pre-computed graphs from other tools—was removed. The architecture was formally simplified to just three inputs:  
  1. **Polyglot AST:** Native parsing (Tree-sitter) for static structure.  
  2. **LLM Inference:** Opt-in AI for semantic connections.  
  3. **VS Code Symbols:** Runtime data from the editor.  
* **Dead Script Cull (Commit 211):** With the GraphStore gone, the old standalone visualization scripts (visualize-circuit.ts, visualize-sonar.ts) were broken and redundant. They were deleted, leaving the integrated Explorer as the sole visualization client.  
* **Polyglot Precision (Commit 212):** The team proved the viability of the "Stateless" model by implementing complex dependency resolution for **Java** (package-to-path mapping) and **Rust** (mod/crate logic) purely through file analysis, without an indexer.

### **Phase XLII: The Polyglot Connectivity (Jan 14\)**

Date: January 14, 2026

Scope: Commits 213–215

The team focused on closing the "Accuracy Gap" across all supported languages, enabling symbol-to-symbol connectivity for non-JS languages and establishing a rigorous benchmark standard.

* **Symbol-to-Symbol Linking (Commit 213):** The Live Docs engine was upgraded to support precise anchor resolution for **Java** and **Rust**. The Explorer now links directly to specific methods or structs (e.g., \#Analyzer) instead of just pointing to the file "Internals" bucket.  
* **Python Resolution (Commit 214):** Added sophisticated Python import resolution logic, handling relative imports (from . import x), package roots (\_*init*\_.py detection), and standard library filtering. This brings Python parity with TypeScript for graph traversal.  
* **The Rosetta Stone Initiative (Commit 215):** To prove that the graph is truly "Universal," the team created a set of **Rosetta Stone Fixtures**—isomorphic programs implemented identically in TypeScript, Python, Java, C\#, Rust, C, and Ruby.  
  * **Purpose:** To calibrate the detection heuristics so that the *same* code structure produces the *same* graph shape, regardless of the language.  
  * **Outcome:** The TypeScript implementation achieved 100% precision/recall, setting the gold standard for the other language adapters to match.

### **Phase XLIII: The Go Expansion & Supply Chain Cleanup (Jan 15\)**

Date: January 15, 2026

Scope: Commits 216–218

The team expanded the polyglot engine to support Go, improved configuration file connectivity, and finalized the architectural cleanup by purging native binary dependencies.

* **Go Support (Commit 216):** Added the **Go Adapter**, Heuristic, and Oracle. The go-rosetta fixture was implemented, ensuring Go projects now enjoy the same deep dependency analysis as TypeScript and Java.  
* **JSON Path Resolution (Commit 217):** Introduced a smart JSON adapter that resolves file paths within configuration files relative to the JSON file itself. This instantly connected the rosetta-manifest.json to its referenced source files in the Explorer graph.  
* **The Final Purge (Commit 218):** With the SQLite database removed in Phase XL, the better-sqlite3 dependency and its complex native build scripts were deleted. This creates a purely JS/TS runtime, significantly reducing the supply chain attack surface and simplifying cross-platform CI.

### **Phase XLIV: The Orphan Hunt & Rosetta Perfection (Jan 16\)**

Date: January 16, 2026

Scope: Commits 219–223

The team focused on identifying "Islands" (disconnected nodes) to improve graph hygiene and finalizing the Rosetta Stone benchmarks.

* **Orphan Detection (Commits 219, 220):** Implemented a two-pronged strategy to find nodes with zero dependencies and zero dependents.  
  * **CLI:** live-docs:lint now warns about "Islands," flagging potential dead code or adapter gaps.  
  * **GUI:** A new "Disconnected Nodes" panel in the Explorer visualizes these islands, allowing users to inspect them without losing context.  
* **Rosetta Completion (Commit 221):** Added test files to all 8 Rosetta fixtures (TS, Py, Java, C\#, Rust, C, Go, Ruby). This exercise exposed and fixed subtle heuristic bugs in Ruby (single quotes), C (function defs), and Go (\_test.go exclusion).  
* **Java Casing Fix (Commit 222):** Fixed a critical bug in Java same-package detection where class names were being lowercased, breaking links to PascalCase files. Java Rosetta recall hit 100%.  
* **The 100% Milestone:** With these fixes, **all 8 language fixtures** in the Rosetta suite achieved **100% Precision and Recall**, proving that the regex-based heuristics are robust enough for standard architectural patterns across the polyglot stack.

### **Phase XLV: The Hub-Busting & Statistical Rigor (Jan 17-18)**

Date: January 17–18, 2026

Scope: Commits 224–226

The team matured the system's analytical engine from simple connectivity to **Network Science** and fixed long-standing topological distortions.

* **Degree-Corrected Co-Activation (Commit 224):** Implemented a statistical background model () to normalize edge weights. This prevents "Hub Nodes" (like barrel files) from creating false-positive semantic clusters just because they have high connectivity.  
* **The De-Barreling (Commit 225):** The team deleted the packages/shared/src/index.ts mega-barrel. This artificial "Star Topology" was obscuring the natural clustering of the codebase. By forcing direct subpath imports, the graph instantly relaxed into distinct, logical clusters (e.g., the Oracle cluster decoupled from the Core).  
* **Architectural Documentation (Commit 226):** Formalized these complex concepts into Layer 3 documentation (co-activation-clustering.mdmd.md and polyglot-adapters.mdmd.md), ensuring the math and the inventory of 16 language adapters are permanently recorded.

### **Phase XLVI: Interaction Fidelity (Jan 26\)**

Date: January 26, 2026

Scope: Commits 227–230

After a week-long hiatus, the team returned to focus exclusively on the tactile feel of the Explorer—fixing jarring layout shifts, ensuring controls only appear when relevant, and solving a normalization bug that broke symbol highlighting.

* **Context-Aware Controls (Commit 227):** The zoom controls (+/-/Γƒ▓) were hidden for the Knowledge Sources and Force Graph views, where they were irrelevant or redundant. They now appear only in the Circuit Board and Local Map via dynamic body class toggling.  
* **Pin Highlighting Fix (Commit 228):** Resolved a critical bug where pinning a symbol failed to highlight its connections due to a format mismatch (slug symbol-name vs. display name SymbolName). A normalization layer now ensures consistent matching across all graph edges.  
* **Vertical Centering Stability (Commit 229):** Fixed a visual glitch where collapsing symbols (during pinning) caused the column layout to jump. The system now dynamically re-centers the column *before* redrawing connections, ensuring a smooth, stable transition.  
* **Research Conclusion (Commit 230):** The team finalized the "Compiler Truth" strategy, deciding to adopt SCIP indexers for non-TS languages and replacing the sparse Roslyn fixture with a full Newtonsoft.Json clone for C\# benchmarking.

### **Phase XLVII: The SCIP Standard (Jan 27\)**

Date: January 27, 2026

Scope: Commits 231–235

This phase represents a critical maturity milestone: the team stopped "grading their own homework" (using regex oracles to test regex heuristics) and adopted **Compiler-Backed Ground Truth** using the Source Code Indexing Protocol (SCIP). This officially breaks the circular validation loop for TypeScript, C\#, and Go.

* **The SCIP Pivot (Commit 233):** Introduced scip-to-expected.ts, a tool that generates expected.json files by reading SCIP indexes produced by real compilers.  
  * **TypeScript:** Validated basic, layered, and rosetta fixtures against the TypeScript compiler's own understanding.  
  * **C\#:** Replaced the heuristic oracle with a SCIP-based oracle using scip-dotnet.  
  * **Go:** Added SCIP support for the new gorilla/mux benchmark fixture.  
* **New Benchmarks:** \* **C\#:** Swapped the sparse Roslyn checkout for a full clone of Newtonsoft.Json (Commit 232).  
  * **Go:** Added gorilla/mux as a real-world vendor fixture (Commit 235).  
* **Cleanup (Commit 231):** Removed the "self-similarity" benchmarking mode, a vestige of the database era, making ast (accuracy) the sole default mode for all tests.

### **Phase XLVIII: The Narrative Sync (Jan 28\)**

Date: January 28, 2026

Scope: Commit 236

The team paused feature work to perform a comprehensive audit of the project's history against the Project Development Journey. This wasn't just copy-editing; it was a "Truth Reconciliation" exercise, ensuring that the documented history (themes, incidents like the 11/15 data loss) matched the raw chat logs. This reinforced the "Living Repository" principle.

* **Narrative Synchronization:** The audit confirmed the alignment of the project's vision with its execution, leading to the formal adoption of themes like "Code Like Clay" and "Roadblocks Are Opportunities."  
* **Tooling Cleanup:** The team marked the end of an era by formally deprecating the graph:\* suite of commands in favor of the unified live-docs:\* CLI, cleaning up technical debt accumulated during the prototyping phases.

### **Phase XLIX: The Go Refinement (Jan 29\)**

Date: January 29, 2026

Scope: Commits 237–238

The team returned to the "Polyglot Accuracy" campaign, specifically targeting Go. By fixing ASCII sorting bugs and intra-package symbol detection, the go-mux benchmark jumped to 76.8% precision, and later 90.9% precision after stripping comments and strings.

* **Heuristic Precision (Commit 237):** Improvements to localeCompare logic and symbol detection allowed the system to accurately map complex Go package structures, resolving false positives in the benchmark suite.  
* **Tree-Sitter Foreshadowing:** The commit laid the scaffolding for a **Tree-Sitter** module, hinting at the next major architectural leap: fusing the regex heuristics with a true CST (Concrete Syntax Tree) parser for even greater accuracy.  
* **Aggressive Filtering (Commit 238):** The team implemented stripCommentsAndStrings and a common variable blocklist for Go, reducing false positives from 13 to 4 edges and pushing go-mux precision to **90.9%**.

### **Phase L: The Syntax Unification (Jan 29\)**

Date: January 29, 2026

Scope: Commits 239–240

The team consolidated the scattered regex utilities into a unified LanguageSyntax module, preparing the codebase for the future Tree-sitter integration and removing duplicated logic across adapters and heuristics.

* **The Shared Interface (Commit 239):** Created packages/shared/src/languages/, implementing a unified LanguageSyntax interface for 9 languages (Go, C, C\#, TypeScript, Python, Rust, Ruby, Java, PowerShell).  
* **Async-First:** The new interface was designed to be async-compatible from the start (stripCommentsAndStrings returns a Promise), ensuring no breaking changes will be needed when WASM-based Tree-sitter parsers are integrated.  
* **Refinement & Conservatism (Commit 240):** The team renamed ignoredIdentifiers to frameworkTypes and adopted a conservative approach. They realized that heuristics need aggressive filtering (to avoid noise) while parsers need minimal filtering (to avoid false negatives), leading to a cleaner separation of concerns.  
* **SCIP Pathing:** Fixed a critical path resolution bug in the SCIP oracle for C\# (--path-prefix), allowing csharp-newtonsoft-json to be validated against a true compiler-backed ground truth.

### **Phase LI: The Union of Truth (Jan 30\)**

Date: January 30, 2026

Scope: Commits 241–242

The team achieved a pivotal integration milestone by fusing the heuristic oracle with Tree-sitter data to create a "Super-Truth."

* **Refactoring for Nuance (Commit 241):** The method stripCommentsAndStrings was renamed to stripComments to reflect a more sophisticated understanding: deleting string literals destroys code in interpreted languages (Python f"", JS backticks, C\# $"..."). Preserving strings prevents false negatives.  
* **The Union Approach (Commit 242):** The expected.json generation logic was rewritten. Instead of relying solely on the Oracle, the system now computes **Oracle ∪ Tree-Sitter**. This ensures that the "Golden Master" includes high-fidelity edges from the parser while retaining the broader reach of the heuristics, creating a significantly more robust standard for accuracy.

### **Phase LII: The Containerized Pivot (Feb 3\)**

Date: February 3, 2026

Scope: Commits 243–245

The team executed a decisive infrastructure pivot to resolve persistent cross-platform friction in the polyglot toolchain.

* **Tree-Sitter Stability (Commit 243):** Resolved a critical race condition in the WASM loader using a mutex, ensuring stable test execution during parallel runs.  
* **The Dev Container Strategy (Commit 244):** To support the SCIP indexers (which often fail on Windows due to path/JVM issues), the team introduced a **GitHub Codespaces-compatible Dev Container**. This provides a standardized Linux environment pre-loaded with .NET 10, Java 21, Go, and Python 3.12, eliminating "works on my machine" issues.  
* **Cross-Platform Hardening (Commit 245):** The new container environment was hardened with xvfb support for headless integration tests and safe.directory fixes. Crucially, the team normalized hash computation to use relative paths, ensuring that documentation checksums are identical across Windows (D:\\...) and Linux (/workspaces/...).

### **Phase LIII: The JSDoc & Config Hygiene (Feb 15\)**

Date: February 15, 2026

Scope: Commits 246–247

The team focused on "Documentation as Code" enforcement and eliminating dead architectural weight.

* **CLI Defaults Hardening (Commit 246):** Fixed a critical usability gap where live-docs:report and live-docs:orphans ignored the .live-docs.config.json file. This ensures consistent behavior between the CLI and the VS Code extension, especially in the new Dev Container environment.  
* **JSDoc Enforcement (Commit 247):** Added eslint-plugin-jsdoc to the linting pipeline, enforcing documentation for exported symbols. The team supported this by proactively adding rich, history-backed JSDoc to 36 key symbols, linking them back to their origin chats ("Archaeology-Backed Documentation").  
* **Dead Code Purge (Commit 247):** Deleted the entire packages/shared/src/rules/ module (6 files). This vestigial code from the old "Rules Engine" (Phase XII) had zero consumers after the stateless refactor (Phase XL), and its removal significantly simplifies the mental model of the shared library.

### **Phase LIV: The SCIP Migration (Feb 17\)**

Date: February 17, 2026

Scope: Commits 248–250

The project achieved a massive validation milestone by replacing hand-coded oracles with compiler-grade SCIP indexers for nearly all languages.

* **Refactoring the Truth (Commit 248):** Aggressively purged dead code (15 unused types) and centralized LanguageSyntax logic into a pure-data factory pattern, eliminating \~100 lines of boilerplate across 9 language adapters.  
* **JSDoc Depth (Commit 249):** Continued the "Archaeology-Backed Documentation" campaign, adding deep JSDoc to 35 critical-tier files to ensure the code explains *itself*.  
* **The SCIP Migration (Commit 250):** Deleted \~3,600 lines of legacy heuristic oracle code. The system now validates its regex heuristics against the strict, compiler-verified reality produced by scip-java, scip-python, rust-analyzer, etc. This definitively ends the era of "grading our own homework."

### **Phase LV: The Great De-AI (Feb 17\)**

Date: February 17, 2026

Scope: Commits 251–252

In a strategic "pivot to simplicity," the team formally descoped all internal LLM integration, realizing that deterministic tools (Tree-sitter, SCIP) had closed the polyglot gap.

* **Descoping LLM (Commit 251):** Removed all LLM-related goals from the vision and requirements docs. The rationale: users bring their own AI; the tool doesn't need to be one.  
* **The Purge (Commit 252):** Deleted 24 source files related to Ollama, analyzeWithAI, and confidence calibration. This removed a massive amount of "speculative complexity," leaving a leaner, faster, 100% deterministic core.

### **Phase LVI: The Diagnostics Extinction (Feb 18\)**

Date: February 18, 2026

Scope: Commits 253–255

The team finalized the pivot away from being a "Linter" to being an "Explorer" by deleting the legacy diagnostics engine.

* **The Extinction Event (Commit 253):** Deleted the entire diagnostics subsystem (38 files, 7,328 lines). This code, which powered the "Writer's Loop" in Phase I, was deemed obsolete in the face of the new web-based Visual Explorer. The extension is now a thin client for the Explorer.  
* **SlopCop Precision (Commit 254):** Fixed a subtle bug in the Markdown fence parser where inner backticks incorrectly closed outer code blocks. This ensures the auditor correctly parses nested documentation.  
* **JSDoc Completion (Commit 255):** Completed the JSDoc campaign. Every exported symbol in the codebase is now documented, with zero ESLint warnings.

### **Phase LVII: Experience Consolidation & Monolith Extraction (Feb 20\)**

Date: February 20, 2026

Scope: Commit 256

The team executed a decisive refinement of the user experience and the internal architecture, focusing on "Headless" consumption and dismantled the largest remaining monolith in the codebase.

* **Documentation Fact-Check:** Descoped drift diagnostics (CAP-006) and Explorer-based editing. Formally codified the **"Prompt File Strategy"** (CAP-009) to replace built-in AI: Live Documentation will ship redistributable prompt/instruction files that teach third-party AI agents how to navigate the graph.  
* **Experience Vision Reconstruction:** Rewrote the project's interaction model to define 6 consumption surfaces and 5 user personas, formally centering the markdown files as the "product" and all other surfaces (CLI, Explorer, API) as "views."  
* **The Explorer Refactor:** Dismantled the 1763-line index.ts monolith. Extracted dataLoader.ts (bundled docs fetching), download.ts (export logic), and views/forceGraphView.ts (3D visualization), bringing the entry point down to 941 lines and adhering to the project's stewardship rules.  
* **Tech Debt Purge:** Deleted the final vestiges of better-sqlite3, obsolete refactor plans, and redundant scripts, achieving a net reduction of dead code weight.

### **Phase LVIII: Convention Decontamination & Scaffolding Retirement (Feb 23\)**

Date: February 23, 2026

Scope: Commits 257–259

The project formally outgrew its bootstrapping scaffolding, transitioning from a workspace with specialized "Spec-Kit" rules into a mature, extension-agnostic product.

* **Local Map Logic Correction (Commit 257):** Resolved critical pathfinding direction bugs in the Explorer. Fixed a column-role mismatch in the 2-node special case and a symbol-parameter swap in multi-hop mode that was causing connections to fail or point to the wrong symbols.  
* **MDMD Decontamination (Commit 258):** In a major "Generalization" pass, hardcoded MDMD workspace conventions were scrubbed from the software layer. The system is now truly extension-agnostic, deriving link routing, download filenames, and prefix stripping from graph configuration rather than assuming .mdmd.md.  
* **Internal Rename & Back-Compat:** Renamed internal types from Mdmd\* to LiveDoc\* (e.g., LiveDocDocumentDetails) to align with the product's identity, while retaining deprecated aliases for seamless workspace maintenance.  
* **Spec-Kit Retirement (Commit 259):** Retired the foundational specs/ and .specify/ folders. Unique architectural knowledge, BDD scenarios, and domain model descriptions were losslessly migrated into permanent MDMD Layer 2 and 3 artifacts, consolidating the documentation library.  
* **Instruction Hardening:** Updated copilot-instructions.md to reflect the retired scaffolding and provide a "Living Library" of links to the newly migrated permanent knowledge layers.

### **Phase LIX: The Comprehension Accelerator & The Unifying Thesis (Mar 9\)**

Date: March 9, 2026

Scope: Commit 260

The team expanded the strategic horizons of the project, formally defining new use cases centered around codebase comprehension and complex environment unification.

* **The Unifying Thesis:** Codified the project's core philosophy: *"We can-and-should reverse polyglot code into a common MarkDown convention so that we can reason about a workspace in numerous ways with ease."*  
* **External Comprehension:** Added use cases for running Live Documentation on unfamiliar, external open-source projects (like BrainSimIII) to accelerate learning and contribution.  
* **Unity & Game Development:** Explored the extreme polyglot complexity of Unity game projects (C\#, ShaderLab, HLSL, YAML manifests, prefabs), proving the architecture's potential to unify divergent code branches.  
* **Documentation Polish:** Refined Layer 1 guides and introduced explicit cross-references to the project's historical journey, weaving the narrative directly into the user onboarding experience.

### **Phase LX: The Reality Check & Database Purge (Mar 9\)**

Date: March 9, 2026

Scope: Commit 261

The team performed a final sweep of vestigial state artifacts and established a critical new governance rule for AI interactions.

* **The Final Database Purge:** Deleted the last remaining .db files and empty db/ directories from the early prototyping phases, completely severing the project's ties to its SQLite past.  
* **The "Reality Check" Mandate:** Codified a strict rule for AI agents: *Audit Shipped Capabilities First*. After an AI proposed "new" features that had actually shipped months prior (like URL persistence and the Tuning Panel), the team mandated that all future design synthesis must ground itself in the current implementation before proposing expansions. This combats the LLM tendency to treat every feature request as greenfield development.  
* **Pipeline Hygiene:** Fixed Markdown heading collisions to restore a green live-docs:lint build.

### **Phase LXI: The Serverless Explorer (Mar 10\)**

Date: March 10, 2026

Scope: Commit 262

The project fully embraced its identity as a static, document-driven platform by retiring its live HTTP server.

* **Server Retirement:** The Node.js Express server (server/index.ts) was permanently deleted. The visualize:static command was merged into the primary visualize command, meaning the Explorer is now exclusively generated as a portable, offline-ready HTML/JSON bundle.  
* **Glob Gap Closure:** Expanded the configuration to include \*.html, \*.css, and \*.json files across the workspace, bringing 11 new internal scaffolding files into the Live Documentation graph.  
* **HTML DOM Extraction:** Enhanced the HTML adapter to extract DOM id attributes as Public Symbols, allowing the graph to trace dependencies from JavaScript right into the DOM structure (e.g., mapping 66 UI surface area symbols in template.html).  
* **Chat Archaeology:** Authored detailed Purpose/Notes sections for all 13 newly exposed Live Docs, linking them back to the original Nov/Dec 2025 chat sessions.

### **Phase LXII: Proximity Resolution & Pipeline Hardening (Mar 10-11)**

Date: March 10-11, 2026

Scope: Commits 263-265

The team focused on precision engineering, eliminating hallucinated graph edges and repairing the CI pipeline following the serverless architecture shift.

* **Phantom Edge Elimination (Commit 265):** Deleted the legacy detectInheritance() module. The old regex-on-raw-source approach was generating phantom extends/implements edges by matching inside string literals and templates. Type references are now strictly and correctly threaded through the parsed metadata pipeline.  
* **Proximity-Aware Resolution (Commit 265):** Solved a major polyglot symbol clash issue where multiple files (like the Rosetta fixtures) exported the same symbol name (e.g., Entry). The system now uses a createProximityAwareComparator() to resolve these clashes, intelligently prioritizing the file closest in the directory tree to the importing consumer.  
* **Pipeline Repairs (Commit 263):** Restored the GitHub Pages deployment workflow by pointing it to the newly unified static CLI command. The team also purged 177 lines of dead TypeScript oracle infrastructure (a holdover from the SCIP migration) and patched the benchmark regeneration script to handle .NET 10 pathing gracefully.  
* **Dependency Stewardship (Commit 264):** Executed a comprehensive dependency bump via Dependabot, updating GitHub Actions, ESLint, Vitest, and core parser utilities to keep the toolchain modern and secure.

### **Phase LXIII: Rosetta Parity & Polyglot Consensus (Mar 11\)**

Date: March 11, 2026

Scope: Commit 266

The team introduced a rigorous cross-language testing framework to prove that the system can map abstract architectural patterns consistently, regardless of the underlying programming language.

* **The Rosetta Parity Test:** Added a comprehensive test suite asserting that when Live Docs are generated for the exact same programmatic architecture across all 8 Rosetta Stone fixtures (C, C\#, Java, Python, Ruby, Rust, TypeScript, Go), the resulting structural documentation matches.  
* **Consensus Assertions:** The system now structurally asserts parity for edge topology, symbol presence, node coverage, and leaf/foundation invariants across the polyglot stack, requiring a ≥6/8 cross-language consensus to pass.  
* **Adapter Precision:** Fixing these new parity assertions drove deep improvements in several language adapters, successfully hitting a 96/96 green consensus score:  
  * **C Adapter:** Upgraded to successfully extract anonymous typedef struct/enum { } Name; patterns and multi-line function declarations.  
  * **C\# Adapter:** Added the ability to resolve using Alias \= Namespace; directives, successfully preventing broken edges when aliases are used.  
  * **Java Adapter:** Implemented detection for same-package class references that lack explicit import statements.

### **Phase LXIV: Circuit Board Progressive Disclosure & Monolith Extraction (Mar 18\)**

Date: March 18, 2026

Scope: Commit 267

The team tackled the final massive frontend monolith, decomposing the legacy UI architecture into pure, testable layout modules while introducing significant visual enhancements.

* **The Circuit View Refactor:** Dismantled the 741-line circuitView.ts monolith into 9 modular files following a pure-function decomposition pattern. Code was logically separated into domains like state.ts (expand/collapse handling), aggregation.ts (metric rollup), and squarify.ts (treemap layout), backed by 54 new focused unit tests.  
* **The "Two-Zone" Layout Engine:** Replaced the homogenous treemap with a mathematically rigorous layout that visually separates files from directories. Directories are rendered as "squarified" tiles in the upper zone (using the Bruls/Huizing/van Wijk 2000 algorithm), while source files render as uniform cards in a flex grid in the bottom zone.  
* **Progressive Disclosure:** Solved macro-architecture navigation by introducing spatial anchoring. Users can now drill deep into directories via an interactive breadcrumb navigation bar, while dimmed sibling strips along the edges preserve context about peer directories and file counts.

### **Phase LXV: The Membrane Map Architecture (Mar 22\)**

Date: March 22, 2026

Scope: Commit 268

The team formalized the next major evolutionary leap for the Visual Explorer: The Membrane Map. This design unifies the macro (Circuit Board) and micro (Local Map) views into a single, continuous semantic zoom experience.

* **The Unified View Continuum:** Addressed the UX friction of context-switching between separate views. The new aspiration allows users to zoom seamlessly from directory tiles → file cards → dependency neighborhoods using CSS transitions rather than tab switching.  
* **Layer-3 Architecture:** Authored the comprehensive membrane-map.mdmd.md specification detailing the successor's architecture, including four rendering modes (Browse, Explore, Compare, Path), namespace mapping for C\#, and edge bundling mechanics.  
* **Strategic Forward Referencing:** Updated 14 architectural documents (instructions, vision, specs, roadmap) to officially designate the Membrane Map as the planned successor to the legacy dual-view system, laying the groundwork for the next phase of frontend development.

## **Vision Evolution Log**

* **Oct 16 (Phase I):** "Link-Aware Diagnostics." (Linter for Docs).  
* **Oct 20 (Phase III):** "Semantic Graph Intelligence." (Symbol-aware Linter).  
* **Oct 22 (Phase V):** "Active Workspace Intelligence." (Proactive Indexer).  
* **Late Oct (Part II):** "Polyglot Accuracy Engine." (Mathematical verification across languages).  
* **Early Nov (Phase XIV):** "Automated Truth." (Oracles generating ground truth from source).  
* **Mid Nov (Part III):** "Live Documentation Platform." (Generating documentation from code).  
* **Late Nov (Part IV):** "Visual Code Explorer." (Interactive Maps via Dual-IDE workflow).  
* **Early Dec (Part V):** "Self-Aware System." (Linking Code to History/Chat).  
* **Mid Dec (Phase XX):** "Static Publishing Platform." (Docs that live anywhere).  
* **Dec 9 (Phase XXII):** "Full-Stack Web Explorer." (HTML/CSS/Asset graph integration).  
* **Dec 10 (Phase XXIII):** "Precision & Refactoring." (Adapter cleanup and test metric fixes).  
* **Dec 12 (Phase XXIV):** "Drift-First Refocus." (Explicitly deferring bidirectional authoring).  
* **Dec 13 (Phase XXV):** "Automated Governance." (CI/CD pipelines enforcing the rules).  
* **Dec 14 (Phase XXVII):** "Identity Unification." (Complete purge of legacy branding).  
* **Dec 15 (Phase XXIX):** "Network Isolation & Pre-Publish." (Security guarantees and npm readiness).  
* **Dec 16 (Phase XXXI):** "The Explorer's Truth." (Self-auditing provenance and health transparency).  
* **Dec 17 (Phase XXXII):** "Pathfinding & Stewardship." (A to B navigation and automated debt monitoring).  
* **Dec 18 (Phase XXXIII):** "Narrative Pathfinding." (Multi-hop visual storytelling).  
* **Dec 19 (Phase XXXIV):** "Modular Maturity." (Frontend decoupling and comprehensive documentation sync).  
* **Jan 3 (Phase XXXV):** "Portable Knowledge." (Exportable docs and archetype badges).  
* **Jan 6 (Phase XXXVI):** "The Generative Gate." (Security hardening and codified LLM strategy).  
* **Jan 7 (Phase XXXVII):** "Contextual Bundling." (Including referenced docs in the graph explorer).  
* **Jan 8 (Phase XXXVIII):** "The Context Graph." (Visualizing the soft graph of intent alongside the hard graph of code).  
* **Jan 9 (Phase XXXIX):** "Structured Export." (Client-side ZIP archiving of the knowledge base).  
* **Jan 12 (Phase XL):** "The Great Simplification." (Removing SQLite to make files the database).  
* **Jan 13 (Phase XLI):** "The Three-Source Truth." (Descoping LSIF/SCIP to focus on AST/LLM/Symbols).  
* **Jan 14 (Phase XLII):** "The Polyglot Connectivity." (Rosetta Stone benchmarks and symbol-level resolution for Java/Python/Rust).  
* **Jan 15 (Phase XLIII):** "The Go Expansion." (Go language support and final database dependency purge).  
* **Jan 16 (Phase XLIV):** "Orphan Detection & Benchmark Perfection." (100% score on all 8 Rosetta languages).  
* **Jan 17 (Phase XLV):** "Topological Hygiene." (Statistical normalization and removing barrel file distortion).  
* **Jan 26 (Phase XLVI):** "Interaction Fidelity." (Polishing zoom, pinning, and centering mechanics).  
* **Jan 27 (Phase XLVII):** "The SCIP Standard." (Compiler-backed ground truth for benchmarks).  
* **Jan 28 (Phase XLVIII):** "Narrative Synchronization." (Aligning the story with the chat logs).  
* **Jan 29 (Phase XLIX/L):** "Syntax Unification." (Consolidating regex patterns and preparing for Tree-Sitter).  
* **Jan 30 (Phase LI):** "The Union of Truth." (Fusing Oracle and Tree-Sitter for ground truth generation).  
* **Feb 3 (Phase LII):** "The Containerized Pivot." (Dev Containers for consistent cross-platform tooling).  
* **Feb 15 (Phase LIII):** "The JSDoc & Config Hygiene." (Documentation enforcement and dead code purge).  
* **Feb 17 (Phase LIV):** "The SCIP Migration." (Replacing heuristic oracles with compiler indexers).  
* **Feb 17 (Phase LV):** "The Great De-AI." (Removing LLM integration to focus on deterministic tooling).  
* **Feb 18 (Phase LVI):** "The Diagnostics Extinction." (Deleting the legacy linter to focus on the Explorer).  
* **Feb 20 (Phase LVII):** "Experience Consolidation & Monolith Extraction." (Refining headless personas and refactoring the Explorer).  
* **Feb 23 (Phase LVIII):** "Convention Decontamination & Scaffolding Retirement." (Decoupling from MDMD hardcodes and retiring Spec-Kit).  
* **Mar 9 (Phase LIX):** "The Comprehension Accelerator." (Unifying thesis: reverse polyglot code into common markdown for reasoning).  
* **Mar 9 (Phase LX):** "The Reality Check." (Final database purge and the mandate to audit before proposing).  
* **Mar 10 (Phase LXI):** "The Serverless Explorer." (Retiring the HTTP server, closing the glob gap, and extracting HTML DOM symbols).  
* **Mar 11 (Phase LXII):** "Proximity Resolution & Pipeline Hardening." (Eliminating phantom string edges and adding directory-aware symbol linking).  
* **Mar 11 (Phase LXIII):** "Cross-Language Parity." (Asserting structural consensus across 8 languages and refining C/C\#/Java adapters).  
* **Mar 18 (Phase LXIV):** "Circuit Board Progressive Disclosure." (Extracting the frontend monolith and implementing two-zone squarified layouts).  
* **Mar 22 (Phase LXV):** "The Membrane Map." (Architecting the unified, zoomable treemap to replace the split Circuit/Local views).

## **Technical Themes & Motifs**

* **Offline-First & Air-Gapped:** Explicitly designed to run without cloud dependencies. Security is enforced via static audits and runtime fetch wrappers.  
* **Stateless Architecture:** The file system (Live Docs) is the database. This eliminates the "Drift Bug" category entirely.  
* **Deterministic Truth:** Intelligence is derived from AST parsers and SCIP indexers. The system rejects "hallucination" in favor of mathematical verification.  
* **Archaeology-Backed Documentation:** Code symbols are linked to chat logs, providing a holographic record of implementation and design intent.  
* **Isomorphic Calibration:** Using the Rosetta suite to ensure architectural patterns are detected consistently across a polyglot stack.  
* **"Code Like Clay":** MDMD documentation is molded alongside code, preserving human intent across infinite machine-regeneration cycles.  
* **Statistical Topology:** Using degree-corrected co-activation models to identify meaningful semantic clusters while ignoring "hub" noise.  
* **The Generative Gate:** Managing AI complexity through explicit invocation, budget caps, and human promotion of synthesized artifacts.  
* **Prescriptive vs. Descriptive:** A key architectural separation. Tools like SpecKit are *Prescriptive* (Plans/Design), while Live Documentation is *Descriptive* (Mirrors/Implementation). This distinction prevents the system from confusing "what we want" with "what we have."  
* **Cybernetic Feedback Loops:** The project actively uses AI (like NotebookLM) to critique its own architecture, creating a feedback loop where the AI acts as a "Red Team" to challenge the team's assumptions.  
* **The "Living" Repository:** The repository is now a complete holographic record of its own birth—Code, Docs, Tests, and *Conversations* are all inextricably linked.  
* **"SlopCop" & Data Hygiene:** An internal auditing engine polices the repo for broken links and invalid assets, ensuring high-quality input data.  
* **Documentation-Driven Development (DDD):** The discipline of spec \-\> plan \-\> task never wavered, allowing the project to scale to 250+ commits without collapsing under complexity.  
* **"Every Mess Is Our Mess":** In a single-contributor LLM-driven workspace, every workaround, every lowered threshold, every manual override is something the team will have to maintain. Fix root causes, not symptoms.  
* **"Roadblocks Are Opportunities":** When the team bumps into a problem—a failing test, a type mismatch, an unexpected edge case—they pause and get *excited*. These moments are where real development happens, not occasions for workarounds.