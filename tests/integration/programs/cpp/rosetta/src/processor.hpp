/**
 * @file processor.hpp
 * @brief Core processing logic for the Rosetta benchmark fixture.
 *
 * This module exercises multiple include patterns:
 * - Direct header includes
 * - Transitive includes through models.hpp
 */

#ifndef ROSETTA_PROCESSOR_HPP
#define ROSETTA_PROCESSOR_HPP

#include "models.hpp"
#include "types.hpp"
#include <optional>
#include <string>
#include <vector>

namespace rosetta {

/**
 * Processes batches of records under one configuration.
 */
class Processor {
public:
    /**
     * Creates a processor with the given configuration.
     * @param config Processing configuration
     */
    explicit Processor(const ProcessorConfig& config);

    /**
     * Processes a batch of records and generates a report.
     * @param records Records to process
     * @return The report, or nothing when the configuration is invalid
     */
    std::optional<Report> run(const std::vector<Record>& records) const;

private:
    ProcessorConfig config_;
};

/**
 * Processes a batch of records and generates a report.
 *
 * @param records Records to process
 * @param config Processing configuration (may be nullptr for defaults)
 * @return The report, or nothing when the configuration is invalid
 */
std::optional<Report> run_processor(const std::vector<Record>& records, const ProcessorConfig* config);

/**
 * Creates a formatted summary string from a report.
 *
 * @param report Report to summarize
 * @return The summary line
 */
std::string summarize_report(const Report& report);

/**
 * Releases the records held by a report.
 * @param report Report to free
 */
void free_report(Report& report);

}  // namespace rosetta

#endif /* ROSETTA_PROCESSOR_HPP */
