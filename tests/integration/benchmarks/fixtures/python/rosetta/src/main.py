"""
Entry point for the Rosetta benchmark fixture.

Demonstrates selective imports and serves as the
root node of the dependency graph.
"""

from models import create_record, Report
from processor import run, summarize


def main(seed: int) -> str:
    """
    Executes the Rosetta data pipeline.
    
    Args:
        seed: Starting seed value for generating records
        
    Returns:
        Formatted summary of the processing results
    """
    # Create test records using the factory
    records = [
        create_record("alpha", seed),
        create_record("beta", seed * 2),
        create_record("gamma", seed * 3)
    ]

    # Process and generate report
    report: Report = run(records)
    
    # Return human-readable summary
    return summarize(report)


if __name__ == "__main__":
    print(main(10))
