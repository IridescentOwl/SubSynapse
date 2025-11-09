import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    server: { port: 3000, host: "0.0.0.0" },
    plugins: [react()],
    define: {
      "process.env.GEMINI_API_KEY": JSON.stringify(env.VITE_GEMINI_API_KEY),
    },
    resolve: {
      alias: { "@": path.resolve(__dirname, ".") }, // root alias
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: { ".ts": "ts", ".tsx": "tsx", ".js": "js", ".jsx": "jsx" },
      },
    },
    esbuild: { jsx: "automatic" },
  };
});
