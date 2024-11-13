// @ts-check
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

/** @type {import('sqlite').Database | null} */
let db = null;

/**
 * Initialize the database connection
 */
export async function initDb() {
    if (db) return db;
    
    db = await open({
        filename: './data.sqlite',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            accountName TEXT NOT NULL,
            contactFirstName TEXT NOT NULL,
            contactLastName TEXT NOT NULL,
            phoneNumber TEXT,
            emailAddress TEXT,
            isSyncedToQuickbooks BOOLEAN DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jobName TEXT NOT NULL,
            jobDate TEXT NOT NULL,
            accountId INTEGER NOT NULL,
            FOREIGN KEY (accountId) REFERENCES accounts(id)
        );
    `);

    return db;
}

/**
 * @typedef {Object} Account
 * @property {number} id
 * @property {string} accountName
 * @property {string} contactFirstName
 * @property {string} contactLastName
 * @property {string} [phoneNumber]
 * @property {string} [emailAddress]
 * @property {boolean} isSyncedToQuickbooks
 * @property {Job[]} [jobs]
 */

/**
 * @typedef {Object} Job
 * @property {number} id
 * @property {string} jobName
 * @property {string} jobDate
 * @property {number} accountId
 */

/**
 * Get all accounts with their associated jobs
 * @returns {Promise<Account[]>}
 */
export async function getAllAccounts() {
    const accounts = await db.all('SELECT * FROM accounts');
    const jobs = await db.all('SELECT * FROM jobs');

    return accounts.map(account => ({
        ...account,
        isSyncedToQuickbooks: Boolean(account.isSyncedToQuickbooks),
        jobs: jobs.filter(job => job.accountId === account.id)
    }));
}

/**
 * Get a single account by ID with its associated jobs
 * @param {number} accountId - The ID of the account to retrieve
 * @returns {Promise<Account|null>} The account if found, null otherwise
 */
export async function getAccount(accountId) {
    const account = await db.get('SELECT * FROM accounts WHERE id = ?', accountId);
    
    if (!account) {
        return null;
    }

    const jobs = await db.all('SELECT * FROM jobs WHERE accountId = ?', accountId);

    return {
        ...account,
        isSyncedToQuickbooks: Boolean(account.isSyncedToQuickbooks),
        jobs
    };
}

/**
 * Create a new account
 * @param {Omit<Account, 'id' | 'jobs' | 'isSyncedToQuickbooks'>} accountData
 * @returns {Promise<Account>}
 */
export async function createAccount(accountData) {
    const result = await db.run(
        `INSERT INTO accounts (accountName, contactFirstName, contactLastName, phoneNumber, emailAddress)
         VALUES (?, ?, ?, ?, ?)`,
        [
            accountData.accountName,
            accountData.contactFirstName,
            accountData.contactLastName,
            accountData.phoneNumber || null,
            accountData.emailAddress || null
        ]
    );

    return {
        id: result.lastID,
        ...accountData,
        isSyncedToQuickbooks: false,
        jobs: []
    };
}

/**
 * Create a new job for an account
 * @param {Omit<Job, 'id'>} jobData
 * @returns {Promise<Job>}
 */
export async function createJob(jobData) {
    const result = await db.run(
        `INSERT INTO jobs (jobName, jobDate, accountId)
         VALUES (?, ?, ?)`,
        [jobData.jobName, jobData.jobDate, jobData.accountId]
    );

    return {
        id: result.lastID,
        ...jobData
    };
}

/**
 * Update the QuickBooks sync status for an account
 * @param {number} accountId 
 * @param {boolean} syncStatus 
 * @returns {Promise<void>}
 */
export async function updateQuickBooksSync(accountId, syncStatus) {
    await db.run(
        'UPDATE accounts SET isSyncedToQuickbooks = ? WHERE id = ?',
        [syncStatus ? 1 : 0, accountId]
    );
}

/**
 * Execute a SQL query with optional parameters
 * @param {string} sql 
 * @param {any[]} [params] 
 * @returns {Promise<any>}
 * @throws {Error} If db is not initialized or query fails
 */
export async function executeQuery(sql, params = []) {
    if (!db) throw new Error('Database not initialized');
    
    try {
        // For SELECT queries
        if (sql.trim().toLowerCase().startsWith('select')) {
            return await db.all(sql, params);
        }
        // For other queries (INSERT, UPDATE, DELETE)
        const result = await db.run(sql, params);
        return {
            changes: result.changes,
            lastID: result.lastID
        };
    } catch (error) {
        throw new Error(`Query execution failed: ${error.message}`);
    }
}
