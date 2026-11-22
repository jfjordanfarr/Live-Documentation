package main

import (
	"bufio"
	"bytes"
	"compress/flate"
	"crypto/sha256"
	"encoding/binary"
	"errors"
	"io"
	"slices"
	"strconv"
	"strings"
	"unicode/utf8"
)

const (
	maxSection = 64 << 20 // MAX_SECTION, section 3.5
	mebibyte   = 1 << 20
	headerLen  = 45
)

const (
	kindHead    = 1
	kindStrings = 2
	kindRecords = 3
	kindPaths   = 4
	kindWires   = 5
	kindEnd     = 6
)

var signature = []byte{0x89, 0x46, 0x50, 0x4B, 0x0D, 0x0A, 0x1A, 0x0A}

var kindNames = [...]string{"", "head", "strings", "records", "paths", "wires", "end"}

var reasonNames = [...]string{"program", "command", "module", "opening", "tooling", "declared"}

var roleNames = [...]string{"Returns", "Extends", "Implements", "Constraints", "Parameters"}

type frame struct {
	kind   byte
	count  uint32
	raw    uint32
	stored []byte
	hash   [32]byte
}

type leftOut struct {
	reason string
	number uint32
	detail string
}

type head struct {
	root, baseLayer, extension, scanner string
	leftOut                             []leftOut
}

// per-string facts computed at most once, so that a string named many times costs once.
type stringInfo struct {
	pathState int8  // 0 unchecked, 1 a path, 2 not a path
	file      int32 // -2 unlooked, -1 not a scanned file, else its number
}

type recordSection struct {
	raw   []byte
	count int
}

type scan struct {
	frames  []frame
	name    [32]byte
	head    head
	paths   []string
	wireAt  []uint32 // wires of file i are wires[wireAt[i]:wireAt[i+1]]
	wires   []uint32
	nfiles  int
	table   []string
	info    []stringInfo
	met     int
	records []recordSection
}

// ---------- cursor over one section ----------

type cur struct {
	b    []byte
	p    int
	what string
}

func (c *cur) left() int { return len(c.b) - c.p }

func (c *cur) u8() byte {
	if c.p >= len(c.b) {
		refuse("%s: runs out of bytes", c.what)
	}
	v := c.b[c.p]
	c.p++
	return v
}

// varint: LEB128, at most five bytes, shortest form, at most 2^32-1 (section 2.1).
func (c *cur) varint() uint32 {
	var v uint64
	for i := 0; i < 5; i++ {
		if c.p >= len(c.b) {
			refuse("%s: a varint runs past the end of the section", c.what)
		}
		b := c.b[c.p]
		c.p++
		v |= uint64(b&0x7f) << (7 * uint(i))
		if b&0x80 == 0 {
			if i > 0 && b == 0 {
				refuse("%s: a varint is not in its shortest form", c.what)
			}
			if v > 0xFFFFFFFF {
				refuse("%s: a varint is above 2^32 - 1", c.what)
			}
			return uint32(v)
		}
	}
	refuse("%s: a varint has a sixth byte", c.what)
	return 0
}

// count: a varint of how many items follow, each at least min bytes (section 2.1).
func (c *cur) count(min int) int {
	v := c.varint()
	if uint64(v)*uint64(min) > uint64(c.left()) {
		refuse("%s: a count of %d is larger than the bytes left in the section", c.what, v)
	}
	return int(v)
}

func (c *cur) mark(defined uint32, name string) uint32 {
	v := c.varint()
	if v&^defined != 0 {
		refuse("%s: %s has a bit the layout does not define (%d)", c.what, name, v)
	}
	return v
}

func (c *cur) take(n uint32) []byte {
	if uint64(n) > uint64(c.left()) {
		refuse("%s: %d bytes are named but only %d are left in the section", c.what, n, c.left())
	}
	b := c.b[c.p : c.p+int(n)]
	c.p += int(n)
	return b
}

// text: a varint byte length, then that many bytes of strict UTF-8 (section 2.2).
func (c *cur) text() string {
	b := c.take(c.varint())
	if !utf8.Valid(b) {
		refuse("%s: a string is not well-formed UTF-8", c.what)
	}
	return string(b)
}

func (c *cur) end() {
	if c.left() != 0 {
		refuse("%s: %d bytes follow the last item of the section", c.what, c.left())
	}
}

// ---------- paths and links (section 2.4) ----------

func isASCIILetter(b byte) bool { return (b >= 'A' && b <= 'Z') || (b >= 'a' && b <= 'z') }

func absoluteProblem(s string) string {
	if len(s) > 0 && (s[0] == '/' || s[0] == '\\') {
		return "begins with / or \\"
	}
	if len(s) >= 2 && isASCIILetter(s[0]) && s[1] == ':' {
		return "begins with a drive letter and :"
	}
	if len(s) >= 5 {
		pre := []byte(s[:5])
		for i, b := range pre {
			if b >= 'A' && b <= 'Z' {
				pre[i] = b + 32
			}
		}
		if string(pre) == "file:" {
			return "begins with file:"
		}
	}
	return ""
}

func pathProblem(s string) string {
	if s == "" {
		return "is empty"
	}
	if p := absoluteProblem(s); p != "" {
		return p
	}
	if strings.IndexByte(s, 0) >= 0 {
		return "holds U+0000"
	}
	start := 0
	for i := 0; i <= len(s); i++ {
		if i == len(s) || s[i] == '/' {
			seg := s[start:i]
			if seg == "" || seg == "." || seg == ".." {
				return "has an empty, . or .. segment"
			}
			start = i + 1
		}
	}
	return ""
}

func folderProblem(s string) string {
	if s == "" {
		return ""
	}
	return pathProblem(s)
}

// ---------- inflation (sections 3.2, 3.5) ----------

func inflate(f *frame, what string) []byte {
	br := bytes.NewReader(f.stored)
	zr := flate.NewReader(br)
	buf := make([]byte, f.raw)
	if _, err := io.ReadFull(zr, buf); err != nil {
		if errors.Is(err, io.EOF) || errors.Is(err, io.ErrUnexpectedEOF) {
			refuse("%s: the stored bytes inflate to fewer than rawLength (%d) bytes, or are cut short", what, f.raw)
		}
		refuse("%s: the stored bytes are not a valid raw deflate stream (%v)", what, err)
	}
	var one [1]byte
	n, err := zr.Read(one[:])
	if n > 0 {
		refuse("%s: the stored bytes inflate to more than rawLength (%d) bytes", what, f.raw)
	}
	if err != io.EOF {
		if errors.Is(err, io.ErrUnexpectedEOF) {
			refuse("%s: the deflate stream is cut short", what)
		}
		refuse("%s: the stored bytes are not a valid raw deflate stream (%v)", what, err)
	}
	if br.Len() != 0 {
		refuse("%s: %d stored bytes follow the end of the deflate stream", what, br.Len())
	}
	if sha256.Sum256(buf) != f.hash {
		refuse("%s: the section's SHA-256 is not the frame's hash", what)
	}
	return buf
}

// ---------- reading (section 6) ----------

func readScan(data []byte) *scan {
	s := &scan{}
	// 1. The signature.
	if len(data) < len(signature) || !bytes.Equal(data[:len(signature)], signature) {
		refuse("the file does not begin with the signature 89 46 50 4B 0D 0A 1A 0A")
	}
	// 2. Hop the frame headers.
	p := len(signature)
	var total uint64
	limit := 64*uint64(len(data)) + mebibyte
	for {
		n := len(s.frames)
		if len(data)-p < headerLen {
			if len(data) == p {
				refuse("unfinished: the file stops before an end frame")
			}
			refuse("unfinished: frame %d's header is cut short", n)
		}
		h := data[p : p+headerLen]
		f := frame{
			kind:  h[0],
			count: binary.LittleEndian.Uint32(h[1:5]),
			raw:   binary.LittleEndian.Uint32(h[5:9]),
		}
		storedLen := binary.LittleEndian.Uint32(h[9:13])
		copy(f.hash[:], h[13:45])
		if f.kind < kindHead || f.kind > kindEnd {
			refuse("frame %d has kind %d, which is not a kind of frame", n, f.kind)
		}
		if f.raw > maxSection {
			refuse("limit: frame %d's rawLength %d is above MAX_SECTION (67108864)", n, f.raw)
		}
		if uint64(f.raw) > 1032*uint64(storedLen)+1024 {
			refuse("limit: frame %d's rawLength %d is above 1032 x storedLength + 1024", n, f.raw)
		}
		total += uint64(f.raw)
		if total > limit {
			refuse("limit: the sections together would inflate to more than 64 x the file's length + 1048576 bytes")
		}
		if uint64(storedLen) > uint64(len(data)-p-headerLen) {
			refuse("unfinished: frame %d's storedLength runs past the end of the file", n)
		}
		f.stored = data[p+headerLen : p+headerLen+int(storedLen)]
		s.frames = append(s.frames, f)
		p += headerLen + int(storedLen)
		if f.kind == kindEnd {
			break
		}
	}
	if p != len(data) {
		refuse("%d bytes follow the end frame", len(data)-p)
	}
	// 3. The order of frames.
	fr := s.frames
	if fr[0].kind != kindHead {
		refuse("the first frame is a %s frame, not the head", kindNames[fr[0].kind])
	}
	if fr[0].count != 0 {
		refuse("the head's count is %d, not 0", fr[0].count)
	}
	i := 1
	files := 0
	short := false
	var stringsRaw uint64
	for i < len(fr) && (fr[i].kind == kindStrings || fr[i].kind == kindRecords) {
		if fr[i].kind == kindStrings {
			if fr[i].count == 0 {
				refuse("frame %d: a strings frame holds no strings", i)
			}
			if fr[i+1].kind != kindRecords {
				refuse("frame %d: a strings frame is not immediately before a records frame", i)
			}
			if fr[i].count > fr[i].raw {
				refuse("frame %d: a strings count of %d is larger than the section's rawLength", i, fr[i].count)
			}
			stringsRaw += uint64(fr[i].raw)
			i++
			continue
		}
		if short {
			refuse("frame %d: a records frame follows one of fewer than 256 files", i)
		}
		c := fr[i].count
		if c == 0 || c > 256 {
			refuse("frame %d: a records frame holds %d files, not 1 to 256", i, c)
		}
		if c > fr[i].raw {
			refuse("frame %d: a records count of %d is larger than the section's rawLength", i, c)
		}
		if c < 256 {
			short = true
		}
		files += int(c)
		i++
	}
	if fr[i].kind != kindPaths {
		refuse("frame %d is the %s frame, where the paths frame must be", i, kindNames[fr[i].kind])
	}
	if fr[i+1].kind != kindWires {
		refuse("frame %d is the %s frame, where the wires frame must be", i+1, kindNames[fr[i+1].kind])
	}
	if i+2 != len(fr)-1 {
		refuse("frame %d is the %s frame, where the end frame must be", i+2, kindNames[fr[i+2].kind])
	}
	pathsF, wiresF, endF := &fr[i], &fr[i+1], &fr[i+2]
	if int64(pathsF.count) != int64(files) {
		refuse("the paths frame's count is %d, but the records hold %d files", pathsF.count, files)
	}
	if int64(wiresF.count) != int64(files) {
		refuse("the wires frame's count is %d, but the records hold %d files", wiresF.count, files)
	}
	if int64(endF.count) != int64(len(fr)-1) {
		refuse("the end frame's count is %d, but %d frames come before it", endF.count, len(fr)-1)
	}
	if endF.raw != 32 {
		refuse("the end frame's rawLength is %d, not 32", endF.raw)
	}
	if uint64(pathsF.count)*2 > uint64(pathsF.raw) {
		refuse("the paths count of %d is larger than its section can hold", pathsF.count)
	}
	if wiresF.count > wiresF.raw {
		refuse("the wires count of %d is larger than its section can hold", wiresF.count)
	}
	s.nfiles = files
	// 4. The end: the content's name, from the headers alone, then the end section.
	hh := sha256.New()
	for k := 0; k < len(fr)-1; k++ {
		hh.Write(fr[k].hash[:])
	}
	copy(s.name[:], hh.Sum(nil))
	if sha256.Sum256(s.name[:]) != endF.hash {
		refuse("the end frame's hash is not the hash of the content's name computed from the headers")
	}
	if !bytes.Equal(inflate(endF, "end"), s.name[:]) {
		refuse("the end section is not the content's name")
	}
	// 5. The head, the paths and the wires.
	s.readHead(inflate(&fr[0], "head"))
	s.readPaths(inflate(pathsF, "paths"), stringsRaw)
	s.readWires(inflate(wiresF, "wires"))
	// 6. The whole read: every strings and records section in order.
	r := &rec{s: s, validate: true, seen: make([]int32, files)}
	idx := 0
	for k := 1; k < i; k++ {
		f := &fr[k]
		if f.kind == kindStrings {
			c := &cur{b: inflate(f, "frame "+strconv.Itoa(k)+" (strings)"), what: "frame " + strconv.Itoa(k) + " (strings)"}
			for n := uint32(0); n < f.count; n++ {
				s.table = append(s.table, c.text())
				s.info = append(s.info, stringInfo{file: -2})
			}
			c.end()
			continue
		}
		raw := inflate(f, "frame "+strconv.Itoa(k)+" (records)")
		r.c = cur{b: raw, what: "frame " + strconv.Itoa(k) + " (records)"}
		for n := uint32(0); n < f.count; n++ {
			r.record(idx)
			idx++
		}
		r.c.end()
		if s.met != len(s.table) {
			refuse("frame %d: string %d was set down before this records section but is never met in it", k, s.met)
		}
		s.records = append(s.records, recordSection{raw: raw, count: int(f.count)})
	}
	// No string appears twice.
	order := make([]int32, len(s.table))
	for k := range order {
		order[k] = int32(k)
	}
	slices.SortFunc(order, func(a, b int32) int { return strings.Compare(s.table[a], s.table[b]) })
	for k := 1; k < len(order); k++ {
		if s.table[order[k]] == s.table[order[k-1]] {
			a, b := min(order[k], order[k-1]), max(order[k], order[k-1])
			refuse("strings %d and %d are the same string", a, b)
		}
	}
	return s
}

func (s *scan) readHead(raw []byte) {
	c := &cur{b: raw, what: "head"}
	if v := c.u8(); v != 1 {
		refuse("head: the layout's version is %d; this reader reads version 1", v)
	}
	h := &s.head
	h.root = c.text()
	h.baseLayer = c.text()
	h.extension = c.text()
	h.scanner = c.text()
	if p := folderProblem(h.root); p != "" {
		refuse("head: root is not a folder: it %s", p)
	}
	if p := folderProblem(h.baseLayer); p != "" {
		refuse("head: baseLayer is not a folder: it %s", p)
	}
	if strings.IndexByte(h.extension, '/') >= 0 {
		refuse("head: the extension holds /")
	}
	n := c.count(3)
	h.leftOut = make([]leftOut, 0, n)
	for k := 0; k < n; k++ {
		var l leftOut
		l.reason = c.text()
		l.number = c.varint()
		l.detail = c.text()
		h.leftOut = append(h.leftOut, l)
	}
	c.end()
}

func (s *scan) readPaths(raw []byte, stringsRaw uint64) {
	c := &cur{b: raw, what: "paths"}
	s.paths = nil // grown as paths are read, not sized from a count
	var total uint64
	prev := ""
	for k := 0; k < s.nfiles; k++ {
		shared := c.varint()
		rest := c.take(c.varint())
		if uint64(shared) > uint64(len(prev)) {
			refuse("paths: path %d shares %d bytes with a path of %d", k, shared, len(prev))
		}
		if len(rest) > 0 && int(shared) < len(prev) && rest[0] == prev[shared] {
			refuse("paths: path %d does not share the longest beginning with the path before it", k)
		}
		total += uint64(shared) + uint64(len(rest))
		if total > stringsRaw {
			refuse("paths: the paths together are longer than the strings sections")
		}
		p := prev[:shared] + string(rest)
		if !utf8.ValidString(p) {
			refuse("paths: path %d is not well-formed UTF-8", k)
		}
		if pr := pathProblem(p); pr != "" {
			refuse("paths: path %d is not a path: it %s", k, pr)
		}
		if k > 0 && !(prev < p) {
			refuse("paths: path %d is not after the path before it in path order", k)
		}
		s.paths = append(s.paths, p)
		prev = p
	}
	c.end()
}

func (s *scan) readWires(raw []byte) {
	c := &cur{b: raw, what: "wires"}
	s.wireAt = make([]uint32, 0, 1)
	s.wireAt = append(s.wireAt, 0)
	for k := 0; k < s.nfiles; k++ {
		n := c.count(1)
		var v uint64
		for j := 0; j < n; j++ {
			x := uint64(c.varint())
			if j == 0 {
				v = x
			} else {
				v += x + 1
			}
			if v >= uint64(s.nfiles) {
				refuse("wires: file %d has a wire to file %d, but there are %d files", k, v, s.nfiles)
			}
			if v == uint64(k) {
				refuse("wires: file %d has a wire to itself", k)
			}
			s.wires = append(s.wires, uint32(v))
		}
		s.wireAt = append(s.wireAt, uint32(len(s.wires)))
	}
	c.end()
}

// ---------- records (section 4.3), checked (validate) or written as text (w) ----------

type rec struct {
	c        cur
	s        *scan
	validate bool
	w        *bufio.Writer // nil: write nothing
	self     int
	path     string
	seen     []int32 // seen[j] == self+1 when this record's links name file j
	targets  []uint32
}

func (r *rec) o(s string) {
	if r.w != nil {
		r.w.WriteString(s)
	}
}

func (r *rec) q(s string) {
	if r.w != nil {
		writeJSONString(r.w, s)
	}
}

func (r *rec) num(v uint32) {
	if r.w != nil {
		r.w.WriteString(strconv.FormatUint(uint64(v), 10))
	}
}

func (r *rec) line(kind string) {
	if r.w != nil {
		r.w.WriteByte('[')
		writeJSONString(r.w, r.path)
		r.w.WriteString(`,"` + kind + `",`)
	}
}

// sid: in validation, every sid is a number met already or exactly the next (section 4.2).
func (r *rec) sidNum() uint32 {
	v := r.c.varint()
	s := r.s
	if r.validate {
		if uint64(v) > uint64(s.met) {
			refuse("%s: record %d names string %d before string %d was met", r.c.what, r.self, v, s.met)
		}
		if int(v) == s.met {
			if s.met >= len(s.table) {
				refuse("%s: record %d names string %d, which no strings section before it sets down", r.c.what, r.self, v)
			}
			s.met++
		}
	} else if uint64(v) >= uint64(len(s.table)) {
		refuse("%s: string %d is not in the table", r.c.what, v)
	}
	return v
}

func (r *rec) sid() string { return r.s.table[r.sidNum()] }

func (r *rec) link(what string) string {
	s := r.sid()
	if r.validate {
		if p := absoluteProblem(s); p != "" {
			refuse("%s: record %d: the %s names an absolute place: it %s", r.c.what, r.self, what, p)
		}
	}
	return s
}

func (r *rec) target() string {
	id := r.sidNum()
	t := r.s.table[id]
	if !r.validate {
		return t
	}
	in := &r.s.info[id]
	if in.pathState == 0 {
		in.pathState = 1
		if pathProblem(t) != "" {
			in.pathState = 2
		}
	}
	if in.pathState == 2 {
		refuse("%s: record %d: a link's target is not a path: it %s", r.c.what, r.self, pathProblem(t))
	}
	if in.file == -2 {
		j, found := slices.BinarySearch(r.s.paths, t)
		in.file = -1
		if found {
			in.file = int32(j)
		}
	}
	if j := in.file; j >= 0 && int(j) != r.self && r.seen[j] != int32(r.self+1) {
		r.seen[j] = int32(r.self + 1)
		r.targets = append(r.targets, uint32(j))
	}
	return t
}

func (r *rec) sidList() {
	n := r.c.count(1)
	r.o("[")
	for k := 0; k < n; k++ {
		if k > 0 {
			r.o(",")
		}
		r.q(r.sid())
	}
	r.o("]")
}

func (r *rec) record(idx int) {
	r.self = idx
	r.targets = r.targets[:0]
	r.path = r.sid()
	if r.validate {
		if r.path != r.s.paths[idx] {
			refuse("%s: record %d's path is not the paths section's path %d", r.c.what, idx, idx)
		}
		if p := pathProblem(r.path); p != "" {
			refuse("%s: record %d's path %s", r.c.what, idx, p)
		}
	}
	layer := r.c.varint()
	fm := r.c.mark(0xF, "fileMark")
	var archetype, generatedAt string
	if fm&1 != 0 {
		archetype = r.sid()
	}
	entriesAt := r.c.p
	w := r.w
	r.w = nil
	r.entries()
	if fm&2 != 0 {
		generatedAt = r.sid()
	}
	authored := r.sid()
	r.w = w
	if w != nil {
		r.line("file")
		r.num(layer)
		r.o(",")
		if fm&1 != 0 {
			r.q(archetype)
		} else {
			r.o("null")
		}
		r.o(",")
		if fm&2 != 0 {
			r.q(generatedAt)
		} else {
			r.o("null")
		}
		r.o("]\n")
		r.line("authored")
		r.q(authored)
		r.o("]\n")
		after := r.c.p
		r.c.p = entriesAt
		r.entries()
		r.c.p = after
	}
	r.symbols()
	r.dependencies()
	if fm&4 != 0 {
		r.line("cited-by")
		r.o("[")
		n := r.c.count(2)
		for k := 0; k < n; k++ {
			if k > 0 {
				r.o(",")
			}
			r.o(`{"label":`)
			r.q(r.sid())
			r.o(`,"link":`)
			r.q(r.link("cited-by link"))
			r.o("}")
		}
		r.o("]]\n")
	}
	if fm&8 != 0 {
		r.line("re-exports")
		r.o("[")
		n := r.c.count(3)
		for k := 0; k < n; k++ {
			if k > 0 {
				r.o(",")
			}
			r.o(`{"name":`)
			r.q(r.sid())
			rm := r.c.mark(3, "reMark")
			if rm&1 != 0 {
				r.o(`,"slug":`)
				r.q(r.sid())
			}
			if rm&2 != 0 {
				r.o(`,"from":{"label":`)
				r.q(r.sid())
				r.o(`,"link":`)
				r.q(r.link("re-export's fromLink"))
				r.o("}")
			}
			r.o(`,"flags":`)
			r.sidList()
			r.o("}")
		}
		r.o("]]\n")
	}
	if r.validate {
		slices.Sort(r.targets)
		stored := r.s.wires[r.s.wireAt[idx]:r.s.wireAt[idx+1]]
		if !slices.Equal(stored, r.targets) {
			refuse("%s: record %d's links name other files than the wires section says", r.c.what, idx)
		}
	}
}

func (r *rec) entries() {
	n := r.c.count(2)
	for k := 0; k < n; k++ {
		reason := r.c.varint()
		if reason >= uint32(len(reasonNames)) {
			refuse("%s: record %d: an entry's reason %d is not one the layout defines", r.c.what, r.self, reason)
		}
		em := r.c.mark(0xF, "entryMark")
		if em&2 != 0 && em&1 == 0 {
			refuse("%s: record %d: an entryMark has the symbol's link without its name", r.c.what, r.self)
		}
		r.line("entry")
		r.o(`{"reason":`)
		r.q(reasonNames[reason])
		if em&1 != 0 {
			r.o(`,"symbol":{"name":`)
			r.q(r.sid())
			if em&2 != 0 {
				r.o(`,"link":`)
				r.q(r.link("entry's symbol link"))
			}
			r.o("}")
		}
		if em&4 != 0 {
			r.o(`,"command":`)
			r.q(r.sid())
		}
		if em&8 != 0 {
			r.o(`,"declarer":{"label":`)
			r.q(r.sid())
			r.o(`,"link":`)
			r.q(r.link("entry's declarer link"))
			r.o("}")
		}
		r.o("}]\n")
	}
}

// linked: bit 0 the link; bit 1 the target, only with the link; bit 2 the anchor, only with the target.
func (r *rec) linked(m uint32) {
	if m&2 != 0 && m&1 == 0 {
		refuse("%s: record %d: a target without a link", r.c.what, r.self)
	}
	if m&4 != 0 && m&2 == 0 {
		refuse("%s: record %d: an anchor without a target", r.c.what, r.self)
	}
	if m&1 != 0 {
		r.o(`,"link":`)
		r.q(r.link("link"))
	}
	if m&2 != 0 {
		r.o(`,"target":`)
		r.q(r.target())
	}
	if m&4 != 0 {
		r.o(`,"anchor":`)
		r.q(r.sid())
	}
}

func (r *rec) types() {
	n := r.c.count(2)
	r.o("[")
	for k := 0; k < n; k++ {
		if k > 0 {
			r.o(",")
		}
		r.o(`{"name":`)
		r.q(r.sid())
		tm := r.c.mark(0x1F, "typeMark")
		r.linked(tm & 7)
		if tm&8 != 0 {
			r.o(`,"array":true`)
		}
		if tm&16 != 0 {
			r.o(`,"promise":true`)
		}
		r.o("}")
	}
	r.o("]")
}

func (r *rec) symbols() {
	n := r.c.count(6)
	for k := 0; k < n; k++ {
		r.line("symbol")
		r.o(`{"name":`)
		r.q(r.sid())
		sm := r.c.mark(3, "symbolMark")
		if sm&1 != 0 {
			r.o(`,"slug":`)
			r.q(r.sid())
		}
		r.o(`,"kind":`)
		r.q(r.sid())
		r.o(`,"flags":`)
		r.sidList()
		if sm&2 != 0 {
			r.o(`,"source":{"path":`)
			r.q(r.link("symbol's sourcePath"))
			r.o(`,"line":`)
			r.num(r.c.varint())
			r.o("}")
		}
		r.o(`,"references":[`)
		nr := r.c.count(2)
		for j := 0; j < nr; j++ {
			if j > 0 {
				r.o(",")
			}
			role := r.c.varint()
			if role >= uint32(len(roleNames)) {
				refuse("%s: record %d: a reference's role %d is not one the layout defines", r.c.what, r.self, role)
			}
			r.o(`{"role":`)
			r.q(roleNames[role])
			if role == 4 {
				r.o(`,"parameters":[`)
				np := r.c.count(2)
				for p := 0; p < np; p++ {
					if p > 0 {
						r.o(",")
					}
					r.o(`{"name":`)
					r.q(r.sid())
					r.o(`,"types":`)
					r.types()
					r.o("}")
				}
				r.o("]")
			} else {
				r.o(`,"types":`)
				r.types()
			}
			r.o("}")
		}
		r.o(`],"sections":[`)
		ns := r.c.count(2)
		for j := 0; j < ns; j++ {
			if j > 0 {
				r.o(",")
			}
			r.o(`{"title":`)
			r.q(r.sid())
			r.o(`,"body":`)
			r.sidList()
			r.o("}")
		}
		r.o("]}]\n")
	}
}

func (r *rec) dependencies() {
	n := r.c.count(3)
	for k := 0; k < n; k++ {
		r.line("dependency")
		r.o(`{"label":`)
		r.q(r.sid())
		dm := r.c.mark(0xF, "depMark")
		r.linked(dm & 7)
		if dm&8 != 0 {
			r.o(`,"symbols":`)
			r.sidList()
		}
		r.o(`,"qualifiers":`)
		r.sidList()
		r.o("}]\n")
	}
}

// ---------- the text form of a read scan (section 8) ----------

func (s *scan) emitText(w *bufio.Writer) {
	h := &s.head
	w.WriteString("[null,\"format\",\"fact-pack\",1]\n")
	w.WriteString(`[null,"location",`)
	writeJSONString(w, h.root)
	w.WriteByte(',')
	writeJSONString(w, h.baseLayer)
	w.WriteByte(',')
	writeJSONString(w, h.extension)
	w.WriteString("]\n")
	w.WriteString(`[null,"scanner",`)
	writeJSONString(w, h.scanner)
	w.WriteString("]\n")
	for _, l := range h.leftOut {
		w.WriteString(`[null,"left-out",`)
		writeJSONString(w, l.reason)
		w.WriteString("," + strconv.FormatUint(uint64(l.number), 10) + ",")
		writeJSONString(w, l.detail)
		w.WriteString("]\n")
	}
	r := &rec{s: s, w: w}
	idx := 0
	for _, sec := range s.records {
		r.c = cur{b: sec.raw, what: "records"}
		for k := 0; k < sec.count; k++ {
			r.record(idx)
			idx++
		}
	}
	w.WriteString("[null,\"end\"," + strconv.Itoa(s.nfiles) + "]\n")
}

// writeJSONString writes a well-formed UTF-8 string exactly as section 8.1 says.
func writeJSONString(w *bufio.Writer, s string) {
	const hexdigits = "0123456789abcdef"
	w.WriteByte('"')
	start := 0
	for i := 0; i < len(s); i++ {
		c := s[i]
		if c >= 0x20 && c != '"' && c != '\\' {
			continue
		}
		w.WriteString(s[start:i])
		switch c {
		case '"':
			w.WriteString(`\"`)
		case '\\':
			w.WriteString(`\\`)
		case 0x08:
			w.WriteString(`\b`)
		case 0x09:
			w.WriteString(`\t`)
		case 0x0A:
			w.WriteString(`\n`)
		case 0x0C:
			w.WriteString(`\f`)
		case 0x0D:
			w.WriteString(`\r`)
		default:
			w.WriteString(`\u00`)
			w.WriteByte(hexdigits[c>>4])
			w.WriteByte(hexdigits[c&15])
		}
		start = i + 1
	}
	w.WriteString(s[start:])
	w.WriteByte('"')
}
