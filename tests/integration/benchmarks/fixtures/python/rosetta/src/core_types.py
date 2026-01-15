"""
Shared type definitions for the Rosetta benchmark fixture.

This file defines base types that other modules depend on,
testing how adapters resolve type-only imports in dynamic languages.
"""

from enum import Enum
from dataclasses import dataclass
from datetime import datetime
from typing import List


class Status(Enum):
    """Status enumeration for records."""
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETE = "complete"


@dataclass
class Entry:
    """A timestamped entry in the data pipeline."""
    id: str
    timestamp: datetime
    status: Status


@dataclass
class ProcessorConfig:
    """Configuration for processing operations."""
    batch_size: int
    timeout: int
    strict: bool
