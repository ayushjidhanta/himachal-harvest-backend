import contactUs from "../model/contactUs-schema.js";
export const contactFormData = async (req, res) => {
   try 
   {
      await contactUs.create({
        fullname: req.body.fullName,
        email: req.body.email,
        message: req.body.message
      });
      
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
