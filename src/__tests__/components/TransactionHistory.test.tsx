import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TransactionHistory from '../../components/TransactionHistory';
import { TransactionType } from '@prisma/client';

// Mock the CurrencyAmount component to simplify testing
jest.mock('../../components/CurrencyAmount', () => {
  return function MockCurrencyAmount({ 
    sats, 
    showTooltip = false, 
    className = '' 
  }: { 
    sats: number; 
    showTooltip?: boolean; 
    className?: string;
  }) {
    return (
      <span data-testid="currency-amount" className={className}>
        {sats.toLocaleString()} sats
      </span>
    );
  };
});

// Mock the CurrencyContext to always return BTC
jest.mock('../../context/CurrencyContext', () => ({
  useCurrency: () => ({ currency: 'BTC', setCurrency: jest.fn(), toggleCurrency: jest.fn() })
}));

describe('TransactionHistory Component', () => {
  it('renders loading state correctly', () => {
    render(<TransactionHistory transactions={[]} isLoading={true} />);
    
    // Should show loading skeleton
    const loadingElements = screen.getAllByTestId('loading-skeleton');
    expect(loadingElements.length).toBe(3); // 3 skeleton rows
  });
  
  it('renders empty state correctly', () => {
    render(<TransactionHistory transactions={[]} isLoading={false} />);
    
    // Should show no transactions message
    expect(screen.getByText('No transactions yet.')).toBeInTheDocument();
  });
  
  it('renders transactions correctly', () => {
    // Mock transactions data
    const transactions = [
      {
        id: '1',
        type: 'DEPOSIT' as TransactionType,
        amount: 5000,
        balanceBefore: 0,
        balanceAfter: 5000,
        description: 'Initial deposit',
        status: 'COMPLETED',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        type: 'WITHDRAWAL' as TransactionType,
        amount: 1500,
        balanceBefore: 5000,
        balanceAfter: 3500,
        description: 'Withdraw funds',
        status: 'COMPLETED',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        type: 'AD_PAYMENT' as TransactionType,
        amount: 500,
        balanceBefore: 3500,
        balanceAfter: 3000,
        description: null,
        status: 'COMPLETED',
        createdAt: new Date().toISOString()
      }
    ];
    
    render(<TransactionHistory transactions={transactions} isLoading={false} />);
    
    // Should show all transactions
    expect(screen.getByText('Deposit')).toBeInTheDocument();
    expect(screen.getByText('Withdrawal')).toBeInTheDocument();
    expect(screen.getByText('Ad Payment')).toBeInTheDocument();
    
    // Should show descriptions where available
    expect(screen.getByText('Initial deposit')).toBeInTheDocument();
    expect(screen.getByText('Withdraw funds')).toBeInTheDocument();
    
    // Since the CurrencyAmount component is mocked, just verify all expected values appear
    // somewhere in the rendered output by checking the data-testid elements directly
    const amountElements = screen.getAllByTestId('currency-amount');
    
    // Create an array of all the content text from amount elements
    const amountTexts = amountElements.map(el => el.textContent);
    
    // Check that all of our expected amounts are in the rendered component
    expect(amountTexts).toContain('5,000 sats');
    expect(amountTexts).toContain('1,500 sats');
    expect(amountTexts).toContain('500 sats');
    expect(amountTexts).toContain('3,500 sats');
    expect(amountTexts).toContain('3,000 sats');
  });
  
  it('renders publisher earnings correctly', () => {
    const transactions = [
      {
        id: '4',
        type: 'PUBLISHER_EARNING' as TransactionType,
        amount: 2000,
        balanceBefore: 3000,
        balanceAfter: 5000,
        description: 'Ad revenue',
        status: 'COMPLETED',
        createdAt: new Date().toISOString()
      }
    ];
    
    render(<TransactionHistory transactions={transactions} isLoading={false} />);
    
    // Should show publisher earning transaction
    expect(screen.getByText('Publisher Earning')).toBeInTheDocument();
    
    // Check currency amounts
    const amountElements = screen.getAllByTestId('currency-amount');
    const amountTexts = amountElements.map(el => el.textContent);
    expect(amountTexts).toContain('2,000 sats');
    expect(amountTexts).toContain('5,000 sats');
    
    expect(screen.getByText('Ad revenue')).toBeInTheDocument();
  });
  
  it('handles unknown transaction types gracefully', () => {
    const transactions = [
      {
        id: '5',
        type: 'UNKNOWN_TYPE' as unknown as TransactionType,
        amount: 1000,
        balanceBefore: 5000,
        balanceAfter: 6000,
        description: 'Unknown transaction',
        status: 'COMPLETED',
        createdAt: new Date().toISOString()
      }
    ];
    
    render(<TransactionHistory transactions={transactions} isLoading={false} />);
    
    // Should show fallback name for unknown transaction types
    expect(screen.getByText('Transaction')).toBeInTheDocument();
    
    // Should still show other transaction details
    expect(screen.getByText('Unknown transaction')).toBeInTheDocument();
    
    // Check currency amounts
    const amountElements = screen.getAllByTestId('currency-amount');
    const amountTexts = amountElements.map(el => el.textContent);
    expect(amountTexts).toContain('1,000 sats');
    expect(amountTexts).toContain('6,000 sats');
  });
  
  it('formats date correctly', () => {
    // Create a fixed date for testing
    const fixedDate = new Date('2023-01-01T12:00:00Z');
    const formattedDateString = fixedDate.toISOString();
    
    const transactions = [
      {
        id: '6',
        type: 'DEPOSIT' as TransactionType,
        amount: 1000,
        balanceBefore: 0,
        balanceAfter: 1000,
        description: 'Test date formatting',
        status: 'COMPLETED',
        createdAt: formattedDateString
      }
    ];
    
    render(<TransactionHistory transactions={transactions} isLoading={false} />);
    
    // The exact formatted string will depend on the locale of the test environment
    // but we can test that some date components are present
    const dateElement = screen.getByText(/1\/1\/2023|2023-1-1|01\/01\/2023/);
    expect(dateElement).toBeInTheDocument();
  });
  
  it('handles transactions without description', () => {
    const transactions = [
      {
        id: '7',
        type: 'DEPOSIT' as TransactionType,
        amount: 1000,
        balanceBefore: 0,
        balanceAfter: 1000,
        description: null,
        status: 'COMPLETED',
        createdAt: new Date().toISOString()
      }
    ];
    
    render(<TransactionHistory transactions={transactions} isLoading={false} />);
    
    // Should render the transaction without errors
    expect(screen.getByText('Deposit')).toBeInTheDocument();
    
    // Check currency amounts
    const amountElements = screen.getAllByTestId('currency-amount');
    const amountTexts = amountElements.map(el => el.textContent);
    expect(amountTexts).toContain('1,000 sats');
  });
});