// backend/scripts/createAdmin.js
// Create one or more admin users (role: 'admin' in Users collection).
//
// Usage:
//   cd backend
//   node scripts/createAdmin.js



import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

/** Edit this list to create multiple admins in one run */
const ADMINS_TO_CREATE = [
  {
    name: 'Super Admin',
    email: 'admin@rashibazar.com',
    password: 'Admin@123',
    phone: '9800000000',
    role: 'admin',
  },
  // Example second admin — uncomment and change values:
  // {
  //   name: 'Operations Admin',
  //   email: 'ops@rashibazar.com',
  //   password: 'Ops@12345',
  //   phone: '9800000001',
  //   role: 'admin',
  // },
];

const createAdmins = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    if (ADMINS_TO_CREATE.length === 0) {
      console.log('No admins defined in ADMINS_TO_CREATE.');
      return;
    }

    let created = 0;
    let skipped = 0;

    for (const adminData of ADMINS_TO_CREATE) {
      const { name, email, password, phone, role = 'admin' } = adminData;

      if (!name || !email || !password) {
        console.log(`⚠️  Skipped invalid entry (name, email, password required): ${email || '(no email)'}`);
        skipped++;
        continue;
      }

      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        console.log(`⏭️  Already exists (${existing.role}): ${email}`);
        skipped++;
        continue;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const admin = new User({
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone || '',
        role,
      });

      await admin.save();
      created++;
      console.log(`✅ Created: ${name} <${email}> (role: ${role})`);
      console.log(`   Temporary password: ${password}\n`);
    }

    console.log('---');
    console.log(`Done. Created: ${created}, Skipped: ${skipped}`);
    if (created > 0) {
      console.log('Login at: http://localhost:5173/login → choose User tab → use admin email/password');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('MONGO_URI')) {
      console.log('\nAdd to backend/.env:\nMONGO_URI=mongodb://localhost:27017/rashibazar');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

createAdmins();
