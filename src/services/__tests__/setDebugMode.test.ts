import { TestModeService } from '../testModeService';
import { logger } from '../../lib/logger';

// Mock the logger
jest.mock('../../lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn()
  }
}));

// Mock minimal dependencies to initialize TestModeService
jest.mock('../enhancedStorageService', () => ({
  EnhancedStorageService: {
    getInstance: jest.fn().mockReturnValue({
      getItem: jest.fn(),
      setItem: jest.fn()
    })
  }
}));

jest.mock('../testModeStorageService', () => ({
  TestModeStorageService: {
    getInstance: jest.fn().mockReturnValue({
      getTestModeState: jest.fn(),
      saveTestModeState: jest.fn()
    })
  }
}));

jest.mock('../../lib/events/eventDispatcher', () => ({
  dispatchEvent: jest.fn()
}));

describe('TestModeService.setDebugMode', () => {
  let testModeService: TestModeService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    testModeService = TestModeService.getInstance();
  });
  
  it('enables debug mode and logs the action', () => {
    testModeService.setDebugMode(true);
    expect(logger.log).toHaveBeenCalledWith('TestModeService debug mode enabled');
  });
  
  it('disables debug mode and logs the action', () => {
    testModeService.setDebugMode(false);
    expect(logger.log).toHaveBeenCalledWith('TestModeService debug mode disabled');
  });
});