# frozen_string_literal: true

module BenchmarkCLI
  module Services
    module Cache
      module_function

      # Internal store keyed by object_id for deterministic fixture output.
      STORE = {}

      # Retrieves a cached entry.
      #
      # @param key [Object] Lookup key (the dataset itself).
      # @return [Hash, nil] Cached summary when available.
      def fetch(key)
        STORE[key.object_id]
      end

      # Persists a cached entry.
      #
      # @param key [Object] Dataset used to compute the summary.
      # @param value [Hash] Summary payload produced by Analyzer.
      # @return [void]
      def store(key, value)
        STORE[key.object_id] = value
      end
    end
  end
end
