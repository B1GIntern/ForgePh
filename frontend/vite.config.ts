import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  root: '.', // Ensure Vite looks in the root directory
  // Add the build configuration
  build: {
    outDir: 'dist', // This specifies where Vite will output the build files
    emptyOutDir: true, // Clean the output directory before building
    sourcemap: process.env.NODE_ENV !== 'production', // Generate sourcemaps in development mode
    minify: process.env.NODE_ENV === 'production', // Only minify in production
    rollupOptions: {
      cache: true, // Enable Rollup cache for faster rebuilds
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'], // Separate vendor chunks
        },
      },
    },
  },
  server: {
    host: "::",
    port: 8080,
    strictPort: false, // Allow Vite to use another port if 8080 is in use
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      "/socket.io": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));