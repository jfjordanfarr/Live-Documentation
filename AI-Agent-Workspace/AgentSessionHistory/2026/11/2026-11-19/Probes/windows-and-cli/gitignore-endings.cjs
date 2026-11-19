// Whether the fallback reader of .gitignore (the `ignore` package) minds CRLF endings or a byte-order mark.
const ignore = require("../../../../../../../node_modules/ignore");
const mark = String.fromCharCode(0xfeff);
for (const [label, text] of [["CRLF", "bin/\r\nobj/\r\n"], ["mark and CRLF", `${mark}bin/\r\nobj/\r\n`]]) {
  const rules = ignore().add(text);
  console.log(`${label}: bin/x ${rules.ignores("bin/x")}, obj/y ${rules.ignores("obj/y")}`);
}
