const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI;
  const fallbackUri = 'mongodb://localhost:27017/finot-db';

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected (Primary Atlas): ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Primary MongoDB Atlas Connection Warning: ${error.message}`);
    console.log(`Attempting fallback connection to Local MongoDB (${fallbackUri})...`);
    
    try {
      const conn = await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`MongoDB Connected (Local Fallback): ${conn.connection.host}`);
    } catch (fallbackError) {
      console.error(`MongoDB Connection Error: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
