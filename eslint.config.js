const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const eslintPluginImport = require("eslint-plugin-import");
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
  }
);
