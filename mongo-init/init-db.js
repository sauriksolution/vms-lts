// MongoDB initialization script for VMS database
// This script runs when MongoDB container starts for the first time

// Switch to VMS database
db = db.getSiblingDB('vms');

// Create collections with validation schemas
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'role'],
      properties: {
        email: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        password: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        role: {
          bsonType: 'string',
          enum: ['admin', 'receptionist', 'resident'],
          description: 'must be a string and is required'
        },
        firstName: {
          bsonType: 'string',
          description: 'must be a string'
        },
        lastName: {
          bsonType: 'string',
          description: 'must be a string'
        },
        phoneNumber: {
          bsonType: 'string',
          description: 'must be a string'
        },
        isApproved: {
          bsonType: 'bool',
          description: 'must be a boolean'
        },
        createdAt: {
          bsonType: 'date',
          description: 'must be a date'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'must be a date'
        }
      }
    }
  }
});

db.createCollection('visitors', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['firstName', 'lastName', 'email'],
      properties: {
        firstName: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        lastName: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        email: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        phoneNumber: {
          bsonType: 'string',
          description: 'must be a string'
        },
        visitPurpose: {
          bsonType: 'string',
          description: 'must be a string'
        },
        checkInTime: {
          bsonType: 'date',
          description: 'must be a date'
        },
        checkOutTime: {
          bsonType: 'date',
          description: 'must be a date'
        },
        status: {
          bsonType: 'string',
          enum: ['pending', 'approved', 'rejected', 'checked-in', 'checked-out'],
          description: 'must be a valid status'
        }
      }
    }
  }
});

db.createCollection('invites');
db.createCollection('parking');
db.createCollection('analytics');
db.createCollection('notifications');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isApproved: 1 });
db.users.createIndex({ createdAt: 1 });

db.visitors.createIndex({ email: 1 });
db.visitors.createIndex({ status: 1 });
db.visitors.createIndex({ checkInTime: 1 });
db.visitors.createIndex({ checkOutTime: 1 });

db.invites.createIndex({ email: 1 });
db.invites.createIndex({ expiryDate: 1 });
db.invites.createIndex({ status: 1 });

db.parking.createIndex({ licensePlate: 1 });
db.parking.createIndex({ status: 1 });

db.analytics.createIndex({ date: 1 });
db.analytics.createIndex({ type: 1 });

db.notifications.createIndex({ userId: 1 });
db.notifications.createIndex({ createdAt: 1 });
db.notifications.createIndex({ read: 1 });

print('VMS database initialized successfully with collections and indexes');