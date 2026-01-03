import { exec } from "child_process";
import * as fs from "fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "http";
import * as path from "path";
import { URL } from "url";

import type { LiveDocumentationConfig } from "@live-documentation/shared/config/liveDocumentationConfig";

import { buildExplorerAssets } from "./buildAssets";
import { buildExplorerGraph, normalizeDocPath } from "./graph";
import { buildLocalMapData, buildTestCoverageMap } from "../shared/localMapBuilder";
import type { ExplorerDetailPayload, ExplorerGraphPayload, ExplorerLinkPayload, ExplorerNodePayload } from "../shared/types";

export interface ExplorerServerOptions {
    workspaceRoot: string;
    port?: number;
    openBrowser?: boolean;
    config?: LiveDocumentationConfig;
    logger?: Pick<Console, "log" | "error">;
}

export interface ExplorerServerInstance {
    port: number;
    stop: () => Promise<void>;
    reloadGraph: () => Promise<ExplorerGraphPayload>;
    getGraph: () => ExplorerGraphPayload;
}

interface InternalContext {
    graph: ExplorerGraphPayload;
    nodesByDocPath: Map<string, ExplorerNodePayload>;
    testCoverage: Map<string, string[]>;
    resolveLinkEndpoint: (endpoint: ExplorerLinkPayload["source"]) => string;
}

export async function startExplorerServer(options: ExplorerServerOptions): Promise<ExplorerServerInstance> {
    const { workspaceRoot } = options;
    const port = options.port ?? 3000;
    const logger = options.logger ?? console;

    const assets = await buildExplorerAssets({ workspaceRoot });
    
    const resolveLinkEndpoint = (endpoint: ExplorerLinkPayload["source"]): string => {
        if (typeof endpoint === "string") return endpoint;
        if (endpoint && typeof endpoint === "object" && "id" in endpoint) {
            return typeof endpoint.id === "string" ? endpoint.id : "";
        }
        return "";
    };
    
    const initialGraph = await buildExplorerGraph(workspaceRoot, options.config);
    const context: InternalContext = {
        graph: initialGraph,
        nodesByDocPath: new Map(),
        testCoverage: buildTestCoverageMap(initialGraph, resolveLinkEndpoint),
        resolveLinkEndpoint
    };
    refreshNodeLookup(context, workspaceRoot);

    logger.log(
        `Explorer graph ready: ${context.graph.stats.nodes} nodes, ${context.graph.stats.links} links, ${context.graph.stats.missingDependencies} missing dependencies.`
    );
    logger.log(`Explorer assets emitted to ${assets.outDir}`);

    const server = createServer((req, res) => {
        void handleRequest(req, res);
    });

    async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
        try {
            const requestUrl = new URL(req.url ?? "/", `http://localhost:${port}`);

            if (requestUrl.pathname === "/graph") {
                if (requestUrl.searchParams.get("refresh") === "1") {
                    await reloadGraph();
                }
                res.writeHead(200, {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store"
                });
                res.end(JSON.stringify(context.graph));
                return;
            }

            if (requestUrl.pathname.startsWith("/static/")) {
                await serveStaticAsset(requestUrl.pathname.slice("/static/".length), assets.outDir, res);
                return;
            }

            if (requestUrl.pathname === "/open") {
                handleOpen(requestUrl, workspaceRoot, res, logger);
                return;
            }

            if (requestUrl.pathname === "/details") {
                await handleDetails(requestUrl, workspaceRoot, context, res);
                return;
            }

            if (requestUrl.pathname === "/doc") {
                await handleDoc(requestUrl, workspaceRoot, res);
                return;
            }

            if (requestUrl.pathname === "/local-map") {
                await handleLocalMap(requestUrl, context, res);
                return;
            }

            res.writeHead(200, {
                "Content-Type": "text/html; charset=utf-8",
                "Cache-Control": "no-store"
            });
            res.end(assets.htmlTemplate);
        } catch (error) {
            logger.error("Explorer request handling failed", error);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal server error");
        }
    }

    await new Promise<void>((resolve, reject) => {
        server.once("error", reject);
        server.listen(port, resolve);
    });

    logger.log(`Explorer running at http://localhost:${port}`);

    if (options.openBrowser !== false) {
        const startCommand = process.platform === "win32" ? "start" : "open";
        exec(`${startCommand} http://localhost:${port}`);
    }

    const stop = async () =>
        new Promise<void>((resolve, reject) => {
            server.close(error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

    const reloadGraph = async () => {
        context.graph = await buildExplorerGraph(workspaceRoot, options.config);
        context.testCoverage = buildTestCoverageMap(context.graph, context.resolveLinkEndpoint);
        refreshNodeLookup(context, workspaceRoot);
        logger.log(
            `Explorer graph refreshed: ${context.graph.stats.nodes} nodes, ${context.graph.stats.links} links, ${context.graph.stats.missingDependencies} missing dependencies.`
        );
        return context.graph;
    };

    return {
        port,
        stop,
        reloadGraph,
        getGraph: () => context.graph
    };
}

async function serveStaticAsset(relativePath: string, outputDir: string, res: ServerResponse): Promise<void> {
    const cleanRelative = relativePath.replace(/\\/g, "/");
    const resolved = path.resolve(outputDir, cleanRelative);
    if (!resolved.startsWith(outputDir)) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Invalid asset path");
        return;
    }

    try {
        const content = await fs.readFile(resolved);
        res.writeHead(200, {
            "Content-Type": getMimeType(resolved),
            "Cache-Control": "no-store"
        });
        res.end(content);
    } catch {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
    }
}

function handleOpen(url: URL, workspaceRoot: string, res: ServerResponse, logger: Pick<Console, "log">): void {
    const codePathParam = url.searchParams.get("codePath");
    if (!codePathParam) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Missing codePath");
        return;
    }

    const absoluteCodePath = path.resolve(codePathParam);
    if (!isPathInsideWorkspace(workspaceRoot, absoluteCodePath)) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Invalid codePath");
        return;
    }

    logger.log(`Opening file: ${absoluteCodePath}`);
    const quoted = `"${absoluteCodePath.replace(/"/g, '\\"')}"`;
    const command = process.platform === "win32" ? `code ${quoted}` : `code ${quoted}`;
    exec(command);
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");
}

async function handleDetails(
    url: URL,
    workspaceRoot: string,
    context: InternalContext,
    res: ServerResponse
): Promise<void> {
    const docPathParam = url.searchParams.get("docPath");
    if (!docPathParam) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Missing docPath" }));
        return;
    }

    const absoluteDocPath = path.resolve(workspaceRoot, docPathParam);
    if (!isPathInsideWorkspace(workspaceRoot, absoluteDocPath)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid docPath" }));
        return;
    }

    const lookupKey = normalizeDocPath(workspaceRoot, absoluteDocPath);
    const node = context.nodesByDocPath.get(lookupKey);
    if (!node) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Node not found" }));
        return;
    }

    try {
        const content = await fs.readFile(absoluteDocPath, "utf8");
        const extracted = extractLiveDocSections(content);
        const payload: ExplorerDetailPayload = {
            archetype: node.archetype,
            purpose: extracted.purpose, // backward compatibility
            authored: extracted.authored,
            generatedAt: extracted.generatedAt,
            publicSymbols: node.publicSymbols,
            dependencies: node.dependencies,
            dependents: node.dependents,
            missingDependencies: node.missingDependencies,
            docRelativePath: node.docRelativePath,
            codeRelativePath: node.codeRelativePath,
            symbolDocumentation: node.symbolDocumentation
        };

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(payload));
    } catch {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to read doc" }));
    }
}

/**
 * Handle the /doc endpoint for raw markdown download.
 * Returns the raw markdown content of a Live Documentation file.
 * 
 * @example GET /doc?docPath=.mdmd/layer-4/packages/server/src/main.ts.mdmd.md
 */
async function handleDoc(
    url: URL,
    workspaceRoot: string,
    res: ServerResponse
): Promise<void> {
    const docPathParam = url.searchParams.get("docPath");
    if (!docPathParam) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Missing docPath parameter");
        return;
    }

    const absoluteDocPath = path.resolve(workspaceRoot, docPathParam);
    if (!isPathInsideWorkspace(workspaceRoot, absoluteDocPath)) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Invalid docPath");
        return;
    }

    try {
        const content = await fs.readFile(absoluteDocPath, "utf8");
        const filename = path.basename(absoluteDocPath);
        
        res.writeHead(200, {
            "Content-Type": "text/markdown; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`
        });
        res.end(content);
    } catch {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("File not found");
    }
}

/**
 * Extracted sections from a Live Documentation file.
 */
interface ExtractedLiveDoc {
    purpose: string;
    authored: string;
    generatedAt?: string;
}

/**
 * Extract sections from a Live Documentation markdown file.
 * Returns the full Authored section and the Generated At timestamp.
 */
function extractLiveDocSections(content: string): ExtractedLiveDoc {
    // Extract Purpose for backward compatibility
    const purposeMatch = content.match(/###\s+Purpose\s*\n([\s\S]*?)(?=###|##|$)/);
    const purpose = purposeMatch ? purposeMatch[1].trim() : "No purpose defined.";
    
    // Extract full Authored section - find the index positions and slice
    const authoredStart = content.indexOf("\n## Authored\n");
    const generatedStart = content.indexOf("\n## Generated\n");
    
    let authored = "";
    if (authoredStart !== -1) {
        const contentStart = authoredStart + "\n## Authored\n".length;
        const contentEnd = generatedStart !== -1 ? generatedStart : content.length;
        authored = content.slice(contentStart, contentEnd).trim();
    }
    
    // Extract Generated At from metadata
    const generatedAtMatch = content.match(/- Generated At:\s*(.+)$/m);
    const generatedAt = generatedAtMatch ? generatedAtMatch[1].trim() : undefined;
    
    return { purpose, authored, generatedAt };
}

/**
 * Handle the /local-map endpoint for headless JSON Local Map data.
 * 
 * @example GET /local-map?nodeId=packages/server/src/main.ts
 * @example GET /local-map?nodeId=packages/server/src/main.ts&pretty=1
 */
function handleLocalMap(
    url: URL,
    context: InternalContext,
    res: ServerResponse
): void {
    const nodeId = url.searchParams.get("nodeId");
    if (!nodeId) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Missing nodeId parameter" }));
        return;
    }

    const localMap = buildLocalMapData(context.graph, context.testCoverage, {
        focusNodeId: nodeId,
        includeExtendedSymbols: true,
        includeSymbolAnchors: true
    });

    if (!localMap) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: `Node not found: ${nodeId}` }));
        return;
    }

    const prettyPrint = url.searchParams.get("pretty") === "1";
    const json = prettyPrint
        ? JSON.stringify(localMap, null, 2)
        : JSON.stringify(localMap);

    res.writeHead(200, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
    });
    res.end(json);
}

function refreshNodeLookup(context: InternalContext, workspaceRoot: string): void {
    context.nodesByDocPath.clear();
    for (const node of context.graph.nodes) {
        context.nodesByDocPath.set(normalizeDocPath(workspaceRoot, node.docPath), node);
    }
}

function getMimeType(filePath: string): string {
    if (filePath.endsWith(".js")) {
        return "application/javascript";
    }
    if (filePath.endsWith(".css")) {
        return "text/css";
    }
    if (filePath.endsWith(".map")) {
        return "application/json";
    }
    return "application/octet-stream";
}

function isPathInsideWorkspace(workspaceRoot: string, candidate: string): boolean {
    const resolvedRoot = path.resolve(workspaceRoot);
    const resolvedCandidate = path.resolve(candidate);
    const relative = path.relative(resolvedRoot, resolvedCandidate);
    return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}
