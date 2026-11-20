/**
 * A change's summary as a person or a command reads it: the documents the configuration's bundle exclusions name
 * taken out of its document links and its `Cited By` lists, by the rule the bundle reads today's graph by
 * (`excluded` in `relatedDocs.ts`).
 *
 * @remarks
 * Since 2026-11-19 a summary keeps every document a file's words link to and every document that cites a file, with
 * no bundle exclusion applied, and the exclusion is applied here, where the history command reads the summaries into
 * the sequence. So `bundleExclude` is not in the lens's key: an edit of it rewrites the sequence from the cache in
 * minutes rather than summarizing every change again. Before, the summarizing process applied it and the key held the
 * whole configuration, so that the archive's move of 2026-11-18, whose patterns moved with it, left the records under
 * the archive's former path linked at every old change until a rebuild. This module is not the summarizing
 * process's and is not in the key.
 *
 * @module
 */

import { excluded } from "../relatedDocs";
import type { CommitSummary } from "./summary";

/** The summary without the documents `bundleExclude` names, in its links and its files' `Cited By`; the summary itself is left as it was. */
export function bundledSummary(summary: CommitSummary, bundleExclude: readonly string[]): CommitSummary {
  if (bundleExclude.length === 0) return summary;
  const files = summary.files.map((file) => {
    if (file.citedBy === undefined) return file;
    const citedBy = file.citedBy.filter((document) => !excluded(document, bundleExclude));
    if (citedBy.length === file.citedBy.length) return file;
    if (citedBy.length > 0) return { ...file, citedBy };
    const { citedBy: _gone, ...rest } = file;
    return rest;
  });
  const docLinks = summary.docLinks.filter(([, document]) => !excluded(document, bundleExclude));
  return { ...summary, files, docLinks };
}
