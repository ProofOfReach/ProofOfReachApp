import React, { useState, useEffect } from 'react';
import { AlertCircle, Zap, CreditCard, ArrowRight, CheckCircle } from 'react-feather';
import dynamic from 'next/dynamic';
import CurrencyAmount from './CurrencyAmount';
import { Button } from './ui/Button';

interface SmartFundingFlowProps {
  currentBalance: number;
  requiredAmount: number;
  onFundingComplete: (newBalance: number) => void;
  onSkip: () => void;
  isTestMode?: boolean;
}

const SmartFundingFlow: React.FC<SmartFundingFlowProps> = ({
  currentBalance,
  requiredAmount,
  onFundingComplete,
  onSkip,
  isTestMode = false
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [fundingAmount, setFundingAmount] = useState(requiredAmount - currentBalance);
  const [showFallback, setShowFallback] = useState(false);

  const shortfall = Math.max(0, requiredAmount - currentBalance);

  useEffect(() => {
    // Initialize Bitcoin Connect only on client side
    if (typeof window !== 'undefined' && !isTestMode) {
      const initBitcoinConnect = async () => {
        try {
          const { init, requestProvider } = await import('@getalby/bitcoin-connect');
          init({
            appName: 'Nostr Ad Marketplace',
            showBalance: false,
          });
          checkConnection();
        } catch (error) {
          console.error('Failed to initialize Bitcoin Connect:', error);
        }
      };
      initBitcoinConnect();
    }
  }, [isTestMode]);

  const checkConnection = async () => {
    if (typeof window === 'undefined') return;
    
    try {
      const { requestProvider } = await import('@getalby/bitcoin-connect');
      const provider = await requestProvider();
      if (provider) {
        setIsConnected(true);
        setConnectedWallet(provider.constructor.name || 'Lightning Wallet');
      }
    } catch (error) {
      setIsConnected(false);
    }
  };

  const handleBitcoinConnect = async () => {
    setIsConnecting(true);
    
    try {
      if (isTestMode) {
        // Simulate connection in test mode
        setTimeout(() => {
          setIsConnected(true);
          setConnectedWallet('Test Wallet');
          setIsConnecting(false);
        }, 1000);
        return;
      }

      if (typeof window !== 'undefined') {
        const { launchModal } = await import('@getalby/bitcoin-connect');
        launchModal();
        
        // Check connection after modal
        setTimeout(() => {
          checkConnection();
          setIsConnecting(false);
        }, 1000);
      }
    } catch (error) {
      setIsConnecting(false);
    }
  };

  const handleQuickFund = async () => {
    setIsFunding(true);

    try {
      if (isTestMode) {
        // Simulate funding in test mode
        setTimeout(() => {
          onFundingComplete(currentBalance + fundingAmount);
          setIsFunding(false);
        }, 2000);
        return;
      }

      if (typeof window === 'undefined') {
        throw new Error('Client-side only feature');
      }
      
      const { requestProvider } = await import('@getalby/bitcoin-connect');
      const provider = await requestProvider();
      if (!provider) {
        throw new Error('No wallet connected');
      }

      // Generate invoice via your API
      const response = await fetch('/api/wallet/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'DEPOSIT',
          amount: fundingAmount,
          description: `Campaign funding: ${fundingAmount} sats`,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to generate funding invoice');
      }

      const { lightningInvoice } = await response.json();
      
      // Pay invoice using connected wallet
      const payment = await provider.sendPayment(lightningInvoice);
      
      if (payment.preimage) {
        onFundingComplete(currentBalance + fundingAmount);
      }
    } catch (error) {
      console.error('Funding failed:', error);
      setShowFallback(true);
    } finally {
      setIsFunding(false);
    }
  };

  // Don't show if no funding needed
  if (shortfall <= 0) return null;

  return (
    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
            <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Fund Your Campaign
          </h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Current Balance:</span>
              <CurrencyAmount sats={currentBalance} className="font-medium" />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Campaign Budget:</span>
              <CurrencyAmount sats={requiredAmount} className="font-medium" />
            </div>
            <div className="border-t border-orange-200 dark:border-orange-800 pt-2">
              <div className="flex justify-between text-base font-semibold">
                <span className="text-gray-900 dark:text-white">Need to Add:</span>
                <CurrencyAmount sats={shortfall} className="text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          {!showFallback ? (
            <div className="space-y-4">
              {!isConnected ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Connect your Lightning wallet for instant funding
                  </p>
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleBitcoinConnect}
                      disabled={isConnecting}
                      className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {isConnecting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          <span>Connect Wallet & Fund</span>
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => setShowFallback(true)}
                      variant="outline"
                      className="text-gray-600 border-gray-300"
                    >
                      Other Options
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      {connectedWallet} Connected
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Funding Amount (sats)
                      </label>
                      <input
                        type="number"
                        value={fundingAmount}
                        onChange={(e) => setFundingAmount(parseInt(e.target.value) || 0)}
                        min={shortfall}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Minimum: <CurrencyAmount sats={shortfall} />
                      </p>
                    </div>
                    
                    <Button
                      onClick={handleQuickFund}
                      disabled={isFunding || fundingAmount < shortfall}
                      className="w-full flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {isFunding ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          <span>Processing Payment...</span>
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-4 w-4" />
                          <span>Fund & Continue</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Alternative Funding Options</h4>
              
              <div className="space-y-3">
                <Button
                  onClick={() => window.open('/wallet', '_blank')}
                  variant="outline"
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Generate Lightning Invoice</span>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                
                <Button
                  onClick={onSkip}
                  variant="outline"
                  className="w-full text-gray-600"
                >
                  Create Campaign Without Funding
                </Button>
              </div>
              
              <p className="text-xs text-gray-500">
                Note: Campaigns without sufficient funding will be paused until funded.
              </p>
            </div>
          )}

          {isTestMode && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                <strong>Test Mode:</strong> All transactions are simulated
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartFundingFlow;