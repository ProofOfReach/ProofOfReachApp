import React, { useState } from 'react';
import { AlertTriangle, ExternalLink, Check, X } from 'react-feather';

interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  finalDestinationUrl: string;
  advertiserNpub: string;
  bidPerImpression: number;
  bidPerClick: number;
  status: string;
  createdAt: string;
}

interface AdSpace {
  id: string;
  name: string;
  description: string;
  publisher: string;
}

interface AdApprovalProps {
  ad: Ad;
  space: AdSpace;
  onApprove: (adId: string, spaceId: string) => void;
  onReject: (adId: string, spaceId: string, reason: string) => void;
  domainBlacklist?: string[];
}

const AdApproval: React.FC<AdApprovalProps> = ({ 
  ad, 
  space, 
  onApprove, 
  onReject, 
  domainBlacklist = [] 
}) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if ad destination URL is blacklisted
  const isBlacklistedDomain = domainBlacklist.some(domain => 
    ad.finalDestinationUrl.includes(domain)
  );
  
  const handleApprove = async () => {
    setIsSubmitting(true);
    await onApprove(ad.id, space.id);
    setIsSubmitting(false);
  };
  
  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    
    setIsSubmitting(true);
    await onReject(ad.id, space.id, rejectReason);
    setIsSubmitting(false);
    setShowRejectForm(false);
    setRejectReason('');
  };
  
  const handleCancelReject = () => {
    setShowRejectForm(false);
    setRejectReason('');
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col md:flex-row">
          {/* Ad Preview */}
          <div className="md:w-2/3 mb-6 md:mb-0 md:pr-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {ad.title}
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {ad.description}
              </p>
              
              {ad.imageUrl && (
                <div className="mb-4 relative">
                  <img 
                    src={ad.imageUrl} 
                    alt={ad.title}
                    className="w-full h-auto rounded-md object-cover max-h-40"
                  />
                </div>
              )}
              
              <div className="flex items-center text-sm">
                <a 
                  href={ad.finalDestinationUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                >
                  {ad.finalDestinationUrl.length > 50 
                    ? ad.finalDestinationUrl.substring(0, 50) + '...' 
                    : ad.finalDestinationUrl}
                  <ExternalLink size={14} className="ml-1" />
                </a>
              </div>
              
              {isBlacklistedDomain && (
                <div className="mt-2 flex items-center text-amber-600 dark:text-amber-400">
                  <AlertTriangle size={16} className="mr-1" />
                  <span className="text-xs">Domain is on your blacklist</span>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Bid Information
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">CPM (Cost per 1000 impressions)</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {ad.bidPerImpression > 0 ? `${ad.bidPerImpression} sats` : 'Not used'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">CPC (Cost per click)</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {ad.bidPerClick > 0 ? `${ad.bidPerClick} sats` : 'Not used'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Ad Metadata */}
          <div className="md:w-1/3 md:border-l md:border-gray-200 md:dark:border-gray-700 md:pl-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Ad Details
            </h4>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Advertiser</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white font-mono overflow-hidden text-ellipsis">
                  {ad.advertiserNpub}
                </p>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Requested Ad Space</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {space.name}
                </p>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Submitted</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(ad.createdAt)}
                </p>
              </div>
              
              <div className="pt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Status</p>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                  Pending Approval
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
        {!showRejectForm ? (
          <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={() => setShowRejectForm(true)}
              className="btn-outline-red flex items-center justify-center"
              disabled={isSubmitting}
            >
              <X size={16} className="mr-2" />
              Reject
            </button>
            
            <button
              type="button"
              onClick={handleApprove}
              className="btn-primary flex items-center justify-center"
              disabled={isSubmitting}
            >
              <Check size={16} className="mr-2" />
              Approve
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Reason for Rejection
            </label>
            <textarea
              id="rejectReason"
              rows={2}
              className="input-field w-full"
              placeholder="Explain why this ad is being rejected..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelReject}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="btn-primary"
                disabled={isSubmitting || !rejectReason.trim()}
              >
                Submit Rejection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdApproval;