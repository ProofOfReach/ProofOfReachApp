import React from 'react';

/**
 * Loading overlay displayed during role transitions
 * Shows a spinner and message when roles are being changed
 */
const RoleTransitionOverlay: React.FC<{
  isChangingRole: boolean;
}> = ({ isChangingRole }) => {
  if (!isChangingRole) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h3 className="text-lg font-bold mb-2">Changing Role</h3>
        <p className="text-gray-600">Please wait while we update your permissions...</p>
      </div>
    </div>
  );
};

export default RoleTransitionOverlay;