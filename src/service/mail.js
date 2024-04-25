import { SMTPClient } from 'emailjs';

// SMTP Client Setup
const client = new SMTPClient({
    user: 'harvesthimachal@gmail.com',
    password: 'E8C923F7CF2EC709EF2C818039B0B80AE614',      
    host: 'smtp.gmail.com',  
    ssl: true,
});

const sendEmail = async () => {
    try {
        const message = {
            text: "This is a test email from Node.js using emailjs",
            from: "harvesthimachal@gmail.com", 
            to: "ayush168490@gmail.com",    
            subject: "Test Email",
            attachment: [
                { data: "<html><body><h1>Hello, World!</h1><p>This is a test email sent from Node.js using emailjs.</p></body></html>", alternative: true }
            ]
        };

        await client.sendAsync(message);

        console.log("Email sent successfully");
        return { success: true };
    } catch (error) {
        console.log("Error occurred: ", error);
        return { success: false, error: error.toString() };
    }
};

export default sendEmail;
