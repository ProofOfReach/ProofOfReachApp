# Role Switching Implementation

## Overview

This document describes the implementation of seamless role switching in the Nostr Ad Marketplace platform. It explains the events, components, and state management approach used to enable smooth transitions between different user roles (user, advertiser, publisher, admin, stakeholder) without requiring full page reloads.

## Key Components

### 1. ImprovedDashboardLayout.tsx

This component contains the main role switching interface visible in the test mode banner. It:

- Renders role switching buttons in the test mode banner
- Dispatches custom events when roles are changed
- Manages localStorage state for role information

### 2. Dashboard Pages

Dashboard pages (like `/dashboard/index.tsx`) listen for role change events and update their UI accordingly. They:

- Listen for multiple types of role-related events
- Update local state based on event data
- Re-render appropriate content based on the updated role

## Event System

Multiple event types are used to ensure reliable role switching:

1. **`roleSwitched` event**: Primary custom event that contains the previous role and new role
   ```typescript
   const roleSwitchedEvent = new CustomEvent('roleSwitched', {
     detail: { from: currentRole, to: newRole }
   });
   document.dispatchEvent(roleSwitchedEvent);
   ```

2. **`role-changed` event**: Secondary event with minimal role information
   ```typescript
   const roleChangedEvent = new CustomEvent('role-changed', {
     detail: { role: newRole }
   });
   window.dispatchEvent(roleChangedEvent);
   ```

3. **`dashboard-role-changed` event**: Dashboard-specific event for updating dashboard content
   ```typescript
   const event = new Event('dashboard-role-changed');
   window.dispatchEvent(event);
   ```

4. **`storage` event listener**: Fallback mechanism using localStorage changes
   ```typescript
   window.addEventListener('storage', (event) => {
     if (event.key === 'userRole' || event.key === 'currentRole') {
       const newRole = event.newValue;
       if (newRole) {
         setCurrentRole(newRole as UserRole);
       }
     }
   });
   ```

## Local Storage Keys

Role information is stored in multiple localStorage keys for compatibility with different parts of the application:

- `userRole`: Primary role identifier
- `currentRole`: Alternative role identifier
- `force_role_refresh`: Flag to trigger refreshes when needed
- `isTestMode`: Indicates if test mode is active

## Implementation Steps for New Components

To add role switching support to a new component:

1. Import the necessary types:
   ```typescript
   import type { UserRole } from '@/context/RoleContext';
   ```

2. Set up state to track the current role:
   ```typescript
   const [currentRole, setCurrentRole] = useState<UserRole>('user');
   ```

3. Add event listeners in a useEffect hook:
   ```typescript
   useEffect(() => {
     if (typeof window === 'undefined') return;
     
     // Get initial role state
     const role = localStorage.getItem('userRole') || 
                 localStorage.getItem('currentRole') || 'user';
     setCurrentRole(role as UserRole);
     
     // Listen for role change events
     const handleRoleChange = (event: CustomEvent) => {
       setCurrentRole(event.detail.to as UserRole);
     };
     
     document.addEventListener('roleSwitched', handleRoleChange as EventListener);
     
     return () => {
       document.removeEventListener('roleSwitched', handleRoleChange as EventListener);
     };
   }, []);
   ```

4. Render content conditionally based on the current role:
   ```typescript
   return (
     <div>
       {currentRole === 'advertiser' && <AdvertiserContent />}
       {currentRole === 'publisher' && <PublisherContent />}
       {/* etc. */}
     </div>
   );
   ```

## Best Practices

1. Always use the RoleService for role changes when possible
2. Include multiple event listeners for reliability
3. Avoid direct page reloads with `window.location.reload()`
4. Implement fallbacks for older code that might not support the event system
5. Update UI immediately after role changes, don't wait for events if possible