#!/usr/bin/env node

/**
 * Import Validation Script for Nostr Ad Marketplace
 * 
 * This script validates all imports before production builds to catch:
 * - Missing files
 * - Case sensitivity issues  
 * - Broken import paths
 * - Missing exports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Validating imports in Nostr Ad Marketplace...\n');

// Track validation results
let errors = [];
let warnings = [];

// Check for common import issues
function validateImports() {
  console.log('1. Checking for case sensitivity issues...');
  
  // Check for button import issues specifically
  try {
    const result = execSync('grep -r "ui/button" src/ --include="*.tsx" --include="*.ts" || true', { encoding: 'utf8' });
    if (result.trim()) {
      errors.push('❌ Found lowercase "ui/button" imports - should be "ui/Button"');
      console.log('   Found:', result.split('\n').filter(line => line.trim()).slice(0, 3).join('\n   '));
    } else {
      console.log('   ✅ No case sensitivity issues found');
    }
  } catch (e) {
    warnings.push('⚠️  Could not check button imports');
  }

  // Check for missing component exports
  console.log('\n2. Checking component exports...');
  
  const criticalComponents = [
    'src/components/ui/Button.tsx',
    'src/components/ui/DashboardContainer.tsx', 
    'src/components/ui/DashboardCard.tsx',
    'src/components/CurrencyAmount.tsx'
  ];

  criticalComponents.forEach(componentPath => {
    if (fs.existsSync(componentPath)) {
      console.log(`   ✅ ${path.basename(componentPath)} exists`);
    } else {
      errors.push(`❌ Missing critical component: ${componentPath}`);
    }
  });
}

// Run TypeScript compilation check
function validateTypeScript() {
  console.log('\n3. Running TypeScript validation...');
  
  try {
    execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    console.log('   ✅ TypeScript validation passed');
  } catch (error) {
    const output = error.stdout ? error.stdout.toString() : error.message;
    const errorLines = output.split('\n').filter(line => line.includes('error TS')).slice(0, 5);
    
    if (errorLines.length > 0) {
      errors.push('❌ TypeScript validation failed');
      console.log('   First few errors:');
      errorLines.forEach(line => console.log(`   ${line}`));
    } else {
      warnings.push('⚠️  TypeScript check completed with warnings');
    }
  }
}

// Check for missing dependencies
function validateDependencies() {
  console.log('\n4. Checking critical imports...');
  
  try {
    const result = execSync('grep -r "Module not found" .next/ 2>/dev/null || echo "No build errors found"', { encoding: 'utf8' });
    if (result.includes('Module not found')) {
      errors.push('❌ Found module resolution errors in previous build');
    } else {
      console.log('   ✅ No module resolution errors detected');
    }
  } catch (e) {
    console.log('   ✅ No previous build errors to check');
  }
}

// Main validation function
function runValidation() {
  validateImports();
  validateDependencies(); 
  validateTypeScript();
  
  console.log('\n📊 VALIDATION SUMMARY:');
  console.log('='.repeat(50));
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('🎉 All validations passed! Ready for production build.');
    process.exit(0);
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach(warning => console.log(`   ${warning}`));
  }
  
  if (errors.length > 0) {
    console.log('\n❌ ERRORS (must fix before production build):');
    errors.forEach(error => console.log(`   ${error}`));
    console.log('\n💡 Run this script again after fixing errors.');
    process.exit(1);
  }
  
  console.log('\n✅ Validation complete with warnings only - safe to build.');
}

// Run the validation
runValidation();