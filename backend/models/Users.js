const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

// Define the user schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      province: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    birthdate: {
      type: Date,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      enum: ["Consumer", "Retailer"],
      required: true,
    },
    shopName: {
      type: String,
      trim: true,
      required: function () {
        return this.userType === "Retailer";
      },
    },
    points: {
      type: Number,
      default: 50, // Default points start at 50
      min: 0,
    },
    redeemedPromoCodes: [
      {
        promoCodeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PromoCode",
          required: true,
        },
        redeemedAt: {
          type: Date,
          default: Date.now,
        },
        shopName: {
          type: String,
          required: true,
        },
        code: {
          type: String,
          required: true,
        },
        points: {
          type: Number,
          required: true,
        }
      },
    ],
    redemptionCount: {
      type: Number,
      default: 3, // Max redemptions per day
      min: 0,
    },
    lastRedemptionDate: {
      type: Date,
      default: null,
    },
    dailyLimitReached: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    userStatus: {
      type: String,
      enum: ["Not Verified", "Verified"],
      default: "Not Verified",
    },
    rank: {
      type: String,
      enum: ["Bronze", "Silver", "Gold"],
      default: "Bronze",
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    rewardsclaimed: [
      {
        rewardsid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Reward",
          required: true,
        },
        rewardsname: {
          type: String,
          required: true,
        },
      },
    ],
    prizeClaimed: [
      {
        prizeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Prize",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        claimedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    joinedFlashPromo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FlashPromo',
      required: false
    }],
  },
  { timestamps: true }
);

// Method to generate authentication token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

// Reset redemption count at 12:00 AM (midnight)
userSchema.methods.resetRedemptionCount = function () {
  const currentDate = new Date();
  const lastRedemptionDate = this.lastRedemptionDate;

  if (
    lastRedemptionDate &&
    currentDate.getDate() !== lastRedemptionDate.getDate()
  ) {
    this.redemptionCount = 3; // Reset to 3 after midnight
  }

  this.lastRedemptionDate = currentDate;
};

const validateUser = (data) => {
  const schema = Joi.object({
    name: Joi.string().trim().required().label("Name"),
    location: Joi.object({
      province: Joi.string().trim().required().label("Province"),
      city: Joi.string().trim().required().label("City"),
    })
      .required()
      .label("Location"),
    phoneNumber: Joi.string().trim().required().label("Phone Number"),
    birthdate: Joi.date().required().label("Birthdate"),
    email: Joi.string().email().trim().required().label("Email"),
    password: passwordComplexity().required().label("Password"),
    userType: Joi.string()
      .valid("Consumer", "Retailer")
      .required()
      .label("User Type"),
    shopName: Joi.when("userType", {
      is: "Retailer",
      then: Joi.string().trim().required().label("Shop Name"),
      otherwise: Joi.forbidden(),
    }),
    userStatus: Joi.string() // Add this field to your validation schema
      .valid("Not Verified", "Verified")
      .default("Not Verified")
      .label("User Status"),
    points: Joi.number().min(0).default(50).label("Points"),
    redemptionCount: Joi.number().min(0).default(3).label("Redemption Count"),
    lastRedemptionDate: Joi.date().optional().label("Last Redemption Date"),
    registrationDate: Joi.date().optional().label("Registration Date"),
    rank: Joi.string()
      .valid("Bronze", "Silver", "Gold")
      .default("Bronze")
      .label("Rank"), // Add this if rank is passed in the request
    rewardsclaimed: Joi.array().items(
      Joi.object({
        rewardId: Joi.string().required(),
        rewardName: Joi.string().required()
      })
    ).default([])
  });

  return schema.validate(data);
};

const User = mongoose.model("User", userSchema);

module.exports = { User, validateUser };
