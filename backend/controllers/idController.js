const GovernmentIDUpload = require("../models/GovernmentIDUpload.js");
const { User } = require("../models/Users.js");

// Get all government ID submissions (Admin only)
exports.getAllSubmissions = async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    const submissions = await GovernmentIDUpload.find()
      .populate("userId", "name email phoneNumber userType")
      .sort({ uploadedAt: -1 });
    
    return res.status(200).json({ 
      success: true, 
      submissions: submissions.map(sub => ({
        id: sub._id,
        userId: sub.userId,
        uploadedAt: sub.uploadedAt,
        // Don't send the actual encrypted data in the list view
        hasFrontID: !!sub.front.encryptedData,
        hasBackID: !!sub.back.encryptedData
      }))
    });
  } catch (err) {
    console.error("Error fetching government ID submissions:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Get a single government ID submission (Admin only)
exports.getSubmissionById = async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    const submission = await GovernmentIDUpload.findById(req.params.id)
      .populate("userId", "name email phoneNumber userType");
    
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found." });
    }
    
    return res.status(200).json({ success: true, submission });
  } catch (err) {
    console.error("Error fetching government ID submission:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Upload a new government ID (encrypted)
exports.uploadGovernmentID = async (req, res) => {
  try {
    // Expecting: userId, front (encryptedData, iv), back (encryptedData, iv)
    const { userId, front, back } = req.body;
    if (!userId || !front?.encryptedData || !front?.iv || !back?.encryptedData || !back?.iv) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }
    
    // Save to isolated collection
    const newSubmission = await GovernmentIDUpload.create({
      userId,
      front,
      back
    });
    
    // Update user's governmentID status to "Pending"
    await User.findByIdAndUpdate(userId, {
      'governmentID.verificationStatus': 'Pending',
      'governmentID.submittedAt': new Date()
    });
    
    return res.status(201).json({ 
      success: true, 
      message: "Encrypted Government ID uploaded successfully.",
      submissionId: newSubmission._id
    });
  } catch (err) {
    console.error("Error uploading encrypted government ID:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Update government ID verification status (Admin only)
exports.verifySubmission = async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    const { status, notes } = req.body;
    const adminId = req.body.adminId; // Should come from authenticated admin session
    
    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }
    
    const submission = await GovernmentIDUpload.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found." });
    }
    
    // Update the user's verification status
    const user = await User.findById(submission.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    
    // Use the helper method to update verification status
    user.updateVerificationStatus(status, adminId, notes);
    await user.save();
    
    return res.status(200).json({ 
      success: true, 
      message: `Government ID ${status.toLowerCase()}.`,
      userStatus: user.userStatus,
      verified: user.verified
    });
  } catch (err) {
    console.error("Error updating government ID verification status:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Delete a government ID submission (Admin only)
exports.deleteSubmission = async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    const submission = await GovernmentIDUpload.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found." });
    }
    
    await GovernmentIDUpload.findByIdAndDelete(req.params.id);
    
    return res.status(200).json({ 
      success: true, 
      message: "Government ID submission deleted successfully."
    });
  } catch (err) {
    console.error("Error deleting government ID submission:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};