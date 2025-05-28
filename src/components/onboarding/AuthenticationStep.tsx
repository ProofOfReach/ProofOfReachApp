import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AuthenticationStepProps {
  selectedRole: string;
  onComplete: () => void;
  onBack: () => void;
}

export const AuthenticationStep: React.FC<AuthenticationStepProps> = ({
  selectedRole,
  onComplete,
  onBack
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: selectedRole
            }
          }
        });

        if (error) {
          setError(error.message);
        } else if (data.user) {
          // Store the selected role immediately
          localStorage.setItem('selectedRole', selectedRole);
          localStorage.setItem('currentRole', selectedRole);
          onComplete();
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          setError(error.message);
        } else if (data.user) {
          // Store the selected role
          localStorage.setItem('selectedRole', selectedRole);
          localStorage.setItem('currentRole', selectedRole);
          onComplete();
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Create Your {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Account
        </h2>
        <p className="text-gray-400">
          {isSignUp 
            ? 'Create an account to save your progress and access your dashboard'
            : 'Sign in to continue with your account'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Enter your password"
          />
        </div>

        {error && (
          <div className="text-red-400 text-sm text-center">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
        </button>
      </form>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-orange-400 hover:text-orange-300 text-sm"
        >
          {isSignUp 
            ? 'Already have an account? Sign in'
            : 'Need an account? Sign up'
          }
        </button>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-400 hover:text-white"
        >
          ← Back
        </button>
      </div>
    </div>
  );
};