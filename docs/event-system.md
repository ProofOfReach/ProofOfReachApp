# Nostr Ad Marketplace Event System

This document describes the implementation of the unified event system for the Nostr Ad Marketplace application.

## Overview

The event system provides a standardized way to dispatch and listen to events across the application. It ensures consistent event naming, payload structures, and proper type safety. The system supports both modern and legacy event patterns for backward compatibility.

## Core Components

### 1. Event Types

Located in `src/lib/events/eventTypes.ts`, this file defines:

- Standard event type constants
- Type definitions for event payloads
- Helper functions for type checking

### 2. Event Dispatcher

Located in `src/lib/events/eventDispatcher.ts`, this file provides:

- Type-safe functions for dispatching events
- Automatic handling of legacy event patterns
- Error handling for event dispatching

### 3. Event Listener

Located in `src/lib/events/eventListener.ts`, this file provides:

- Type-safe functions for subscribing to events
- Automatic cleanup functions to prevent memory leaks
- Support for both modern and legacy event patterns

### 4. React Hooks

Located in `src/hooks/useAppEvent.ts`, this file provides:

- React hooks for easy subscription to events in components
- Automatic cleanup when components unmount
- Type safety for event payloads

## Integration with Role System

The event system is closely integrated with the role management system:

- Role change events use the unified event system
- TestMode activation/deactivation uses the unified event system
- Legacy code is updated to use the new system via adapter patterns

## Usage Examples

### Dispatching Events

```typescript
import { notifyRoleChanged } from '@/lib/events';

// Notify that the user's role has changed
notifyRoleChanged('user', 'advertiser', ['user', 'advertiser']);
```

### Listening to Events in Components

```typescript
import { useAppEvent } from '@/hooks/useAppEvent';
import { ROLE_EVENTS } from '@/lib/events';

function MyComponent() {
  useAppEvent(ROLE_EVENTS.ROLE_CHANGED, (payload) => {
    console.log(`Role changed from ${payload.from} to ${payload.to}`);
  });
  
  return <div>...</div>;
}
```

## Legacy Support

The system maintains backward compatibility with existing code:

- Legacy event types are mapped to modern events
- Legacy event handlers continue to work
- Deprecation warnings are shown in development

## Testing

The event system is fully tested to ensure reliability:

- Unit tests for event dispatching
- Unit tests for event listening
- Integration tests with React components

## Future Enhancements

Planned enhancements to the event system:

1. Event persistence for offline recovery
2. Event debugging tools
3. Event analytics for monitoring user behavior