// MongoDB initialization for GemNet 
db = db.getSiblingDB('gemnet_db'); 
db.createCollection('users'); 
db.createCollection('gem_listings'); 
db.users.createIndex({ "email": 1 }, { unique: true }); 
db.users.createIndex({ "nicNumber": 1 }, { unique: true }); 
 
// Insert sample admin user 
db.users.insertOne({ 
    firstName: "Admin", 
    lastName: "User", 
    email: "admin@gemnet.com", 
    password: "$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a", 
    phoneNumber: "+94771234567", 
    address: "Admin Address", 
    dateOfBirth: "1990-01-01", 
    nicNumber: "123456789V", 
    isVerified: true, 
    verificationStatus: "VERIFIED", 
    roles: ["ADMIN", "USER"], 
    isActive: true, 
    isLocked: false, 
    createdAt: new Date(), 
    updatedAt: new Date() 
}); 
 
// Insert sample gemstone listing 
db.gem_listings.insertOne({ 
    title: "Blue Sapphire", 
    description: "Beautiful blue sapphire from Sri Lanka", 
    caratWeight: 2.5, 
    color: "Deep Blue", 
    clarity: "VS", 
    cut: "Oval", 
    origin: "Sri Lanka", 
    treatment: "Heat Treated", 
    certificateNumber: "GEM123456", 
    basePrice: 2000, 
    currentBid: 2000, 
    status: "APPROVED", 
    imageUrls: ["IMG_1751571383560_0.jpg"], 
    certificateUrl: "certificate1.pdf", 
    dimensions: "8x6x4 mm", 
    seller: { 
        id: "user123", 
        firstName: "John", 
        lastName: "Doe", 
        email: "john@example.com" 
    }, 
    createdAt: new Date(), 
    updatedAt: new Date(), 
    expiresAt: new Date(new Date().getTime() + 7*24*60*60*1000) 
}); 
