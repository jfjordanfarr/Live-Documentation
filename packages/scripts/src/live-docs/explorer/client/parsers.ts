import type {
  ExplorerDependencyReference,
  ExplorerDetailPayload,
  ExplorerGraphPayload,
  ExplorerGraphStats,
  ExplorerLinkPayload,
  ExplorerNodePayload
} from "../shared/types";

interface UnknownRecord {
  [key: string]: unknown;
}

const isObject = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(item => typeof item === "string");

const isExplorerDependencyReference = (value: unknown): value is ExplorerDependencyReference => {
  if (!isObject(value)) {
    return false;
  }

  const record: UnknownRecord = value;
  return (
    typeof record.label === "string" &&
    typeof record.raw === "string" &&
    typeof record.kind === "string" &&
    typeof record.resolved === "boolean"
  );
};

const isExplorerNodePayload = (value: unknown): value is ExplorerNodePayload => {
  if (!isObject(value)) {
    return false;
  }

  const record: UnknownRecord = value;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.codePath === "string" &&
    typeof record.codeRelativePath === "string" &&
    typeof record.docPath === "string" &&
    typeof record.docRelativePath === "string" &&
    typeof record.archetype === "string" &&
    Array.isArray(record.dependencies) && record.dependencies.every(isExplorerDependencyReference) &&
    Array.isArray(record.dependents) && record.dependents.every(item => typeof item === "string") &&
    Array.isArray(record.missingDependencies) && record.missingDependencies.every(isExplorerDependencyReference) &&
    Array.isArray(record.publicSymbols) && record.publicSymbols.every(item => typeof item === "string")
  );
};

const isLinkEndpoint = (value: unknown): boolean => {
  if (typeof value === "string") {
    return true;
  }
  if (!isObject(value)) {
    return false;
  }
  return typeof value.id === "string";
};

const isExplorerLinkPayload = (value: unknown): value is ExplorerLinkPayload => {
  if (!isObject(value)) {
    return false;
  }

  const record: UnknownRecord = value;
  return (
    isLinkEndpoint(record.source) &&
    isLinkEndpoint(record.target) &&
    typeof record.kind === "string"
  );
};

const isExplorerGraphStats = (value: unknown): value is ExplorerGraphStats => {
  if (!isObject(value)) {
    return false;
  }

  const record: UnknownRecord = value;
  return (
    typeof record.nodes === "number" &&
    typeof record.links === "number" &&
    typeof record.missingDependencies === "number"
  );
};

function assertExplorerGraphPayload(value: unknown): asserts value is ExplorerGraphPayload {
  if (!isObject(value)) {
    throw new Error("Invalid explorer graph payload: expected object");
  }

  const record: UnknownRecord = value;
  if (!Array.isArray(record.nodes) || !record.nodes.every(isExplorerNodePayload)) {
    throw new Error("Invalid explorer graph payload: malformed nodes");
  }
  if (!Array.isArray(record.links) || !record.links.every(isExplorerLinkPayload)) {
    throw new Error("Invalid explorer graph payload: malformed links");
  }
  if (!isExplorerGraphStats(record.stats)) {
    throw new Error("Invalid explorer graph payload: malformed stats");
  }
}

function assertExplorerDetailPayload(value: unknown): asserts value is ExplorerDetailPayload {
  if (!isObject(value)) {
    throw new Error("Invalid explorer detail payload: expected object");
  }

  const record: UnknownRecord = value;
  if (typeof record.archetype !== "string" || typeof record.purpose !== "string") {
    throw new Error("Invalid explorer detail payload: missing metadata");
  }
  if (typeof record.docRelativePath !== "string" || typeof record.codeRelativePath !== "string") {
    throw new Error("Invalid explorer detail payload: missing paths");
  }
  if (!isStringArray(record.publicSymbols)) {
    throw new Error("Invalid explorer detail payload: malformed public symbols");
  }
  if (!Array.isArray(record.dependencies) || !record.dependencies.every(isExplorerDependencyReference)) {
    throw new Error("Invalid explorer detail payload: malformed dependencies");
  }
  if (!isStringArray(record.dependents)) {
    throw new Error("Invalid explorer detail payload: malformed dependents");
  }
  if (
    record.missingDependencies !== undefined &&
    (!Array.isArray(record.missingDependencies) ||
      !record.missingDependencies.every(isExplorerDependencyReference))
  ) {
    throw new Error("Invalid explorer detail payload: malformed missing dependencies");
  }
}

export const parseExplorerGraphPayload = (value: unknown): ExplorerGraphPayload => {
  assertExplorerGraphPayload(value);
  return value;
};

export const parseExplorerDetailPayload = (value: unknown): ExplorerDetailPayload => {
  assertExplorerDetailPayload(value);
  return value;
};
