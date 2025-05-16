import React, { useState } from 'react';
import { Info } from 'react-feather';

interface UserPreferencesProps {
  preferences: any;
  onSave: (preferences: any) => void;
  isSaving: boolean;
}

const UserPreferences: React.FC<UserPreferencesProps> = ({ 
  preferences, 
  onSave, 
  isSaving 
}) => {
  const [formData, setFormData] = useState({
    shareLocation: preferences?.shareLocation || false,
    shareInterests: preferences?.shareInterests || false,
    shareBrowsing: preferences?.shareBrowsing || false,
    shareAge: preferences?.shareAge || false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="shareLocation"
              name="shareLocation"
              type="checkbox"
              checked={formData.shareLocation}
              onChange={handleChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="shareLocation" className="font-medium text-gray-700 dark:text-gray-300">
              Share Location
            </label>
            <p className="text-gray-500 dark:text-gray-400">
              Allow advertisers to know your general location (country/region).
            </p>
            <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
              <Info className="h-3 w-3 mr-1" />
              Earn more satoshis for relevant local ads
            </div>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="shareInterests"
              name="shareInterests"
              type="checkbox"
              checked={formData.shareInterests}
              onChange={handleChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="shareInterests" className="font-medium text-gray-700 dark:text-gray-300">
              Share Interests
            </label>
            <p className="text-gray-500 dark:text-gray-400">
              Allow advertisers to target you based on your interests and preferences.
            </p>
            <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
              <Info className="h-3 w-3 mr-1" />
              Earn more satoshis for interest-based targeting
            </div>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="shareBrowsing"
              name="shareBrowsing"
              type="checkbox"
              checked={formData.shareBrowsing}
              onChange={handleChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="shareBrowsing" className="font-medium text-gray-700 dark:text-gray-300">
              Share Browsing Activity
            </label>
            <p className="text-gray-500 dark:text-gray-400">
              Allow advertisers to see types of sites you visit for better ad targeting.
            </p>
            <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
              <Info className="h-3 w-3 mr-1" />
              Earn more satoshis for behavioral targeting
            </div>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="shareAge"
              name="shareAge"
              type="checkbox"
              checked={formData.shareAge}
              onChange={handleChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="shareAge" className="font-medium text-gray-700 dark:text-gray-300">
              Share Age Group
            </label>
            <p className="text-gray-500 dark:text-gray-400">
              Allow advertisers to know your approximate age group.
            </p>
            <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
              <Info className="h-3 w-3 mr-1" />
              Earn more satoshis for demographic targeting
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isSaving}
            className={`btn-primary w-full ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          <p className="font-medium">Privacy Information:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>All data sharing is opt-in only</li>
            <li>You control exactly what advertisers can see</li>
            <li>You earn satoshis for each piece of information you share</li>
            <li>You can change these settings at any time</li>
          </ul>
        </div>
      </div>
    </form>
  );
};

export default UserPreferences;
