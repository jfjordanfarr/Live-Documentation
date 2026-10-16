// The program. Each quoted include is found a different way: util.hpp beside
// this file, core/engine.hpp through -I include, src/shared/log.hpp through
// -I . (the workspace root). README.md lists what each resolution rule makes of them.
#include "util.hpp"
#include "core/engine.hpp"
#include "src/shared/log.hpp"
#include <vector>

int main() {
    std::vector<int> results;
    results.push_back(app_util());
    results.push_back(engine_run());
    log_line("include-dirs: done");
    return results.size() == 2 ? 0 : 1;
}
