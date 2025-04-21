const express = require("express");
const router = express.Router();
const { User } = require("../models/Users");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const passwordComplexity = require("joi-password-complexity");
require("dotenv").config();

// Create a transporter object for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Function to send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  // Create reset URL with token
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Forge Philippines - Password Reset Request",
    html: `
      <div style="background-color: #111827; color: #94a3b8; font-family: 'Arial', sans-serif; padding: 40px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 35px;">
          <div style="display: inline-block; background-color: rgba(2, 196, 175, 0.15); padding: 18px; border-radius: 50%;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z" stroke="#02c4af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        
        <h1 style="color: white; font-size: 22px; text-align: center; margin-bottom: 25px; font-weight: 500;">Reset Your Password</h1>
        
        <p style="margin-bottom: 30px; line-height: 1.7; font-size: 15px;">
          We received a request to reset your password for your Forge Philippines account. To create a new password, click the button below.
        </p>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${resetUrl}" style="text-decoration: none;">
            <button style="background: linear-gradient(to right, #02c4af, #00a99d); color: #0f172a; font-weight: 600; padding: 12px 32px; border: none; border-radius: 6px; cursor: pointer; font-size: 15px; box-shadow: 0 4px 10px rgba(2, 196, 175, 0.18); transition: all 0.2s ease;">
              Reset Password
            </button>
          </a>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
          If the button above doesn't work, you can also copy and paste the following link into your browser:
          <a href="${resetUrl}" style="color: #02c4af; word-break: break-all;">${resetUrl}</a>
        </p>
        
        <p style="font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
          This password reset link will expire in 60 minutes. If you did not request a password reset, please ignore this email or contact support if you have concerns.
        </p>
        
        <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid rgba(148, 163, 184, 0.15);">
          <p style="font-size: 13px; color: #64748b; margin-bottom: 5px;">
            This is an automated message from Forge Philippines. Please do not reply to this email.
          </p>
          <p style="font-size: 13px; color: #64748b;">
            If you need assistance, please contact our support team at <a href="mailto:support@forge.com" style="color: #02c4af;">support@forge.com</a>.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="font-size: 12px; color: #4b5563;">
            © ${new Date().getFullYear()} Forge Philippines. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
};

// POST /forgot-password - Request a password reset
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email format
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Generate token even if user doesn't exist (security best practice)
    const resetToken = jwt.sign(
      { userId: user ? user._id : "nonexistent", purpose: "password-reset" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // If user exists, store token and expiry in user document
    if (user) {
      // Hash token before storing (security best practice)
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      // Send email with reset link
      await sendPasswordResetEmail(email, resetToken);
    }

    // Always return success (prevents email enumeration)
    return res.status(200).json({
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /reset-password - Validate reset token
router.get("/reset-password", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Check if token is for password reset
    if (decoded.purpose !== "password-reset") {
      return res.status(400).json({ message: "Invalid token purpose" });
    }

    // Hash token to compare with stored token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      _id: decoded.userId,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Token is valid
    res.status(200).json({ message: "Token is valid" });
  } catch (error) {
    console.error("Validate reset token error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /reset-password - Reset password with token
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Check if token is for password reset
    if (decoded.purpose !== "password-reset") {
      return res.status(400).json({ message: "Invalid token purpose" });
    }

    // Hash token to compare with stored token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      _id: decoded.userId,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Validate password complexity
    const complexityOptions = {
      min: 8,
      max: 30,
      lowerCase: 1,
      upperCase: 1,
      numeric: 1,
      symbol: 1,
    };
    
    const { error } = passwordComplexity(complexityOptions).validate(password);
    if (error) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters long and contain uppercase, lowercase, number and special character" 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user's password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;