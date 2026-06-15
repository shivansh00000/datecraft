const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/datecraft';
  
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`🍀 MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('⚠️ Running Server in Offline/Fallback DB Mock Mode due to missing/invalid Database URI.');
    // We do not crash the process; we let it run so the frontend can still interact or use memory caching
  }
};

module.exports = connectDB;
