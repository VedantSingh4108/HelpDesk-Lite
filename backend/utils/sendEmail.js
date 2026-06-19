const { Resend } = require('resend');

// Initialize the Resend SDK with your environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Helpdesk Support <onboarding@resend.dev>',
            to: options.email,
            subject: options.subject,
            html: `
                <div style="font-family: sans-serif; font-size: 14px; color: #1e293b; line-height: 1.5;">
                    <p>${options.message.replace(/\n/g, '<br>')}</p>
                </div>
            `
        });

        // Resend returns an 'error' object instead of throwing a standard try/catch error
        if (error) {
            console.error("Resend API Error details:", error);
            throw new Error(error.message);
        }

        console.log("Email successfully sent via Resend!", data);
        return data;

    } catch (err) {
        console.error("Critical failure in sendEmail utility:", err);
        throw err;
    }
};

module.exports = sendEmail;