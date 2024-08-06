import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: false,
  outDir: 'dist',
  sourcemap: true,
  format: "esm",
  clean: true,
})