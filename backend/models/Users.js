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
  rewardsclaimed: [
    {
      rewardsid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reward", // Reference to the Reward model
        required: true,
      },
      rewardsname: {
        type: String,
        required: true,
      },
    },
  ],
});

// Method to generate authentication token - FIXED to use JWT_SECRET instead of SECRET_KEY
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  return token;
};
const phoneRegex = /^\+?[1-9]\d{1,14}$/; // Example regex for international phone numbers

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
  });
  return schema.validate(data);
};

const User = mongoose.model("User", userSchema);

module.exports = { User, validateUser };
