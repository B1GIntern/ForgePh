// Script specifically for building the frontend on Vercel
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel frontend build');

try {
  // Ensure all dependencies are installed
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Build the frontend
  console.log('🔨 Building frontend...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('✅ Frontend build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 