# frozen_string_literal: true

# Core processing logic for the Rosetta benchmark fixture.
#
# This module exercises multiple require patterns:
# - require_relative for local modules
# - Module mixing patterns

require_relative "models"
require_relative "types"
require_relative "helpers"

module Rosetta
  # Processor for batch record operations.
  module Processor
    # Default configuration for processing.
    DEFAULT_CONFIG = ProcessorConfig.new(
      batch_size: 100,
      timeout: 5000,
      strict: true
    ).freeze

    module_function

    # Processes a batch of records and generates a report.
    #
    # @param records [Array<Record>] Records to process
    # @param config [ProcessorConfig, nil] Optional configuration
    # @return [Report] Summary report
    # @raise [ArgumentError] if configuration is invalid
    def run(records, config = nil)
      config ||= DEFAULT_CONFIG

      unless ModelFactory.validate_config(config)
        raise ArgumentError, "Invalid processor configuration"
      end

      values = records.map(&:value)
      total = Helpers.sum_values(values)
      avg = Helpers.average_values(values)

      Report.new(total: total, average: avg, records: records)
    end

    # Creates a formatted summary string from a report.
    #
    # @param report [Report] Report to summarize
    # @return [String] Human-readable summary
    def summarize(report)
      "Total: #{Helpers.format_value(report.total)}, " \
        "Average: #{Helpers.format_value(report.average)}, " \
        "Count: #{report.records.size}"
    end
  end
end
