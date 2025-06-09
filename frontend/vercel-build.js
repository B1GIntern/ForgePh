#!/usr/bin/env node

// Vercel build script that handles missing platform-specific dependencies
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Vercel build process...');

try {
  // Force install all rollup binaries to ensure compatibility
  console.log('Installing platform-specific rollup binaries...');
  execSync('npm install --save-optional @rollup/rollup-linux-x64-gnu@^4.21.0', { stdio: 'inherit' });
  
  // Run the actual build
  console.log('Running Vite build...');
  execSync('npm run build:vite', { stdio: 'inherit' });
  
  // Create redirects file for SPA
  const redirectsPath = path.join(__dirname, 'dist', '_redirects');
  fs.writeFileSync(redirectsPath, '/* /index.html 200\n');
  console.log('Created _redirects file');
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
} 