import { render, screen, fireEvent } from '../test-utils';
import SpaceCard from '../../components/SpaceCard';
import { mockSpaces } from '../__mocks__/data';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return (
      <a href={href} data-testid="mock-link">
        {children}
      </a>
    );
  };
});

describe('SpaceCard Component', () => {
  const mockOnDelete = jest.fn();
  const mockOnShowCode = jest.fn();
  
  beforeEach(() => {
    mockOnDelete.mockClear();
    mockOnShowCode.mockClear();
  });

  it('renders space information correctly', () => {
    // Create a modified version of the space with contentCategory
    const spaceWithContentCategory = {
      ...mockSpaces[0],
      contentCategory: mockSpaces[0].category,
      minBidPerImpression: 1,
      minBidPerClick: 10
    };
    
    render(
      <SpaceCard 
        space={spaceWithContentCategory} 
        onDelete={mockOnDelete} 
        onShowCode={mockOnShowCode} 
      />
    );
    
    expect(screen.getByText(mockSpaces[0].name)).toBeInTheDocument();
    expect(screen.getByText('728×90')).toBeInTheDocument();  // Dimension display
    
    // Look for "40" instead of "40 clicks" as the component renders them separately
    const totalClicksElement = screen.getByText('40');
    expect(totalClicksElement).toBeInTheDocument();
    
    // Also verify the "Total Clicks" label exists
    expect(screen.getByText('Total Clicks')).toBeInTheDocument();
  });

  it('renders space category correctly', () => {
    // Create a modified version of the space with contentCategory matching the category
    const spaceWithContentCategory = {
      ...mockSpaces[0],
      contentCategory: mockSpaces[0].category
    };
    
    render(
      <SpaceCard 
        space={spaceWithContentCategory} 
        onDelete={mockOnDelete} 
        onShowCode={mockOnShowCode} 
      />
    );
    
    // The category should be rendered
    expect(screen.getByText(mockSpaces[0].category)).toBeInTheDocument();
  });

  it('shows minimum bid information correctly', () => {
    const mockSpace = {
      ...mockSpaces[0],
      minBidPerImpression: 5,
      minBidPerClick: 50,
      contentCategory: 'TECHNOLOGY'
    };
    
    render(
      <SpaceCard 
        space={mockSpace} 
        onDelete={mockOnDelete} 
        onShowCode={mockOnShowCode} 
      />
    );
    
    expect(screen.getByText('5 sats')).toBeInTheDocument(); // minBidPerImpression
    expect(screen.getByText('50 sats')).toBeInTheDocument(); // minBidPerClick
  });

  it('calls onShowCode when Get Code button is clicked', () => {
    // Create a modified version of the space with contentCategory and min bids
    const spaceWithRequiredProps = {
      ...mockSpaces[0],
      contentCategory: mockSpaces[0].category,
      minBidPerImpression: 1,
      minBidPerClick: 10
    };
    
    render(
      <SpaceCard 
        space={spaceWithRequiredProps} 
        onDelete={mockOnDelete} 
        onShowCode={mockOnShowCode} 
      />
    );
    
    const getCodeButton = screen.getByText(/Get Code/i);
    fireEvent.click(getCodeButton);
    
    expect(mockOnShowCode).toHaveBeenCalledWith(spaceWithRequiredProps);
  });

  it('calls onDelete when Delete button is clicked after confirmation', () => {
    // Mock the window.confirm to return true
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);
    
    // Create a modified version of the space with contentCategory and min bids
    const spaceWithRequiredProps = {
      ...mockSpaces[0],
      contentCategory: mockSpaces[0].category,
      minBidPerImpression: 1,
      minBidPerClick: 10
    };
    
    render(
      <SpaceCard 
        space={spaceWithRequiredProps} 
        onDelete={mockOnDelete} 
        onShowCode={mockOnShowCode} 
      />
    );
    
    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(mockOnDelete).toHaveBeenCalledWith(mockSpaces[0].id);
    
    // Restore the original confirm function
    window.confirm = originalConfirm;
  });

  it('does not call onDelete when Delete confirmation is canceled', () => {
    // Mock the window.confirm to return false
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => false);
    
    // Create a modified version of the space with contentCategory and min bids
    const spaceWithRequiredProps = {
      ...mockSpaces[0],
      contentCategory: mockSpaces[0].category,
      minBidPerImpression: 1,
      minBidPerClick: 10
    };
    
    render(
      <SpaceCard 
        space={spaceWithRequiredProps} 
        onDelete={mockOnDelete} 
        onShowCode={mockOnShowCode} 
      />
    );
    
    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();
    
    // Restore the original confirm function
    window.confirm = originalConfirm;
  });
});