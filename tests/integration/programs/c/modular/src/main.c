#include "pipeline.h"
#include "logger.h"

/**
 * @brief End-to-end demonstration of the modular pipeline runnable.
 * @return int Zero when the pipeline produces a non-negative value.
 */
int main(void) {
	double samples[3] = {42.0, 64.0, 29.0};
	double result = run_pipeline(samples, 3);

	if (result > 60.0) {
		log_message("alert: pipeline value high");
	} else {
		log_message("info: pipeline value nominal");
	}

	return result > 0.0 ? 0 : 1;
}
