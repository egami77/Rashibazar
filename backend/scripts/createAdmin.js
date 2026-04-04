// backend/scripts/createAdmin.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

// Get the directory name properly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env file from parent directory (backend folder)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('MongoDB URI:', process.env.MONGO_URI); // Debug line

const createAdmin = async () => {
  try {
    // Check if MONGO_URI exists
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const adminData = {
      name: 'Super Admin',
      email: 'admin@rashibazar.com',
      password: 'Admin@123', // This will be hashed
      phone: '9800000000',
      role: 'admin'
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('❌ Admin already exists!');
      console.log('Email:', adminData.email);
      console.log('Try logging in with your existing admin account.');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Create admin
    const admin = new User({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword,
      phone: adminData.phone,
      role: adminData.role
    });

    await admin.save();
    console.log('✅ Admin created successfully!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('👤 Role:', admin.role);
    console.log('\nYou can now login at: http://localhost:5173/login');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    if (error.message.includes('MONGO_URI')) {
      console.log('\n💡 Solution: Make sure you have a .env file in the backend folder with:');
      console.log('MONGO_URI=mongodb://localhost:27017/rashibazar');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

createAdmin();