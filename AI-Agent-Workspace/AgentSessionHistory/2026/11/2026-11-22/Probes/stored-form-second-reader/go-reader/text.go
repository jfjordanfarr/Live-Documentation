package main

import (
	"bufio"
	"bytes"
	"encoding/hex"
	"fmt"
	"unicode/utf8"
)

// ---------- a strict JSON parser for one line (RFC 8259, section 8.1) ----------

type jv struct {
	t byte // 'n' null, 't' true, 'f' false, 'u' number, 's' string, 'a' array, 'o' object
	u uint32
	s string
	a []jv
	o []jm
}

type jm struct {
	k string
	v jv
}

var textLine int // the line being read, for refusals

func tRefuse(format string, a ...any) {
	refuse("line %d: %s", textLine, fmt.Sprintf(format, a...))
}

type jparser struct {
	b []byte
	p int
}

func parseJSONLine(b []byte) jv {
	j := &jparser{b: b}
	v := j.value(0)
	if j.p != len(b) {
		tRefuse("something follows the line's JSON value at byte %d", j.p+1)
	}
	return v
}

func (j *jparser) peek() byte {
	if j.p >= len(j.b) {
		tRefuse("the line ends inside a JSON value")
	}
	return j.b[j.p]
}

func (j *jparser) value(depth int) jv {
	if depth > 16 {
		tRefuse("values are nested more deeply than any line of the text form")
	}
	c := j.peek()
	switch {
	case c == '[':
		j.p++
		v := jv{t: 'a'}
		if j.peek() == ']' {
			j.p++
			return v
		}
		for {
			v.a = append(v.a, j.value(depth+1))
			switch j.peek() {
			case ',':
				j.p++
			case ']':
				j.p++
				return v
			default:
				tRefuse("expected , or ] at byte %d", j.p+1)
			}
		}
	case c == '{':
		j.p++
		v := jv{t: 'o'}
		if j.peek() == '}' {
			j.p++
			return v
		}
		for {
			if j.peek() != '"' {
				tRefuse("expected a member name at byte %d", j.p+1)
			}
			k := j.str()
			if j.peek() != ':' {
				tRefuse("expected : at byte %d", j.p+1)
			}
			j.p++
			v.o = append(v.o, jm{k, j.value(depth + 1)})
			switch j.peek() {
			case ',':
				j.p++
			case '}':
				j.p++
				return v
			default:
				tRefuse("expected , or } at byte %d", j.p+1)
			}
		}
	case c == '"':
		return jv{t: 's', s: j.str()}
	case c >= '0' && c <= '9':
		start := j.p
		var n uint64
		for j.p < len(j.b) && j.b[j.p] >= '0' && j.b[j.p] <= '9' {
			n = n*10 + uint64(j.b[j.p]-'0')
			if n > 0xFFFFFFFF {
				tRefuse("a number is above 2^32 - 1")
			}
			j.p++
		}
		if j.b[start] == '0' && j.p-start > 1 {
			tRefuse("a number has a leading zero")
		}
		if j.p < len(j.b) && (j.b[j.p] == '.' || j.b[j.p] == 'e' || j.b[j.p] == 'E') {
			tRefuse("a number has a decimal point or an exponent")
		}
		return jv{t: 'u', u: uint32(n)}
	case bytes.HasPrefix(j.b[j.p:], []byte("null")):
		j.p += 4
		return jv{t: 'n'}
	case bytes.HasPrefix(j.b[j.p:], []byte("true")):
		j.p += 4
		return jv{t: 't'}
	case bytes.HasPrefix(j.b[j.p:], []byte("false")):
		tRefuse("false is never written")
	}
	tRefuse("unexpected byte %q at byte %d (no whitespace, sign or other token is written)", c, j.p+1)
	return jv{}
}

var simpleEscapes = map[byte]byte{'"': '"', '\\': '\\', '/': '/', 'b': 8, 'f': 12, 'n': 10, 'r': 13, 't': 9}

func hexval(b []byte) (rune, bool) {
	var r rune
	for _, c := range b {
		switch {
		case c >= '0' && c <= '9':
			r = r*16 + rune(c-'0')
		case c >= 'a' && c <= 'f':
			r = r*16 + rune(c-'a'+10)
		case c >= 'A' && c <= 'F':
			r = r*16 + rune(c-'A'+10)
		default:
			return 0, false
		}
	}
	return r, true
}

func (j *jparser) u4() rune {
	if len(j.b)-j.p < 6 || j.b[j.p] != '\\' || j.b[j.p+1] != 'u' {
		tRefuse("a \\u escape is cut short")
	}
	r, ok := hexval(j.b[j.p+2 : j.p+6])
	if !ok {
		tRefuse("a \\u escape has a byte that is not a hexadecimal digit")
	}
	j.p += 6
	return r
}

func (j *jparser) str() string {
	j.p++ // the opening quote
	var sb []byte
	for {
		if j.p >= len(j.b) {
			tRefuse("a string is not closed")
		}
		c := j.b[j.p]
		switch {
		case c == '"':
			j.p++
			return string(sb)
		case c == '\\':
			if j.p+1 >= len(j.b) {
				tRefuse("an escape is cut short")
			}
			e := j.b[j.p+1]
			if v, ok := simpleEscapes[e]; ok {
				sb = append(sb, v)
				j.p += 2
				continue
			}
			if e != 'u' {
				tRefuse("\\%c is not an escape", e)
			}
			r := j.u4()
			if r >= 0xD800 && r <= 0xDBFF {
				if len(j.b)-j.p < 2 || j.b[j.p] != '\\' || j.b[j.p+1] != 'u' {
					tRefuse("a \\u escape is an unpaired surrogate, not a Unicode scalar value")
				}
				lo := j.u4()
				if lo < 0xDC00 || lo > 0xDFFF {
					tRefuse("a \\u escape is an unpaired surrogate, not a Unicode scalar value")
				}
				r = 0x10000 + (r-0xD800)<<10 + (lo - 0xDC00)
			} else if r >= 0xDC00 && r <= 0xDFFF {
				tRefuse("a \\u escape is an unpaired surrogate, not a Unicode scalar value")
			}
			sb = utf8.AppendRune(sb, r)
		case c < 0x20:
			tRefuse("a control character U+%04X is in a string unescaped", c)
		default:
			sb = append(sb, c)
			j.p++
		}
	}
}

// ---------- accessors: each value as the line's shape needs it ----------

func (v jv) str(what string) string {
	if v.t != 's' {
		tRefuse("%s is not a string", what)
	}
	return v.s
}

func (v jv) num(what string) uint32 {
	if v.t != 'u' {
		tRefuse("%s is not a whole number", what)
	}
	return v.u
}

func (v jv) arr(what string) []jv {
	if v.t != 'a' {
		tRefuse("%s is not an array", what)
	}
	return v.a
}

func (v jv) obj(what string) []jm {
	if v.t != 'o' {
		tRefuse("%s is not an object", what)
	}
	return v.o
}

func member(o []jm, name string) (jv, bool) {
	for _, m := range o {
		if m.k == name {
			return m.v, true
		}
	}
	return jv{}, false
}

func req(o []jm, name, what string) jv {
	v, ok := member(o, name)
	if !ok {
		tRefuse("%s has no %q", what, name)
	}
	return v
}

func optStr(o []jm, name, what string) ostr {
	v, ok := member(o, name)
	if !ok {
		return ostr{}
	}
	return ostr{true, v.str(what + "'s " + name)}
}

func optTrue(o []jm, name, what string) bool {
	v, ok := member(o, name)
	if !ok {
		return false
	}
	if v.t != 't' {
		tRefuse("%s's %q is written only as true", what, name)
	}
	return true
}

func strList(v jv, what string) []string {
	a := v.arr(what)
	out := make([]string, len(a))
	for i, x := range a {
		out[i] = x.str(what + " item")
	}
	return out
}

func indexOf(names []string, s, what string) uint32 {
	for i, n := range names {
		if n == s {
			return uint32(i)
		}
	}
	tRefuse("%q is not a %s the layout defines", s, what)
	return 0
}

// ---------- the facts a text says ----------

type ostr struct {
	ok bool
	s  string
}

type textFacts struct {
	root, baseLayer, extension, scanner string
	leftOut                             []leftOut
	files                               []*tfile
}

type tfile struct {
	path                  string
	layer                 uint32
	archetype, generated  ostr
	authored              string
	entries               []tentry
	symbols               []tsymbol
	deps                  []tdep
	hasCited, hasReExport bool
	cited                 []tcite
	reExports             []treexport
}

type tentry struct {
	reason                uint32
	symName, symLink, cmd ostr
	hasDeclarer           bool
	declLabel, declLink   string
}

type tlinked struct{ link, target, anchor ostr }

type ttype struct {
	name           string
	l              tlinked
	array, promise bool
}

type tparam struct {
	name  string
	types []ttype
}

type tref struct {
	role   uint32
	params []tparam
	types  []ttype
}

type tsection struct {
	title string
	body  []string
}

type tsymbol struct {
	name      string
	slug      ostr
	kind      string
	flags     []string
	hasSource bool
	srcPath   string
	srcLine   uint32
	refs      []tref
	sections  []tsection
}

type tdep struct {
	label      string
	l          tlinked
	hasSymbols bool
	symbols    []string
	qualifiers []string
}

type tcite struct{ label, link string }

type treexport struct {
	name                string
	slug                ostr
	hasFrom             bool
	fromLabel, fromLink string
	flags               []string
}

func linkedOf(o []jm, what string) tlinked {
	return tlinked{optStr(o, "link", what), optStr(o, "target", what), optStr(o, "anchor", what)}
}

func typesOf(v jv, what string) []ttype {
	var out []ttype
	for _, x := range v.arr(what) {
		o := x.obj("a type")
		out = append(out, ttype{
			name:    req(o, "name", "a type").str("a type's name"),
			l:       linkedOf(o, "a type"),
			array:   optTrue(o, "array", "a type"),
			promise: optTrue(o, "promise", "a type"),
		})
	}
	return out
}

func args(a []jv, n int) []jv {
	if len(a) != n+2 {
		tRefuse("a %q line has %d values, not %d", a[1].s, len(a), n+2)
	}
	return a[2:]
}

// parseText reads the lines into facts. It is lenient about order and form, because
// nameOfText then writes the facts again and requires the very same bytes.
func parseText(text []byte) *textFacts {
	f := &textFacts{}
	var cur *tfile
	lines := bytes.Split(text[:len(text)-1], []byte{'\n'})
	ended := false
	for i, ln := range lines {
		textLine = i + 1
		v := parseJSONLine(ln)
		a := v.arr("the line")
		if len(a) < 2 {
			tRefuse("the line is not an array of a subject, a kind and values")
		}
		kind := a[1].str("the line's kind")
		if a[0].t == 'n' {
			switch kind {
			case "format":
				x := args(a, 2)
				if x[0].str("the format's name") != "fact-pack" {
					tRefuse("the format is not \"fact-pack\"")
				}
				if x[1].num("the layout's version") != 1 {
					tRefuse("the layout's version is %d; this reader reads version 1", x[1].u)
				}
			case "location":
				x := args(a, 3)
				f.root = x[0].str("root")
				f.baseLayer = x[1].str("baseLayer")
				f.extension = x[2].str("extension")
			case "scanner":
				f.scanner = args(a, 1)[0].str("the scanner")
			case "left-out":
				x := args(a, 3)
				f.leftOut = append(f.leftOut, leftOut{x[0].str("a reason"), x[1].num("a left-out number"), x[2].str("a detail")})
			case "end":
				args(a, 1)[0].num("the number of files")
				ended = true
			default:
				tRefuse("%q is not a kind of line about the scan", kind)
			}
			if ended {
				break
			}
			continue
		}
		path := a[0].str("the line's subject (null or a path)")
		if kind == "file" {
			x := args(a, 3)
			cur = &tfile{path: path, layer: x[0].num("the layer")}
			if x[1].t != 'n' {
				cur.archetype = ostr{true, x[1].str("the archetype")}
			}
			if x[2].t != 'n' {
				cur.generated = ostr{true, x[2].str("generatedAt")}
			}
			f.files = append(f.files, cur)
			continue
		}
		if cur == nil || cur.path != path {
			tRefuse("a %q line is not among the lines of its file", kind)
		}
		switch kind {
		case "authored":
			cur.authored = args(a, 1)[0].str("the authored words")
		case "entry":
			o := args(a, 1)[0].obj("an entry")
			e := tentry{reason: indexOf(reasonNames[:], req(o, "reason", "an entry").str("an entry's reason"), "reason")}
			if sv, ok := member(o, "symbol"); ok {
				so := sv.obj("an entry's symbol")
				e.symName = ostr{true, req(so, "name", "an entry's symbol").str("an entry's symbol name")}
				e.symLink = optStr(so, "link", "an entry's symbol")
			}
			e.cmd = optStr(o, "command", "an entry")
			if dv, ok := member(o, "declarer"); ok {
				do := dv.obj("an entry's declarer")
				e.hasDeclarer = true
				e.declLabel = req(do, "label", "a declarer").str("a declarer's label")
				e.declLink = req(do, "link", "a declarer").str("a declarer's link")
			}
			cur.entries = append(cur.entries, e)
		case "symbol":
			o := args(a, 1)[0].obj("a symbol")
			s := tsymbol{
				name:  req(o, "name", "a symbol").str("a symbol's name"),
				slug:  optStr(o, "slug", "a symbol"),
				kind:  req(o, "kind", "a symbol").str("a symbol's kind"),
				flags: strList(req(o, "flags", "a symbol"), "a symbol's flags"),
			}
			if sv, ok := member(o, "source"); ok {
				so := sv.obj("a symbol's source")
				s.hasSource = true
				s.srcPath = req(so, "path", "a source").str("a source's path")
				s.srcLine = req(so, "line", "a source").num("a source's line")
			}
			for _, rv := range req(o, "references", "a symbol").arr("references") {
				ro := rv.obj("a reference")
				r := tref{role: indexOf(roleNames[:], req(ro, "role", "a reference").str("a role"), "role")}
				if r.role == 4 {
					for _, pv := range req(ro, "parameters", "a Parameters reference").arr("parameters") {
						po := pv.obj("a parameter")
						r.params = append(r.params, tparam{
							name:  req(po, "name", "a parameter").str("a parameter's name"),
							types: typesOf(req(po, "types", "a parameter"), "a parameter's types"),
						})
					}
				} else {
					r.types = typesOf(req(ro, "types", "a reference"), "a reference's types")
				}
				s.refs = append(s.refs, r)
			}
			for _, sv := range req(o, "sections", "a symbol").arr("sections") {
				so := sv.obj("a section")
				s.sections = append(s.sections, tsection{
					title: req(so, "title", "a section").str("a section's title"),
					body:  strList(req(so, "body", "a section"), "a section's body"),
				})
			}
			cur.symbols = append(cur.symbols, s)
		case "dependency":
			o := args(a, 1)[0].obj("a dependency")
			d := tdep{
				label:      req(o, "label", "a dependency").str("a dependency's label"),
				l:          linkedOf(o, "a dependency"),
				qualifiers: strList(req(o, "qualifiers", "a dependency"), "a dependency's qualifiers"),
			}
			if sv, ok := member(o, "symbols"); ok {
				d.hasSymbols = true
				d.symbols = strList(sv, "a dependency's symbols")
			}
			cur.deps = append(cur.deps, d)
		case "cited-by":
			cur.hasCited = true
			cur.cited = nil
			for _, cv := range args(a, 1)[0].arr("cited-by") {
				co := cv.obj("a citation")
				cur.cited = append(cur.cited, tcite{
					req(co, "label", "a citation").str("a citation's label"),
					req(co, "link", "a citation").str("a citation's link"),
				})
			}
		case "re-exports":
			cur.hasReExport = true
			cur.reExports = nil
			for _, xv := range args(a, 1)[0].arr("re-exports") {
				xo := xv.obj("a re-export")
				x := treexport{
					name:  req(xo, "name", "a re-export").str("a re-export's name"),
					slug:  optStr(xo, "slug", "a re-export"),
					flags: strList(req(xo, "flags", "a re-export"), "a re-export's flags"),
				}
				if fv, ok := member(xo, "from"); ok {
					fo := fv.obj("a re-export's origin")
					x.hasFrom = true
					x.fromLabel = req(fo, "label", "an origin").str("an origin's label")
					x.fromLink = req(fo, "link", "an origin").str("an origin's link")
				}
				cur.reExports = append(cur.reExports, x)
			}
		default:
			tRefuse("%q is not a kind of line about a file", kind)
		}
	}
	if !ended {
		refuse("the text has no end line")
	}
	return f
}

// ---------- name mode ----------

// cmpWriter compares what is written with the text given, refusing at the first difference.
type cmpWriter struct {
	want []byte
	pos  int
}

func (c *cmpWriter) Write(p []byte) (int, error) {
	rest := c.want[c.pos:]
	if len(p) <= len(rest) && bytes.Equal(p, rest[:len(p)]) {
		c.pos += len(p)
		return len(p), nil
	}
	at := c.pos
	for i := 0; i < len(p) && i < len(rest) && p[i] == rest[i]; i++ {
		at++
	}
	if at == len(c.want) {
		refuse("the text stops before its facts' text does")
	}
	line := 1 + bytes.Count(c.want[:at], []byte{'\n'})
	col := at - (bytes.LastIndexByte(c.want[:at], '\n') + 1) + 1
	refuse("line %d is not written exactly as section 8 writes its facts (first difference at byte %d of the line)", line, col)
	return 0, nil
}

func nameOfText(text []byte) string {
	if len(text) == 0 {
		refuse("the text is empty")
	}
	if bytes.HasPrefix(text, []byte{0xEF, 0xBB, 0xBF}) {
		refuse("the text begins with a byte-order mark")
	}
	if !utf8.Valid(text) {
		refuse("the text is not well-formed UTF-8")
	}
	if i := bytes.IndexByte(text, '\r'); i >= 0 {
		refuse("line %d holds a CR", 1+bytes.Count(text[:i], []byte{'\n'}))
	}
	if text[len(text)-1] != '\n' {
		refuse("the last line does not end with LF")
	}
	facts := parseText(text)
	file := buildFile(facts)
	var s *scan
	func() {
		defer func() {
			if e := recover(); e != nil {
				if r, ok := e.(refusal); ok {
					refuse("the facts the text says cannot be stored: %s", string(r))
				}
				panic(e)
			}
		}()
		s = readScan(file)
	}()
	cw := &cmpWriter{want: text}
	bw := bufio.NewWriterSize(cw, 1<<16)
	s.emitText(bw)
	bw.Flush()
	if cw.pos != len(text) {
		refuse("line %d follows the end line", 1+bytes.Count(text[:cw.pos], []byte{'\n'}))
	}
	return hex.EncodeToString(s.name[:])
}
