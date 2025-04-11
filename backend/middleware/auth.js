// auth.js middleware
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    // First check for token in Authorization header
    const authHeader = req.header("Authorization");
    let token = authHeader ? authHeader.replace("Bearer ", "") : null;
    
    // If no token in header, check for token in cookies
    if (!token && req.cookies && req.cookies.auth_token) {
      token = req.cookies.auth_token;
    }
    
    if (!token) {
      return res.status(401).send({ message: "Access denied. No token provided." });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    console.error("Auth middleware error:", ex);
    res.status(401).send({ message: "Invalid token." });
  }
};

module.exports = auth;