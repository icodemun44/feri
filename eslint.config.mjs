import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/coverage/**",
      "**/.turbo/**",
      "**/next-env.d.ts",
      "packages/database/src/generated/**",
      "packages/database/prisma/migrations/**",
      "supabase/.temp/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
      "no-console": ["error", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always"],
      "prefer-const": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSAsExpression > TSUnknownKeyword",
          message: "Do not use `as unknown as`. Fix the type or narrow the value instead.",
        },
      ],
    },
  },
  {
    files: ["**/*.tsx"],
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  {
    files: ["**/*.mjs", "**/*.js"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: ["**/*.config.ts", "**/*.config.mjs", "**/scripts/**", "**/prisma/seed.ts"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
);
