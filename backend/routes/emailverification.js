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
    subject: "Email Verification",
    html: `
        <p>Click the button below to verify your email:</p>
        <a href="${verificationUrl}">
          <button style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">
            Verify Email
          </button>
        </a>
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
