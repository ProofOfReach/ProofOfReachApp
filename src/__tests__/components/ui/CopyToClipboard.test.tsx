import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@/components/ui/CopyToClipboard';

// Mock the clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('CopyToClipboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with the provided display value', () => {
    render(<CopyToClipboard value="actual-value" displayValue="display-value" />);
    expect(screen.getByText('display-value')).toBeInTheDocument();
  });

  it('uses the actual value when no display value is provided', () => {
    render(<CopyToClipboard value="actual-value" />);
    expect(screen.getByText('actual-value')).toBeInTheDocument();
  });

  it('copies the actual value to clipboard when clicked', async () => {
    render(<CopyToClipboard value="actual-value" displayValue="display-value" />);
    
    // Click the display text
    fireEvent.click(screen.getByText('display-value'));
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('actual-value');
  });

  it('copies the actual value to clipboard when copy button is clicked', async () => {
    render(<CopyToClipboard value="actual-value" displayValue="display-value" />);
    
    // Find the button by its title
    const copyButton = screen.getByTitle('Copy to clipboard');
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('actual-value');
  });

  it('shows success message after copying', async () => {
    render(<CopyToClipboard value="actual-value" displayValue="display-value" successText="Custom success!" />);
    
    fireEvent.click(screen.getByText('display-value'));
    
    // Check that success message appears
    expect(await screen.findByText('Custom success!')).toBeInTheDocument();
  });

  it('shows default success message if not provided', async () => {
    render(<CopyToClipboard value="actual-value" />);
    
    fireEvent.click(screen.getByText('actual-value'));
    
    // Check that default success message appears
    expect(await screen.findByText('Copied!')).toBeInTheDocument();
  });

  it('applies custom class names', () => {
    const { container } = render(
      <CopyToClipboard 
        value="actual-value" 
        className="custom-class"
        iconClassName="custom-icon-class" 
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
    const iconElement = screen.getByTitle('Copy to clipboard').firstChild;
    expect(iconElement).toHaveClass('custom-icon-class');
  });
});