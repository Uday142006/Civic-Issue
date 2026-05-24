#!/usr/bin/env node

/**
 * Admin Credential Creation Script
 * 
 * Usage:
 * - npm run create-admin
 * - node scripts/create-admin.js
 * 
 * Or with arguments:
 * - node scripts/create-admin.js admin@email.com secure_password "Admin Name"
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const User = require('../models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  try {
    // Connect to MongoDB
    console.log('\n🔧 Admin Credential Creation Script');
    console.log('====================================\n');
    
    const dbUri = process.env.MONGODB_LOCAL || process.env.MONGODB_URI;
    if (!dbUri) {
      throw new Error('❌ MONGODB_LOCAL or MONGODB_URI not set in .env');
    }

    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Get inputs from command line args or prompt
    let email = process.argv[2];
    let password = process.argv[3];
    let adminName = process.argv[4];

    if (!email) {
      email = await question('📧 Enter admin email: ');
    }

    if (!password) {
      password = await question('🔐 Enter admin password (min 6 characters): ');
    }

    if (!adminName) {
      adminName = await question('👤 Enter admin name (optional): ');
    }

    // Validation
    if (!email || !email.includes('@')) {
      throw new Error('❌ Invalid email format');
    }

    if (!password || password.length < 6) {
      throw new Error('❌ Password must be at least 6 characters');
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log('\n⚠️  Admin with this email already exists!');
      const updateChoice = await question('Update existing admin? (y/n): ');
      
      if (updateChoice.toLowerCase() === 'y') {
        existingAdmin.password = password;
        existingAdmin.name = adminName || existingAdmin.name;
        await existingAdmin.save();
        console.log('✅ Admin credentials updated successfully!\n');
        console.log('📝 Admin Details:');
        console.log(`   Email: ${existingAdmin.email}`);
        console.log(`   Name: ${existingAdmin.name}`);
        console.log(`   Role: ${existingAdmin.role}`);
      } else {
        console.log('\n❌ Cancelled');
      }
    } else {
      // Create new admin
      const admin = new User({
        name: adminName || 'Municipal Administrator',
        email,
        password,
        role: 'admin',
        emailVerified: true,
        isActive: true,
      });

      await admin.save();
      console.log('\n✅ Admin user created successfully!\n');
      console.log('📝 Admin Details:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Role: ${admin.role}`);
    }

    console.log('\n🎉 Setup Complete!');
    console.log('\nYou can now login with:');
    console.log(`   URL: http://localhost:3000/login`);
    console.log(`   Tab: "Admin"`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}\n`);

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

main();
