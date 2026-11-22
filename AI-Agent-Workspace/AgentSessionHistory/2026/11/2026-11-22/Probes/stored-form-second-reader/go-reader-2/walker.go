package main

import (
	"bufio"
	"bytes"
	"slices"
	"strconv"
)

// The words of the enumerations (section 4.3) and the graph's edge kinds
// for a type's role (section 5).
var reasonWords = []string{"program", "command", "module", "opening", "tooling", "declared"}
var roleWords = []string{"Returns", "Extends", "Implements", "Constraints", "Parameters"}
var roleKinds = []string{"returns", "extends", "implements", "constraint", "parameter"}

// walker walks one records section by the grammar of section 4.3. The
// same walk validates (pass one, before anything is written), writes the
// text form, or writes one part of a file's graph, by its flags. Text and
// graph output come only from a pass after validation succeeded.
type walker struct {
	s        *scan
	d        dec
	validate bool
	text     bool
	gDeps    bool // write dependency edges
	gTypes   bool // write type edges
	gDocs    bool // write documentation items
	out      *bufio.Writer

	file    int
	pathSid uint32
	slug    int64 // current symbol's slug sid, or -1

	wireBuf  []uint32
	docPairs []uint64

	firstEdge bool
	docOpen   bool
}

func (w *walker) where() string {
	return "record " + strconv.Itoa(w.file) + " (" + strconv.Quote(clip(w.s.path(w.file))) + ")"
}

func (w *walker) sid(what string) uint32 {
	v := w.d.varint()
	s := w.s
	n := s.numStr()
	if w.validate {
		switch {
		case int64(v) < int64(s.met):
		case int64(v) == int64(s.met):
			if s.met >= n {
				fail("%s: %s names string %d, which no strings section before it sets down (section 4.2)", w.where(), what, v)
			}
			s.met++
		default:
			fail("%s: %s names string %d where the next string not yet met is %d (section 4.2: first-met order)", w.where(), what, v, s.met)
		}
		s.names += uint64(s.strLen(v))
	} else if int64(v) >= int64(n) {
		fail("%s: %s names string %d, past the table", w.where(), what, v)
	}
	return v
}

func (w *walker) mark(what string, defined uint32) uint32 {
	m := w.d.varint()
	if w.validate && m&^defined != 0 {
		fail("%s: %s %d sets a bit the layout does not define (section 2.1)", w.where(), what, m)
	}
	return m
}

func (w *walker) count(item string) int {
	return w.d.count(item, 1)
}

func (w *walker) link(k uint32, what string) {
	if w.validate {
		if r := linkReason(w.s.str(k)); r != "" {
			fail("%s: %s %q is refused as a link: it %s (section 2.4)", w.where(), what, clip(w.s.str(k)), r)
		}
	}
}

func (w *walker) pathOf(k uint32, what string) {
	if w.validate && w.s.sidPath[k] == 0 {
		if r := pathReason(w.s.str(k)); r != "" {
			fail("%s: %s %q is not a path: it %s (section 2.4)", w.where(), what, clip(w.s.str(k)), r)
		}
		w.s.sidPath[k] = 1
	}
}

// ---------- small writers ----------

func (w *walker) ws(s string)   { w.out.WriteString(s) }
func (w *walker) wstr(k uint32) { writeJSONString(w.out, w.s.str(k)) }
func (w *walker) wkey(key string, k uint32) {
	w.out.WriteString(key)
	writeJSONString(w.out, w.s.str(k))
}
func (w *walker) wnum(v uint32) { w.out.Write(appendUint(nil, uint64(v))) }

func (w *walker) line(kind string) {
	w.out.WriteByte('[')
	w.wstr(w.pathSid)
	w.out.WriteString(`,"`)
	w.out.WriteString(kind)
	w.out.WriteString(`",`)
}

func writeJSONString(o *bufio.Writer, b []byte) {
	const hexd = "0123456789abcdef"
	o.WriteByte('"')
	start := 0
	for i := 0; i < len(b); i++ {
		c := b[i]
		if c >= 0x20 && c != '"' && c != '\\' {
			continue
		}
		o.Write(b[start:i])
		switch c {
		case '"':
			o.WriteString(`\"`)
		case '\\':
			o.WriteString(`\\`)
		case '\b':
			o.WriteString(`\b`)
		case '\t':
			o.WriteString(`\t`)
		case '\n':
			o.WriteString(`\n`)
		case '\f':
			o.WriteString(`\f`)
		case '\r':
			o.WriteString(`\r`)
		default:
			o.WriteString(`\u00`)
			o.WriteByte(hexd[c>>4])
			o.WriteByte(hexd[c&15])
		}
		start = i + 1
	}
	o.Write(b[start:])
	o.WriteByte('"')
}

// ---------- the record ----------

func (w *walker) record(i int) {
	s := w.s
	w.file = i
	ps := w.sid("the path")
	w.pathSid = ps
	if w.validate {
		if r := pathReason(s.str(ps)); r != "" {
			fail("record %d: its path %q is not a path: it %s (section 2.4)", i, clip(s.str(ps)), r)
		}
		s.sidPath[ps] = 1
		if !bytes.Equal(s.str(ps), s.path(i)) {
			fail("record %d: its path %q is not the paths section's path %q at that place (section 4.4)", i, clip(s.str(ps)), clip(s.path(i)))
		}
	}
	layer := w.d.varint()
	fm := w.mark("the file mark", 0xF)
	arch := int64(-1)
	if fm&1 != 0 {
		arch = int64(w.sid("the archetype"))
	}
	if w.text {
		// The file and authored lines come before the entries in the
		// text, but generatedAt and authored follow them in the layout.
		at := w.d.p
		w.text = false
		ne := w.count("entries")
		for k := 0; k < ne; k++ {
			w.entry()
		}
		gen := int64(-1)
		if fm&2 != 0 {
			gen = int64(w.sid("generatedAt"))
		}
		auth := w.sid("authored")
		w.text = true
		w.d.p = at
		w.line("file")
		w.wnum(layer)
		if arch >= 0 {
			w.wkey(",", uint32(arch))
		} else {
			w.ws(",null")
		}
		if gen >= 0 {
			w.wkey(",", uint32(gen))
		} else {
			w.ws(",null")
		}
		w.ws("]\n")
		w.line("authored")
		w.wstr(auth)
		w.ws("]\n")
	}
	ne := w.count("entries")
	for k := 0; k < ne; k++ {
		w.entry()
	}
	if fm&2 != 0 {
		w.sid("generatedAt")
	}
	w.sid("authored")
	ns := w.count("symbols")
	for k := 0; k < ns; k++ {
		w.symbol()
	}
	nd := w.count("dependencies")
	for k := 0; k < nd; k++ {
		w.dependency()
	}
	if fm&4 != 0 {
		if w.text {
			w.line("cited-by")
			w.ws("[")
		}
		n := w.count("cited-by items")
		for k := 0; k < n; k++ {
			lab := w.sid("a cited-by label")
			lk := w.sid("a cited-by link")
			w.link(lk, "a cited-by link")
			if w.text {
				if k > 0 {
					w.ws(",")
				}
				w.wkey(`{"label":`, lab)
				w.wkey(`,"link":`, lk)
				w.ws("}")
			}
		}
		if w.text {
			w.ws("]]\n")
		}
	}
	if fm&8 != 0 {
		if w.text {
			w.line("re-exports")
			w.ws("[")
		}
		n := w.count("re-exports")
		for k := 0; k < n; k++ {
			name := w.sid("a re-export's name")
			m := w.mark("a re-export mark", 0x3)
			if w.text {
				if k > 0 {
					w.ws(",")
				}
				w.wkey(`{"name":`, name)
			}
			if m&1 != 0 {
				sl := w.sid("a re-export's slug")
				if w.text {
					w.wkey(`,"slug":`, sl)
				}
			}
			if m&2 != 0 {
				fl := w.sid("a re-export's fromLabel")
				fk := w.sid("a re-export's fromLink")
				w.link(fk, "a re-export's fromLink")
				if w.text {
					w.wkey(`,"from":{"label":`, fl)
					w.wkey(`,"link":`, fk)
					w.ws("}")
				}
			}
			if w.text {
				w.ws(`,"flags":[`)
			}
			nf := w.count("flags")
			for j := 0; j < nf; j++ {
				f := w.sid("a re-export's flag")
				if w.text {
					if j > 0 {
						w.ws(",")
					}
					w.wstr(f)
				}
			}
			if w.text {
				w.ws("]}")
			}
		}
		if w.text {
			w.ws("]]\n")
		}
	}
	if w.validate {
		buf := w.wireBuf
		slices.Sort(buf)
		buf = slices.Compact(buf)
		want := s.wVal[s.wOff[i]:s.wOff[i+1]]
		if !slices.Equal(buf, want) {
			fail("%s: its outbound wires in the wires section (%d) are not the other scanned files its links land on (%d) (section 4.5)", w.where(), len(want), len(buf))
		}
		w.wireBuf = buf[:0]
		lines := 2 + ne + ns + nd
		if fm&4 != 0 {
			lines++
		}
		if fm&8 != 0 {
			lines++
		}
		// The path is written on every line of the file, once already counted.
		s.names += uint64(lines-1) * uint64(s.strLen(ps))
	}
}

func (w *walker) entry() {
	r := w.d.varint()
	if w.validate && r > 5 {
		fail("%s: an entry's reason %d is not one of 0 to 5 (section 4.3)", w.where(), r)
	}
	m := w.mark("an entry mark", 0xF)
	if w.validate && m&2 != 0 && m&1 == 0 {
		fail("%s: an entry mark sets bit 1 (symbolLink) without bit 0 (symbolName) (section 4.3)", w.where())
	}
	if w.text {
		w.line("entry")
		w.ws(`{"reason":"`)
		w.ws(reasonWords[r])
		w.ws(`"`)
	}
	if m&1 != 0 {
		n := w.sid("an entry's symbolName")
		if w.text {
			w.wkey(`,"symbol":{"name":`, n)
		}
		if m&2 != 0 {
			l := w.sid("an entry's symbolLink")
			w.link(l, "an entry's symbolLink")
			if w.text {
				w.wkey(`,"link":`, l)
			}
		}
		if w.text {
			w.ws("}")
		}
	}
	if m&4 != 0 {
		c := w.sid("an entry's command")
		if w.text {
			w.wkey(`,"command":`, c)
		}
	}
	if m&8 != 0 {
		lab := w.sid("an entry's declarerLabel")
		lk := w.sid("an entry's declarerLink")
		w.link(lk, "an entry's declarerLink")
		if w.text {
			w.wkey(`,"declarer":{"label":`, lab)
			w.wkey(`,"link":`, lk)
			w.ws("}")
		}
	}
	if w.text {
		w.ws("}]\n")
	}
}

// linked reads [link] [target] [anchor] by bits 0, 1, 2 of m.
func (w *walker) linked(m uint32, what string) (link, target, anchor int64) {
	link, target, anchor = -1, -1, -1
	if w.validate {
		if m&2 != 0 && m&1 == 0 {
			fail("%s: %s mark sets a target without a link (section 4.3)", w.where(), what)
		}
		if m&4 != 0 && m&2 == 0 {
			fail("%s: %s mark sets an anchor without a target (section 4.3)", w.where(), what)
		}
	}
	if m&1 != 0 {
		l := w.sid(what + "'s link")
		w.link(l, what+"'s link")
		link = int64(l)
	}
	if m&2 != 0 {
		t := w.sid(what + "'s target")
		w.pathOf(t, what+"'s target")
		target = int64(t)
	}
	if m&4 != 0 {
		target := w.sid(what + "'s anchor")
		anchor = int64(target)
	}
	if w.text {
		if link >= 0 {
			w.wkey(`,"link":`, uint32(link))
		}
		if target >= 0 {
			w.wkey(`,"target":`, uint32(target))
		}
		if anchor >= 0 {
			w.wkey(`,"anchor":`, uint32(anchor))
		}
	}
	return
}

// landsOn gives the scanned file a target names, or -1.
func (w *walker) landsOn(target int64) int32 {
	if target < 0 {
		return -1
	}
	return w.s.fileOf(uint32(target))
}

func (w *walker) wire(target int64) {
	if w.validate {
		if f := w.landsOn(target); f >= 0 && int(f) != w.file {
			w.wireBuf = append(w.wireBuf, uint32(f))
		}
	}
}

func (w *walker) symbol() {
	name := w.sid("a symbol's name")
	m := w.mark("a symbol mark", 0x3)
	w.slug = -1
	if m&1 != 0 {
		w.slug = int64(w.sid("a symbol's slug"))
	}
	kind := w.sid("a symbol's kind")
	if w.text {
		w.line("symbol")
		w.wkey(`{"name":`, name)
		if w.slug >= 0 {
			w.wkey(`,"slug":`, uint32(w.slug))
		}
		w.wkey(`,"kind":`, kind)
		w.ws(`,"flags":[`)
	}
	nf := w.count("flags")
	for j := 0; j < nf; j++ {
		f := w.sid("a symbol's flag")
		if w.text {
			if j > 0 {
				w.ws(",")
			}
			w.wstr(f)
		}
	}
	if w.text {
		w.ws("]")
	}
	if m&2 != 0 {
		sp := w.sid("a symbol's sourcePath")
		w.link(sp, "a symbol's sourcePath")
		line := w.d.varint()
		if w.text {
			w.wkey(`,"source":{"path":`, sp)
			w.ws(`,"line":`)
			w.wnum(line)
			w.ws("}")
		}
	}
	if w.text {
		w.ws(`,"references":[`)
	}
	nr := w.count("references")
	for j := 0; j < nr; j++ {
		if w.text && j > 0 {
			w.ws(",")
		}
		w.reference()
	}
	if w.text {
		w.ws(`],"sections":[`)
	}
	nsec := w.count("sections")
	for j := 0; j < nsec; j++ {
		t := w.sid("a section's title")
		if w.text {
			if j > 0 {
				w.ws(",")
			}
			w.wkey(`{"title":`, t)
			w.ws(`,"body":[`)
		}
		nl := w.count("lines")
		for k := 0; k < nl; k++ {
			l := w.sid("a section's line")
			if w.text {
				if k > 0 {
					w.ws(",")
				}
				w.wstr(l)
			}
		}
		if w.text {
			w.ws("]}")
		}
	}
	if w.text {
		w.ws(`],"documentation":[`)
	}
	ndoc := w.count("documentation references")
	for j := 0; j < ndoc; j++ {
		if w.text && j > 0 {
			w.ws(",")
		}
		w.docReference()
	}
	if w.text {
		w.ws("]}]\n")
	}
}

func (w *walker) reference() {
	role := w.d.varint()
	if w.validate && role > 4 {
		fail("%s: a reference's role %d is not one of 0 to 4 (section 4.3)", w.where(), role)
	}
	if w.text {
		w.ws(`{"role":"`)
		w.ws(roleWords[role])
		w.ws(`"`)
	}
	if role == 4 {
		if w.text {
			w.ws(`,"parameters":[`)
		}
		np := w.count("parameters")
		for j := 0; j < np; j++ {
			pn := w.sid("a parameter's name")
			if w.text {
				if j > 0 {
					w.ws(",")
				}
				w.wkey(`{"name":`, pn)
				w.ws(`,"types":[`)
			}
			nt := w.count("types")
			for k := 0; k < nt; k++ {
				if w.text && k > 0 {
					w.ws(",")
				}
				w.typ(role, int64(pn))
			}
			if w.text {
				w.ws("]}")
			}
		}
		if w.text {
			w.ws("]")
		}
	} else {
		if w.text {
			w.ws(`,"types":[`)
		}
		nt := w.count("types")
		for k := 0; k < nt; k++ {
			if w.text && k > 0 {
				w.ws(",")
			}
			w.typ(role, -1)
		}
		if w.text {
			w.ws("]")
		}
	}
	if w.text {
		w.ws("}")
	}
}

func (w *walker) typ(role uint32, param int64) {
	name := w.sid("a type's name")
	m := w.mark("a type mark", 0x1F)
	if w.text {
		w.wkey(`{"name":`, name)
	}
	link, target, anchor := w.linked(m, "a type")
	if w.text {
		if m&8 != 0 {
			w.ws(`,"array":true`)
		}
		if m&16 != 0 {
			w.ws(`,"promise":true`)
		}
		w.ws("}")
	}
	w.wire(target)
	if w.gTypes && link >= 0 {
		w.edge(roleKinds[role], int64(name), link, target, anchor, w.slug, param, false, -1)
	}
}

func (w *walker) docReference() {
	name := w.sid("a documentation reference's name")
	m := w.mark("a documentation reference mark", 0xF)
	el := int64(-1)
	if m&8 != 0 {
		el = int64(w.sid("a documentation reference's element"))
	}
	if w.text {
		w.wkey(`{"name":`, name)
		if el >= 0 {
			w.wkey(`,"element":`, uint32(el))
		}
	}
	link, target, anchor := w.linked(m, "a documentation reference")
	if w.text {
		w.ws("}")
	}
	f := w.landsOn(target)
	if w.validate && f >= 0 && int(f) != w.file {
		v := uint64(f)<<32 | uint64(w.file)
		if n := len(w.docPairs); n == 0 || w.docPairs[n-1] != v {
			w.docPairs = append(w.docPairs, v)
		}
	}
	if w.gDocs && f >= 0 {
		o := w.out
		if !w.docOpen {
			o.WriteString(`,"documentation":[`)
			w.docOpen = true
		} else {
			o.WriteByte(',')
		}
		w.wkey(`{"label":`, name)
		w.wkey(`,"link":`, uint32(link))
		w.wkey(`,"to":`, uint32(target))
		if el >= 0 {
			w.wkey(`,"element":`, uint32(el))
		}
		if anchor >= 0 {
			w.wkey(`,"toSymbol":`, uint32(anchor))
		}
		if w.slug >= 0 {
			w.wkey(`,"from":`, uint32(w.slug))
		}
		o.WriteByte('}')
	}
}

func (w *walker) dependency() {
	label := w.sid("a dependency's label")
	m := w.mark("a dependency mark", 0xF)
	if w.text {
		w.line("dependency")
		w.wkey(`{"label":`, label)
	}
	link, target, anchor := w.linked(m, "a dependency")
	if m&8 != 0 {
		if w.text {
			w.ws(`,"symbols":[`)
		}
		n := w.count("symbols")
		for j := 0; j < n; j++ {
			sy := w.sid("a dependency's symbol")
			if w.text {
				if j > 0 {
					w.ws(",")
				}
				w.wstr(sy)
			}
		}
		if w.text {
			w.ws("]")
		}
	}
	if w.text {
		w.ws(`,"qualifiers":[`)
	}
	reExport, typeOnly := false, false
	basis := int64(-1)
	nq := w.count("qualifiers")
	for j := 0; j < nq; j++ {
		q := w.sid("a dependency's qualifier")
		if w.text {
			if j > 0 {
				w.ws(",")
			}
			w.wstr(q)
		}
		if w.gDeps {
			b := w.s.str(q)
			switch string(b) {
			case "re-export":
				reExport = true
			case "type-only":
				typeOnly = true
			case "contract", "configuration":
				if basis < 0 {
					basis = int64(q)
				}
			}
		}
	}
	if w.text {
		w.ws("]}]\n")
	}
	w.wire(target)
	if w.gDeps && link >= 0 {
		kind := "import"
		if reExport {
			kind = "re-export"
		}
		w.edge(kind, int64(label), link, target, anchor, -1, -1, typeOnly, basis)
	}
}

func (w *walker) edge(kind string, label, link, target, anchor, from, param int64, typeOnly bool, basis int64) {
	o := w.out
	if !w.firstEdge {
		o.WriteByte(',')
	}
	w.firstEdge = false
	o.WriteString(`{"kind":"`)
	o.WriteString(kind)
	o.WriteString(`"`)
	w.wkey(`,"label":`, uint32(label))
	w.wkey(`,"link":`, uint32(link))
	if w.landsOn(target) >= 0 {
		w.wkey(`,"to":`, uint32(target))
		if anchor >= 0 {
			w.wkey(`,"toSymbol":`, uint32(anchor))
		}
	}
	if from >= 0 {
		w.wkey(`,"from":`, uint32(from))
	}
	if param >= 0 {
		w.wkey(`,"parameter":`, uint32(param))
	}
	if typeOnly {
		o.WriteString(`,"typeOnly":true`)
	}
	if basis >= 0 {
		w.wkey(`,"basis":`, uint32(basis))
	}
	o.WriteByte('}')
}

// ---------- the text form (section 8) ----------

func emitText(s *scan, out *bufio.Writer) {
	out.WriteString("[null,\"format\",\"fact-pack\",1]\n")
	out.WriteString("[null,\"location\",")
	writeJSONString(out, s.root)
	out.WriteByte(',')
	writeJSONString(out, s.base)
	out.WriteByte(',')
	writeJSONString(out, s.ext)
	out.WriteString("]\n[null,\"scanner\",")
	writeJSONString(out, s.scanner)
	out.WriteString("]\n")
	ld := &dec{b: s.headRaw, p: s.leftAt, what: "the head"}
	for k := 0; k < s.nLeft; k++ {
		lo := s.nextLeftOut(ld)
		out.WriteString("[null,\"left-out\",")
		writeJSONString(out, lo.reason)
		out.WriteByte(',')
		out.Write(appendUint(nil, uint64(lo.number)))
		out.WriteByte(',')
		writeJSONString(out, lo.detail)
		out.WriteString("]\n")
	}
	w := &walker{s: s, text: true, out: out}
	file := 0
	for _, f := range s.recFrames {
		w.d = dec{b: f.raw, what: "records"}
		for j := 0; j < int(f.count); j++ {
			w.record(file)
			file++
		}
	}
	out.WriteString("[null,\"end\",")
	out.Write(appendUint(nil, uint64(s.nFiles)))
	out.WriteString("]\n")
}

// ---------- the graph (section 5) ----------

func (s *scan) writeDocument(out *bufio.Writer, i int) {
	var b []byte
	if len(s.root) > 0 {
		b = append(b, s.root...)
		b = append(b, '/')
	}
	if len(s.base) > 0 {
		b = append(b, s.base...)
		b = append(b, '/')
	}
	b = append(b, s.path(i)...)
	b = append(b, s.ext...)
	writeJSONString(out, b)
}

func (s *scan) writePathList(out *bufio.Writer, list []uint32) {
	for k, t := range list {
		if k > 0 {
			out.WriteByte(',')
		}
		writeJSONString(out, s.path(int(t)))
	}
}

func emitGraph(s *scan, out *bufio.Writer) {
	out.WriteString(`{"files":[`)
	w := &walker{s: s, out: out}
	file := 0
	for _, f := range s.recFrames {
		w.d = dec{b: f.raw, what: "records"}
		for j := 0; j < int(f.count); j++ {
			if file > 0 {
				out.WriteByte(',')
			}
			out.WriteString("\n{\"path\":")
			writeJSONString(out, s.path(file))
			out.WriteString(`,"document":`)
			s.writeDocument(out, file)
			out.WriteString(`,"edges":[`)
			start := w.d.p
			w.firstEdge = true
			w.gDeps, w.gTypes, w.gDocs = true, false, false
			w.record(file)
			w.d.p = start
			w.gDeps, w.gTypes = false, true
			w.record(file)
			out.WriteString(`],"outbound":[`)
			s.writePathList(out, s.wVal[s.wOff[file]:s.wOff[file+1]])
			out.WriteString(`],"inbound":[`)
			s.writePathList(out, s.inVal[s.inOff[file]:s.inOff[file+1]])
			out.WriteString(`]`)
			w.d.p = start
			w.gTypes, w.gDocs = false, true
			w.docOpen = false
			w.record(file)
			if w.docOpen {
				out.WriteByte(']')
			}
			if by := s.docVal[s.docOff[file]:s.docOff[file+1]]; len(by) > 0 {
				out.WriteString(`,"documentedBy":[`)
				s.writePathList(out, by)
				out.WriteByte(']')
			}
			out.WriteByte('}')
			file++
		}
	}
	out.WriteString("\n]}\n")
}
