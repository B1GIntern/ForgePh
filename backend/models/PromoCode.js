// models/PromoCode.js
const mongoose = require("mongoose");

// Define the promo code schema
const promoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    points: {
      type: Number,
      required: true,
      default: 10, // Default points set to 10
    },
    redeemedBy: {
      consumerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the consumer who redeemed the promo code
        required: false,
      },
      redeemedAt: {
        type: Date,
      },
      shopName: {
        type: String,
        required: function () {
          // Only required if consumerId exists (code is being redeemed)
          return this.redeemedBy && this.redeemedBy.consumerId;
        },
      },
    },
  },
  { timestamps: true }
);

// Method to redeem the promo code
promoCodeSchema.methods.redeem = function (consumer, shopName) {
  if (this.redeemedBy && this.redeemedBy.consumerId) {
    throw new Error("This promo code has already been redeemed.");
  }

  if (!shopName) {
    throw new Error("Shop name is required for redemption");
  }

  // Redeem the code by saving the consumer and shopName
  this.redeemedBy = {
    consumerId: consumer._id,
    shopName: shopName,
    redeemedAt: new Date(),
  };

  return this.save();
};

const PromoCode = mongoose.model("PromoCode", promoCodeSchema);

module.exports = PromoCode;
