#!/usr/bin/env node

/**
 * Demo Data Generation Script
 * 
 * Creates sample reports and users for testing
 * 
 * Usage:
 * - npm run seed-demo
 * - node scripts/seed-demo.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const User = require('../models/User');
const Report = require('../models/Report');

async function main() {
  try {
    console.log('\n🌱 Demo Data Generation Script');
    console.log('===============================\n');
    
    const dbUri = process.env.MONGODB_LOCAL || process.env.MONGODB_URI;
    if (!dbUri) {
      throw new Error('MONGODB_LOCAL or MONGODB_URI not set in .env');
    }

    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Create sample citizens
    console.log('👥 Creating sample citizens...');
    const citizens = await User.insertMany([
      {
        name: 'Raj Kumar',
        email: 'raj@example.com',
        phone: '+919876543210',
        role: 'citizen',
        phoneVerified: true,
        emailVerified: true,
        location: { city: 'Kolkata', state: 'West Bengal', country: 'India' },
      },
      {
        name: 'Priya Singh',
        email: 'priya@example.com',
        phone: '+919876543211',
        role: 'citizen',
        phoneVerified: true,
        emailVerified: true,
        location: { city: 'Kolkata', state: 'West Bengal', country: 'India' },
      },
      {
        name: 'Amit Patel',
        email: 'amit@example.com',
        phone: '+919876543212',
        role: 'citizen',
        phoneVerified: true,
        emailVerified: true,
        location: { city: 'Kolkata', state: 'West Bengal', country: 'India' },
      },
    ]);
    console.log(`✅ Created ${citizens.length} sample citizens\n`);

    // Create sample reports
    console.log('📝 Creating sample reports...');
    const reports = await Report.insertMany([
      {
        title: 'Pothole on Park Street',
        description: 'Large pothole near Park Circus causing traffic hazards',
        category: 'road_damage',
        priority: 'high',
        status: 'pending',
        location: {
          type: 'Point',
          coordinates: [88.3639, 22.5726],
          address: 'Park Street, Kolkata',
          city: 'Kolkata',
          state: 'West Bengal',
        },
        submittedBy: citizens[0]._id,
      },
      {
        title: 'Garbage Not Collected',
        description: 'Sanitation department not collecting garbage for 3 days',
        category: 'garbage',
        priority: 'medium',
        status: 'acknowledged',
        location: {
          type: 'Point',
          coordinates: [88.3648, 22.5735],
          address: 'Salt Lake, Kolkata',
          city: 'Kolkata',
          state: 'West Bengal',
        },
        submittedBy: citizens[1]._id,
      },
      {
        title: 'Water Leakage from Pipe',
        description: 'Water leaking from main supply pipe, wasting water',
        category: 'water_leakage',
        priority: 'high',
        status: 'in_progress',
        location: {
          type: 'Point',
          coordinates: [88.3560, 22.5680],
          address: 'Moulali, Kolkata',
          city: 'Kolkata',
          state: 'West Bengal',
        },
        submittedBy: citizens[2]._id,
      },
      {
        title: 'Streetlight Not Working',
        description: 'Multiple streetlights on Hazra Road are not functioning',
        category: 'street_light',
        priority: 'medium',
        status: 'resolved',
        location: {
          type: 'Point',
          coordinates: [88.3583, 22.5520],
          address: 'Hazra Road, Kolkata',
          city: 'Kolkata',
          state: 'West Bengal',
        },
        submittedBy: citizens[0]._id,
        resolutionNotes: 'Bulbs replaced and circuit tested',
        resolvedAt: new Date(Date.now() - 86400000), // 1 day ago
      },
    ]);
    console.log(`✅ Created ${reports.length} sample reports\n`);

    // Update user statistics
    console.log('📊 Updating user statistics...');
    await User.updateOne(
      { _id: citizens[0]._id },
      { reportsSubmitted: 2, totalUpvotes: 5 }
    );
    await User.updateOne(
      { _id: citizens[1]._id },
      { reportsSubmitted: 1, totalUpvotes: 3 }
    );
    await User.updateOne(
      { _id: citizens[2]._id },
      { reportsSubmitted: 1, totalUpvotes: 2 }
    );
    console.log('✅ Statistics updated\n');

    console.log('🎉 Demo Data Setup Complete!\n');
    console.log('📋 Sample Data Created:');
    console.log(`   Citizens: ${citizens.length}`);
    console.log(`   Reports: ${reports.length}`);
    console.log('\n📧 Sample Credentials:');
    console.log('   Email: raj@example.com');
    console.log('   Phone: +919876543210');
    console.log('\n💡 Next Steps:');
    console.log('   1. Start the server: npm run dev');
    console.log('   2. Open http://localhost:3000');
    console.log('   3. Login with phone: +919876543210 (OTP: check console)');
    console.log('   4. Or login to admin dashboard with email/password\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
