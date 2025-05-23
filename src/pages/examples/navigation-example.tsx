import React from 'react';
import Head from 'next/head';
import '@/components/layout/SimplifiedEnhancedSidebar';

/**
 * Example page showcasing the enhanced sidebar with shadcn/ui components
 */
const NavigationExample = () => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Using our simplified enhanced shadcn/ui-styled sidebar */}
      <SimplifiedEnhancedSidebar />
      
      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Enhanced Navigation Components
          </h1>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              About This Example
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              This page demonstrates our enhanced navigation components built with shadcn/ui design patterns.
              The sidebar you see on the left is using our new component structure that follows shadcn/ui styling conventions.
            </p>
            
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mt-6 mb-2">
              Key Features
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
              <li>Responsive design with mobile-first approach</li>
              <li>Unified theming system with light/dark mode support</li>
              <li>Role-based navigation with dynamic menu items</li>
              <li>Enhanced accessibility features</li>
              <li>Consistent design language across components</li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Implementation Details
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The sidebar uses these shadcn/ui-style components:
            </p>
            
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
              <li><strong>Sheet</strong> - For the mobile slide-out sidebar</li>
              <li><strong>NavigationMenu</strong> - For structured navigation items</li>
              <li><strong>Button</strong> - For interactive elements with consistent styling</li>
              <li><strong>cn utility</strong> - Enhanced class name merging function</li>
            </ul>
            
            <p className="text-gray-600 dark:text-gray-300 mt-4">
              Try resizing the window to see how the navigation responds to different screen sizes.
              On mobile devices, the sidebar collapses into a slide-out menu accessible via the button in the bottom right corner.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NavigationExample;