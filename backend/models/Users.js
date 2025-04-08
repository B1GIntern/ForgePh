const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

// Define the user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    province: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  birthdate: {
    type: Date,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
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
  points: {
    type: Number,
    default: 325,
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
  registrationDate: {
    type: String,
    default: () => {
      const date = new Date();
      return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
    },
  },
});

// Method to generate authentication token
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  return token;
};

// Validation schema
const validateUser = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().label("Name"),
    location: Joi.object({
      province: Joi.string().required().label("Province"),
      city: Joi.string().required().label("City"),
    })
      .required()
      .label("Location"),
    phoneNumber: Joi.string().required().label("Phone Number"),
    birthdate: Joi.date().required().label("Birthdate"),
    email: Joi.string().email().required().label("Email"),
    password: passwordComplexity().required().label("Password"),
    userType: Joi.string()
      .valid("Consumer", "Retailer")
      .required()
      .label("User Type"),
    points: Joi.number().optional().default(325).label("Points"),
    verified: Joi.boolean().optional().default(false).label("Verified"),
    userStatus: Joi.string()
      .valid("Not Verified", "Verified")
      .optional()
      .default("Not Verified")
      .label("User Status"),
    rank: Joi.string()
      .valid("Bronze", "Silver", "Gold")
      .optional()
      .default("Bronze")
      .label("Rank"),
    registrationDate: Joi.string()
      .pattern(/^\d{2}\/\d{2}\/\d{4}$/) // Match MM/DD/YYYY format
      .label("Registration Date"),
  });
  return schema.validate(data);
};

const User = mongoose.model("User", userSchema);

module.exports = { User, validateUser };
