const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

// MongoDB connection string from environment
const MONGO_URI = process.env.MONGO_DB_CONNECTION_STRING || 'mongodb://localhost:27017/vms';

// Dummy user data
const dummyUsers = [
  {
    email: 'admin@vms.com',
    password: 'Admin123!',
    permission: -3, // Admin permission
    name: 'System Administrator',
    idNumber: '9001015800087',
    idDocType: 'RSA-ID',
    signUpDate: new Date().toISOString(),
    xp: 100,
    badges: 'admin,verified',
    numInvites: 0,
    numThemes: 5,
    curfewTime: 0,
    numSleepovers: 0,
    suggestions: 0,
    pinNumber: '1234',
    file: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
  },
  {
    email: 'receptionist@vms.com',
    password: 'Reception123!',
    permission: -1, // Receptionist permission
    name: 'Front Desk Receptionist',
    idNumber: '8505125600088',
    idDocType: 'RSA-ID',
    signUpDate: new Date().toISOString(),
    xp: 50,
    badges: 'receptionist,verified',
    numInvites: 0,
    numThemes: 3,
    curfewTime: 0,
    numSleepovers: 0,
    suggestions: 0,
    pinNumber: '5678',
    file: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
  },
  {
    email: 'resident1@vms.com',
    password: 'Resident123!',
    permission: -2, // Resident permission
    name: 'John Resident',
    idNumber: '9203156700089',
    idDocType: 'RSA-ID',
    signUpDate: new Date().toISOString(),
    xp: 25,
    badges: 'resident,verified',
    numInvites: 5,
    numThemes: 2,
    curfewTime: 22,
    numSleepovers: 2,
    suggestions: 0,
    pinNumber: '9012',
    file: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
  },
  {
    email: 'resident2@vms.com',
    password: 'Resident123!',
    permission: -2, // Resident permission
    name: 'Jane Resident',
    idNumber: '8712084500090',
    idDocType: 'RSA-ID',
    signUpDate: new Date().toISOString(),
    xp: 30,
    badges: 'resident,verified',
    numInvites: 3,
    numThemes: 1,
    curfewTime: 23,
    numSleepovers: 1,
    suggestions: 0,
    pinNumber: '3456',
    file: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
  }
];

async function seedUsers() {
  let client;
  
  try {
    console.log('🌱 Starting user seeding process...');
    
    // Connect to MongoDB
    client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Check if users already exist
    const existingUsers = await usersCollection.find({}).toArray();
    if (existingUsers.length > 0) {
      console.log('⚠️  Users already exist in database. Clearing existing users...');
      await usersCollection.deleteMany({});
      console.log('🗑️  Existing users cleared');
    }
    
    // Hash passwords and insert users
    const usersToInsert = [];
    
    for (const user of dummyUsers) {
      console.log(`🔐 Hashing password for ${user.email}...`);
      const hashedPassword = await bcrypt.hash(user.password, 3);
      
      usersToInsert.push({
        ...user,
        password: hashedPassword
      });
    }
    
    // Insert all users
    const result = await usersCollection.insertMany(usersToInsert);
    console.log(`✅ Successfully inserted ${result.insertedCount} users`);
    
    // Display created users
    console.log('\n📋 Created Users:');
    console.log('==================');
    dummyUsers.forEach(user => {
      console.log(`👤 ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Password: ${user.password}`);
      console.log(`   🎭 Role: ${user.permission === -3 ? 'Admin' : user.permission === -1 ? 'Receptionist' : 'Resident'}`);
      console.log(`   🆔 ID Number: ${user.idNumber}`);
      console.log('');
    });
    
    console.log('🎉 User seeding completed successfully!');
    console.log('\n💡 You can now login with any of the above credentials.');
    
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run the seeding function
seedUsers();