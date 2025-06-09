// utils/emailService.js
const nodemailer = require("nodemailer");

// Create a transporter object
const transporter = nodemailer.createTransport({
  service: "gmail", // You can use other services or SMTP settings
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send verification email
const sendVerificationEmail = async (email, verificationLink) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your XForge Account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f7f7;">
          <div style="background-color: #141b22; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #02c4af; margin: 0;">XForge</h1>
          </div>
          <div style="background-color: #ffffff; padding: 20px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333333;">Verify Your Email Address</h2>
            <p style="color: #555555; line-height: 1.5;">Thank you for registering with XForge. Please verify your email address to complete your registration and access all features.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="background-color: #02c4af; color: #141b22; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email Address</a>
            </div>
            <p style="color: #555555; line-height: 1.5;">If you did not create an account with XForge, please ignore this email.</p>
            <p style="color: #555555; line-height: 1.5;">This verification link will expire in 1 hour.</p>
          </div>
          <div style="text-align: center; padding: 20px; color: #777777; font-size: 12px;">
            <p>© ${new Date().getFullYear()} XForge. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
};

module.exports = { sendVerificationEmail };
