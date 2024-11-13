import { useState, useEffect } from 'react';
import { getAccounts, createAccount, syncAccountToQuickBooks } from '../services/api';

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [newAccount, setNewAccount] = useState({
    accountName: '',
    contactFirstName: '',
    contactLastName: '',
    phoneNumber: '',
    emailAddress: ''
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const data = await getAccounts();
      // Sort accounts in reverse order by ID
      const sortedAccounts = [...data].sort((a, b) => b.id - a.id);
      setAccounts(sortedAccounts);
      setLoading(false);
    } catch (err) {
      setError('Failed to load accounts');
      setLoading(false);
    }
  };


  const validateAndSetPhoneNumber = (newPhoneNumber) => {
    const strippedPhone = phoneNumber.replace(/\D/g, '');
    if (strippedPhone.length >= 10) {
      return;
    }
    setPhoneNumber(newPhoneNumber);
  }

  const handleCreateAccount = async (e) => {
    e.preventDefault();

    // Validate phone number has at least 10 characters
    const strippedPhone = phoneNumber.replace(/\D/g, '');
    if (strippedPhone.length < 10) {
      setErrorMessage('Phone number must have at least 10 digits');
      setShowErrorModal(true);
      return;
    }

    try {
      const accountToCreate = {
        ...newAccount,
        phoneNumber: phoneNumber
      };
      
      await createAccount(accountToCreate);
      await fetchAccounts();
      setShowCreateModal(false);
      setShowSuccessModal(true);
      
      setNewAccount({
        accountName: '',
        contactFirstName: '',
        contactLastName: '',
        phoneNumber: '',
        emailAddress: ''
      });

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } catch (err) {
      setError('Failed to create account');
    }
  };

  const handleSyncToQuickbooks = async (accountId) => {
    try {
      await syncAccountToQuickBooks(accountId);
      await fetchAccounts();
    } catch (err) {
      setErrorMessage(err.message);
      setShowErrorModal(true);
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewAccount({
      accountName: '',
      contactFirstName: '',
      contactLastName: '',
      phoneNumber: '',
      emailAddress: ''
    });
  };

  if (loading) return <div className="p-4">Loading accounts...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Accounts</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300"
        >
          Create Account
        </button>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Account created successfully!</span>
          </div>
        </div>
      )}

      {/* Accounts Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jobs</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QuickBooks</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {accounts.map((account) => (
              <tr key={account.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">#{account.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{account.accountName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {account.contactFirstName} {account.contactLastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{account.phoneNumber}</div>
                  <div className="text-sm text-gray-500">{account.emailAddress}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{account.jobs?.length || 0} jobs</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    account.isSyncedToQuickbooks
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {account.isSyncedToQuickbooks ? 'Synced' : 'Not Synced'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {!account.isSyncedToQuickbooks && (
                    <button
                      onClick={() => handleSyncToQuickbooks(account.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Sync to QuickBooks
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Create New Account</h2>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newAccount.accountName}
                  onChange={(e) => setNewAccount({...newAccount, accountName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newAccount.contactFirstName}
                  onChange={(e) => setNewAccount({...newAccount, contactFirstName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newAccount.contactLastName}
                  onChange={(e) => setNewAccount({...newAccount, contactLastName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newAccount.phoneNumber}
                  onChange={(e) => {
                    setNewAccount({...newAccount, phoneNumber: e.target.value});
                    validateAndSetPhoneNumber(e.target.value);
                  }}
                  placeholder="XXX-XXX-XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newAccount.emailAddress}
                  onChange={(e) => setNewAccount({...newAccount, emailAddress: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Error</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{errorMessage}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowErrorModal(false)}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Accounts;