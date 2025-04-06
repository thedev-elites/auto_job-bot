import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy API requests to the backend
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          // If the API base URL already includes /api, we need to strip it from the path
          if (process.env.VITE_API_BASE_URL?.includes('/api')) {
            return path.replace(/^\/api/, '');
          }
          return path;
        },
      }
    }
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
