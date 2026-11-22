package main

import (
	"bytes"
	"compress/flate"
	"crypto/sha256"
	"encoding/binary"
	"slices"
)

// The writer of section 7.1, run all at once over the facts of a text.

type encoder struct {
	ids   map[string]uint32
	fresh []string
}

func uv(b []byte, v uint32) []byte { return binary.AppendUvarint(b, uint64(v)) }

func textOf(b []byte, s string) []byte {
	b = uv(b, uint32(len(s)))
	return append(b, s...)
}

func (e *encoder) sid(b []byte, s string) []byte {
	id, ok := e.ids[s]
	if !ok {
		id = uint32(len(e.ids))
		e.ids[s] = id
		e.fresh = append(e.fresh, s)
	}
	return uv(b, id)
}

func (e *encoder) list(b []byte, l []string) []byte {
	b = uv(b, uint32(len(l)))
	for _, s := range l {
		b = e.sid(b, s)
	}
	return b
}

func linkedMark(l tlinked) uint32 {
	var m uint32
	if l.link.ok {
		m |= 1
	}
	if l.target.ok {
		m |= 2
	}
	if l.anchor.ok {
		m |= 4
	}
	return m
}

func (e *encoder) linked(b []byte, l tlinked) []byte {
	if l.link.ok {
		b = e.sid(b, l.link.s)
	}
	if l.target.ok {
		b = e.sid(b, l.target.s)
	}
	if l.anchor.ok {
		b = e.sid(b, l.anchor.s)
	}
	return b
}

func (e *encoder) types(b []byte, ts []ttype) []byte {
	b = uv(b, uint32(len(ts)))
	for _, t := range ts {
		b = e.sid(b, t.name)
		m := linkedMark(t.l)
		if t.array {
			m |= 8
		}
		if t.promise {
			m |= 16
		}
		b = uv(b, m)
		b = e.linked(b, t.l)
	}
	return b
}

func (e *encoder) record(b []byte, f *tfile) []byte {
	b = e.sid(b, f.path)
	b = uv(b, f.layer)
	var fm uint32
	if f.archetype.ok {
		fm |= 1
	}
	if f.generated.ok {
		fm |= 2
	}
	if f.hasCited {
		fm |= 4
	}
	if f.hasReExport {
		fm |= 8
	}
	b = uv(b, fm)
	if f.archetype.ok {
		b = e.sid(b, f.archetype.s)
	}
	b = uv(b, uint32(len(f.entries)))
	for _, en := range f.entries {
		b = uv(b, en.reason)
		var m uint32
		if en.symName.ok {
			m |= 1
		}
		if en.symLink.ok {
			m |= 2
		}
		if en.cmd.ok {
			m |= 4
		}
		if en.hasDeclarer {
			m |= 8
		}
		b = uv(b, m)
		if en.symName.ok {
			b = e.sid(b, en.symName.s)
		}
		if en.symLink.ok {
			b = e.sid(b, en.symLink.s)
		}
		if en.cmd.ok {
			b = e.sid(b, en.cmd.s)
		}
		if en.hasDeclarer {
			b = e.sid(b, en.declLabel)
			b = e.sid(b, en.declLink)
		}
	}
	if f.generated.ok {
		b = e.sid(b, f.generated.s)
	}
	b = e.sid(b, f.authored)
	b = uv(b, uint32(len(f.symbols)))
	for _, s := range f.symbols {
		b = e.sid(b, s.name)
		var m uint32
		if s.slug.ok {
			m |= 1
		}
		if s.hasSource {
			m |= 2
		}
		b = uv(b, m)
		if s.slug.ok {
			b = e.sid(b, s.slug.s)
		}
		b = e.sid(b, s.kind)
		b = e.list(b, s.flags)
		if s.hasSource {
			b = e.sid(b, s.srcPath)
			b = uv(b, s.srcLine)
		}
		b = uv(b, uint32(len(s.refs)))
		for _, r := range s.refs {
			b = uv(b, r.role)
			if r.role == 4 {
				b = uv(b, uint32(len(r.params)))
				for _, p := range r.params {
					b = e.sid(b, p.name)
					b = e.types(b, p.types)
				}
			} else {
				b = e.types(b, r.types)
			}
		}
		b = uv(b, uint32(len(s.sections)))
		for _, sec := range s.sections {
			b = e.sid(b, sec.title)
			b = e.list(b, sec.body)
		}
	}
	b = uv(b, uint32(len(f.deps)))
	for _, d := range f.deps {
		b = e.sid(b, d.label)
		m := linkedMark(d.l)
		if d.hasSymbols {
			m |= 8
		}
		b = uv(b, m)
		b = e.linked(b, d.l)
		if d.hasSymbols {
			b = e.list(b, d.symbols)
		}
		b = e.list(b, d.qualifiers)
	}
	if f.hasCited {
		b = uv(b, uint32(len(f.cited)))
		for _, c := range f.cited {
			b = e.sid(b, c.label)
			b = e.sid(b, c.link)
		}
	}
	if f.hasReExport {
		b = uv(b, uint32(len(f.reExports)))
		for _, x := range f.reExports {
			b = e.sid(b, x.name)
			var m uint32
			if x.slug.ok {
				m |= 1
			}
			if x.hasFrom {
				m |= 2
			}
			b = uv(b, m)
			if x.slug.ok {
				b = e.sid(b, x.slug.s)
			}
			if x.hasFrom {
				b = e.sid(b, x.fromLabel)
				b = e.sid(b, x.fromLink)
			}
			b = e.list(b, x.flags)
		}
	}
	return b
}

type section struct {
	kind  byte
	count uint32
	raw   []byte
}

// buildFile writes the facts as a finished file, compressing with Go's flate.
func buildFile(t *textFacts) []byte {
	var secs []section
	h := []byte{1}
	h = textOf(h, t.root)
	h = textOf(h, t.baseLayer)
	h = textOf(h, t.extension)
	h = textOf(h, t.scanner)
	h = uv(h, uint32(len(t.leftOut)))
	for _, l := range t.leftOut {
		h = textOf(h, l.reason)
		h = uv(h, l.number)
		h = textOf(h, l.detail)
	}
	secs = append(secs, section{kindHead, 0, h})
	e := &encoder{ids: map[string]uint32{}}
	for i := 0; i < len(t.files); i += 256 {
		j := min(i+256, len(t.files))
		e.fresh = e.fresh[:0]
		var rb []byte
		for _, f := range t.files[i:j] {
			rb = e.record(rb, f)
		}
		if len(e.fresh) > 0 {
			var sb []byte
			for _, s := range e.fresh {
				sb = textOf(sb, s)
			}
			secs = append(secs, section{kindStrings, uint32(len(e.fresh)), sb})
		}
		secs = append(secs, section{kindRecords, uint32(j - i), rb})
	}
	n := uint32(len(t.files))
	index := make(map[string]int, len(t.files))
	var pb []byte
	prev := ""
	for i, f := range t.files {
		index[f.path] = i
		shared := 0
		for shared < len(prev) && shared < len(f.path) && prev[shared] == f.path[shared] {
			shared++
		}
		pb = uv(pb, uint32(shared))
		pb = textOf(pb, f.path[shared:])
		prev = f.path
	}
	secs = append(secs, section{kindPaths, n, pb})
	var wb []byte
	for i, f := range t.files {
		seen := map[int]bool{}
		add := func(l tlinked) {
			if l.target.ok {
				if j, ok := index[l.target.s]; ok && j != i {
					seen[j] = true
				}
			}
		}
		for _, d := range f.deps {
			add(d.l)
		}
		for _, s := range f.symbols {
			for _, r := range s.refs {
				for _, p := range r.params {
					for _, ty := range p.types {
						add(ty.l)
					}
				}
				for _, ty := range r.types {
					add(ty.l)
				}
			}
		}
		var ws []int
		for j := range seen {
			ws = append(ws, j)
		}
		sortInts(ws)
		wb = uv(wb, uint32(len(ws)))
		for k, j := range ws {
			if k == 0 {
				wb = uv(wb, uint32(j))
			} else {
				wb = uv(wb, uint32(j-ws[k-1]-1))
			}
		}
	}
	secs = append(secs, section{kindWires, n, wb})

	out := append([]byte{}, signature...)
	nameHash := sha256.New()
	for _, s := range secs {
		if len(s.raw) > maxSection {
			refuse("the facts would need a %s section of %d bytes, above MAX_SECTION", kindNames[s.kind], len(s.raw))
		}
		hash := sha256.Sum256(s.raw)
		nameHash.Write(hash[:])
		out = appendFrame(out, s.kind, s.count, s.raw, hash)
	}
	name := nameHash.Sum(nil)
	out = appendFrame(out, kindEnd, uint32(len(secs)), name, sha256.Sum256(name))
	return out
}

func appendFrame(out []byte, kind byte, count uint32, raw []byte, hash [32]byte) []byte {
	var z bytes.Buffer
	w, _ := flate.NewWriter(&z, flate.BestCompression)
	w.Write(raw)
	w.Close()
	out = append(out, kind)
	out = binary.LittleEndian.AppendUint32(out, count)
	out = binary.LittleEndian.AppendUint32(out, uint32(len(raw)))
	out = binary.LittleEndian.AppendUint32(out, uint32(z.Len()))
	out = append(out, hash[:]...)
	return append(out, z.Bytes()...)
}

func sortInts(a []int) { slices.Sort(a) }
