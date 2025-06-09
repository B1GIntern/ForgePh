const mongoose = require("mongoose");

const governmentIDUploadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  front: {
    encryptedData: { type: String, required: true },
    iv: { type: String, required: true }
  },
  back: {
    encryptedData: { type: String, required: true },
    iv: { type: String, required: true }
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("GovernmentIDUpload", governmentIDUploadSchema);
