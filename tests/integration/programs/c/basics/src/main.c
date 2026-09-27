#include "util.h"

/**
 * @brief Entry point that exercises build_widget.
 * @return int Zero when widget math behaves as expected.
 */
int main(void) {
    struct widget sample = build_widget(42);
    return (int)sample.value;
}
