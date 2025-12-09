import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { rustAdapter } from "./rust";

describe("rustAdapter typeReferences", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "rust-typeref-"));
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  it("extracts trait implementation as implements typeReference", async () => {
    const absolutePath = path.join(workspaceRoot, "widget.rs");
    await fs.writeFile(
      absolutePath,
      `pub struct Widget {
    id: u32,
}

pub trait Drawable {
    fn draw(&self);
}

impl Drawable for Widget {
    fn draw(&self) {
        println!("Drawing widget {}", self.id);
    }
}
`,
      "utf8"
    );

    const result = await rustAdapter.analyze({ absolutePath, workspaceRoot });
    expect(result?.symbols).toBeDefined();

    const widgetStruct = result!.symbols.find((s) => s.name === "Widget");
    expect(widgetStruct).toBeDefined();
    expect(widgetStruct?.typeReferences).toEqual([
      { name: "Drawable", role: "implements" }
    ]);

    // Trait definition has no typeReferences
    const drawableTrait = result!.symbols.find((s) => s.name === "Drawable");
    expect(drawableTrait?.typeReferences).toBeUndefined();
  });

  it("extracts multiple trait implementations", async () => {
    const absolutePath = path.join(workspaceRoot, "multi.rs");
    await fs.writeFile(
      absolutePath,
      `pub struct Node {
    value: i32,
}

pub trait Comparable {
    fn compare(&self, other: &Self) -> i32;
}

pub trait Hashable {
    fn hash(&self) -> u64;
}

pub trait Serializable {
    fn serialize(&self) -> String;
}

impl Comparable for Node {
    fn compare(&self, other: &Self) -> i32 {
        self.value - other.value
    }
}

impl Hashable for Node {
    fn hash(&self) -> u64 {
        self.value as u64
    }
}

impl Serializable for Node {
    fn serialize(&self) -> String {
        format!("{}", self.value)
    }
}
`,
      "utf8"
    );

    const result = await rustAdapter.analyze({ absolutePath, workspaceRoot });
    expect(result?.symbols).toBeDefined();

    const nodeStruct = result!.symbols.find((s) => s.name === "Node");
    expect(nodeStruct).toBeDefined();
    expect(nodeStruct?.typeReferences).toHaveLength(3);
    expect(nodeStruct?.typeReferences).toContainEqual({ name: "Comparable", role: "implements" });
    expect(nodeStruct?.typeReferences).toContainEqual({ name: "Hashable", role: "implements" });
    expect(nodeStruct?.typeReferences).toContainEqual({ name: "Serializable", role: "implements" });
  });

  it("handles generic trait implementations", async () => {
    const absolutePath = path.join(workspaceRoot, "generic.rs");
    await fs.writeFile(
      absolutePath,
      `pub struct Container<T> {
    items: Vec<T>,
}

pub trait Iterable<T> {
    fn iter(&self) -> &[T];
}

impl<T> Iterable<T> for Container<T> {
    fn iter(&self) -> &[T] {
        &self.items
    }
}
`,
      "utf8"
    );

    const result = await rustAdapter.analyze({ absolutePath, workspaceRoot });
    expect(result?.symbols).toBeDefined();

    // Container<T> should have Iterable<T> as implements
    const container = result!.symbols.find((s) => s.name === "Container");
    expect(container).toBeDefined();
    expect(container?.typeReferences).toContainEqual({ name: "Iterable", role: "implements" });
  });

  it("handles enum trait implementations", async () => {
    const absolutePath = path.join(workspaceRoot, "enum_impl.rs");
    await fs.writeFile(
      absolutePath,
      `pub enum Status {
    Active,
    Inactive,
    Pending,
}

pub trait Displayable {
    fn display(&self) -> &str;
}

impl Displayable for Status {
    fn display(&self) -> &str {
        match self {
            Status::Active => "Active",
            Status::Inactive => "Inactive",
            Status::Pending => "Pending",
        }
    }
}
`,
      "utf8"
    );

    const result = await rustAdapter.analyze({ absolutePath, workspaceRoot });
    expect(result?.symbols).toBeDefined();

    const statusEnum = result!.symbols.find((s) => s.name === "Status");
    expect(statusEnum).toBeDefined();
    expect(statusEnum?.typeReferences).toEqual([
      { name: "Displayable", role: "implements" }
    ]);
  });

  it("does not confuse inherent impl blocks with trait impls", async () => {
    const absolutePath = path.join(workspaceRoot, "inherent.rs");
    await fs.writeFile(
      absolutePath,
      `pub struct Calculator {
    value: f64,
}

impl Calculator {
    pub fn new() -> Self {
        Calculator { value: 0.0 }
    }

    pub fn add(&mut self, x: f64) {
        self.value += x;
    }
}
`,
      "utf8"
    );

    const result = await rustAdapter.analyze({ absolutePath, workspaceRoot });
    expect(result?.symbols).toBeDefined();

    // Calculator has only inherent impl, no trait impl
    const calculator = result!.symbols.find((s) => s.name === "Calculator");
    expect(calculator).toBeDefined();
    expect(calculator?.typeReferences).toBeUndefined();
  });

  it("handles namespaced trait implementations", async () => {
    const absolutePath = path.join(workspaceRoot, "namespaced.rs");
    await fs.writeFile(
      absolutePath,
      `pub struct MyError {
    message: String,
}

impl std::fmt::Display for MyError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl std::error::Error for MyError {}
`,
      "utf8"
    );

    const result = await rustAdapter.analyze({ absolutePath, workspaceRoot });
    expect(result?.symbols).toBeDefined();

    const myError = result!.symbols.find((s) => s.name === "MyError");
    expect(myError).toBeDefined();
    expect(myError?.typeReferences).toHaveLength(2);
    expect(myError?.typeReferences).toContainEqual({ name: "std::fmt::Display", role: "implements" });
    expect(myError?.typeReferences).toContainEqual({ name: "std::error::Error", role: "implements" });
  });

  it("handles where clause trait bounds separately from impl", async () => {
    const absolutePath = path.join(workspaceRoot, "where_clause.rs");
    await fs.writeFile(
      absolutePath,
      `pub struct Wrapper<T> {
    inner: T,
}

pub trait Printable {
    fn print(&self);
}

impl<T> Printable for Wrapper<T>
where
    T: std::fmt::Debug,
{
    fn print(&self) {
        println!("{:?}", self.inner);
    }
}
`,
      "utf8"
    );

    const result = await rustAdapter.analyze({ absolutePath, workspaceRoot });
    expect(result?.symbols).toBeDefined();

    const wrapper = result!.symbols.find((s) => s.name === "Wrapper");
    expect(wrapper).toBeDefined();
    // Should capture trait impl, where clause bounds are parameter constraints not type references
    expect(wrapper?.typeReferences).toContainEqual({ name: "Printable", role: "implements" });
  });
});
