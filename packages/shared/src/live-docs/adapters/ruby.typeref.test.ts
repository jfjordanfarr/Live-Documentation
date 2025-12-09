import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { rubyAdapter } from "./ruby";

describe("rubyAdapter typeReferences", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "ruby-typeref-"));
  });

  afterEach(async () => {
    if (workspaceRoot) {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  it("extracts class inheritance as extends typeReference", async () => {
    const filePath = path.join(workspaceRoot, "child.rb");
    await fs.writeFile(
      filePath,
      `# frozen_string_literal: true

class Animal
  def speak; end
end

class Dog < Animal
  def bark; end
end
`.trimStart(),
      "utf8"
    );

    const analysis = await rubyAdapter.analyze({ absolutePath: filePath, workspaceRoot });
    expect(analysis).not.toBeNull();

    const dogClass = analysis!.symbols.find((s) => s.name === "Dog");
    expect(dogClass).toBeDefined();
    expect(dogClass?.typeReferences).toEqual([
      { name: "Animal", role: "extends" }
    ]);

    // Animal has no inheritance
    const animalClass = analysis!.symbols.find((s) => s.name === "Animal");
    expect(animalClass?.typeReferences).toBeUndefined();
  });

  it("extracts include/extend/prepend as implements typeReferences", async () => {
    const filePath = path.join(workspaceRoot, "mixed.rb");
    await fs.writeFile(
      filePath,
      `# frozen_string_literal: true

class Widget
  include Comparable
  extend Enumerable
  prepend Serializable

  def weight; end
end
`.trimStart(),
      "utf8"
    );

    const analysis = await rubyAdapter.analyze({ absolutePath: filePath, workspaceRoot });
    expect(analysis).not.toBeNull();

    const widgetClass = analysis!.symbols.find((s) => s.name === "Widget");
    expect(widgetClass).toBeDefined();
    expect(widgetClass?.typeReferences).toHaveLength(3);
    expect(widgetClass?.typeReferences).toContainEqual({ name: "Comparable", role: "implements" });
    expect(widgetClass?.typeReferences).toContainEqual({ name: "Enumerable", role: "implements" });
    expect(widgetClass?.typeReferences).toContainEqual({ name: "Serializable", role: "implements" });
  });

  it("combines inheritance with mixins", async () => {
    const filePath = path.join(workspaceRoot, "combined.rb");
    await fs.writeFile(
      filePath,
      `# frozen_string_literal: true

class Vehicle
end

class Car < Vehicle
  include Driveable
  extend Insurable

  def accelerate; end
end
`.trimStart(),
      "utf8"
    );

    const analysis = await rubyAdapter.analyze({ absolutePath: filePath, workspaceRoot });
    expect(analysis).not.toBeNull();

    const carClass = analysis!.symbols.find((s) => s.name === "Car");
    expect(carClass).toBeDefined();
    expect(carClass?.typeReferences).toHaveLength(3);
    expect(carClass?.typeReferences).toContainEqual({ name: "Vehicle", role: "extends" });
    expect(carClass?.typeReferences).toContainEqual({ name: "Driveable", role: "implements" });
    expect(carClass?.typeReferences).toContainEqual({ name: "Insurable", role: "implements" });
  });

  it("handles nested classes with separate typeReferences", async () => {
    const filePath = path.join(workspaceRoot, "nested.rb");
    await fs.writeFile(
      filePath,
      `# frozen_string_literal: true

module Container
  class Outer < Base
    include Loggable

    class Inner < Widget
      include Serializable
    end
  end
end
`.trimStart(),
      "utf8"
    );

    const analysis = await rubyAdapter.analyze({ absolutePath: filePath, workspaceRoot });
    expect(analysis).not.toBeNull();

    const outerClass = analysis!.symbols.find((s) => s.name === "Outer");
    expect(outerClass?.typeReferences).toContainEqual({ name: "Base", role: "extends" });
    expect(outerClass?.typeReferences).toContainEqual({ name: "Loggable", role: "implements" });

    const innerClass = analysis!.symbols.find((s) => s.name === "Inner");
    expect(innerClass?.typeReferences).toContainEqual({ name: "Widget", role: "extends" });
    expect(innerClass?.typeReferences).toContainEqual({ name: "Serializable", role: "implements" });
  });

  it("handles namespaced parent classes", async () => {
    const filePath = path.join(workspaceRoot, "namespaced.rb");
    await fs.writeFile(
      filePath,
      `# frozen_string_literal: true

class MyController < ApplicationController::Base
  include ActionController::Helpers

  def index; end
end
`.trimStart(),
      "utf8"
    );

    const analysis = await rubyAdapter.analyze({ absolutePath: filePath, workspaceRoot });
    expect(analysis).not.toBeNull();

    const controller = analysis!.symbols.find((s) => s.name === "MyController");
    expect(controller?.typeReferences).toContainEqual({ name: "ApplicationController::Base", role: "extends" });
    expect(controller?.typeReferences).toContainEqual({ name: "ActionController::Helpers", role: "implements" });
  });

  it("does not create typeReferences for modules without mixins", async () => {
    const filePath = path.join(workspaceRoot, "plain_module.rb");
    await fs.writeFile(
      filePath,
      `# frozen_string_literal: true

module Helper
  module_function

  def format(text)
    text.strip
  end
end
`.trimStart(),
      "utf8"
    );

    const analysis = await rubyAdapter.analyze({ absolutePath: filePath, workspaceRoot });
    expect(analysis).not.toBeNull();

    const helperModule = analysis!.symbols.find((s) => s.name === "Helper");
    expect(helperModule?.typeReferences).toBeUndefined();
  });
});
