const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB connection string from .env file
const MONGO_URI = process.env.MONGO_DB_CONNECTION_STRING;

async function checkDatabase() {
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        console.log('Connection String:', MONGO_URI.replace(/\/\/.*:.*@/, '//***:***@')); // Hide credentials
        
        // List all databases
        const adminDb = client.db().admin();
        const databases = await adminDb.listDatabases();
        console.log('\nAvailable databases:');
        databases.databases.forEach(db => {
            console.log(`- ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
        });
        
        // Check the 'vms' database specifically
        console.log('\n=== Checking VMS Database ===');
        const vmsDb = client.db('vms');
        const collections = await vmsDb.listCollections().toArray();
        
        console.log('\nCollections in VMS database:');
        if (collections.length === 0) {
            console.log('No collections found in VMS database');
        } else {
            for (const collection of collections) {
                console.log(`- ${collection.name}`);
                const count = await vmsDb.collection(collection.name).countDocuments();
                console.log(`  Documents: ${count}`);
                
                // If it's users collection, show some sample data
                if (collection.name === 'users' && count > 0) {
                    const sampleUsers = await vmsDb.collection('users').find({}).limit(3).toArray();
                    console.log('  Sample users:');
                    sampleUsers.forEach((user, index) => {
                        console.log(`    ${index + 1}. ${user.email} (permission: ${user.permission})`);
                    });
                }
            }
        }
        
        // Also check if there's a different database that might contain users
        console.log('\n=== Checking for users in other databases ===');
        for (const dbInfo of databases.databases) {
            if (dbInfo.name !== 'vms' && !['admin', 'local', 'config'].includes(dbInfo.name)) {
                const db = client.db(dbInfo.name);
                const collections = await db.listCollections().toArray();
                const userCollections = collections.filter(c => c.name.toLowerCase().includes('user'));
                
                if (userCollections.length > 0) {
                    console.log(`\nFound user-related collections in '${dbInfo.name}' database:`);
                    for (const collection of userCollections) {
                        const count = await db.collection(collection.name).countDocuments();
                        console.log(`- ${collection.name}: ${count} documents`);
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('Error checking database:', error);
    } finally {
        await client.close();
        console.log('\nDisconnected from MongoDB');
    }
}

// Run the script
checkDatabase().catch(console.error);