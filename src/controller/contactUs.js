import contactUs from "../model/contactUs-schema.js";
import sendEmail from "../service/mail.js";


export const contactFormData = async (req, res) => {
   try 
   {
      
      const newForm = contactUs.create({
        fullname: req.body.fullName,
        email: req.body.email,
        message: req.body.message
      });
      
       await sendEmail(newForm);

       console.log("req" + req + "res:" + res);
      return res.status(201).json({
        message: "Form Submitted Successfully",
        user_created: true,
      });
      
    
  } catch (error) {
    return res.status(500).json({
      message: error.message || "An error occurred", 
      user_created: false,
    });
  }
};
