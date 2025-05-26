#!/bin/bash

# Pre-Deployment Check Script for Nostr Ad Marketplace
# This catches build errors BEFORE pushing to production

set -e

echo "🔍 Starting Pre-Deployment Validation..."

# 1. TypeScript Type Check (catches import errors, syntax issues)
echo "📝 Running TypeScript validation..."
npx tsc --noEmit --skipLibCheck

# 2. ESLint Check (catches code quality issues)
echo "🔧 Running linting check..."
npx next lint

# 3. Build Test (catches webpack/build errors)
echo "🏗️  Testing production build..."
npm run build

# 4. Import Analysis (catches missing dependencies)
echo "📦 Checking for missing imports..."
node scripts/check-imports.js

# 5. Route Validation (catches broken routes)
echo "🛣️  Validating routes..."
node scripts/validate-routes.js

echo "✅ All pre-deployment checks passed!"
echo "🚀 Ready for production deployment!"