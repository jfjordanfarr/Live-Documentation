# Test Report

- **Generated:** 2026-01-16T20:22:40.333Z
- **Git commit:** 87548f95e725c1765d854e7705a22fd53c90830e
- **Git branch:** main
- **Benchmark mode:** self-similarity

## Benchmarks

### AST Accuracy

- **Mode:** self-similarity
- **Thresholds:** precision 95.0%, recall 95.0%
- **Totals:**

| TP | FP | FN | Precision | Recall | F1 |
| - | - | - | - | - | - |
| 4 | 0 | 0 | 100.0% | 100.0% | 100.0% |

- **Fixtures:**

| Fixture | Language | TP | FP | FN | Precision | Recall | F1 |
| - | - | - | - | - | - | - | - |
| TypeScript module graph smoke sample | typescript | 4 | 0 | 0 | 100.0% | 100.0% | 100.0% |


### Rebuild Stability

- **Mode:** self-similarity
- **Workspace:** simple-workspace
- **Iterations:** 3
- **Durations:** 1318 ms, 1166 ms, 1167 ms
- **Average duration:** 1217.00 ms
- **Max duration:** 1318.00 ms
- **Drift detected:** No

## Environment Summary

- **arch:** x64
- **nodeVersion:** v22.14.0, v22.21.1
- **ollamaModel:** qwen3-coder:30b
- **platform:** win32
- **providerMode:** local-only

## Benchmark Artifacts

- ast-accuracy [mode: self-similarity] — recorded 2026-01-16T20:20:20.305Z (AI-Agent-Workspace\tmp\benchmarks\ast-accuracy.self-similarity.json)
- rebuild-stability [mode: self-similarity] — recorded 2026-01-09T20:56:32.732Z (AI-Agent-Workspace\tmp\benchmarks\rebuild-stability.self-similarity.json)
