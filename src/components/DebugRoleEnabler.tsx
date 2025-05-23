import React from 'react';

/**
 * Simplified debug component for test mode
 * Minimal version to avoid dependency issues
 */
const DebugRoleEnabler = () => {
  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg border border-gray-600">
        <div className="text-sm font-semibold mb-2">🔧 Debug Panel</div>
        <div className="text-xs text-gray-300">
          Dev Mode Active
        </div>
      </div>
    </div>
  );
};

export default DebugRoleEnabler;