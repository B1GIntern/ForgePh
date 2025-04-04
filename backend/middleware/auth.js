const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  // Check if token exists
  if (!token) {
    return res
      .status(401)
      .send({ message: "Access denied. No token provided." });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user from payload to request object
    req.user = { _id: decoded._id };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res
      .status(401)
      .send({ message: "Invalid token. Please authenticate again." });
  }
};
