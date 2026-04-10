import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "happy-dom",
  },
  resolve: {
    alias: {
      // Map the ~ alias to your src directory
      "~": resolve(__dirname, "./src"),
      // Include any other aliases needed
      __tests__: resolve(__dirname, "./__tests__"),
    },
  },
});
