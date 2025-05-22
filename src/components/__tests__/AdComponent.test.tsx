import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import SimpleNostrFeed from '../SimpleNostrFeed';

// Extract AdComponent by rendering the parent component and accessing it
// This is necessary because AdComponent is defined inside SimpleNostrFeed.tsx

// Mock the IntersectionObserver
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe: jest.Mock;
  unobserve: jest.Mock;
  disconnect: jest.Mock;
  takeRecords: jest.Mock;
  callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    this.observe = jest.fn();
    this.unobserve = jest.fn();
    this.disconnect = jest.fn();
    this.takeRecords = jest.fn().mockReturnValue([]);
  }
  
  // Helper to trigger the intersection callback
  triggerIntersection(isIntersecting: boolean, target: Element) {
    const entry = {
      isIntersecting,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRatio: isIntersecting ? 1 : 0,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      target,
      time: Date.now(),
    };
    
    this.callback([entry] as IntersectionObserverEntry[], this as unknown as IntersectionObserver);
  }
}

// Setup global mocks before tests
beforeAll(() => {
  // Mock IntersectionObserver
  global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
  
  // Mock setTimeout
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

// Mock document.dispatchEvent to track when adViewed events are dispatched
const mockDocumentDispatchEvent = jest.fn();
const originalDispatchEvent = document.dispatchEvent;

describe('AdComponent', () => {
  beforeEach(() => {
    // Setup mock for document.dispatchEvent
    mockDocumentDispatchEvent.mockClear();
    document.dispatchEvent = jest.fn(event => {
      mockDocumentDispatchEvent(event);
      return originalDispatchEvent(event);
    });
  });
  
  afterEach(() => {
    // Restore original document.dispatchEvent
    document.dispatchEvent = originalDispatchEvent;
  });

  it('renders ad content correctly', () => {
    render(<SimpleNostrFeed showAds={true} adFrequency={1} />);
    
    // Since adFrequency is 1, there should be multiple ads visible
    expect(screen.getAllByText('Demo Ad').length).toBeGreaterThan(0);
    
    // Check for common ad elements
    const sponsoredLabels = screen.getAllByText('Sponsored');
    expect(sponsoredLabels.length).toBeGreaterThan(0);
    
    // Check for the call-to-action buttons in ads
    const ctaButtons = ['Learn More', 'Shop Now', 'Download Now'];
    const hasCtaButton = ctaButtons.some(text => screen.queryByText(text) !== null);
    expect(hasCtaButton).toBe(true);
  });
  
  it('triggers ad view event after 5 seconds of viewing', async () => {
    render(<SimpleNostrFeed showAds={true} adFrequency={1} />);
    
    // Find an ad element
    const adElement = screen.getAllByText('Demo Ad')[0].closest('div[class*="rounded-lg"]');
    expect(adElement).not.toBeNull();
    
    if (adElement) {
      // Get access to the IntersectionObserver instances
      const observers = (global.IntersectionObserver as unknown as jest.Mock).mock.instances;
      const observer = observers[observers.length - 1];
      
      // Simulate ad coming into view
      act(() => {
        observer.triggerIntersection(true, adElement);
      });
      
      // No event should be dispatched immediately (it should wait 5 seconds)
      expect(mockDocumentDispatchEvent).not.toHaveBeenCalled();
      
      // Fast-forward time by 5 seconds
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      // Now the event should have been dispatched
      await waitFor(() => {
        expect(mockDocumentDispatchEvent).toHaveBeenCalledTimes(1);
      });
      
      // Verify it's the right event type
      const event = mockDocumentDispatchEvent.mock.calls[0][0];
      expect(event.type).toBe('adViewed');
      expect(event.detail).toBeDefined();
      expect(typeof event.detail.amount).toBe('number');
      expect(typeof event.detail.advertiserName).toBe('string');
    }
  });
  
  it('cancels ad view timer when ad goes out of view', async () => {
    render(<SimpleNostrFeed showAds={true} adFrequency={1} />);
    
    // Find an ad element
    const adElement = screen.getAllByText('Demo Ad')[0].closest('div[class*="rounded-lg"]');
    expect(adElement).not.toBeNull();
    
    if (adElement) {
      // Get access to the IntersectionObserver instances
      const observers = (global.IntersectionObserver as unknown as jest.Mock).mock.instances;
      const observer = observers[observers.length - 1];
      
      // Simulate ad coming into view
      act(() => {
        observer.triggerIntersection(true, adElement);
      });
      
      // Move time forward by 2 seconds (not enough to trigger event)
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      
      // Simulate ad going out of view
      act(() => {
        observer.triggerIntersection(false, adElement);
      });
      
      // Move time forward past the 5 second mark
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      
      // Event should not have been dispatched because timer was canceled
      expect(mockDocumentDispatchEvent).not.toHaveBeenCalled();
      
      // Now bring the ad back into view
      act(() => {
        observer.triggerIntersection(true, adElement);
      });
      
      // Move time forward to trigger the event
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      // Now the event should have been dispatched
      await waitFor(() => {
        expect(mockDocumentDispatchEvent).toHaveBeenCalledTimes(1);
      });
    }
  });
  
  it('only rewards for viewing an ad once', async () => {
    render(<SimpleNostrFeed showAds={true} adFrequency={1} />);
    
    // Find an ad element
    const adElement = screen.getAllByText('Demo Ad')[0].closest('div[class*="rounded-lg"]');
    expect(adElement).not.toBeNull();
    
    if (adElement) {
      // Get access to the IntersectionObserver instances
      const observers = (global.IntersectionObserver as unknown as jest.Mock).mock.instances;
      const observer = observers[observers.length - 1];
      
      // First view: Simulate ad coming into view and staying for 5+ seconds
      act(() => {
        observer.triggerIntersection(true, adElement);
        jest.advanceTimersByTime(5000);
      });
      
      // Event should have been dispatched once
      await waitFor(() => {
        expect(mockDocumentDispatchEvent).toHaveBeenCalledTimes(1);
      });
      
      // Reset mock to clearly see if it gets called again
      mockDocumentDispatchEvent.mockClear();
      
      // Second view: Simulate ad going out of view and coming back
      act(() => {
        observer.triggerIntersection(false, adElement);
        jest.advanceTimersByTime(1000);
        observer.triggerIntersection(true, adElement);
        jest.advanceTimersByTime(5000);
      });
      
      // Event should not have been dispatched again
      expect(mockDocumentDispatchEvent).not.toHaveBeenCalled();
    }
  });
});