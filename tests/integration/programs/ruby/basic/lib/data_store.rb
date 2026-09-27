# frozen_string_literal: true

module BenchmarkApp
  # In-memory dataset registry used by the demo fixtures.
  module DataStore
    DATA = {
      "baseline" => [12, 18, 20],
      "spiky" => [3, 45, 1]
    }.freeze

    # Looks up a dataset by key.
    #
    # @param key [String] Dataset identifier.
    # @return [Array<Integer>] Frozen copy of the dataset or `[0]` when missing.
    def self.fetch(key)
      DATA.fetch(key) { [0] }
    end
  end
end
