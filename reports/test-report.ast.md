# Test Report

- **Generated:** 2026-01-27T19:14:04.134Z
- **Git commit:** cb24c79ba8a94e3d54c64273b8521e92d56b3ee5
- **Git branch:** main
- **Benchmark mode:** ast

## Benchmarks

### AST Accuracy

- **Mode:** ast
- **Thresholds:** precision 95.0%, recall 90.0%
- **Totals:**

| TP | FP | FN | Precision | Recall | F1 |
| - | - | - | - | - | - |
| 2396 | 52 | 144 | 97.9% | 94.3% | 96.1% |

- **Fixtures:**

| Fixture | Language | TP | FP | FN | Precision | Recall | F1 |
| - | - | - | - | - | - | - | - |
| TypeScript module graph smoke sample | typescript | 4 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| TypeScript layered reporting service | typescript | 8 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| Ky HTTP client repository | typescript | 95 | 4 | 0 | 96.0% | 100.0% | 97.9% |
| C translation unit with header inclusion | c | 3 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| C pipeline spanning multiple headers | c | 12 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| libuv repository | c | 148 | 0 | 111 | 100.0% | 57.1% | 72.7% |
| Python module imports and validation | python | 2 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| Python reporting pipeline with validators | python | 7 | 4 | 0 | 63.6% | 100.0% | 77.8% |
| Requests HTTP client repository | python | 55 | 15 | 0 | 78.6% | 100.0% | 88.0% |
| Rust logging facade (rust-lang/log) | rust | 13 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| Rust crate with helper modules | rust | 3 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| Rust analytics crate with IO and metrics | rust | 6 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| Java reporting application | java | 6 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| Java analytics service with layered modules | java | 12 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| C# diagnostics reporting sample | csharp | 13 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| C# WebForms hidden field propagation sample | csharp | 5 | 1 | 1 | 83.3% | 83.3% | 83.3% |
| Newtonsoft.Json serialization library | csharp | 1346 | 10 | 10 | 99.3% | 99.3% | 99.3% |
| OkHttp client repository | java | 527 | 18 | 22 | 96.7% | 96.0% | 96.3% |
| Ruby module graph for summary reporting | ruby | 5 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| Ruby CLI with layered services | ruby | 7 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| TypeScript Rosetta Stone (cross-language canonical program) | typescript | 12 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| Python Rosetta Stone (cross-language canonical program) | python | 12 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| Java Rosetta Stone (cross-language canonical program) | java | 18 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| C# Rosetta Stone (cross-language canonical program) | csharp | 22 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| Rust Rosetta Stone (cross-language canonical program) | rust | 12 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| C Rosetta Stone (cross-language canonical program) | c | 21 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| Ruby Rosetta Stone (cross-language canonical program) | ruby | 12 | 0 | 0 | 100.0% | 100.0% | 100.0% |
| Go Rosetta Stone (cross-language canonical program) | go | 10 | 0 | 0 | 100.0% | 100.0% | 100.0% |


## Environment Summary

- **arch:** x64
- **nodeVersion:** v22.14.0
- **ollamaModel:** qwen3-coder:30b
- **platform:** win32

## Benchmark Artifacts

- ast-accuracy [mode: ast] — recorded 2026-01-27T19:12:26.158Z (AI-Agent-Workspace\tmp\benchmarks\ast-accuracy.ast.json)
