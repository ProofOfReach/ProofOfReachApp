# Error Handling System Documentation

## Overview

The Nostr Ad Marketplace incorporates a comprehensive, multi-layered error handling system designed to provide a robust user experience while facilitating detailed debugging information for developers. The system implements a phased approach consisting of three main components:

1. **Core Error Infrastructure** (Phase 1)
2. **User-Facing Error Components** (Phase 2)
3. **Global Error Integration** (Phase 3)

## Architecture

### Phase 1: Core Error Infrastructure

The core infrastructure provides the foundational services and utilities for error handling throughout the application:

- **`errorService.ts`**: Central service that manages error reporting, categorization, and logging.
- **`apiErrorHandler.ts`**: Specializes in handling and formatting API-related errors.
- **`formErrorHandler.ts`**: Manages form validation errors and provides user-friendly messages.

### Phase 2: User-Facing Error Components

Specialized React components for displaying different types of errors to the user:

- **`ErrorBoundary.tsx`**: React error boundary wrapper for catching rendering errors.
- **`ApiErrorDisplay.tsx`**: Displays API errors with appropriate formatting and retry options.
- **`FormErrorDisplay.tsx`**: Shows form validation errors with field highlighting.
- **`NetworkErrorDisplay.tsx`**: Handles connectivity issues with retry capabilities.
- **`PermissionErrorDisplay.tsx`**: Shows authorization and permission-related errors.
- **`ErrorToast.tsx`**: Toast notifications for transient errors.

### Phase 3: Global Error Integration

Provides global state management and integration between error handling components:

- **`ErrorContext.tsx`**: React context for application-wide error state management.
- **`errorIntegration.ts`**: Links error handling components to the global state.
- **`useErrorState.tsx`**: React hook for accessing error state in components.
- **`ErrorInitializer.tsx`**: Initializes error event listeners and monitoring.

## Usage Examples

### Using the Error Context

```tsx
import { useError } from '@/context/ErrorContext';

function MyComponent() {
  const { errorState, setError, clearError } = useError();
  
  // Check if there's an error
  if (errorState.hasError) {
    // Handle the error
  }
  
  // Set an error
  const handleFailure = () => {
    setError({
      message: 'Failed to load data',
      type: 'api',
      severity: 'error',
    });
  };
  
  // Clear errors
  const handleClearErrors = () => {
    clearError();
  };
  
  return (
    // Component JSX
  );
}
```

### Reporting Errors

```tsx
import { useErrorReporting } from '@/context/ErrorContext';

function DataFetcher() {
  const { reportError } = useErrorReporting();
  
  const fetchData = async () => {
    try {
      // Fetch data
    } catch (error) {
      reportError(error, 'data-fetcher', 'api');
    }
  };
  
  return (
    // Component JSX
  );
}
```

### Using Toast Notifications

```tsx
import { useErrorToast } from '@/context/ErrorContext';

function ActionButton() {
  const { showErrorToast } = useErrorToast();
  
  const handleClick = () => {
    try {
      // Perform action
    } catch (error) {
      showErrorToast('Failed to perform action', 'error');
    }
  };
  
  return <button onClick={handleClick}>Perform Action</button>;
}
```

### Handling API Errors

```tsx
import { ApiErrorDisplay } from '@/components/errors/ApiErrorDisplay';

function DataList() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  
  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      setData(data);
    } catch (error) {
      setError(error);
    }
  };
  
  if (error) {
    return (
      <ApiErrorDisplay 
        error={error}
        message="Could not load data"
        onRetry={fetchData}
      />
    );
  }
  
  return (
    // Data list rendering
  );
}
```

## Error Types and Categorization

The system categorizes errors by:

1. **Type**: The source of the error (api, validation, auth, network, etc.)
2. **Severity**: The criticality of the error (info, warning, error, critical)
3. **Source**: The component or module where the error occurred

This categorization allows for more effective error handling and reporting.

## Error Monitoring and Metrics

The system collects metrics on errors to help identify patterns and recurring issues:

- Total errors by type
- Error frequencies by severity
- Recent errors for quick access

In production, these metrics can be sent to monitoring services for analysis.

## Best Practices

1. **Always provide context**: Include source information when reporting errors.
2. **Use appropriate error components**: Choose the correct error component for the situation.
3. **Include retry mechanisms**: Where appropriate, provide users with retry options.
4. **Use clear language**: Error messages should be clear and actionable.
5. **Log detailed information**: For developers, but keep sensitive information out of user-facing messages.

## Testing Error Handling

The error handling system has comprehensive test coverage:

- Unit tests for all error services and utilities
- Component tests for error displays
- Integration tests for error state management

To run error handling tests:

```bash
npm test -- --testPathPattern=src/__tests__/components/errors/
npm test -- --testPathPattern=src/__tests__/lib/errorIntegration.test.ts
npm test -- --testPathPattern=src/__tests__/context/ErrorContext.test.tsx
```