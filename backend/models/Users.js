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
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
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
    // Daily game plays tracking - new field
    dailyGamePlays: {
      spinWheel: {
        count: {
          type: Number,
          default: 0,
          min: 0
        },
        lastPlayDate: {
          type: Date,
          default: null
        }
      },
      slotMachine: {
        count: {
          type: Number,
          default: 0,
          min: 0
        },
        lastPlayDate: {
          type: Date, 
          default: null
        }
      }
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
    // Government ID verification fields
    governmentID: {
      // Store the encrypted ID data
      encryptedData: {
        type: String,
        default: null
      },
      // Store initialization vector for decryption
      iv: {
        type: String,
        default: null
      },
      // Track verification status
      verificationStatus: {
        type: String,
        enum: ["Not Submitted", "Pending", "Approved", "Rejected"],
        default: "Not Submitted"
      },
      // For admin comments on verification
      verificationNotes: {
        type: String,
        default: ""
      },
      // When the ID was submitted
      submittedAt: {
        type: Date,
        default: null
      },
      // When the ID was verified by admin
      verifiedAt: {
        type: Date,
        default: null
      },
      // Who verified the ID (admin ID)
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
      }
    },
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

// Reset daily game plays at midnight
userSchema.methods.resetDailyGamePlays = function() {
  const currentDate = new Date();
  
  // Check if spin wheel should be reset
  if (
    this.dailyGamePlays?.spinWheel?.lastPlayDate && 
    currentDate.getDate() !== this.dailyGamePlays.spinWheel.lastPlayDate.getDate()
  ) {
    this.dailyGamePlays.spinWheel.count = 0;
  }
  
  // Check if slot machine should be reset
  if (
    this.dailyGamePlays?.slotMachine?.lastPlayDate && 
    currentDate.getDate() !== this.dailyGamePlays.slotMachine.lastPlayDate.getDate()
  ) {
    this.dailyGamePlays.slotMachine.count = 0;
  }
};

// Helper method to update verification status and user status together
userSchema.methods.updateVerificationStatus = function(status, adminId, notes) {
  this.governmentID.verificationStatus = status;
  
  if (status === "Approved") {
    this.userStatus = "Verified";
    this.verified = true;
    this.governmentID.verifiedAt = new Date();
    this.governmentID.verifiedBy = adminId;
  } else if (status === "Rejected") {
    this.governmentID.verifiedAt = new Date();
    this.governmentID.verifiedBy = adminId;
  }
  
  if (notes) {
    this.governmentID.verificationNotes = notes;
  }
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
    ).default([]),
    governmentID: Joi.object({
      encryptedData: Joi.string().allow(null),
      iv: Joi.string().allow(null),
      verificationStatus: Joi.string()
        .valid("Not Submitted", "Pending", "Approved", "Rejected")
        .default("Not Submitted"),
      verificationNotes: Joi.string().allow(""),
      submittedAt: Joi.date().allow(null),
      verifiedAt: Joi.date().allow(null),
      verifiedBy: Joi.string().allow(null)
    }).default({
      encryptedData: null,
      iv: null,
      verificationStatus: "Not Submitted",
      verificationNotes: "",
      submittedAt: null,
      verifiedAt: null,
      verifiedBy: null
    })
  });
  return schema.validate(data);
};

const User = mongoose.model("User", userSchema);
module.exports = { User, validateUser };