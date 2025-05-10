/**
 * Helper script to fix ESM vs CommonJS issues in Vercel deployment
 */
const fs = require('fs');
const path = require('path');

// Files that might need conversion from ESM to CommonJS
const filesToCheck = [
  'postcss.config.js',
  'tailwind.config.js',
  'eslint.config.js',
  'postcss.config.cjs',
  'tailwind.config.cjs'
];

console.log('🛠️ Checking and fixing ESM config files for Vercel compatibility...');

// Convert a file from ESM to CommonJS if needed
function fixEsmFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  console.log(`Checking ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Check for ESM export syntax
  if (content.includes('export default')) {
    console.log(`Converting ESM exports in ${filePath} to CommonJS`);
    content = content.replace(/export\s+default\s+/, 'module.exports = ');
    modified = true;
  }

  // Check for ESM import syntax
  if (content.includes('import ')) {
    console.log(`Converting ESM imports in ${filePath} to CommonJS`);
    
    // Replace import statements with require
    content = content.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, 'const $1 = require("$2")');
    
    // Handle destructured imports
    content = content.replace(/import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]/g, (match, imports, source) => {
      const importNames = imports.split(',').map(name => name.trim());
      return `const { ${importNames.join(', ')} } = require("${source}")`;
    });
    
    modified = true;
  }

  if (modified) {
    // Add a comment explaining the change
    content = `// Converted from ESM to CommonJS for Vercel compatibility\n${content}`;
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${filePath}`);
  } else {
    console.log(`✓ No issues found in ${filePath}`);
  }
}

// Process all config files that might need fixing
filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    fixEsmFile(filePath);
  }
});

console.log('🔍 Checking for other potential ESM files in the project...');

// Function to check if a file potentially uses ESM syntax
function mightBeEsmFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  const content = fs.readFileSync(filePath, 'utf8');
  return content.includes('export default') || 
         content.includes('export const') ||
         content.includes('export function') ||
         (content.includes('import ') && content.includes(' from '));
}

// Check config directory if it exists
const configDir = path.join(__dirname, 'config');
if (fs.existsSync(configDir) && fs.statSync(configDir).isDirectory()) {
  fs.readdirSync(configDir).forEach(file => {
    if (file.endsWith('.js') || file.endsWith('.cjs')) {
      const filePath = path.join(configDir, file);
      if (mightBeEsmFile(filePath)) {
        console.log(`Found potential ESM file in config directory: ${file}`);
        fixEsmFile(filePath);
      }
    }
  });
}

console.log('✅ ESM compatibility fixes completed'); 