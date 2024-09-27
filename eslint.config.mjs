import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parser: "@typescript-eslint/parser", // TypeScript 지원을 위한 파서 추가
      globals: {
        ...globals.browser,
        myCustomGlobal: "readonly",
        process: "readonly",
      },
    },
    plugins: ["@typescript-eslint"], // TypeScript 플러그인 추가
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^next$" }],
      "@typescript-eslint/no-unused-vars": ["warn"], // TypeScript용 규칙 추가
    },
    ignorePatterns: ["!**/*.ts"],
  },
];
