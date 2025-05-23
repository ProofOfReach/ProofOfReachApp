import { render, screen, fireEvent } from '../test-utils';
import AdCard from '../../components/AdCard';
import { mockAds } from '../__mocks__/data';

describe('AdCard Component', () => {
  const mockOnStatusChange = jest.fn();
  
  beforeEach(() => {
    mockOnStatusChange.mockClear();
  });

  it('renders ad information correctly', () => {
    render(<AdCard ad={mockAds[0]} />);
    
    expect(screen.getByText(mockAds[0].title)).toBeInTheDocument();
    expect(screen.getByText(mockAds[0].description)).toBeInTheDocument();
    // Budget is only displayed in the expanded view, which we'll test in a separate test
  });

  it('shows budget information when expanded', () => {
    render(<AdCard ad={mockAds[0]} />);
    
    // Initially the budget isn't visible as the card is collapsed
    expect(screen.queryByText(`${mockAds[0]?.budget ?? 0} sats`)).not.toBeInTheDocument();
    
    // Click on the card to expand it
    fireEvent.click(screen.getByText(mockAds[0].title));
    
    // After expanding, budget should be visible
    expect(screen.getByText(`${mockAds[0]?.budget ?? 0} sats`)).toBeInTheDocument();
  });

  it('shows status badge with correct color', () => {
    render(<AdCard ad={mockAds[0]} />);
    
    // The status is converted to Title Case in the component (e.g., 'ACTIVE' becomes 'Active')
    const statusText = mockAds[0].status.charAt(0) + mockAds[0].status.slice(1).toLowerCase();
    const statusBadge = screen.getByText(statusText);
    expect(statusBadge).toBeInTheDocument();
    
    // Get the status badge by test ID instead
    const statusBadgeElement = screen.getByTestId('status-badge');
    
    // ACTIVE status should have green styling
    if (mockAds[0].status === 'ACTIVE') {
      expect(statusBadgeElement.className).toContain('bg-green');
    }
  });

  it('shows controls when showControls is true', () => {
    // We need to use an ACTIVE ad to ensure the control buttons are visible
    const activeAd = { ...mockAds[1], status: 'ACTIVE' };
    render(<AdCard ad={activeAd} showControls={true} onStatusChange={mockOnStatusChange} />);
    
    // Check for the pause button which should be present for an ACTIVE ad with showControls=true
    const pauseButton = screen.getByTestId('pause-button');
    expect(pauseButton).toBeInTheDocument();
    // The button doesn't have text, it uses an icon
  });

  it('hides controls when showControls is false', () => {
    render(<AdCard ad={mockAds[0]} showControls={false} />);
    
    // Should not find pause button when showControls is false
    const pauseButton = screen.queryByTestId('pause-button');
    
    expect(pauseButton).not.toBeInTheDocument();
  });

  it('calls onStatusChange when pause button is clicked for active ad', () => {
    render(
      <AdCard 
        ad={mockAds[0]} // Using ACTIVE ad
        showControls={true} 
        onStatusChange={mockOnStatusChange} 
      />
    );
    
    // Find the pause button (for ACTIVE ads) using the testId
    const pauseButton = screen.getByTestId('pause-button');
    fireEvent.click(pauseButton);
    
    expect(mockOnStatusChange).toHaveBeenCalledWith(mockAds[0].id, 'PAUSED');
  });
});