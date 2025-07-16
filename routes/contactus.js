const express = require('express');
const router = express.Router();
const sendEmail = require('../utils/sendgrid');

router.get('/', (req, res) => {
    res.render('contact',{ 
        msg: req.flash('msg') 
    }); 
});

router.post('/', async (req, res) => {
    const { name, email, subject, message } = req.body;

    try {
        await sendEmail({
            to: 'example@gmail.com', 
            subject: subject || 'Message from Nomadly Contact Form',
            text: `From: ${name} (${email})\n\n${message}`,
            html: `
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Message:</strong></p>
              <p>${message.replace(/\n/g, '<br>')}</p>
            `
        });

        req.flash('msg', 'Thanks for reaching out! We’ll get back to you soon.');
        res.redirect('/contact');
    } catch (err) {
        console.error('Error sending contact email:', err.message);
        req.flash('msg', 'Something went wrong. Please try again later.');
        res.redirect('/contact');
    }
});

module.exports = router;
