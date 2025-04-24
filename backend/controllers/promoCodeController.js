// controllers/promoCodeController.js
const XLSX = require("xlsx");
const PromoCode = require("../models/PromoCode.js");
const { User } = require("../models/Users.js");

// Upload promo codes from Excel file to MongoDB
const uploadPromoCodes = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Read the uploaded Excel file
    const workbook = XLSX.read(req.file.buffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to array of values - this handles different Excel formats
    const rawData = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
    });

    if (!rawData || rawData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Excel file has no data",
      });
    }

    // Extract all non-empty values from the Excel file
    const promoCodes = [];

    rawData.forEach((row) => {
      if (!Array.isArray(row)) return;

      row.forEach((cellValue) => {
        // Skip empty cells
        if (cellValue === null || cellValue === undefined || cellValue === "") {
          return;
        }

        // Convert to string and normalize
        const code = String(cellValue).trim().toUpperCase();
        if (code) {
          promoCodes.push(code);
        }
      });
    });

    // Remove duplicates
    const uniqueCodes = [...new Set(promoCodes)];

    if (uniqueCodes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid promo codes found in file",
      });
    }

    // Process results tracking
    const results = {
      total: uniqueCodes.length,
      added: 0,
      updated: 0,
      duplicates: 0,
      errors: 0,
      errorDetails: [],
    };

    // Process each promo code
    for (const code of uniqueCodes) {
      try {
        // Check if code already exists
        const existingCode = await PromoCode.findOne({ code });

        if (existingCode) {
          // Update existing code if needed (e.g., set points if not set)
          if (!existingCode.points) {
            existingCode.points = 10; // Set default points
            await existingCode.save();
            results.updated++;
          } else {
            results.duplicates++;
          }
        } else {
          // Create new promo code with default values and empty redemption fields
          await PromoCode.create({
            code,
            points: 10, // Default points
            redeemedBy: {
              consumerId: null,
              shopName: null,
              redeemedAt: null
            }
          });
          results.added++;
        }
      } catch (error) {
        results.errors++;
        results.errorDetails.push({
          code,
          error: error.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Promo codes processed successfully",
      results,
    });
  } catch (error) {
    console.error("Error processing promo codes:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process promo codes",
    });   
  }
};

// Get all promo codes from MongoDB
const getAllPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find({});

    return res.status(200).json({
      success: true,
      count: promoCodes.length,
      data: promoCodes, // This ensures data is in a 'data' property
    });
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch promo codes",
      data: [], // Always include an empty array for consistency
    });
  }
};
// Redeem a promo code
const redeemPromoCode = async (req, res) => {
  try {
    const { code, userId, shopName } = req.body;
    if (!code || !userId || !shopName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: code, userId, and shopName are required",
      });
    }
    
    // Find the promo code
    const promoCode = await PromoCode.findOne({ code: code.toUpperCase() });
    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: "Promo code not found",
      });
    }
    
    // Check if already redeemed
    if (promoCode.promoCodeRedeemed) {
      return res.status(400).json({
        success: false,
        message: "This promo code has already been redeemed",
      });
    }
    
    // Find the user
    const user = await User.findById(userId);
    if (!user || user.userType !== "Consumer") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID or user is not a consumer",
      });
    }
    
    // Check daily redemption limit
    // Reset redemption count if it's a new day
    const currentDate = new Date();
    if (
      !user.lastRedemptionDate ||
      new Date(user.lastRedemptionDate).getDate() !== currentDate.getDate() ||
      new Date(user.lastRedemptionDate).getMonth() !== currentDate.getMonth() ||
      new Date(user.lastRedemptionDate).getFullYear() !== currentDate.getFullYear()
    ) {
      user.redemptionCount = 3; // Reset to max count
    }
    
    // Check if user has redemptions left
    if (user.redemptionCount <= 0) {
      user.dailyLimitReached = true;
      await user.save();
      return res.status(400).json({
        success: false,
        message: "You have reached your daily redemption limit of 3 promo codes",
        remainingRedemptions: 0,
        dailyLimitReached: true
      });
    }
    
    // Find the retailer by shop name
    const retailer = await User.findOne({
      userType: "Retailer",
      userStatus: "Verified",
      shopName: shopName
    });
    if (!retailer) {
      return res.status(400).json({
        success: false,
        message: "Invalid or unverified retailer shop name",
      });
    }
    
    // Update user's points and redeemed promo codes
    user.points += promoCode.points;
    user.redeemedPromoCodes.push({
      promoCodeId: promoCode._id,
      shopName: shopName,
      redeemedAt: new Date(),
      code: promoCode.code,
      points: promoCode.points
    });
    
    // Decrement redemption count and update last redemption date
    user.redemptionCount -= 1;
    user.lastRedemptionDate = currentDate;
    user.dailyLimitReached = user.redemptionCount === 0;
    await user.save();
    
    // Update retailer's points - now only 1 point per redemption regardless of code value
    retailer.points += 1; // Changed from promoCode.points to fixed value of 1
    await retailer.save();
    
    // Set redemption details and mark as redeemed
    promoCode.redeemedBy = {
      consumerId: userId,
      retailerId: retailer._id,
      shopName,
      redeemedAt: new Date(),
    };
    promoCode.promoCodeRedeemed = true;
    await promoCode.save();
    
    return res.status(200).json({
      success: true,
      message: `Promo code redeemed successfully! Consumer received ${promoCode.points} points, retailer received 1 point.`,
      points: promoCode.points,
      promoCode,
      userPoints: user.points,
      retailerPoints: retailer.points,
      remainingRedemptions: user.redemptionCount,
      dailyLimitReached: user.dailyLimitReached
    });
  } catch (error) {
    console.error("Error redeeming promo code:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to redeem promo code",
    });
  }
};

// Add a new endpoint to check remaining redemptions
const checkRemainingRedemptions = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    // Reset redemption count if it's a new day
    const currentDate = new Date();
    const lastRedemptionDate = user.lastRedemptionDate ? new Date(user.lastRedemptionDate) : null;
    
    if (!lastRedemptionDate || 
        lastRedemptionDate.getDate() !== currentDate.getDate() ||
        lastRedemptionDate.getMonth() !== currentDate.getMonth() ||
        lastRedemptionDate.getFullYear() !== currentDate.getFullYear()) {
      // Reset redemption count if it's a new day
      user.redemptionCount = 3;
      user.lastRedemptionDate = currentDate;
      user.dailyLimitReached = false;
      await user.save();
    }
    
    return res.status(200).json({
      success: true,
      remainingRedemptions: user.redemptionCount,
      dailyLimitReached: user.dailyLimitReached,
      nextResetAt: getNextMidnight()
    });
  } catch (error) {
    console.error("Error checking redemptions:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to check remaining redemptions",
    });
  }
};

// Helper function to get next midnight timestamp
const getNextMidnight = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
};

// Get verified retailers
const getVerifiedRetailers = async (req, res) => {
  try {
    const retailers = await User.find({
      userType: "Retailer",
      userStatus: "Verified"
    }).select('_id shopName');

    return res.status(200).json({
      success: true,
      count: retailers.length,
      data: retailers
    });
  } catch (error) {
    console.error("Error fetching verified retailers:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch verified retailers",
      data: []
    });
  }
};

// Delete all promo codes
const deleteAllPromoCodes = async (req, res) => {
  try {
    // Check if there are any promo codes to delete
    const count = await PromoCode.countDocuments({});
    
    if (count === 0) {
      return res.status(200).json({
        success: true,
        message: "No promo codes found to delete",
        deleted: 0
      });
    }
    
    // Delete all promo codes
    const result = await PromoCode.deleteMany({});
    
    console.log(`Deleted ${result.deletedCount} promo codes`);
    
    return res.status(200).json({
      success: true,
      message: `Successfully deleted all promo codes`,
      deleted: result.deletedCount
    });
  } catch (error) {
    console.error("Error deleting all promo codes:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete promo codes",
    });
  }
};

module.exports = {
  uploadPromoCodes,
  getAllPromoCodes,
  redeemPromoCode,
  getVerifiedRetailers,
  checkRemainingRedemptions,
  deleteAllPromoCodes
};
