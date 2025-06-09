const router = require("express").Router();
const { User, validateUser } = require("../models/Users.js");
const PromoCode = require("../models/PromoCode.js");
const bcrypt = require("bcrypt");
const FlashPromo = require("../models/FlashPromo.js");
const GovernmentIDUpload = require("../models/GovernmentIDUpload.js");

router.post("/register", async (req, res) => {
  try {
    console.log("Request Body: ", req.body);

    // Don't include userStatus in validation
    const dataForValidation = { ...req.body };
    delete dataForValidation.userStatus; // Remove userStatus before validation
    delete dataForValidation.rank; // Remove rank before validation if also causing issues

    const { error } = validateUser(dataForValidation);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser)
      return res
        .status(409)
        .send({ message: "User with given email already exists" });

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create user object with all properties, adding default values here
    const userData = {
      ...req.body,
      password: hashedPassword,
      registrationDate: new Date(),
      rank: "Bronze", // Set default values after validation
      userStatus: "Not Verified", // Set default values after validation
    };

    if (userData.userType !== "Retailer" && userData.shopName) {
      delete userData.shopName;
    }

    await new User(userData).save();
    res.status(201).send({ message: "User Created Successfully" });
  } catch (error) {
    console.error("Error in user registration:", error);
    res.status(500).send({ message: "Internal Server Error In Creating User" });
  }
});

// Fetch Top 50 Retailers by Points (Using userId)
router.get("/top-retailers", async (req, res) => {
  try {
    const retailers = await User.find({ userType: "Retailer" })
      .sort({ points: -1 }) // Sort by points in descending order
      .limit(50); // Limit to top 50 retailers

    res.status(200).send(retailers);
  } catch (error) {
    res.status(500).send({ message: "Error fetching retailers" });
  }
});

// Points management routes
router.post("/points/deduct", async (req, res) => {
  try {
    const { points, userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.points < points) {
      return res.status(400).json({ success: false, message: "Insufficient points" });
    }

    user.points -= points;
    await user.save();

    return res.status(200).json({ 
      success: true, 
      message: "Points deducted successfully",
      newPoints: user.points 
    });
  } catch (error) {
    console.error("Error deducting points:", error);
    return res.status(500).json({ success: false, message: "Failed to deduct points" });
  }
});

router.post("/points/add", async (req, res) => {
  try {
    const { points, userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.points += points;
    await user.save();

    return res.status(200).json({ 
      success: true, 
      message: "Points added successfully",
      newPoints: user.points 
    });
  } catch (error) {
    console.error("Error adding points:", error);
    return res.status(500).json({ success: false, message: "Failed to add points" });
  }
});

// Flash Promos routes
router.post("/flash-promos/:id/join", async (req, res) => {
  try {
    const { userId } = req.body;
    const promoId = req.params.id;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Get the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Find the flash promo
    const flashPromo = await FlashPromo.findById(promoId);
    if (!flashPromo) {
      return res.status(404).json({ success: false, message: "Flash promo not found" });
    }

    // Check if promo is active
    if (!flashPromo.isActive) {
      return res.status(400).json({ success: false, message: "This flash promo is no longer active" });
    }

    // Check if user is already participating
    const alreadyParticipating = flashPromo.participants.some(p => p.userId.toString() === userId.toString());
    if (alreadyParticipating) {
      return res.status(400).json({ success: false, message: "You're already participating in this flash promo" });
    }

    // Check if maximum participants reached
    if (flashPromo.currentParticipants >= flashPromo.maxParticipants) {
      return res.status(400).json({ success: false, message: "This flash promo has reached maximum participants" });
    }

    // Add the user to the participants
    flashPromo.participants.push({
      userId,
      joinedAt: new Date()
    });
    flashPromo.currentParticipants += 1;
    await flashPromo.save();

    return res.status(200).json({
      success: true,
      message: "Successfully joined the flash promo",
      flashPromo
    });
  } catch (error) {
    console.error("Error joining flash promo:", error);
    return res.status(500).json({ success: false, message: "Failed to join flash promo" });
  }
});

// Prize claiming route
router.post("/prizes/claim", async (req, res) => {
  try {
    const { userId, prizeId, prizeName, gameId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Add the prize to user's prizeClaimed array
    user.prizeClaimed.push({
      prizeId,
      name: prizeName,
      claimedAt: new Date()
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Prize claimed successfully",
      prize: {
        id: prizeId,
        name: prizeName,
        claimedAt: new Date()
      }
    });
  } catch (error) {
    console.error("Error claiming prize:", error);
    return res.status(500).json({ success: false, message: "Failed to claim prize" });
  }
});

// Get all promo code redemptions by consumers
router.get("/retailer-redemptions", async (req, res) => {
  try {
    // Find all users of type "Consumer" who have redeemed at least one promo code
    const consumers = await User.find({
      userType: "Consumer", 
      "redeemedPromoCodes.0": { $exists: true }
    });
    
    console.log(`Found ${consumers.length} consumers with redeemed promo codes`);
    
    // Array to hold all redemptions
    let allRedemptions = [];
    
    // Process each consumer
    for (const consumer of consumers) {
      // Skip if no redemptions (should not happen due to our query, but just in case)
      if (!consumer.redeemedPromoCodes || consumer.redeemedPromoCodes.length === 0) continue;
      
      console.log(`Processing consumer ${consumer.name} with ${consumer.redeemedPromoCodes.length} redemptions`);
      
      // Add each of the consumer's redemptions to our array
      for (const redemption of consumer.redeemedPromoCodes) {
        try {
          // Find the retailer for this redemption by shop name
          const retailer = await User.findOne({ 
            userType: "Retailer", 
            shopName: redemption.shopName 
          }).select('name email');
          
          // Add formatted redemption to our array
          allRedemptions.push({
            _id: redemption._id || String(Math.random()),
            code: redemption.code,
            points: redemption.points,
            redeemedAt: redemption.redeemedAt,
            shopName: redemption.shopName,
            // Consumer details
            consumerId: consumer._id,
            consumerName: consumer.name,
            consumerEmail: consumer.email,
            consumerPhone: consumer.phoneNumber,
            consumerLocation: consumer.location,
            // Retailer details if found
            retailerId: retailer?._id || null,
            retailerName: retailer?.name || "Unknown Retailer",
            retailerEmail: retailer?.email || null,
            governmentID: user.governmentID || {}
          });
        } catch (err) {
          console.error(`Error processing redemption: ${err.message}`);
        }
      }
    }
    
    // Sort by date (most recent first)
    allRedemptions.sort((a, b) => new Date(b.redeemedAt) - new Date(a.redeemedAt));
    
    // Log the result
    console.log(`Returning ${allRedemptions.length} total redemptions`);
    
    return res.status(200).json({
      success: true,
      totalRedemptions: allRedemptions.length,
      redemptions: allRedemptions
    });
    
  } catch (error) {
    console.error("Error fetching redemptions:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching redemptions: " + error.message
    });
  }
});

// Check daily game plays remaining
router.get("/game-plays/:gameType/:userId", async (req, res) => {
  try {
    const { gameType, userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }
    
    if (!['spinWheel', 'slotMachine'].includes(gameType)) {
      return res.status(400).json({ success: false, message: "Invalid game type" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Initialize game plays object if it doesn't exist
    if (!user.dailyGamePlays) {
      user.dailyGamePlays = {
        spinWheel: { count: 0, lastPlayDate: null },
        slotMachine: { count: 0, lastPlayDate: null }
      };
    }
    
    // Reset plays if it's a new day
    user.resetDailyGamePlays();
    
    // Get remaining plays
    const maxPlays = 3;
    const playsUsed = user.dailyGamePlays[gameType]?.count || 0;
    const playsRemaining = Math.max(0, maxPlays - playsUsed);
    
    return res.status(200).json({
      success: true,
      gameType,
      playsUsed,
      playsRemaining,
      maxPlays
    });
  } catch (error) {
    console.error(`Error checking game plays for ${req.params.gameType}:`, error);
    return res.status(500).json({ success: false, message: "Failed to check game plays" });
  }
});

// Increment game plays counter
router.post("/game-plays/:gameType/increment", async (req, res) => {
  try {
    const { gameType } = req.params;
    const { userId, isFreeSpin = false } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }
    
    if (!['spinWheel', 'slotMachine'].includes(gameType)) {
      return res.status(400).json({ success: false, message: "Invalid game type" });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Initialize game plays object if it doesn't exist
    if (!user.dailyGamePlays) {
      user.dailyGamePlays = {
        spinWheel: { count: 0, lastPlayDate: null },
        slotMachine: { count: 0, lastPlayDate: null }
      };
    }
    
    // Reset plays if it's a new day
    user.resetDailyGamePlays();
    
    // Free spins don't count against daily limit
    if (!isFreeSpin) {
      // Check if user has plays remaining
      const maxPlays = 3;
      if (user.dailyGamePlays[gameType].count >= maxPlays) {
        return res.status(400).json({ 
          success: false, 
          message: `Daily limit of ${maxPlays} plays for ${gameType} reached` 
        });
      }
      
      // Increment play count
      user.dailyGamePlays[gameType].count += 1;
    }
    
    // Update last play date
    user.dailyGamePlays[gameType].lastPlayDate = new Date();
    await user.save();
    
    // Get remaining plays
    const maxPlays = 3;
    const playsUsed = user.dailyGamePlays[gameType].count;
    const playsRemaining = Math.max(0, maxPlays - playsUsed);
    
    return res.status(200).json({
      success: true,
      gameType,
      playsUsed,
      playsRemaining,
      maxPlays,
      isFreeSpin
    });
  } catch (error) {
    console.error(`Error incrementing game plays for ${req.params.gameType}:`, error);
    return res.status(500).json({ success: false, message: "Failed to increment game plays" });
  }
});

// Get customer referral count for a retailer
router.get("/retailer-referrals/:retailerId", async (req, res) => {
  try {
    const { retailerId } = req.params;
    
    if (!retailerId) {
      return res.status(400).json({ 
        success: false, 
        message: "Retailer ID is required" 
      });
    }
    
    // Find the retailer to get their shop name
    const retailer = await User.findById(retailerId);
    if (!retailer || retailer.userType !== "Retailer") {
      return res.status(404).json({ 
        success: false, 
        message: "Retailer not found" 
      });
    }
    
    const shopName = retailer.shopName;
    
    // Find all unique consumers who have redeemed codes with this shop name
    const consumersWithReferrals = await User.aggregate([
      // Filter to only include Consumer type users
      { $match: { userType: "Consumer" } },
      // Unwind the redeemedPromoCodes array to work with individual redemptions
      { $unwind: "$redeemedPromoCodes" },
      // Filter to only include redemptions for this retailer's shop
      { $match: { "redeemedPromoCodes.shopName": shopName } },
      // Group by consumer ID to count unique consumers
      { $group: { _id: "$_id", count: { $sum: 1 } } },
      // Count the total number of unique consumers
      { $count: "totalUniqueConsumers" }
    ]);
    
    const referralCount = consumersWithReferrals.length > 0 
      ? consumersWithReferrals[0].totalUniqueConsumers 
      : 0;
    
    return res.status(200).json({
      success: true,
      retailerId,
      shopName,
      referralCount
    });
    
  } catch (error) {
    console.error("Error getting retailer referrals:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to get retailer referrals" 
    });
  }
});

// Encrypted Government ID Upload
router.post("/upload-government-id", async (req, res) => {
  try {
    // Expecting: userId, front (encryptedData, iv), back (encryptedData, iv)
    const { userId, front, back } = req.body;
    if (!userId || !front?.encryptedData || !front?.iv || !back?.encryptedData || !back?.iv) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }
    // Save to isolated collection
    await GovernmentIDUpload.create({
      userId,
      front,
      back
    });
    return res.status(201).json({ success: true, message: "Encrypted Government ID uploaded successfully." });
  } catch (err) {
    console.error("Error uploading encrypted government ID:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Get all government ID submissions (Admin only)
router.get("/government-id-submissions", async (req, res) => {
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
});

// Get a single government ID submission (Admin only)
router.get("/government-id-submissions/:id", async (req, res) => {
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
});

// Update government ID verification status (Admin only)
router.put("/government-id-submissions/:id/verify", async (req, res) => {
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
});

// Get consumer details by ID
router.get("/consumer/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -resetPasswordToken -resetPasswordExpires");
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Error fetching consumer details:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch consumer details" 
    });
  }
});

module.exports = router;
