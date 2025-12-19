# Test Report

- **Generated:** 2025-12-19T18:45:14.749Z
- **Git commit:** a0cc5de2bf577445251e3cb430e01d85cd9b9f8c
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
- **Durations:** 1009 ms, 974 ms, 973 ms
- **Average duration:** 985.33 ms
- **Max duration:** 1009.00 ms
- **Drift detected:** No

## Environment Summary

- **arch:** x64
- **nodeVersion:** v22.14.0
- **ollamaModel:** qwen3-coder:30b
- **platform:** win32

## Benchmark Artifacts

- ast-accuracy [mode: self-similarity] — recorded 2025-12-19T18:41:35.775Z (AI-Agent-Workspace\tmp\benchmarks\ast-accuracy.self-similarity.json)
- rebuild-stability [mode: self-similarity] — recorded 2025-12-19T18:41:38.744Z (AI-Agent-Workspace\tmp\benchmarks\rebuild-stability.self-similarity.json)
