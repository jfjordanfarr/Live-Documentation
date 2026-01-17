import * as vscode from "vscode";

import { RebindRequiredPayload } from "@live-documentation/shared/contracts/maintenance";

const REBIND_COMMAND = "linkDiagnostics.overrideLink";

export async function showRebindPrompt(payload: RebindRequiredPayload): Promise<void> {
  const impactedCount = payload.impacted.length;
  const impactedPreview = payload.impacted.slice(0, 3).map(item => item.uri).join(", ");
  const remaining = impactedCount - Math.min(impactedCount, 3);
  const remainderSuffix = remaining > 0 ? `, +${remaining} more` : "";
  const action = payload.reason === "rename" ? "renamed" : "deleted";

  const message = `${impactedCount} linked artifact${impactedCount === 1 ? "" : "s"} referencing ${payload.removed.uri} were ${action}. Rebind the relationships to restore drift monitoring.`;
  const detail = impactedPreview ? `Impacted: ${impactedPreview}${remainderSuffix}.` : undefined;

  const rebindOption = "Rebind links";
  const dismissOption = "Dismiss";
  const chosen = await vscode.window.showInformationMessage(detail ? `${message} ${detail}` : message, rebindOption, dismissOption);

  if (chosen !== rebindOption) {
    return;
  }

  await vscode.commands.executeCommand(REBIND_COMMAND, {
    removed: payload.removed,
    impacted: payload.impacted,
    reason: payload.reason,
    newUri: payload.newUri
  });
}
