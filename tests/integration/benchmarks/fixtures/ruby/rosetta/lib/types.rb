# frozen_string_literal: true

# Shared type definitions for the Rosetta benchmark fixture.
#
# This file defines base types that other modules depend on,
# testing how adapters resolve module includes.

module Rosetta
  # Status enumeration for records.
  module Status
    PENDING = :pending
    ACTIVE = :active
    COMPLETE = :complete
  end

  # A timestamped entry in the data pipeline.
  Entry = Struct.new(:id, :timestamp, :status, keyword_init: true)

  # Configuration for processing operations.
  ProcessorConfig = Struct.new(:batch_size, :timeout, :strict, keyword_init: true)
end
