import React from 'react';
import { Monitor, Code, Trash2, Eye, MousePointer, ExternalLink, Edit } from 'react-feather';
import SatoshiIcon from './SatoshiIcon';
import Link from 'next/link';

interface SpaceCardProps {
  space: any;
  onDelete: (spaceId: string) => void;
  onShowCode: (space: any) => void;
}

const SpaceCard: React.FC<SpaceCardProps> = ({ space, onDelete, onShowCode }) => {
  // Calculate total impressions and clicks across all placements
  const totalImpressions = space.placements?.reduce((sum: number, placement: any) => sum + placement.impressions, 0) || 0;
  const totalClicks = space.placements?.reduce((sum: number, placement: any) => sum + placement.clicks, 0) || 0;

  // Extract dimensions
  const [width, height] = space.dimensions.split('x');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{space.name}</h3>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <ExternalLink className="h-3 w-3 mr-1" />
            <a href={space.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
              {space.website}
            </a>
          </div>
        </div>

        {/* Space Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{space.description}</p>

        {/* Dimensions & Category */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Dimensions
            </div>
            <div className="font-medium text-gray-900 dark:text-white">{width}×{height}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Category
            </div>
            <div className="font-medium text-gray-900 dark:text-white">{space.contentCategory}</div>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
              <Eye className="h-3 w-3 mr-1" />
              Min Per Impression
            </div>
            <div className="font-medium text-gray-900 dark:text-white">{space.minBidPerImpression} sats</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
              <MousePointer className="h-3 w-3 mr-1" />
              Min Per Click
            </div>
            <div className="font-medium text-gray-900 dark:text-white">{space.minBidPerClick} sats</div>
          </div>
        </div>

        {/* Performance Stats */}
        {space.placements && space.placements.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                <Eye className="h-3 w-3 mr-1" />
                Total Impressions
              </div>
              <div className="font-medium text-gray-900 dark:text-white">{totalImpressions}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                <MousePointer className="h-3 w-3 mr-1" />
                Total Clicks
              </div>
              <div className="font-medium text-gray-900 dark:text-white">{totalClicks}</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex space-x-2">
          <button
            onClick={() => onShowCode(space)}
            className="flex-1 py-2 px-4 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded flex items-center justify-center"
          >
            <Code className="h-4 w-4 mr-2" />
            Get Code
          </button>
          
          <Link
            href={`/dashboard/spaces/edit/${space.id}`}
            className="py-2 px-4 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded flex items-center justify-center"
            aria-label="Edit"
            data-testid="edit-button"
          >
            <Edit className="h-4 w-4" />
          </Link>
          
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${space.name}?`)) {
                onDelete(space.id);
              }
            }}
            className="py-2 px-4 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded flex items-center justify-center"
            aria-label="Delete"
            data-testid="delete-button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpaceCard;
