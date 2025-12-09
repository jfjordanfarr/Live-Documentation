import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { pythonAdapter } from "./python";

describe("pythonAdapter typeReferences", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "python-typeref-"));
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  it("extracts single base class as typeReference", async () => {
    const absolutePath = path.join(workspaceRoot, "child.py");
    await fs.writeFile(
      absolutePath,
      `class Animal:
    def speak(self):
        pass

class Dog(Animal):
    def bark(self):
        pass
`,
      "utf8"
    );

    const result = await pythonAdapter.analyze({ absolutePath, workspaceRoot });
    expect(result?.symbols).toBeDefined();

    const dogClass = result!.symbols.find((s) => s.name === "Dog");
    expect(dogClass).toBeDefined();
    expect(dogClass?.typeReferences).toEqual([
      { name: "Animal", role: "extends" }
    ]);

    // Animal has no base class
    const animalClass = result!.symbols.find((s) => s.name === "Animal");
    expect(animalClass?.typeReferences).toBeUndefined();
  });

  it("extracts multiple base classes (mixins)", async () => {
    const absolutePath = path.join(workspaceRoot, "mixed.py");
    await fs.writeFile(
      absolutePath,
      `class Loggable:
    def log(self):
        pass

class Serializable:
    def serialize(self):
        pass

class Widget(Loggable, Serializable):
    def render(self):
        pass
`,
      "utf8"
    );

    const result = await pythonAdapter.analyze({ absolutePath, workspaceRoot });
    expect(result?.symbols).toBeDefined();

    const widget = result!.symbols.find((s) => s.name === "Widget");
    expect(widget).toBeDefined();
    expect(widget?.typeReferences).toHaveLength(2);
    expect(widget?.typeReferences).toContainEqual({ name: "Loggable", role: "extends" });
    expect(widget?.typeReferences).toContainEqual({ name: "Serializable", role: "extends" });
  });

  it("handles ABC and abstract classes", async () => {
    const absolutePath = path.join(workspaceRoot, "abstract.py");
    await fs.writeFile(
      absolutePath,
      `from abc import ABC, abstractmethod

class Repository(ABC):
    @abstractmethod
    def save(self):
        pass

class UserRepository(Repository):
    def save(self):
        print("saving user")
`,
      "utf8"
    );

    const result = await pythonAdapter.analyze({ absolutePath, workspaceRoot });
    expect(result?.symbols).toBeDefined();

    const repo = result!.symbols.find((s) => s.name === "Repository");
    expect(repo?.typeReferences).toContainEqual({ name: "ABC", role: "extends" });

    const userRepo = result!.symbols.find((s) => s.name === "UserRepository");
    expect(userRepo?.typeReferences).toContainEqual({ name: "Repository", role: "extends" });
  });

  it("handles generic base classes", async () => {
    const absolutePath = path.join(workspaceRoot, "generic.py");
    await fs.writeFile(
      absolutePath,
      `from typing import Generic, TypeVar

T = TypeVar('T')

class Container(Generic[T]):
    def __init__(self):
        self.items = []

class StringContainer(Container[str]):
    pass
`,
      "utf8"
    );

    const result = await pythonAdapter.analyze({ absolutePath, workspaceRoot });
    expect(result?.symbols).toBeDefined();

    const container = result!.symbols.find((s) => s.name === "Container");
    expect(container?.typeReferences).toContainEqual({ name: "Generic", role: "extends" });

    const strContainer = result!.symbols.find((s) => s.name === "StringContainer");
    expect(strContainer?.typeReferences).toContainEqual({ name: "Container", role: "extends" });
  });

  it("ignores metaclass keyword argument", async () => {
    const absolutePath = path.join(workspaceRoot, "meta.py");
    await fs.writeFile(
      absolutePath,
      `class ABCMeta(type):
    pass

class Base(metaclass=ABCMeta):
    pass
`,
      "utf8"
    );

    const result = await pythonAdapter.analyze({ absolutePath, workspaceRoot });
    expect(result?.symbols).toBeDefined();

    const base = result!.symbols.find((s) => s.name === "Base");
    // metaclass=ABCMeta should be filtered out
    expect(base?.typeReferences).toBeUndefined();
  });

  it("handles dataclass inheritance", async () => {
    const absolutePath = path.join(workspaceRoot, "dataclass.py");
    await fs.writeFile(
      absolutePath,
      `from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

@dataclass
class Point3D(Point):
    z: float
`,
      "utf8"
    );

    const result = await pythonAdapter.analyze({ absolutePath, workspaceRoot });
    expect(result?.symbols).toBeDefined();

    const point3d = result!.symbols.find((s) => s.name === "Point3D");
    expect(point3d?.typeReferences).toContainEqual({ name: "Point", role: "extends" });
  });
});
