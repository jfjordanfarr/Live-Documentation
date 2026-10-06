/**
 * The still-picture deck's scopes: the named sets of files whose references
 * among themselves are the facts in scope, shared with the layout lab so that
 * both instruments measure the same pictures.
 *
 * @module scopes
 */

export interface DeckScope {
  bundle: "repository" | "estate";
  /** The bundle's path under the served Explorer. */
  base: string;
  /** Which scope set: the five files that broke both views, or a chain of four across four folders. */
  scopeName: "five files" | "chain";
  /** The files whose references among themselves are the facts in scope. */
  scope: string[];
  /** The file the Local Map and the Force Graph open on. */
  subject: string;
  /** The question the journey answers: which files use `symbol` of `file`. */
  journey?: { file: string; symbol: string };
  /** A uses B uses C uses D; the journey asks how A reaches D. */
  chain?: string[];
}

export const FIVE_REPOSITORY = [
  "packages/engine/src/live-docs/graph.ts",
  "packages/engine/src/live-docs/document.ts",
  "packages/engine/src/live-docs/graphFiles.ts",
  "packages/explorer/src/shared/staticExplorerData.ts",
  "packages/explorer/src/shared/staticBuilder.ts"
];

export const CHAIN_REPOSITORY = [
  "packages/explorer/src/client/index.ts",
  "packages/explorer/src/client/persistence/compressed-url-state.ts",
  "packages/explorer/src/client/views/pin-state.ts",
  "packages/explorer/src/client/views/symbolAnchors.ts"
];

export const FIVE_ESTATE = [
  "Contracts/IPaymentService.cs",
  "PaymentService/PaymentService.cs",
  "Gateway/Wcf/HubProxy.cs",
  "Hub/PaymentHub.cs",
  "Portal/Services/GatewayClient.cs"
];

export const CHAIN_ESTATE = ["Portal/Services/GatewayClient.cs", "Gateway/Controllers/PaymentsController.cs", "Gateway/Wcf/HubProxy.cs", "Contracts/IPaymentHub.cs"];

export const DECK_SCOPES: DeckScope[] = [
  { bundle: "repository", base: "/", scopeName: "five files", scope: FIVE_REPOSITORY, subject: FIVE_REPOSITORY[0], journey: { file: FIVE_REPOSITORY[0], symbol: "GraphFile" } },
  { bundle: "repository", base: "/", scopeName: "chain", scope: CHAIN_REPOSITORY, subject: CHAIN_REPOSITORY[0], chain: CHAIN_REPOSITORY },
  { bundle: "estate", base: "/samples/estate/", scopeName: "five files", scope: FIVE_ESTATE, subject: FIVE_ESTATE[1], journey: { file: FIVE_ESTATE[0], symbol: "IPaymentService" } },
  { bundle: "estate", base: "/samples/estate/", scopeName: "chain", scope: CHAIN_ESTATE, subject: CHAIN_ESTATE[0], chain: CHAIN_ESTATE }
];
