# frozen_string_literal: true

require_relative "templates"

module BenchmarkApp
  module Formatter
    module_function

=begin
Renders a statistical snapshot using the configured templates.

# Parameters
- data - Numeric samples to summarise.

# Returns
- String describing the totals.

# Examples
Formatter.to_text([10, 20])
=end
    def to_text(data)
      Template.render(data)
    end
  end
end
