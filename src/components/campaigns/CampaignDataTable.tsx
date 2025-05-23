import React from 'react';
import { Campaign, Ad, CampaignStatus } from '@prisma/client';
import { 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Square,
  Calendar,
  DollarSign
} from 'react-feather';
import Link from 'next/link';
import.*./components/ui/button";
import.*./components/ui/data-table/DataTable';

// Extended Campaign type with ads array
export interface CampaignWithAds extends Campaign {
  ads: Ad[];
}

interface CampaignDataTableProps {
  campaigns: CampaignWithAds[];
  onStatusChange?: (campaignId: string, newStatus: CampaignStatus) => Promise<void>;
  onDelete?: (campaignId: string) => Promise<void>;
}

const CampaignDataTable: React.FC<CampaignDataTableProps> = ({ 
  campaigns,
  onStatusChange,
  onDelete
}) => {
  const [changingStatusId, setChangingStatusId] = React.useState<string | null>(null);

  const handleStatusChange = async (campaignId: string, newStatus: CampaignStatus) => {
    if (!onStatusChange) return;
    
    setChangingStatusId(campaignId);
    try {
      await onStatusChange(campaignId, newStatus);
    } finally {
      setChangingStatusId(null);
    }
  };

  const handleDelete = async (campaignId: string) => {
    if (!onDelete) return;
    
    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      await onDelete(campaignId);
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatBudget = (sats: number | null) => {
    if (sats === null) return '0 sats';
    return new Intl.NumberFormat('en-US').format(sats) + ' sats';
  };

  const getStatusBadgeClass = (status: CampaignStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'ENDED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'DRAFT':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'REVIEW':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: CampaignStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <Play className="h-3 w-3 mr-1" />;
      case 'PAUSED':
        return <Pause className="h-3 w-3 mr-1" />;
      case 'ENDED':
        return <Square className="h-3 w-3 mr-1" />;
      case 'SCHEDULED':
        return <Calendar className="h-3 w-3 mr-1" />;
      case 'DRAFT':
        return <Edit className="h-3 w-3 mr-1" />;
      case 'REVIEW':
        return <span className="inline-block h-3 w-3 mr-1">📋</span>;
      default:
        return null;
    }
  };

  // Define columns for the DataTable
  const columns = [
    {
      header: "Name",
      accessorKey: "name" as keyof CampaignWithAds,
      sortable: true,
      initialWidth: 280,
      cell: (row: CampaignWithAds) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{row.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
            {row.description || "No description provided"}
          </div>
        </div>
      )
    },
    {
      header: "Status",
      accessorKey: "status" as keyof CampaignWithAds,
      sortable: true,
      initialWidth: 130,
      cell: (row: CampaignWithAds) => (
        <div className="relative group">
          <div className={`px-3 py-1 rounded-full inline-flex items-center text-xs font-medium ${getStatusBadgeClass(row.status)}`}>
            {getStatusIcon(row.status)}
            {row.status}
          </div>
          
          {onStatusChange && (
            <div className="absolute z-10 left-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden transform scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-150 origin-top-left">
              <div className="py-1">
                {row.status !== 'ACTIVE' && (
                  <Button 
                    onClick={() => handleStatusChange(row.id, 'ACTIVE')} 
                    variant="ghost" 
                    size="sm"
                    className="w-full px-4 py-2 text-xs text-left justify-start font-normal h-auto"
                  >
                    <Play className="h-3 w-3 mr-1.5" />
                    Set Active
                  </Button>
                )}
                
                {row.status !== 'PAUSED' && (
                  <Button 
                    onClick={() => handleStatusChange(row.id, 'PAUSED')} 
                    variant="ghost" 
                    size="sm"
                    className="w-full px-4 py-2 text-xs text-left justify-start font-normal h-auto"
                  >
                    <Pause className="h-3 w-3 mr-1.5" />
                    Set Paused
                  </Button>
                )}
                
                {row.status !== 'ENDED' && (
                  <Button 
                    onClick={() => handleStatusChange(row.id, 'ENDED')} 
                    variant="ghost" 
                    size="sm"
                    className="w-full px-4 py-2 text-xs text-left justify-start font-normal h-auto"
                  >
                    <Square className="h-3 w-3 mr-1.5" />
                    Set Ended
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      header: "Budget",
      accessorKey: "budget" as keyof CampaignWithAds,
      sortable: true,
      initialWidth: 120,
      cell: (row: CampaignWithAds) => (
        <div>
          <div className="flex items-center text-gray-900 dark:text-white">
            <DollarSign className="h-3 w-3 mr-1 opacity-70" />
            {formatBudget(row.budget)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
            {formatBudget(row.dailyBudget || 0)}/day
          </div>
        </div>
      )
    },
    {
      header: "Ads",
      accessorKey: "ads" as keyof CampaignWithAds,
      sortable: true,
      initialWidth: 80,
      cell: (row: CampaignWithAds) => (
        <div className="text-center font-medium">
          {row.ads.length}
        </div>
      )
    },
    {
      header: "Dates",
      accessorKey: "startDate" as keyof CampaignWithAds,
      sortable: true,
      initialWidth: 180,
      cell: (row: CampaignWithAds) => (
        <div className="text-sm">
          <div className="text-gray-900 dark:text-white">{formatDate(row.startDate)}</div>
          {row.endDate && (
            <div className="text-gray-500 dark:text-gray-400">
              to {formatDate(row.endDate)}
            </div>
          )}
        </div>
      )
    },
    {
      header: "Actions",
      accessorKey: "id" as keyof CampaignWithAds,
      initialWidth: 120,
      cell: (row: CampaignWithAds) => (
        <div className="flex space-x-2 justify-end">
          <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Link 
              href={`/dashboard/advertiser/campaigns/${row.id}/edit`}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          
          {onDelete && (
            <Button
              onClick={() => handleDelete(row.id)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <DataTable 
      columns={columns} 
      data={campaigns} 
      searchField="name"
      emptyMessage="No campaigns found. Create a campaign to get started."
    />
  );
};

export default CampaignDataTable;