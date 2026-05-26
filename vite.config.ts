import { defineConfig } from "vitest/config"
import dts from "unplugin-dts/vite"

export default defineConfig({
  plugins: [dts({ bundleTypes: true })],
  build: {
    lib: {
      entry: "./src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    rolldownOptions: {
      external: [
        /^@codemirror\/.+$/,
        /^@lezer\/.+$/,
        "es-toolkit",
      ],
    },
  },
  test: {
    environment: "happy-dom",
    include: ["test/**/*.test.ts"],
  },
})
