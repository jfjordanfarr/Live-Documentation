# frozen_string_literal: true

module BenchmarkApp
  module Template
    module_function

    # Formats aggregate values for presentation.
    #
    # @param data [Array<Integer>] Samples to summarise.
    # @return [String] Message containing totals and counts.
    def render(data)
      total = data.sum
      "total=#{total} count=#{data.length}"
    end
  end
end
