# frozen_string_literal: true

require_relative "cache"
require_relative "../support/logger"

module BenchmarkCLI
  module Services
    module Analyzer
      module_function

      # Computes aggregate statistics for a dataset.
      #
      # @param data [Array<Integer>] Measurements to analyse.
      # @return [Hash] Aggregated totals and averages.
      # @raise ArgumentError when the dataset is empty.
      def analyze(data)
        raise ArgumentError, "data required" if data.empty?

        cached = Cache.fetch(data)
        return cached if cached

        total = data.sum
        count = data.size
        average = count.zero? ? 0.0 : total.to_f / count
        result = { total: total, average: average, alert: average > 50 }
        Cache.store(data, result)
        Support::Logger.info("analysis complete")
        result
      end

      # Emits a log line summarizing the statistics.
      #
      # @param result [Hash] The payload returned from {analyze}.
      # @return [void]
      def describe(result)
        status = result[:alert] ? "ALERT" : "OK"
        Support::Logger.info("#{status} total=#{result[:total]}")
      end
    end
  end
end
