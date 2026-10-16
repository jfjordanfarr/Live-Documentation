/**
 * @file main.cpp
 * @brief Entry point for the Rosetta benchmark fixture.
 *
 * Demonstrates header includes and serves as the
 * root node of the dependency graph.
 */

#include "models.hpp"
#include "processor.hpp"
#include <cstdio>
#include <optional>
#include <string>
#include <vector>

namespace rosetta {

/**
 * Executes the Rosetta data pipeline.
 * @param seed Starting seed value for generating records
 * @return The summary line, empty when processing failed
 */
std::string rosetta_main(int seed) {
    // Create test records using the factory
    std::vector<Record> records;
    records.push_back(create_record("alpha", static_cast<double>(seed)));
    records.push_back(create_record("beta", static_cast<double>(seed * 2)));
    records.push_back(create_record("gamma", static_cast<double>(seed * 3)));

    // Process and generate report
    std::optional<Report> report = run_processor(records, nullptr);
    if (!report) {
        return "";
    }

    // Generate summary
    const std::string summary = summarize_report(*report);

    free_report(*report);
    return summary;
}

}  // namespace rosetta

int main() {
    const std::string summary = rosetta::rosetta_main(10);
    if (!summary.empty()) {
        std::printf("%s\n", summary.c_str());
    }
    return 0;
}
