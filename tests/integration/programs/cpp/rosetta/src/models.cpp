/**
 * @file models.cpp
 * @brief Implementation of domain model functions.
 */

#include "models.hpp"
#include <ctime>

namespace rosetta {

Record create_record(const std::string& id, double value) {
    Record record;
    record.entry.id = id;
    record.entry.timestamp = static_cast<std::uint64_t>(std::time(nullptr));
    record.entry.status = Status::Pending;
    record.value = value;
    return record;
}

bool validate_config(const ProcessorConfig& config) {
    return config.batch_size > 0 &&
           config.timeout > 0 &&
           config.batch_size <= 1000;
}

}  // namespace rosetta
