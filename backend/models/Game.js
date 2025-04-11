const mongoose = require("mongoose");

// Define the game schema
const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  gameType: {
    type: String,
    enum: ["SpinTheWheel", "SlotMachine", "CardMatchingGame"],
    required: true
  },
  points: {
    type: Number,
    default: 3,
    required: true,
    min: 0
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  prizedAssigned: [{
    prizeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prize",
      required: false
    },
    prizeName: {
      type: String,
      required: false
    },
    multiplier: {
      type: Number,
      required: false
    }
  }],
  featured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Create the Game model
const Game = mongoose.model("Game", gameSchema);

module.exports = Game;