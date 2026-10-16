#ifndef INCLUDE_DIRS_CORE_ENGINE_HPP
#define INCLUDE_DIRS_CORE_ENGINE_HPP

// engine_detail.hpp is beside this file; shared/log.hpp is found through -I src.
#include "engine_detail.hpp"
#include "shared/log.hpp"

/** Runs the engine once and returns its result. */
int engine_run();

#endif
