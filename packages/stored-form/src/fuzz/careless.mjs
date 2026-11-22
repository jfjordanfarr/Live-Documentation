// A deliberately careless reader of the stored form, kept so that the fuzzer is seen to fail. It trusts every count
// and length a file declares, inflates without a limit and reads past a section's end; the fuzz test holds that the
// fuzzer finds it out. Never use it for anything else.

async function inflate(bytes) {
  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer());
}

function varint(raw, cursor) {
  let n = 0;
  let scale = 1;
  while (raw[cursor.at] & 0x80) {
    n += (raw[cursor.at++] & 0x7f) * scale;
    scale *= 128;
  }
  return n + (raw[cursor.at++] ?? 0) * scale;
}

export async function readScan(bytes) {
  if (bytes[0] !== 0x89) return { ok: false, reason: "no signature" };
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const sections = [];
  for (let at = 8; at + 45 <= bytes.length; ) {
    const kind = bytes[at];
    const count = view.getUint32(at + 1, true);
    const stored = view.getUint32(at + 9, true);
    const raw = await inflate(bytes.subarray(at + 45, at + 45 + stored));
    const items = new Array(count);
    const cursor = { at: 0 };
    for (let i = 0; i < count; i += 1) items[i] = kind === 2 ? raw.subarray(cursor.at, (cursor.at += varint(raw, cursor))) : varint(raw, cursor);
    sections.push({ kind, items });
    at += 45 + stored;
  }
  return { ok: true, value: sections };
}

export async function resumeFrom(bytes) {
  return readScan(bytes);
}

export async function textOf(bytes) {
  const read = await readScan(bytes);
  return { ok: true, value: JSON.stringify(read.value.map((s) => s.items.length)) };
}
