# frozen_string_literal: true

# Utility helpers for the Rosetta benchmark fixture.
#
# Pure functions with no external dependencies - testing
# that adapters correctly identify leaf nodes in the graph.

module Rosetta
  module Helpers
    module_function

    # Formats a numeric value for display.
    #
    # @param value [Numeric] Value to format
    # @return [String] Formatted value
    def format_value(value)
      format("%.2f", value)
    end

    # Validates that a string is a valid identifier.
    #
    # @param input [String] String to validate
    # @return [Boolean] true if valid identifier
    def validate_id(input)
      /^[a-zA-Z][a-zA-Z0-9_-]*$/.match?(input)
    end

    # Computes the sum of numeric values.
    #
    # @param values [Array<Numeric>] Values to sum
    # @return [Numeric] Sum of values
    def sum_values(values)
      values.sum
    end

    # Computes the average of numeric values.
    #
    # @param values [Array<Numeric>] Values to average
    # @return [Numeric] Average of values
    def average_values(values)
      return 0.0 if values.empty?

      sum_values(values) / values.size.to_f
    end
  end
end
