const mongoose = require('mongoose');

const flashPromoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  maxParticipants: {
    type: Number,
    required: true,
    min: 1
  },
  currentParticipants: {
    type: Number,
    default: 0,
    min: 0
  },
  multiplier: {
    type: Number,
    min: 1,
    default: 1
  },
  prize: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Add index for better query performance
flashPromoSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

// Virtual for checking if promo is active based on dates
flashPromoSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
});

// Virtual for checking available slots
flashPromoSchema.virtual('hasAvailableSlots').get(function() {
  return this.currentParticipants < this.maxParticipants;
});

// Virtual property for 'status'
flashPromoSchema.virtual('status').get(function() {
  return this.isActive ? 'ACTIVE' : 'INACTIVE';
});

// Method to add a participant
flashPromoSchema.methods.addParticipant = async function(userId) {
  if (this.currentParticipants >= this.maxParticipants) {
    throw new Error('No available slots');
  }
  
  if (!this.isCurrentlyActive) {
    throw new Error('Promo is not active');
  }

  // Check if user is already a participant
  const isAlreadyParticipant = this.participants.some(p => p.userId.toString() === userId.toString());
  if (isAlreadyParticipant) {
    throw new Error('User is already a participant');
  }

  this.participants.push({ userId });
  this.currentParticipants += 1;
  return this.save();
};

// Method to remove a participant
flashPromoSchema.methods.removeParticipant = async function(userId) {
  const participantIndex = this.participants.findIndex(p => p.userId.toString() === userId.toString());
  if (participantIndex === -1) {
    throw new Error('User is not a participant');
  }

  this.participants.splice(participantIndex, 1);
  this.currentParticipants -= 1;
  return this.save();
};

// Method to check if a user is already participating
flashPromoSchema.methods.isUserParticipating = function(userId) {
  return this.participants.some(p => p.userId.toString() === userId.toString());
};

// Method to get user's entry count
flashPromoSchema.methods.getUserEntries = function(userId) {
  return this.participants.filter(p => p.userId.toString() === userId.toString()).length;
};

// Method to join a flash promo
flashPromoSchema.methods.join = async function(userId) {
  // Check if user is already participating
  if (this.isUserParticipating(userId)) {
    throw new Error("User is already participating in this flash promo");
  }

  // Check if maximum participants reached
  if (this.currentParticipants >= this.maxParticipants) {
    throw new Error("Maximum participants reached for this flash promo");
  }

  // Add user to participants
  this.participants.push({
    userId,
    joinedAt: new Date()
  });
  
  // Update participants count
  this.currentParticipants = this.participants.length;
  
  // Save and return the updated flash promo
  return this.save();
};

const FlashPromo = mongoose.model('FlashPromo', flashPromoSchema);

module.exports = FlashPromo; 