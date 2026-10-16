/**
 * @file models.hpp
 * @brief Domain models for the Rosetta benchmark fixture.
 *
 * Defines Record and Report types used throughout the pipeline.
 */

#ifndef ROSETTA_MODELS_HPP
#define ROSETTA_MODELS_HPP

#include "types.hpp"
#include <cstdint>
#include <string>
#include <vector>

namespace rosetta {

/**
 * A data record to be processed.
 */
struct Record {
    Entry entry;
    double value = 0.0;
    std::vector<std::string> tags;
};

/**
 * Summary report produced by the processor.
 */
struct Report {
    double total = 0.0;
    double average = 0.0;
    std::vector<Record> records;
    std::uint64_t generated_at = 0;
};

/**
 * Factory for creating records with sensible defaults.
 * @param id Record identifier
 * @param value Numeric value
 * @return Initialized record
 */
Record create_record(const std::string& id, double value);

/**
 * Validates configuration is within acceptable bounds.
 * @param config Configuration to validate
 * @return true if valid, false otherwise
 */
bool validate_config(const ProcessorConfig& config);

}  // namespace rosetta

#endif /* ROSETTA_MODELS_HPP */
