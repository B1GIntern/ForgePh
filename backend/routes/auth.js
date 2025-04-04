const router = require("express").Router();
const { User } = require("../models/Users.js");
const Reward = require("../models/Rewards.js");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const passwordComplexity = require("joi-password-complexity");
const jwt = require("jsonwebtoken");

// Global variable to store the io instance
let io;

router.post("/login", async (req, res) => {
  try {
    console.log("Login attempt for:", req.body.email);
    // Validate user input
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    // Find user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(400).send({ message: "Invalid email or password" });

    // Compare entered password with hashed password
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(400).send({ message: "Invalid email or password" });

    // Generate auth token
    const token = user.generateAuthToken();
    console.log("Generated Token:", token);

    // Emit socket event for successful login
    if (io) {
      // Emit to admin users about new login
      io.emit("userActivity", {
        action: "login",
        user: user.name,
        timestamp: new Date(),
      });
    }

    // Send response including token and user data
    res.status(200).send({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        points: user.points,
        rewardsclaimed: user.rewardsclaimed || [],
      },
      message: "Logged In Successfully",
    });
  } catch (error) {
    console.error("Login Error:", error.message, error.stack);
    res.status(500).send({ message: "Internal Server Error When Logging In" });
  }
});

// Validation schema for login
const validate = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};

// Validation schema for rewards
const validateReward = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().label("Name"),
    pointsRequired: Joi.number().min(0).required().label("Points Required"),
    stockAvailable: Joi.number().min(0).required().label("Stock Available"),
    type: Joi.string()
      .valid("Discounts", "Vouchers", "Products")
      .required()
      .label("Type"),
  });
  return schema.validate(data);
};

router.get("/rewards", async (req, res) => {
  try {
    const rewards = await Reward.find();

    // Emit socket event when rewards are retrieved
    if (io) {
      io.emit("rewardsViewed", {
        timestamp: new Date(),
      });
    }

    res.status(200).json(rewards);
  } catch (error) {
    console.error("Error retrieving rewards:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Create reward route
router.post("/create-reward", async (req, res) => {
  // Validate the incoming reward data
  const { error } = validateReward(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  try {
    // Check if the reward already exists
    const existingReward = await Reward.findOne({ name: req.body.name });
    if (existingReward) {
      return res.status(400).send({
        message:
          "A reward with this name already exists. Please choose a different name.",
      });
    }

    // Create a new reward instance
    const reward = new Reward({
      name: req.body.name,
      pointsRequired: req.body.pointsRequired,
      stockAvailable: req.body.stockAvailable || 0,
      type: req.body.type,
    });

    // Save the reward to the database
    const savedReward = await reward.save();

    // Emit socket event for new reward creation
    if (io) {
      io.emit("rewardCreated", {
        reward: {
          id: savedReward._id,
          name: savedReward.name,
          pointsRequired: savedReward.pointsRequired,
          stockAvailable: savedReward.stockAvailable,
          type: savedReward.type,
        },
        message: "New reward has been added!",
        timestamp: new Date(),
      });
    }

    return res.status(201).send({
      message: "Reward created successfully!",
      reward: savedReward,
    });
  } catch (error) {
    console.error("Error creating reward:", error);
    return res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Deletion endpoint
router.delete("/delete-reward/:rewardId", async (req, res) => {
  try {
    // Find the reward by ID
    const reward = await Reward.findById(req.params.rewardId);
    if (!reward) {
      return res.status(404).send({ message: "Reward not found" });
    }

    // Store reward info before deletion for the socket event
    const rewardInfo = {
      id: reward._id,
      name: reward.name,
    };

    // Use findByIdAndDelete instead
    await Reward.findByIdAndDelete(req.params.rewardId);

    // Emit socket event for reward deletion
    if (io) {
      io.emit("rewardDeleted", {
        rewardId: req.params.rewardId,
        rewardName: rewardInfo.name,
        message: "Reward has been deleted",
        timestamp: new Date(),
      });
    }

    return res.status(200).send({ message: "Reward deleted successfully" });
  } catch (error) {
    console.error("Deletion Error:", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

// Redeem reward route
router.post("/redeem-reward", async (req, res) => {
  const { userId, rewardsid } = req.body;

  // Validate incoming data
  if (!userId || !rewardsid) {
    return res
      .status(400)
      .send({ message: "User ID and Reward ID are required." });
  }

  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found:", userId);
      return res.status(404).send({ message: "User not found" });
    }

    // Find the reward
    const reward = await Reward.findById(rewardsid);
    if (!reward) {
      console.log("Reward not found:", rewardsid);
      return res.status(404).send({ message: "Reward not found" });
    }

    // Check if user has already claimed the reward
    const claimedReward = user.rewardsclaimed?.find(
      (reward) => reward.rewardsid.toString() === rewardsid
    );

    if (claimedReward) {
      return res
        .status(400)
        .send({ message: "You have already claimed this reward." });
    }

    // Check if user has enough points to redeem
    if (user.points < reward.pointsRequired) {
      return res
        .status(400)
        .send({ message: "Not enough points to redeem this reward." });
    }

    // Check if reward is in stock
    if (reward.stockAvailable <= 0) {
      return res.status(400).send({ message: "This reward is out of stock." });
    }

    // Deduct points from user
    user.points -= reward.pointsRequired;

    // Update redeemed rewards in user
    if (!user.rewardsclaimed) {
      user.rewardsclaimed = [];
    }

    user.rewardsclaimed.push({
      rewardsid: reward._id,
      rewardsname: reward.name,
    });

    // Save updated user
    await user.save();

    // Add user to reward's UsersClaimed array if it exists
    if (!reward.UsersClaimed) {
      reward.UsersClaimed = [];
    }

    reward.UsersClaimed.push({
      userId: user._id,
      name: user.name || user.username || user.email,
      claimedAt: new Date(),
    });

    // Reduce reward stock
    reward.stockAvailable -= 1;

    // Save updated reward
    await reward.save();

    // Record the redemption date
    const redemptionDate = new Date();
    const formattedDate = redemptionDate.toLocaleDateString("en-US");

    // Emit socket events for reward redemption
    if (io) {
      // Notify all users about the redemption
      io.emit("rewardRedeemed", {
        userId: user._id,
        userName: user.name,
        rewardId: reward._id,
        rewardName: reward.name,
        timestamp: redemptionDate,
        remainingStock: reward.stockAvailable,
      });

      // Other socket events...
    }

    return res.status(200).send({
      message: "Reward redeemed successfully!",
      redemptionDate: formattedDate,
      rewardsname: reward.name,
    });
  } catch (error) {
    console.error("Error redeeming reward:", error);
    return res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
});

// Method to initialize Socket.IO - attached to the router object
router.initializeSocketIO = (socketIO) => {
  io = socketIO;
};

// Export the router directly
module.exports = router;
