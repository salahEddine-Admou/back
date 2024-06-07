import nodemailer from 'nodemailer';
import Contact from '../modules/contact.js';

export const submitContactForm = async (req, res) => {
    const { name, email, message } = req.body;

    try {
        // Save the contact message to the database
        const contact = new Contact({ name, email, message });
        await contact.save();

        // Set up Nodemailer for sending email
        let transporter = nodemailer.createTransport({
            service: 'gmail', // Use your email service
            auth: {
                user: 'mohbigue@gmail.com', // Your email
                pass: 'icep puud nauh wxss'

            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Email content
        let mailOptions = {
            from: email,
            to: 'haitammanar66@gmail.com', // Admin's email
            subject: 'New Contact Us Message',
            text: `You have received a new message from ${name} (${email}):\n\n${message}`
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ message: 'Error sending email' });
            } else {
                console.log('Email sent:', info.response);
                return res.status(200).json({ message: 'Message sent successfully' });
            }
        });

    } catch (error) {
        console.error('Error submitting contact form:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};