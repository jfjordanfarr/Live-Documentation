/**
 * @file processor.cpp
 * @brief Implementation of the core processing logic.
 */

#include "processor.hpp"
#include "helpers.hpp"
#include <ctime>

namespace rosetta {

namespace {

/* Default configuration */
const ProcessorConfig DEFAULT_CONFIG{100, 5000, true};

}  // namespace

Processor::Processor(const ProcessorConfig& config) : config_(config) {}

std::optional<Report> Processor::run(const std::vector<Record>& records) const {
    if (!validate_config(config_)) {
        return std::nullopt;
    }

    // Extract values from records
    std::vector<double> values;
    values.reserve(records.size());
    for (const Record& record : records) {
        values.push_back(record.value);
    }

    // Build report
    Report report;
    report.total = sum_values(values);
    report.average = average_values(values);
    report.records = records;
    report.generated_at = static_cast<std::uint64_t>(std::time(nullptr));
    return report;
}

std::optional<Report> run_processor(const std::vector<Record>& records, const ProcessorConfig* config) {
    const Processor processor(config ? *config : DEFAULT_CONFIG);
    return processor.run(records);
}

std::string summarize_report(const Report& report) {
    return "Total: " + format_value(report.total) +
           ", Average: " + format_value(report.average) +
           ", Count: " + std::to_string(report.records.size());
}

void free_report(Report& report) {
    report.records.clear();
    report.records.shrink_to_fit();
}

}  // namespace rosetta
