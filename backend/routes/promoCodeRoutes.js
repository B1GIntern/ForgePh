// routes/promoCodeRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const promoCodeController = require("../controllers/promoCodeController");
const auth = require("../middleware/auth");
const XLSX = require("xlsx");
const PromoCode = require("../models/PromoCode.js");

// Set up multer for handling file uploads
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
  fileFilter: (req, file, cb) => {
    // Only accept Excel files
    if (
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files are allowed"), false);
    }
  },
});

// Upload promo codes route
router.post(
  "/upload",
  upload.single("file"),
  promoCodeController.uploadPromoCodes
);

// Get all promo codes
router.get("/", promoCodeController.getAllPromoCodes);

// Redeem a promo code - requires authentication
router.post("/redeem", auth, promoCodeController.redeemPromoCode);

// Get verified retailers
router.get("/retailers", promoCodeController.getVerifiedRetailers);

// Check remaining redemptions for a user
router.get("/check-redemptions/:userId", promoCodeController.checkRemainingRedemptions);

module.exports = router;
