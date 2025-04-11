const router = require("express").Router();
const { User, validateUser } = require("../models/Users.js");
const bcrypt = require("bcrypt");

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

module.exports = router;
