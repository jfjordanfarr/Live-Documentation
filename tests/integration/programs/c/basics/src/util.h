#ifndef WIDGET_UTIL_H
#define WIDGET_UTIL_H

/**
 * @brief Simple widget used by the basics fixture.
 *
 * Represents a single sampled value that mirrors the Live Docs output.
 */
struct widget {
    long value;
};

/**
 * @brief Builds a widget from the provided seed.
 *
 * Doubles the seed value to make assertions easy.
 *
 * @param seed Input value that drives the widget contents.
 * @return struct widget Widget initialized with a deterministic value.
 */
struct widget build_widget(long seed);

#endif
