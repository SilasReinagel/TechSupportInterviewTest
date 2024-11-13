import { useState } from 'react';
import { executeQuery } from '../services/api';

function SqlExecution() {
  const [sql, setSql] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleExecute = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await executeQuery(sql, []);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">SQL Execution</h1>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Use with Caution
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>This tool allows direct SQL execution. DROP, TRUNCATE, and ALTER operations are not allowed.</p>
            </div>
          </div>
        </div>
      </div>

      {/* SQL Form */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleExecute} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SQL Query
            </label>
            <textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="SELECT * FROM accounts"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 disabled:opacity-50"
            >
              {loading ? 'Executing...' : 'Execute Query'}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Results</h3>
          {Array.isArray(result) ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(result[0] || {}).map(key => (
                      <th
                        key={key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((value, j) => (
                        <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {JSON.stringify(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export default SqlExecution;