const { watch } = require('fs');
const { exec } = require('child_process');
const path = require('path');

// Directories to watch
const frontendSrcDir = path.join(__dirname, 'frontend', 'src');
const backendDir = path.join(__dirname, 'backend');

// Function to build the frontend
function buildFrontend() {
  console.log('🔄 Changes detected, rebuilding frontend...');
  exec('npm run build --prefix frontend', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Build error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`⚠️ Build warnings: ${stderr}`);
    }
    console.log('✅ Frontend rebuilt successfully!');
    console.log(stdout);
  });
}

// Watch frontend source files
console.log('👀 Watching frontend source files for changes...');
watch(frontendSrcDir, { recursive: true }, (eventType, filename) => {
  if (filename) {
    console.log(`File changed: ${filename}`);
    buildFrontend();
  }
});

// Initial build
console.log('🚀 Starting initial frontend build...');
buildFrontend();

console.log('⚡ Watch and build service started');
