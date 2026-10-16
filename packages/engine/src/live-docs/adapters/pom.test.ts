import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { ResolvedSymbolLocation, WorkspaceSymbolIndex } from "../coreTypes";
import { childAt, childrenAt, pomAdapter, readXmlElements, textAt } from "./pom";

describe("readXmlElements", () => {
  it("gives elements by path, nested ones apart from their namesakes elsewhere, and comments, CDATA, declarations and attributes handled", () => {
    const document = readXmlElements([
      "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
      "<!DOCTYPE project [ <!ENTITY x \"y\"> ]>",
      "<project xmlns=\"http://maven.apache.org/POM/4.0.0\" a=\"has > inside\">",
      "  <!-- <dependencies><dependency><artifactId>commented</artifactId></dependency></dependencies> -->",
      "  <dependencyManagement>",
      "    <dependencies><dependency><artifactId>managed</artifactId></dependency></dependencies>",
      "  </dependencyManagement>",
      "  <dependencies>",
      "    <dependency><artifactId>first</artifactId></dependency>",
      "    <dependency><artifactId><![CDATA[sec<ond]]></artifactId><optional/></dependency>",
      "  </dependencies>",
      "  <name>Tom &amp; Jerry &#x41;&#66;</name>",
      "  <m:extra xmlns:m=\"urn:m\">prefixed</m:extra>",
      "</project>"
    ].join("\n"));

    const project = childAt(document, "project");
    expect(childrenAt(project, "dependencies", "dependency").map((dependency) => textAt(dependency, "artifactId"))).toEqual(["first", "sec<ond"]);
    expect(childrenAt(project, "dependencyManagement", "dependencies", "dependency").map((dependency) => textAt(dependency, "artifactId"))).toEqual(["managed"]);
    expect(childAt(project, "dependencies")?.children[1].children.map((child) => child.name)).toEqual(["artifactId", "optional"]);
    expect(textAt(project, "name")).toBe("Tom & Jerry AB");
    expect(textAt(project, "extra")).toBe("prefixed");
    expect(textAt(project, "missing")).toBeUndefined();
  });

  it("closes the nearest open element of a close tag's name, so that a stray close tag leaves the rest in place", () => {
    const project = childAt(readXmlElements("<project><build><plugins></build><version>1</version></project>"), "project");
    expect(project?.children.map((child) => child.name)).toEqual(["build", "version"]);
    expect(textAt(project, "version")).toBe("1");
  });
});

describe("pomAdapter", () => {
  let workspaceRoot: string;
  const write = async (file: string, content: string): Promise<void> => {
    await fs.mkdir(path.dirname(path.join(workspaceRoot, file)), { recursive: true });
    await fs.writeFile(path.join(workspaceRoot, file), content, "utf8");
  };
  const analyze = (file: string, fileIndex: string[], symbolIndex?: WorkspaceSymbolIndex) =>
    pomAdapter.analyze({ absolutePath: path.join(workspaceRoot, file), workspaceRoot, fileIndex: new Set(fileIndex), symbolIndex });
  const artifact = (name: string, sourcePath: string): [string, ResolvedSymbolLocation[]] =>
    [name, [{ liveDocPath: `${sourcePath}.md`, sourcePath, anchor: `symbol-${name}`, kind: "package" }]];
  const pom = (...body: string[]): string => ["<?xml version=\"1.0\"?>", "<project>", "  <modelVersion>4.0.0</modelVersion>", ...body.map((line) => `  ${line}`), "</project>"].join("\n");

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "pom-adapter-"));
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  it("publishes groupId:artifactId, the groupId inherited from the parent, links the parent and a sibling, resolves versions, and counts no managed dependency", async () => {
    await write("pom.xml", pom("<groupId>com.acme</groupId>", "<artifactId>depot-parent</artifactId>", "<version>2.1.0</version>", "<packaging>pom</packaging>", "<modules><module>api</module><module>model</module></modules>"));
    await write("api/pom.xml", pom(
      "<parent>",
      "  <groupId>com.acme</groupId>",
      "  <artifactId>depot-parent</artifactId>",
      "  <version>2.1.0</version>",
      "</parent>",
      "<artifactId>depot-api</artifactId>",
      "<properties><jackson.version>2.17.1</jackson.version><junit.version>${junit.major}.10.2</junit.version><junit.major>5</junit.major></properties>",
      "<dependencyManagement><dependencies><dependency><groupId>org.slf4j</groupId><artifactId>slf4j-bom</artifactId><version>2.0.13</version></dependency></dependencies></dependencyManagement>",
      "<dependencies>",
      "  <dependency><groupId>${project.groupId}</groupId><artifactId>depot-model</artifactId><version>${project.version}</version></dependency>",
      "  <dependency><groupId>com.fasterxml.jackson.core</groupId><artifactId>jackson-databind</artifactId><version>${jackson.version}</version></dependency>",
      "  <dependency><groupId>org.junit.jupiter</groupId><artifactId>junit-jupiter</artifactId><version>${junit.version}</version><scope>test</scope></dependency>",
      "  <dependency><groupId>org.slf4j</groupId><artifactId>slf4j-api</artifactId></dependency>",
      "  <dependency><groupId>org.example</groupId><artifactId>unknown</artifactId><version>${undefined.version}</version></dependency>",
      "</dependencies>",
      "<build><plugins><plugin><artifactId>maven-surefire-plugin</artifactId><dependencies><dependency><groupId>org.x</groupId><artifactId>plugin-only</artifactId></dependency></dependencies></plugin></plugins></build>",
      "<profiles><profile><dependencies><dependency><groupId>org.x</groupId><artifactId>profiled</artifactId></dependency></dependencies></profile></profiles>"
    ));
    const symbolIndex: WorkspaceSymbolIndex = new Map([
      artifact("com.acme:depot-parent", "pom.xml"),
      artifact("com.acme:depot-model", "model/pom.xml")
    ]);

    const result = await analyze("api/pom.xml", ["pom.xml", "api/pom.xml", "model/pom.xml"], symbolIndex);

    expect(result?.symbols).toEqual([{ name: "com.acme:depot-api", kind: "package", location: { line: 1, character: 1 } }]);
    expect(result?.dependencies).toEqual([
      { specifier: "model/pom.xml", resolvedPath: "model/pom.xml", symbols: ["com.acme:depot-model"], kind: "import" },
      { specifier: "pom.xml", resolvedPath: "pom.xml", symbols: ["com.acme:depot-parent"], kind: "import" },
      { specifier: "com.fasterxml.jackson.core:jackson-databind@2.17.1", symbols: [], kind: "import" },
      { specifier: "org.example:unknown@${undefined.version}", symbols: [], kind: "import" },
      { specifier: "org.junit.jupiter:junit-jupiter@5.10.2", symbols: [], kind: "import" },
      { specifier: "org.slf4j:slf4j-api", symbols: [], kind: "import" }
    ]);

    const parent = await analyze("pom.xml", ["pom.xml", "api/pom.xml", "model/pom.xml"], symbolIndex);
    expect(parent).toEqual({ symbols: [{ name: "com.acme:depot-parent", kind: "package", location: { line: 1, character: 1 } }], dependencies: [] });
  });

  it("keeps a parent the workspace lacks, or one an empty relativePath sends to the repository, external with its version", async () => {
    await write("pom.xml", pom("<artifactId>root</artifactId>"));
    await write("svc/pom.xml", pom("<parent><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-parent</artifactId><version>3.3.0</version><relativePath/></parent>", "<groupId>com.acme</groupId>", "<artifactId>svc</artifactId>"));
    await write("lib/pom.xml", pom("<parent><groupId>com.acme</groupId><artifactId>build</artifactId><version>1</version><relativePath>../build</relativePath></parent>", "<artifactId>lib</artifactId>"));

    const svc = await analyze("svc/pom.xml", ["pom.xml", "svc/pom.xml", "lib/pom.xml"]);
    expect(svc?.dependencies).toEqual([{ specifier: "org.springframework.boot:spring-boot-starter-parent@3.3.0", symbols: [], kind: "import" }]);

    const lib = await analyze("lib/pom.xml", ["pom.xml", "svc/pom.xml", "lib/pom.xml"]);
    expect(lib?.symbols.map((symbol) => symbol.name)).toEqual(["com.acme:lib"]);
    expect(lib?.dependencies).toEqual([{ specifier: "com.acme:build@1", symbols: [], kind: "import" }]);
  });

  it("follows a relativePath to a folder or a file, and publishes no symbol for a project without a groupId", async () => {
    await write("build/pom.xml", pom("<groupId>com.acme</groupId>", "<artifactId>build</artifactId>"));
    await write("lib/pom.xml", pom("<parent><groupId>com.acme</groupId><artifactId>build</artifactId><relativePath>../build</relativePath></parent>", "<artifactId>lib</artifactId>"));
    await write("tool/pom.xml", pom("<parent><groupId>com.acme</groupId><artifactId>build</artifactId><relativePath>../build/pom.xml</relativePath></parent>", "<artifactId>tool</artifactId>"));
    const fileIndex = ["build/pom.xml", "lib/pom.xml", "tool/pom.xml"];

    expect((await analyze("lib/pom.xml", fileIndex))?.dependencies).toEqual([{ specifier: "build/pom.xml", resolvedPath: "build/pom.xml", symbols: ["com.acme:build"], kind: "import" }]);
    expect((await analyze("tool/pom.xml", fileIndex))?.dependencies.map((dependency) => dependency.resolvedPath)).toEqual(["build/pom.xml"]);

    await write("orphan/pom.xml", pom("<artifactId>orphan</artifactId>"));
    expect(await analyze("orphan/pom.xml", ["orphan/pom.xml"])).toEqual({ symbols: [], dependencies: [] });
  });

  it("declares the main class each named plugin and the start-class property name, once when they agree, on its file under the source folder", async () => {
    await write("app/pom.xml", pom(
      "<groupId>com.acme</groupId>",
      "<artifactId>depot-app</artifactId>",
      "<properties><main.class>com.acme.depot.Main</main.class><start-class>com.acme.depot.Main</start-class></properties>",
      "<build>",
      "  <plugins>",
      "    <plugin><groupId>org.codehaus.mojo</groupId><artifactId>exec-maven-plugin</artifactId><configuration><mainClass>${main.class}</mainClass></configuration></plugin>",
      "    <plugin><artifactId>maven-jar-plugin</artifactId><configuration><archive><manifest><mainClass>com.acme.depot.Main</mainClass></manifest></archive></configuration></plugin>",
      "    <plugin><artifactId>maven-shade-plugin</artifactId><executions><execution><configuration><transformers><transformer><manifestEntries><Main-Class>com.acme.depot.tools.Seed$Runner</Main-Class></manifestEntries></transformer></transformers></configuration></execution></executions></plugin>",
      "    <plugin><artifactId>maven-surefire-plugin</artifactId><configuration><mainClass>com.acme.depot.NotStarted</mainClass></configuration></plugin>",
      "    <plugin><artifactId>spring-boot-maven-plugin</artifactId><configuration><mainClass>com.acme.depot.Missing</mainClass></configuration></plugin>",
      "  </plugins>",
      "</build>"
    ));
    const fileIndex = ["app/pom.xml", "app/src/main/java/com/acme/depot/Main.java", "app/src/main/java/com/acme/depot/tools/Seed.java", "app/src/main/java/com/acme/depot/NotStarted.java"];

    const result = await analyze("app/pom.xml", fileIndex);

    expect(result?.declares).toEqual([
      { reason: "command", file: "app/src/main/java/com/acme/depot/Main.java", name: "depot-app" },
      { reason: "command", file: "app/src/main/java/com/acme/depot/tools/Seed.java", name: "depot-app" }
    ]);
  });

  it("finds the main class under a sourceDirectory the build writes", async () => {
    await write("pom.xml", pom(
      "<groupId>com.rosetta</groupId>",
      "<artifactId>rosetta</artifactId>",
      "<build><sourceDirectory>${project.basedir}/src</sourceDirectory><plugins><plugin><artifactId>maven-assembly-plugin</artifactId><configuration><archive><manifest><mainClass>com.rosetta.App</mainClass></manifest></archive></configuration></plugin></plugins></build>"
    ));
    const result = await analyze("pom.xml", ["pom.xml", "src/com/rosetta/App.java"]);
    expect(result?.declares).toEqual([{ reason: "command", file: "src/com/rosetta/App.java", name: "rosetta" }]);
  });
});
