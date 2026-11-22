package main

import (
	"bytes"
	"compress/flate"
	"crypto/sha256"
	"encoding/binary"
	"hash/maphash"
	"io"
	"slices"
	"unicode/utf8"
)

const (
	maxSection = 67108864 // 64 MiB, section 3.5
	headerLen  = 45       // section 3.2
)

var signature = []byte{0x89, 0x46, 0x50, 0x4B, 0x0D, 0x0A, 0x1A, 0x0A}

const (
	kHead    = 1
	kStrings = 2
	kRecords = 3
	kPaths   = 4
	kWires   = 5
	kEnd     = 6
)

var kindName = [...]string{"", "head", "strings", "records", "paths", "wires", "end"}

type frame struct {
	kind      byte
	count     uint32
	rawLen    uint32
	storedLen uint32
	hash      [32]byte
	stored    []byte
	raw       []byte // nil until inflated
	index     int    // place among the frames, from 0
}

type leftOut struct {
	reason []byte
	number uint32
	detail []byte
}

type scan struct {
	fileLen int
	frames  []*frame
	nFiles  int

	// head
	root, base, ext, scanner []byte
	headRaw                  []byte // the head, kept to write its left-out list
	leftAt, nLeft            int

	// paths section: path i is pathData[pathOff[i]:pathOff[i+1]]
	pathData []byte
	pathOff  []int

	// wires (outbound) and inbound, as offsets into value arrays
	wOff, wVal   []uint32
	inOff, inVal []uint32

	// string table: string k is strData[strOff[k]:strOff[k+1]]
	strData []byte
	strOff  []int
	dupTab  []uint64 // open addressing: hash's high bits, sid+1
	seed    maphash.Seed
	met     int     // strings met so far (section 4.2)
	sidFile []int32 // -2 unknown, -1 not a scanned file, else file index
	sidPath []uint8 // 0 unchecked, 1 a valid path

	recFrames []*frame

	// documented-by: for file t, docVal[docOff[t]:docOff[t+1]]
	docOff, docVal []uint32

	names uint64 // bytes of names the text would write (section 3.5)
}

// ---------- decoding primitives (section 2.1, 2.2) ----------

type dec struct {
	b    []byte
	p    int
	what string
}

func (d *dec) left() int { return len(d.b) - d.p }

func (d *dec) u8() byte {
	if d.p >= len(d.b) {
		fail("%s: cut short where a byte is due (section 3.2)", d.what)
	}
	c := d.b[d.p]
	d.p++
	return c
}

func (d *dec) varint() uint32 {
	var v uint64
	for i := 0; i < 5; i++ {
		if d.p >= len(d.b) {
			fail("%s: a varint is cut short (section 2.1)", d.what)
		}
		c := d.b[d.p]
		d.p++
		v |= uint64(c&0x7f) << (7 * uint(i))
		if c&0x80 == 0 {
			if i > 0 && c == 0 {
				fail("%s: a varint is not in its shortest form (section 2.1)", d.what)
			}
			if v > 0xFFFFFFFF {
				fail("%s: a varint is above 2^32 - 1 (section 2.1)", d.what)
			}
			return uint32(v)
		}
	}
	fail("%s: a varint runs to a sixth byte (section 2.1)", d.what)
	return 0
}

// count reads a count and refuses it when more items are promised than
// bytes are left, before anything is made for them (section 2.1).
func (d *dec) count(item string, minBytes int) int {
	v := d.varint()
	if uint64(v)*uint64(minBytes) > uint64(d.left()) {
		fail("%s: a count of %d %s is more than the %d bytes left can hold (section 2.1)", d.what, v, item, d.left())
	}
	return int(v)
}

func (d *dec) take(n int) []byte {
	if n < 0 || n > d.left() {
		fail("%s: %d bytes are due but only %d are left (section 3.2)", d.what, n, d.left())
	}
	b := d.b[d.p : d.p+n]
	d.p += n
	return b
}

// text reads a length-prefixed string and decodes it strictly (section 2.2).
func (d *dec) text(what string) []byte {
	n := d.varint()
	if uint64(n) > uint64(d.left()) {
		fail("%s: %s is %d bytes long but only %d bytes are left (section 3.2)", d.what, what, n, d.left())
	}
	b := d.take(int(n))
	if !utf8.Valid(b) {
		fail("%s: %s is not well-formed UTF-8 (section 2.2)", d.what, what)
	}
	return b
}

func (d *dec) end() {
	if d.p != len(d.b) {
		fail("%s: %d bytes follow its last item (section 3.2: a section is exactly its grammar)", d.what, len(d.b)-d.p)
	}
}

// ---------- paths, links, folders (section 2.4) ----------

func isLetter(c byte) bool { return (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') }

func beginsAbsolute(p []byte) string {
	if len(p) > 0 && (p[0] == '/' || p[0] == '\\') {
		return "begins with / or \\"
	}
	if len(p) >= 2 && isLetter(p[0]) && p[1] == ':' {
		return "begins with a letter and ':' (a drive)"
	}
	if len(p) >= 5 && bytes.EqualFold(p[:5], []byte("file:")) {
		return "begins with 'file:'"
	}
	return ""
}

// pathReason says why p is not a path, or "" when it is one.
func pathReason(p []byte) string {
	if len(p) == 0 {
		return "is empty"
	}
	if r := beginsAbsolute(p); r != "" {
		return r
	}
	if bytes.IndexByte(p, 0) >= 0 {
		return "holds U+0000"
	}
	start := 0
	for i := 0; i <= len(p); i++ {
		if i == len(p) || p[i] == '/' {
			seg := p[start:i]
			if len(seg) == 0 {
				return "has an empty segment"
			}
			if len(seg) == 1 && seg[0] == '.' {
				return "has a '.' segment"
			}
			if len(seg) == 2 && seg[0] == '.' && seg[1] == '.' {
				return "has a '..' segment"
			}
			start = i + 1
		}
	}
	return ""
}

func linkReason(l []byte) string { return beginsAbsolute(l) }

func folderReason(f []byte) string {
	if len(f) == 0 {
		return ""
	}
	return pathReason(f)
}

// ---------- steps 1 to 3: signature, headers, order (section 6) ----------

func hop(data []byte) *scan {
	if len(data) < len(signature) || !bytes.Equal(data[:len(signature)], signature) {
		fail("the file does not begin with the signature 89 46 50 4B 0D 0A 1A 0A (section 3.1)")
	}
	s := &scan{fileLen: len(data)}
	bound := 64*uint64(len(data)) + 1048576
	var total uint64
	pos := len(signature)
	for {
		n := len(s.frames)
		if pos == len(data) {
			fail("unfinished: the file stops after %d frames, before an end frame (section 3.3)", n)
		}
		if len(data)-pos < headerLen {
			fail("unfinished: frame %d's 45-byte header is cut short (%d bytes left) (section 3.3)", n, len(data)-pos)
		}
		h := data[pos : pos+headerLen]
		f := &frame{
			kind:      h[0],
			count:     binary.LittleEndian.Uint32(h[1:5]),
			rawLen:    binary.LittleEndian.Uint32(h[5:9]),
			storedLen: binary.LittleEndian.Uint32(h[9:13]),
			index:     n,
		}
		copy(f.hash[:], h[13:45])
		if f.kind < kHead || f.kind > kEnd {
			fail("frame %d: kind %d is not a kind of frame (section 3.2)", n, f.kind)
		}
		if f.rawLen > maxSection {
			fail("frame %d (%s): rawLength %d is past MAX_SECTION, 67108864 (section 3.5)", n, kindName[f.kind], f.rawLen)
		}
		if uint64(f.rawLen) > 1032*uint64(f.storedLen)+1024 {
			fail("frame %d (%s): rawLength %d is more than 1032 x storedLength %d + 1024, the most raw deflate can give (section 3.5)", n, kindName[f.kind], f.rawLen, f.storedLen)
		}
		total += uint64(f.rawLen)
		if total > bound {
			fail("frame %d (%s): the sections together would inflate to %d bytes, past 64 x %d + 1048576 = %d (section 3.5)", n, kindName[f.kind], total, len(data), bound)
		}
		if uint64(f.storedLen) > uint64(len(data)-pos-headerLen) {
			fail("unfinished: frame %d (%s)'s storedLength %d runs past the file's end (section 3.5)", n, kindName[f.kind], f.storedLen)
		}
		f.stored = data[pos+headerLen : pos+headerLen+int(f.storedLen)]
		pos += headerLen + int(f.storedLen)
		s.frames = append(s.frames, f)
		if f.kind == kEnd {
			break
		}
	}
	if pos != len(data) {
		fail("%d bytes follow the end frame (section 3.3)", len(data)-pos)
	}
	s.checkOrder()
	return s
}

// checkOrder checks head (strings? records)* paths wires end (section 3.3),
// with each frame's count and the minimum sizes of section 2.1.
func (s *scan) checkOrder() {
	fr := s.frames
	if fr[0].kind != kHead {
		fail("frame 0 is a %s frame; the head must come first (section 3.3)", kindName[fr[0].kind])
	}
	if fr[0].count != 0 {
		fail("the head frame's count is %d; it must be 0 (section 3.2)", fr[0].count)
	}
	i := 1
	files := 0
	short := false
	for i < len(fr) && (fr[i].kind == kStrings || fr[i].kind == kRecords) {
		f := fr[i]
		if f.kind == kStrings {
			if f.count == 0 {
				fail("frame %d: a strings frame holds no strings (section 3.3)", i)
			}
			if f.count > f.rawLen {
				fail("frame %d: a strings count of %d exceeds its raw length %d (section 2.1)", i, f.count, f.rawLen)
			}
			if i+1 >= len(fr) || fr[i+1].kind != kRecords {
				fail("frame %d: a strings frame is not immediately before a records frame (section 3.3)", i)
			}
			i++
			continue
		}
		if short {
			fail("frame %d: a records frame follows one of fewer than 256 files; only the last may hold fewer (section 3.3)", i)
		}
		if f.count == 0 || f.count > 256 {
			fail("frame %d: a records frame holds %d files; it must hold 1 to 256 (section 3.3)", i, f.count)
		}
		if f.count > f.rawLen {
			fail("frame %d: a records count of %d exceeds its raw length %d (section 2.1)", i, f.count, f.rawLen)
		}
		if f.count < 256 {
			short = true
		}
		files += int(f.count)
		s.recFrames = append(s.recFrames, f)
		i++
	}
	want := []byte{kPaths, kWires, kEnd}
	for j, k := range want {
		if i+j >= len(fr) {
			fail("unfinished: no %s frame (section 3.3)", kindName[k])
		}
		if fr[i+j].kind != k {
			fail("frame %d (%s) stands where the %s frame is due (section 3.3)", i+j, kindName[fr[i+j].kind], kindName[k])
		}
	}
	if i+2 != len(fr)-1 {
		fail("frames follow the end frame (section 3.3)") // cannot happen: hopping stops at the end
	}
	paths, wires, end := fr[i], fr[i+1], fr[i+2]
	if int(paths.count) != files {
		fail("the paths frame's count is %d but the records hold %d files (section 3.3)", paths.count, files)
	}
	if int(wires.count) != files {
		fail("the wires frame's count is %d but the records hold %d files (section 3.3)", wires.count, files)
	}
	if uint64(paths.count)*2 > uint64(paths.rawLen) {
		fail("the paths frame's count %d needs more than its raw length %d (section 2.1)", paths.count, paths.rawLen)
	}
	if wires.count > wires.rawLen {
		fail("the wires frame's count %d exceeds its raw length %d (section 2.1)", wires.count, wires.rawLen)
	}
	if int(end.count) != len(fr)-1 {
		fail("the end frame's count is %d but %d frames come before it (section 3.3)", end.count, len(fr)-1)
	}
	if end.rawLen != 32 {
		fail("the end frame's rawLength is %d; it must be 32 (section 3.3)", end.rawLen)
	}
	s.nFiles = files
}

// ---------- inflation (section 3.2, 3.5) ----------

func (s *scan) raw(f *frame) []byte {
	if f.raw != nil {
		return f.raw
	}
	what := "frame " + itoa(f.index) + " (" + kindName[f.kind] + ")"
	br := bytes.NewReader(f.stored)
	r := flate.NewReader(br)
	buf := make([]byte, f.rawLen)
	if _, err := io.ReadFull(r, buf); err != nil {
		if err == io.ErrUnexpectedEOF || err == io.EOF {
			fail("%s: the stored bytes do not inflate to rawLength %d bytes (section 3.2): %v", what, f.rawLen, err)
		}
		fail("%s: the stored bytes are not a raw deflate stream this reader accepts (section 3.2): %v", what, err)
	}
	var one [1]byte
	for {
		n, err := r.Read(one[:])
		if n > 0 {
			fail("%s: the stored bytes inflate to more than rawLength %d bytes (section 3.5)", what, f.rawLen)
		}
		if err == io.EOF {
			break
		}
		if err != nil {
			fail("%s: the deflate stream does not end properly after rawLength %d bytes (section 3.2): %v", what, f.rawLen, err)
		}
	}
	if br.Len() != 0 {
		fail("%s: %d whole bytes follow the end of the deflate stream (section 3.2)", what, br.Len())
	}
	if sha256.Sum256(buf) != f.hash {
		fail("%s: the SHA-256 of the inflated section is not the header's hash (section 3.2)", what)
	}
	f.raw = buf
	return buf
}

func itoa(n int) string {
	return string(appendUint(nil, uint64(n)))
}

func appendUint(b []byte, v uint64) []byte {
	var t [20]byte
	i := len(t)
	for {
		i--
		t[i] = byte('0' + v%10)
		v /= 10
		if v == 0 {
			break
		}
	}
	return append(b, t[i:]...)
}

// contentName is the SHA-256 of the hashes of every frame before the end
// (section 3.4).
// frames includes the end (or a placeholder for it) as its last element.
func contentName(frames []*frame) [32]byte {
	h := sha256.New()
	for _, f := range frames[:len(frames)-1] {
		h.Write(f.hash[:])
	}
	var n [32]byte
	copy(n[:], h.Sum(nil))
	return n
}

// step 4: the end (section 3.4)
func (s *scan) checkEnd() {
	end := s.frames[len(s.frames)-1]
	name := contentName(s.frames)
	if sha256.Sum256(name[:]) != end.hash {
		fail("the end frame's hash is not the SHA-256 of the content's name computed from the headers (section 3.4)")
	}
	raw := s.raw(end)
	if !bytes.Equal(raw, name[:]) {
		fail("the end section is not the content's name computed from the headers' hashes (section 3.4)")
	}
}

func readBinary(data []byte) *scan {
	s := hop(data) // steps 1-3
	s.checkEnd()   // step 4
	s.analyze()    // steps 5-6
	return s
}

// analyze is steps 5 and 6: head, paths, wires, then every strings and
// records section in order with every check.
func (s *scan) analyze() {
	fr := s.frames
	// Size the string table from the headers, which were checked against
	// the limits of section 3.5 and each count against its raw length.
	var nStr, strBytes int
	for _, f := range fr {
		if f.kind == kStrings {
			nStr += int(f.count)
			strBytes += int(f.rawLen)
		}
	}
	s.strOff = make([]int, 1, nStr+1)
	s.strData = make([]byte, 0, strBytes)
	s.sidFile = make([]int32, 0, nStr)
	s.sidPath = make([]uint8, 0, nStr)
	s.seed = maphash.MakeSeed()
	s.growDup(2 * nStr)
	s.readHead(s.raw(fr[0]))
	pathsF, wiresF := fr[len(fr)-3], fr[len(fr)-2]
	var budget uint64
	for _, f := range fr {
		if f.kind == kStrings {
			budget += uint64(f.rawLen)
		}
	}
	s.readPaths(s.raw(pathsF), budget)
	pathsF.raw = nil
	s.readWires(s.raw(wiresF))
	wiresF.raw = nil
	s.readAll()
}

// ---------- the head (section 4.1) ----------

func (s *scan) readHead(raw []byte) {
	d := &dec{b: raw, what: "the head"}
	if v := d.u8(); v != 1 {
		fail("the head's version is %d; this reader reads version 1 (section 4.1)", v)
	}
	s.root = d.text("root")
	s.base = d.text("baseLayer")
	s.ext = d.text("extension")
	s.scanner = d.text("scanner")
	if r := folderReason(s.root); r != "" {
		fail("the head's root is not a folder: it %s (section 2.4)", r)
	}
	if r := folderReason(s.base); r != "" {
		fail("the head's baseLayer is not a folder: it %s (section 2.4)", r)
	}
	if bytes.ContainsAny(s.ext, "/\\") || bytes.IndexByte(s.ext, 0) >= 0 {
		fail("the head's extension holds '/', '\\' or U+0000 (section 4.1)")
	}
	n := d.count("left-out entries", 3)
	s.leftAt, s.nLeft, s.headRaw = d.p, n, raw
	for i := 0; i < n; i++ {
		s.nextLeftOut(d)
	}
	d.end()
}

func (s *scan) nextLeftOut(d *dec) (lo leftOut) {
	lo.reason = d.text("a left-out reason")
	lo.number = d.varint()
	lo.detail = d.text("a left-out detail")
	return
}

// ---------- the paths (section 4.4) ----------

func (s *scan) path(i int) []byte { return s.pathData[s.pathOff[i]:s.pathOff[i+1]] }

func (s *scan) readPaths(raw []byte, budget uint64) {
	d := &dec{b: raw, what: "the paths section"}
	n := s.nFiles
	s.pathOff = make([]int, 1, n+1)
	var total uint64
	prevStart, prevLen := 0, 0
	for i := 0; i < n; i++ {
		shared := d.varint()
		restLen := d.varint()
		if int64(shared) > int64(prevLen) {
			fail("the paths section: path %d shares %d bytes but the path before it is %d bytes long (section 4.4)", i, shared, prevLen)
		}
		if uint64(restLen) > uint64(d.left()) {
			fail("the paths section: path %d's rest is %d bytes but only %d are left (section 3.2)", i, restLen, d.left())
		}
		total += uint64(shared) + uint64(restLen)
		if total > budget {
			fail("the paths section: the paths' bytes together exceed %d, the strings frames' raw lengths together (section 4.4)", budget)
		}
		rest := d.take(int(restLen))
		if len(rest) > 0 && int(shared) < prevLen && rest[0] == s.pathData[prevStart+int(shared)] {
			fail("the paths section: path %d does not share the longest beginning with the path before it (section 4.4)", i)
		}
		start := len(s.pathData)
		s.pathData = append(s.pathData, s.pathData[prevStart:prevStart+int(shared)]...)
		s.pathData = append(s.pathData, rest...)
		s.pathOff = append(s.pathOff, len(s.pathData))
		p := s.pathData[start:]
		if !utf8.Valid(p) {
			fail("the paths section: path %d is not well-formed UTF-8 (section 2.2)", i)
		}
		if r := pathReason(p); r != "" {
			fail("the paths section: path %d %q is not a path: it %s (section 2.4)", i, p, r)
		}
		if i > 0 && bytes.Compare(s.pathData[prevStart:start], p) >= 0 {
			fail("the paths section: path %d %q is not after the path before it in strict path order (section 2.3, 4.4)", i, p)
		}
		prevStart, prevLen = start, len(p)
	}
	d.end()
}

// ---------- the wires (section 4.5) ----------

func (s *scan) readWires(raw []byte) {
	d := &dec{b: raw, what: "the wires section"}
	n := s.nFiles
	s.wOff = make([]uint32, 1, n+1)
	for i := 0; i < n; i++ {
		k := d.count("wires", 1)
		if k > 0 {
			v := uint64(d.varint())
			for j := 0; j < k; j++ {
				if j > 0 {
					v += uint64(d.varint()) + 1
				}
				if v >= uint64(n) {
					fail("the wires section: file %d has a wire to file %d, but the scan has %d files (section 4.5)", i, v, n)
				}
				if v == uint64(i) {
					fail("the wires section: file %d has a wire to itself (section 4.5)", i)
				}
				s.wVal = append(s.wVal, uint32(v))
			}
		}
		s.wOff = append(s.wOff, uint32(len(s.wVal)))
	}
	d.end()
	// inbound: the outbound wires turned around, in path order
	cnt := make([]uint32, n+1)
	for _, t := range s.wVal {
		cnt[t+1]++
	}
	for i := 1; i <= n; i++ {
		cnt[i] += cnt[i-1]
	}
	s.inOff = slices.Clone(cnt)
	s.inVal = make([]uint32, len(s.wVal))
	for i := 0; i < n; i++ {
		for _, t := range s.wVal[s.wOff[i]:s.wOff[i+1]] {
			s.inVal[cnt[t]] = uint32(i)
			cnt[t]++
		}
	}
}

// ---------- the string table (section 4.2) ----------

func (s *scan) numStr() int         { return len(s.strOff) - 1 }
func (s *scan) str(k uint32) []byte { return s.strData[s.strOff[k]:s.strOff[k+1]] }
func (s *scan) strLen(k uint32) int { return s.strOff[k+1] - s.strOff[k] }

func (s *scan) addString(b []byte, where string) {
	k := s.numStr()
	s.strData = append(s.strData, b...)
	s.strOff = append(s.strOff, len(s.strData))
	s.sidFile = append(s.sidFile, -2)
	s.sidPath = append(s.sidPath, 0)
	if 2*(k+1) > len(s.dupTab) { // sized from the headers, so this is rare
		s.growDup(2 * (k + 1))
	}
	s.insert(uint32(k), true, where)
}

// growDup makes the duplicate table hold at least n slots, a power of two.
func (s *scan) growDup(n int) {
	size := 16
	for size < n {
		size *= 2
	}
	old := s.dupTab
	s.dupTab = make([]uint64, size)
	mask := uint64(size - 1)
	for _, e := range old {
		if e != 0 {
			i := s.hashOf(uint32(e)-1) & mask
			for s.dupTab[i] != 0 {
				i = (i + 1) & mask
			}
			s.dupTab[i] = e
		}
	}
}

func (s *scan) hashOf(k uint32) uint64 { return maphash.Bytes(s.seed, s.str(k)) }

// insert puts string k in the table, refusing it when an equal string is
// there already. A slot holds the hash's high 32 bits and k+1, so that most
// probes need not read the strings they pass.
func (s *scan) insert(k uint32, check bool, where string) {
	b := s.str(k)
	h := maphash.Bytes(s.seed, b)
	mask := uint64(len(s.dupTab) - 1)
	fp := h >> 32 << 32
	i := h & mask
	for e := s.dupTab[i]; e != 0; e = s.dupTab[i] {
		if check && e>>32<<32 == fp && bytes.Equal(s.str(uint32(e)-1), b) {
			fail("%s: string %d %q appears twice in the string table (section 4.2)", where, k, clip(b))
		}
		i = (i + 1) & mask
	}
	s.dupTab[i] = fp | uint64(k+1)
}

func clip(b []byte) string {
	if len(b) > 60 {
		return string(b[:60]) + "..."
	}
	return string(b)
}

func (s *scan) readStrings(f *frame) {
	raw := s.raw(f)
	what := "frame " + itoa(f.index) + " (strings)"
	d := &dec{b: raw, what: what}
	for j := 0; j < int(f.count); j++ {
		b := d.text("a string")
		s.addString(b, what)
	}
	d.end()
	f.raw = nil // the strings now live in the table
}

// fileOf gives the index of the scanned file whose path is string k, or -1.
func (s *scan) fileOf(k uint32) int32 {
	if v := s.sidFile[k]; v != -2 {
		return v
	}
	b := s.str(k)
	lo, hi := 0, s.nFiles
	for lo < hi {
		m := int(uint(lo+hi) >> 1)
		if bytes.Compare(s.path(m), b) < 0 {
			lo = m + 1
		} else {
			hi = m
		}
	}
	r := int32(-1)
	if lo < s.nFiles && bytes.Equal(s.path(lo), b) {
		r = int32(lo)
	}
	s.sidFile[k] = r
	return r
}

// readAll is step 6, the whole read.
func (s *scan) readAll() {
	w := &walker{s: s, validate: true}
	file := 0
	for _, f := range s.frames[1 : len(s.frames)-3] {
		if f.kind == kStrings {
			s.readStrings(f)
			continue
		}
		raw := s.raw(f)
		w.d = dec{b: raw, what: "frame " + itoa(f.index) + " (records)"}
		for j := 0; j < int(f.count); j++ {
			w.record(file)
			file++
		}
		w.d.end()
		if s.met != s.numStr() {
			fail("frame %d (records): string %d %q is set down but not met by the records up to here (section 4.2)", f.index, s.met, clip(s.str(uint32(s.met))))
		}
	}
	// documented-by, gathered from the documentation's targets (section 5)
	p := w.docPairs
	slices.Sort(p)
	p = slices.Compact(p)
	s.docOff = make([]uint32, s.nFiles+1)
	s.docVal = make([]uint32, len(p))
	for i, v := range p {
		s.docOff[v>>32+1]++
		s.docVal[i] = uint32(v)
	}
	for i := 1; i <= s.nFiles; i++ {
		s.docOff[i] += s.docOff[i-1]
	}
}
