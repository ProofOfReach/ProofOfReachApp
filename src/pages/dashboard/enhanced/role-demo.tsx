import { UserRole } from "@/types/role";
import React from 'react';
import '@/context/EnhancedRoleContext';
import '@/components/role';
import { withRoleAccess } from '@/components/auth/withRoleAccess';

/**
 * Role management demo page
 * Demonstrates the new role management system with real-time switching
 */
function RoleDemoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Enhanced Role Management Demo</h1>
      
      <div className="mb-6 p-4 bg-white rounded shadow flex items-center justify-between">
        <h2 className="text-lg font-semibold">Current Role:</h2>
        <RoleStatusBadge />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div />
          <RoleSwitcher />
        </div>
        
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Role System Features</h2>
          
          <ul className="list-disc pl-5 space-y-2">
            <li>Server-side role validation</li>
            <li>Persistent role storage in database</li>
            <li>Real-time role switching without page refresh</li>
            <li>Role-specific access control</li>
            <li>Test mode for development</li>
            <li>Admin tools for role management</li>
          </ul>
          
          <div className="mt-6 p-3 bg-blue-50 text-blue-700 rounded text-sm">
            <strong>How it works:</strong> Your role is stored both in the database and 
            locally for offline access. The server is the source of truth for 
            role permissions, ensuring secure access control.
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrap the page with the role context provider
function RoleDemoPageWithProvider() {
  return (
    <EnhancedRoleProvider>
      <RoleDemoPage />
    </EnhancedRoleProvider>
  );
}

// Export with role access control - allow any role to access this demo
export default withRoleAccess(RoleDemoPageWithProvider, {
  allowedRoles: ['admin', 'advertiser', 'publisher', 'developer', 'stakeholder']
});