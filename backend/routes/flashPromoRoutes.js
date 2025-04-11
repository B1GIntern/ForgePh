const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { FlashPromo } = require('../models/FlashPromo');

// Get all flash promos
router.get('/', async (req, res) => {
  try {
    const flashPromos = await FlashPromo.find().sort({ createdAt: -1 });
    res.json(flashPromos);
  } catch (error) {
    console.error('Error fetching flash promos:', error);
    res.status(500).json({ message: 'Failed to fetch flash promos' });
  }
});

// Create a new flash promo
router.post('/', async (req, res) => {
  try {
    const { name, startDate, endDate, maxParticipants, multiplier = 1, prize, isActive } = req.body;

    const newFlashPromo = new FlashPromo({
      name,
      startDate,
      endDate,
      maxParticipants,
      currentParticipants: 0,
      multiplier,
      prize,
      isActive,
      participants: []
    });

    const savedFlashPromo = await newFlashPromo.save();
    res.status(201).json(savedFlashPromo);
  } catch (error) {
    console.error('Error creating flash promo:', error);
    res.status(500).json({ message: 'Failed to create flash promo' });
  }
});

// Update flash promo status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const updatedFlashPromo = await FlashPromo.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updatedFlashPromo) {
      return res.status(404).json({ message: 'Flash promo not found' });
    }

    res.json(updatedFlashPromo);
  } catch (error) {
    console.error('Error updating flash promo status:', error);
    res.status(500).json({ message: 'Failed to update flash promo status' });
  }
});

// Delete a flash promo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFlashPromo = await FlashPromo.findByIdAndDelete(id);

    if (!deletedFlashPromo) {
      return res.status(404).json({ message: 'Flash promo not found' });
    }

    res.json({ message: 'Flash promo deleted successfully' });
  } catch (error) {
    console.error('Error deleting flash promo:', error);
    res.status(500).json({ message: 'Failed to delete flash promo' });
  }
});

// Join a flash promo
router.post('/:id/join', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const flashPromo = await FlashPromo.findById(id);

    if (!flashPromo) {
      return res.status(404).json({ message: 'Flash promo not found' });
    }

    if (!flashPromo.isActive) {
      return res.status(400).json({ message: 'Flash promo is not active' });
    }

    if (flashPromo.currentParticipants >= flashPromo.maxParticipants) {
      return res.status(400).json({ message: 'Flash promo is full' });
    }

    // Check if user already joined
    if (flashPromo.participants.some(p => p.userId === userId)) {
      return res.status(400).json({ message: 'User already joined this promo' });
    }

    // Add user to participants
    flashPromo.participants.push({
      userId,
      joinedAt: new Date()
    });
    flashPromo.currentParticipants += 1;

    const updatedFlashPromo = await flashPromo.save();
    res.json(updatedFlashPromo);
  } catch (error) {
    console.error('Error joining flash promo:', error);
    res.status(500).json({ message: 'Failed to join flash promo' });
  }
});

module.exports = router; 