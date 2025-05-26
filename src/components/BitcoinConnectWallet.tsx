import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp, CreditCard, Zap } from 'react-feather';
import { init, launchModal, requestProvider } from '@getalby/bitcoin-connect';
import { Button } from './ui/button';
import DashboardCard from './ui/DashboardCard';
import CurrencyAmount from './CurrencyAmount';

interface BitcoinConnectWalletProps {
  balance?: number;
  isTestMode?: boolean;
  enableRealBitcoinConnect?: boolean; // New prop for integration testing
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onBalanceUpdate?: (newBalance: number) => void;
}

const BitcoinConnectWallet: React.FC<BitcoinConnectWalletProps> = ({
  balance = 0,
  isTestMode = false,
  enableRealBitcoinConnect = false,
  onSuccess,
  onError,
  onBalanceUpdate
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('1000');
  const [withdrawAmount, setWithdrawAmount] = useState('1000');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Initialize Bitcoin Connect
    init({
      appName: 'Nostr Ad Marketplace',
      showBalance: true,
    });

    // Don't automatically check connection to avoid triggering the popup
    // Connection status will be checked when user clicks connect
  }, []);

  const checkConnection = async () => {
    try {
      const provider = await requestProvider();
      if (provider) {
        setIsConnected(true);
        setConnectedWallet(provider.constructor.name || 'Connected Wallet');
      }
    } catch (error) {
      setIsConnected(false);
    }
  };

  const connectWallet = async () => {
    try {
      if (isTestMode && !enableRealBitcoinConnect) {
        // Mock wallet mode - fast testing without real Bitcoin Connect
        setIsConnected(true);
        setConnectedWallet('Test Wallet');
        onSuccess('Test wallet connected successfully!');
        return;
      }

      // Real Bitcoin Connect integration mode
      launchModal();
      
      // Check connection after modal
      setTimeout(() => {
        checkConnection();
      }, 1000);
    } catch (error) {
      onError('Failed to connect wallet. Please try again.');
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      onError('Please enter a valid deposit amount');
      return;
    }

    setProcessing(true);
    
    try {
      const amountSats = parseInt(depositAmount);
      
      if (isTestMode) {
        // Simulate test deposit
        setTimeout(() => {
          onBalanceUpdate?.(balance + amountSats);
          onSuccess(`Successfully deposited ${amountSats} test sats!`);
          setIsDepositing(false);
          setDepositAmount('1000');
          setProcessing(false);
        }, 1500);
        return;
      }

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
          amount: amountSats,
          description: 'Wallet deposit via Bitcoin Connect',
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to generate invoice');
      }

      const { lightningInvoice } = await response.json();
      
      // Pay invoice using connected wallet
      const payment = await provider.sendPayment(lightningInvoice);
      
      if (payment.preimage) {
        onBalanceUpdate?.(balance + amountSats);
        onSuccess(`Successfully deposited ${amountSats} sats!`);
        setIsDepositing(false);
        setDepositAmount('1000');
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Deposit failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      onError('Please enter a valid withdrawal amount');
      return;
    }

    if (parseFloat(withdrawAmount) > balance) {
      onError('Insufficient balance');
      return;
    }

    setProcessing(true);
    
    try {
      const amountSats = parseInt(withdrawAmount);
      
      if (isTestMode) {
        // Simulate test withdrawal
        setTimeout(() => {
          onBalanceUpdate?.(balance - amountSats);
          onSuccess(`Successfully withdrew ${amountSats} test sats!`);
          setIsWithdrawing(false);
          setWithdrawAmount('1000');
          setProcessing(false);
        }, 1500);
        return;
      }

      const provider = await requestProvider();
      if (!provider) {
        throw new Error('No wallet connected');
      }

      // Generate invoice from connected wallet
      const invoice = await provider.makeInvoice({
        amount: amountSats,
        defaultMemo: `Withdrawal from Nostr Ad Marketplace`,
      });

      // Process withdrawal via your API
      const response = await fetch('/api/wallet/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'WITHDRAWAL',
          amount: amountSats,
          invoice: invoice.paymentRequest,
          description: 'Wallet withdrawal via Bitcoin Connect',
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Withdrawal failed');
      }

      onBalanceUpdate?.(balance - amountSats);
      onSuccess(`Successfully withdrew ${amountSats} sats!`);
      setIsWithdrawing(false);
      setWithdrawAmount('1000');
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Withdrawal failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Connection Status */}
      <DashboardCard title="Lightning Wallet">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${isConnected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">
                {isConnected ? 'Wallet Connected' : 'No Wallet Connected'}
              </p>
              <p className="text-sm text-gray-500">
                {isConnected ? connectedWallet : 'Connect your Lightning wallet to get started'}
              </p>
            </div>
          </div>
          
          {!isConnected && (
            <Button onClick={connectWallet} className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Connect Wallet</span>
            </Button>
          )}
        </div>
      </DashboardCard>

      {/* Balance Display */}
      <DashboardCard title="Balance">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            <CurrencyAmount sats={balance} />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {isTestMode ? 'Test Mode Balance' : 'Available Balance'}
          </p>
        </div>
      </DashboardCard>

      {/* Deposit/Withdraw Actions */}
      {isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Deposit Card */}
          <DashboardCard title="Deposit">
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isTestMode ? 'Add test funds to your balance' : 'Add funds using your connected Lightning wallet'}
              </p>
              
              {!isDepositing ? (
                <Button 
                  onClick={() => setIsDepositing(true)}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700"
                >
                  <ArrowDown className="h-4 w-4" />
                  <span>Deposit Funds</span>
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Amount (sats)
                    </label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="1000"
                      min="1"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setIsDepositing(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDeposit}
                      disabled={processing}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {processing ? 'Processing...' : 'Deposit'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DashboardCard>

          {/* Withdraw Card */}
          <DashboardCard title="Withdraw">
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isTestMode ? 'Withdraw test funds from your balance' : 'Withdraw funds to your connected Lightning wallet'}
              </p>
              
              {!isWithdrawing ? (
                <Button 
                  onClick={() => setIsWithdrawing(true)}
                  disabled={balance <= 0}
                  className="w-full flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700"
                >
                  <ArrowUp className="h-4 w-4" />
                  <span>Withdraw Funds</span>
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Amount (sats)
                    </label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      max={balance}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="1000"
                      min="1"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setIsWithdrawing(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleWithdraw}
                      disabled={processing || parseFloat(withdrawAmount) > balance}
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                    >
                      {processing ? 'Processing...' : 'Withdraw'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DashboardCard>
        </div>
      )}

      {isTestMode && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Zap className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Test Mode Active
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>You're in test mode. All transactions are simulated and no real Bitcoin is involved.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BitcoinConnectWallet;