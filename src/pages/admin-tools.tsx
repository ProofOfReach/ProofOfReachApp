import React, { useState } from 'react';
import Head from 'next/head';
import { useAuth } from '../hooks/useAuth';

/**
 * Admin Tools Page
 * This is only for development and debugging purposes
 */
export default function AdminTools() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { auth } = useAuth();
  
  const enableAllRoles = async () => {
    setLoading(true);
    setResult('Processing...');
    
    try {
      // Call our admin endpoint
      const response = await fetch('/api/admin/enable-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Important for cookies
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(JSON.stringify(data, null, 2));
        alert('Success! All roles have been enabled. Please refresh the page to see changes.');
      } else {
        setResult(`Error: ${data.log || 'Unknown error'}`);
      }
    } catch (error) {
      console.log('Error calling admin endpoint:', error);
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const refreshPage = () => {
    window.location.reload();
  };
  
  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>Admin Tools</title>
      </Head>
      
      <h1 className="text-2xl font-bold mb-4">Admin Tools</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Current User Information</h2>
        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(auth, null, 2)}
        </pre>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Role Management</h2>
        
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-4"
          onClick={enableAllRoles}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Enable All Roles'}
        </button>
        
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          onClick={refreshPage}
        >
          Refresh Page
        </button>
        
        {result && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Result:</h3>
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-sm">
              {result}
            </pre>
          </div>
        )}
      </div>
      
      <p className="text-red-500 font-medium">
        ⚠️ These tools are for development purposes only and should not be exposed in production.
      </p>
    </div>
  );
}