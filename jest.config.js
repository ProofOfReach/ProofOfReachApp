module.exports = {
  testEnvironment: 'jsdom',
  // Exclude node_modules, .next, and test utility files
  testPathIgnorePatterns: [
    '/node_modules/', 
    '/.next/',
    '/__mocks__/',
    '/src/__tests__/__mocks__/',
    '/src/__tests__/test-utils.tsx'
  ],
  // Limit workers to reduce CPU usage
  maxWorkers: '50%',
  // Use serial execution for tests that touch the same resources
  maxConcurrency: 5,
  // Only run test files and not utility files
  testRegex: '(/__tests__/.*\\.(test|spec))\\.[jt]sx?$',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/_app.tsx',
    '!src/**/_document.tsx',
    '!src/__tests__/**/*',
    '!**/__mocks__/**',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      statements: 0,  // To be increased as coverage improves
      branches: 0,    // To be increased as coverage improves
      functions: 0,   // To be increased as coverage improves
      lines: 0,       // To be increased as coverage improves
    },
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
    '^.+\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    // Mock components to avoid test mode context issues
    '^src/components/TestModeBanner$': '<rootDir>/src/__mocks__/components/TestModeBanner.tsx',
    '^src/components/Layout$': '<rootDir>/src/__mocks__/components/Layout.tsx',
    // Add aliases to make imports cleaner
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@supabase/auth-helpers-shared|@supabase/auth-helpers-nextjs|jose)/)',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
};