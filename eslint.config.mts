import { defineConfig } from "eslint/config"
import js from "@eslint/js"
import tseslint from "typescript-eslint"
import stylistic from "@stylistic/eslint-plugin"

export default defineConfig(
  { ignores: ["dist"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.stylistic,
  stylistic.configs.customize({
    semi: false,
    quotes: "double",
    commaDangle: "always-multiline",
    blockSpacing: true,
    indent: 2,
  }),
)
