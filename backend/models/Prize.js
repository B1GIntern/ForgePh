const mongoose = require("mongoose");

// Define the Prize schema
const prizeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: false,
  },
});

// Create the Prize model
const Prize = mongoose.model("Prize", prizeSchema);
