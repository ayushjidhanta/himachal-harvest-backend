import dotenv from "dotenv";
import { connect } from "mongoose";

// Load env variables
dotenv.config();

// Username & Password are stored in .env file
const USERNAME = process.env.REACT_MONGO_USERNAME;
const PASSWORD = process.env.REACT_MONGO_PASSWORD;

export const configureMongoDB = () => {
  if (!USERNAME || !PASSWORD) {
    throw new Error("Missing REACT_MONGO_USERNAME or REACT_MONGO_PASSWORD");
  }

  console.log("---> 🌐 Connecting to MongoDB...");
  return connect(`mongodb+srv://${USERNAME}:${PASSWORD}@demo.ai1hmta.mongodb.net/?retryWrites=true&w=majority`, {
    serverSelectionTimeoutMS: 10_000,
  }).then(() => {
    console.log("---> 🌐 MongoDB Connected Successfully!");
  });
};
