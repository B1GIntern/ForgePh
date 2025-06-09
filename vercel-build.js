// Vercel build script
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure necessary files exist
function ensureFiles() {
  // Copy a simple package-vercel.json to package.json if it exists
  const vercelPackagePath = path.join(__dirname, 'frontend', 'package-vercel.json');
  const packageJsonPath = path.join(__dirname, 'frontend', 'package.json');
  
  if (fs.existsSync(vercelPackagePath)) {
    console.log('📝 Using Vercel-specific package.json...');
    fs.copyFileSync(vercelPackagePath, packageJsonPath);
  }
  
  // Create a simple .npmrc to ensure devDependencies are installed
  const npmrcPath = path.join(__dirname, '.npmrc');
  console.log('📝 Creating .npmrc to include dev dependencies...');
  fs.writeFileSync(npmrcPath, 'include=dev\nnode-linker=hoisted\n');
}

// Install frontend dependencies and build
function buildFrontend() {
  console.log('📦 Installing frontend dependencies...');
  try {
    execSync('cd frontend && npm install --include=dev', { stdio: 'inherit' });
  } catch (error) {
    console.error('⚠️ Error installing dependencies, retrying with basic install:', error.message);
    execSync('cd frontend && npm install', { stdio: 'inherit' });
  }

  // Explicitly install React plugins
  console.log('📦 Installing React plugins...');
  try {
    execSync('cd frontend && npm install @vitejs/plugin-react-swc @vitejs/plugin-react --save-dev', { stdio: 'inherit' });
  } catch (error) {
    console.error('⚠️ Error installing React plugins:', error.message);
  }

  // Try to run the build
  console.log('🔨 Building frontend...');
  try {
    execSync('cd frontend && npm run build', { stdio: 'inherit' });
  } catch (error) {
    console.error('⚠️ Build failed, trying with vanilla Vite command:', error.message);
    try {
      execSync('cd frontend && npx vite build', { stdio: 'inherit' });
    } catch (error2) {
      console.error('❌ All build attempts failed:', error2.message);
      throw error2;
    }
  }
}

// Main build process
async function build() {
  console.log('🚀 Starting Vercel build process...');
  
  // Ensure all necessary files exist
  ensureFiles();
  
  // Build frontend
  buildFrontend();
  
  console.log('✅ Build completed successfully!');
}

// Run the build
build().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
}); 