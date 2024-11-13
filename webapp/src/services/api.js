// @ts-check

const API_BASE = `http://localhost:3089/api`;

/**
 * @typedef {import('../../../backend/db.js').Account} Account
 * @typedef {import('../../../backend/db.js').Job} Job
 */

/**
 * Get all accounts with their jobs
 * @returns {Promise<Account[]>}
 */
export async function getAccounts() {
    const response = await fetch(`${API_BASE}/accounts`);
    if (!response.ok) {
        throw new Error('Failed to fetch accounts');
    }
    return response.json();
}

/**
 * Create a new account
 * @param {Omit<Account, 'id' | 'jobs' | 'isSyncedToQuickbooks'>} accountData
 * @returns {Promise<Account>} 
 */
export async function createAccount(accountData) {
    const response = await fetch(`${API_BASE}/accounts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(accountData)
    });
    if (!response.ok) {
        throw new Error('Failed to create account');
    }
    return response.json();
}

/**
 * Create a new job
 * @param {Omit<Job, 'id'>} jobData
 * @returns {Promise<Job>}
 */
export async function createJob(jobData) {
    const response = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
    });
    if (!response.ok) {
        throw new Error('Failed to create job');
    }
    return response.json();
}

/**
 * Mark an account as synced to QuickBooks
 * @param {number} accountId
 * @returns {Promise<void>}
 */
export async function syncAccountToQuickBooks(accountId) {
    const response = await fetch(`${API_BASE}/accounts/${accountId}/sync`, {
        method: 'POST'
    });
    if (!response.ok) {
        throw new Error('Failed to sync account to QuickBooks');
    }
}

/**
 * Execute a custom SQL query
 * @param {string} sql 
 * @param {any[]} [params]
 * @returns {Promise<any>}
 */
export async function executeQuery(sql, params = []) {
    const response = await fetch(`${API_BASE}/dbexec`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql, params })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to execute query');
    }
    const { result } = await response.json();
    return result;
}
