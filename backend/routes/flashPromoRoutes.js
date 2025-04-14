const express = require("express");
const router = express.Router();
const FlashPromo = require("../models/FlashPromo");
const auth = require("../middleware/auth");

// Get all flash promos
router.get("/", async (req, res) => {
  try {
    const flashPromos = await FlashPromo.find().sort({ isActive: -1, startDate: -1 });
    res.json(flashPromos);
  } catch (err) {
    console.error("Error getting flash promos:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get a specific flash promo
router.get("/:id", async (req, res) => {
  try {
    const flashPromo = await FlashPromo.findById(req.params.id);
    if (!flashPromo) {
      return res.status(404).json({ message: "Flash promo not found" });
    }
    res.json(flashPromo);
  } catch (err) {
    console.error("Error getting flash promo:", err);
    res.status(500).json({ message: err.message });
  }
});

// Create a new flash promo (admin only)
router.post("/", async (req, res) => {
  try {
    const {
      name,
      startDate,
      endDate,
      maxParticipants,
      multiplier,
      prize,
      isActive,
    } = req.body;

    // Validate required fields
    if (!name || !startDate || !endDate || !prize) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Create new flash promo
    const flashPromo = new FlashPromo({
      name,
      startDate,
      endDate,
      maxParticipants: maxParticipants || 10,
      multiplier: multiplier || 1,
      prize,
      isActive: isActive !== undefined ? isActive : true,
      currentParticipants: 0,
      participants: [],
    });

    const savedFlashPromo = await flashPromo.save();
    res.status(201).json(savedFlashPromo);
  } catch (err) {
    console.error("Error creating flash promo:", err);
    res.status(500).json({ message: err.message });
  }
});

// Update flash promo status (active/inactive)
router.patch("/:id/status", async (req, res) => {
  try {
    const { isActive } = req.body;
    if (isActive === undefined) {
      return res.status(400).json({ message: "isActive field is required" });
    }

    const flashPromo = await FlashPromo.findById(req.params.id);
    if (!flashPromo) {
      return res.status(404).json({ message: "Flash promo not found" });
    }

    flashPromo.isActive = isActive;
    const updatedFlashPromo = await flashPromo.save();
    res.json(updatedFlashPromo);
  } catch (err) {
    console.error("Error updating flash promo status:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete a flash promo
router.delete("/:id", async (req, res) => {
  try {
    const flashPromo = await FlashPromo.findById(req.params.id);
    if (!flashPromo) {
      return res.status(404).json({ message: "Flash promo not found" });
    }

    await FlashPromo.deleteOne({ _id: req.params.id });
    res.json({ message: "Flash promo deleted" });
  } catch (err) {
    console.error("Error deleting flash promo:", err);
    res.status(500).json({ message: err.message });
  }
});

// Join a flash promo
router.post("/:id/join", async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const flashPromo = await FlashPromo.findById(req.params.id);
    if (!flashPromo) {
      return res.status(404).json({ message: "Flash promo not found" });
    }

    // Check if promo is active
    if (!flashPromo.isActive) {
      return res.status(400).json({ message: "This flash promo is not active" });
    }

    // Check if user is already participating
    if (flashPromo.isUserParticipating(userId)) {
      return res.status(400).json({ message: "You are already participating in this flash promo" });
    }

    // Check if maximum participants reached
    if (flashPromo.currentParticipants >= flashPromo.maxParticipants) {
      return res.status(400).json({ message: "Maximum participants reached for this flash promo" });
    }

    // Add user to participants using the join method
    await flashPromo.join(userId);

    res.json({ 
      success: true, 
      message: "Successfully joined the flash promo",
      entries: flashPromo.getUserEntries(userId)
    });
  } catch (err) {
    console.error("Error joining flash promo:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 