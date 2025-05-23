import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import "./components/ui/data-table/DataTable';
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import "./components/ui/input';
import { Edit, Eye, Trash2 } from 'react-feather';

// Sample data for the table
interface Campaign {
  id: string;
  name: string;
  status: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  startDate: string;
}

const sampleData: Campaign[] = [
  {
    id: '1',
    name: 'Summer Sale',
    status: 'ACTIVE',
    budget: 500,
    spent: 320,
    impressions: 12500,
    clicks: 450,
    ctr: 3.6,
    startDate: '2025-04-01',
  },
  {
    id: '2',
    name: 'Product Launch',
    status: 'PAUSED',
    budget: 1000,
    spent: 750,
    impressions: 25000,
    clicks: 800,
    ctr: 3.2,
    startDate: '2025-03-15',
  },
  {
    id: '3',
    name: 'Brand Awareness',
    status: 'ACTIVE',
    budget: 800,
    spent: 400,
    impressions: 18000,
    clicks: 620,
    ctr: 3.44,
    startDate: '2025-04-10',
  },
  {
    id: '4',
    name: 'Holiday Special',
    status: 'SCHEDULED',
    budget: 1200,
    spent: 0,
    impressions: 0,
    clicks: 0,
    ctr: 0,
    startDate: '2025-05-20',
  },
  {
    id: '5',
    name: 'Newsletter Promotion',
    status: 'COMPLETED',
    budget: 300,
    spent: 300,
    impressions: 8500,
    clicks: 320,
    ctr: 3.76,
    startDate: '2025-02-01',
  },
];

const DataTableExample: NextPage = () => {
  const [selectedCampaign, setSelectedCampaign] = React.useState<Campaign | null>(null);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = () => {
      switch (status) {
        case 'ACTIVE':
          return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'PAUSED':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case 'COMPLETED':
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case 'SCHEDULED':
          return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      }
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
        {status}
      </span>
    );
  };
  
  // Action buttons
  const ActionButtons = ({ campaign }: { campaign: Campaign }) => {
    return (
      <div className="flex space-x-2">
        <Dialog>
          <DialogTrigger asChild>
            <button 
              onClick={() => setSelectedCampaign(campaign)}
              className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              aria-label="View campaign"
            >
              <Eye size={16} />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Campaign Details</DialogTitle>
              <DialogDescription>
                Detailed information about the campaign.
              </DialogDescription>
            </DialogHeader>
            
            {selectedCampaign && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium">Campaign Name</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCampaign.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Status</h4>
                    <StatusBadge status={selectedCampaign.status} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Budget</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(selectedCampaign.budget)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Spent</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(selectedCampaign.spent)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Impressions</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCampaign.impressions.toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Clicks</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCampaign.clicks.toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">CTR</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatPercentage(selectedCampaign.ctr)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Start Date</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(selectedCampaign.startDate)}</p>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <DialogClose className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
                Close
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <button 
          className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
          aria-label="Edit campaign"
        >
          <Edit size={16} />
        </button>
        
        <button 
          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          aria-label="Delete campaign"
        >
          <Trash2 size={16} />
        </button>
      </div>
    );
  };

  // Column definitions
  const columns = [
    {
      header: 'Campaign Name',
      accessorKey: 'name' as keyof Campaign,
      sortable: true,
    },
    {
      header: 'Status',
      accessorKey: 'status' as keyof Campaign,
      sortable: true,
      cell: (row: Campaign) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Budget',
      accessorKey: 'budget' as keyof Campaign,
      sortable: true,
      cell: (row: Campaign) => formatCurrency(row.budget),
    },
    {
      header: 'Spent',
      accessorKey: 'spent' as keyof Campaign,
      sortable: true,
      cell: (row: Campaign) => formatCurrency(row.spent),
    },
    {
      header: 'Impressions',
      accessorKey: 'impressions' as keyof Campaign,
      sortable: true,
      cell: (row: Campaign) => row.impressions.toLocaleString(),
    },
    {
      header: 'Clicks',
      accessorKey: 'clicks' as keyof Campaign,
      sortable: true,
      cell: (row: Campaign) => row.clicks.toLocaleString(),
    },
    {
      header: 'CTR',
      accessorKey: 'ctr' as keyof Campaign,
      sortable: true,
      cell: (row: Campaign) => formatPercentage(row.ctr),
    },
    {
      header: 'Start Date',
      accessorKey: 'startDate' as keyof Campaign,
      sortable: true,
      cell: (row: Campaign) => formatDate(row.startDate),
    },
    {
      header: 'Actions',
      accessorKey: 'id' as keyof Campaign,
      cell: (row: Campaign) => <ActionButtons campaign={row} />,
    },
  ];

  return (
    <>
      <Head>
        <title>DataTable Example - Nostr Ad Marketplace</title>
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Campaign Management</h1>
        
        <div className="mb-6 flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {sampleData.length} campaigns
          </div>
          
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            + New Campaign
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <DataTable 
            columns={columns} 
            data={sampleData} 
            searchField="name"
            emptyMessage="No campaigns found."
          />
        </div>
      </div>
    </>
  );
};

export default DataTableExample;