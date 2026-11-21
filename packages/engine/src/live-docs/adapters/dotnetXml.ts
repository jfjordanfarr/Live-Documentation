/**
 * The one step every .NET reader that reads XML by pattern takes first: an XML comment is no element, so it is taken
 * out before any pattern runs. Project files, solutions in their XML form (`.slnx`), `Web.config`, `App.config` and
 * `packages.config` are read by patterns, and until 2026-11-21 a `<ProjectReference>`, a `<PackageReference>`, a
 * setting or a project a person had commented out was read as real (an independent review of the readers' joining;
 * MSBuild, asked the same file, reads none of them).
 *
 * @module
 */
import { inSpaces } from "./spaces";

/**
 * The text with every XML comment (`<!-- … -->`) written over in spaces, its line breaks kept, so that a position
 * found in the result is the same position in the text. A comment left open runs to the end. A CDATA section is
 * passed over whole, since `<!--` inside one is its text, not a comment.
 */
export function withoutXmlComments(text: string): string {
  let result = "";
  let at = 0;
  for (;;) {
    const comment = text.indexOf("<!--", at);
    const cdata = text.indexOf("<![CDATA[", at);
    if (comment === -1) return result + text.slice(at);
    if (cdata !== -1 && cdata < comment) {
      const end = text.indexOf("]]>", cdata);
      const until = end === -1 ? text.length : end + 3;
      result += text.slice(at, until);
      at = until;
      continue;
    }
    const end = text.indexOf("-->", comment + 4);
    const until = end === -1 ? text.length : end + 3;
    result += text.slice(at, comment) + inSpaces(text.slice(comment, until));
    at = until;
  }
}
