# frozen_string_literal: true

require_relative "../services/analyzer"
require_relative "../services/data_loader"

module BenchmarkCLI
  module Commands
    module Report
      module_function

      # Generates the default benchmark report.
      #
      # @return [void]
      def run
        data = Services::DataLoader.load("baseline")
        summary = Services::Analyzer.analyze(data)
        Services::Analyzer.describe(summary)
      end
    end
  end
end
