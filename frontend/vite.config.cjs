/**
 * CommonJS Vite configuration specifically for Vercel deployment
 */
const path = require('path');

// Simple React plugin configuration
let reactPlugin;
try {
  reactPlugin = require('@vitejs/plugin-react');
} catch (e) {
  try {
    reactPlugin = require('@vitejs/plugin-react-swc');
  } catch (e) {
    console.error("No React plugin found. Make sure either @vitejs/plugin-react or @vitejs/plugin-react-swc is installed.");
    process.exit(1);
  }
}

// Export a simple configuration that works reliably in Vercel
module.exports = {
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: true
  },
  plugins: [reactPlugin.default ? reactPlugin.default() : reactPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
}; 