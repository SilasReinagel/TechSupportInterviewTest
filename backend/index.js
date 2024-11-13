// @ts-check
import express from 'express';
import cors from 'cors';
import { getAllAccounts, createAccount, createJob, executeQuery, getAccount } from './db.js';
import { seedDatabase } from './db-seeder.js';
import { syncAccountToQuickBooks } from './qb.js';

const app = express();
app.use(cors({
  origin: '*',
  methods: '*',
  allowedHeaders: '*'
}));
app.use(express.json());

const port = 3089;

app.get('/', (req, res) => {
    res.send('Server is running');
});


app.get('/api/accounts', async (req, res) => {
    try {
        const accounts = await getAllAccounts();
        res.json(accounts);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/accounts', async (req, res) => {
    try {
        const account = await createAccount(req.body);
        res.status(201).json(account);
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/jobs', async (req, res) => {
    try {
        const job = await createJob(req.body);
        res.status(201).json(job);
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/accounts/:id/sync', async (req, res) => {
    try {
        const accountId = parseInt(req.params.id);
        const account = await getAccount(accountId);
        if (!account) {
            throw new Error('Account not found');
        }
        await syncAccountToQuickBooks(accountId, account.accountName);
        res.json({ success: true });
    } catch (error) {
        console.error('Error syncing account:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/dbexec', async (req, res) => {
    try {
        const { sql, params } = req.body;

        // Basic validation
        if (!sql || typeof sql !== 'string') {
            return res.status(400).json({ 
                error: 'SQL query is required and must be a string' 
            });
        }

        // Prevent certain dangerous operations
        const lowerSql = sql.toLowerCase();
        if (lowerSql.includes('drop') || 
            lowerSql.includes('truncate') || 
            lowerSql.includes('alter')) {
            return res.status(403).json({ 
                error: 'DROP, TRUNCATE, and ALTER operations are not allowed' 
            });
        }

        const result = await executeQuery(sql, params);
        res.json({ result });
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ 
            error: 'Query execution failed', 
            message: error.message 
        });
    }
});

// Initialize database and start server
seedDatabase()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server - Server running on port ${port}`);
        });
    })
    .catch(error => {
        console.error('Server - Failed to initialize database:', error);
        process.exit(1);
    });
