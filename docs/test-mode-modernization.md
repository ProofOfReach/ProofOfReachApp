# TestMode Modernization Strategy

This document outlines the approach taken to modernize the TestMode system in order to resolve synchronization issues between components and improve overall architecture.

## Problems with the Original Implementation

1. **Storage Management Issues**
   - Mixed storage types (localStorage and sessionStorage)
   - Redundant storage keys
   - No encryption for sensitive testing flags

2. **Event Propagation Problems**
   - Inconsistent event names (`role-changed`, `roleSwitched`, `test-role-update`)
   - Incomplete event broadcasting
   - Inconsistent event payload formats

3. **Role Management Issues**
   - Multiple sources of truth for role state
   - Insufficient role validation
   - Manual multi-component updates

4. **Architecture Concerns**
   - Tight coupling between TestMode and role management
   - No middleware layer for change propagation
   - Complex legacy support
   - Inconsistent error handling

5. **Testing Challenges**
   - Insufficient unit test coverage
   - Hard-to-test global state
   - Inadequate mocking support

## Modernization Strategy

### Phase 1: Central State Management (Completed)

- Created `StorageService` to provide a consistent storage API
- Implemented `TestModeState` type for standardized state shape
- Consolidated storage keys in `STORAGE_KEYS` constant
- Added comprehensive error handling and type safety
- Created `updateTestModeState` helper to ensure consistent updates

### Phase 2: Decoupling Role Management (Completed)

- Established RoleManager as the single source of truth for role information
- Implemented clear separation between RoleContext and TestModeContext
- Added fallback mechanisms for backward compatibility
- Updated TestModeBanner to properly handle role switching events
- Improved environment-specific behavior (expanded in development, collapsed in tests)

### Phase 3: Standardized Event System (Completed)

- Created centralized event system for consistent cross-component communication
- Implemented type-safe event definitions and handlers
- Built unified event dispatch utility functions
- Maintained backward compatibility with legacy events
- Added React hooks for easy component integration
- Created documentation for the new event system

### Phase 4: Consistent Storage Strategy (Completed)

- Implemented enhanced storage service with encryption for sensitive test data
- Created storage events for cross-component synchronization
- Added TTL (Time-To-Live) support for cached data
- Improved storage error handling and recovery
- Added migration utilities for legacy storage formats
- Implemented comprehensive storage cleanup on test mode deactivation

### Phase 5: Component Updates (Completed)

- Updated all components to use the new TestMode API
- Enhanced TestModeBanner with better role switching capabilities
- Improved RoleDropdown to properly handle role availability and switching
- Fixed DebugRoleEnabler to function with the new role management system
- Added improved error handling to all components
- Implemented proper cleanup of event listeners to prevent memory leaks

### Phase 6: New Interface (In Progress)

1. Create a more intuitive TestMode API:
   - Replace direct context usage with custom hooks
   - Simplify role switching operations
   - Add developer-friendly utilities for common testing scenarios
   - Provide better TypeScript integration with full IntelliSense support

2. Implement TestMode service layer:
   - Create TestModeService as a singleton service
   - Move business logic from TestModeContext to service layer
   - Add comprehensive logging for diagnostic purposes
   - Create robust error handling and recovery mechanisms

3. Add new features:
   - Time-limited test sessions with automatic cleanup
   - Debug mode for detailed event logging
   - Test data generation utilities
   - Test scenario presets

## Benefits of the New Approach

1. **Single Source of Truth**
   - State is stored in a single, well-defined location
   - State updates trigger consistent event propagation
   - Components derive state rather than managing independent copies

2. **Type Safety**
   - Standardized interfaces for state and events
   - Comprehensive error handling
   - Consistent validation

3. **Maintainability**
   - Clear separation of concerns
   - Well-documented APIs
   - Easier to test and debug

4. **Performance**
   - Reduced redundant storage operations
   - More efficient event propagation
   - Better change tracking

## Migration Strategy

The migration is designed to be backward compatible:

1. Components using the old API will continue to work
2. Legacy events are still dispatched alongside new ones
3. Old storage patterns are supported but will be migrated
4. Console warnings guide developers to the new API

## Usage Examples

### Using the new TestMode in components:

```tsx
// Example of a component using the new TestMode system
const RoleSelector: React.FC = () => {
  const { 
    currentRole, 
    availableRoles, 
    setCurrentRole 
  } = useTestMode();
  
  const handleRoleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = event.target.value as UserRole;
    if (newRole !== currentRole) {
      const success = await setCurrentRole(newRole);
      if (!success) {
        console.error('Failed to change role');
      }
    }
  };
  
  return (
    <select value={currentRole} onChange={handleRoleChange}>
      {availableRoles.map(role => (
        <option key={role} value={role}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </option>
      ))}
    </select>
  );
};
```

### Using the new event system:

```tsx
// Example of a component using the new event system
import { useAppEvent } from '@/hooks/useAppEvent';
import { ROLE_EVENTS, dispatchNotification } from '@/lib/events';

const RoleChangeListener: React.FC = () => {
  // Listen for role changes with proper type safety
  useAppEvent(ROLE_EVENTS.ROLE_CHANGED, (payload) => {
    const { from, to } = payload;
    console.log(`Role changed from ${from} to ${to}`);
    
    // Dispatch a notification using the new event system
    dispatchNotification(
      'Role Changed',
      `Your role has been changed from ${from} to ${to}`,
      'info'
    );
  });
  
  return <div>Role change listener active</div>;
};
```