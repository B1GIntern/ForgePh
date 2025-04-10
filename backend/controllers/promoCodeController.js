// controllers/promoCodeController.js
const XLSX = require("xlsx");
const PromoCode = require("../models/PromoCode.js");

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
          // Create new promo code with default values
          await PromoCode.create({
            code,
            points: 10, // Default points
            // redeemedBy is left undefined for new codes
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
    const { code, consumerId, shopName } = req.body;

    if (!code || !consumerId || !shopName) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: code, consumerId, and shopName are required",
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
    if (promoCode.redeemedBy && promoCode.redeemedBy.consumerId) {
      return res.status(400).json({
        success: false,
        message: "This promo code has already been redeemed",
      });
    }

    // Set redemption details
    promoCode.redeemedBy = {
      consumerId,
      shopName,
      redeemedAt: new Date(),
    };

    await promoCode.save();

    return res.status(200).json({
      success: true,
      message: "Promo code redeemed successfully",
      points: promoCode.points,
      promoCode,
    });
  } catch (error) {
    console.error("Error redeeming promo code:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to redeem promo code",
    });
  }
};

module.exports = {
  uploadPromoCodes,
  getAllPromoCodes,
  redeemPromoCode,
};
