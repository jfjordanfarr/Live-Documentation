package main

// Tests: the samples both ways, many files a reader must refuse (written to tests/refuse
// so that tests/run.sh can run them through run.sh too), texts name must refuse, a scan
// of more than 256 files both ways, and random mutations that must never crash or hang.

import (
	"bufio"
	"bytes"
	"compress/flate"
	"crypto/sha256"
	"encoding/binary"
	"fmt"
	"io"
	"math/rand"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

type sec struct {
	kind  byte
	count uint32
	raw   []byte
}

func mustRead(t *testing.T, name string) []byte {
	b, err := os.ReadFile(name)
	if err != nil {
		t.Fatal(err)
	}
	return b
}

// split takes a valid file apart into its uncompressed sections (end excluded).
func split(t *testing.T, file []byte) []sec {
	var out []sec
	p := 8
	for {
		k := file[p]
		st := binary.LittleEndian.Uint32(file[p+9:])
		raw, err := io.ReadAll(flate.NewReader(bytes.NewReader(file[p+45 : p+45+int(st)])))
		if err != nil {
			t.Fatal(err)
		}
		if k == kindEnd {
			return out
		}
		out = append(out, sec{k, binary.LittleEndian.Uint32(file[p+1:]), raw})
		p += 45 + int(st)
	}
}

// assemble frames the sections with true hashes and a true name, so that a change
// inside a section is caught by the check it is about and not by a hash.
func assemble(secs []sec) []byte {
	out := append([]byte{}, signature...)
	h := sha256.New()
	for _, s := range secs {
		hash := sha256.Sum256(s.raw)
		h.Write(hash[:])
		out = appendFrame(out, s.kind, s.count, s.raw, hash)
	}
	name := h.Sum(nil)
	return appendFrame(out, kindEnd, uint32(len(secs)), name, sha256.Sum256(name))
}

func clone(s []sec) []sec {
	out := make([]sec, len(s))
	for i, x := range s {
		out[i] = sec{x.kind, x.count, append([]byte{}, x.raw...)}
	}
	return out
}

func readOutcome(data []byte) (text string, refused string) {
	defer func() {
		if e := recover(); e != nil {
			if r, ok := e.(refusal); ok {
				refused = string(r)
				return
			}
			refused = fmt.Sprintf("INTERNAL %v", e)
		}
	}()
	s := readScan(data)
	var b bytes.Buffer
	w := bufio.NewWriter(&b)
	s.emitText(w)
	w.Flush()
	return b.String(), ""
}

func nameOutcome(text []byte) (name string, refused string) {
	defer func() {
		if e := recover(); e != nil {
			if r, ok := e.(refusal); ok {
				refused = string(r)
				return
			}
			refused = fmt.Sprintf("INTERNAL %v", e)
		}
	}()
	return nameOfText(text), ""
}

func TestSamples(t *testing.T) {
	for _, n := range []string{"made-empty", "made-every-fact", "corpus-estate"} {
		bin, txt := mustRead(t, n+".fpk"), mustRead(t, n+".txt")
		got, ref := readOutcome(bin)
		if ref != "" || got != string(txt) {
			t.Fatalf("%s: read refused %q or differs", n, ref)
		}
		name, ref := nameOutcome(txt)
		end := bin[len(bin)-32:] // not the name itself (compressed); compare with header-derived name
		_ = end
		s := readScan(bin)
		if ref != "" || name != fmt.Sprintf("%x", s.name) {
			t.Fatalf("%s: name %q refused %q", n, name, ref)
		}
		// Re-assembling the sections with Go's compressor gives the same name and text.
		again := assemble(split(t, bin))
		got2, ref2 := readOutcome(again)
		if ref2 != "" || got2 != string(txt) {
			t.Fatalf("%s: reassembled refused %q", n, ref2)
		}
	}
}

// --- builders of hostile files ---

type hostile struct {
	name string
	data []byte
	want string // a part of the refusal
}

func frameBytes(kind byte, count, raw, stored uint32, hash []byte, body []byte) []byte {
	var out []byte
	out = append(out, kind)
	out = binary.LittleEndian.AppendUint32(out, count)
	out = binary.LittleEndian.AppendUint32(out, raw)
	out = binary.LittleEndian.AppendUint32(out, stored)
	h := make([]byte, 32)
	copy(h, hash)
	out = append(out, h...)
	return append(out, body...)
}

func deflate(b []byte) []byte {
	var z bytes.Buffer
	w, _ := flate.NewWriter(&z, flate.BestCompression)
	w.Write(b)
	w.Close()
	return z.Bytes()
}

// facts-level: a text's facts, changed, written by the writer (which does not judge).
func fromText(t *testing.T, txt string, edit func(f *textFacts)) []byte {
	f := parseText([]byte(txt))
	edit(f)
	return buildFile(f)
}

func hostileFiles(t *testing.T) []hostile {
	every := mustRead(t, "made-every-fact.fpk")
	empty := mustRead(t, "made-empty.fpk")
	evTxt := string(mustRead(t, "made-every-fact.txt"))
	S := split(t, every) // head, strings, records, paths, wires
	var hs []hostile
	add := func(name string, data []byte, want string) { hs = append(hs, hostile{name, data, want}) }
	mut := func(name, want string, f func(s []sec) []sec) { add(name, assemble(f(clone(S))), want) }
	edit := func(name, want string, f func(x *textFacts)) { add(name, fromText(t, evTxt, f), want) }

	// --- the container: signature, headers, limits ---
	add("empty-file", nil, "signature")
	add("signature-only", append([]byte{}, signature...), "unfinished")
	bad := append([]byte{}, every...)
	bad[4] = 0x0A // CR LF turned into LF LF
	add("signature-crlf-changed", bad, "signature")
	bad = append([]byte{}, every...)
	bad[0] = 0x09 // high bit dropped
	add("signature-high-bit-dropped", bad, "signature")
	add("header-cut", every[:8+20], "unfinished")
	add("stored-cut", every[:8+45+10], "unfinished")
	add("no-end-frame", every[:len(every)-45-35], "unfinished")
	add("byte-after-end", append(append([]byte{}, every...), 0), "follow the end frame")
	for _, k := range []byte{0, 7, 255} {
		bad = append([]byte{}, every...)
		bad[8] = k
		add(fmt.Sprintf("kind-%d", k), bad, "not a kind of frame")
	}
	bad = append([]byte{}, every...)
	binary.LittleEndian.PutUint32(bad[8+5:], maxSection+1)
	add("raw-above-max-section", bad, "MAX_SECTION")
	bad = append([]byte{}, every...)
	st := binary.LittleEndian.Uint32(bad[8+9:])
	binary.LittleEndian.PutUint32(bad[8+5:], 1032*st+1025)
	add("raw-above-deflate-ratio", bad, "1032")
	// a frame that claims 2 MiB from 3000 bytes: within 1032x, but above 64 x file + 1 MiB
	big := frameBytes(kindHead, 0, 2<<20, 3000, nil, make([]byte, 3000))
	add("total-inflation-bound", append(append([]byte{}, signature...), big...), "64 x")
	// an inflation bomb: rawLength says 100, the stream gives 1 MiB of zeros
	bomb := deflate(make([]byte, 1<<20))
	sum := sha256.Sum256(make([]byte, 100))
	f1 := frameBytes(kindHead, 0, 100, uint32(len(bomb)), sum[:], bomb)
	name := sha256.Sum256(sum[:])
	file := append(append([]byte{}, signature...), f1...)
	for _, k := range []byte{kindPaths, kindWires} {
		e := deflate(nil)
		es := sha256.Sum256(nil)
		file = append(file, frameBytes(k, 0, 0, uint32(len(e)), es[:], e)...)
	}
	hh := sha256.New()
	hh.Write(sum[:])
	es := sha256.Sum256(nil)
	hh.Write(es[:])
	hh.Write(es[:])
	nm := hh.Sum(nil)
	nh := sha256.Sum256(nm)
	nz := deflate(nm)
	file = append(file, frameBytes(kindEnd, 3, 32, uint32(len(nz)), nh[:], nz)...)
	_ = name
	add("inflation-bomb", file, "more than rawLength")

	// --- deflate streams ---
	withStored := func(name, want string, idx int, stored func(raw []byte) []byte) {
		secs := clone(S)
		out := append([]byte{}, signature...)
		h := sha256.New()
		for i, s := range secs {
			hash := sha256.Sum256(s.raw)
			h.Write(hash[:])
			z := deflate(s.raw)
			if i == idx {
				z = stored(s.raw)
			}
			out = append(out, frameBytes(s.kind, s.count, uint32(len(s.raw)), uint32(len(z)), hash[:], z)...)
		}
		nm := h.Sum(nil)
		nh := sha256.Sum256(nm)
		nz := deflate(nm)
		out = append(out, frameBytes(kindEnd, uint32(len(secs)), 32, uint32(len(nz)), nh[:], nz)...)
		add(name, out, want)
	}
	withStored("deflate-gives-fewer", "fewer", 0, func(raw []byte) []byte { return deflate(raw[:len(raw)-1]) })
	withStored("deflate-gives-more", "more than rawLength", 0, func(raw []byte) []byte { return deflate(append(raw, 'x')) })
	withStored("deflate-trailing-byte", "follow the end of the deflate stream", 0, func(raw []byte) []byte { return append(deflate(raw), 0) })
	withStored("deflate-zlib-wrapped", "deflate", 0, func(raw []byte) []byte { return append([]byte{0x78, 0x9c}, deflate(raw)...) })
	withStored("deflate-reserved-block-type", "deflate", 0, func(raw []byte) []byte { return []byte{0x07, 0, 0, 0, 0, 0, 0, 0, 0, 0} })
	withStored("deflate-cut-short", "", 2, func(raw []byte) []byte { z := deflate(raw); return z[:len(z)/2] })
	withStored("deflate-stored-len-nlen-mismatch", "deflate", 0, func(raw []byte) []byte {
		b := []byte{0x01, byte(len(raw)), byte(len(raw) >> 8), 0, 0}
		return append(b, raw...)
	})
	// hashes and the name
	bad = append([]byte{}, every...)
	bad[8+13] ^= 1 // the head's hash: the name from the headers no longer matches the end
	add("head-hash-flipped", bad, "end frame's hash")
	{
		secs := clone(S)
		out := append([]byte{}, signature...)
		h := sha256.New()
		for i, s := range secs {
			hash := sha256.Sum256(s.raw)
			if i == 3 {
				hash[0] ^= 1 // a wrong hash, carried consistently into the name
			}
			h.Write(hash[:])
			z := deflate(s.raw)
			out = append(out, frameBytes(s.kind, s.count, uint32(len(s.raw)), uint32(len(z)), hash[:], z)...)
		}
		nm := h.Sum(nil)
		nh := sha256.Sum256(nm)
		nz := deflate(nm)
		out = append(out, frameBytes(kindEnd, uint32(len(secs)), 32, uint32(len(nz)), nh[:], nz)...)
		add("section-hash-wrong-name-consistent", out, "SHA-256")
		// an end section that is not the name, with a hash that is its own
		zero := make([]byte, 32)
		zh := sha256.Sum256(zero)
		zz := deflate(zero)
		cut := bytes.LastIndex(out, nh[:]) - 13
		out2 := append(append([]byte{}, out[:cut]...), frameBytes(kindEnd, uint32(len(secs)), 32, uint32(len(zz)), zh[:], zz)...)
		add("end-section-not-the-name", out2, "end frame's hash")
	}

	// --- the order of frames ---
	mut("no-head", "not the head", func(s []sec) []sec { return s[1:] })
	mut("two-heads", "paths frame must be", func(s []sec) []sec { return append([]sec{s[0]}, s...) })
	mut("head-count-not-0", "head's count", func(s []sec) []sec { s[0].count = 1; return s })
	mut("strings-without-records", "not immediately before a records frame", func(s []sec) []sec {
		return []sec{s[0], s[1], s[3], s[4]}
	})
	mut("strings-count-0", "holds no strings", func(s []sec) []sec { s[1].count = 0; return s })
	mut("records-count-0", "not 1 to 256", func(s []sec) []sec { s[2].count = 0; return s })
	mut("records-count-257", "not 1 to 256", func(s []sec) []sec { s[2].count = 257; s[3].count = 257; s[4].count = 257; return s })
	mut("paths-count-wrong", "paths frame's count", func(s []sec) []sec { s[3].count = 2; return s })
	mut("wires-count-wrong", "wires frame's count", func(s []sec) []sec { s[4].count = 4; return s })
	mut("paths-and-wires-swapped", "paths frame must be", func(s []sec) []sec { s[3], s[4] = s[4], s[3]; return s })
	mut("no-wires", "wires frame must be", func(s []sec) []sec { return s[:4] })
	mut("short-records-not-last", "fewer than 256", func(s []sec) []sec {
		// two records frames of one file each
		return []sec{s[0], s[1], {kindRecords, 1, s[2].raw}, {kindRecords, 1, nil}, s[3], s[4]}
	})
	{
		out := assemble(clone(S))
		p := bytes.LastIndexByte(out[:len(out)-30], kindEnd) // rough: rebuild end with count 4
		_ = p
		secs := clone(S)
		o := append([]byte{}, signature...)
		h := sha256.New()
		for _, s := range secs {
			hash := sha256.Sum256(s.raw)
			h.Write(hash[:])
			o = appendFrame(o, s.kind, s.count, s.raw, hash)
		}
		nm := h.Sum(nil)
		add("end-count-wrong", appendFrame(append([]byte{}, o...), kindEnd, 4, nm, sha256.Sum256(nm)), "end frame's count")
		nm2 := append(append([]byte{}, nm...), 0)
		add("end-raw-not-32", appendFrame(append([]byte{}, o...), kindEnd, 5, nm2, sha256.Sum256(nm2)), "rawLength is 33")
	}

	// --- the head ---
	headWith := func(name, want string, f func(h []byte) []byte) {
		mut(name, want, func(s []sec) []sec { s[0].raw = f(s[0].raw); return s })
	}
	headWith("head-version-2", "version", func(h []byte) []byte { h[0] = 2; return h })
	headWith("head-trailing-byte", "follow the last item", func(h []byte) []byte { return append(h, 0) })
	headWith("head-cut", "", func(h []byte) []byte { return h[:len(h)-3] })
	headWith("leftout-count-too-large", "count", func(h []byte) []byte {
		// the left-out count is the byte after the scanner text; make it huge
		c := &cur{b: h}
		c.u8()
		for i := 0; i < 4; i++ {
			c.text()
		}
		out := append([]byte{}, h[:c.p]...)
		out = uv(out, 1000)
		return append(out, h[c.p+1:]...)
	})
	mkHead := func(root, base, ext, scanner string) []byte {
		h := []byte{1}
		for _, s := range []string{root, base, ext, scanner} {
			h = textOf(h, s)
		}
		return append(h, 0)
	}
	for _, c := range []struct{ n, root, base, ext, want string }{
		{"root-absolute", "/abs", "", ".md", "root"},
		{"root-backslash", "\\abs", "", ".md", "root"},
		{"root-drive", "C:x", "", ".md", "root"},
		{"root-file-scheme", "FiLe:x", "", ".md", "root"},
		{"root-dotdot", "a/../b", "", ".md", "root"},
		{"baselayer-empty-segment", "a", "b//c", ".md", "baseLayer"},
		{"baselayer-dot", "a", ".", ".md", "baseLayer"},
		{"baselayer-nul", "a", "b\x00", ".md", "baseLayer"},
		{"extension-slash", "a", "b", "/.md", "extension"},
	} {
		h := mkHead(c.root, c.base, c.ext, "s")
		mut("head-"+c.n, c.want, func(s []sec) []sec { s[0].raw = h; return s })
	}
	for _, c := range []struct{ n, b string }{
		{"overlong", "\xc0\xaf"}, {"overlong-3", "\xe0\x80\xaf"}, {"surrogate", "\xed\xa0\x80"},
		{"above-10ffff", "\xf4\x90\x80\x80"}, {"lone-continuation", "\x80"}, {"cut-sequence", "\xe2\x82"},
		{"byte-ff", "\xff"}, {"f5", "\xf5\x80\x80\x80"},
	} {
		h := mkHead("", "", ".md", "scanner "+c.b)
		mut("utf8-"+c.n, "UTF-8", func(s []sec) []sec { s[0].raw = h; return s })
	}
	// varints, in the left-out number
	for _, c := range []struct{ n, b, want string }{
		{"not-shortest", "\x80\x00", "shortest"},
		{"above-2^32", "\x80\x80\x80\x80\x10", "above 2^32"},
		{"sixth-byte", "\x80\x80\x80\x80\x80\x00", "sixth"},
		{"cut", "\x80", "varint runs past"},
	} {
		h := []byte{1, 0, 0, 0, 0, 1, 1, 'r'}
		h = append(h, c.b...)
		if c.n != "cut" {
			h = append(h, 0)
		}
		mut("varint-"+c.n, c.want, func(s []sec) []sec { s[0].raw = h; return s })
	}
	// a valid file with an empty head except for a BOM and U+0000 in strings, accepted: not here.

	// --- strings ---
	mut("string-twice", "same string", func(s []sec) []sec {
		// the table's last string again, and a record naming it (sid = next) is impossible
		// without changing records; instead duplicate it in place of the last string
		c := &cur{b: s[1].raw}
		var at []int
		for i := uint32(0); i < s[1].count; i++ {
			at = append(at, c.p)
			c.text()
		}
		first := s[1].raw[at[0]:at[1]]
		last := len(at) - 1
		s[1].raw = append(append([]byte{}, s[1].raw[:at[last]]...), first...)
		return s
	})
	mut("string-never-met", "never met", func(s []sec) []sec {
		s[1].raw = textOf(s[1].raw, "nobody names me")
		s[1].count++
		return s
	})
	mut("strings-trailing-byte", "follow the last item", func(s []sec) []sec { s[1].raw = append(s[1].raw, 0); return s })
	mut("strings-count-above-raw", "larger than the section", func(s []sec) []sec { s[1].count = uint32(len(s[1].raw) + 1); return s })

	// --- records, at the byte level ---
	mut("records-trailing-byte", "follow the last item", func(s []sec) []sec { s[2].raw = append(s[2].raw, 0); return s })
	mut("records-cut", "", func(s []sec) []sec { s[2].raw = s[2].raw[:len(s[2].raw)-1]; return s })
	mut("sid-skips-ahead", "before string", func(s []sec) []sec { s[2].raw[0] = 1; return s })
	mut("filemark-undefined-bit", "fileMark", func(s []sec) []sec {
		// record 0: path sid(0), layer, fileMark
		s[2].raw[2] |= 0x10
		return s
	})

	// --- records, at the facts level (the writer writes them; the reader must refuse) ---
	edit("path-absolute", "path", func(x *textFacts) { x.files[0].path = "/src/a.ts" })
	edit("path-drive", "path", func(x *textFacts) { x.files[0].path = "C:/src/a.ts" })
	edit("path-file-scheme", "path", func(x *textFacts) { x.files[0].path = "FILE:src/a.ts" })
	edit("path-dotdot", "path", func(x *textFacts) { x.files[0].path = "src/../a.ts" })
	edit("path-dot", "path", func(x *textFacts) { x.files[0].path = "./src/a.ts" })
	edit("path-trailing-slash", "path", func(x *textFacts) { x.files[0].path = "src/a.ts/" })
	edit("path-nul", "path", func(x *textFacts) { x.files[0].path = "src/a\x00.ts" })
	edit("path-backslash-first", "path", func(x *textFacts) { x.files[0].path = "\\src\\a.ts" })
	edit("path-empty", "path", func(x *textFacts) { x.files[0].path = "" })
	edit("paths-out-of-order", "path order", func(x *textFacts) { x.files[0], x.files[1] = x.files[1], x.files[0] })
	edit("path-repeated", "path order", func(x *textFacts) { x.files[1].path = x.files[0].path })
	edit("link-absolute", "absolute", func(x *textFacts) { x.files[0].deps[0].l.link.s = "/etc/passwd" })
	edit("link-file-url", "absolute", func(x *textFacts) { x.files[0].deps[0].l.link.s = "file:///etc/passwd" })
	edit("link-drive", "absolute", func(x *textFacts) { x.files[0].deps[0].l.link.s = "c:\\windows" })
	edit("link-unc", "absolute", func(x *textFacts) { x.files[0].deps[0].l.link.s = "\\\\server\\share" })
	edit("source-path-absolute", "absolute", func(x *textFacts) { x.files[0].symbols[0].srcPath = "/src/a.ts" })
	edit("cited-by-link-absolute", "absolute", func(x *textFacts) { x.files[0].cited[0].link = "/README.md" })
	edit("entry-symbol-link-absolute", "absolute", func(x *textFacts) { x.files[0].entries[0].symLink.s = "/x#main" })
	edit("declarer-link-absolute", "absolute", func(x *textFacts) { x.files[0].entries[1].declLink = "\\package.json" })
	edit("re-export-link-absolute", "absolute", func(x *textFacts) { x.files[1].reExports[0].fromLink = "File:a.ts" })
	edit("target-dotdot", "target is not a path", func(x *textFacts) { x.files[0].deps[0].l.target.s = "../src/b.ts" })
	edit("target-absolute", "target is not a path", func(x *textFacts) { x.files[0].deps[0].l.target.s = "/src/b.ts" })
	edit("target-without-link", "target without a link", func(x *textFacts) { x.files[0].deps[0].l.link = ostr{} })
	edit("anchor-without-target", "anchor without a target", func(x *textFacts) {
		x.files[0].symbols[0].refs[0].types[0].l.target = ostr{}
	})
	edit("entry-link-without-name", "without its name", func(x *textFacts) { x.files[0].entries[0].symName = ostr{} })
	edit("entry-reason-6", "reason 6", func(x *textFacts) { x.files[0].entries[0].reason = 6 })
	edit("role-5", "role 5", func(x *textFacts) { x.files[0].symbols[0].refs[0].role = 5 })
	add("root-backslash-from-text", fromText(t, evTxt, func(x *textFacts) { x.root = "\\x" }), "root")
	// wires that are not what the records give
	mut("wires-missing-one", "wires section says", func(s []sec) []sec {
		// file 0 (src/a.ts) wires to 1 (src/b.ts): say it wires to nothing, file 2 to 1
		s[4].raw = []byte{0, 1, 0, 0}
		return s
	})
	mut("wire-to-self", "to itself", func(s []sec) []sec { s[4].raw = []byte{1, 0, 1, 0, 0}; return s })
	mut("wire-out-of-range", "there are 3 files", func(s []sec) []sec { s[4].raw = []byte{1, 3, 1, 0, 0}; return s })
	mut("wire-gap-out-of-range", "there are 3 files", func(s []sec) []sec { s[4].raw = []byte{2, 1, 1, 1, 0, 0}; return s })
	mut("wires-trailing-byte", "follow the last item", func(s []sec) []sec { s[4].raw = append(s[4].raw, 0); return s })
	mut("wires-count-too-large", "count", func(s []sec) []sec { s[4].raw = []byte{100, 1, 1, 0, 0}; return s })

	// --- paths ---
	pathsOf := func(ps ...string) []byte {
		var b []byte
		prev := ""
		for _, p := range ps {
			n := 0
			for n < len(prev) && n < len(p) && prev[n] == p[n] {
				n++
			}
			b = uv(b, uint32(n))
			b = textOf(b, p[n:])
			prev = p
		}
		return b
	}
	mut("paths-not-longest-shared", "longest beginning", func(s []sec) []sec {
		b := pathsOf("src/a.ts")
		b = append(b, 4, 4, 'b', '.', 't', 's') // shares "src/" only, though "src/" + "b" ... ok
		b = append(b, 3, 5, '/', 'c', '.', 't', 's')
		s[3].raw = b
		return s
	})
	mut("paths-shared-too-long", "shares", func(s []sec) []sec {
		s[3].raw = append(pathsOf("src/a.ts"), 20, 0, 0, 0)
		return s
	})
	mut("paths-differ-from-records", "not the paths section's", func(s []sec) []sec {
		s[3].raw = pathsOf("src/a.ts", "src/b.ts", "src/d.ts")
		return s
	})
	mut("paths-out-of-order", "path order", func(s []sec) []sec { s[3].raw = pathsOf("src/b.ts", "src/a.ts", "src/c.ts"); return s })
	mut("paths-dotdot", "not a path", func(s []sec) []sec { s[3].raw = pathsOf("..", "src/a.ts", "src/b.ts"); return s })
	mut("paths-trailing-byte", "follow the last item", func(s []sec) []sec { s[3].raw = append(s[3].raw, 0); return s })
	mut("paths-longer-than-strings", "longer than the strings", func(s []sec) []sec {
		long := strings.Repeat("x", len(S[1].raw)+1)
		s[3].raw = pathsOf("a", long, long+"y")
		return s
	})

	// --- the empty sample, changed ---
	{
		E := split(t, empty)
		e2 := clone(E)
		e2[1].count = 1
		add("empty-paths-count-1", assemble(e2), "paths frame's count")
	}
	return hs
}

func TestRefusals(t *testing.T) {
	dir := filepath.Join("tests", "refuse")
	os.RemoveAll(dir)
	os.MkdirAll(dir, 0o755)
	var list strings.Builder
	for i, h := range hostileFiles(t) {
		start := time.Now()
		_, ref := readOutcome(h.data)
		if ref == "" {
			t.Errorf("%s: accepted", h.name)
			continue
		}
		if strings.HasPrefix(ref, "INTERNAL") || !strings.Contains(ref, h.want) {
			t.Errorf("%s: refused for another reason: %s", h.name, ref)
		}
		if time.Since(start) > 2*time.Second {
			t.Errorf("%s: slow", h.name)
		}
		fn := fmt.Sprintf("%02d-%s.fpk", i, h.name)
		os.WriteFile(filepath.Join(dir, fn), h.data, 0o644)
		fmt.Fprintf(&list, "%s\t%s\n", fn, ref)
	}
	os.WriteFile(filepath.Join(dir, "EXPECTED.tsv"), []byte(list.String()), 0o644)
}

// --- texts that name must refuse ---

func TestTextRefusals(t *testing.T) {
	ev := string(mustRead(t, "made-every-fact.txt"))
	lines := strings.SplitAfter(ev, "\n")
	lines = lines[:len(lines)-1]
	join := func(ls []string) string { return strings.Join(ls, "") }
	repl := func(old, new string) string {
		if !strings.Contains(ev, old) {
			t.Fatalf("no %q", old)
		}
		return strings.Replace(ev, old, new, 1)
	}
	cases := []struct{ n, text, want string }{
		{"empty", "", "empty"},
		{"bom", "\uFEFF" + ev, "byte-order mark"},
		{"crlf", strings.ReplaceAll(ev, "\n", "\r\n"), "CR"},
		{"no-final-lf", strings.TrimSuffix(ev, "\n"), "LF"},
		{"invalid-utf8", repl("ünïcödé", "\xc3\x28"), "UTF-8"},
		{"space-after-comma", repl(`[null,"scanner",`, `[null, "scanner",`), "line 3"},
		{"space-at-end", repl(`"a test 1.0"]`, `"a test 1.0"] `), "line 3"},
		{"members-reordered", repl(`{"label":"src/b.ts","link":"b.ts.mdmd.md"`, `{"link":"b.ts.mdmd.md","label":"src/b.ts"`), "line 12"},
		{"unknown-member", repl(`"kind":"class",`, `"kind":"class","x":1,`), "line 18"},
		{"duplicate-member", repl(`"kind":"class",`, `"kind":"class","kind":"class",`), "line 18"},
		{"number-4.0", repl(`["src/b.ts","file",4,`, `["src/b.ts","file",4.0,`), "decimal point"},
		{"number-4e0", repl(`["src/b.ts","file",4,`, `["src/b.ts","file",4e0,`), "exponent"},
		{"number-leading-zero", repl(`["src/b.ts","file",4,`, `["src/b.ts","file",04,`), "leading zero"},
		{"number-negative", repl(`["src/b.ts","file",4,`, `["src/b.ts","file",-4,`), "unexpected"},
		{"number-too-big", repl(`["src/b.ts","file",4,`, `["src/b.ts","file",4294967296,`), "2^32"},
		{"escape-A", repl(`"Widget"`, `"\u0041Widget"`), "line 10"},
		{"escape-slash", repl(`"src/b.ts","file"`, `"src\/b.ts","file"`), "line"},
		{"escape-uppercase-hex", repl(`\t`, `\u0009`), "line 10"},
		{"surrogate-pair-escape", repl("😀", `\ud83d\ude00`), "line 10"},
		{"lone-surrogate-escape", repl("😀", `\ud83d`), "surrogate"},
		{"raw-tab-in-string", repl(`\t`, "\t"), "control character"},
		{"false-for-absent", repl(`"array":true`, `"array":false`), "false"},
		{"array-written-1", repl(`"array":true`, `"array":1`), "true"},
		{"missing-end", join(lines[:len(lines)-1]), "no end line"},
		{"after-end", ev + "[null,\"end\",3]\n", "follows the end line"},
		{"end-count-wrong", repl(`[null,"end",3]`, `[null,"end",2]`), "line 25"},
		{"version-2", repl(`"fact-pack",1]`, `"fact-pack",2]`), "version"},
		{"format-name", repl(`"fact-pack"`, `"fact-pac"`), "format"},
		{"missing-authored", repl("[\"src/c.ts\",\"authored\",\"\"]\n", ""), "line 22"},
		{"null-as-flags", repl(`"kind":"class","flags":[]`, `"kind":"class","flags":null`), "not an array"},
		{"lines-out-of-order", join(append(append(append([]string{}, lines[:10]...), lines[11], lines[10]), lines[12:]...)), "line 11"},
		{"files-out-of-order", join(append(append(append(append([]string{}, lines[:15]...), lines[20:24]...), lines[15:20]...), lines[24:]...)), "path order"},
		{"line-of-other-file", repl(`["src/c.ts","authored"`, `["src/b.ts","authored"`), "not among the lines"},
		{"absolute-path", strings.ReplaceAll(ev, `"src/c.ts"`, `"/src/c.ts"`), "path"},
		{"absolute-link", repl(`"../package.json.mdmd.md"`, `"/package.json.mdmd.md"`), "absolute"},
		{"target-not-path", repl(`"target":"src/gone.ts"`, `"target":"src//gone.ts"`), "target is not a path"},
		{"target-no-link", repl(`"link":"gone.ts.mdmd.md",`, ``), "target without a link"},
		{"unknown-role", repl(`"role":"Extends"`, `"role":"extends"`), "role"},
		{"unknown-reason", repl(`"reason":"tooling"`, `"reason":"Tooling"`), "reason"},
		{"unknown-kind", repl(`"authored","### Purpose\n_Pending`, `"notes","### Purpose\n_Pending`), "not a kind"},
		{"root-absolute", repl(`".mdmd","layer-4"`, `"/mdmd","layer-4"`), "root"},
		{"extension-slash", repl(`".mdmd.md"]`, `"/.mdmd.md"]`), "extension"},
		{"not-json", repl(`[null,"scanner"`, `[null,'scanner'`), "unexpected"},
		{"empty-line", repl("\n[null,\"scanner\"", "\n\n[null,\"scanner\""), "line 3"},
		{"deep-nesting", strings.Repeat("[", 100000) + "\n", "nested"},
		{"cited-by-twice", repl("[\"src/c.ts\",\"cited-by\",[]]\n", "[\"src/c.ts\",\"cited-by\",[]]\n[\"src/c.ts\",\"cited-by\",[]]\n"), "line 24"},
		{"declarer-without-link", repl(`"declarer":{"label":"package.json","link":"../package.json.mdmd.md"}`, `"declarer":{"label":"package.json"}`), "no \"link\""},
	}
	dir := filepath.Join("tests", "refuse-text")
	os.RemoveAll(dir)
	os.MkdirAll(dir, 0o755)
	var list strings.Builder
	for i, c := range cases {
		_, ref := nameOutcome([]byte(c.text))
		if ref == "" {
			t.Errorf("%s: accepted", c.n)
			continue
		}
		if strings.HasPrefix(ref, "INTERNAL") || !strings.Contains(ref, c.want) {
			t.Errorf("%s: refused for another reason: %s", c.n, ref)
		}
		fn := fmt.Sprintf("%02d-%s.txt", i, c.n)
		os.WriteFile(filepath.Join(dir, fn), []byte(c.text), 0o644)
		fmt.Fprintf(&list, "%s\t%s\n", fn, ref)
	}
	os.WriteFile(filepath.Join(dir, "EXPECTED.tsv"), []byte(list.String()), 0o644)
}

// A scan of more than 256 files, made as text, named, written, read back.
func TestManyFiles(t *testing.T) {
	var b strings.Builder
	b.WriteString("[null,\"format\",\"fact-pack\",1]\n[null,\"location\",\"\",\"\",\".md\"]\n[null,\"scanner\",\"gen\"]\n")
	n := 700
	paths := make([]string, n)
	for i := range paths {
		paths[i] = fmt.Sprintf("dir%d/f%04d.ts", i%3, i)
	}
	slicesSortStrings(paths)
	for i, p := range paths {
		q := fmt.Sprintf("%q", p)
		fmt.Fprintf(&b, "[%s,\"file\",%d,null,null]\n[%s,\"authored\",\"same words\"]\n", q, i%5, q)
		tgt := paths[(i*7+1)%n]
		fmt.Fprintf(&b, "[%s,\"dependency\",{\"label\":\"x\",\"link\":\"l\",\"target\":%q,\"qualifiers\":[\"re-export\"]}]\n", q, tgt)
		if i%2 == 0 {
			fmt.Fprintf(&b, "[%s,\"dependency\",{\"label\":\"self\",\"link\":\"s\",\"target\":%s,\"qualifiers\":[]}]\n", q, q)
		}
	}
	fmt.Fprintf(&b, "[null,\"end\",%d]\n", n)
	txt := b.String()
	name, ref := nameOutcome([]byte(txt))
	if ref != "" {
		t.Fatalf("refused: %s", ref)
	}
	bin := buildFile(parseText([]byte(txt)))
	got, ref := readOutcome(bin)
	if ref != "" || got != txt {
		t.Fatalf("read back: %s", ref)
	}
	if s := readScan(bin); fmt.Sprintf("%x", s.name) != name || len(s.records) != 3 {
		t.Fatalf("name or sections")
	}
	os.MkdirAll("tests/accept", 0o755)
	os.WriteFile("tests/accept/many-files.fpk", bin, 0o644)
	os.WriteFile("tests/accept/many-files.txt", []byte(txt), 0o644)
}

func slicesSortStrings(a []string) {
	for i := 1; i < len(a); i++ {
		for j := i; j > 0 && a[j] < a[j-1]; j-- {
			a[j], a[j-1] = a[j-1], a[j]
		}
	}
}

// Random changes to the samples: every outcome is text or a refusal, never anything else.
func TestMutations(t *testing.T) {
	rng := rand.New(rand.NewSource(1))
	for _, n := range []string{"made-every-fact.fpk", "made-empty.fpk", "corpus-estate.fpk"} {
		orig := mustRead(t, n)
		for k := 0; k < 3000; k++ {
			b := append([]byte{}, orig...)
			switch k % 4 {
			case 0:
				b[rng.Intn(len(b))] ^= byte(1 << rng.Intn(8))
			case 1:
				b = b[:rng.Intn(len(b))]
			case 2:
				for j := 0; j < 8; j++ {
					b[rng.Intn(len(b))] = byte(rng.Intn(256))
				}
			case 3:
				i := rng.Intn(len(b))
				b = append(b[:i], append([]byte{byte(rng.Intn(256))}, b[i:]...)...)
			}
			start := time.Now()
			_, ref := readOutcome(b)
			if strings.HasPrefix(ref, "INTERNAL") {
				t.Fatalf("%s mutation %d: %s", n, k, ref)
			}
			if time.Since(start) > time.Second {
				t.Fatalf("slow")
			}
		}
	}
	// and the same for texts, with name
	for _, n := range []string{"made-every-fact.txt", "corpus-estate.txt"} {
		orig := mustRead(t, n)
		for k := 0; k < 1500; k++ {
			b := append([]byte{}, orig...)
			for j := 0; j < 1+k%3; j++ {
				b[rng.Intn(len(b))] = "[]{}\",:0123456789\\ntu \x00\x80"[rng.Intn(24)]
			}
			_, ref := nameOutcome(b)
			if strings.HasPrefix(ref, "INTERNAL") {
				t.Fatalf("%s text mutation %d: %s", n, k, ref)
			}
		}
	}
}

// One record naming a 100 KB target path 200,000 times: checking it must cost about the
// file's size, not 200,000 x 100 KB.
func TestAmplification(t *testing.T) {
	long := strings.Repeat("abcdefghij/", 10000) + "z"
	f := &textFacts{extension: ".md"}
	a := &tfile{path: "a"}
	for i := 0; i < 120000; i++ {
		a.deps = append(a.deps, tdep{label: "x", l: tlinked{link: ostr{true, "l"}, target: ostr{true, long}}})
	}
	f.files = []*tfile{a, {path: long}}
	bin := buildFile(f)
	start := time.Now()
	s := readScan(bin)
	if d := time.Since(start); d > 3*time.Second {
		t.Fatalf("validation took %v", d)
	}
	t.Logf("file %d bytes, validated in %v, %d strings", len(bin), time.Since(start), len(s.table))
}

func TestLarge(t *testing.T) {
	if os.Getenv("FACTPACK_LARGE") == "" {
		t.Skip("set FACTPACK_LARGE=1")
	}
	rng := rand.New(rand.NewSource(2))
	var b strings.Builder
	b.WriteString("[null,\"format\",\"fact-pack\",1]\n[null,\"location\",\"\",\"\",\".md\"]\n[null,\"scanner\",\"gen\"]\n")
	n := 20000
	paths := make([]string, n)
	for i := range paths {
		paths[i] = fmt.Sprintf("d%02d/f%06d.ts", i%50, i)
	}
	sortStrings := func(a []string) { // simple merge via map order not needed: use sort pkg-free approach
		for gap := len(a) / 2; gap > 0; gap /= 2 {
			for i := gap; i < len(a); i++ {
				for j := i; j >= gap && a[j] < a[j-gap]; j -= gap {
					a[j], a[j-gap] = a[j-gap], a[j]
				}
			}
		}
	}
	sortStrings(paths)
	word := func() string {
		w := make([]byte, 2000)
		for i := range w {
			w[i] = "abcdefghij klmnop\n\"\\é"[rng.Intn(21)]
		}
		return strings.ToValidUTF8(string(w), "?")
	}
	var bb bytes.Buffer
	bw := bufio.NewWriter(&bb)
	for i, p := range paths {
		bw.WriteString("[")
		writeJSONString(bw, p)
		fmt.Fprintf(bw, ",\"file\",%d,null,null]\n[", i%5)
		writeJSONString(bw, p)
		bw.WriteString(",\"authored\",")
		writeJSONString(bw, word())
		bw.WriteString("]\n[")
		writeJSONString(bw, p)
		fmt.Fprintf(bw, ",\"dependency\",{\"label\":\"x\",\"link\":\"l\",\"target\":%q,\"qualifiers\":[]}]\n", paths[rng.Intn(n)])
	}
	bw.Flush()
	b.Write(bb.Bytes())
	fmt.Fprintf(&b, "[null,\"end\",%d]\n", n)
	os.MkdirAll("tests/large", 0o755)
	os.WriteFile("tests/large/large.txt", []byte(b.String()), 0o644)
	os.WriteFile("tests/large/large.fpk", buildFile(parseText([]byte(b.String()))), 0o644)
}

func peakRSS() string {
	b, _ := os.ReadFile("/proc/self/status")
	for _, l := range strings.Split(string(b), "\n") {
		if strings.HasPrefix(l, "VmHWM") {
			return strings.TrimSpace(l[6:])
		}
	}
	return "?"
}

func TestLargeMemory(t *testing.T) {
	m, f := os.Getenv("FACTPACK_MODE"), os.Getenv("FACTPACK_FILE")
	if f == "" {
		t.Skip("set FACTPACK_MODE and FACTPACK_FILE")
	}
	data := mustRead(t, f)
	before := peakRSS()
	w := bufio.NewWriter(io.Discard)
	if m == "read" {
		readScan(data).emitText(w)
	} else {
		nameOfText(data)
	}
	t.Logf("%s %s: %d bytes in; peak RSS before %s, after %s", m, f, len(data), before, peakRSS())
}

func TestEscapesAndNoStringsFrame(t *testing.T) {
	var b strings.Builder
	b.WriteString("[null,\"format\",\"fact-pack\",1]\n[null,\"location\",\"\",\"\",\"\"]\n[null,\"scanner\",\"\uFEFFbom kept\"]\n")
	b.WriteString("[null,\"left-out\",\"\",0,\"\"]\n[null,\"left-out\",\"r\",4294967295,\"d\"]\n")
	paths := make([]string, 257)
	for i := range paths {
		paths[i] = fmt.Sprintf("p%03d", i)
	}
	odd := "\\u0000\\u001f\\u000b\x7f\u0080\u009f  /\\\"\\\\\\b\\f\\n\\r\\t\U0010FFFF"
	for i, p := range paths {
		fmt.Fprintf(&b, "[%q,\"file\",0,null,null]\n[%q,\"authored\",\"%s\"]\n", p, p, odd)
		if i == 0 {
			// name the last file's path, so that the second records section meets no new string
			fmt.Fprintf(&b, "[%q,\"dependency\",{\"label\":\"p256\",\"link\":\"p256\",\"target\":\"p256\",\"qualifiers\":[]}]\n", p)
		}
	}
	b.WriteString("[null,\"end\",257]\n")
	txt := b.String()
	if _, ref := nameOutcome([]byte(txt)); ref != "" {
		t.Fatalf("refused: %s", ref)
	}
	bin := buildFile(parseText([]byte(txt)))
	s := readScan(bin)
	kinds := ""
	for _, f := range s.frames {
		kinds += kindNames[f.kind] + " "
	}
	if kinds != "head strings records records paths wires end " {
		t.Fatalf("frames: %s", kinds)
	}
	got, ref := readOutcome(bin)
	if ref != "" || got != txt {
		t.Fatalf("read back differs: %s", ref)
	}
	os.WriteFile("tests/accept/escapes.fpk", bin, 0o644)
	os.WriteFile("tests/accept/escapes.txt", []byte(txt), 0o644)
}
