import { defineConfig, loadEnv } from "vite";
import path from "path";

// Dynamically import React plugin based on availability
let reactPlugin;
try {
  // Try to import @vitejs/plugin-react-swc first
  reactPlugin = require("@vitejs/plugin-react-swc").default;
} catch (e) {
  try {
    // Fall back to @vitejs/plugin-react if available
    console.log("Warning: @vitejs/plugin-react-swc not found, falling back to @vitejs/plugin-react");
    reactPlugin = require("@vitejs/plugin-react").default;
  } catch (e2) {
    // If neither is available, provide a dummy plugin
    console.error("Error: Neither @vitejs/plugin-react-swc nor @vitejs/plugin-react found.");
    reactPlugin = () => ({ name: 'dummy-react-plugin' });
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd());
  
  // API URL - use environment variable or fallback to local backend
  // In Vercel, we use relative URLs for API
  const isVercel = process.env.VERCEL === "1";
  const API_URL = isVercel ? "" : (env.VITE_API_URL || "http://localhost:5001");

  return {
    root: '.',
<<<<<<< HEAD
    css: {
      transformer: 'postcss', // Explicitly use postcss instead of lightningcss
    },
=======
>>>>>>> 4feeb60ab07a57434df8595e7b3f09146d841baf
  build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: mode !== 'production',
      minify: mode === 'production',
    rollupOptions: {
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
<<<<<<< HEAD
    open: true, // Automatically open browser
=======
>>>>>>> 4feeb60ab07a57434df8595e7b3f09146d841baf
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
    plugins: [reactPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
  };
});