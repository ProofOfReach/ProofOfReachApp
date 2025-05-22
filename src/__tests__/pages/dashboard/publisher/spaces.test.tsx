import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PublisherSpacesPage from '../../../../pages/dashboard/publisher/spaces';
import { useAuth } from '../../../../hooks/useAuth';
import { useRole } from '../../../../context/RoleContext';
import { useRouter } from 'next/router';

// Mock the hooks
jest.mock('../../../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../../context/RoleContext', () => ({
  useRole: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock the CurrencyAmount component
jest.mock('../../../../components/CurrencyAmount', () => {
  return function MockCurrencyAmount({ sats }: { sats: number }) {
    return <span data-testid="currency-amount">{sats} sats</span>;
  };
});

describe('Publisher Spaces Page', () => {
  // Set up our mocks before each test
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      auth: { user: { id: 'test-user-id' } },
    });
    
    (useRole as jest.Mock).mockReturnValue({
      role: 'publisher',
    });
    
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
    
    // Reset localStorage for consistent tests
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  test('renders ad spaces table with correct statuses', () => {
    render(<PublisherSpacesPage />);
    
    // Verify the Active status is shown
    expect(screen.getByText('Active')).toBeInTheDocument();
    
    // Verify the Awaiting Integration status is shown multiple times (for both spaces that need integration)
    const awaitingIntegrationElements = screen.getAllByText('Awaiting Integration');
    expect(awaitingIntegrationElements.length).toBe(2); // Should be 2 spaces with this status
    
    // Verify there's no 'Pending Approval' status
    expect(screen.queryByText('Pending Approval')).not.toBeInTheDocument();
  });

  test('all ad spaces have edit buttons available', () => {
    render(<PublisherSpacesPage />);
    
    // Get all the edit buttons
    const editButtons = screen.getAllByText('Edit');
    
    // We should have 3 edit buttons - one for each ad space
    expect(editButtons.length).toBe(3);
  });
  
  test('delete functionality works correctly', () => {
    // Mock window.confirm to always return true
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);
    
    render(<PublisherSpacesPage />);
    
    // Get the number of ad spaces before deletion
    const initialRows = screen.getAllByRole('row').length - 1; // Subtract header row
    
    // Find and click the first delete button
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Get the number of ad spaces after deletion
    const finalRows = screen.getAllByRole('row').length - 1; // Subtract header row
    
    // Verify one row was deleted
    expect(finalRows).toBe(initialRows - 1);
    
    // Restore original confirm
    window.confirm = originalConfirm;
  });
  
  test('respects domain without pending approval status', () => {
    render(<PublisherSpacesPage />);
    
    // Check that the Bitcoin News App (previously with PENDING_APPROVAL status) has AWAITING_INTEGRATION now
    const bitcoinNewsAppRow = screen.getByText('Bitcoin News App').closest('tr');
    
    // Verify it has the "Awaiting Integration" status
    expect(bitcoinNewsAppRow?.textContent).toContain('Awaiting Integration');
    
    // Verify it has an edit button (which wasn't available with PENDING_APPROVAL status)
    const editButton = bitcoinNewsAppRow?.querySelector('a[href*="edit"]');
    expect(editButton).toBeInTheDocument();
  });
});