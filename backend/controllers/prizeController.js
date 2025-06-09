const Prize = require('../models/Prize');

// @desc    Add a new prize
const addPrize = async (req, res) => {
    try {
        const { name, description, quantity, prizedAssignedToGame, gameId } = req.body;

        // Validate required fields
        if (!name || !description || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: name, description, and quantity'
            });
        }

        // Handle game assignment logic
        let prizeData = { name, description, quantity: parseInt(quantity), prizedAssignedToGame };

        if (prizedAssignedToGame && !gameId) {
            return res.status(400).json({ success: false, message: 'gameId is required if the prize is assigned to a game' });
        }
        
        if (prizedAssignedToGame) {
            prizeData.gameId = gameId;
        }

        const prize = await Prize.create(prizeData);

        res.status(201).json({ success: true, data: prize });

    } catch (error) {
        console.error('Error in addPrize:', error);
        res.status(500).json({ success: false, message: 'Server error while adding prize' });
    }
};

// @desc    Delete a prize
const deletePrize = async (req, res) => {
    try {
        const prize = await Prize.findById(req.params.id);

        if (!prize) {
            return res.status(404).json({ success: false, message: 'Prize not found' });
        }

        await prize.deleteOne();

        res.status(200).json({ success: true, message: 'Prize deleted successfully' });

    } catch (error) {
        console.error('Error in deletePrize:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting prize' });
    }
};

// @desc    Get all prizes
const getAllPrizes = async (req, res) => {
    try {
        const prizes = await Prize.find();

        res.status(200).json({ success: true, data: prizes });

    } catch (error) {
        console.error('Error in getAllPrizes:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching prizes' });
    }
};

module.exports = { addPrize, deletePrize, getAllPrizes };
