import { useState, useEffect } from 'react';
import { getAccounts } from '../services/api';

function Home() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAccounts()
      .then(data => {
        setAccounts(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load accounts');
        setLoading(false);
      });
  }, []);

  // Find duplicate accounts by checking name and contact info
  const findDuplicateAccounts = () => {
    const duplicates = [];
    const seen = new Map();

    accounts.forEach(account => {
      // Create key from account details to detect duplicates
      const key = `${account.accountName.toLowerCase()}-${account.contactFirstName.toLowerCase()}-${account.contactLastName.toLowerCase()}`;
      
      if (seen.has(key)) {
        // Found a duplicate
        const existingAccount = seen.get(key);
        // Only add if not already in duplicates array
        if (!duplicates.some(d => 
          (d.name1 === existingAccount.accountName && d.name2 === account.accountName) ||
          (d.name1 === account.accountName && d.name2 === existingAccount.accountName)
        )) {
          duplicates.push({
            name1: existingAccount.accountName,
            name2: account.accountName,
            reason: 'Potential duplicate based on matching account name and contact details'
          });
        }
      } else {
        seen.set(key, account);
      }
    });

    return duplicates;
  };

  const duplicateAccounts = findDuplicateAccounts();
  const syncIssues = accounts.filter(acc => !acc.isSyncedToQuickbooks);

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Attention Required
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>There are three issues that need your attention:</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Duplicate Accounts Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-4">
            1. Duplicate Accounts Found ({duplicateAccounts.length})
          </h3>
          {duplicateAccounts.length > 0 ? (
            duplicateAccounts.map((dup, index) => (
              <div key={index} className="border-l-4 border-red-400 pl-4 mb-4">
                <p className="font-medium">Accounts to Merge:</p>
                <p className="text-gray-600">{dup.name1}</p>
                <p className="text-gray-600">{dup.name2}</p>
                <p className="text-sm text-gray-500 mt-2">{dup.reason}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No duplicate accounts found</p>
          )}
        </div>

        {/* Phone Number Issues Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-orange-600 mb-4">
            2. Account Creation Bug - Wrong Phone Number
          </h3>
          <div className="space-y-4">
            <p className="text-gray-600">
              Bug: Phone numbers are not being saved correctly for accounts created after the first one.
            </p>
            <div className="text-sm text-gray-600">
              Steps to reproduce (DO NOT LEAVE THE ACCOUNTS PAGE WHILE REPRODUCING):
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Go to the Accounts page</li>
                <li>Create one new account with a phone number</li>
                <li>Observe the first account's phone number is correct</li>
                <li>Create another account with a different phone number</li>
                <li>Observe the second account's phone number is incorrect</li>
              </ol>
            </div>
          </div>
        </div>

        {/* QuickBooks Sync Issues Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-blue-600 mb-4">
            3. QuickBooks Sync Required
          </h3>
          <div className="space-y-4">
            <p className="text-gray-600">
              {syncIssues.length} accounts need to be synced with QuickBooks
            </p>
            <div className="max-h-40 overflow-y-auto">
              {syncIssues.map(account => (
                <div key={account.id} className="py-2 border-b">
                  <p className="font-medium">{account.accountName}</p>
                  <p className="text-sm text-gray-500">
                    Contact: {account.contactFirstName} {account.contactLastName}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Accounts</h3>
          <p className="text-2xl font-semibold text-gray-900">{accounts.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Synced with QuickBooks</h3>
          <p className="text-2xl font-semibold text-gray-900">
            {accounts.filter(a => a.isSyncedToQuickbooks).length} / {accounts.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Jobs</h3>
          <p className="text-2xl font-semibold text-gray-900">
            {accounts.reduce((sum, account) => sum + (account.jobs?.length || 0), 0)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;