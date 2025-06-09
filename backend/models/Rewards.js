const mongoose = require("mongoose");

// Define the rewards schema
const rewardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // This line adds the unique constraint
  },
  pointsRequired: {
    type: Number,
    required: true,
  },
  stockAvailable: {
    type: Number,
    default: 0,
    min: 0,
  },
  type: {
    type: String,
    enum: ["Discounts", "Vouchers", "Products"], // Enum for reward types
    required: true,
  },
  // Add UsersClaimed array to track which users have claimed this reward
  UsersClaimed: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: String,
      claimedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

// Method to redeem the reward - moved outside to avoid circular dependency issues
rewardSchema.methods.redeem = async function (userId) {
  try {
    // Import the User model directly when needed
    const User = mongoose.model("User");

    // Find the user by ID
    const user = await User.findById(userId);

    // Ensure user exists
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user has enough points
    if (user.points < this.pointsRequired) {
      throw new Error("Not enough points to redeem this reward");
    }

    // Check if reward is in stock
    if (this.stockAvailable <= 0) {
      throw new Error("This reward is out of stock");
    }

    // Deduct points from user
    user.points -= this.pointsRequired;
    await user.save();

    // Reduce stock
    this.stockAvailable -= 1;

    // Add user to the UsersClaimed array
    this.UsersClaimed.push({
      userId: user._id,
      name: user.name || user.username || user.email,
    });

    await this.save();

    return { message: "Reward redeemed successfully!" };
  } catch (error) {
    throw new Error(`Reward redemption failed: ${error.message}`);
  }
};

// Create the Rewards model based on the schema
const Reward = mongoose.model("Reward", rewardSchema);

module.exports = Reward;
