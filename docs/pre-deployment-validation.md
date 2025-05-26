# Pre-Deployment Validation Guide

## 🛡️ Critical Commands to Run Before Any Deployment

**Always run these commands before deploying to catch errors early:**

### Quick Validation (30 seconds)
```bash
npx tsc --noEmit --skipLibCheck
```
**What it catches:** Import errors, syntax issues, type mismatches

### Full Validation (2-3 minutes)
```bash
npm run lint && npm run build
```
**What it catches:** Code quality issues, build failures, webpack errors

### Complete Pre-Deployment Check
```bash
bash scripts/pre-deployment-check.sh
```
**What it catches:** All the above plus route validation and dependency checks

## 🎯 Why This Matters

The TypeScript validation would have caught these common deployment blockers:
- Missing component imports (like DashboardLayout)
- Syntax errors (nullish coalescing operator issues)
- Broken file paths
- Type mismatches
- Missing dependencies

## 📋 Pre-Deployment Checklist

Before any production deployment:

- [ ] Run `npx tsc --noEmit --skipLibCheck`
- [ ] Fix any TypeScript errors
- [ ] Run `npm run lint`
- [ ] Fix any linting issues
- [ ] Run `npm run build`
- [ ] Verify build completes successfully
- [ ] Test key functionality in development
- [ ] Ready for deployment!

## 🚨 Emergency Deployment

If you need to deploy immediately with known errors:

1. Use the deployment config that skips validation:
   ```bash
   npm run build:skip-validation
   ```

2. Document known issues in deployment notes

3. Schedule immediate follow-up to fix validation errors

## 💡 Development Workflow

**Recommended daily workflow:**
1. Start development: `npm run dev`
2. Before committing: `npx tsc --noEmit --skipLibCheck`
3. Before deployment: `npm run build`

This approach prevents production surprises and maintains code quality!