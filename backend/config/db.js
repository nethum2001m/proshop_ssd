import mongoose from 'mongoose';
import colors from 'colors';

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB connected: ${conn.connection.host}`.bgGreen.black);
  } catch (error) {
    console.error(`Error: ${error.message}`.bgRed);
    process.exit(1);
  }
};

export default connectDB;
