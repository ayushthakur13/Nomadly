const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends an email using SendGrid
 * @param {Object} param0
 * @param {string} param0.to - recipient email
 * @param {string} param0.subject - email subject
 * @param {string} param0.text - plain text content
 * @param {string} param0.html - HTML content
 */
const sendEmail = async ({ to, subject, text, html }) => {
    const msg = {
        to,
        from: 'example@gmail.com', 
        subject,
        text,
        html
    };

    try {
        await sgMail.send(msg);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('SendGrid error:', error.response?.body || error.message);
        throw error;
    }
};

module.exports = sendEmail;
