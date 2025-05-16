// Import Jest DOM matchers
require('@testing-library/jest-dom');

// Add TextEncoder and TextDecoder to global scope for nostr-tools
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock useAuthRefactored to fix tests
jest.mock('./src/hooks/useAuthRefactored', () => {
  return {
    __esModule: true,
    useAuthRefactored: jest.fn().mockReturnValue({
      authState: {
        roles: ['user', 'advertiser', 'publisher', 'admin'],
        isAuthenticated: true,
      },
      refreshRoles: jest.fn(),
      hasRole: jest.fn().mockReturnValue(true),
      assignRole: jest.fn().mockResolvedValue(true),
      removeRole: jest.fn().mockResolvedValue(true),
      login: jest.fn().mockResolvedValue(true),
      logout: jest.fn().mockResolvedValue(undefined),
    }),
    AuthContext: {
      Provider: ({ children }) => children,
    }
  };
});

// Mock the window.matchMedia function, which isn't available in Jest
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver for tests
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.observables = [];
    this.mockInstance = {
      observe: jest.fn((element) => {
        this.observables.push(element);
      }),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
      takeRecords: jest.fn(),
    };
  }
  
  // Simulate an intersection
  simulateIntersection(isIntersecting) {
    this.callback(
      this.observables.map(element => ({
        target: element,
        isIntersecting,
        boundingClientRect: {},
        intersectionRatio: isIntersecting ? 1 : 0,
        intersectionRect: {},
        rootBounds: null,
        time: Date.now(),
      })),
      this.mockInstance
    );
  }
}

// Set up the mock
const mockIntersectionObserverCtor = jest.fn().mockImplementation((cb, options) => {
  const instance = new MockIntersectionObserver(cb);
  return instance.mockInstance;
});

// Add to the global object
global.IntersectionObserver = mockIntersectionObserverCtor;

// Mock for localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock for Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '',
    query: {},
    asPath: '',
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    beforePopState: jest.fn(() => null),
    prefetch: jest.fn(() => null),
    isFallback: false,
  }),
}));

// Suppress console errors during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('ReactDOM.render is no longer supported') ||
       args[0].includes('Warning:'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});