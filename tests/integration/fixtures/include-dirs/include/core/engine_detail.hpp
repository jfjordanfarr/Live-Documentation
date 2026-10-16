#ifndef INCLUDE_DIRS_CORE_ENGINE_DETAIL_HPP
#define INCLUDE_DIRS_CORE_ENGINE_DETAIL_HPP

/** One step of the engine, kept beside the header that includes it. */
inline int engine_detail_step(int value) {
    return value * 2;
}

#endif
