#!/bin/bash
echo "====================="
echo "Pre-Build Validation"
echo "====================="
echo "Running pre-build checks to ensure build quality..."

echo "1. TypeScript type checking..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "❌ TypeScript check failed"
  echo "Fix the type errors before proceeding with the build."
  exit 1
fi

echo "2. ESLint checking..."
npx next lint --max-warnings=0
if [ $? -ne 0 ]; then
  echo "❌ ESLint check failed"
  echo "Fix the linting errors before proceeding with the build."
  exit 1
fi

echo "3. Import case sensitivity checking..."
node scripts/check-import-case.js
if [ $? -ne 0 ]; then
  echo "❌ Import case sensitivity check failed"
  echo "Fix the import case issues before proceeding with the build."
  exit 1
fi

echo "✅ All pre-build checks passed!"
exit 0