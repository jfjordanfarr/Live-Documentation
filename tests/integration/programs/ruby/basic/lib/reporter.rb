# frozen_string_literal: true

require_relative "formatter"
require_relative "data_store"

module BenchmarkApp
  # Provides helpers for emitting benchmark summaries.
  module Reporter
    module_function

    # Converts raw numeric samples into a human readable report.
    #
    # @param data [Array<Integer>] Collection of numeric samples.
    # @return [String] Rendered output suitable for console display.
    # @see Formatter.to_text
    # @example
    #   Reporter.summary([1, 2, 3])
    def summary(data)
      Formatter.to_text(data)
    end
  end
end
