# frozen_string_literal: true

# Domain models for the Rosetta benchmark fixture.
#
# Defines Record and Report types used throughout the pipeline.

require_relative "types"

module Rosetta
  # A data record to be processed.
  class Record
    attr_reader :entry, :value, :tags

    def initialize(id:, value:)
      @entry = Entry.new(
        id: id,
        timestamp: Time.now,
        status: Status::PENDING
      )
      @value = value
      @tags = []
    end

    def id
      entry.id
    end
  end

  # Summary report produced by the processor.
  class Report
    attr_reader :total, :average, :records, :generated_at

    def initialize(total:, average:, records:)
      @total = total
      @average = average
      @records = records
      @generated_at = Time.now
    end
  end

  # Factory module for creating records with sensible defaults.
  module ModelFactory
    module_function

    # Creates a record with default values.
    #
    # @param id [String] Record identifier
    # @param value [Numeric] Numeric value
    # @return [Record] Initialized record
    def create_record(id, value)
      Record.new(id: id, value: value)
    end

    # Validates configuration is within acceptable bounds.
    #
    # @param config [ProcessorConfig] Configuration to validate
    # @return [Boolean] true if valid
    def validate_config(config)
      config.batch_size.positive? &&
        config.timeout.positive? &&
        config.batch_size <= 1000
    end
  end
end
