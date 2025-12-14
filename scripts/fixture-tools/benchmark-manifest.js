"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BENCHMARK_MANIFEST_SEGMENTS = void 0;
exports.loadBenchmarkManifest = loadBenchmarkManifest;
exports.computeIntegrityDigest = computeIntegrityDigest;
exports.normalizeRelative = normalizeRelative;
const glob_1 = require("glob");
const node_crypto_1 = require("node:crypto");
const node_fs_1 = require("node:fs");
const path = require("node:path");
exports.BENCHMARK_MANIFEST_SEGMENTS = [
    "tests",
    "integration",
    "benchmarks",
    "fixtures",
    "fixtures.manifest.json"
];
async function loadBenchmarkManifest(repoRoot) {
    const manifestPath = path.join(repoRoot, ...exports.BENCHMARK_MANIFEST_SEGMENTS);
    const raw = await node_fs_1.promises.readFile(manifestPath, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
        return parsed;
    }
    if (parsed && Array.isArray(parsed.fixtures)) {
        return parsed.fixtures;
    }
    throw new Error("Benchmark fixture manifest must be an array");
}
async function computeIntegrityDigest(repoRoot, fixture, workspaceRootOverride) {
    const spec = fixture.integrity;
    if (!spec) {
        throw new Error(`Fixture ${fixture.id} does not declare integrity metadata.`);
    }
    if (spec.algorithm !== "sha256") {
        throw new Error(`Unsupported integrity algorithm '${spec.algorithm}' for fixture ${fixture.id}.`);
    }
    const fixtureRoot = workspaceRootOverride
        ? path.resolve(workspaceRootOverride)
        : path.join(repoRoot, "tests", "integration", "benchmarks", "fixtures", fixture.path);
    const basePath = spec.basePath ? normalizeRelative(spec.basePath) : ".";
    const normalizedPaths = await resolveIntegrityPaths(fixtureRoot, basePath, spec);
    const fileHashes = [];
    for (const relPath of normalizedPaths) {
        const filePath = path.join(fixtureRoot, basePath, relPath);
        let content = await node_fs_1.promises.readFile(filePath);
        // Normalize line endings to LF for platform-independent hashing
        content = Buffer.from(content.toString("utf8").replace(/\r\n/g, "\n"));
        const digest = (0, node_crypto_1.createHash)("sha256").update(content).digest("hex");
        fileHashes.push({ path: relPath, hash: digest });
    }
    const aggregate = (0, node_crypto_1.createHash)("sha256");
    const sorted = [...fileHashes].sort((a, b) => a.path.localeCompare(b.path));
    for (const { path: relPath, hash } of sorted) {
        aggregate.update(`${relPath}:${hash}\n`);
    }
    if (typeof spec.fileCount === "number" && spec.fileCount !== fileHashes.length) {
        throw new Error(`Integrity file count mismatch for fixture ${fixture.id}. Expected ${spec.fileCount} but resolved ${fileHashes.length}.`);
    }
    return {
        algorithm: spec.algorithm,
        rootHash: aggregate.digest("hex"),
        fileCount: fileHashes.length,
        files: fileHashes
    };
}
function normalizeRelative(candidate) {
    return candidate.replace(/\\/g, "/");
}
function normalizePaths(paths) {
    const seen = new Set();
    return paths.map(pathCandidate => {
        const normalized = normalizeRelative(pathCandidate);
        if (seen.has(normalized)) {
            throw new Error(`Duplicate integrity path detected: ${normalized}`);
        }
        seen.add(normalized);
        return normalized;
    });
}
async function resolveIntegrityPaths(fixtureRoot, basePath, spec) {
    if (spec.fileSet) {
        const include = spec.fileSet.include.map(pattern => normalizeRelative(pattern));
        const exclude = (spec.fileSet.exclude ?? []).map(pattern => normalizeRelative(pattern));
        const cwd = path.join(fixtureRoot, basePath);
        const matches = await (0, glob_1.glob)(include, {
            cwd,
            ignore: exclude,
            nodir: true,
            dot: false,
            windowsPathsNoEscape: true
        });
        return normalizePaths(matches.sort((a, b) => a.localeCompare(b)));
    }
    if (spec.paths && spec.paths.length > 0) {
        return normalizePaths(spec.paths);
    }
    throw new Error(`Integrity spec for fixture does not declare fileSet or explicit paths.`);
}
