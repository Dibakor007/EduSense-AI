import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [react()],
    define: {
      "process.env.API_KEY": JSON.stringify(
        env.VITE_GEMINI_API_KEY || env.API_KEY || env.GEMINI_API_KEY || ""
      ),
      "process.env.GEMINI_API_KEY": JSON.stringify(
        env.VITE_GEMINI_API_KEY || env.API_KEY || env.GEMINI_API_KEY || ""
      ),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    build: {
      outDir: "dist",
      sourcemap: false,
    },
  };
});
