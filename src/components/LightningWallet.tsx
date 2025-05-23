import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp, AlertCircle } from 'react-feather';
import { hasWebLNProvider } from '../lib/lightning';
import SatoshiIcon from './SatoshiIcon';

interface LightningWalletProps {
  balance?: number;
  isTestMode?: boolean;
  isLoading?: boolean;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onClose?: () => void;
  onBalanceUpdate?: (newBalance: number) => void;
}

const LightningWallet: React.FC<LightningWalletProps> = ({ 
  balance, 
  isTestMode = false, 
  isLoading = false,
  onSuccess,
  onError,
  onClose,
  onBalanceUpdate
}) => {
  const [activeTab, setActiveTab] = useState('deposit');
  const [depositAmount, setDepositAmount] = useState(1000);
  const [withdrawAmount, setWithdrawAmount] = useState(1000);
  const [withdrawInvoice, setWithdrawInvoice] = useState('');
  const [invoice, setInvoice] = useState('');
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);
  const [hasWebLN, setHasWebLN] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Check for WebLN provider
  useEffect(() => {
    setHasWebLN(hasWebLNProvider());
  }, []);

  // Handler for deposit amount change
  const handleDepositAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setDepositAmount(value);
    }
  };

  // Handler for withdraw amount change
  const handleWithdrawAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setWithdrawAmount(value);
    }
  };

  // Handler for withdraw invoice change
  const handleWithdrawInvoiceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWithdrawInvoice(e.target.value);
  };

  // Generate a Lightning invoice for deposit
  const generateInvoice = async () => {
    setIsGeneratingInvoice(true);
    setInvoice('');
    setCurrentTransactionId(null);

    try {
      // Special handling for test mode
      if (isTestMode) {
        // Generate a fake invoice in test mode
        const fakeInvoice = `lntb${depositAmount}n1test_invoice_${Date.now()}`;
        const fakeTransactionId = `test_tx_${Date.now()}`;
        
        // Set the invoice and transaction ID
        setInvoice(fakeInvoice);
        setCurrentTransactionId(fakeTransactionId);
        
        // Simulate log after 2 seconds and update the balance
        setTimeout(() => {
          // Call log callback to update UI
          onSuccess(`Test mode: Deposited ${depositAmount} sats`);
          
          // In test mode we don't automatically reload the page
          // This allows the user to see and interact with the invoice
        }, 2000);
        
        return;
      }
      
      // Regular flow for production mode
      const response = await fetch('/api/payments/lightning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deposit',
          amount: depositAmount,
        }),
        credentials: 'include', // Include cookies for authentication
      });

      // Make sure we can get a valid response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Invalid response received from server. Please try again.');
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('You need to be logged in to generate an invoice. Please log in and try again.');
        } else {
          throw new Error(data.log || 'Failed to generate invoice');
        }
      }

      setInvoice(data.invoice);
      setCurrentTransactionId(data.transactionId);
    } catch (error: any) {
      console.log('Error generating invoice:', error);
      onError(error.message || 'Failed to generate invoice. Please try again later.');
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  // Process a withdrawal
  const processWithdrawal = async () => {
    if (!withdrawInvoice.trim()) {
      onError('Please enter a Lightning invoice');
      return;
    }

    if (withdrawAmount <= 0) {
      onError('Withdrawal amount must be greater than 0');
      return;
    }

    if (withdrawAmount > (balance || 0)) {
      onError('Insufficient balance for withdrawal');
      return;
    }

    setIsProcessingWithdrawal(true);

    try {
      // Special handling for test mode
      if (isTestMode) {
        // Simulate a short delay for realism
        setTimeout(() => {
          // Calculate new balance by subtracting withdrawal amount
          const newBalance = Math.max(0, (balance || 0) - withdrawAmount);
          
          // Update balance in parent component if callback provided
          if (onBalanceUpdate) {
            onBalanceUpdate(newBalance);
          }
          
          // Reset form
          setWithdrawInvoice('');
          setWithdrawAmount(1000);
          
          // Notify log
          onSuccess(`Test mode: Withdrawn ${withdrawAmount} sats`);
          
          // In test mode we don't automatically reload the page
          // This allows the user to see the results of the withdrawal
        }, 1500);
        
        return;
      }
      
      // Regular flow for production mode
      const response = await fetch('/api/payments/lightning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'withdraw',
          invoice: withdrawInvoice,
          amount: withdrawAmount,
        }),
        credentials: 'include', // Include cookies for authentication
      });

      // Make sure we can get a valid response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Invalid response received from server. Please try again.');
      }

      if (!response.ok) {
        throw new Error(data.log || 'Failed to process withdrawal');
      }

      // Reset form
      setWithdrawInvoice('');
      setWithdrawAmount(1000);
      
      // Notify log
      onSuccess(`Successfully withdrawn ${withdrawAmount} sats`);
    } catch (error: any) {
      console.log('Error processing withdrawal:', error);
      onError(error.message || 'Failed to process withdrawal. Please try again.');
    } finally {
      setIsProcessingWithdrawal(false);
    }
  };

  // Pay invoice using WebLN
  const payWithWebLN = async () => {
    if (!invoice || !hasWebLN) return;

    try {
      const webln = (window as any).webln;
      await webln.enable();
      await webln.sendPayment(invoice);
      
      // After payment, check the status
      if (currentTransactionId) {
        checkPaymentStatus(currentTransactionId);
      }
    } catch (error: any) {
      console.log('WebLN payment error:', error);
      onError(error.message || 'Failed to pay with WebLN');
    }
  };

  // Check payment status
  const checkPaymentStatus = async (transactionId: string) => {
    if (checkingPayment) return;
    
    setCheckingPayment(true);
    
    try {
      // Special handling for test mode
      if (isTestMode) {
        // Simulate a short delay for realism
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Manually add funds to wallet in test mode
        const newBalance = (balance || 0) + depositAmount;
        
        // Update balance in parent component if callback provided
        if (onBalanceUpdate) {
          onBalanceUpdate(newBalance);
        }
        
        // Update the UI with feedback
        onSuccess(`Test mode: Added ${depositAmount} sats to balance`);
        
        // Clear the invoice state 
        setInvoice('');
        setCurrentTransactionId(null);
        setCheckingPayment(false);
        
        // Close the modal automatically after a brief delay
        // This simulates a real payment confirmation
        if (onClose) {
          setTimeout(() => onClose(), 1000);
        } else {
          // If no close handler was provided, refresh the page
          setTimeout(() => window.location.reload(), 1000);
        }
        
        return;
      }
      
      // Regular flow for production mode
      const response = await fetch(`/api/payments/lightning?transactionId=${transactionId}`, {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
      });

      // Make sure we can get a valid response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Invalid response received from server. Please try again.');
      }

      if (!response.ok) {
        throw new Error(data.log || 'Failed to check payment status');
      }

      if (data.status === 'COMPLETED') {
        // Payment received
        setInvoice('');
        setCurrentTransactionId(null);
        onSuccess(`Successfully deposited ${depositAmount} sats`);
      }
    } catch (error: any) {
      console.log('Error checking payment status:', error);
      // Only show error to user in non-test mode or if explicitly requested through the UI
      if (!isTestMode) {
        onError(error.message || 'Failed to check payment status. Please try again.');
      }
    } finally {
      setCheckingPayment(false);
    }
  };

  // Copy invoice to clipboard
  const copyInvoiceToClipboard = () => {
    navigator.clipboard.writeText(invoice).then(() => {
      alert('Invoice copied to clipboard!');
    }).catch(err => {
      console.log('Could not copy text: ', err);
    });
  };

  // Preset amounts for quick selection
  const presetAmounts = [1000, 5000, 10000, 50000, 100000];

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          {/* Balance Display */}
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
            <div className="flex items-center justify-center mt-2">
              <SatoshiIcon size={24} className="text-green-500 mr-2" />
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {isLoading ? '...' : `${balance} sats`}
              </p>
            </div>
          </div>

          {/* Deposit/Withdraw Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('deposit')}
                className={`inline-flex items-center py-4 px-4 text-sm font-medium border-b-2 flex-1 justify-center ${
                  activeTab === 'deposit'
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <ArrowDown className="h-4 w-4 mr-2" />
                Deposit
              </button>
              <button
                onClick={() => setActiveTab('withdraw')}
                className={`inline-flex items-center py-4 px-4 text-sm font-medium border-b-2 flex-1 justify-center ${
                  activeTab === 'withdraw'
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <ArrowUp className="h-4 w-4 mr-2" />
                Withdraw
              </button>
            </nav>
          </div>

          {activeTab === 'deposit' ? (
            <div>
              {isTestMode && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                        Test Mode Active
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                        <p>
                          In test mode, deposits are simulated. No real Lightning payments will be processed.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Amount Selection */}
                <div>
                  <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount (satoshis)
                  </label>
                  <input
                    type="number"
                    id="depositAmount"
                    min="1"
                    value={depositAmount}
                    onChange={handleDepositAmountChange}
                    className="input-field w-full"
                  />
                </div>

                {/* Preset Amounts */}
                <div>
                  <div className="flex flex-wrap gap-2">
                    {presetAmounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setDepositAmount(amount)}
                        className={`px-3 py-1 text-sm rounded-md ${
                          depositAmount === amount
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {amount.toLocaleString()} sats
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Invoice Button */}
                <button
                  onClick={generateInvoice}
                  disabled={isGeneratingInvoice || depositAmount <= 0}
                  className={`btn-primary w-full ${
                    isGeneratingInvoice || depositAmount <= 0 ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isGeneratingInvoice ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Invoice...
                    </>
                  ) : (
                    isTestMode ? 'Generate Test Invoice' : 'Generate Lightning Invoice'
                  )}
                </button>

                {/* Invoice Display */}
                {invoice && (
                  <div className="mt-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Lightning Invoice
                        </h4>
                        <button
                          onClick={copyInvoiceToClipboard}
                          className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-xs font-mono break-all text-gray-600 dark:text-gray-400" data-testid="invoice-text">
                        {invoice}
                      </p>
                    </div>

                    {!isTestMode && hasWebLN && (
                      <button
                        onClick={payWithWebLN}
                        className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md transition-colors"
                      >
                        Pay with WebLN
                      </button>
                    )}

                    {isTestMode ? (
                      <button
                        data-testid="add-test-sats-button"
                        onClick={() => {
                          // In test mode, directly update balance
                          const newBalance = (balance || 0) + depositAmount;
                          
                          // Update balance in parent component if callback provided
                          if (onBalanceUpdate) {
                            onBalanceUpdate(newBalance);
                          }
                          
                          // Show log message
                          onSuccess(`Test mode: Added ${depositAmount} sats to balance`);
                          
                          // Clean up invoice state
                          setInvoice('');
                          setCurrentTransactionId(null);
                          setCheckingPayment(false);
                          
                          // Close the modal automatically
                          if (onClose) {
                            setTimeout(() => onClose(), 1000);
                          } else {
                            // If no close handler was provided, refresh the page
                            setTimeout(() => window.location.reload(), 1000);
                          }
                        }}
                        className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors"
                      >
                        Add Test Sats to Balance
                      </button>
                    ) : (
                      <button
                        onClick={() => currentTransactionId && checkPaymentStatus(currentTransactionId)}
                        disabled={!currentTransactionId || checkingPayment}
                        className={`mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors ${
                          !currentTransactionId || checkingPayment ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                      >
                        {checkingPayment ? 'Checking...' : 'Check Payment Status'}
                      </button>
                    )}
                  </div>
                )}

                {/* Instructions */}
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  <p className="font-medium">How to deposit:</p>
                  {isTestMode ? (
                    <ol className="list-decimal pl-5 mt-2 space-y-1">
                      <li>Enter the amount of test sats you want to deposit</li>
                      <li>Click "Generate Test Invoice"</li>
                      <li>Click "Add Test Sats to Balance" to simulate a payment</li>
                      <li>Your balance will update immediately</li>
                    </ol>
                  ) : (
                    <ol className="list-decimal pl-5 mt-2 space-y-1">
                      <li>Enter the amount you want to deposit</li>
                      <li>Click "Generate Lightning Invoice"</li>
                      <li>Pay the invoice with your Lightning wallet</li>
                      <li>Your balance will update once payment is confirmed</li>
                    </ol>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="space-y-6">
                {isTestMode && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                          Test Mode Active
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                          <p>
                            In test mode, withdrawals are simulated. No real Lightning payments will be processed.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lightning Invoice Input */}
                <div>
                  <label htmlFor="withdrawInvoice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isTestMode ? 'Test Invoice (any text)' : 'Lightning Invoice'}
                  </label>
                  <textarea
                    id="withdrawInvoice"
                    rows={3}
                    value={withdrawInvoice}
                    onChange={handleWithdrawInvoiceChange}
                    className="input-field w-full"
                    placeholder={isTestMode ? "Any text is fine in test mode..." : "lnbc..."}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {isTestMode ? 
                      'In test mode, any text is accepted as a valid invoice' : 
                      'Paste a Lightning invoice from your wallet'
                    }
                  </p>
                </div>

                {/* Amount Selection */}
                <div>
                  <label htmlFor="withdrawAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount (satoshis)
                  </label>
                  <input
                    type="number"
                    id="withdrawAmount"
                    min="1"
                    max={balance || 0}
                    value={withdrawAmount}
                    onChange={handleWithdrawAmountChange}
                    className="input-field w-full"
                  />
                </div>

                {/* Preset Amounts */}
                <div>
                  <div className="flex flex-wrap gap-2">
                    {presetAmounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setWithdrawAmount(Math.min(amount, balance || 0))}
                        disabled={amount > (balance || 0)}
                        className={`px-3 py-1 text-sm rounded-md ${
                          amount > (balance || 0)
                            ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                            : withdrawAmount === amount
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {amount.toLocaleString()} sats
                      </button>
                    ))}
                  </div>
                </div>

                {/* Withdraw Button */}
                <button
                  onClick={processWithdrawal}
                  disabled={isProcessingWithdrawal || !withdrawInvoice.trim() || withdrawAmount <= 0 || withdrawAmount > (balance || 0)}
                  className={`btn-primary w-full ${
                    isProcessingWithdrawal || !withdrawInvoice.trim() || withdrawAmount <= 0 || withdrawAmount > (balance || 0)
                      ? 'opacity-75 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {isProcessingWithdrawal ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    isTestMode ? `Withdraw ${withdrawAmount} Test Sats` : `Withdraw ${withdrawAmount} sats`
                  )}
                </button>

                {/* Instructions */}
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  <p className="font-medium">How to withdraw:</p>
                  {isTestMode ? (
                    <ol className="list-decimal pl-5 mt-2 space-y-1">
                      <li>Enter any text in the invoice field (test mode accepts any value)</li>
                      <li>Enter the amount of test sats you want to withdraw</li>
                      <li>Click "Withdraw" to simulate a withdrawal</li>
                      <li>Your balance will update immediately</li>
                    </ol>
                  ) : (
                    <ol className="list-decimal pl-5 mt-2 space-y-1">
                      <li>Create a Lightning invoice in your wallet</li>
                      <li>Paste the invoice in the field above</li>
                      <li>Enter the amount you want to withdraw</li>
                      <li>Click "Withdraw" to receive funds</li>
                    </ol>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LightningWallet;
