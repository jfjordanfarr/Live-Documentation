import { describe, expect, it, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

import { htmlAdapter } from "./html";

describe("HTML Adapter", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "html-adapter-test-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe("extractHtmlDependencies", () => {
    it("extracts stylesheet link dependencies", async () => {
      const htmlPath = path.join(tempDir, "index.html");
      const cssPath = path.join(tempDir, "styles.css");
      
      fs.writeFileSync(cssPath, "body {}");
      fs.writeFileSync(htmlPath, `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="stylesheet" href="styles.css">
          </head>
        </html>
      `);

      const result = await htmlAdapter.analyze({
        absolutePath: htmlPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      expect(result!.dependencies[0].specifier).toBe("styles.css");
      expect(result!.dependencies[0].resolvedPath).toBe("styles.css");
    });

    it("extracts script src dependencies", async () => {
      const htmlPath = path.join(tempDir, "index.html");
      const jsPath = path.join(tempDir, "app.js");
      
      fs.writeFileSync(jsPath, "console.log('hello');");
      fs.writeFileSync(htmlPath, `
        <!DOCTYPE html>
        <html>
          <body>
            <script src="app.js"></script>
          </body>
        </html>
      `);

      const result = await htmlAdapter.analyze({
        absolutePath: htmlPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      expect(result!.dependencies[0].specifier).toBe("app.js");
    });

    it("extracts image src dependencies", async () => {
      const htmlPath = path.join(tempDir, "index.html");
      const imgDir = path.join(tempDir, "images");
      fs.mkdirSync(imgDir);
      const imgPath = path.join(imgDir, "logo.png");
      
      fs.writeFileSync(imgPath, "fake png data");
      fs.writeFileSync(htmlPath, `
        <!DOCTYPE html>
        <html>
          <body>
            <img src="images/logo.png" alt="Logo">
          </body>
        </html>
      `);

      const result = await htmlAdapter.analyze({
        absolutePath: htmlPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      expect(result!.dependencies[0].specifier).toBe("images/logo.png");
    });

    it("handles absolute paths from workspace root", async () => {
      const pagesDir = path.join(tempDir, "pages");
      const stylesDir = path.join(tempDir, "styles");
      fs.mkdirSync(pagesDir);
      fs.mkdirSync(stylesDir);
      
      const htmlPath = path.join(pagesDir, "index.html");
      const cssPath = path.join(stylesDir, "main.css");
      
      fs.writeFileSync(cssPath, "body {}");
      fs.writeFileSync(htmlPath, `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="stylesheet" href="/styles/main.css">
          </head>
        </html>
      `);

      const result = await htmlAdapter.analyze({
        absolutePath: htmlPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      expect(result!.dependencies[0].specifier).toBe("styles/main.css");
      expect(result!.dependencies[0].resolvedPath).toBe("styles/main.css");
    });

    it("handles srcset with multiple URLs", async () => {
      const htmlPath = path.join(tempDir, "index.html");
      const imgDir = path.join(tempDir, "images");
      fs.mkdirSync(imgDir);
      
      fs.writeFileSync(path.join(imgDir, "hero.png"), "1x");
      fs.writeFileSync(path.join(imgDir, "hero@2x.png"), "2x");
      fs.writeFileSync(htmlPath, `
        <!DOCTYPE html>
        <html>
          <body>
            <img srcset="images/hero.png 1x, images/hero@2x.png 2x" alt="Hero">
          </body>
        </html>
      `);

      const result = await htmlAdapter.analyze({
        absolutePath: htmlPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(2);
      expect(result!.dependencies.map((d) => d.specifier).sort()).toEqual([
        "images/hero.png",
        "images/hero@2x.png"
      ]);
    });

    it("skips external URLs", async () => {
      const htmlPath = path.join(tempDir, "index.html");
      
      fs.writeFileSync(htmlPath, `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="stylesheet" href="https://cdn.example.com/style.css">
            <script src="//cdn.example.com/app.js"></script>
          </head>
          <body>
            <img src="http://example.com/image.png">
          </body>
        </html>
      `);

      const result = await htmlAdapter.analyze({
        absolutePath: htmlPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(0);
    });

    it("skips data URIs", async () => {
      const htmlPath = path.join(tempDir, "index.html");
      
      fs.writeFileSync(htmlPath, `
        <!DOCTYPE html>
        <html>
          <body>
            <img src="data:image/png;base64,iVBORw0KGgo=">
          </body>
        </html>
      `);

      const result = await htmlAdapter.analyze({
        absolutePath: htmlPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(0);
    });

    it("handles missing files (unresolved dependencies)", async () => {
      const htmlPath = path.join(tempDir, "index.html");
      
      fs.writeFileSync(htmlPath, `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="stylesheet" href="missing.css">
          </head>
        </html>
      `);

      const result = await htmlAdapter.analyze({
        absolutePath: htmlPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      expect(result!.dependencies[0].specifier).toBe("missing.css");
      expect(result!.dependencies[0].resolvedPath).toBeUndefined();
    });

    it("deduplicates repeated references", async () => {
      const htmlPath = path.join(tempDir, "index.html");
      const cssPath = path.join(tempDir, "styles.css");
      
      fs.writeFileSync(cssPath, "body {}");
      fs.writeFileSync(htmlPath, `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="stylesheet" href="styles.css">
            <link rel="preload" href="styles.css" as="style">
          </head>
        </html>
      `);

      const result = await htmlAdapter.analyze({
        absolutePath: htmlPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
    });

    it("extracts video and audio sources", async () => {
      const htmlPath = path.join(tempDir, "index.html");
      const mediaDir = path.join(tempDir, "media");
      fs.mkdirSync(mediaDir);
      
      fs.writeFileSync(path.join(mediaDir, "video.mp4"), "fake video");
      fs.writeFileSync(path.join(mediaDir, "poster.jpg"), "fake image");
      fs.writeFileSync(htmlPath, `
        <!DOCTYPE html>
        <html>
          <body>
            <video poster="media/poster.jpg">
              <source src="media/video.mp4" type="video/mp4">
            </video>
          </body>
        </html>
      `);

      const result = await htmlAdapter.analyze({
        absolutePath: htmlPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(2);
      expect(result!.dependencies.map((d) => d.specifier).sort()).toEqual([
        "media/poster.jpg",
        "media/video.mp4"
      ]);
    });

    it("returns empty symbols array", async () => {
      const htmlPath = path.join(tempDir, "index.html");
      fs.writeFileSync(htmlPath, "<!DOCTYPE html><html></html>");

      const result = await htmlAdapter.analyze({
        absolutePath: htmlPath,
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
      //       pages/
      //         index.html     <- references /styles/site.css
      //       styles/
      //         site.css
      const projectDir = path.join(tempDir, "fixtures", "project");
      const pagesDir = path.join(projectDir, "pages");
      const stylesDir = path.join(projectDir, "styles");
      
      fs.mkdirSync(pagesDir, { recursive: true });
      fs.mkdirSync(stylesDir, { recursive: true });
      
      const htmlPath = path.join(pagesDir, "index.html");
      const cssPath = path.join(stylesDir, "site.css");
      
      fs.writeFileSync(cssPath, "body {}");
      fs.writeFileSync(htmlPath, `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="stylesheet" href="/styles/site.css">
          </head>
        </html>
      `);

      // workspaceRoot is the top-level temp dir, not the project dir
      const result = await htmlAdapter.analyze({
        absolutePath: htmlPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      // Should resolve to the project-relative path from workspace root
      expect(result!.dependencies[0].resolvedPath).toBe("fixtures/project/styles/site.css");
    });

    it("falls back to specifier when server-root-relative path not found in any ancestor", async () => {
      const pagesDir = path.join(tempDir, "pages");
      fs.mkdirSync(pagesDir);
      
      const htmlPath = path.join(pagesDir, "index.html");
      fs.writeFileSync(htmlPath, `
        <!DOCTYPE html>
        <html>
          <head>
            <link rel="stylesheet" href="/nonexistent/missing.css">
          </head>
        </html>
      `);

      const result = await htmlAdapter.analyze({
        absolutePath: htmlPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      expect(result!.dependencies[0].specifier).toBe("nonexistent/missing.css");
      expect(result!.dependencies[0].resolvedPath).toBeUndefined();
    });

    it("finds document root in common static folders like public/", async () => {
      // Simulate a structure like the SlopCop fixture:
      // workspace/
      //   pages/
      //     index.html     <- references /images/banner.png
      //   public/
      //     images/
      //       banner.png
      const projectDir = path.join(tempDir, "project");
      const pagesDir = path.join(projectDir, "pages");
      const publicDir = path.join(projectDir, "public");
      const imagesDir = path.join(publicDir, "images");
      
      fs.mkdirSync(pagesDir, { recursive: true });
      fs.mkdirSync(imagesDir, { recursive: true });
      
      const htmlPath = path.join(pagesDir, "index.html");
      const imgPath = path.join(imagesDir, "banner.png");
      
      fs.writeFileSync(imgPath, "fake png");
      fs.writeFileSync(htmlPath, `
        <!DOCTYPE html>
        <html>
          <body>
            <img src="/images/banner.png" alt="Banner">
          </body>
        </html>
      `);

      const result = await htmlAdapter.analyze({
        absolutePath: htmlPath,
        workspaceRoot: tempDir
      });

      expect(result).not.toBeNull();
      expect(result!.dependencies).toHaveLength(1);
      // Should resolve to the public-relative path from workspace root
      expect(result!.dependencies[0].resolvedPath).toBe("project/public/images/banner.png");
    });
  });
});
