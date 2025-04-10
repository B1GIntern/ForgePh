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
module.exports = router;
