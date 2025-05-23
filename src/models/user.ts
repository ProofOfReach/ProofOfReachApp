import type { UserRole } from '../context/RoleContext';

export interface UserProfile {
  id: string;
  pubkey: string;
  name?: string;
  displayName?: string;
  avatar?: string;
  banner?: string;
  bio?: string;
  website?: string;
  lightning?: string;
  nip05?: string;
  lud16?: string;
  isTestAccount: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRolePermission {
  id: string;
  userId: string;
  role: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  id: string;
  userId: string;
  darkMode: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Class to handle user authentication and access
export class UserManager {
  static async getUserProfile(pubkey: string): Promise<UserProfile | null> {
    // This will be replaced with an actual API call
    // For now it returns mock data for the given pubkey
    
    try {
      // Call to API endpoint to fetch user profile
      const response = await fetch(`/api/users/${pubkey}`);
      if (!response.ok) return null;
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }
  
  static async getUserRoles(pubkey: string): Promise<UserRole[]> {
    // This will be replaced with an actual API call
    try {
      // Call to API endpoint to fetch user roles
      const response = await fetch(`/api/users/${pubkey}/roles`);
      if (!response.ok) return ['viewer'];
      
      const data = await response.json();
      
      // Check if the response has a roles property
      if (data && data.roles && Array.isArray(data.roles)) {
        return data.roles;
      } else if (Array.isArray(data)) {
        // For backward compatibility with old API that returned an array directly
        return data;
      }
      
      // Fallback to default user role
      return ['viewer'];
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return ['viewer'];
    }
  }
  
  static async isTestMode(pubkey: string): Promise<boolean> {
    // Check multiple conditions to determine if user is in test mode
    
    // Method 1: Check localStorage for test keys
    if (typeof window !== 'undefined') {
      const storedTestPubkey = localStorage.getItem('nostr_test_npub');
      
      // If we have a test pubkey and it matches the given pubkey, this is definitely test mode
      if (storedTestPubkey && storedTestPubkey === pubkey) {
        return true;
      }
      
      // If we just have any test pubkey stored, that's a good indication we're in test mode
      if (storedTestPubkey !== null) {
        return true;
      }
    }
    
    // Method 2: Query the API to check if this user is flagged as a test user
    try {
      const response = await fetch(`/api/users/check-test-mode?pubkey=${encodeURIComponent(pubkey)}`);
      if (response.ok) {
        const data = await response.json();
        return !!data.isTestMode;
      }
    } catch (error) {
      console.error('Error checking test mode status:', error);
      // Continue to fallback methods
    }
    
    // Method 3: If we have a private test key in localStorage, we're in test mode
    if (typeof window !== 'undefined' && localStorage.getItem('nostr_test_nsec') !== null) {
      return true;
    }
    
    // Default to false if no test indicators are found
    return false;
  }
  
  static async addRoleToUser(pubkey: string, role: string): Promise<boolean> {
    // This will be replaced with an actual API call
    try {
      // Call to API endpoint to add role to user
      const response = await fetch(`/api/users/${pubkey}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error adding role to user:', error);
      return false;
    }
  }
  
  static async removeRoleFromUser(pubkey: string, role: string): Promise<boolean> {
    // This will be replaced with an actual API call
    try {
      // Call to API endpoint to remove role from user
      const response = await fetch(`/api/users/${pubkey}/roles/${role}`, {
        method: 'DELETE',
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error removing role from user:', error);
      return false;
    }
  }
  
  // Special method for test accounts to enable all roles
  static async enableAllRolesForTestUser(pubkey: string): Promise<boolean> {
    // First, check if this is a test account
    const isTest = await UserManager.isTestMode(pubkey);
    if (!isTest) return false;
    
    try {
      // Method 1: Update using the new user/role API
      try {
        // Enable advertiser flag in User model
        const userFlagResponse = await fetch(`/api/users/flags`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Test-Mode': 'true',
            'X-Test-Pubkey': pubkey
          },
          body: JSON.stringify({ 
            isAdvertiser: true,
            isPublisher: true
          }),
        });
        
        if (!userFlagResponse.ok) {
          console.error('Failed to update user flags for test user');
        }
        
        // Set the user role using our new API endpoint
        const roleResponse = await fetch(`/api/user/role`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Test-Mode': 'true',
            'X-Test-Pubkey': pubkey
          },
          body: JSON.stringify({ role: 'viewer' }), // Default role, will be overridden by UI
        });
        
        if (roleResponse.ok) {
          // Log log for debugging
          console.log('Successfully enabled roles for test user via new role API');
          return true;
        }
      } catch (newApiError) {
        console.error('Exception calling new role API:', newApiError);
        // Continue to legacy methods
      }
      
      // Method 2: Update directly in the database using a dedicated API endpoint for test users
      try {
        const response = await fetch(`/api/auth/enable-test-roles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Test-Mode': 'true',
            'X-Test-Pubkey': pubkey
          },
          body: JSON.stringify({ pubkey }),
        });
        
        if (response.ok) {
          // Log log for debugging
          console.log('Successfully enabled all roles for test user via API endpoint');
          return true;
        } else {
          const errorData = await response.json();
          console.error('Failed to enable test roles via API endpoint:', errorData);
          // Continue to fallback method
        }
      } catch (endpointError) {
        console.error('Exception calling test roles endpoint:', endpointError);
        // Continue to fallback method
      }
      
      // Method 3: As a fallback, try enabling roles individually
      // Enable advertiser role
      const advertiserResponse = await fetch(`/api/users/set-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Mode': 'true',
          'X-Test-Pubkey': pubkey
        },
        body: JSON.stringify({ 
          role: 'advertiser', 
          enabled: true 
        }),
      });
      
      // Enable publisher role
      const publisherResponse = await fetch(`/api/users/set-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Mode': 'true',
          'X-Test-Pubkey': pubkey
        },
        body: JSON.stringify({ 
          role: 'publisher', 
          enabled: true 
        }),
      });
      
      // Enable admin role (new)
      const adminResponse = await fetch(`/api/users/set-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Mode': 'true',
          'X-Test-Pubkey': pubkey
        },
        body: JSON.stringify({
          role: 'admin',
          enabled: true
        }),
      });
      
      // Enable stakeholder role (was previously investor)
      const stakeholderResponse = await fetch(`/api/users/set-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Mode': 'true',
          'X-Test-Pubkey': pubkey
        },
        body: JSON.stringify({
          role: 'stakeholder',
          enabled: true
        }),
      });
      
      const allRolesSuccess = advertiserResponse.ok && publisherResponse.ok && 
                             adminResponse.ok && stakeholderResponse.ok;
      
      if (allRolesSuccess) {
        // Log log for debugging
        console.log('Successfully enabled all roles for test user via individual role updates');
        return true;
      } else {
        console.error('Failed to enable roles via individual updates:', 
                     { 
                       advertiser: advertiserResponse.ok, 
                       publisher: publisherResponse.ok,
                       admin: adminResponse.ok,
                       stakeholder: stakeholderResponse.ok
                     });
        return false;
      }
    } catch (error) {
      console.error('Error enabling test roles:', error);
      return false;
    }
  }
}

export default UserManager;