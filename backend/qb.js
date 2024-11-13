// @ts-check
import { updateQuickBooksSync } from './db.js';

/**
 * Validates and syncs an account to QuickBooks
 * @param {number} accountId - The ID of the account to sync
 * @param {string} accountName - The name of the account to validate
 * @throws {Error} If account name contains illegal characters
 * @returns {Promise<void>}
 */
export async function syncAccountToQuickBooks(accountId, accountName) {
    // Check for illegal characters
    const illegalChars = /[&%*^$#@]/;
    if (illegalChars.test(accountName)) {
        throw new Error('Quickbooks - Account Sync Failed. Business Validation Error.');
    }

    // If validation passes, update sync status
    await updateQuickBooksSync(accountId, true);
}
