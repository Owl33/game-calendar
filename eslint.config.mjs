import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
  {
    rules: {
      "no-unused-vars": "off", // 사용하지 않는 변수를 무시
      "@typescript-eslint/no-explicit-any": "off", // any 타입 사용을 무시
    },
  },
];

export default eslintConfig;
