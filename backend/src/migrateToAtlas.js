require('dotenv').config();
const mongoose = require('mongoose');

const localUri = 'mongodb://localhost:27017/finot-db';
const atlasUri = process.env.MONGODB_URI;

async function migrateData() {
  console.log('🚀 Starting Data Migration from Local MongoDB to MongoDB Atlas...\n');

  if (!atlasUri) {
    console.error('❌ MONGODB_URI is missing in .env file!');
    process.exit(1);
  }

  try {
    // 1. Connect to Local MongoDB
    console.log('1️⃣ Connecting to Local MongoDB...');
    const localConn = await mongoose.createConnection(localUri, { serverSelectionTimeoutMS: 5000 }).asPromise();
    console.log('   ✅ Connected to Local MongoDB successfully.');

    // 2. Connect to MongoDB Atlas
    console.log('2️⃣ Connecting to MongoDB Atlas...');
    const atlasConn = await mongoose.createConnection(atlasUri, { serverSelectionTimeoutMS: 10000 }).asPromise();
    console.log('   ✅ Connected to MongoDB Atlas successfully.\n');

    // 3. Fetch all collections from local DB
    const collections = await localConn.db.listCollections().toArray();
    console.log(`📦 Found ${collections.length} collection(s) in Local DB: ${collections.map(c => c.name).join(', ')}\n`);

    for (const col of collections) {
      const colName = col.name;
      const docs = await localConn.db.collection(colName).find({}).toArray();

      if (docs.length === 0) {
        console.log(`ℹ️ Collection '${colName}' is empty. Skipping.`);
        continue;
      }

      console.log(`⏳ Migrating ${docs.length} record(s) in '${colName}'...`);
      
      const targetCol = atlasConn.db.collection(colName);
      
      let insertedCount = 0;
      for (const doc of docs) {
        await targetCol.replaceOne({ _id: doc._id }, doc, { upsert: true });
        insertedCount++;
      }

      console.log(`   ✅ Successfully migrated ${insertedCount} record(s) into Atlas collection '${colName}'!`);
    }

    console.log('\n🎉 ALL LOCAL DATA SUCCESSFULLY MIGRATED TO MONGODB ATLAS!');
    
    await localConn.close();
    await atlasConn.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration Failed Error:', error.message);
    process.exit(1);
  }
}

migrateData();
