import mongoose from "mongoose";

const contactUsSchema = {
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  message: {
    type: String ,
    required: true,
  }
};

const contactUs = mongoose.model("contactUs", contactUsSchema);
export default contactUs;
