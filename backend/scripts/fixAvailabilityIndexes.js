// Fix old Availability indexes
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixIndexes = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    
    const db = mongoose.connection.db;
    const collection = db.collection('availabilities');
    
    console.log('📋 Current indexes:');
    const indexes = await collection.listIndexes().toArray();
    console.log(JSON.stringify(indexes, null, 2));
    
    // Drop the old index if it exists
    const indexNames = indexes.map(idx => idx.name);
    
    if (indexNames.includes('astrologerId_1_date_1')) {
      console.log('❌ Found old index astrologerId_1_date_1, dropping it...');
      await collection.dropIndex('astrologerId_1_date_1');
      console.log('✅ Dropped astrologerId_1_date_1');
    }
    
    if (indexNames.includes('date_1')) {
      console.log('❌ Found index date_1, dropping it...');
      await collection.dropIndex('date_1');
      console.log('✅ Dropped date_1');
    }
    
    // List indexes again
    console.log('\n📋 Indexes after cleanup:');
    const newIndexes = await collection.listIndexes().toArray();
    console.log(JSON.stringify(newIndexes, null, 2));
    
    console.log('\n✅ Index cleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

fixIndexes();
