const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const importX = require("eslint-plugin-import-x");
const { createTypeScriptImportResolver } = require("eslint-import-resolver-typescript");
const jsdoc = require("eslint-plugin-jsdoc");

// Lint enforces correctness, never formatting: no stylistic rule is enabled, and no formatter runs over TypeScript,
// so that hand-aligned whitespace stays as written (the owner, 2026-09-27 and 2026-10-22; the survey of 2026-10-22 in
// AI-Agent-Workspace/Research/2026-10-22-typescript-formatting-and-linting.md).
module.exports = tseslint.config(
  {
    ignores: [
      "dist/**",
      "**/dist/**",
      "out/**",
      "**/out/**",
      // Playwright's report, whose trace viewer is bundled JavaScript.
      "reports/**",
      "tests/integration/programs/**",
      "node_modules/**",
      "**/*.d.ts",
      "eslint.config.js",
      "AI-Agent-Workspace/**",
      // Nested worktrees other agents work in are other checkouts, not this one's files; git excludes them too.
      ".claude/worktrees/**",
      // Generated CommonJS shims that live alongside TypeScript sources in the engine package.
      "packages/engine/src/**/*.js",
    ]
  },
  {
    files: ["**/*.{js,cjs,mjs,ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended
    ],
    languageOptions: {
      parserOptions: {
        sourceType: "module"
      }
    },
    plugins: {
      "import-x": importX
    },
    settings: {
      "import-x/resolver-next": [
        createTypeScriptImportResolver({
          project: [
            "./packages/engine/tsconfig.json",
            "./packages/generator/tsconfig.json",
            "./packages/explorer/tsconfig.json",
            "./packages/explorer/src/client/tsconfig.json"
          ],
          alwaysTryTypes: true
        })
      ],
      "import-x/internal-regex": "^@live-documentation/"
    },
    rules: {
      "import-x/order": [
        "error",
        {
          alphabetize: { order: "asc", caseInsensitive: true },
          "newlines-between": "always",
          groups: [["builtin", "external"], "internal", ["parent", "sibling", "index"]]
        }
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ]
    }
  },
  {
    files: ["packages/**/src/**/*.ts"],
    // Typed rules need a tsconfig project; the packages' projects hold their sources, not their tests.
    ignores: ["**/*.test.ts", "**/*.spec.ts"],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname
      }
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error"
    }
  },
  // Every public symbol in package source and scripts carries a docstring: "linting that works like the C# linting
  // which mandates docstrings over every public symbol" (the owner, 2026-02-15), an error since 2026-10-22, when a
  // warning that failed nothing was found to be met everywhere.
  {
    files: [
      "packages/**/src/**/*.ts",
      "scripts/**/*.ts"
    ],
    ignores: [
      "**/*.test.ts",
      "**/*.spec.ts"
    ],
    plugins: {
      jsdoc
    },
    rules: {
      "jsdoc/require-jsdoc": [
        "error",
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true
          },
          contexts: [
            // Exported interface/type/enum declarations
            "ExportNamedDeclaration > TSInterfaceDeclaration",
            "ExportNamedDeclaration > TSTypeAliasDeclaration",
            "ExportNamedDeclaration > TSEnumDeclaration",
            // Exported const/let variable declarations
            "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator"
          ],
          checkConstructors: false
        }
      ]
    }
  }
);
