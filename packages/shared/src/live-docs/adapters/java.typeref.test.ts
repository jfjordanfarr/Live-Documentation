import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { javaAdapter } from "./java";

describe("javaAdapter typeReferences", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "java-typeref-"));
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  it("extracts class extends as typeReference", async () => {
    const absolutePath = path.join(workspaceRoot, "Child.java");
    await fs.writeFile(
      absolutePath,
      `public class Parent {
    public void speak() {}
}

public class Child extends Parent {
    public void play() {}
}
`,
      "utf8"
    );

    const result = await javaAdapter.analyze({ absolutePath, workspaceRoot });
    expect(result?.symbols).toBeDefined();

    const childClass = result!.symbols.find((s) => s.name === "Child");
    expect(childClass).toBeDefined();
    expect(childClass?.typeReferences).toEqual([
      { name: "Parent", role: "extends" }
    ]);

    // Parent has no inheritance
    const parentClass = result!.symbols.find((s) => s.name === "Parent");
    expect(parentClass?.typeReferences).toBeUndefined();
  });

  it("extracts implements as typeReferences", async () => {
    const absolutePath = path.join(workspaceRoot, "Service.java");
    await fs.writeFile(
      absolutePath,
      `public interface Repository {
    void save();
}

public interface Auditable {
    void audit();
}

public class UserService implements Repository, Auditable {
    public void save() {}
    public void audit() {}
}
`,
      "utf8"
    );

    const result = await javaAdapter.analyze({ absolutePath, workspaceRoot });
    expect(result?.symbols).toBeDefined();

    const service = result!.symbols.find((s) => s.name === "UserService");
    expect(service).toBeDefined();
    expect(service?.typeReferences).toHaveLength(2);
    expect(service?.typeReferences).toContainEqual({ name: "Repository", role: "implements" });
    expect(service?.typeReferences).toContainEqual({ name: "Auditable", role: "implements" });
  });

  it("extracts both extends and implements", async () => {
    const absolutePath = path.join(workspaceRoot, "Widget.java");
    await fs.writeFile(
      absolutePath,
      `public abstract class Component {
}

public interface Drawable {
    void draw();
}

public interface Clickable {
    void onClick();
}

public class Widget extends Component implements Drawable, Clickable {
    public void draw() {}
    public void onClick() {}
}
`,
      "utf8"
    );

    const result = await javaAdapter.analyze({ absolutePath, workspaceRoot });
    expect(result?.symbols).toBeDefined();

    const widget = result!.symbols.find((s) => s.name === "Widget");
    expect(widget).toBeDefined();
    expect(widget?.typeReferences).toHaveLength(3);
    expect(widget?.typeReferences).toContainEqual({ name: "Component", role: "extends" });
    expect(widget?.typeReferences).toContainEqual({ name: "Drawable", role: "implements" });
    expect(widget?.typeReferences).toContainEqual({ name: "Clickable", role: "implements" });
  });

  it("handles generic type parameters in inheritance", async () => {
    const absolutePath = path.join(workspaceRoot, "Container.java");
    await fs.writeFile(
      absolutePath,
      `public interface List<T> {
    void add(T item);
}

public class ArrayList<T> implements List<T> {
    public void add(T item) {}
}
`,
      "utf8"
    );

    const result = await javaAdapter.analyze({ absolutePath, workspaceRoot });
    expect(result?.symbols).toBeDefined();

    const arrayList = result!.symbols.find((s) => s.name === "ArrayList");
    expect(arrayList).toBeDefined();
    // Should strip generic params and just capture "List"
    expect(arrayList?.typeReferences).toContainEqual({ name: "List", role: "implements" });
  });

  it("handles interface extending multiple interfaces", async () => {
    const absolutePath = path.join(workspaceRoot, "Combined.java");
    await fs.writeFile(
      absolutePath,
      `public interface Readable {
    String read();
}

public interface Writable {
    void write(String data);
}

public interface ReadWritable extends Readable, Writable {
}
`,
      "utf8"
    );

    const result = await javaAdapter.analyze({ absolutePath, workspaceRoot });
    expect(result?.symbols).toBeDefined();

    const combined = result!.symbols.find((s) => s.name === "ReadWritable");
    expect(combined).toBeDefined();
    expect(combined?.typeReferences).toHaveLength(2);
    expect(combined?.typeReferences).toContainEqual({ name: "Readable", role: "extends" });
    expect(combined?.typeReferences).toContainEqual({ name: "Writable", role: "extends" });
  });
});
