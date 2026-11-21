import { describe, expect, it } from "vitest";

import { withoutXmlComments } from "./dotnetXml";

describe("withoutXmlComments", () => {
  it("writes every comment over in spaces, keeping its line breaks, so that positions and lines stay where they were", () => {
    const text = "<a>\n<!-- <b/>\n<c/> -->\n<d/></a>";
    const result = withoutXmlComments(text);
    expect(result.length).toBe(text.length);
    expect(result.split("\n").length).toBe(text.split("\n").length);
    expect(result).not.toContain("<b/>");
    expect(result).not.toContain("<c/>");
    expect(result.indexOf("<d/>")).toBe(text.indexOf("<d/>"));
  });

  it("runs a comment left open to the end, and passes a CDATA section over whole", () => {
    expect(withoutXmlComments("<a/><!-- <b/>").trimEnd()).toBe("<a/>");
    expect(withoutXmlComments("<e><![CDATA[ <!-- kept --> ]]></e><!-- gone -->").trimEnd()).toBe("<e><![CDATA[ <!-- kept --> ]]></e>");
  });
});
