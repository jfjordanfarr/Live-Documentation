/**
 * The Node host's implementation of the optional {@link GitHost} port: delegates git ignore listings, repository
 * detection, `core.ignorecase`, and `--changed` working-tree status to Node's `git` CLI wrappers (`gitIgnored.ts` and
 * `gitUtils.ts`).
 *
 * @remarks
 * Written 2026-11-24 for Step 8 of the road to one engine for a page and a command line
 * (`.mdmd/layer-3/engine-and-hosts.mdmd.md`, section 6). Keeps `node:child_process`, `node:process`, and git's `lstatSync`
 * / callback `readdir` calls out of the pure discovery/generator core and out of the browser scan bundle.
 *
 * @module
 */
import { detectChangedFiles } from "../live-docs/gitUtils";
import { gitIgnored, gitIgnores, gitIgnoresCase, liesInNoRepository } from "./gitIgnored";
import type { GitHost } from "./workspaceFiles";

/** Node's {@link GitHost}: runs git subprocesses against a workspace on disk. */
export const NODE_GIT_HOST: GitHost = {
  ignores: gitIgnores,
  ignored: gitIgnored,
  ignoresCase: gitIgnoresCase,
  liesInNoRepository,
  changedFiles: detectChangedFiles
};
