# frozen_string_literal: true

require_relative "../support/logger"

module BenchmarkCLI
  module Services
    module DataLoader
      module_function

      DATASETS = {
        "baseline" => [22, 35, 18, 27],
        "volatile" => [4, 90, 6]
      }.freeze

      # Loads a dataset by name.
      #
      # @param name [String] Identifier such as "baseline".
      # @return [Array<Integer>] Numeric samples.
      # @example
      #   DataLoader.load("baseline")
      def load(name)
        Support::Logger.info("loading dataset #{name}")
        DATASETS.fetch(name) { [0] }
      end
    end
  end
end
