import mongoose from "mongoose";

const connectDB = async () => {

  const mongoURI = `${process.env.MONGO_URI}linkedin`;
  try {

    console.log("Connecting to MongoDB...", mongoURI);
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
export default connectDB;
