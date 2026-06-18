const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Create the transporter (The Mail Truck)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 465,
        secure: true,
        family: 4, // <-- This forces IPv4 and fixes the ENETUNREACH crash!
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // 2. Define the email options (The Letter)
    const mailOptions = {
        from: `Helpdesk Support <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // 3. Send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;