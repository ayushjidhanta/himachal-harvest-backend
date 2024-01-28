import dotenv from "dotenv";
import { connect } from "mongoose";

// Load env variables
dotenv.config();

// Username & Password are stored in .env file
const USERNAME = process.env.REACT_MONGO_USERNAME;
const PASSWORD = process.env.REACT_MONGO_PASSWORD;

export const configureMongoDB = () => {
  try {
    connect(
      `mongodb+srv://${USERNAME}:${PASSWORD}@demo.ai1hmta.mongodb.net/?retryWrites=true&w=majority`
    );
    console.log("---> 🌐 MongoDB Connected Successfully!");
  } catch (error) {
    console.error(`Error ${error.message}`);
  }
};
