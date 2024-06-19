import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "./src/dist",
    manifest: true,
    rollupOptions: {
      input: "./src/index.ts",
    },
  },
  plugins: [react()],
  // publicDir: false
});