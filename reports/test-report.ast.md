# Test Report

- **Generated:** 2026-03-30T19:31:18.072Z
- **Git commit:** da151a49b57bbea2e4e9148f7ca54e00f744a1b7
- **Git branch:** main
- **Benchmark mode:** ast

## Benchmarks

### AST Accuracy

- **Mode:** ast
- **Thresholds:** precision 95.0%, recall 90.0%
- **Totals:**

| TP | FP | FN | Precision | Recall | F1 |
| - | - | - | - | - | - |
| 843 | 161 | 1428 | 84.0% | 37.1% | 51.5% |

- **Fixtures:**

| Fixture | Language | TP | FP | FN | Precision | Recall | F1 |
| - | - | - | - | - | - | - | - |
| TypeScript module graph smoke sample | typescript | 4 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| TypeScript layered reporting service | typescript | 8 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| Ky HTTP client repository | typescript | 56 | 43 | 6 | 56.6% | 90.3% | 69.6% |
| C translation unit with header inclusion | c | 3 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| C pipeline spanning multiple headers | c | 12 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| Python module imports and validation | python | 2 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| Python reporting pipeline with validators | python | 7 | 4 | 0 | 63.6% | 100.0% | 77.8% |
| Requests HTTP client repository | python | 48 | 22 | 7 | 68.6% | 87.3% | 76.8% |
| Rust logging facade (rust-lang/log) | rust | 3 | 12 | 6 | 20.0% | 33.3% | 25.0% |
| Rust crate with helper modules | rust | 3 | 0 | 1 | 100.0% | 75.0% | 85.7% |
| Rust analytics crate with IO and metrics | rust | 8 | 0 | 3 | 100.0% | 72.7% | 84.2% |
| Java reporting application | java | 6 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| Java analytics service with layered modules | java | 12 | 0 | 1 | 100.0% | 92.3% | 96.0% |
| C# diagnostics reporting sample | csharp | 13 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| C# WebForms hidden field propagation sample | csharp | 6 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| OkHttp client repository | java | 473 | 72 | 1371 | 86.8% | 25.7% | 39.6% |
| Ruby module graph for summary reporting | ruby | 5 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| Ruby CLI with layered services | ruby | 7 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| TypeScript Rosetta Stone (cross-language canonical program) | typescript | 12 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| Python Rosetta Stone (cross-language canonical program) | python | 11 | 1 | 1 | 91.7% | 91.7% | 91.7% |
| Java Rosetta Stone (cross-language canonical program) | java | 17 | 1 | 7 | 94.4% | 70.8% | 81.0% |
| C# Rosetta Stone (cross-language canonical program) | csharp | 23 | 1 | 1 | 95.8% | 95.8% | 95.8% |
| Rust Rosetta Stone (cross-language canonical program) | rust | 14 | 0 | 8 | 100.0% | 63.6% | 77.8% |
| C Rosetta Stone (cross-language canonical program) | c | 21 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| Ruby Rosetta Stone (cross-language canonical program) | ruby | 12 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| Go Rosetta Stone (cross-language canonical program) | go | 13 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| gorilla/mux HTTP router | go | 44 | 5 | 16 | 89.8% | 73.3% | 80.7% |


## Environment Summary

- **arch:** x64
- **nodeVersion:** v22.22.0
- **platform:** linux

## Benchmark Artifacts

- ast-accuracy [mode: ast] — recorded 2026-03-30T19:27:42.768Z (AI-Agent-Workspace/tmp/benchmarks/ast-accuracy.ast.json)
