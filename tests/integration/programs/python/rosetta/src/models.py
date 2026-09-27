"""
Domain models for the Rosetta benchmark fixture.

Defines Record and Report types used throughout the pipeline.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import List

from core_types import Entry, Status, ProcessorConfig


@dataclass
class Record(Entry):
    """A data record to be processed."""
    value: float
    tags: List[str] = field(default_factory=list)


@dataclass
class Report:
    """Summary report produced by the processor."""
    total: float
    average: float
    records: List[Record]
    generated_at: datetime


def create_record(id: str, value: float) -> Record:
    """Factory for creating records with sensible defaults."""
    return Record(
        id=id,
        value=value,
        timestamp=datetime.now(),
        status=Status.PENDING,
        tags=[]
    )


def validate_config(config: ProcessorConfig) -> bool:
    """Validates configuration is within acceptable bounds."""
    return (config.batch_size > 0 and 
            config.timeout > 0 and 
            config.batch_size <= 1000)
