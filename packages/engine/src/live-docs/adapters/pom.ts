/**
 * Maven project files (`pom.xml`): the artifact a project names, what it
 * stands on, and the class its build starts.
 *
 * @remarks
 * The artifact is `groupId:artifactId`, the groupId taken from `<parent>`
 * when the project does not state its own. The dependencies are the
 * `<parent>`, linked to the parent's `pom.xml` at its `<relativePath>`
 * (`../pom.xml` unless written; an empty one means the repository) when the
 * workspace holds it and external as `groupId:artifactId@version` otherwise,
 * and each `<dependency>` of the project's own `<dependencies>`, linked to the
 * workspace `pom.xml` that publishes `groupId:artifactId` or external. A
 * `${property}` is resolved from `<properties>` and the project's own
 * coordinates where it can be, and kept as written otherwise. Not read: the
 * `<dependencyManagement>` section, which settles versions and adds nothing
 * the project stands on (a dependency whose version it settles is written
 * without one); plugins and their dependencies; dependencies inside
 * `<profiles>`, which hold only when a profile is active; and `<modules>`,
 * which say what a parent contains, not what it stands on.
 *
 * The main class a build names is a command by the artifactId, since the jar
 * built starts it, on the class's `.java` file under the source folder
 * (`<sourceDirectory>`, `src/main/java` unless written). It is read from
 * `exec-maven-plugin`'s, `maven-jar-plugin`'s, `maven-assembly-plugin`'s,
 * `maven-shade-plugin`'s and `spring-boot-maven-plugin`'s `<mainClass>` or
 * `<Main-Class>`, configured on the plugin or one of its executions under
 * `<build><plugins>`, and from the `<start-class>` property; several that
 * agree declare one entry. The document is read by {@link readXmlElements},
 * a reader of elements and their text that needs no XML library.
 *
 * @module
 */
import { promises as fs } from "node:fs";
import path from "node:path";

import type { DeclaredEntry, SourceAnalysisResult } from "../coreTypes";
import type { LanguageAdapter } from "./index";
import { ManifestDependencies, manifestContext, packageSymbols, publishedName, sortDeclared, workspaceFile, type ManifestContext } from "./manifest";

const POM_XML = "pom.xml";

// ============================================================================
// Elements
// ============================================================================

/** An element of an XML document: its local name, its children, and the text directly inside it. */
export interface XmlElement {
  name: string;
  children: XmlElement[];
  text: string;
}

const ENTITIES: Record<string, string> = { lt: "<", gt: ">", amp: "&", quot: "\"", apos: "'" };

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/giu, (whole, entity: string) => {
    if (entity.startsWith("#x") || entity.startsWith("#X")) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    return ENTITIES[entity] ?? whole;
  });
}

/**
 * Reads an XML document into its elements: tags, text and CDATA kept;
 * comments, processing instructions and the doctype passed over; attributes
 * and namespace prefixes dropped, since a POM carries its facts in elements.
 * A close tag closes the nearest open element of its name, so that a stray
 * one does not unbalance the rest. Returns a document element whose children
 * are the root elements.
 */
export function readXmlElements(text: string): XmlElement {
  const document: XmlElement = { name: "", children: [], text: "" };
  const open: XmlElement[] = [document];
  let index = 0;
  const appendText = (value: string): void => {
    open[open.length - 1].text += value;
  };
  while (index < text.length) {
    const lt = text.indexOf("<", index);
    if (lt === -1) {
      appendText(decodeEntities(text.slice(index)));
      break;
    }
    appendText(decodeEntities(text.slice(index, lt)));
    if (text.startsWith("<!--", lt)) {
      const end = text.indexOf("-->", lt + 4);
      index = end === -1 ? text.length : end + 3;
    } else if (text.startsWith("<![CDATA[", lt)) {
      const end = text.indexOf("]]>", lt + 9);
      appendText(text.slice(lt + 9, end === -1 ? text.length : end));
      index = end === -1 ? text.length : end + 3;
    } else if (text.startsWith("<?", lt)) {
      const end = text.indexOf("?>", lt + 2);
      index = end === -1 ? text.length : end + 2;
    } else if (text.startsWith("<!", lt)) {
      index = endOfDeclaration(text, lt + 2);
    } else {
      const end = endOfTag(text, lt + 1);
      const body = text.slice(lt + 1, end - 1);
      index = end;
      const closing = body.startsWith("/");
      const selfClosing = body.endsWith("/");
      const name = localName(/^\/?\s*([^\s/>]+)/u.exec(body)?.[1] ?? "");
      if (!name) continue;
      if (closing) {
        const at = open.map((element) => element.name).lastIndexOf(name);
        if (at > 0) open.length = at;
      } else {
        const element: XmlElement = { name, children: [], text: "" };
        open[open.length - 1].children.push(element);
        if (!selfClosing) open.push(element);
      }
    }
  }
  return document;
}

/** The index just past a tag that opened before `start`, quoted attribute values passed over. */
function endOfTag(text: string, start: number): number {
  let quote: string | undefined;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (quote) {
      if (char === quote) quote = undefined;
    } else if (char === "\"" || char === "'") {
      quote = char;
    } else if (char === ">") {
      return index + 1;
    }
  }
  return text.length;
}

/** The index just past a `<!...>` declaration, an internal subset in brackets passed over. */
function endOfDeclaration(text: string, start: number): number {
  let depth = 0;
  for (let index = start; index < text.length; index += 1) {
    if (text[index] === "[") depth += 1;
    else if (text[index] === "]") depth -= 1;
    else if (text[index] === ">" && depth <= 0) return index + 1;
  }
  return text.length;
}

function localName(name: string): string {
  return name.slice(name.indexOf(":") + 1);
}

/** The first child element at the path of names below `element`. */
export function childAt(element: XmlElement | undefined, ...names: string[]): XmlElement | undefined {
  let current = element;
  for (const name of names) {
    current = current?.children.find((child) => child.name === name);
  }
  return current;
}

/** Every element at the path of names below `element`. */
export function childrenAt(element: XmlElement | undefined, ...names: string[]): XmlElement[] {
  let current = element ? [element] : [];
  for (const name of names) {
    current = current.flatMap((parent) => parent.children.filter((child) => child.name === name));
  }
  return current;
}

/** The trimmed text of the element at the path, or `undefined` when there is none or it is empty. */
export function textAt(element: XmlElement | undefined, ...names: string[]): string | undefined {
  const text = childAt(element, ...names)?.text.trim();
  return text ? text : undefined;
}

/** Every element below `element`, at any depth, named one of `names`. */
function descendantsNamed(element: XmlElement, names: ReadonlySet<string>): XmlElement[] {
  return element.children.flatMap((child) => [...(names.has(child.name) ? [child] : []), ...descendantsNamed(child, names)]);
}

// ============================================================================
// The project
// ============================================================================

/** The plugins whose configuration names the class the build starts. */
const MAIN_CLASS_PLUGINS: ReadonlySet<string> = new Set(["exec-maven-plugin", "maven-jar-plugin", "maven-assembly-plugin", "maven-shade-plugin", "spring-boot-maven-plugin"]);
const MAIN_CLASS_ELEMENTS: ReadonlySet<string> = new Set(["mainClass", "Main-Class"]);

/** Resolves `${name}` from the properties, repeatedly for a property that names another, leaving one it cannot resolve as written. */
function resolver(properties: Map<string, string>): (value: string | undefined) => string | undefined {
  return (value) => {
    if (value === undefined) return undefined;
    let resolved = value;
    for (let pass = 0; pass < 10 && /\$\{[^}]+\}/u.test(resolved); pass += 1) {
      const next = resolved.replace(/\$\{([^}]+)\}/gu, (whole, name: string) => properties.get(name) ?? whole);
      if (next === resolved) break;
      resolved = next;
    }
    return resolved;
  };
}

/** Language adapter for `pom.xml`: the artifact as a symbol, its parent and dependencies, and the main class its build starts. */
export const pomAdapter: LanguageAdapter = {
  id:         "maven-pom",
  extensions: [],
  fileNames:  [POM_XML],
  async analyze(input): Promise<SourceAnalysisResult | null> {
    const project = childAt(readXmlElements(await fs.readFile(input.absolutePath, "utf8")), "project");
    if (!project) return { symbols: [], dependencies: [] };
    const context = manifestContext(input);
    const directory = path.dirname(input.absolutePath);
    const parent = childAt(project, "parent");

    const properties = new Map<string, string>();
    for (const property of childAt(project, "properties")?.children ?? []) {
      properties.set(property.name, property.text.trim());
    }
    const coordinates: Array<[string, string | undefined]> = [
      ["project.groupId", textAt(project, "groupId") ?? textAt(parent, "groupId")],
      ["project.artifactId", textAt(project, "artifactId")],
      ["project.version", textAt(project, "version") ?? textAt(parent, "version")],
      ["project.parent.groupId", textAt(parent, "groupId")],
      ["project.parent.artifactId", textAt(parent, "artifactId")],
      ["project.parent.version", textAt(parent, "version")],
      ["project.basedir", directory],
      ["basedir", directory]
    ];
    for (const [name, value] of coordinates) {
      if (value !== undefined) properties.set(name, value);
    }
    const resolve = resolver(properties);
    const groupId = resolve(properties.get("project.groupId"));
    const artifactId = resolve(properties.get("project.artifactId"));

    const dependencies = new ManifestDependencies();
    if (parent) {
      const coordinate = `${resolve(textAt(parent, "groupId")) ?? ""}:${resolve(textAt(parent, "artifactId")) ?? ""}`;
      const relativePath = childAt(parent, "relativePath");
      const written = relativePath ? relativePath.text.trim() : "../pom.xml";
      const target = written ? path.resolve(directory, written.replace(/\\/gu, "/")) : undefined;
      const linked = target ? workspaceFile(path.extname(target) ? target : path.join(target, POM_XML), context) : undefined;
      if (linked) {
        dependencies.link(linked, publishedName(linked, coordinate, context));
      } else {
        dependencies.externalPackage(coordinate, resolve(textAt(parent, "version")));
      }
    }
    for (const dependency of childrenAt(project, "dependencies", "dependency")) {
      const coordinate = `${resolve(textAt(dependency, "groupId")) ?? ""}:${resolve(textAt(dependency, "artifactId")) ?? ""}`;
      dependencies.byName(coordinate, resolve(textAt(dependency, "version")), POM_XML, context);
    }

    const declares = artifactId ? mainClassEntries(project, artifactId, properties, resolve, directory, context) : [];
    const symbols = packageSymbols(groupId && artifactId ? `${groupId}:${artifactId}` : undefined);
    return declares.length > 0 ? { symbols, dependencies: dependencies.entries(), declares } : { symbols, dependencies: dependencies.entries() };
  }
};

/** The `.java` file of each main class the build names, as a command by the artifactId. */
function mainClassEntries(project: XmlElement, artifactId: string, properties: Map<string, string>, resolve: (value: string | undefined) => string | undefined, directory: string, context: ManifestContext): DeclaredEntry[] {
  const classes = new Set<string>();
  const startClass = resolve(properties.get("start-class"));
  if (startClass) classes.add(startClass);
  for (const plugin of childrenAt(project, "build", "plugins", "plugin")) {
    if (!MAIN_CLASS_PLUGINS.has(textAt(plugin, "artifactId") ?? "")) continue;
    for (const element of descendantsNamed(plugin, MAIN_CLASS_ELEMENTS)) {
      const name = resolve(element.text.trim());
      if (name) classes.add(name);
    }
  }
  const sourceDirectory = resolve(textAt(project, "build", "sourceDirectory")) ?? "src/main/java";
  const declared: DeclaredEntry[] = [];
  for (const className of classes) {
    // A nested class (`Outer$Inner`) lives in its outer class's file.
    const relative = `${className.split("$")[0].split(".").join("/")}.java`;
    const file = workspaceFile(path.resolve(directory, sourceDirectory, relative), context);
    if (file) declared.push({ reason: "command", file, name: artifactId });
  }
  return sortDeclared(declared);
}
