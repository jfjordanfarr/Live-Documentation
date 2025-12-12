import fs from "node:fs/promises";
import path from "node:path";

import type { ExplorerServerInstance, ExplorerServerOptions } from "@live-documentation/scripts";
import { startExplorerServer } from "@live-documentation/scripts";
import {
    DEFAULT_LIVE_DOCUMENTATION_CONFIG,
    normalizeLiveDocumentationConfig,
    type LiveDocumentationConfigInput
} from "@live-documentation/shared/config/liveDocumentationConfig";

const DEFAULT_PORT = 3000;

interface ParsedArgs {
    port?: number;
    configPath?: string;
    root?: string;
    baseLayer?: string;
    extension?: string;
}

function parseArgs(argv: string[]): ParsedArgs {
    const parsed: ParsedArgs = {};
    for (let index = 0; index < argv.length; index += 1) {
        const current = argv[index];
        if (current === "--port") {
            const raw = argv[++index];
            const port = raw ? Number.parseInt(raw, 10) : Number.NaN;
            if (!Number.isFinite(port) || port <= 0) {
                throw new Error("--port must be a positive integer.");
            }
            parsed.port = port;
        } else if (current === "--config") {
            parsed.configPath = argv[++index];
        } else if (current === "--root") {
            parsed.root = argv[++index];
        } else if (current === "--base-layer") {
            parsed.baseLayer = argv[++index];
        } else if (current === "--extension") {
            parsed.extension = argv[++index];
        } else if (current?.startsWith("-")) {
            throw new Error(`Unknown option: ${current}`);
        }
    }
    return parsed;
}

async function readConfigFile(configPath: string): Promise<LiveDocumentationConfigInput> {
    const resolved = path.resolve(configPath);
    const raw = await fs.readFile(resolved, "utf8");
    return JSON.parse(raw) as LiveDocumentationConfigInput;
}

async function main(): Promise<void> {
    const workspaceRoot = process.cwd();
    const args = parseArgs(process.argv.slice(2));

    let configInput: LiveDocumentationConfigInput = {};
    if (args.configPath) {
        configInput = await readConfigFile(args.configPath);
    }
    if (args.root) {
        configInput.root = args.root;
    }
    if (args.baseLayer) {
        configInput.baseLayer = args.baseLayer;
    }
    if (args.extension) {
        configInput.extension = args.extension;
    }

    const config = normalizeLiveDocumentationConfig({
        ...DEFAULT_LIVE_DOCUMENTATION_CONFIG,
        ...configInput
    });

    const options: ExplorerServerOptions = {
        workspaceRoot,
        port: args.port ?? DEFAULT_PORT,
        config
    };
    const server = await startExplorerServer(options);
    registerSignalHandlers(server);
}

function registerSignalHandlers(server: ExplorerServerInstance): void {
    const shutdown = async () => {
        try {
            await server.stop();
        } catch (error) {
            console.error("Explorer shutdown failed", error);
        } finally {
            process.exit(0);
        }
    };

    ["SIGINT", "SIGTERM"].forEach(signal => {
        process.on(signal, () => {
            void shutdown();
        });
    });
}

main().catch(error => {
    console.error("Explorer failed to start", error);
    process.exitCode = 1;
});
