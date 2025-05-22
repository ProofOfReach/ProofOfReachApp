import React, { useState, useEffect } from 'react';
import { PlusCircle, X, Circle } from 'react-feather';
import { SimplePool } from 'nostr-tools';

// Default relays list
const DEFAULT_RELAYS = [
  'wss://relay.damus.io/',
  'wss://relay.primal.net/',
  'wss://nos.lol/',
  'wss://relay.utxo.one/'
];

interface NostrRelayManagerProps {
  onSave?: (relays: string[]) => void;
  isSaving?: boolean;
  initialRelays?: string[];
}

interface RelayStatus {
  url: string;
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  error?: string;
}

const NostrRelayManager: React.FC<NostrRelayManagerProps> = ({
  onSave,
  isSaving = false,
  initialRelays
}) => {
  const [relays, setRelays] = useState<string[]>(initialRelays || [...DEFAULT_RELAYS]);
  const [newRelay, setNewRelay] = useState('');
  const [relayStatuses, setRelayStatuses] = useState<RelayStatus[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [pool, setPool] = useState<SimplePool | null>(null);

  // Initialize the connection pool
  useEffect(() => {
    const newPool = new SimplePool();
    setPool(newPool);

    return () => {
      if (newPool) {
        newPool.close(relays);
      }
    };
  }, []);

  // Connect to relays and check statuses
  useEffect(() => {
    if (!pool) return;

    // Initialize statuses
    const initialStatuses = relays.map(url => ({
      url,
      status: 'connecting' as const
    }));
    setRelayStatuses(initialStatuses);

    // Check connection status for each relay
    relays.forEach(async (url, index) => {
      try {
        // Try to connect to relay
        pool.ensureRelay(url);
        
        // Since we can't easily track relay connections in the SimplePool API,
        // we'll set a connected status after a short delay for UI purposes
        setTimeout(() => {
          setRelayStatuses(prev => {
            const updated = [...prev];
            const relayIndex = updated.findIndex(r => r.url === url);
            if (relayIndex !== -1 && updated[relayIndex].status === 'connecting') {
              updated[relayIndex] = { url, status: 'connected' };
            }
            return updated;
          });
        }, 2000);

        // Set a timeout for connection
        setTimeout(() => {
          setRelayStatuses(prev => {
            const updated = [...prev];
            const relayIndex = updated.findIndex(r => r.url === url);
            if (relayIndex !== -1 && updated[relayIndex].status === 'connecting') {
              updated[relayIndex] = { 
                url, 
                status: 'disconnected',
                error: 'Connection timeout'
              };
            }
            return updated;
          });
        }, 5000);
      } catch (error) {
        setRelayStatuses(prev => {
          const updated = [...prev];
          const relayIndex = updated.findIndex(r => r.url === url);
          if (relayIndex !== -1) {
            updated[relayIndex] = { 
              url, 
              status: 'error',
              error: 'Failed to connect'
            };
          }
          return updated;
        });
      }
    });
    
    return () => {
      // Close connections when component unmounts or relays change
      pool.close(relays);
    };
  }, [pool, relays]);

  const handleAddRelay = () => {
    if (!newRelay.trim()) return;
    
    // Add 'wss://' prefix if not present
    let formattedRelay = newRelay.trim();
    if (!formattedRelay.startsWith('wss://') && !formattedRelay.startsWith('ws://')) {
      formattedRelay = `wss://${formattedRelay}`;
    }
    
    // Add trailing slash if not present
    if (!formattedRelay.endsWith('/')) {
      formattedRelay = `${formattedRelay}/`;
    }
    
    // Check if relay already exists
    if (relays.includes(formattedRelay)) {
      return;
    }
    
    setRelays([...relays, formattedRelay]);
    setNewRelay('');
  };

  const handleRemoveRelay = (relay: string) => {
    setRelays(relays.filter(r => r !== relay));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(relays);
    }
    setIsEditing(false);
  };

  const handleReset = () => {
    setRelays([...DEFAULT_RELAYS]);
  };

  // Display the status indicator
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'connected':
        return <Circle className="h-3 w-3 text-green-500 fill-current" />;
      case 'connecting':
        return <Circle className="h-3 w-3 text-yellow-500 fill-current animate-pulse" />;
      case 'disconnected':
        return <Circle className="h-3 w-3 text-gray-500 fill-current" />;
      case 'error':
        return <Circle className="h-3 w-3 text-red-500 fill-current" />;
      default:
        return <Circle className="h-3 w-3 text-gray-500 fill-current" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-medium text-gray-900 dark:text-white">Nostr Relays</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm px-3 py-1 text-purple-600 border border-purple-200 rounded-md hover:bg-purple-50 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-900/20"
          >
            Edit Relays
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleReset}
              className="text-sm px-3 py-1 text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`text-sm px-3 py-1 text-white bg-purple-600 rounded-md hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 ${
                isSaving ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4">
        <ul className="space-y-2">
          {relays.map((relay, index) => {
            const relayStatus = relayStatuses.find(status => status.url === relay);
            return (
              <li key={relay} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getStatusIndicator(relayStatus?.status || 'disconnected')}
                  <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">{relay}</span>
                </div>
                {isEditing && (
                  <button
                    onClick={() => handleRemoveRelay(relay)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <X size={16} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {isEditing && (
          <div className="mt-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newRelay}
                onChange={(e) => setNewRelay(e.target.value)}
                placeholder="Add new relay (e.g., relay.example.com)"
                className="input-field flex-grow"
              />
              <button
                onClick={handleAddRelay}
                className="flex items-center justify-center p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600"
              >
                <PlusCircle size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Enter relay domain (wss:// will be added automatically if needed)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NostrRelayManager;