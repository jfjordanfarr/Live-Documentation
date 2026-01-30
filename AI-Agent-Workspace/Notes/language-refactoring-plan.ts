/**
 * Language Module Refactoring Plan
 * 
 * This document outlines the migration from scattered per-language code
 * to consolidated `packages/shared/src/languages/{lang}/` folders.
 * 
 * Created: 2026-01-29
 */

/*
PHASE 1: Create packages/testing (DONE)
- [x] Create package.json, tsconfig.json
- [x] Copy fixtureOracles from shared/src/testing/fixtureOracles
- [x] Create index.ts barrel
- [x] Add to root workspaces

PHASE 2: Consolidate per-language code into languages/{lang}/
For each language: c, csharp, go, java, python, ruby, rust, typescript, powershell

Current locations:
- shared/src/languages/{lang}.ts         -> syntax.ts (strip comment/string patterns)
- shared/src/inference/heuristics/{lang}.ts -> heuristic.ts 
- shared/src/live-docs/adapters/{lang}.ts   -> adapter.ts
- shared/src/live-docs/adapters/{lang}.*.ts -> additional files (xmldoc, dependencies, docstring)

New structure per language:
  languages/{lang}/
    index.ts      - Barrel export for the language
    syntax.ts     - Comment/string stripping, framework types only
    heuristic.ts  - FallbackHeuristic (if exists)
    adapter.ts    - Live Doc adapter (if exists)
    *.ts          - Additional language-specific files

PHASE 3: Update imports across codebase
- Update all imports from old paths to new paths
- Delete old files after verification

PHASE 4: Simplify LanguageSyntax interface
- Remove aggressive isIgnoredIdentifier() blocklists
- Keep only: stripComments, stripStrings, stripCommentsAndStrings, frameworkTypes

Files that will be affected by import changes:
- packages/shared/src/inference/fallbackInference.ts
- packages/shared/src/live-docs/dependencies.ts
- packages/shared/src/live-docs/symbolExtraction.ts
- packages/shared/src/live-docs/adapters/index.ts
- packages/shared/src/inference/heuristics/index.ts
- packages/shared/src/languages/index.ts
- Tests for all of the above
*/

export {};
