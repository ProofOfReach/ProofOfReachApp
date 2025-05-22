import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdCard from '../../components/AdCard';

describe('AdCard Component URL Parameters', () => {
  it('renders the ad card with the target URL without any parameters', () => {
    const adData = {
      id: 'test-ad-id',
      title: 'Test Ad',
      description: 'A test ad description',
      targetUrl: 'https://example.com',
      urlParameters: '',
      status: 'ACTIVE',
      budget: 1000,
      dailyBudget: 100,
      bidPerImpression: 10,
      bidPerClick: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    render(<AdCard ad={adData} />);

    // Check that the ad card renders correctly
    expect(screen.getByText('Test Ad')).toBeInTheDocument();
    expect(screen.getByText('A test ad description')).toBeInTheDocument();
    
    // Expand the card to view details
    fireEvent.click(screen.getByText('Test Ad').closest('div')!.parentElement!);

    // Check that only the base URL is displayed
    expect(screen.getByText('Destination URL')).toBeInTheDocument();
    const link = screen.getByText('https://example.com');
    expect(link).toBeInTheDocument();
    
    // Verify URL parameters section is not shown
    expect(screen.queryByText('URL Parameters')).not.toBeInTheDocument();
  });

  it('displays URL with parameters when they are present', () => {
    const adData = {
      id: 'test-ad-id',
      title: 'Test Ad',
      description: 'A test ad description',
      targetUrl: 'https://example.com',
      urlParameters: 'utm_source=nostr&utm_medium=ad&utm_campaign=test',
      status: 'ACTIVE',
      budget: 1000,
      dailyBudget: 100,
      bidPerImpression: 10,
      bidPerClick: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    render(<AdCard ad={adData} />);

    // Check that the ad card renders correctly
    expect(screen.getByText('Test Ad')).toBeInTheDocument();
    
    // Expand the card to view details
    fireEvent.click(screen.getByText('Test Ad').closest('div')!.parentElement!);
    
    // Check that the URL parameters section is shown after expanding
    expect(screen.getByText('URL Parameters')).toBeInTheDocument();
    expect(screen.getByText('utm_source=nostr&utm_medium=ad&utm_campaign=test')).toBeInTheDocument();
    
    // Check that the link has the correct URL
    const link = screen.getByText('https://example.com');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', 'https://example.com?utm_source=nostr&utm_medium=ad&utm_campaign=test');
  });
});