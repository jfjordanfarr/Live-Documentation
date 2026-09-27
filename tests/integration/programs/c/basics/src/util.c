#include "util.h"

/**
 * @example Creating a widget
 * @code
 * struct widget item = build_widget(5);
 * @endcode
 */
struct widget build_widget(long seed) {
    struct widget result;
    result.value = seed * 2;
    return result;
}
