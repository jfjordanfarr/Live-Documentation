# **Project Development Journey**

## **Executive Summary**

*Status: Active Development (Dec 16, 2025\)*

"Copilot-Improvement-Experiments" began as an initiative to build an "IntelliSense for Documentation"—a system to prevent drift between markdown plans and implementation code.

Over the course of three months (Oct–Dec 2025), the vision expanded dramatically. It evolved from a simple linter into a **"Universal Code Explorer"**—a polyglot, visual, and self-aware system capable of traversing relationships across languages (TS, Python, Rust, C, HTML, CSS), visualizing them via interactive Treemaps, and even performing "Chat Archaeology" to link code back to the conversations that created it.

The project is built on the **"SpecKit"** methodology: a rigorous, prompt-driven governance layer where the **Architect (User)** and **Agent (Copilot)** work as a cybernetic team, enforcing "Documentation-Driven Development" at every step.

"The Team" Defined (Crucial Context for AI Agents):

Throughout this document, "The Team" refers exclusively to the cybernetic collaboration between:

1. **The Architect (User):** Provides vision, auditing, governance, and final sign-off.  
2. The Agent (GitHub Copilot/AI): Executes implementation, scaffolding, and analysis under the Architect's supervision.  
   There are no other human developers. If a task is described as "The Team's responsibility," it means it is YOUR responsibility (as the Agent) to execute it under the Architect's guidance.

## **The Experience Vision: How It Works**

*The canonical workflows for interacting with the system.*

The "Live Documentation" platform is designed to be used in four distinct "Loops," ranging from passive assistance to active exploration.

### **1\. The Writer's Loop (Passive Integrity)**

*Target User: Technical Writers, PMs*

* **Action:** The user edits a Markdown file (e.g., spec.md) and references a code file that doesn't exist or has moved.  
* **System Response:** The IDE immediately underlines the broken link with a "Squiggly Line" (Diagnostic).  
* **Resolution:** The user hover over the error, clicks **"Quick Fix,"** and selects the correct artifact from a searchable list. The system heals the link automatically.

### **2\. The Developer's Loop (Active Impact Analysis)**

*Target User: Software Engineers*

* **Action:** The developer modifies a core utility function (e.g., auth.ts).  
* **System Response:** The system calculates the "Ripple Effect"—identifying every file (code and docs) that depends on auth.ts.  
* **Visualization:** A "Diagnostics Tree" panel updates in real-time, showing a list of impacted items.  
* **Resolution:** The developer acknowledges the ripple, ensuring they check the downstream effects before committing.

### **3\. The Explorer's Loop (Visual Understanding)**

*Target User: Architects, New Onboarders*

* **Action:** The user runs the **Visualizer** (or clicks "Open Live Map").  
* **Interface:** A dedicated webview opens with three distinct views:  
  * **Circuit View:** A macroscopic "Motherboard" map of the entire system, showing clusters and hubs.  
  * **Local View:** A microscopic, node-centric column view. Center is the active file; Left is "Inbound" (who calls me?); Right is "Outbound" (who do I call?).  
  * **Chat Archaeology:** Clicking a node reveals the *conversational history* of that file—links to the specific chat logs where the code was written.  
* **Goal:** To "surf" the codebase visually, understanding architecture without reading code.

### **4\. The Maintainer's Loop (Data Hygiene)**

*Target User: Leads, Ops*

* **Action:** The user prepares a pull request.  
* **System Response:** The **"SlopCop"** engine runs as a git hook.  
* **Checks:**  
  * Are all links valid?  
  * Do all exported symbols have documentation?  
  * Are all referenced assets (images) present?  
* **Outcome:** The build fails if "Slop" is detected, ensuring the Knowledge Graph remains pristine.

## **Part I: The Foundation (October 16–27)**

*The "Bootstrapping" Era. Building the brain, the graph, and the rules.*

### **Phase I: The "SpecKit" Genesis & The Writer's Loop**

Scope: Commits 1–4

The project began with Governance. The team established the "Constitution" and the "SpecKit" prompt library. The first feature ("Link-Aware Diagnostics") was built to detect drift between Markdown and Code.

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
* **Phase VIII:** "SlopCop" (Data Hygiene & Asset Auditing).  
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

* **The Rules Engine:** Implemented RelationshipRuleProvider (wired into LinkInferenceOrchestrator) to validate every link before insertion into SQLite (e.g., preventing a "Vision" doc from "implementing" a "Code" file).  
* **Native Governance:** Introduced .github/instructions/instructions.instructions.md with applyTo fields. This effectively "programs the programmer" by leveraging the AI coding assistant's native capability to ingest context-specific instructions based on file patterns, ensuring the Agent follows protocol without requiring custom extension logic.

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
* **The LiveDocsGenerator (Commit 68):** This component was implemented to enable the **"Code Like Clay" methodology**. It reads the previous file, extracts the human sections using regex markers, and injects them into the new generation. This allows documentation to be both automated and authored, fulfilling the "molding" vision described in the governance docs.  
* **System Scaffolding (Commit 69):** The "Stage 0" concept was formalized with the scaffolding of the System Layer generator. This commit also updated the task list to reflect the massive scope expansion (13 closed tasks, 45 open tasks across 7 phases), cementing the new direction.  
* **System Mirroring (Commit 70):** The generator was extended to create a full directory mirror of the codebase in .live-documentation/system/. The team also hardened the anchor cleaning logic in audit-doc-coverage.ts to ensure "SlopCop" compliance for these new generated files.  
* **Core Refactor (Commit 81):** As the Live Docs logic grew, the team refactored the monolithic core.ts into parse.ts (extraction) and generate.ts (rendering), introducing a **Headless Harness** for faster, disk-free unit testing.  
* **MDMD Unification (Commit 82):** The team formalized **"Membrane Design MarkDown (MDMD)"** in the Copilot instructions. Crucially, they configured the generator to produce .mdmd files for the system mirror, effectively treating the generated artifacts as "Layer 4" specifications. This unifies "Authored Specs" and "Generated Docs" into a single, continuous hierarchy. The code also hardened configuration by replacing hardcoded paths with constants (DEFAULT\_LIVE\_DOC\_ROOT).  
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
* **C\# & ASP.NET:** Implemented csharpAdapter and aspnetAdapter (11/17) to handle complex, framework-heavy apps (Razor Pages, Controllers), parsing \<see\> tags and XML docs.  
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

### **Phase XIX: The Grand Refactor & Polyglot Depth (Dec 6\)**

Date: December 6, 2025

Scope: Commits 12/6.1–12/6.3, 109–111, 125, 121, 123

The system underwent a massive refactor to pay down technical debt and pushed into deep symbol analysis for systems languages.

* **The "Core" Refactor (Commit 125):** The shared core.ts file had ballooned to 3,254 lines. It was exploded into **14 focused modules** (rendering.ts, symbolExtraction.ts, dependencies.ts, etc.), decisively enforcing the "500-line limit" rule across the entire stack.  
* **The "Generator" Refactor (Commit 126):** The backend generator.ts (1847 lines) was decomposed into **10 capability modules** (plans/componentPlan.ts, rendering.ts, etc.). *Note: Committed early Dec 7 but represents the culmination of the Dec 6 refactor.*  
* **Type Reference Extraction (Commit 109):** The typeScriptAdapter was upgraded to extract complex types (extends, implements, function return types, parameter types). It includes an isPrimitiveOrBuiltin filter to ignore noise (e.g., string, Promise). This is the backend logic that powers the "Cyan Lines" visualization.  
* **Type Resolution Engine (Commit 110):** The LiveDocsGenerator now builds a symbolIndex to resolve type names (e.g., returns: Promise\<Widget\>) to concrete file paths, creating clickable links instead of just text strings.  
* **Systems Language Depth (C):** The cAdapter was upgraded to parse specific function declarations and macro usages, enabling the graph to trace individual C function calls across files (Commit 123). (Note: This also enables C++ support via common syntax features).  
* **C\# Inheritance Visualization:** The C\# adapter was upgraded to parse inheritance (: BaseClass). The graph now shows class hierarchies, not just file imports.  
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
* **Pipeline Logic & Renaming (Commit 148):**  
  * **Gitignore Parity:** Updated the Live Docs generator to respect .gitignore, preventing the generation of stale docs for build artifacts (.d.ts, .js).  
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

## **Technical Themes & Motifs**

* **Offline-First:** The system is explicitly designed to run without cloud dependencies or API keys. All intelligence is generated locally from the codebase itself.  
* **Network Isolation:** A multi-layer security strategy (Static Audit \-\> Runtime Enforcement \-\> CI Gate) ensures the extension never makes unauthorized outbound calls, enforcing a strict "Air-Gap" for user code.  
* **Squiggle-Driven Development:** The methodology relies on "Falsifiability First"—creating diagnostics (squiggly lines) that fail when documentation drifts from code, forcing the developer to fix the docs to clear the error.  
* **Prompt Engineering as Source Code:** The .prompt.md files remain the "operating system" for the development process.  
* **Documentation-Driven Development (DDD):** The discipline of spec \-\> plan \-\> task never wavered, allowing the project to scale to 100+ commits without collapsing under complexity.  
* **"SlopCop" & Data Hygiene:** The project consistently prioritized *cleaning* input data (whether markdown links or chat logs) to ensure high-quality output.  
* **The "Living" Repository:** The repository is now a complete holographic record of its own birth—Code, Docs, Tests, and *Conversations* are all inextricably linked.  
* **Prescriptive vs. Descriptive:** A key architectural separation. Tools like SpecKit are *Prescriptive* (Plans/Design), while Live Documentation is *Descriptive* (Mirrors/Implementation). This distinction prevents the system from confusing "what we want" with "what we have."  
* **Cybernetic Feedback Loops:** The project actively uses AI (like NotebookLM) to critique its own architecture, creating a feedback loop where the AI acts as a "Red Team" to challenge the team's assumptions.