import React from 'react';
import { defaultUseRole as refactoredUseRole } from '../../context/NewRoleContextRefactored';
import { defaultUseRole as originalUseRole } from '../../context/NewRoleContext';
import RoleTransitionOverlay from './RoleTransitionOverlay';

/**
 * Connected version of RoleTransitionOverlay that automatically
 * gets the isChangingRole state from the role context
 * 
 * This works with both the original and refactored role contexts
 * by trying to get the state from both
 */
const ConnectedRoleTransitionOverlay: React.FC = () => {
  // Try to get from refactored context first
  let isChangingRole = false;
  
  try {
    // Try the refactored context first
    const refactoredContext = refactoredUseRole();
    if (refactoredContext) {
      isChangingRole = refactoredContext.isChangingRole;
    }
  } catch (error) {
    // If refactored context fails, try the original one
    try {
      const originalContext = originalUseRole();
      if (originalContext) {
        isChangingRole = originalContext.isChangingRole;
      }
    } catch (innerError) {
      // Both contexts failed, default to false
      isChangingRole = false;
    }
  }
  
  return <RoleTransitionOverlay isChangingRole={isChangingRole} />;
};

export default ConnectedRoleTransitionOverlay;