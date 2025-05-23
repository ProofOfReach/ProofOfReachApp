import React from 'react';

interface TestModeBannerProps {
  hideRoleControls?: boolean;
  currentRole?: string;
  availableRoles?: string[];
}

// Mock TestModeBanner component for tests
// This component is used to replace the real TestModeBanner in tests
export default function MockTestModeBanner({ 
  hideRoleControls = false, 
  currentRole = 'viewer',
  availableRoles = ['viewer', 'advertiser', 'publisher', 'admin'] 
}: TestModeBannerProps) {
  return (
    <div data-testid="test-mode-banner-mock" className="test-mode-banner">
      <div>Test Mode Active - Current Role: {currentRole}</div>
      {!hideRoleControls && (
        <div className="role-controls">
          <span>Switch Role:</span>
          {availableRoles.map(role => (
            <button key={role} data-role={role}>
              {role}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}