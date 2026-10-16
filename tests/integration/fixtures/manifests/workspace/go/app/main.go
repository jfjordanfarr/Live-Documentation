// The tally command prints the sum of the counts it is given.
package main

import (
	"fmt"

	"example.com/tally/ledger"
)

func main() {
	fmt.Println(ledger.Sum(3, 4))
}
