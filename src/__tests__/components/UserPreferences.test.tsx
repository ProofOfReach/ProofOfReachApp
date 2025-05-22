import { render, screen, fireEvent } from '../test-utils';
import UserPreferences from '../../components/UserPreferences';

describe('UserPreferences Component', () => {
  const mockPreferences = {
    shareLocation: true,
    shareInterests: true,
    shareBrowsing: false,
    shareAge: false
  };
  
  const mockOnSave = jest.fn();
  
  beforeEach(() => {
    mockOnSave.mockClear();
  });

  it('renders with provided preferences', () => {
    render(
      <UserPreferences 
        preferences={mockPreferences}
        onSave={mockOnSave}
        isSaving={false}
      />
    );
    
    // Check if the component displays the current preferences
    const shareLocationCheckbox = screen.getByLabelText(/share location/i);
    expect(shareLocationCheckbox).toBeChecked();
    
    const shareInterestsCheckbox = screen.getByLabelText(/share interests/i);
    expect(shareInterestsCheckbox).toBeChecked();
    
    const shareBrowsingCheckbox = screen.getByLabelText(/share browsing activity/i);
    expect(shareBrowsingCheckbox).not.toBeChecked();
    
    const shareAgeCheckbox = screen.getByLabelText(/share age group/i);
    expect(shareAgeCheckbox).not.toBeChecked();
  });

  it('calls onSave with updated preferences when form is submitted', () => {
    render(
      <UserPreferences 
        preferences={mockPreferences}
        onSave={mockOnSave}
        isSaving={false}
      />
    );
    
    // Toggle preferences
    const shareLocationCheckbox = screen.getByLabelText(/share location/i);
    fireEvent.click(shareLocationCheckbox); // Toggle off
    
    const shareBrowsingCheckbox = screen.getByLabelText(/share browsing activity/i);
    fireEvent.click(shareBrowsingCheckbox); // Toggle on
    
    // Submit the form
    const saveButton = screen.getByRole('button', { name: /save preferences/i });
    fireEvent.click(saveButton);
    
    // Verify onSave was called with the updated preferences
    expect(mockOnSave).toHaveBeenCalledWith({
      shareLocation: false,
      shareInterests: true,
      shareBrowsing: true,
      shareAge: false
    });
  });

  it('shows loading state when isSaving is true', () => {
    render(
      <UserPreferences 
        preferences={mockPreferences}
        onSave={mockOnSave}
        isSaving={true}
      />
    );
    
    const saveButton = screen.getByRole('button', { name: /saving/i });
    expect(saveButton).toBeDisabled();
    
    // Check if the loading spinner is shown
    const loadingSpinner = screen.getByText(/saving/i);
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('toggles all preferences correctly', () => {
    render(
      <UserPreferences 
        preferences={mockPreferences}
        onSave={mockOnSave}
        isSaving={false}
      />
    );
    
    // Toggle all preferences
    const checkboxes = [
      screen.getByLabelText(/share location/i),
      screen.getByLabelText(/share interests/i),
      screen.getByLabelText(/share browsing activity/i),
      screen.getByLabelText(/share age group/i)
    ];
    
    checkboxes.forEach(checkbox => {
      fireEvent.click(checkbox);
    });
    
    // Submit the form
    const saveButton = screen.getByRole('button', { name: /save preferences/i });
    fireEvent.click(saveButton);
    
    // Verify onSave was called with the updated preferences
    expect(mockOnSave).toHaveBeenCalledWith({
      shareLocation: false,
      shareInterests: false,
      shareBrowsing: true,
      shareAge: true
    });
  });
});