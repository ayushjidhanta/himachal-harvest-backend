import mongoose from "mongoose";
import { USER_ROLE, USER_ROLE_VALUES } from "../constants/userRole.js";
import { MANAGER_PERMISSION_VALUES } from "../constants/managerPermission.js";

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
      enum: USER_ROLE_VALUES,
      default: USER_ROLE.USER,
      required: true,
    },
    permissions: {
      type: [{ type: String, enum: MANAGER_PERMISSION_VALUES }],
      default: [],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);
export default User;
