# Role Management System

## Overview

The Nostr Ad Marketplace features a comprehensive role-based access control (RBAC) system that manages user permissions across the application. This document outlines the architecture, usage patterns, and best practices for working with roles.

## Role Types

The system supports the following role types:

- `user`: Basic user role (default)
- `advertiser`: Can create and manage ads
- `publisher`: Can manage ad spaces and approve ads
- `admin`: Has full access to all features
- `stakeholder`: Can view analytics and business metrics

## Architecture

### Core Components

1. **Unified Role Service** (`/src/lib/unifiedRoleService.ts`)
   - Single source of truth for role operations
   - Handles role validation, assignment, and retrieval
   - Provides consistent API for role management

2. **Enhanced Authentication Middleware** (`/src/utils/enhancedAuthMiddleware.ts`)
   - Secures API routes with role-based access control
   - Validates user authentication and role permissions
   - Supports both regular and test mode authentication

3. **Access Control Service** (`/src/lib/accessControl.ts`)
   - Provides centralized permission checking
   - Defines granular access rules based on roles
   - Maps routes to role requirements

4. **Role Access Hook** (`/src/hooks/useRoleAccess.ts`)
   - React hook for components to check permissions
   - Provides intuitive API for UI role-based rendering
   - Efficiently memoizes permission checks

5. **Role Context** (`/src/context/NewRoleContextRefactored.tsx`)
   - Manages role state throughout the application
   - Handles role transitions and caching
   - Supports test mode for development

## Usage Patterns

### Server-Side Authentication

Secure API routes with role-based middleware:

```typescript
// Basic authentication
export default enhancedAuthMiddleware(handler);

// Require specific roles
export default requireRoles(['admin', 'publisher'])(handler);

// Convenience methods
export default requireAdmin(handler);
export default requireAdvertiser(handler);
```

### Client-Side Permission Checking

Check permissions in React components:

```typescript
import { useRoleAccess } from '../hooks/useRoleAccess';

function AdCreationButton() {
  const { canCreateAds } = useRoleAccess();
  
  if (!canCreateAds()) {
    return null;
  }
  
  return <button>Create New Ad</button>;
}
```

### Role Transitions

Change roles programmatically:

```typescript
import { useRoleRefactored } from '../context/NewRoleContextRefactored';

function RoleSwitcher() {
  const { setRole, availableRoles } = useRoleRefactored();
  
  const handleRoleChange = async (role) => {
    await setRole(role);
    // UI will update automatically
  };
  
  return (
    <select onChange={(e) => handleRoleChange(e.target.value)}>
      {availableRoles.map(role => (
        <option key={role} value={role}>{role}</option>
      ))}
    </select>
  );
}
```

## Test Mode

The system includes a test mode that allows developers to:

- Access all roles during development
- Bypass server authentication when needed
- Simulate different role scenarios

To enable test mode:

```javascript
// In browser console or test script
localStorage.setItem('isTestMode', 'true');
localStorage.setItem('userRole', 'admin');
localStorage.setItem('force_role_refresh', 'true');
// Reload the page
```

## Best Practices

1. **Always use the enhanced middleware for API routes**
   - Ensures consistent security across the application
   - Provides detailed logging and error handling

2. **Use the useRoleAccess hook for UI permissions**
   - Provides a clean, consistent API
   - Ensures efficient React rendering

3. **Keep role checks granular**
   - Check specific permissions rather than roles when possible
   - Use the most specific permission check available

4. **Cache roles appropriately**
   - Roles are automatically cached for performance
   - Force refresh when needed with proper cache invalidation

5. **Validate roles on both client and server**
   - Never trust client-side role claims
   - Always verify permissions server-side for critical operations

## Troubleshooting

Common issues and solutions:

- **Role not updating**: Use the `force_role_refresh` flag to trigger a refresh
- **Permission denied unexpectedly**: Check both current role and available roles
- **Test mode not working**: Ensure all required localStorage flags are set

For more detailed issues, consult the application logs which contain detailed role transition information.