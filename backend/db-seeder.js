// @ts-check
import { faker } from '@faker-js/faker';
import { initDb, createAccount, createJob, getAllAccounts } from './db.js';
import { syncAccountToQuickBooks } from './qb.js';

const numAccountsToMerge = 1;
const accountsToMerge = []

/**
 * Generate random accounts and jobs for testing
 */
export async function seedDatabase() {
    await initDb();

    // Check if we already have accounts
    const existingAccounts = await getAllAccounts();
    if (existingAccounts.length > 0) {
        console.log('Server - Database already has accounts, skipping seed');
        return;
    }

    // Create 100 random accounts
    for (let i = 0; i < 100; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const isQbLegalName = Math.random() <= 0.60;
        const accountName = isQbLegalName
            ? `${firstName} ${lastName}`
            : `${lastName} & ${faker.person.lastName()}`;
        // Create account with fake data
        const accountData = {
            accountName,
            contactFirstName: firstName,
            contactLastName: lastName,
            phoneNumber: faker.phone.number({ style: 'national' }),
            emailAddress: `${firstName.toLowerCase()}_${lastName.toLowerCase()}@gmail.com`
        };

        // 10% chance to add account to merge list if we don't already have 2
        if (accountsToMerge.length < numAccountsToMerge && Math.random() < 0.1) {
            accountsToMerge.push(accountData);
        }

        const account = await createAccount(accountData);
        // If account name is QB legal (no special chars), sync to QuickBooks
        if (isQbLegalName) {
          await syncAccountToQuickBooks(account.id, accountName);
        }

        // Create 0-6 random jobs for this account
        const numJobs = Math.floor(Math.random() * 7);
        
        for (let j = 0; j < numJobs; j++) {
            const jobData = {
                jobName: faker.commerce.productName(),
                jobDate: faker.date.between({ 
                    from: '2023-01-01', 
                    to: '2024-12-31' 
                }).toISOString().split('T')[0],
                accountId: account.id
            };

            await createJob(jobData);
        }
    }

    // Create duplicate accounts for testing merge functionality
    for (const account of accountsToMerge) {
        // Create first instance of the account
        const accountDup = await createAccount(account);
        if (!accountDup.accountName.includes('&')) {
          await syncAccountToQuickBooks(accountDup.id, account.accountName);
        }
        
        // Create 1-3 random jobs for first instance
        const numJobs1 = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numJobs1; i++) {
            await createJob({
                jobName: faker.commerce.productName(),
                jobDate: faker.date.between({ 
                    from: '2023-01-01', 
                    to: '2024-12-31' 
                }).toISOString().split('T')[0],
                accountId: accountDup.id
            });
        }
    }

    console.log('Server - Database seeded successfully!');
}
