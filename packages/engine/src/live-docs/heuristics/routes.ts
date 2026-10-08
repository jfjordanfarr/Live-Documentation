/**
 * The routes a script calls.
 *
 * @remarks
 * A browser script names the routes it calls in `fetch`, in `axios`, in jQuery's
 * `$.ajax` family and in `XMLHttpRequest.open`. Each call becomes a dependency
 * on the file that serves the route, observed from a contract; a call nothing
 * in the workspace serves stays as the route's name, so the map can still show
 * a door to something outside.
 *
 * @module
 */

import ts from "typescript";

import type { WorkspaceFileIndex } from "../adapters";
import type { DependencyEntry, WorkspaceSymbolIndex } from "../coreTypes";
import { chooseServers, isHttpMethod, matchRoute, routeSegments, routeSymbolName, type RoutePattern, type ServedRoute } from "../openings";

const AXIOS_VERBS: ReadonlySet<string> = new Set(["get", "post", "put", "delete", "patch", "head", "options"]);
const JQUERY_VERBS: Record<string, string> = { get: "GET", post: "POST", getJSON: "GET" };
const FILE_EXTENSION = /\.[a-z0-9]{1,5}$/iu;

/** A route call found in the script: its method, when known, and the URL as text with `{}` for computed parts. */
interface RouteCall {
  method?: string;
  url: string;
}

/**
 * Finds the route calls in a script and resolves each to the file that serves it.
 *
 * @param params.sourceFile - The parsed script.
 * @param params.sourcePath - Its workspace-relative path, to tell home from away.
 * @param params.fileIndex - The workspace's files, for the manifests that mark a home.
 * @param params.symbolIndex - The symbol index, which holds every served route.
 */
export function inferRouteDependencies(params: {
  sourceFile: ts.SourceFile;
  sourcePath: string;
  fileIndex?: WorkspaceFileIndex;
  symbolIndex: WorkspaceSymbolIndex;
}): DependencyEntry[] {
  const calls = collectRouteCalls(params.sourceFile);
  if (calls.length === 0) {
    return [];
  }

  const byFile = new Map<string, Set<string>>();
  const external = new Set<string>();
  for (const call of calls) {
    const pattern: RoutePattern = { method: call.method, segments: routeSegments(call.url) };
    if (pattern.segments.length === 0) {
      continue;
    }
    const absolute = /^[a-z][a-z0-9+.-]*:\/\//iu.test(call.url);
    const servers: ServedRoute[] = chooseServers(matchRoute(pattern, params.symbolIndex), params.sourcePath, params.fileIndex, !absolute);
    if (servers.length === 0) {
      if (!FILE_EXTENSION.test(pattern.segments[pattern.segments.length - 1])) {
        external.add(routeSymbolName(call.method, call.url));
      }
      continue;
    }
    for (const server of servers) {
      if (server.location.sourcePath === params.sourcePath) {
        continue;
      }
      const names = byFile.get(server.location.sourcePath) ?? new Set<string>();
      names.add(server.name);
      byFile.set(server.location.sourcePath, names);
    }
  }

  const dependencies: DependencyEntry[] = Array.from(byFile.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([file, names]) => ({ specifier: file, resolvedPath: file, symbols: Array.from(names).sort(), kind: "import" as const, basis: "contract" as const }));
  for (const name of Array.from(external).sort()) {
    dependencies.push({ specifier: name, symbols: [], kind: "import", basis: "contract" });
  }
  return dependencies;
}

/** Every route call in the script, in source order. */
export function collectRouteCalls(sourceFile: ts.SourceFile): RouteCall[] {
  const calls: RouteCall[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const call = routeCallOf(node);
      if (call) {
        calls.push(call);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return calls;
}

function routeCallOf(node: ts.CallExpression): RouteCall | undefined {
  const callee = node.expression;
  const [first, second] = node.arguments;

  // fetch(url, { method })
  if (isName(callee, "fetch") || (ts.isPropertyAccessExpression(callee) && isName(callee.expression, "window") && callee.name.text === "fetch")) {
    const url = urlText(first);
    return url === undefined ? undefined : { method: propertyText(second, "method") ?? "GET", url };
  }

  if (ts.isPropertyAccessExpression(callee)) {
    const owner = callee.expression;
    const member = callee.name.text;

    // axios.get(url), axios.post(url, body)
    if (isName(owner, "axios") && AXIOS_VERBS.has(member)) {
      const url = urlText(first);
      return url === undefined ? undefined : { method: member.toUpperCase(), url };
    }

    // $.get(url), $.post(url), $.getJSON(url), $.ajax({ url, type })
    if (isName(owner, "$") || isName(owner, "jQuery")) {
      if (member in JQUERY_VERBS) {
        const url = urlText(first);
        return url === undefined ? undefined : { method: JQUERY_VERBS[member], url };
      }
      if (member === "ajax") {
        const url = propertyText(first, "url");
        return url === undefined ? undefined : { method: propertyText(first, "type") ?? propertyText(first, "method") ?? "GET", url };
      }
    }

    // request.open("GET", url)
    if (member === "open" && first && ts.isStringLiteralLike(first) && isHttpMethod(first.text)) {
      const url = urlText(second);
      return url === undefined ? undefined : { method: first.text.toUpperCase(), url };
    }
  }

  // axios({ url, method })
  if (isName(callee, "axios")) {
    const url = propertyText(first, "url");
    return url === undefined ? undefined : { method: propertyText(first, "method") ?? "GET", url };
  }

  return undefined;
}

function isName(node: ts.Node, name: string): boolean {
  return ts.isIdentifier(node) && node.text === name;
}

/** The string value of a property of an object literal, when it is written as a literal. */
function propertyText(node: ts.Expression | undefined, name: string): string | undefined {
  if (!node || !ts.isObjectLiteralExpression(node)) {
    return undefined;
  }
  for (const property of node.properties) {
    if (ts.isPropertyAssignment(property) && ts.isIdentifier(property.name) && property.name.text === name) {
      return urlText(property.initializer);
    }
  }
  return undefined;
}

/** The text of a URL expression, with `{}` standing for each part the script computes; undefined when nothing of it is written. */
function urlText(node: ts.Expression | undefined): string | undefined {
  if (!node) {
    return undefined;
  }
  if (ts.isParenthesizedExpression(node)) {
    return urlText(node.expression);
  }
  if (ts.isStringLiteralLike(node)) {
    return node.text;
  }
  if (ts.isTemplateExpression(node)) {
    return node.head.text + node.templateSpans.map((span) => `{}${span.literal.text}`).join("");
  }
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = urlText(node.left) ?? "{}";
    const right = urlText(node.right) ?? "{}";
    return left === "{}" && right === "{}" ? undefined : left + right;
  }
  return undefined;
}
