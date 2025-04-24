const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const userRoutes = require("./routes/users.js");
const authRoutes = require("./routes/auth");
const { User } = require("./models/Users.js");
const emailVerificationRoutes = require("./routes/emailverification");
const passwordResetRoutes = require("./routes/passwordReset");
const promoCodeRoutes = require("./routes/promoCodeRoutes");
const prizeRoutes = require("./routes/prizeRoutes");
const flashPromoRoutes = require("./routes/flashPromoRoutes");
const gameRoutes = require("./routes/gameRoutes");
const idRoutes = require("./routes/idRoutes");

console.log(crypto.randomBytes(64).toString("hex"));

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with enhanced CORS for production
const io = socketIo(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc)
      if (!origin) return callback(null, true);
      
      // Check if origin is allowed
      const allowedOrigins = process.env.ALLOW_ORIGINS ? 
        process.env.ALLOW_ORIGINS.split(',') : 
        [
          process.env.FRONTEND_URL || '*',
          'https://forge-philippines.windsurf.build',
          'https://forge-philippines-wz24z.netlify.app'
        ];
        
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        console.log('Socket.IO CORS blocked request from:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["my-custom-header", "Authorization"],
    credentials: true,
  },
});

// Add this middleware to attach io to the request object
app.use((req, res, next) => {
  req.io = io;
  next();
});
// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || crypto.randomBytes(64).toString("hex")
    );

    // Find user by ID
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    // Attach user to socket instance
    socket.user = user;
    next();
  } catch (error) {
    console.error("Socket authentication error:", error.message);
    next(new Error("Authentication error: " + error.message));
  }
});

// Middleware to parse JSON
app.use(express.json({ limit: '50mb' }));

// Enhanced CORS configuration for production deployment
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    const allowedOrigins = process.env.ALLOW_ORIGINS ? 
      process.env.ALLOW_ORIGINS.split(',') : 
      [
        process.env.FRONTEND_URL || '*',
        'https://forge-philippines.windsurf.build',
        'https://forge-philippines-wz24z.netlify.app'
      ];
      
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.log('CORS blocked request from:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Middleware to check and reset daily redemption count if needed
app.use(async (req, res, next) => {
  // Check if the request involves a user that needs redemption count check
  const userId = req.body.userId || (req.params.userId) || (req.user && req.user._id);
  
  if (userId) {
    try {
      const user = await User.findById(userId);
      
      if (user) {
        // Reset redemption counts if it's a new day
        user.resetRedemptionCount();
        
        // Reset daily game plays if it's a new day
        if (typeof user.resetDailyGamePlays === 'function') {
          user.resetDailyGamePlays();
        }
        
        await user.save();
      }
    } catch (err) {
      console.error("Error in middleware checking redemption counts:", err);
      // Don't block the request even if there's an error here
    }
  }
  
  next();
});

// Define API routes first
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/emailverification", emailVerificationRoutes);
app.use("/api/auth", passwordResetRoutes); // Password reset routes under auth namespace
app.use("/api/promo-codes", promoCodeRoutes);
app.use("/api/prizes", prizeRoutes);
app.use("/api/flash-promos", flashPromoRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/government-id", idRoutes);

// Initialize Socket.IO in auth routes
authRoutes.initializeSocketIO(io);

// Socket.IO connection handling with authentication
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  console.log("Authenticated user:", socket.user.name);

  // Join a user-specific room for targeted events
  socket.join(`user:${socket.user._id}`);

  // Notify user of successful connection
  socket.emit("notification", {
    title: "Connected",
    message: `Welcome back, ${socket.user.name}!`,
    type: "success",
  });

  // Example event handling for messages
  socket.on("sendMessage", (data) => {
    io.emit("receiveMessage", {
      userId: socket.user._id,
      username: socket.user.name,
      message: data.message,
      timestamp: new Date(),
    });
  });

  // Handle user actions that affect points
  socket.on("completeAction", async ({ actionType, pointsEarned = 0 }) => {
    try {
      // Update user points in the database
      const updatedUser = await User.findByIdAndUpdate(
        socket.user._id,
        { $inc: { points: pointsEarned } }, // Increase points by pointsEarned
        { new: true } // Return the updated user document
      );

      // Notify the specific user about their points update
      io.to(`user:${socket.user._id}`).emit("pointsUpdate", {
        userId: updatedUser._id,
        newPoints: updatedUser.points,
        pointsAdded: pointsEarned,
        actionType,
      });
    } catch (error) {
      console.error("Error updating points:", error);
      socket.emit("notification", {
        title: "Error",
        message: "Failed to update points",
        type: "error",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // Handle all other routes by serving the React app
  app.get('*', (req, res) => {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(404).json({ message: 'API endpoint not found' });
    }
    res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
  });
}

// Use the PORT from environment variables or default to 5001
const PORT = process.env.PORT || 5001;

// Connect to the database first, then start the server
const startServer = async () => {
  try {
    // Wait for database connection
    await connectDB();

    // Start server after the database is connected
    const startOnPort = (port) => {
      server.listen(port)
        .on('listening', () => {
          console.log(`Server started at http://localhost:${port}`);
        })
        .on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying port ${port + 1}...`);
            startOnPort(port + 1);
          } else {
            console.error("Failed to start server:", err);
            process.exit(1);
          }
        });
    };
    
    startOnPort(PORT);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Export the io instance for use in other files
module.exports = { io, app };