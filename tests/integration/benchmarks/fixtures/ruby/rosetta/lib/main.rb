# frozen_string_literal: true

# Entry point for the Rosetta benchmark fixture.
#
# Demonstrates require_relative patterns and serves as the
# root node of the dependency graph.

require_relative "models"
require_relative "processor"

module Rosetta
  module_function

  # Executes the Rosetta data pipeline.
  #
  # @param seed [Integer] Starting seed value for generating records
  # @return [String] Formatted summary of the processing results
  def main(seed)
    # Create test records using the factory
    records = [
      ModelFactory.create_record("alpha", seed),
      ModelFactory.create_record("beta", seed * 2),
      ModelFactory.create_record("gamma", seed * 3)
    ]

    # Process and generate report
    report = Processor.run(records)

    # Return human-readable summary
    Processor.summarize(report)
  end
end

puts Rosetta.main(10) if __FILE__ == $PROGRAM_NAME
