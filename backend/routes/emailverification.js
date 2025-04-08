const express = require("express");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { User } = require("../models/Users");
const router = express.Router();
require("dotenv").config(); // Load .env file

// Nodemailer configuration with environment variables
const transporter = nodemailer.createTransport({
  service: "gmail", // You can use other email services too (e.g., SendGrid, Mailgun)
  auth: {
    user: process.env.EMAIL_USER, // Use the EMAIL_USER from the .env file
    pass: process.env.EMAIL_PASS, // Use the EMAIL_PASS from the .env file
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Function to send email verification link - KEEP THIS THE SAME
const sendVerificationEmail = async (useremail, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  // Keep pointing to backend - this is correct
  const verificationUrl = `http://localhost:5001/api/emailverification/verify-email?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: useremail,
    subject: "Forge Philippines - Please Verify Your Email Address",
    html: `
      <div style="background-color: #111827; color: #94a3b8; font-family: 'Arial', sans-serif; padding: 40px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 35px;">
          <div style="display: inline-block; background-color: rgba(2, 196, 175, 0.15); padding: 18px; border-radius: 50%;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#02c4af"/>
              <path d="M11 7h2v6h-2zm0 8h2v2h-2z" fill="#02c4af"/>
            </svg>
          </div>
        </div>
        
        <h1 style="color: white; font-size: 22px; text-align: center; margin-bottom: 25px; font-weight: 500;">Email Verification Required</h1>
        
        <p style="margin-bottom: 30px; line-height: 1.7; font-size: 15px;">
          Thank you for creating an account with ForgePh. To ensure the security of your account and access all platform features, please verify your email address by clicking the button below.
        </p>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${verificationUrl}" style="text-decoration: none;">
            <button style="background: linear-gradient(to right, #02c4af, #00a99d); color: #0f172a; font-weight: 600; padding: 12px 32px; border: none; border-radius: 6px; cursor: pointer; font-size: 15px; box-shadow: 0 4px 10px rgba(2, 196, 175, 0.18); transition: all 0.2s ease;">
              Verify Email Address
            </button>
          </a>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
          If the button above doesn't work, you can also copy and paste the following link into your browser:
          <a href="${verificationUrl}" style="color: #02c4af; word-break: break-all;">${verificationUrl}</a>
        </p>
        
        <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid rgba(148, 163, 184, 0.15);">
          <p style="font-size: 13px; color: #64748b; margin-bottom: 5px;">
            This is an automated message from ForgePh. Please do not reply to this email.
          </p>
          <p style="font-size: 13px; color: #64748b;">
            If you did not register for an ForgePh account, please disregard this email or contact our support team at <a href="mailto:support@xforge.com" style="color: #02c4af;">support@xforge.com</a>.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="font-size: 12px; color: #4b5563;">
            © ${new Date().getFullYear()} XForge. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send verification email");
  }
};

router.get("/verify-email", async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.redirect(
      `${process.env.FRONTEND_URL}/verification-failed?error=No token provided`
    );
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/verification-failed?error=User not found`
      );
    }
    if (user.userStatus === "Verified") {
      return res.redirect(
        `${process.env.FRONTEND_URL}/verification-success?already=true`
      );
    }
    // Update user status to "Verified"
    user.userStatus = "Verified";
    await user.save();
    // Redirect to frontend success page
    return res.redirect(`/verification-success?status=success`);
  } catch (error) {
    console.error(error);
    return res.redirect(
      `${process.env.FRONTEND_URL}/verification-failed?error=Invalid or expired token`
    );
  }
});

// Route to send verification email
router.post("/sendVerificationEmail", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Call the function to send the verification email
    await sendVerificationEmail(user.email, user.id);

    return res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error sending verification email" });
  }
});

module.exports = router;
