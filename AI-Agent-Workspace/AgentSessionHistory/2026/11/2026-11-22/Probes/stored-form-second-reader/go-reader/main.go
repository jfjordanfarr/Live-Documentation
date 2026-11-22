// Command factpack reads the stored form of a scan's facts (specification.md).
//
//	factpack read <file>   print the text form (section 8) of a valid binary file
//	factpack name <file>   print the content's name (section 3.4) of the file a text form describes
//
// Anything else, and any invalid input, gives one line beginning "refused:".
package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

// refusal is raised (as a panic) anywhere a check fails; run turns it into the one line.
type refusal string

func refuse(format string, a ...any) {
	panic(refusal(fmt.Sprintf(format, a...)))
}

func main() {
	out := bufio.NewWriterSize(os.Stdout, 1<<16)
	status := run(os.Args[1:], out)
	out.Flush()
	os.Exit(status)
}

func run(args []string, out *bufio.Writer) (status int) {
	defer func() {
		if e := recover(); e != nil {
			var msg string
			if r, ok := e.(refusal); ok {
				msg = string(r)
			} else {
				msg = fmt.Sprintf("internal error: %v", e)
			}
			msg = strings.Map(func(r rune) rune {
				if r < 0x20 || r == 0x7f {
					return ' '
				}
				return r
			}, msg)
			out.Reset(os.Stdout) // drop whatever was buffered and not yet written
			out.WriteString("refused: " + msg + "\n")
			status = 0
		}
	}()
	if len(args) != 2 || (args[0] != "read" && args[0] != "name") {
		refuse("usage: sh run.sh read|name <file>")
	}
	data, err := os.ReadFile(args[1])
	if err != nil {
		refuse("cannot read the file: %v", err)
	}
	switch args[0] {
	case "read":
		s := readScan(data)
		s.emitText(out)
	case "name":
		out.WriteString(nameOfText(data) + "\n")
	}
	return 0
}
