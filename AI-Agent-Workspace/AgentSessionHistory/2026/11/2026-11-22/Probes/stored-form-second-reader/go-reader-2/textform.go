package main

import (
	"bufio"
	"bytes"
	"crypto/sha256"
	"encoding/binary"
	"slices"
	"unicode/utf8"
)

// ---------- a JSON reader that accepts only section 8.1's one form ----------

type jv struct {
	t byte // 'n' null, 't' true, 'f' false, 'd' number, 's' string, 'a' array, 'o' object
	n uint32
	s string
	a []jv     // array items, or object values
	k []string // object member names
}

type jparser struct {
	b    []byte
	p    int
	line int
}

func (p *jparser) bad(format string, a ...any) {
	fail("line %d: "+format, append([]any{p.line}, a...)...)
}

const maxDepth = 32 // the deepest valid line nests 8 levels

func (p *jparser) value(depth int) jv {
	if depth > maxDepth {
		p.bad("values nest deeper than %d levels, which no line of the text form does (section 8)", maxDepth)
	}
	if p.p >= len(p.b) {
		p.bad("the line ends where a value is due (section 8)")
	}
	c := p.b[p.p]
	switch {
	case c == '{':
		return p.object(depth)
	case c == '[':
		return p.array(depth)
	case c == '"':
		return jv{t: 's', s: p.str()}
	case c == 'n':
		p.word("null")
		return jv{t: 'n'}
	case c == 't':
		p.word("true")
		return jv{t: 't'}
	case c == 'f':
		p.word("false")
		return jv{t: 'f'}
	case c >= '0' && c <= '9':
		return jv{t: 'd', n: p.number()}
	case c == ' ' || c == '\t' || c == '\n' || c == '\r':
		p.bad("whitespace outside a string (section 8.1)")
	case c == '-' || c == '+':
		p.bad("a number with a sign (section 8.1)")
	default:
		p.bad("byte %d is not the start of a JSON value (section 8)", p.p+1)
	}
	return jv{}
}

func (p *jparser) word(w string) {
	if !bytes.HasPrefix(p.b[p.p:], []byte(w)) {
		p.bad("byte %d is not the start of a JSON value (section 8)", p.p+1)
	}
	p.p += len(w)
}

func (p *jparser) expect(c byte, what string) {
	if p.p >= len(p.b) {
		p.bad("the line ends where %s is due (section 8)", what)
	}
	if p.b[p.p] != c {
		if x := p.b[p.p]; x == ' ' || x == '\t' {
			p.bad("whitespace outside a string (section 8.1)")
		}
		p.bad("byte %d: %s is due (section 8.1)", p.p+1, what)
	}
	p.p++
}

func (p *jparser) number() uint32 {
	start := p.p
	var v uint64
	for p.p < len(p.b) && p.b[p.p] >= '0' && p.b[p.p] <= '9' {
		v = v*10 + uint64(p.b[p.p]-'0')
		p.p++
		if v > 0xFFFFFFFF {
			p.bad("a number above 2^32 - 1 (section 8.1)")
		}
	}
	if p.p-start > 1 && p.b[start] == '0' {
		p.bad("a number with a leading zero (section 8.1)")
	}
	if p.p < len(p.b) && (p.b[p.p] == '.' || p.b[p.p] == 'e' || p.b[p.p] == 'E') {
		p.bad("a number with a decimal point or an exponent (section 8.1)")
	}
	return uint32(v)
}

func (p *jparser) str() string {
	p.p++ // the opening quote
	start := p.p
	var buf []byte
	for {
		if p.p >= len(p.b) {
			p.bad("a string is not closed (section 8)")
		}
		c := p.b[p.p]
		switch {
		case c == '"':
			var s string
			if buf == nil {
				s = string(p.b[start:p.p])
			} else {
				s = string(append(buf, p.b[start:p.p]...))
			}
			p.p++
			return s
		case c < 0x20:
			p.bad("a control character U+%04X written raw in a string (section 8.1)", c)
		case c == '\\':
			buf = append(buf, p.b[start:p.p]...)
			if p.p+1 >= len(p.b) {
				p.bad("a string is not closed (section 8)")
			}
			e := p.b[p.p+1]
			p.p += 2
			switch e {
			case '"':
				buf = append(buf, '"')
			case '\\':
				buf = append(buf, '\\')
			case 'b':
				buf = append(buf, '\b')
			case 't':
				buf = append(buf, '\t')
			case 'n':
				buf = append(buf, '\n')
			case 'f':
				buf = append(buf, '\f')
			case 'r':
				buf = append(buf, '\r')
			case '/':
				p.bad("'/' written as \\/ (section 8.1)")
			case 'u':
				if p.p+4 > len(p.b) {
					p.bad("a \\u escape is cut short (section 8)")
				}
				h := p.b[p.p : p.p+4]
				v := 0
				for _, x := range h {
					switch {
					case x >= '0' && x <= '9':
						v = v*16 + int(x-'0')
					case x >= 'a' && x <= 'f':
						v = v*16 + int(x-'a') + 10
					case x >= 'A' && x <= 'F':
						p.bad("a \\u escape with uppercase hexadecimal (section 8.1)")
					default:
						p.bad("a \\u escape that is not four hexadecimal digits (section 8)")
					}
				}
				p.p += 4
				if v >= 0x20 || v == 8 || v == 9 || v == 10 || v == 12 || v == 13 {
					p.bad("U+%04X written as a \\u escape, which the one form never writes (section 8.1)", v)
				}
				buf = append(buf, byte(v))
			default:
				p.bad("the escape \\%c, which the one form never writes (section 8.1)", e)
			}
			start = p.p
		default:
			p.p++
		}
	}
}

func (p *jparser) array(depth int) jv {
	p.p++
	v := jv{t: 'a'}
	if p.p < len(p.b) && p.b[p.p] == ']' {
		p.p++
		v.a = []jv{}
		return v
	}
	for {
		v.a = append(v.a, p.value(depth+1))
		if p.p < len(p.b) && p.b[p.p] == ',' {
			p.p++
			continue
		}
		p.expect(']', "',' or ']'")
		return v
	}
}

const maxMembers = 16 // no object of the text form has more than 8

func (p *jparser) object(depth int) jv {
	p.p++
	v := jv{t: 'o'}
	if p.p < len(p.b) && p.b[p.p] == '}' {
		p.p++
		return v
	}
	for {
		if p.p >= len(p.b) || p.b[p.p] != '"' {
			p.expect('"', "a member's name")
		}
		k := p.str()
		if slices.Contains(v.k, k) {
			p.bad("the member %q is written twice (section 8)", k)
		}
		if len(v.k) >= maxMembers {
			p.bad("an object with more members than any object of the text form has (section 8)")
		}
		p.expect(':', "':'")
		v.k = append(v.k, k)
		v.a = append(v.a, p.value(depth+1))
		if p.p < len(p.b) && p.b[p.p] == ',' {
			p.p++
			continue
		}
		p.expect('}', "',' or '}'")
		return v
	}
}

func parseLine(b []byte, line int) jv {
	p := &jparser{b: b, line: line}
	v := p.value(0)
	if p.p != len(b) {
		p.bad("bytes follow the line's value (section 8)")
	}
	if v.t != 'a' {
		p.bad("the line is not a JSON array (section 8)")
	}
	return v
}

// ---------- reading the members of a line ----------

type tctx struct{ line int }

func (c tctx) bad(format string, a ...any) {
	fail("line %d: "+format, append([]any{c.line}, a...)...)
}

func (c tctx) obj(v *jv, what string, allowed ...string) *jv {
	if v.t != 'o' {
		c.bad("%s is not an object (section 8)", what)
	}
	for _, k := range v.k {
		if !slices.Contains(allowed, k) {
			c.bad("%s has a member %q it does not have (section 8)", what, k)
		}
	}
	return v
}

func (v *jv) get(k string) *jv {
	for i, kk := range v.k {
		if kk == k {
			return &v.a[i]
		}
	}
	return nil
}

func (c tctx) str(v *jv, what string) string {
	if v.t != 's' {
		c.bad("%s is not a string (section 8)", what)
	}
	return v.s
}

func (c tctx) num(v *jv, what string) uint32 {
	if v.t != 'd' {
		c.bad("%s is not a whole number (section 8.1)", what)
	}
	return v.n
}

func (c tctx) arr(v *jv, what string) []jv {
	if v.t != 'a' {
		c.bad("%s is not an array (section 8)", what)
	}
	return v.a
}

func (c tctx) req(o *jv, k, what string) *jv {
	v := o.get(k)
	if v == nil {
		c.bad("%s has no %q, which is always present (section 8)", what, k)
	}
	return v
}

func (c tctx) reqStr(o *jv, k, what string) string { return c.str(c.req(o, k, what), what+"'s "+k) }

func (c tctx) optStr(o *jv, k, what string) (string, bool) {
	v := o.get(k)
	if v == nil {
		return "", false
	}
	return c.str(v, what+"'s "+k), true
}

func (c tctx) flag(o *jv, k, what string) bool {
	v := o.get(k)
	if v == nil {
		return false
	}
	if v.t != 't' {
		c.bad("%s's %q is not true; an absent mark is left out, never written false (section 8)", what, k)
	}
	return true
}

func (c tctx) strOrNull(v *jv, what string) (string, bool) {
	if v.t == 'n' {
		return "", false
	}
	return c.str(v, what), true
}

func word(c tctx, words []string, w, what string) uint32 {
	i := slices.Index(words, w)
	if i < 0 {
		c.bad("%s %q is not one of the words of section 4.3", what, w)
	}
	return uint32(i)
}

// ---------- the writer: facts to uncompressed sections (section 7) ----------

type item struct {
	v    *jv
	line int
}

type group struct {
	path     string
	file     item
	authored *item
	entries  []item
	symbols  []item
	deps     []item
	cited    *item
	re       *item
	rank     int
}

type tenc struct {
	sidOf   map[string]uint32
	nStr    uint32
	newStrs []string
	rec     []byte
	nRec    int
	frames  []*frame
	paths   []string
	targets [][]string
	cur     []string
}

func (e *tenc) uv(v uint32) { e.rec = binary.AppendUvarint(e.rec, uint64(v)) }

func (e *tenc) sid(s string) {
	v, ok := e.sidOf[s]
	if !ok {
		v = e.nStr
		e.nStr++
		e.sidOf[s] = v
		e.newStrs = append(e.newStrs, s)
	}
	e.uv(v)
}

func (e *tenc) addFrame(kind byte, count int, raw []byte) {
	if len(raw) > maxSection {
		fail("a writer cannot store these facts: the %s section would be %d bytes, past MAX_SECTION, 67108864 (section 3.5)", kindName[kind], len(raw))
	}
	if raw == nil {
		raw = []byte{}
	}
	f := &frame{kind: kind, count: uint32(count), rawLen: uint32(len(raw)), raw: raw, index: len(e.frames)}
	f.hash = sha256.Sum256(raw)
	e.frames = append(e.frames, f)
}

func (e *tenc) flush() {
	if e.nRec == 0 {
		return
	}
	if len(e.newStrs) > 0 {
		var b []byte
		for _, s := range e.newStrs {
			b = binary.AppendUvarint(b, uint64(len(s)))
			b = append(b, s...)
		}
		e.addFrame(kStrings, len(e.newStrs), b)
	}
	e.addFrame(kRecords, e.nRec, e.rec)
	e.newStrs, e.rec, e.nRec = nil, nil, 0
}

func (e *tenc) linked(c tctx, o *jv, what string) uint32 {
	var m uint32
	if o.get("link") != nil {
		m |= 1
	}
	if o.get("target") != nil {
		m |= 2
	}
	if o.get("anchor") != nil {
		m |= 4
	}
	return m
}

func (e *tenc) putLinked(c tctx, o *jv, what string) {
	if s, ok := c.optStr(o, "link", what); ok {
		e.sid(s)
	}
	if s, ok := c.optStr(o, "target", what); ok {
		e.sid(s)
	}
	if s, ok := c.optStr(o, "anchor", what); ok {
		e.sid(s)
	}
}

func (e *tenc) strList(c tctx, v *jv, what string) {
	a := c.arr(v, what)
	e.uv(uint32(len(a)))
	for i := range a {
		e.sid(c.str(&a[i], what+" item"))
	}
}

func (e *tenc) record(g *group) {
	c := tctx{g.file.line}
	fl := g.file.v.a
	layer := c.num(&fl[2], "the layer")
	arch, hasArch := c.strOrNull(&fl[3], "the archetype")
	gen, hasGen := c.strOrNull(&fl[4], "generatedAt")
	ca := tctx{g.authored.line}
	auth := ca.str(&g.authored.v.a[2], "the authored words")
	var fm uint32
	if hasArch {
		fm |= 1
	}
	if hasGen {
		fm |= 2
	}
	if g.cited != nil {
		fm |= 4
	}
	if g.re != nil {
		fm |= 8
	}
	e.sid(g.path)
	e.uv(layer)
	e.uv(fm)
	if hasArch {
		e.sid(arch)
	}
	e.uv(uint32(len(g.entries)))
	for _, it := range g.entries {
		e.entry(tctx{it.line}, &it.v.a[2])
	}
	if hasGen {
		e.sid(gen)
	}
	e.sid(auth)
	e.uv(uint32(len(g.symbols)))
	for _, it := range g.symbols {
		e.symbol(tctx{it.line}, &it.v.a[2])
	}
	e.uv(uint32(len(g.deps)))
	for _, it := range g.deps {
		e.dependency(tctx{it.line}, &it.v.a[2])
	}
	if g.cited != nil {
		c := tctx{g.cited.line}
		a := c.arr(&g.cited.v.a[2], "the cited-by list")
		e.uv(uint32(len(a)))
		for i := range a {
			o := c.obj(&a[i], "a cited-by item", "label", "link")
			e.sid(c.reqStr(o, "label", "a cited-by item"))
			e.sid(c.reqStr(o, "link", "a cited-by item"))
		}
	}
	if g.re != nil {
		c := tctx{g.re.line}
		a := c.arr(&g.re.v.a[2], "the re-exports list")
		e.uv(uint32(len(a)))
		for i := range a {
			o := c.obj(&a[i], "a re-export", "name", "slug", "from", "flags")
			name := c.reqStr(o, "name", "a re-export")
			var m uint32
			slug, hasSlug := c.optStr(o, "slug", "a re-export")
			if hasSlug {
				m |= 1
			}
			from := o.get("from")
			if from != nil {
				m |= 2
				c.obj(from, "a re-export's from", "label", "link")
			}
			e.sid(name)
			e.uv(m)
			if hasSlug {
				e.sid(slug)
			}
			if from != nil {
				e.sid(c.reqStr(from, "label", "a re-export's from"))
				e.sid(c.reqStr(from, "link", "a re-export's from"))
			}
			e.strList(c, c.req(o, "flags", "a re-export"), "a re-export's flags")
		}
	}
	e.paths = append(e.paths, g.path)
	e.targets = append(e.targets, e.cur)
	e.cur = nil
	e.nRec++
	if e.nRec == 256 {
		e.flush()
	}
}

func (e *tenc) entry(c tctx, v *jv) {
	o := c.obj(v, "an entry", "reason", "symbol", "command", "declarer")
	r := word(c, reasonWords, c.reqStr(o, "reason", "an entry"), "an entry's reason")
	var m uint32
	sym := o.get("symbol")
	if sym != nil {
		c.obj(sym, "an entry's symbol", "name", "link")
		m |= 1
		if sym.get("link") != nil {
			m |= 2
		}
	}
	cmd, hasCmd := c.optStr(o, "command", "an entry")
	if hasCmd {
		m |= 4
	}
	decl := o.get("declarer")
	if decl != nil {
		c.obj(decl, "an entry's declarer", "label", "link")
		m |= 8
	}
	e.uv(r)
	e.uv(m)
	if sym != nil {
		e.sid(c.reqStr(sym, "name", "an entry's symbol"))
		if l, ok := c.optStr(sym, "link", "an entry's symbol"); ok {
			e.sid(l)
		}
	}
	if hasCmd {
		e.sid(cmd)
	}
	if decl != nil {
		e.sid(c.reqStr(decl, "label", "an entry's declarer"))
		e.sid(c.reqStr(decl, "link", "an entry's declarer"))
	}
}

func (e *tenc) symbol(c tctx, v *jv) {
	const what = "a symbol"
	o := c.obj(v, what, "name", "slug", "kind", "flags", "source", "references", "sections", "documentation")
	name := c.reqStr(o, "name", what)
	slug, hasSlug := c.optStr(o, "slug", what)
	kind := c.reqStr(o, "kind", what)
	src := o.get("source")
	var m uint32
	if hasSlug {
		m |= 1
	}
	if src != nil {
		c.obj(src, "a symbol's source", "path", "line")
		m |= 2
	}
	e.sid(name)
	e.uv(m)
	if hasSlug {
		e.sid(slug)
	}
	e.sid(kind)
	e.strList(c, c.req(o, "flags", what), "a symbol's flags")
	if src != nil {
		e.sid(c.reqStr(src, "path", "a symbol's source"))
		e.uv(c.num(c.req(src, "line", "a symbol's source"), "a source's line"))
	}
	refs := c.arr(c.req(o, "references", what), "a symbol's references")
	e.uv(uint32(len(refs)))
	for i := range refs {
		r := c.obj(&refs[i], "a reference", "role", "types", "parameters")
		role := word(c, roleWords, c.reqStr(r, "role", "a reference"), "a reference's role")
		e.uv(role)
		if role == 4 {
			ps := c.arr(c.req(r, "parameters", "a Parameters reference"), "a reference's parameters")
			e.uv(uint32(len(ps)))
			for j := range ps {
				p := c.obj(&ps[j], "a parameter", "name", "types")
				e.sid(c.reqStr(p, "name", "a parameter"))
				e.types(c, c.req(p, "types", "a parameter"))
			}
		} else {
			e.types(c, c.req(r, "types", "a reference"))
		}
	}
	secs := c.arr(c.req(o, "sections", what), "a symbol's sections")
	e.uv(uint32(len(secs)))
	for i := range secs {
		s := c.obj(&secs[i], "a section", "title", "body")
		e.sid(c.reqStr(s, "title", "a section"))
		e.strList(c, c.req(s, "body", "a section"), "a section's body")
	}
	docs := c.arr(c.req(o, "documentation", what), "a symbol's documentation")
	e.uv(uint32(len(docs)))
	for i := range docs {
		d := c.obj(&docs[i], "a documentation reference", "name", "element", "link", "target", "anchor")
		name := c.reqStr(d, "name", "a documentation reference")
		el, hasEl := c.optStr(d, "element", "a documentation reference")
		m := e.linked(c, d, "a documentation reference")
		if hasEl {
			m |= 8
		}
		e.sid(name)
		e.uv(m)
		if hasEl {
			e.sid(el)
		}
		e.putLinked(c, d, "a documentation reference")
	}
}

func (e *tenc) types(c tctx, v *jv) {
	ts := c.arr(v, "a list of types")
	e.uv(uint32(len(ts)))
	for i := range ts {
		t := c.obj(&ts[i], "a type", "name", "link", "target", "anchor", "array", "promise")
		name := c.reqStr(t, "name", "a type")
		m := e.linked(c, t, "a type")
		if c.flag(t, "array", "a type") {
			m |= 8
		}
		if c.flag(t, "promise", "a type") {
			m |= 16
		}
		e.sid(name)
		e.uv(m)
		e.putLinked(c, t, "a type")
		if tg, ok := c.optStr(t, "target", "a type"); ok {
			e.cur = append(e.cur, tg)
		}
	}
}

func (e *tenc) dependency(c tctx, v *jv) {
	const what = "a dependency"
	o := c.obj(v, what, "label", "link", "target", "anchor", "symbols", "qualifiers")
	label := c.reqStr(o, "label", what)
	m := e.linked(c, o, what)
	syms := o.get("symbols")
	if syms != nil {
		m |= 8
	}
	e.sid(label)
	e.uv(m)
	e.putLinked(c, o, what)
	if syms != nil {
		e.strList(c, syms, "a dependency's symbols")
	}
	e.strList(c, c.req(o, "qualifiers", what), "a dependency's qualifiers")
	if tg, ok := c.optStr(o, "target", what); ok {
		e.cur = append(e.cur, tg)
	}
}

// ---------- the text form, read (section 8) ----------

var lineRank = map[string]int{"authored": 1, "entry": 2, "symbol": 3, "dependency": 4, "cited-by": 5, "re-exports": 6}

func textToScan(data []byte) *scan {
	if len(data) == 0 {
		fail("the text is empty: it has no format line (section 8)")
	}
	if !utf8.Valid(data) {
		fail("the text is not well-formed UTF-8 (section 8, 2.2)")
	}
	if bytes.HasPrefix(data, []byte{0xEF, 0xBB, 0xBF}) {
		fail("the text begins with a byte-order mark (section 8)")
	}
	if i := bytes.IndexByte(data, '\r'); i >= 0 {
		fail("line %d holds a CR (section 8)", bytes.Count(data[:i], []byte{'\n'})+1)
	}
	if data[len(data)-1] != '\n' {
		fail("the last line does not end with LF (section 8)")
	}
	pos, ln := 0, 0
	next := func() ([]byte, bool) {
		if pos >= len(data) {
			return nil, false
		}
		i := bytes.IndexByte(data[pos:], '\n')
		b := data[pos : pos+i]
		pos += i + 1
		ln++
		return b, true
	}
	headLine := func(kind string, n int) jv {
		b, ok := next()
		if !ok {
			fail("the text ends before its %s line (section 8)", kind)
		}
		v := parseLine(b, ln)
		c := tctx{ln}
		if len(v.a) < 2 || v.a[1].t != 's' || v.a[1].s != kind {
			c.bad("the %s line is due here (section 8: the lines in their one order)", kind)
		}
		if v.a[0].t != 'n' {
			c.bad("the %s line's first value is not null (section 8)", kind)
		}
		if len(v.a) != n {
			c.bad("the %s line has %d values; it has %d (section 8)", kind, len(v.a), n)
		}
		return v
	}
	f := headLine("format", 4)
	c := tctx{ln}
	if c.str(&f.a[2], "the format's name") != "fact-pack" {
		c.bad("the format is %q, not \"fact-pack\" (section 8)", f.a[2].s)
	}
	if v := c.num(&f.a[3], "the version"); v != 1 {
		c.bad("the version is %d; this reader reads version 1 (section 4.1)", v)
	}
	var head []byte
	head = append(head, 1)
	text := func(s string) {
		head = binary.AppendUvarint(head, uint64(len(s)))
		head = append(head, s...)
	}
	loc := headLine("location", 5)
	c = tctx{ln}
	text(c.str(&loc.a[2], "root"))
	text(c.str(&loc.a[3], "baseLayer"))
	text(c.str(&loc.a[4], "extension"))
	sc := headLine("scanner", 3)
	c = tctx{ln}
	text(c.str(&sc.a[2], "the scanner"))

	e := &tenc{sidOf: map[string]uint32{}}
	var leftOuts []byte
	nLeft := 0
	headDone := false
	finishHead := func() {
		if !headDone {
			head = binary.AppendUvarint(head, uint64(nLeft))
			head = append(head, leftOuts...)
			e.addFrame(kHead, 0, head)
			headDone = true
		}
	}
	var g *group
	finishGroup := func() {
		if g != nil {
			if g.authored == nil {
				fail("line %d: the file %q has no authored line (section 8)", g.file.line+1, g.path)
			}
			e.record(g)
			g = nil
		}
	}
	files := 0
	ended := false
	for {
		b, ok := next()
		if !ok {
			break
		}
		if ended {
			fail("line %d: a line after the end line (section 8)", ln)
		}
		vv := parseLine(b, ln)
		v := &vv
		c := tctx{ln}
		if len(v.a) < 2 || v.a[1].t != 's' {
			c.bad("the line's second value is not the line's kind (section 8)")
		}
		kind := v.a[1].s
		switch kind {
		case "left-out":
			if headDone {
				c.bad("a left-out line after the files began (section 8: the lines in their one order)")
			}
			if v.a[0].t != 'n' || len(v.a) != 5 {
				c.bad("a left-out line is [null,\"left-out\",reason,number,detail] (section 8)")
			}
			leftOuts = binary.AppendUvarint(leftOuts, uint64(len(c.str(&v.a[2], "a left-out reason"))))
			leftOuts = append(leftOuts, v.a[2].s...)
			leftOuts = binary.AppendUvarint(leftOuts, uint64(c.num(&v.a[3], "a left-out number")))
			leftOuts = binary.AppendUvarint(leftOuts, uint64(len(c.str(&v.a[4], "a left-out detail"))))
			leftOuts = append(leftOuts, v.a[4].s...)
			nLeft++
		case "end":
			finishHead()
			finishGroup()
			if v.a[0].t != 'n' || len(v.a) != 3 {
				c.bad("the end line is [null,\"end\",numberOfFiles] (section 8)")
			}
			if n := c.num(&v.a[2], "the end's count"); int(n) != files {
				c.bad("the end line counts %d files but the text has %d (section 8)", n, files)
			}
			ended = true
		case "file":
			finishHead()
			finishGroup()
			if v.a[0].t != 's' || len(v.a) != 5 {
				c.bad("a file line is [path,\"file\",layer,archetype|null,generatedAt|null] (section 8)")
			}
			g = &group{path: v.a[0].s, file: item{v, ln}}
			files++
		default:
			r, known := lineRank[kind]
			if !known {
				c.bad("a line of kind %q, which the text form does not have (section 8)", kind)
			}
			if g == nil {
				c.bad("the %s line comes before any file line (section 8: the lines in their one order)", kind)
			}
			if v.a[0].t != 's' || v.a[0].s != g.path {
				c.bad("the %s line's path is not that of the file line before it (section 8)", kind)
			}
			if len(v.a) != 3 {
				c.bad("the %s line has %d values; it has 3 (section 8)", kind, len(v.a))
			}
			if kind != "authored" && g.rank == 0 {
				c.bad("the file's authored line is due before its %s line (section 8: the lines in their one order)", kind)
			}
			ok := false
			switch kind {
			case "authored":
				ok = g.rank == 0
			case "entry", "symbol", "dependency":
				ok = g.rank >= 1 && g.rank <= r
			default: // cited-by, re-exports: at most once
				ok = g.rank >= 1 && g.rank < r
			}
			if !ok {
				c.bad("the %s line is out of its place among the file's lines (section 8: the lines in their one order)", kind)
			}
			g.rank = r
			it := item{v, ln}
			switch kind {
			case "authored":
				g.authored = &it
			case "entry":
				g.entries = append(g.entries, it)
			case "symbol":
				g.symbols = append(g.symbols, it)
			case "dependency":
				g.deps = append(g.deps, it)
			case "cited-by":
				g.cited = &it
			case "re-exports":
				g.re = &it
			}
		}
		if kind == "format" || kind == "location" || kind == "scanner" {
			c.bad("a second %s line (section 8)", kind)
		}
	}
	if !ended {
		fail("the text has no end line (section 8)")
	}
	e.flush()
	// the paths, front-coded (section 4.4)
	var pb []byte
	prev := ""
	idx := make(map[string]int, len(e.paths))
	for i, p := range e.paths {
		sh := 0
		for sh < len(prev) && sh < len(p) && prev[sh] == p[sh] {
			sh++
		}
		pb = binary.AppendUvarint(pb, uint64(sh))
		pb = binary.AppendUvarint(pb, uint64(len(p)-sh))
		pb = append(pb, p[sh:]...)
		prev = p
		if _, dup := idx[p]; !dup {
			idx[p] = i
		}
	}
	e.addFrame(kPaths, len(e.paths), pb)
	// the wires, from what the links name (section 4.5)
	var wb []byte
	var ws []int
	for i, ts := range e.targets {
		ws = ws[:0]
		for _, t := range ts {
			if j, ok := idx[t]; ok && j != i {
				ws = append(ws, j)
			}
		}
		slices.Sort(ws)
		ws = slices.Compact(ws)
		wb = binary.AppendUvarint(wb, uint64(len(ws)))
		for k, j := range ws {
			if k == 0 {
				wb = binary.AppendUvarint(wb, uint64(j))
			} else {
				wb = binary.AppendUvarint(wb, uint64(j-ws[k-1]-1))
			}
		}
	}
	e.addFrame(kWires, len(e.paths), wb)
	name := contentName(append(e.frames, nil))
	e.addFrame(kEnd, len(e.frames), name[:])
	return &scan{frames: e.frames}
}

// cmpWriter compares what is written with the text it was given.
type cmpWriter struct {
	want  []byte
	pos   int
	bad   bool
	badAt int
}

type stopWriting struct{}

func (stopWriting) Error() string { return "stop" }

func (c *cmpWriter) Write(p []byte) (int, error) {
	if c.bad {
		return 0, stopWriting{}
	}
	n := len(p)
	rest := c.want[c.pos:]
	for i := 0; i < n; i++ {
		if i >= len(rest) || rest[i] != p[i] {
			c.bad, c.badAt = true, c.pos+i
			return 0, stopWriting{}
		}
	}
	c.pos += n
	return n, nil
}

// nameOfText reads a text form and gives the content's name of the binary
// file it describes (section 3.4).
func nameOfText(data []byte) [32]byte {
	s := textToScan(data)
	func() {
		defer func() {
			if r := recover(); r != nil {
				if rf, ok := r.(refusal); ok {
					panic(refusal{"the text's facts are not ones a writer can store, since the file they make is refused: " + rf.msg})
				}
				panic(r)
			}
		}()
		s.checkOrder()
		s.analyze()
	}()
	// A valid text is exactly the text a reader writes for the file: write
	// it again from the sections and compare byte for byte.
	cw := &cmpWriter{want: data}
	bw := bufio.NewWriterSize(cw, 1<<16)
	emitText(s, bw)
	bw.Flush()
	if !cw.bad && cw.pos != len(data) {
		cw.bad, cw.badAt = true, cw.pos
	}
	if cw.bad {
		line := bytes.Count(data[:cw.badAt], []byte{'\n'}) + 1
		col := cw.badAt - (bytes.LastIndexByte(data[:cw.badAt], '\n') + 1) + 1
		fail("line %d is not in its one form: from byte %d it differs from the line its facts are written as (an order of members, or a member's form; section 8)", line, col)
	}
	return contentName(s.frames)
}
