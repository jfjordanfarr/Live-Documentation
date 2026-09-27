#ifndef LOGGER_H
#define LOGGER_H

/**
 * @brief Writes a line to stdout.
 *
 * Provides a consistent logging surface for the modular fixture pipeline.
 *
 * @param message Message that should be written when not NULL.
 */
void log_message(const char *message);

#endif
