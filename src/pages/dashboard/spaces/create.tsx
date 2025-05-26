import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';

const CreateSpacePage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    dimensions: '728x90',
    contentCategory: 'General',
    minBidPerImpression: '1',
    minBidPerClick: '10'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/spaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/dashboard/spaces');
      } else {
        alert('Failed to create ad space');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create ad space');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Layout title="Create Ad Space - Nostr Ad Marketplace">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Create New Ad Space</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Space Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="e.g., Homepage Banner"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Describe where this ad space appears on your site"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Website URL
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div>
            <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ad Dimensions
            </label>
            <select
              id="dimensions"
              name="dimensions"
              value={formData.dimensions}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="728x90">Banner (728x90)</option>
              <option value="300x250">Medium Rectangle (300x250)</option>
              <option value="320x50">Mobile Banner (320x50)</option>
              <option value="160x600">Wide Skyscraper (160x600)</option>
              <option value="970x250">Billboard (970x250)</option>
            </select>
          </div>

          <div>
            <label htmlFor="contentCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content Category
            </label>
            <select
              id="contentCategory"
              name="contentCategory"
              value={formData.contentCategory}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="General">General</option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Cryptocurrency">Cryptocurrency</option>
              <option value="News">News</option>
              <option value="Entertainment">Entertainment</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="minBidPerImpression" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Bid Per Impression (sats)
              </label>
              <input
                type="number"
                id="minBidPerImpression"
                name="minBidPerImpression"
                value={formData.minBidPerImpression}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="minBidPerClick" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Bid Per Click (sats)
              </label>
              <input
                type="number"
                id="minBidPerClick"
                name="minBidPerClick"
                value={formData.minBidPerClick}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Ad Space'}
            </button>
            
            <button
              type="button"
              onClick={() => router.back()}
              className="py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateSpacePage;