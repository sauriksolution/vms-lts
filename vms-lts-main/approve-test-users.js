const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB connection string from .env file
const MONGO_URI = process.env.MONGO_DB_CONNECTION_STRING;

async function approveAllTestUsers() {
    const client = new MongoClient(MONGO_URI);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db('test');
        const usersCollection = db.collection('users');
        
        // Find all unauthorized users (permission < 0)
        const unauthorizedUsers = await usersCollection.find({ permission: { $lt: 0 } }).toArray();
        
        console.log(`\nFound ${unauthorizedUsers.length} unauthorized users to approve:\n`);
        
        if (unauthorizedUsers.length === 0) {
            console.log('No unauthorized users found.');
            return;
        }
        
        // Display users before approval
        unauthorizedUsers.forEach((user, index) => {
            const currentRole = {
                '-1': 'Receptionist (Unauthorized)',
                '-2': 'Resident (Unauthorized)',
                '-3': 'Admin (Unauthorized)'
            }[user.permission] || `Unknown (${user.permission})`;
            
            console.log(`${index + 1}. ${user.email} - ${user.name}`);
            console.log(`   Current: ${currentRole} (${user.permission})`);
        });
        
        console.log('\n' + '='.repeat(50));
        console.log('APPROVING ALL USERS...');
        console.log('='.repeat(50));
        
        // Approve users by converting negative permissions to positive
        const approvalPromises = unauthorizedUsers.map(async (user) => {
            let newPermission;
            
            // Convert negative permissions to positive
            switch (user.permission) {
                case -1: // Unauthorized Receptionist -> Authorized Receptionist
                    newPermission = 1;
                    break;
                case -2: // Unauthorized Resident -> Authorized Resident
                    newPermission = 2;
                    break;
                case -3: // Unauthorized Admin -> Authorized Admin
                    newPermission = 0;
                    break;
                default:
                    console.log(`Warning: Unknown permission level ${user.permission} for user ${user.email}`);
                    return null;
            }
            
            // Update the user's permission
            const result = await usersCollection.updateOne(
                { _id: user._id },
                { $set: { permission: newPermission } }
            );
            
            const newRole = {
                0: 'Admin (Authorized)',
                1: 'Receptionist (Authorized)',
                2: 'Resident (Authorized)'
            }[newPermission];
            
            console.log(`✓ Approved: ${user.email} -> ${newRole} (${newPermission})`);
            
            return result;
        });
        
        // Wait for all approvals to complete
        const results = await Promise.all(approvalPromises);
        const successfulApprovals = results.filter(r => r && r.modifiedCount > 0).length;
        
        console.log('\n' + '='.repeat(50));
        console.log(`APPROVAL COMPLETE!`);
        console.log(`Successfully approved ${successfulApprovals} out of ${unauthorizedUsers.length} users.`);
        console.log('='.repeat(50));
        
        // Verify the changes
        console.log('\nVerifying changes...');
        const updatedUsers = await usersCollection.find({}).toArray();
        const stillUnauthorized = updatedUsers.filter(u => u.permission < 0).length;
        const nowAuthorized = updatedUsers.filter(u => u.permission >= 0).length;
        
        console.log(`\nFinal Status:`);
        console.log(`- Total Users: ${updatedUsers.length}`);
        console.log(`- Authorized Users: ${nowAuthorized}`);
        console.log(`- Unauthorized Users: ${stillUnauthorized}`);
        
        if (stillUnauthorized === 0) {
            console.log('\n🎉 SUCCESS: All users are now authorized!');
        } else {
            console.log(`\n⚠️  WARNING: ${stillUnauthorized} users still need authorization.`);
        }
        
    } catch (error) {
        console.error('Error approving users:', error);
    } finally {
        await client.close();
        console.log('\nDisconnected from MongoDB');
    }
}

// Run the script
approveAllTestUsers().catch(console.error);