const mongoose = require("mongoose");

// Define a slice schema for the spinning wheel
const sliceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["points", "prize"], // Can be a point slice or a prize slice
    required: true,
  },
  value: {
    type: Number,
    required: function () {
      // This property is required only if the type is "points"
      return this.type === "points";
    },
  },
  prize: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prize", // Reference to the Prize model
    required: function () {
      // This property is required only if the type is "prize"
      return this.type === "prize";
    },
  },
});

// Define the SpinTheWheel schema
const spinTheWheelSchema = new mongoose.Schema({
  slices: {
    type: [sliceSchema], // Array of slices
    required: true,
  },
  spinCost: {
    type: Number,
    default: 3, // Cost to spin the wheel in points
  },
});

// Create the model
const SpinTheWheel = mongoose.model("SpinTheWheel", spinTheWheelSchema);

module.exports = { Prize, SpinTheWheel };
