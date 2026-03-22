import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["User", "Partner", "Admin"],
      default: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);
export default User;
