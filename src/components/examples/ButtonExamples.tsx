import React from 'react';
import { Button } from '../ui/Button';
import { 
  Plus, 
  Trash, 
  Edit, 
  Save, 
  Download, 
  RefreshCw, 
  Check, 
  X, 
  ChevronRight, 
  Menu 
} from 'react-feather';

/**
 * ButtonExamples component showcasing the different button variants
 * This demonstrates how to replace all btn-* classes in the codebase
 * with the new shadcn/ui Button component
 */
const ButtonExamples: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Primary Buttons */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Primary Buttons</h3>
        <p className="text-sm text-gray-500 mb-4">
          Replace <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">btn-primary</code> with:
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Button>Default Button</Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New
          </Button>
          <Button disabled>Disabled</Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
          <Button size="sm">Small Button</Button>
          <Button size="lg">Large Button</Button>
        </div>
      </div>
      
      {/* Secondary Buttons */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Secondary Buttons</h3>
        <p className="text-sm text-gray-500 mb-4">
          Replace <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">btn-secondary</code> with:
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Button variant="secondary">Secondary</Button>
          <Button variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="secondary" disabled>Disabled</Button>
          <Button variant="secondary" size="sm">Small</Button>
        </div>
      </div>
      
      {/* Outline Buttons */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Outline Buttons</h3>
        <p className="text-sm text-gray-500 mb-4">
          Replace <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">btn-outline</code> with:
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Button variant="outline">Outline</Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" disabled>Disabled</Button>
          <Button variant="outline" size="sm">
            <Menu className="mr-2 h-3 w-3" />
            Menu
          </Button>
        </div>
      </div>
      
      {/* Destructive Buttons */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Destructive Buttons</h3>
        <p className="text-sm text-gray-500 mb-4">
          Replace <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">btn-danger</code> with:
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Button variant="destructive">Delete</Button>
          <Button variant="destructive">
            <Trash className="mr-2 h-4 w-4" />
            Delete Item
          </Button>
          <Button variant="destructive" disabled>Disabled</Button>
          <Button variant="destructive" size="sm">Remove</Button>
        </div>
      </div>
      
      {/* Ghost Buttons */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Ghost Buttons</h3>
        <p className="text-sm text-gray-500 mb-4">
          Replace transparent background buttons with:
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Button variant="ghost">Ghost</Button>
          <Button variant="ghost">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="ghost" disabled>Disabled</Button>
          <Button variant="ghost" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Link Buttons */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Link Buttons</h3>
        <p className="text-sm text-gray-500 mb-4">
          Replace <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">btn-link</code> with:
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Button variant="link">Link Button</Button>
          <Button variant="link">View details</Button>
          <Button variant="link" disabled>Disabled Link</Button>
          <Button variant="link" size="sm">Small Link</Button>
        </div>
      </div>
      
      {/* Icon Buttons */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Icon Buttons</h3>
        <p className="text-sm text-gray-500 mb-4">
          For icon-only buttons, use the icon size variant:
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Button size="icon" aria-label="Edit">
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" aria-label="Delete">
            <Trash className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" aria-label="Accept">
            <Check className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="destructive" aria-label="Cancel">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ButtonExamples;