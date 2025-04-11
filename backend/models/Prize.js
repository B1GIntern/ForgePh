const mongoose = require("mongoose");

// Define the Prize schema
const prizeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true
  }, // Renamed from prizename
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },

  prizedAssignedToGame: {
    type: Boolean,
    default: false
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Game",
    required: function() {
      return this.prizedAssignedToGame === true;
    }
  },
  prizeClaimedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },
    claimedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Create the Prize model
const Prize = mongoose.model("Prize", prizeSchema);

module.exports = Prize;