import React, { useState } from 'react'
import Head from 'next/head'
import.*./components/examples/ShadcnExampleForm'
import.*./components/examples/ButtonExamples'
import.*./components/ui/button'
import.*./components/ui/card'

/**
 * Example page to showcase the shadcn/ui-style components
 */
const ShadcnComponentsExample = () => {
  const [activeTab, setActiveTab] = useState<'form' | 'buttons'>('form')

  return (
    <>
      <Head>
        <title>shadcn/ui Components - Nostr Ad Marketplace</title>
      </Head>
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">
          shadcn/ui Style Components
        </h1>
        <p className="text-center mb-10 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
          This page demonstrates form components built following the shadcn/ui design system patterns.
          These components provide a consistent, accessible, and customizable UI foundation for the Nostr Ad Marketplace.
        </p>
        
        {/* Tab Switcher */}
        <div className="flex justify-center space-x-4 mb-8">
          <Button 
            variant={activeTab === 'form' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('form')}
          >
            Form Example
          </Button>
          <Button 
            variant={activeTab === 'buttons' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('buttons')}
          >
            Button Variants
          </Button>
        </div>
        
        {/* Content Area */}
        <div className="my-10">
          {activeTab === 'form' ? (
            <ShadcnExampleForm />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Button Component Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <ButtonExamples />
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="mt-16 mb-8 border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-2xl font-bold mb-4">
            Component Implementation Details
          </h2>
          <div className="prose dark:prose-invert max-w-3xl">
            <p>
              These components are implemented using React, TypeScript, and Tailwind CSS, following the shadcn/ui
              architecture. Each component is:
            </p>
            <ul className="list-disc pl-8 space-y-2 mt-4">
              <li>Fully typesafe with TypeScript</li>
              <li>Accessible following WAI-ARIA patterns</li>
              <li>Themeable with support for light and dark modes</li>
              <li>Customizable through component props and Tailwind classes</li>
              <li>Built with composition in mind for maximum flexibility</li>
            </ul>
            
            <p className="mt-6">
              The goal is to provide a solid foundation for UI components that can be used throughout the
              Nostr Ad Marketplace, ensuring consistency and reducing development time.
            </p>
          </div>
        </div>
        
        <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-2xl font-bold mb-4">
            Migration Guide
          </h2>
          <div className="prose dark:prose-invert max-w-3xl">
            <p>
              To replace existing UI components with shadcn/ui components:
            </p>
            <ol className="list-decimal pl-8 space-y-2 mt-4">
              <li>
                <strong>Buttons:</strong> Replace <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">&lt;button className="btn-primary"&gt;</code> 
                with <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">&lt;Button&gt;</code>
              </li>
              <li>
                <strong>Inputs:</strong> Replace <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">&lt;input className="input-field"&gt;</code> 
                with <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">&lt;Input&gt;</code>
              </li>
              <li>
                <strong>Form Structure:</strong> Use the Form, FormField, FormItem, FormLabel, and FormMessage components
                to create accessible form layouts
              </li>
              <li>
                <strong>Cards:</strong> Use Card with CardHeader, CardTitle, CardDescription, CardContent, and CardFooter 
                for consistent content containers
              </li>
            </ol>
            
            <p className="mt-6">
              Each component supports common HTML attributes plus additional props for enhanced functionality.
              See the example implementations for detailed usage patterns.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default ShadcnComponentsExample