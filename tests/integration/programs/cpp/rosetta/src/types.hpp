/**
 * @file types.hpp
 * @brief Shared type definitions for the Rosetta benchmark fixture.
 *
 * This file defines base types that other modules depend on,
 * testing how adapters resolve header includes.
 */

#ifndef ROSETTA_TYPES_HPP
#define ROSETTA_TYPES_HPP

#include <cstdint>
#include <string>

namespace rosetta {

/**
 * Status enumeration for records.
 */
enum class Status {
    Pending,
    Active,
    Complete
};

/**
 * A timestamped entry in the data pipeline.
 */
struct Entry {
    std::string id;
    std::uint64_t timestamp = 0;
    Status status = Status::Pending;
};

/**
 * Configuration for processing operations.
 */
struct ProcessorConfig {
    int batch_size = 0;
    int timeout = 0;
    bool strict = false;
};

}  // namespace rosetta

#endif /* ROSETTA_TYPES_HPP */
