"""
Core processing logic for the Rosetta benchmark fixture.

This module exercises multiple import patterns:
- Module import: `import models as Models`
- Selective imports: `from helpers import format_value, sum_values`
- Type hints: `from types import ProcessorConfig`
"""

import models as Models
from core_types import ProcessorConfig, Status
from helpers import format_value, sum_values, average
from datetime import datetime
from typing import List


# Default configuration for processing
DEFAULT_CONFIG = ProcessorConfig(
    batch_size=100,
    timeout=5000,
    strict=True
)


def run(records: List[Models.Record], 
        config: ProcessorConfig = None) -> Models.Report:
    """
    Processes a batch of records and generates a report.
    
    Uses module alias (Models) to access Record and Report types,
    demonstrating how adapters should handle aliased imports.
    
    Args:
        records: Records to process
        config: Optional processing configuration
        
    Returns:
        Summary report of processed records
    """
    if config is None:
        config = DEFAULT_CONFIG
        
    if not Models.validate_config(config):
        raise ValueError("Invalid processor configuration")

    values = [r.value for r in records]
    total = sum_values(values)
    avg = average(values)

    return Models.Report(
        total=total,
        average=avg,
        records=records,
        generated_at=datetime.now()
    )


def summarize(report: Models.Report) -> str:
    """
    Creates a formatted summary string from a report.
    
    Args:
        report: Report to summarize
        
    Returns:
        Human-readable summary
    """
    return f"Total: {format_value(report.total)}, Average: {format_value(report.average)}, Count: {len(report.records)}"
