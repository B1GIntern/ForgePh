const router = require("express").Router();
const { User, validateUser } = require("../models/Users.js");
const bcrypt = require("bcrypt");

router.post("/register", async (req, res) => {
  try {
    const { error } = validateUser(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser)
      return res
        .status(409)
        .send({ message: "User with given email already exists" });

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create and save the user with the registration date
    await new User({
      ...req.body,
      password: hashedPassword,
      registrationDate: new Date().toLocaleDateString("en-US"), // MM/DD/YYYY format
    }).save();

    res.status(201).send({ message: "User Created Successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error In Creating User" });
  }
});

module.exports = router;
