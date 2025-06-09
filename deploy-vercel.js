const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure vercel.json exists with proper configuration
function ensureVercelConfig() {
  const vercelConfigPath = path.join(__dirname, 'vercel.json');
  const vercelConfig = {
    "version": 2,
    "builds": [
      {
        "src": "backend/server.js",
        "use": "@vercel/node"
      },
      {
        "src": "frontend/package.json",
        "use": "@vercel/static-build",
        "config": {
          "distDir": "dist",
          "buildCommand": "cd .. && npm run build:full"
        }
      }
    ],
    "routes": [
      { "src": "/api/(.*)", "dest": "/backend/server.js" },
      { "src": "/socket.io/(.*)", "dest": "/backend/server.js" },
      { "src": "/assets/(.*)", "dest": "/frontend/dist/assets/$1" },
      { "src": "/(.+\\.(js|css|ico|png|jpg|jpeg|svg|gif|webp|json))", "dest": "/frontend/dist/$1" },
      { "src": "/(.*)", "dest": "/frontend/dist/index.html" }
    ]
  };
  
  fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
  console.log('✅ vercel.json created/updated');
}

// Main deployment function
async function deploy() {
  try {
    console.log('🚀 Starting Vercel deployment preparation...');
    
    // Ensure vercel.json exists
    ensureVercelConfig();
    
    // Run the setup script to make sure all dependencies are installed
    console.log('📦 Running setup script...');
    execSync('npm run setup', { stdio: 'inherit' });
    
    // Build the frontend
    console.log('🔨 Building frontend...');
    execSync('npm run build', { stdio: 'inherit' });
    
    console.log(`
✅ Deployment preparation complete!

To deploy to Vercel, run:
  vercel

Or for production deployment:
  vercel --prod

Remember to set these environment variables in Vercel:
- MONGO_URI
- JWT_SECRET
- EMAIL_USER
- EMAIL_PASS
- NODE_ENV (set to "production")
- FRONTEND_URL (after first deployment)
- SOCKET_CORS_ORIGIN (after first deployment)
- ALLOW_ORIGINS (after first deployment)
    `);
  } catch (error) {
    console.error('❌ Deployment preparation failed:', error);
    process.exit(1);
  }
}

// Run the deployment
deploy(); 