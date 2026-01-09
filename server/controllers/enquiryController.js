const nodemailer = require('nodemailer');

const sendEnquiry = async (req, res) => {
  const { name, phone, email, subject, message } = req.body;

  // 1. Basic Validation
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }

  try {
    // 2. Configure Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 3. Email Template (HTML)
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #EF4444; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">New Gym Enquiry</h2>
        </div>
        <div style="padding: 20px; background-color: #f9fafb;">
          <p style="font-size: 16px; color: #333;">You have received a new message from the website contact form.</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background-color: white;">
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; width: 30%;">Name</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Email</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Phone</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${phone || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Subject</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${subject || 'General Enquiry'}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Message</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${message}</td>
            </tr>
          </table>

          <p style="margin-top: 20px; font-size: 12px; color: #888; text-align: center;">
            This email was sent automatically from your Gym Website.
          </p>
        </div>
      </div>
    `;

    // 4. Send Email
    await transporter.sendMail({
      from: `"${name}" <${email}>`, // Shows sender's name
      to: process.env.EMAIL_USER,    // Where you want to receive the enquiry
      subject: `New Enquiry: ${subject || 'Website Contact'}`,
      html: emailContent,
      replyTo: email, // Allows you to click "Reply" and email the user directly
    });

    res.status(200).json({ success: true, message: 'Enquiry sent successfully!' });

  } catch (error) {
    console.error('Email Error:', error);
    res.status(500).json({ message: 'Failed to send email. Please try again later.' });
  }
};

module.exports = { sendEnquiry };
