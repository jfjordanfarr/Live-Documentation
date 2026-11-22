// Command fpk reads the stored form of a scan's facts (specification.md).
//
//	fpk read  <file>   binary file -> its text form (section 8)
//	fpk name  <file>   text form   -> the content's name (section 3.4)
//	fpk graph <file>   binary file -> its graph as JSON (section 5)
//
// Every answer is either the requested output or one line beginning
// "refused:". Nothing is written to standard output until the input has
// passed every check, so a refusal is never mixed with partial output.
package main

import (
	"bufio"
	"encoding/hex"
	"fmt"
	"os"
	"runtime/debug"
)

// refusal is raised (as a panic) by fail and turned into one
// "refused: ..." line at the top.
type refusal struct{ msg string }

func fail(format string, a ...any) {
	panic(refusal{fmt.Sprintf(format, a...)})
}

func main() {
	if len(os.Args) != 3 {
		fmt.Fprintln(os.Stderr, "usage: sh run.sh read|name|graph <file>")
		os.Exit(2)
	}
	// The reader's memory is bounded by the input (sections 3.5 and 6);
	// collect garbage a little more eagerly than the default so the heap
	// stays near what is live.
	debug.SetGCPercent(50)
	out := bufio.NewWriterSize(os.Stdout, 1<<16)
	code := run(os.Args[1], os.Args[2], out)
	out.Flush()
	os.Exit(code)
}

func run(mode, file string, out *bufio.Writer) (code int) {
	defer func() {
		if r := recover(); r != nil {
			msg := ""
			if rf, ok := r.(refusal); ok {
				msg = rf.msg
			} else {
				msg = fmt.Sprintf("internal error: %v", r)
				if os.Getenv("FPK_DEBUG") != "" {
					os.Stderr.Write(debug.Stack())
				}
			}
			out.Reset(os.Stdout) // drop anything not yet written
			fmt.Fprintf(out, "refused: %s\n", oneLine(msg))
			code = 0
		}
	}()
	switch mode {
	case "read", "name", "graph":
	default:
		fmt.Fprintf(os.Stderr, "unknown mode %q; use read, name or graph\n", mode)
		return 2
	}
	data, err := os.ReadFile(file)
	if err != nil {
		fail("cannot read the file: %v", err)
	}
	switch mode {
	case "read":
		s := readBinary(data)
		if bound := textBound(len(data)); s.names > bound {
			fail("the text is not offered, though the file is valid: its text would write %d bytes of names, past the bound 64 x %d + 1048576 = %d (section 3.5)", s.names, len(data), bound)
		}
		emitText(s, out)
	case "graph":
		s := readBinary(data)
		emitGraph(s, out)
	case "name":
		name := nameOfText(data)
		out.WriteString(hex.EncodeToString(name[:]))
		out.WriteByte('\n')
	}
	return 0
}

// oneLine keeps a refusal to a single line whatever the reason holds.
func oneLine(s string) string {
	b := []byte(s)
	for i, c := range b {
		if c == '\n' || c == '\r' {
			b[i] = ' '
		}
	}
	return string(b)
}

func textBound(fileLen int) uint64 {
	return 64*uint64(fileLen) + 1048576
}
