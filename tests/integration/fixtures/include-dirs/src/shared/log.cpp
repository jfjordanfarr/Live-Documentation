#include "log.hpp"
#include <cstdio>

void log_line(const char* message) {
    std::printf("%s\n", message);
}
