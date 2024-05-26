import express from "express";
import  {contactFormData}  from "../controller/contactUs.js"; 

const contactRouter = express.Router();

contactRouter.post("/contactus", contactFormData);

export default contactRouter;
