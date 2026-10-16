# include-dirs

A small C++ program whose quoted includes tell apart the rules an analyzer could use to resolve a `#include "..."` without reading the build. Every unit is compiled with `-I include -I src -I .` (see `compile_commands.json`), so the compiler's own resolution of each include is known; `npm run oracle:index -- tests/integration/fixtures/include-dirs` writes what scip-clang resolved under those flags to `expected/compiler-edges.json`.

## Layout

| Path                                       | What it is                                                                                                                   |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `src/app/main.cpp`                         | The program. Includes `"util.hpp"`, `"core/engine.hpp"`, `"src/shared/log.hpp"` and `<vector>`, and calls one function from each |
| `src/app/util.hpp`, `src/app/util.cpp`     | `app_util()`, beside the file that includes it                                                                               |
| `include/core/engine.hpp`                  | Declares `engine_run()`; includes `"engine_detail.hpp"` and `"shared/log.hpp"`                                               |
| `include/core/engine_detail.hpp`           | `engine_detail_step()`, beside the header that includes it                                                                   |
| `src/core/engine.cpp`                      | Defines `engine_run()`; includes `"core/engine.hpp"`, which is not beside it                                                  |
| `src/shared/log.hpp`, `src/shared/log.cpp` | `log_line(const char*)`                                                                                                      |
| `vendor/other/util.hpp`                    | A decoy: the same base name as `src/app/util.hpp`, declaring `other_util()`. Nothing includes it                             |
| `tests/core/engine.hpp`                    | A decoy: the same tail `core/engine.hpp` as the real header, declaring `test_engine_run()`. Nothing includes it              |
| `extra/core/engine.hpp`                    | A second decoy with the tail `core/engine.hpp`, in a directory that sorts before `include/`, declaring `extra_engine_run()`. Nothing includes it |

## The rules

Three rules an analyzer could apply to a quoted include without reading the build:

- (a) only the including file's directory;
- (b) the including file's directory, then each of its ancestors up to the workspace root;
- (c) any directory in the workspace whose tail matches the include's directory part, a greedy rule that can match more than one file.
- (d) rule (b) with, at each directory it visits, that directory's `include/` and `src/` subdirectories tried as well, the common `-I include` and `-I src` layouts without reading the build.

The compiler looks in the including file's directory first, then in each `-I` directory in the order given.

## Each include under each rule

| Include                | From                      | The compiler finds                          | (a)                                     | (b)                                                                  | (c)                                                        | (d)                                                       |
| ---------------------- | ------------------------- | ------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------ |
| `"util.hpp"`           | `src/app/main.cpp`        | `src/app/util.hpp`                          | correct                                 | correct                                                              | `src/app/util.hpp` or the decoy `vendor/other/util.hpp`    | correct |
| `"core/engine.hpp"`    | `src/app/main.cpp`        | `include/core/engine.hpp`, by `-I include`  | nothing                                 | nothing: `src/app/core`, `src/core` and `core` hold no `engine.hpp`  | `include/core/engine.hpp` or a decoy, `tests/core/engine.hpp` or `extra/core/engine.hpp` | correct: `include/core/engine.hpp` under the root's `include/` |
| `"src/shared/log.hpp"` | `src/app/main.cpp`        | `src/shared/log.hpp`, by `-I .`             | nothing                                 | correct, at the workspace root                                       | correct: `src/shared` is the only directory with that tail | correct, at the workspace root |
| `"engine_detail.hpp"`  | `include/core/engine.hpp` | `include/core/engine_detail.hpp`            | correct                                 | correct                                                              | correct: the only `engine_detail.hpp`                      | correct |
| `"shared/log.hpp"`     | `include/core/engine.hpp` | `src/shared/log.hpp`, by `-I src`           | nothing                                 | nothing: `include/core/shared`, `include/shared` and `shared` do not exist | correct: `src/shared` is the only directory with that tail | correct: `src/shared/log.hpp` under the root's `src/` |
| `"core/engine.hpp"`    | `src/core/engine.cpp`     | `include/core/engine.hpp`, by `-I include`  | nothing                                 | nothing: `src/core/core`, `src/core` and `core` hold no `engine.hpp` | `include/core/engine.hpp` or a decoy, `tests/core/engine.hpp` or `extra/core/engine.hpp` | correct: `include/core/engine.hpp` under the root's `include/` |
| `"util.hpp"`           | `src/app/util.cpp`        | `src/app/util.hpp`                          | correct                                 | correct                                                              | `src/app/util.hpp` or the decoy `vendor/other/util.hpp`    | correct |
| `"log.hpp"`            | `src/shared/log.cpp`      | `src/shared/log.hpp`                        | correct                                 | correct                                                              | correct: the only `log.hpp`                                | correct |
| `<vector>`             | `src/app/main.cpp`        | the standard library                        | outside the workspace under every rule  |                                                                      |                                                            |  |

Build and run it: `g++ -std=c++17 -I include -I src -I . src/app/main.cpp src/app/util.cpp src/core/engine.cpp src/shared/log.cpp -o include-dirs && ./include-dirs`.
