const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB connection string from .env file
const MONGO_URI = process.env.MONGO_DB_CONNECTION_STRING;

async function checkTestUsers() {
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db('test');
        const usersCollection = db.collection('users');
        
        // Find all users
        const allUsers = await usersCollection.find({}).toArray();
        
        console.log(`\nFound ${allUsers.length} total users in the TEST database:\n`);
        
        const roleMap = {
            '0': 'Admin (Authorized)',
            '1': 'Receptionist (Authorized)', 
            '2': 'Resident (Authorized)',
            '-1': 'Receptionist (Unauthorized)',
            '-2': 'Resident (Unauthorized)',
            '-3': 'Admin (Unauthorized)'
        };
        
        allUsers.forEach((user, index) => {
            const role = roleMap[user.permission] || `Unknown (${user.permission})`;
            console.log(`${index + 1}. Email: ${user.email}`);
            console.log(`   Name: ${user.name || 'N/A'}`);
            console.log(`   Role: ${role}`);
            console.log(`   Permission Level: ${user.permission}`);
            console.log(`   Sign-up Date: ${user.signUpDate || 'N/A'}`);
            console.log(`   User ID: ${user._id}`);
            console.log('');
        });
        
        // Count by status
        const authorizedCount = allUsers.filter(u => u.permission >= 0).length;
        const unauthorizedCount = allUsers.filter(u => u.permission < 0).length;
        
        console.log('='.repeat(50));
        console.log(`Summary:`);
        console.log(`- Total Users: ${allUsers.length}`);
        console.log(`- Authorized Users: ${authorizedCount}`);
        console.log(`- Unauthorized Users: ${unauthorizedCount}`);
        console.log('='.repeat(50));
        
        if (unauthorizedCount > 0) {
            console.log('\nUnauthorized users found! These need to be approved.');
        } else {
            console.log('\nAll users are already authorized!');
        }
        
    } catch (error) {
        console.error('Error checking users:', error);
    } finally {
        await client.close();
        console.log('\nDisconnected from MongoDB');
    }
}

// Run the script
checkTestUsers().catch(console.error);