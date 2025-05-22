import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdApproval from '../../components/AdApproval';

const mockAd = {
  id: 'test-ad-123',
  title: 'Test Ad',
  description: 'This is a test ad description',
  finalDestinationUrl: 'https://example.com',
  advertiserNpub: 'npub1test123456789',
  bidPerImpression: 10,
  bidPerClick: 0,
  status: 'pending',
  createdAt: new Date().toISOString()
};

const mockSpace = {
  id: 'test-space-123',
  name: 'Test Ad Space',
  description: 'A test ad space',
  publisher: 'npub1publisher123'
};

describe('AdApproval Component', () => {
  const mockApprove = jest.fn();
  const mockReject = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the ad approval interface with ad details', () => {
    render(<AdApproval ad={mockAd} space={mockSpace} onApprove={mockApprove} onReject={mockReject} />);
    
    // Check that ad details are displayed
    expect(screen.getByText('Test Ad')).toBeInTheDocument();
    expect(screen.getByText('This is a test ad description')).toBeInTheDocument();
    expect(screen.getByText(/https:\/\/example.com/i)).toBeInTheDocument();
    
    // Check that advertiser info is displayed
    expect(screen.getByText('npub1test123456789')).toBeInTheDocument();
    
    // Check that space info is displayed
    expect(screen.getByText('Test Ad Space')).toBeInTheDocument();
    
    // Check that bid information is displayed correctly
    expect(screen.getByText('10 sats')).toBeInTheDocument();
    expect(screen.getByText('Not used')).toBeInTheDocument();
    
    // Check that status is displayed
    expect(screen.getByText('Pending Approval')).toBeInTheDocument();
    
    // Verify approve/reject buttons are present
    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });
  
  it('shows domain warning when URL is blacklisted', () => {
    const domainBlacklist = ['example.com', 'scam.com'];
    
    render(
      <AdApproval 
        ad={mockAd} 
        space={mockSpace} 
        onApprove={mockApprove} 
        onReject={mockReject} 
        domainBlacklist={domainBlacklist} 
      />
    );
    
    // Check that blacklist warning is shown
    expect(screen.getByText('Domain is on your blacklist')).toBeInTheDocument();
  });
  
  it('calls onApprove with correct parameters when approve button is clicked', async () => {
    render(<AdApproval ad={mockAd} space={mockSpace} onApprove={mockApprove} onReject={mockReject} />);
    
    // Click the approve button
    fireEvent.click(screen.getByText('Approve'));
    
    // Verify onApprove was called with correct parameters
    expect(mockApprove).toHaveBeenCalledWith('test-ad-123', 'test-space-123');
  });
  
  it('shows rejection form when reject button is clicked', () => {
    render(<AdApproval ad={mockAd} space={mockSpace} onApprove={mockApprove} onReject={mockReject} />);
    
    // Initial state should not have rejection form
    expect(screen.queryByText('Reason for Rejection')).not.toBeInTheDocument();
    
    // Click the reject button
    fireEvent.click(screen.getByText('Reject'));
    
    // Now the rejection form should be visible
    expect(screen.getByText('Reason for Rejection')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/explain why this ad is being rejected/i)).toBeInTheDocument();
  });
  
  it('calls onReject with correct parameters when rejection is submitted', async () => {
    render(<AdApproval ad={mockAd} space={mockSpace} onApprove={mockApprove} onReject={mockReject} />);
    
    // Show rejection form
    fireEvent.click(screen.getByText('Reject'));
    
    // Enter rejection reason
    const reasonInput = screen.getByPlaceholderText(/explain why this ad is being rejected/i);
    fireEvent.change(reasonInput, { target: { value: 'Content violates terms' } });
    
    // Submit the rejection
    fireEvent.click(screen.getByText('Submit Rejection'));
    
    // Verify onReject was called with correct parameters
    expect(mockReject).toHaveBeenCalledWith('test-ad-123', 'test-space-123', 'Content violates terms');
  });
  
  it('does not submit rejection when reason is empty', () => {
    render(<AdApproval ad={mockAd} space={mockSpace} onApprove={mockApprove} onReject={mockReject} />);
    
    // Show rejection form
    fireEvent.click(screen.getByText('Reject'));
    
    // Don't enter any reason
    
    // Try to submit the rejection
    fireEvent.click(screen.getByText('Submit Rejection'));
    
    // Verify onReject was NOT called
    expect(mockReject).not.toHaveBeenCalled();
  });
  
  it('allows canceling the rejection', () => {
    render(<AdApproval ad={mockAd} space={mockSpace} onApprove={mockApprove} onReject={mockReject} />);
    
    // Show rejection form
    fireEvent.click(screen.getByText('Reject'));
    
    // Cancel the rejection
    fireEvent.click(screen.getByText('Cancel'));
    
    // Verify we're back to the main view
    expect(screen.queryByText('Reason for Rejection')).not.toBeInTheDocument();
    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });
});