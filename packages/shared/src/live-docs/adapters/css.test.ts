import { describe, expect, it, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

import { cssAdapter } from "./css";

describe("CSS Adapter", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "css-adapter-test-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe("extractCssDependencies", () => {
    it("extracts @import dependencies", async () => {
      const cssPath = path.join(tempDir, "main.css");
      const importedPath = path.join(tempDir, "reset.css");
      
      fs.writeFileSync(importedPath, "* { margin: 0; }");
      fs.writeFileSync(cssPath, `
        @import "reset.css";
        body { color: black; }
      `);

      const result = await cssAdapter.analyze({
        absolutePath: cssPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      expect(result!.dependencies[0].specifier).toBe("reset.css");
      expect(result!.dependencies[0].resolvedPath).toBe("reset.css");
    });

    it("extracts @import url() dependencies", async () => {
      const cssPath = path.join(tempDir, "main.css");
      const importedPath = path.join(tempDir, "variables.css");
      
      fs.writeFileSync(importedPath, ":root { --color: blue; }");
      fs.writeFileSync(cssPath, `
        @import url("variables.css");
        body { color: var(--color); }
      `);

      const result = await cssAdapter.analyze({
        absolutePath: cssPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      expect(result!.dependencies[0].specifier).toBe("variables.css");
    });

    it("extracts url() image references", async () => {
      const cssPath = path.join(tempDir, "styles.css");
      const imgDir = path.join(tempDir, "images");
      fs.mkdirSync(imgDir);
      
      fs.writeFileSync(path.join(imgDir, "bg.png"), "fake png");
      fs.writeFileSync(cssPath, `
        body {
          background-image: url("images/bg.png");
        }
      `);

      const result = await cssAdapter.analyze({
        absolutePath: cssPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      expect(result!.dependencies[0].specifier).toBe("images/bg.png");
    });

    it("extracts @font-face url() references", async () => {
      const cssPath = path.join(tempDir, "fonts.css");
      const fontsDir = path.join(tempDir, "fonts");
      fs.mkdirSync(fontsDir);
      
      fs.writeFileSync(path.join(fontsDir, "custom.woff2"), "fake font");
      fs.writeFileSync(path.join(fontsDir, "custom.woff"), "fake font");
      fs.writeFileSync(cssPath, `
        @font-face {
          font-family: 'Custom';
          src: url('fonts/custom.woff2') format('woff2'),
               url('fonts/custom.woff') format('woff');
        }
      `);

      const result = await cssAdapter.analyze({
        absolutePath: cssPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(2);
      expect(result!.dependencies.map((d) => d.specifier).sort()).toEqual([
        "fonts/custom.woff",
        "fonts/custom.woff2"
      ]);
    });

    it("handles bare (unquoted) url() syntax", async () => {
      const cssPath = path.join(tempDir, "styles.css");
      const imgDir = path.join(tempDir, "images");
      fs.mkdirSync(imgDir);
      
      fs.writeFileSync(path.join(imgDir, "icon.svg"), "<svg></svg>");
      fs.writeFileSync(cssPath, `
        .icon {
          mask: url(/images/icon.svg);
        }
      `);

      const result = await cssAdapter.analyze({
        absolutePath: cssPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      expect(result!.dependencies[0].specifier).toBe("images/icon.svg");
    });

    it("handles absolute paths from workspace root", async () => {
      const stylesDir = path.join(tempDir, "styles");
      const fontsDir = path.join(tempDir, "fonts");
      fs.mkdirSync(stylesDir);
      fs.mkdirSync(fontsDir);
      
      const cssPath = path.join(stylesDir, "main.css");
      fs.writeFileSync(path.join(fontsDir, "body.woff2"), "fake font");
      fs.writeFileSync(cssPath, `
        @font-face {
          font-family: 'Body';
          src: url('/fonts/body.woff2') format('woff2');
        }
      `);

      const result = await cssAdapter.analyze({
        absolutePath: cssPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      expect(result!.dependencies[0].specifier).toBe("fonts/body.woff2");
      expect(result!.dependencies[0].resolvedPath).toBe("fonts/body.woff2");
    });

    it("skips external URLs", async () => {
      const cssPath = path.join(tempDir, "styles.css");
      
      fs.writeFileSync(cssPath, `
        @import url("https://fonts.googleapis.com/css2?family=Roboto");
        body {
          background: url(//cdn.example.com/bg.png);
        }
      `);

      const result = await cssAdapter.analyze({
        absolutePath: cssPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(0);
    });

    it("skips data URIs", async () => {
      const cssPath = path.join(tempDir, "styles.css");
      
      fs.writeFileSync(cssPath, `
        .icon {
          background: url(data:image/svg+xml;base64,PHN2Zz4=);
        }
      `);

      const result = await cssAdapter.analyze({
        absolutePath: cssPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(0);
    });

    it("handles missing files (unresolved dependencies)", async () => {
      const cssPath = path.join(tempDir, "styles.css");
      
      fs.writeFileSync(cssPath, `
        @import "missing.css";
        body {
          background: url("ghost.png");
        }
      `);

      const result = await cssAdapter.analyze({
        absolutePath: cssPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(2);
      expect(result!.dependencies.every((d) => d.resolvedPath === undefined)).toBe(true);
    });

    it("deduplicates repeated references", async () => {
      const cssPath = path.join(tempDir, "styles.css");
      const imgDir = path.join(tempDir, "images");
      fs.mkdirSync(imgDir);
      
      fs.writeFileSync(path.join(imgDir, "bg.png"), "fake");
      fs.writeFileSync(cssPath, `
        .a { background: url("images/bg.png"); }
        .b { background: url('images/bg.png'); }
        .c { background: url(images/bg.png); }
      `);

      const result = await cssAdapter.analyze({
        absolutePath: cssPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
    });

    it("strips query strings and fragments", async () => {
      const cssPath = path.join(tempDir, "styles.css");
      const imgDir = path.join(tempDir, "images");
      fs.mkdirSync(imgDir);
      
      fs.writeFileSync(path.join(imgDir, "sprite.png"), "fake");
      fs.writeFileSync(cssPath, `
        .icon1 { background: url("images/sprite.png?v=123#icon1"); }
        .icon2 { background: url("images/sprite.png#icon2"); }
      `);

      const result = await cssAdapter.analyze({
        absolutePath: cssPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      expect(result!.dependencies[0].specifier).toBe("images/sprite.png");
    });

    it("returns empty symbols array", async () => {
      const cssPath = path.join(tempDir, "styles.css");
      fs.writeFileSync(cssPath, "body { color: black; }");

      const result = await cssAdapter.analyze({
        absolutePath: cssPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.symbols).toEqual([]);
    });

    it("finds document root for server-root-relative paths in nested projects", async () => {
      // Simulate a nested web project structure:
      // workspace/
      //   fixtures/
      //     project/           <- document root
      //       styles/
      //         site.css       <- references /images/background.png
      //       images/
      //         background.png
      const projectDir = path.join(tempDir, "fixtures", "project");
      const stylesDir = path.join(projectDir, "styles");
      const imagesDir = path.join(projectDir, "images");
      
      fs.mkdirSync(stylesDir, { recursive: true });
      fs.mkdirSync(imagesDir, { recursive: true });
      
      const cssPath = path.join(stylesDir, "site.css");
      const imgPath = path.join(imagesDir, "background.png");
      
      fs.writeFileSync(imgPath, "fake png");
      fs.writeFileSync(cssPath, `
        body {
          background-image: url("/images/background.png");
        }
      `);

      // workspaceRoot is the top-level temp dir, not the project dir
      const result = await cssAdapter.analyze({
        absolutePath: cssPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      // Should resolve to the project-relative path from workspace root
      expect(result!.dependencies[0].resolvedPath).toBe("fixtures/project/images/background.png");
    });

    it("falls back to specifier when server-root-relative path not found in any ancestor", async () => {
      const stylesDir = path.join(tempDir, "styles");
      fs.mkdirSync(stylesDir);
      
      const cssPath = path.join(stylesDir, "site.css");
      fs.writeFileSync(cssPath, `
        body {
          background-image: url("/nonexistent/missing.png");
        }
      `);

      const result = await cssAdapter.analyze({
        absolutePath: cssPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      expect(result!.dependencies[0].specifier).toBe("nonexistent/missing.png");
      expect(result!.dependencies[0].resolvedPath).toBeUndefined();
    });

    it("finds document root in common static folders like public/", async () => {
      // Simulate a structure like the SlopCop fixture:
      // workspace/
      //   styles/
      //     site.css       <- references /images/background.png
      //   public/
      //     images/
      //       background.png
      const projectDir = path.join(tempDir, "project");
      const stylesDir = path.join(projectDir, "styles");
      const publicDir = path.join(projectDir, "public");
      const imagesDir = path.join(publicDir, "images");
      
      fs.mkdirSync(stylesDir, { recursive: true });
      fs.mkdirSync(imagesDir, { recursive: true });
      
      const cssPath = path.join(stylesDir, "site.css");
      const imgPath = path.join(imagesDir, "background.png");
      
      fs.writeFileSync(imgPath, "fake png");
      fs.writeFileSync(cssPath, `
        body {
          background-image: url("/images/background.png");
        }
      `);

      const result = await cssAdapter.analyze({
        absolutePath: cssPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      // Should resolve to the public-relative path from workspace root
      expect(result!.dependencies[0].resolvedPath).toBe("project/public/images/background.png");
    });
  });
});
