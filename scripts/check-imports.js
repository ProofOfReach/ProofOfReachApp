#!/usr/bin/env node

/**
 * Import Checker - Validates all imports are resolvable
 * Prevents build failures from missing dependencies
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

function checkImports() {
  console.log('🔍 Checking for missing imports...');
  
  const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', { ignore: ['**/__tests__/**', '**/*.test.*'] });
  const errors = [];
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const importRegex = /import.*from ['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      // Skip node_modules imports
      if (!importPath.startsWith('.') && !importPath.startsWith('@/')) continue;
      
      let resolvedPath = importPath;
      if (importPath.startsWith('@/')) {
        resolvedPath = importPath.replace('@/', 'src/');
      } else {
        resolvedPath = path.resolve(path.dirname(file), importPath);
      }
      
      // Check if file exists
      const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
      const exists = extensions.some(ext => {
        try {
          return fs.existsSync(resolvedPath + ext);
        } catch {
          return false;
        }
      });
      
      if (!exists) {
        errors.push(`${file}: Cannot resolve '${importPath}'`);
      }
    }
  });
  
  if (errors.length > 0) {
    console.error('❌ Import errors found:');
    errors.forEach(error => console.error(`  ${error}`));
    process.exit(1);
  }
  
  console.log('✅ All imports are valid');
}

checkImports();