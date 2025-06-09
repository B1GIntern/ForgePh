const mongoose = require("mongoose");

const raffleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  retailerName: {
    type: String,
    required: true
  },
  prizes: [{
    prizeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prize",
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  }],
  winners: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    userName: {
      type: String,
      required: true,
      trim: true
    },
    prizeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prize",
      required: true
    },
    prizeName: {
      type: String,
      required: true,
      trim: true
    },
    winDate: {
      type: Date,
      default: Date.now
    },
    winner: {
      type: Boolean,
      default: true
    }
  }]
}, { timestamps: true });

const Raffles = mongoose.model("Raffles", raffleSchema);

module.exports = Raffles; 