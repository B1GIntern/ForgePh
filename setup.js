const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if a file exists
function fileExists(filepath) {
  try {
    return fs.existsSync(filepath);
  } catch (err) {
    return false;
  }
}

// Ensure frontend environment files exist
function ensureEnvFiles() {
  const frontendDir = path.join(__dirname, 'frontend');
  const devEnvPath = path.join(frontendDir, '.env');
  const prodEnvPath = path.join(frontendDir, '.env.production');
  
  // Create dev .env file if it doesn't exist
  if (!fileExists(devEnvPath)) {
    console.log('📝 Creating development .env file');
    fs.writeFileSync(
      devEnvPath,
      `# Frontend Environment Variables\nVITE_API_URL=http://localhost:5001\nVITE_APP_NAME=ForgePhilippines`
    );
  }
  
  // Create production .env file if it doesn't exist
  if (!fileExists(prodEnvPath)) {
    console.log('📝 Creating production .env file');
    fs.writeFileSync(
      prodEnvPath,
      `# Production Environment Variables\nVITE_API_URL=https://forgeph-2.onrender.com\nVITE_APP_NAME=ForgePhilippines`
    );
  }
}

// Main setup function
async function setup() {
  console.log('🚀 Setting up ForgePhilippines project...');
  
  // Ensure environment files exist
  ensureEnvFiles();
  
  // Install root dependencies
  console.log('📦 Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Install frontend dependencies
  console.log('📦 Installing frontend dependencies...');
  execSync('npm install --prefix frontend', { stdio: 'inherit' });
  
  console.log('✅ Project setup complete!');
  console.log(`
To start development:
  npm run dev      - Start both backend and frontend
  npm run server   - Start only backend
  npm run client   - Start only frontend

To build for production:
  npm run build:full  - Install all dependencies and build the frontend
  `);
}

setup().catch(err => {
  console.error('❌ Setup failed:', err);
  process.exit(1);
}); 