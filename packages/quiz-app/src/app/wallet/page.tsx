"use client";
import { useState, useContext, useEffect } from "react";
import { ComputerContext } from "../common-components";
import { Wallet } from '../common-components';

export default function WalletPage() {
  const computer = useContext(ComputerContext);
  const [balance, setBalance] = useState<number | null>(null);
  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    const getWalletInfo = async () => {
      if (computer) {
        try {
          const walletBalance = await computer.getBalance();
          const walletAddress = computer.getAddress();
          // Handle different balance response formats
          let balanceValue = 0;
          if (typeof walletBalance === 'object' && walletBalance !== null) {
            if ('balance' in walletBalance) {
              balanceValue = Number(walletBalance.balance);
            } else if ('value' in walletBalance) {
              balanceValue = Number((walletBalance as any).value);
            }
          } else if (typeof walletBalance === 'number') {
            balanceValue = walletBalance;
          }
          setBalance(balanceValue);
          setAddress(walletAddress);
        } catch (error) {
          console.error('Error getting wallet info:', error);
          setBalance(0);
          setAddress('');
        }
      } else {
        setBalance(null);
        setAddress('');
      }
    };

    getWalletInfo();
  }, [computer]);

  const formatBalance = (balance: number) => {
    return (balance / 100000000).toFixed(8); // Convert satoshis to BTC
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Wallet Management
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage your Bitcoin wallet for quiz rewards and transactions
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Wallet Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Wallet Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded border">
                  <code className="text-sm break-all text-gray-800 dark:text-gray-200">
                    {address || 'Not connected'}
                  </code>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Balance
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded border">
                  <span className="text-lg font-mono text-gray-800 dark:text-gray-200">
                    {balance !== null ? `${formatBalance(balance)} BTC` : 'Loading...'}
                  </span>
                  {balance !== null && (
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      ({balance.toLocaleString()} satoshis)
                    </span>
                  )}
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Refresh Balance
                </button>
              </div>
            </div>
          </div>

          {/* Deposit Funds */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Fund Your Wallet
            </h2>
            
            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Use the wallet component below to fund your wallet for quiz transactions:
              </p>
            </div>

            {/* Use the existing Wallet component */}
            <Wallet />
          </div>
        </div>

        {/* Recent Transactions Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <p>No recent transactions</p>
            <p className="text-sm mt-2">Your quiz rewards and payments will appear here</p>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
            How it works
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Fund your wallet to create quizzes with rewards (teachers)</li>
            <li>• Earn Bitcoin by answering quiz questions correctly (students)</li>
            <li>• All transactions are recorded on the blockchain for transparency</li>
            <li>• Your wallet balance automatically updates when you receive rewards</li>
          </ul>
        </div>
      </div>
    </div>
  );
}