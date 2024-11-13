// @ts-check
import { faker } from '@faker-js/faker';
import { initDb, createAccount, createJob, getAllAccounts } from './db.js';

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

    let accountToDuplicate = null;
    let duplicateJobs = [];

    // Create 100 random accounts
    for (let i = 0; i < 100; i++) {
        // Create account with fake data
        const accountData = {
            accountName: faker.company.name(),
            contactFirstName: faker.person.firstName(),
            contactLastName: faker.person.lastName(),
            phoneNumber: faker.phone.number({ style: 'national' }),
            emailAddress: faker.internet.email()
        };

        const account = await createAccount(accountData);

        // Store one random account to duplicate later
        if (i === Math.floor(Math.random() * 100)) {
            accountToDuplicate = { ...accountData };
            
            // Create 0-6 random jobs and store them for the duplicate
            const numJobs = Math.floor(Math.random() * 7);
            for (let j = 0; j < numJobs; j++) {
                duplicateJobs.push({
                    jobName: faker.commerce.productName(),
                    jobDate: faker.date.between({ 
                        from: '2023-01-01', 
                        to: '2024-12-31' 
                    }).toISOString().split('T')[0]
                });
            }
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

    // Create the duplicate account with the same jobs
    if (accountToDuplicate) {
        const duplicateAccount = await createAccount(accountToDuplicate);
        
        // Create the same jobs for the duplicate account
        for (const job of duplicateJobs) {
            await createJob({
                ...job,
                accountId: duplicateAccount.id
            });
        }
    }

    console.log('Server - Database seeded successfully!');
    process.exit(0);
}
