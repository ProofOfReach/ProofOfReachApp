import React, { ReactNode, createContext, useContext, useState } from 'react';

// Define a mock context interface based on the real interface
interface TestModeContextType {
  isTestMode: boolean;
  enableTestMode: () => void;
  disableTestMode: () => void;
  timeRemaining: number | null;
  enableAllRoles: () => Promise<boolean>;
  setCurrentRole: (role: string) => Promise<boolean>;
  isTestModeAvailable: boolean;
  isDevEnvironment: boolean;
  isDevelopment: boolean;
}

// Create a default context value
const defaultTestModeContext: TestModeContextType = {
  isTestMode: true, // Default to true for most tests
  enableTestMode: jest.fn(),
  disableTestMode: jest.fn(),
  timeRemaining: 240,
  enableAllRoles: jest.fn().mockResolvedValue(true),
  setCurrentRole: jest.fn().mockResolvedValue(true),
  isTestModeAvailable: true,
  isDevEnvironment: true,
  isDevelopment: true
};

// Create a mock context with default values
const TestModeContext = createContext<TestModeContextType>(defaultTestModeContext);

// Create a mock provider component with stateful behavior for better testing
export const TestModeProvider: React.FC<{ 
  children: ReactNode; 
  initialTestMode?: boolean;
  mockValue?: Partial<TestModeContextType>; 
}> = ({ 
  children, 
  initialTestMode = true,
  mockValue = {}
}) => {
  const [isTestMode, setIsTestMode] = useState(initialTestMode);
  const [timeRemaining, setTimeRemaining] = useState(initialTestMode ? 240 : null);
  
  const enableTestMode = jest.fn().mockImplementation(() => {
    setIsTestMode(true);
    setTimeRemaining(240);
    
    // Simulate localStorage operations that the real context would do
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('bypass_api_calls', 'true');
        localStorage.setItem('isTestMode', 'true');
        sessionStorage.setItem('testModeExpiry', String(Date.now() + 4 * 60 * 60 * 1000));
        sessionStorage.setItem('testModeEnabled', 'true');
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('test-mode-update', { 
          detail: { isTestMode: true } 
        }));
      } catch (error) {
        // Ignore errors in test environment
      }
    }
  });
  
  const disableTestMode = jest.fn().mockImplementation(() => {
    setIsTestMode(false);
    setTimeRemaining(null);
    
    // Simulate localStorage cleanup that the real context would do
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('bypass_api_calls');
        localStorage.removeItem('cachedAvailableRoles');
        localStorage.removeItem('roleCacheTimestamp');
        localStorage.removeItem('isTestMode');
        sessionStorage.removeItem('testModeExpiry');
        sessionStorage.removeItem('testModeEnabled');
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('test-mode-update', { 
          detail: { isTestMode: false } 
        }));
      } catch (error) {
        // Ignore errors in test environment
      }
    }
  });

  const enableAllRoles = jest.fn().mockImplementation(async () => {
    if (!isTestMode) return false;
    
    // Simulate role storage
    if (typeof window !== 'undefined') {
      try {
        const allRoles = ['user', 'advertiser', 'publisher', 'admin', 'stakeholder'];
        localStorage.setItem('cachedAvailableRoles', JSON.stringify(allRoles));
        localStorage.setItem('roleCacheTimestamp', Date.now().toString());
        
        // Dispatch role update event
        window.dispatchEvent(new CustomEvent('roles-updated', {
          detail: { availableRoles: allRoles }
        }));
      } catch (error) {
        // Ignore errors in test environment
        return false;
      }
    }
    
    return true;
  });
  
  const setCurrentRole = jest.fn().mockImplementation(async (role: string) => {
    if (!isTestMode) return false;
    
    // Simulate role change
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('currentRole', role);
        
        // Dispatch role change event
        window.dispatchEvent(new CustomEvent('role-changed', {
          detail: { role }
        }));
      } catch (error) {
        // Ignore errors in test environment
        return false;
      }
    }
    
    return true;
  });
  
  // Combine default values with any overrides
  const contextValue: TestModeContextType = {
    isTestMode,
    enableTestMode,
    disableTestMode,
    timeRemaining,
    enableAllRoles,
    setCurrentRole,
    isTestModeAvailable: true,
    isDevEnvironment: true,
    isDevelopment: true,
    ...mockValue
  };

  return (
    <TestModeContext.Provider value={contextValue}>
      {children}
    </TestModeContext.Provider>
  );
};

// Mock the useTestMode hook
export const useTestMode = jest.fn().mockImplementation(() => {
  return {
    isTestMode: true,
    enableTestMode: jest.fn(),
    disableTestMode: jest.fn(),
    timeRemaining: 240,
    enableAllRoles: jest.fn().mockResolvedValue(true),
    setCurrentRole: jest.fn().mockResolvedValue(true),
    isTestModeAvailable: true,
    isDevEnvironment: true,
    isDevelopment: true
  };
});

// Mock the getTestModeStatus utility function
export const getTestModeStatus = jest.fn().mockReturnValue(true);

// Additional utility functions 
export const isDevelopmentEnvironment = jest.fn().mockReturnValue(true);