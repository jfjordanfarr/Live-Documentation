#include "logger.h"

#include <stdio.h>

/**
 * @brief Prints the provided message when defined.
 *
 * @param message Text written with a trailing newline.
 */
void log_message(const char *message) {
	if (message == NULL) {
		return;
	}
	printf("%s\n", message);
}
