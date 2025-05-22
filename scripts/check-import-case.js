/**
 * Check Import Case Sensitivity
 * 
 * This script scans your codebase for potential case sensitivity issues in imports.
 * It helps prevent build errors that only appear in production or case-sensitive file systems.
 * 
 * Usage:
 *   node scripts/check-import-case.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}Running import case sensitivity check...${colors.reset}\n`);

// Get all component files
const componentFiles = glob.sync('src/components/**/*.{tsx,jsx,ts,js}');
console.log(`${colors.blue}Found ${componentFiles.length} component files to check against${colors.reset}`);

// Map all components by lowercase name for easy lookup
const componentMap = {};
const componentNameMap = {};

componentFiles.forEach(file => {
  const basename = path.basename(file).toLowerCase();
  const dirname = path.dirname(file).toLowerCase();
  const fullPath = path.join(dirname, basename);
  
  componentMap[basename] = file;
  
  // Also track by full path relative to src/components
  const relativePath = file.replace(/^src\/components\//, '').toLowerCase();
  componentNameMap[relativePath] = file;
});

// Check all source files for imports that might have case issues
const sourceFiles = glob.sync('src/**/*.{tsx,jsx,ts,js}');
console.log(`${colors.blue}Checking ${sourceFiles.length} source files for imports...${colors.reset}\n`);

let totalIssues = 0;
let filesWithIssues = 0;

sourceFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let fileHasIssues = false;
  
  // Look for component imports from our project
  // This regex tries to match both @/components/ style imports and relative imports
  const importRegex = /from\s+['"](@\/components\/|\.\.\/\.\.\/components\/|\.\.\/components\/)([^'"]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPrefix = match[1]; // The import prefix (@/components/, etc.)
    const importPath = match[2]; // The path after the prefix
    const importBasename = path.basename(importPath).toLowerCase();
    const importDirname = path.dirname(importPath).toLowerCase();
    
    // Check case sensitivity issues for the filename itself
    if (componentMap[importBasename]) {
      const actualFile = componentMap[importBasename];
      const actualBasename = path.basename(actualFile);
      
      // If the actual filename case doesn't match the imported one
      if (path.basename(importPath) !== actualBasename) {
        if (!fileHasIssues) {
          console.log(`${colors.yellow}Issues in ${colors.magenta}${file}${colors.yellow}:${colors.reset}`);
          fileHasIssues = true;
          filesWithIssues++;
        }
        
        console.log(`  ${colors.red}Case mismatch in filename:${colors.reset}`);
        console.log(`    ${colors.red}Imported as:${colors.reset} ${importPath}`);
        console.log(`    ${colors.green}Should be:${colors.reset} ${importPath.replace(path.basename(importPath), actualBasename)}`);
        totalIssues++;
      }
    }
    
    // Check for the full path case sensitivity
    const fullImportPath = path.join(importDirname, importBasename);
    const lookupPath = importPath.toLowerCase();
    
    if (componentNameMap[lookupPath] && 
        importPath !== componentNameMap[lookupPath].replace(/^src\/components\//, '')) {
      if (!fileHasIssues) {
        console.log(`${colors.yellow}Issues in ${colors.magenta}${file}${colors.yellow}:${colors.reset}`);
        fileHasIssues = true;
        filesWithIssues++;
      }
      
      const correctPath = componentNameMap[lookupPath].replace(/^src\/components\//, '');
      
      console.log(`  ${colors.red}Case mismatch in path:${colors.reset}`);
      console.log(`    ${colors.red}Imported as:${colors.reset} ${importPath}`);
      console.log(`    ${colors.green}Should be:${colors.reset} ${correctPath}`);
      totalIssues++;
    }
  }
});

// Check for UI component case sensitivity specifically
const uiComponentImportRegex = /@\/components\/ui\/([^'"]+)/g;
const uiComponents = glob.sync('src/components/ui/*.{tsx,jsx,ts,js}');
const uiComponentMap = {};

uiComponents.forEach(file => {
  uiComponentMap[path.basename(file).toLowerCase()] = path.basename(file);
});

sourceFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let fileHasIssues = false;
  let match;
  
  while ((match = uiComponentImportRegex.exec(content)) !== null) {
    const importedComponent = match[1];
    const importedBasename = path.basename(importedComponent).toLowerCase();
    
    if (uiComponentMap[importedBasename] && 
        importedComponent !== uiComponentMap[importedBasename]) {
      if (!fileHasIssues) {
        console.log(`${colors.yellow}UI Component issues in ${colors.magenta}${file}${colors.yellow}:${colors.reset}`);
        fileHasIssues = true;
        filesWithIssues++;
      }
      
      console.log(`  ${colors.red}UI Component case mismatch:${colors.reset}`);
      console.log(`    ${colors.red}Imported as:${colors.reset} ${importedComponent}`);
      console.log(`    ${colors.green}Should be:${colors.reset} ${uiComponentMap[importedBasename]}`);
      totalIssues++;
    }
  }
});

// Summary
console.log(`\n${colors.cyan}=== Import Case Check Summary ===${colors.reset}`);
if (totalIssues === 0) {
  console.log(`${colors.green}✓ No case sensitivity issues found!${colors.reset}`);
} else {
  console.log(`${colors.red}✗ Found ${totalIssues} case sensitivity issues in ${filesWithIssues} files${colors.reset}`);
  console.log(`${colors.yellow}Fix these issues to prevent build errors in production environments.${colors.reset}`);
  process.exit(1); // Exit with error code so it can fail CI pipelines
}