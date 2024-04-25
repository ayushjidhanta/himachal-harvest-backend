import mongoose from "mongoose";

const adminSchema = {
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email : {
    type: String,
    required: true,
    unique: true,
  },
  isAdmin: {
    type: String,
    required: true,
  }
};

const Admin = mongoose.model("role", adminSchema);
export default Admin;
