import React from 'react';
import { Button } from '@/components/ui/button';

/**
 * Props for the SkipButton component
 */
export interface SkipButtonProps {
  /** Handler function for skip action */
  onSkip?: () => void;
  /** Optional test ID for testing */
  testId?: string;
  /** Optional class name for additional styling */
  className?: string;
  /** Optional label text, defaults to "Skip" */
  label?: string;
}

/**
 * A reusable Skip button component with consistent styling
 * 
 * @example
 * <SkipButton onSkip={handleSkip} testId="publisher-skip-button" />
 */
const SkipButton: React.FC<SkipButtonProps> = ({
  onSkip,
  testId = 'skip-button',
  className = '',
  label = 'Skip'
}) => {
  if (!onSkip) return null;
  
  return (
    <Button
      onClick={onSkip}
      variant="outline"
      size="sm"
      className={`flex-shrink-0 ${className}`}
      data-testid={testId}
    >
      {label}
    </Button>
  );
};

export default SkipButton;