# Project TODO

## [High Priority]
- [ ] Fix critical onboarding service errors that prevent user registration and authentication
- [ ] Resolve `string is not defined` error in onboardingService.ts
- [ ] Fix hydration mismatch error on login page (server/client HTML mismatch in DomainToggleButton)
- [ ] Fix TypeScript compilation errors (2048+ errors across the codebase)
- [ ] Address test failures in dashboard components due to missing QueryClient providers
- [ ] Fix production build errors: `ROLE_EVENTS is not defined` and `Button is not defined`

## [Medium Priority]  
- [ ] Fix ESLint warnings and code quality issues
- [ ] Resolve middleware authentication type errors
- [ ] Clean up role transition utility TypeScript errors
- [ ] Fix production build hanging issues

## [Low Priority]
- [ ] Address source map warnings
- [ ] Optimize test suite performance and reduce flakiness
- [ ] Update deprecated Prisma schema output path configuration