# frozen_string_literal: true

require_relative "data_store"
require_relative "reporter"

module BenchmarkApp
  # Runs the minimal benchmark pipeline.
  #
  # @param key [String] Dataset name to process.
  # @return [String] Generated summary.
  # @example
  #   BenchmarkApp.run("baseline")
  def self.run(key)
    data = DataStore.fetch(key)
    Reporter.summary(data)
  end
end
