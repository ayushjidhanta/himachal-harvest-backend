import bcrypt from "bcryptjs";
import Admin from "../model/admin-schema.js";
import User from "../model/userSchema.js";

const normalizeRole = (role, isAdminUser) => {
  const raw = typeof role === "string" ? role.trim() : "";
  if (!raw) return isAdminUser ? "Admin" : "User";
  const key = raw.toLowerCase();
  if (key === "partner") return "Manager";
  if (key === "manager") return "Manager";
  if (key === "admin") return "Admin";
  if (key === "user") return "User";
  return isAdminUser ? "Admin" : "User";
};

// Function to create a new user
export const signUp = async (req, res) => {
  try {
    // Check if the user limit has been reached
    let current_users = await User.countDocuments();
    if (current_users > 10) {
      return res.status(200).json({
        message: "Maximum Users Limit Reached",
        user_created: false,
      });
    }

    // Check if the user already exists
    let user_exist = await User.findOne({ username: req.body.username });
    if (user_exist) {
      return res.status(200).json({
        message: "User Already Exists",
        user_created: false,
      });
    }

    let username = req.body.username;
    let email = req.body.email;
    let password = await bcrypt.hash(req.body.password, 10); // Hash the password

    // user does not exist, create a new user
    let user = await User.create({
      username: username,
      email: email,
      password: password,
    });

    return res.status(!user ? 500 : 200).json({
      message: user ? "User Created Successfully" : "Error Creating User",
      user_created: !!user,
    });
  } catch (error) {
    return res.status(500).json({
      message: error,
      user_created: false,
    });
  }
};

// Function to login a user
export const signIn = async (req, res) => {
  try {
    // Check if the user exists
    let user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(200).json({
        message: "User Does Not Exist",
        user_authenticated: false,
      });
    }

    // Check if the password is correct
    bcrypt.compare(req.body.password, user.password, async (err, result) => {
      if (err) {
        return res.status(200).json({
          message: err,
          user_authenticated: false,
        });
      }
      if (result) {
        const admin = await Admin.findOne({ username: req.body.username });
        const resolvedRole = normalizeRole(user?.role, Boolean(admin));

        if (String(user?.role || "").trim().toLowerCase() === "partner") {
          User.updateOne({ _id: user._id }, { $set: { role: "Manager" } }).catch(() => {});
        }

        const message =
          resolvedRole === "Admin"
            ? "Admin Authenticated Successfully"
            : resolvedRole === "Manager"
              ? "Manager Authenticated Successfully"
              : "User Authenticated Successfully";
        return res.status(200).json({
          message,
          user_authenticated: true,
          role: resolvedRole,
          user: { username: user.username, email: user.email, role: resolvedRole },
        });
      } else {
        return res.status(200).json({
          message: "Invalid Credentials",
          user_authenticated: false,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error, user_authenticated: false });
  }
};
