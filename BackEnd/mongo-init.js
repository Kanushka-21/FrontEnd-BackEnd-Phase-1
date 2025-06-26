// MongoDB initialization script for GemNet Database

// Switch to the GemNet database
db = db.getSiblingDB('gemnet_db');

// Create collections
db.createCollection('users');

// Create indexes for users collection
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "nicNumber": 1 }, { unique: true });
db.users.createIndex({ "isActive": 1, "verificationStatus": 1 });
db.users.createIndex({ "email": 1, "isActive": 1 });
db.users.createIndex({ "verificationStatus": 1 });
db.users.createIndex({ "createdAt": 1 });

// Insert sample admin user (optional - remove in production)
db.users.insertOne({
    firstName: "Admin",
    lastName: "User",
    email: "admin@gemnet.com",
    password: "$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a", // password: admin123
    phoneNumber: "+94771234567",
    address: "Admin Address",
    dateOfBirth: "1990-01-01",
    nicNumber: "123456789V",
    isVerified: true,
    isFaceVerified: true,
    isNicVerified: true,
    verificationStatus: "VERIFIED",
    roles: ["ADMIN", "USER"],
    isActive: true,
    isLocked: false,
    createdAt: new Date(),
    updatedAt: new Date()
});

print("GemNet database initialized successfully!");
print("Created indexes for users collection");
print("Inserted sample admin user (email: admin@gemnet.com, password: admin123)");
