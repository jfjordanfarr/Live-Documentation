"""The tally command."""

import click


@click.command()
@click.argument("counts", nargs=-1, type=int)
def main(counts: tuple[int, ...]) -> None:
    """Print the sum of the counts given."""
    click.echo(sum(counts))
