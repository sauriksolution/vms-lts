const { MongoClient } = require('mongodb');
require('dotenv').config();

// Connection strings
const LOCAL_URI = 'mongodb://localhost:27017/vms';
const ATLAS_URI = process.env.MONGO_DB_CONNECTION_STRING;

console.log('🚀 MongoDB Atlas Migration Script');
console.log('================================');

// Test Atlas connection with multiple approaches
async function testAtlasConnection() {
    console.log('🧪 Testing MongoDB Atlas connection...');
    
    // Try different connection options
    const connectionOptions = [
        // Option 1: Basic connection
        {},
        // Option 2: With SSL disabled
        { tls: false },
        // Option 3: With TLS but insecure
        { tls: true, tlsInsecure: true },
        // Option 4: With specific TLS version
        { tls: true, tlsInsecure: true, tlsAllowInvalidHostnames: true }
    ];
    
    for (let i = 0; i < connectionOptions.length; i++) {
        const options = connectionOptions[i];
        console.log(`\n🔄 Trying connection method ${i + 1}...`);
        
        try {
            const client = new MongoClient(ATLAS_URI, {
                serverSelectionTimeoutMS: 10000,
                connectTimeoutMS: 10000,
                ...options
            });
            
            await client.connect();
            console.log('✅ Atlas connection successful!');
            
            // Test database access
            const db = client.db('vms');
            const collections = await db.listCollections().toArray();
            console.log(`📊 Found ${collections.length} collections in Atlas database`);
            
            await client.close();
            return true;
        } catch (error) {
            console.log(`❌ Method ${i + 1} failed: ${error.message}`);
        }
    }
    
    return false;
}

// Test local connection
async function testLocalConnection() {
    console.log('\n🏠 Testing local MongoDB connection...');
    
    try {
        const client = new MongoClient(LOCAL_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000
        });
        
        await client.connect();
        console.log('✅ Local connection successful!');
        
        const db = client.db('vms');
        const collections = await db.listCollections().toArray();
        console.log(`📊 Found ${collections.length} collections in local database`);
        
        await client.close();
        return true;
    } catch (error) {
        console.log(`❌ Local connection failed: ${error.message}`);
        return false;
    }
}

// Perform migration
async function performMigration() {
    console.log('\n🔄 Starting data migration...');
    
    let localClient, atlasClient;
    
    try {
        // Connect to local MongoDB
        console.log('📡 Connecting to local MongoDB...');
        localClient = new MongoClient(LOCAL_URI);
        await localClient.connect();
        
        // Connect to Atlas with the working method
        console.log('☁️ Connecting to MongoDB Atlas...');
        atlasClient = new MongoClient(ATLAS_URI, {
            tls: true,
            tlsInsecure: true,
            serverSelectionTimeoutMS: 30000,
            connectTimeoutMS: 30000
        });
        await atlasClient.connect();
        
        const localDb = localClient.db('vms');
        const atlasDb = atlasClient.db('vms');
        
        // Get collections to migrate
        const collections = await localDb.listCollections().toArray();
        console.log(`\n📋 Collections to migrate: ${collections.map(c => c.name).join(', ')}`);
        
        let totalMigrated = 0;
        
        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            console.log(`\n📦 Migrating collection: ${collectionName}`);
            
            const localCollection = localDb.collection(collectionName);
            const atlasCollection = atlasDb.collection(collectionName);
            
            // Get documents from local
            const documents = await localCollection.find({}).toArray();
            console.log(`   📄 Found ${documents.length} documents`);
            
            if (documents.length > 0) {
                // Check if collection exists in Atlas
                const existingCount = await atlasCollection.countDocuments();
                
                if (existingCount > 0) {
                    console.log(`   ⚠️ Collection already has ${existingCount} documents in Atlas`);
                    console.log(`   🔄 Clearing existing data...`);
                    await atlasCollection.deleteMany({});
                }
                
                // Insert documents
                await atlasCollection.insertMany(documents);
                console.log(`   ✅ Migrated ${documents.length} documents`);
                totalMigrated += documents.length;
            }
        }
        
        console.log(`\n🎉 Migration completed successfully!`);
        console.log(`📊 Total documents migrated: ${totalMigrated}`);
        
        // Verify migration
        console.log('\n🔍 Verifying migration...');
        const atlasCollections = await atlasDb.listCollections().toArray();
        
        for (const collectionInfo of atlasCollections) {
            const count = await atlasDb.collection(collectionInfo.name).countDocuments();
            console.log(`   📊 ${collectionInfo.name}: ${count} documents`);
        }
        
    } catch (error) {
        console.error('💥 Migration failed:', error.message);
        throw error;
    } finally {
        if (localClient) await localClient.close();
        if (atlasClient) await atlasClient.close();
    }
}

// Main execution
async function main() {
    try {
        // Test connections
        const atlasConnected = await testAtlasConnection();
        
        if (!atlasConnected) {
            console.log('\n❌ Cannot proceed with migration - Atlas connection failed');
            console.log('\n🔧 Troubleshooting suggestions:');
            console.log('   1. Check if your IP address is whitelisted in MongoDB Atlas');
            console.log('   2. Verify the connection string credentials');
            console.log('   3. Ensure the database user has proper permissions');
            console.log('   4. Check if the cluster is running and accessible');
            console.log('   5. Try connecting from MongoDB Compass first');
            return;
        }
        
        const localConnected = await testLocalConnection();
        
        if (!localConnected) {
            console.log('\n❌ Cannot proceed - local MongoDB not accessible');
            console.log('💡 Make sure your local MongoDB is running on localhost:27017');
            return;
        }
        
        // Perform migration
        await performMigration();
        
        console.log('\n✨ All done! Your VMS application is now connected to MongoDB Atlas.');
        console.log('🚀 You can now start your application with the Atlas database.');
        
    } catch (error) {
        console.error('💥 Script execution failed:', error);
    }
}

// Run the script
main();