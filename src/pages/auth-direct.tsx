import { useState, useEffect } from 'react';
import { logger } from '../lib/logger';
import { AuthService } from '../services/authService';
import { AuthState, UserRole } from '../types/auth';
import Head from 'next/head';

/**
 * Auth Test Page that directly uses AuthService without any context
 * This page avoids all React context, providers, and redirects
 */
const AuthDirectPage = () => {
  // Direct state without hooks
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pubkey, setPubkey] = useState<string>('');
  const [signedMessage] = useState<string>('test-signature');
  const [loginStatus, setLoginStatus] = useState<string>('');
  
  // Create our own auth service
  const authService = AuthService.getInstance();
  
  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // const state = await authService.checkAuth();
        const state = null; // TODO: implement proper auth check
        setAuthState(state);
        setLoginStatus(state ? 'Already logged in' : 'Not logged in');
      } catch (error) {
        logger.error('Auth check error:', error);
        setLoginStatus('Error checking auth state');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Function to check for roles
  const hasRole = (role: UserRole): boolean => {
    if (!authState || !authState.isLoggedIn) {
      return false;
    }
    
    return authState.availableRoles.includes(role);
  };
  
  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setLoginStatus('Logging in...');
      // const newAuthState = await authService.login(pubkey, signedMessage);
      const newAuthState = null; // TODO: implement proper login
      setAuthState(newAuthState);
      setLoginStatus('Login successful! Check roles below.');
      logger.log('Login successful');
    } catch (error) {
      logger.error('Login failed:', error);
      setLoginStatus('Login failed: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle logout button click
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      setLoginStatus('Logging out...');
      await authService.logout();
      setAuthState(null);
      setLoginStatus('Logout successful.');
      logger.log('Logout successful');
    } catch (error) {
      logger.error('Logout failed:', error);
      setLoginStatus('Logout failed: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Quick login test user buttons
  const quickLogin = async (testPubkey: string, e?: React.MouseEvent) => {
    try {
      e?.preventDefault?.();
      setIsLoading(true);
      setLoginStatus(`Logging in as test ${testPubkey}...`);
      
      // const newAuthState = await authService.login(testPubkey, 'test-signature');
      const newAuthState = null; // TODO: implement proper test login
      setAuthState(newAuthState);
      
      setLoginStatus(`Login successful as ${testPubkey}! Check roles below.`);
      logger.log('Quick login successful');
    } catch (error) {
      logger.error('Quick login failed:', error);
      setLoginStatus('Login failed: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Auth Direct Test Page</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Direct Authentication Test Page</h1>
      <p className="mb-4 text-gray-700">This page uses AuthService directly without any providers or context.</p>
      
      {/* Loading state */}
      {isLoading && <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded">Loading...</div>}
      
      {/* Login status message */}
      {loginStatus && (
        <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
          {loginStatus}
        </div>
      )}
      
      {/* Auth state display */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Current Auth State:</h2>
        <pre className="bg-black text-green-400 p-2 rounded overflow-auto">
          {JSON.stringify(authState, null, 2)}
        </pre>
      </div>
      
      {/* Role checks */}
      {authState && authState.isLoggedIn && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Role Checks:</h2>
          <ul className="list-disc pl-5">
            <li>Is Advertiser: <span className={hasRole('advertiser') ? "text-green-600 font-bold" : "text-red-600"}>
              {hasRole('advertiser') ? "Yes" : "No"}
            </span></li>
            <li>Is Publisher: <span className={hasRole('publisher') ? "text-green-600 font-bold" : "text-red-600"}>
              {hasRole('publisher') ? "Yes" : "No"}
            </span></li>
            <li>Is Admin: <span className={hasRole('admin') ? "text-green-600 font-bold" : "text-red-600"}>
              {hasRole('admin') ? "Yes" : "No"}
            </span></li>
            <li>Is Stakeholder: <span className={hasRole('stakeholder') ? "text-green-600 font-bold" : "text-red-600"}>
              {hasRole('stakeholder') ? "Yes" : "No"}
            </span></li>
          </ul>
        </div>
      )}
      
      {/* Login form or logout button based on auth state */}
      {!authState || !authState.isLoggedIn ? (
        <>
          <form onSubmit={handleLogin} className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Login:</h2>
            <div className="mb-4">
              <label className="block mb-1">Pubkey:</label>
              <input 
                type="text" 
                value={pubkey} 
                onChange={(e) => setPubkey(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter your pubkey"
              />
            </div>
            <button 
              type="submit" 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Login
            </button>
          </form>
          
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Quick Test Logins:</h2>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={(e) => quickLogin('pk_test_advertiser', e)} 
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
              >
                Test Advertiser
              </button>
              <button 
                onClick={(e) => quickLogin('pk_test_publisher', e)} 
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                Test Publisher
              </button>
              <button 
                onClick={(e) => quickLogin('pk_test_admin', e)} 
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              >
                Test Admin
              </button>
            </div>
          </div>
        </>
      ) : (
        <button 
          onClick={handleLogout} 
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      )}
    </div>
  );
};

export default AuthDirectPage;