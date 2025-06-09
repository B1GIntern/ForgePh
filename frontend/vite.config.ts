import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd());
  
  // API URL - use environment variable or fallback to local backend
  // In Vercel, we use relative URLs for API
  const isVercel = process.env.VERCEL === "1";
  const API_URL = isVercel ? "" : (env.VITE_API_URL || "http://localhost:5001");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    css: {
      transformer: 'postcss', // Explicitly use postcss instead of lightningcss
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: mode !== 'production',
      minify: mode === 'production',
      rollupOptions: {
        external: ['lightningcss', '@rollup/rollup-linux-x64-gnu'],
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: [
              '@radix-ui/react-accordion',
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-avatar',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-label',
              '@radix-ui/react-slot',
              '@radix-ui/react-tabs',
              '@radix-ui/react-toast',
              'class-variance-authority',
              'clsx',
              'tailwind-merge'
            ]
          },
        },
      },
    },
    server: {
      host: "::",
      port: 8080,
      strictPort: false,
      open: true, // Automatically open browser
      proxy: {
        "/api": {
          target: API_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
        },
        "/socket.io": {
          target: API_URL,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
        "^https://forgeph-2\\.onrender\\.com/api/": {
          target: "https://forgeph-2.onrender.com",
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^https:\/\/forgeph-2\.onrender\.com/, '')
        }
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
  };
});