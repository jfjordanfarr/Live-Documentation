const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const eslintPluginImport = require("eslint-plugin-import");
const eslintPluginJsdoc = require("eslint-plugin-jsdoc");
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = tseslint.config(
  {
    ignores: [
      "dist/**",
      "**/dist/**",
      "out/**",
      "**/out/**",
      ".vscode-test/**",
  "tests/integration/dist/**",
  "tests/integration/benchmarks/fixtures/**",
  "scripts/fixture-tools/*.js",
      "node_modules/**",
      "**/*.d.ts",
      "eslint.config.js",
  "AI-Agent-Workspace/**",
      // Generated CommonJS shims that live alongside TypeScript sources in the shared package.
      "packages/shared/src/**/*.js",
      // Temporarily ignore test files to avoid typed-rule crashes in our environment
      "**/*.test.ts",
      "**/*.spec.ts"
    ]
  },
  {
    files: ["**/*.{js,cjs,mjs,ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      eslintConfigPrettier
    ],
    languageOptions: {
      parserOptions: {
        sourceType: "module"
      }
    },
    plugins: {
      import: eslintPluginImport
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: [
            "./packages/shared/tsconfig.json",
            "./packages/server/tsconfig.json",
            "./packages/extension/tsconfig.json",
            "./packages/scripts/tsconfig.json",
            "./packages/scripts/src/live-docs/explorer/client/tsconfig.json"
          ],
          alwaysTryTypes: true
        }
      },
      "import/core-modules": ["vscode"],
      "import/internal-regex": "^@live-documentation/"
    },
    rules: {
      "import/order": [
        "error",
        {
          alphabetize: { order: "asc", caseInsensitive: true },
          "newlines-between": "always",
          groups: [["builtin", "external"], "internal", ["parent", "sibling", "index"]]
        }
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ]
    }
  },
  {
    files: ["packages/**/src/**/*.ts"],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname
      }
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      // Workaround: rule is unstable with TS 5.x + projectService in some environments
      "@typescript-eslint/await-thenable": "off"
    }
  },
  {
    files: ["**/*.{test,spec}.ts"],
    languageOptions: {
      parserOptions: {
        // Disable typed project service for test files to avoid tsconfig include constraints
        projectService: false
      }
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-array-delete": "off",
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/no-misused-promises": "off"
    }
  },
  // Require JSDoc on exported symbols in package source and scripts.
  // This exercises our JSDoc extraction pipeline and forces justification
  // of every public API surface — "Can I justify this code?"
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
      jsdoc: eslintPluginJsdoc
    },
    rules: {
      "jsdoc/require-jsdoc": [
        "warn",
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
