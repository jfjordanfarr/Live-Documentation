# frozen_string_literal: true

module BenchmarkCLI
  module Support
    module Logger
      module_function

      # Emits an informational message.
      #
      # @param message [String] Text to print.
      # @return [void]
      def info(message)
        print("INFO: ", message, "\n")
      end

      # Emits a warning message.
      #
      # @param message [String] Text to print.
      # @return [void]
      def warn(message)
        print("WARN: ", message, "\n")
      end
    end
  end
end
