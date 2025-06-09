const express = require("express");
const router = express.Router();
const idController = require("../controllers/idController");

// Get all government ID submissions (Admin only)
router.get("/submissions", idController.getAllSubmissions);

// Get a single government ID submission (Admin only)
router.get("/submissions/:id", idController.getSubmissionById);

// Upload a new government ID (encrypted)
router.post("/upload", idController.uploadGovernmentID);

// Update government ID verification status (Admin only)
router.put("/submissions/:id/verify", idController.verifySubmission);

// Delete a government ID submission (Admin only)
router.delete("/submissions/:id", idController.deleteSubmission);

module.exports = router;
