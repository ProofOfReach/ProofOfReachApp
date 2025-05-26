#!/bin/bash

echo "🔍 Running Pre-Build Validation for Nostr Ad Marketplace..."
echo "=================================================="

# Set strict error handling
set -e

# Track validation results
ERRORS=0
WARNINGS=0

# Function to log errors
log_error() {
    echo "❌ ERROR: $1"
    ERRORS=$((ERRORS + 1))
}

# Function to log warnings
log_warning() {
    echo "⚠️  WARNING: $1"
    WARNINGS=$((WARNINGS + 1))
}

# Function to log success
log_success() {
    echo "✅ $1"
}

echo ""
echo "1. Checking Import Case Sensitivity..."
echo "------------------------------------"
if node scripts/check-import-case.js | grep -q "No case sensitivity issues found"; then
    log_success "Import case sensitivity validation passed"
else
    log_error "Import case sensitivity issues found"
fi

echo ""
echo "2. Checking Critical Component Exports..."
echo "----------------------------------------"
CRITICAL_COMPONENTS=(
    "src/components/ui/Button.tsx"
    "src/components/ui/DashboardContainer.tsx"
    "src/components/ui/DashboardCard.tsx"
    "src/components/CurrencyAmount.tsx"
)

for component in "${CRITICAL_COMPONENTS[@]}"; do
    if [[ -f "$component" ]]; then
        log_success "$(basename "$component") exists"
    else
        log_error "Missing critical component: $component"
    fi
done

echo ""
echo "3. Quick TypeScript Check..."
echo "---------------------------"
if npx tsc --noEmit --skipLibCheck > /dev/null 2>&1; then
    log_success "TypeScript validation passed"
else
    log_warning "TypeScript validation found issues (non-blocking)"
fi

echo ""
echo "4. Checking for Broken Import Paths..."
echo "-------------------------------------"
# Check for common import issues
if grep -r "from.*ui/button'" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | head -1; then
    log_error "Found lowercase 'ui/button' imports"
else
    log_success "No broken import paths found"
fi

echo ""
echo "5. Testing Build Process..."
echo "--------------------------"
# Quick syntax check without full build
if npx next lint --quiet > /dev/null 2>&1; then
    log_success "Syntax validation passed"
else
    log_warning "Linting found issues (non-blocking for build)"
fi

echo ""
echo "📊 VALIDATION SUMMARY"
echo "===================="
echo "Errors: $ERRORS"
echo "Warnings: $WARNINGS"

if [[ $ERRORS -eq 0 ]]; then
    echo ""
    echo "🎉 Pre-build validation PASSED! Ready for production build."
    exit 0
else
    echo ""
    echo "🚫 Pre-build validation FAILED! Fix errors before building."
    echo "💡 Run individual checks to debug specific issues."
    exit 1
fi