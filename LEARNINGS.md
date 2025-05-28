# Project Learnings

## 2025-01-28 — Session Wrap-Up
**Session Goal:** Address Supabase authentication environment variable swapping issue and resolve role persistence problems in onboarding flow

**Decisions Made:**
- Decision 1: Implement automatic environment variable fix: Added runtime detection and correction for swapped NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY variables
- Decision 2: Add DATABASE_URL secret: Required for proper database connectivity with the existing authentication system

**What Was Done:**
- Enhanced Supabase client configuration with automatic variable swapping detection and correction
- Added comprehensive debugging and validation to identify environment configuration issues
- Provided DATABASE_URL secret for improved database connectivity
- Restarted all workflows to apply the new secret configuration

**Open Questions / Next Steps:**
1. Fix Publisher onboarding showing Viewer dashboard content instead of Publisher-specific content
2. Eliminate UI flash/transition after hitting "Go To Dashboard" button in onboarding completion
3. Complete Supabase authentication integration for proper user session management and role persistence

## 2025-01-27 — Session Wrap-Up
**Session Goal:** Clean up the login page UI by removing duplicate elements and making it more compact

**Decisions Made:**
- Decision 1: Remove footer links from login card but keep page footer: The login page should have a clean, minimal card without internal footer links, but still display the site footer at the bottom
- Decision 2: Fix duplicate banner issue: Only show the hackathon banner at the top, prevent TestModeBanner from appearing on login page to eliminate duplicates
- Decision 3: Make login card more compact: Reduced card width from max-w-md to max-w-sm and padding from p-8 to p-6 for better proportions

**What Was Done:**
- Removed duplicate TestModeBanner from login page by adding !isLoginPage condition
- Made login card smaller and more compact with reduced width and padding
- Fixed Layout component to show footer on login page (single footer, not duplicate)
- Made ProofOfReach logo smaller (h-10 instead of h-12) for better proportions
- Ensured only one hackathon banner appears at the very top of pages

**Open Questions / Next Steps:**
1. Address critical onboarding service errors that prevent user registration functionality
2. Fix TypeScript compilation errors in various dashboard components
3. Resolve test failures in dashboard components due to missing QueryClient providers