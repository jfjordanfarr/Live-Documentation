# frozen_string_literal: true

require_relative "commands/report"
require_relative "support/logger"

module BenchmarkCLI
  module_function

  # Entry point for the demo CLI.
  #
  # @param argv [Array<String>] Raw command-line arguments.
  # @return [void]
  # @example
  #   BenchmarkCLI.execute(["report"])
  def execute(argv)
    command = argv.first || "report"
    case command
    when "report"
      Commands::Report.run
    else
      Support::Logger.warn("unknown command: #{command}")
    end
  end
end
