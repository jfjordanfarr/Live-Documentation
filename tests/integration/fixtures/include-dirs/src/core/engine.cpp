// The header is not beside this file: core/engine.hpp is found through -I include.
#include "core/engine.hpp"

int engine_run() {
    log_line("engine_run");
    return engine_detail_step(21);
}
