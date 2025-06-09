const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const gameController = require('../controllers/gameController');
const { User } = require('../models/Users');
const Game = require('../models/Game');

// Get all games
router.get('/', gameController.getAllGames);

// Feature a game and update its configuration
router.post('/:id/feature', gameController.featureGame);
router.patch('/:id/feature', gameController.featureGame);

// Unfeature a game
router.post('/:id/unfeature', gameController.unfeatureGame);
router.patch('/:id/unfeature', gameController.unfeatureGame);

// Slot machine spin endpoint
router.post('/slot-machine/spin', async (req, res) => {
    try {
        const { userId, finalSymbols, pointsToDeduct } = req.body;
        
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID is required' 
            });
        }
        
        if (!finalSymbols || !Array.isArray(finalSymbols)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Final symbols array is required' 
            });
        }
        
        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        // Find the slot machine game
        const slotGame = await Game.findOne({ gameType: 'SlotMachine', featured: true });
        if (!slotGame) {
            return res.status(404).json({ 
                success: false, 
                message: 'Slot machine game not found' 
            });
        }

        // Calculate points won based on the symbols
        let pointsWon = 0;
        let specialPrizeWon = false;
        let specialPrizeName = '';
        
        // Check for matching symbols
        const symbolIds = finalSymbols.map(s => s.id);
        const symbolValues = finalSymbols.map(s => s.value);
        
        // Check for special prize (all three symbols are special prize symbols)
        const allSpecialPrize = finalSymbols.every(s => s.isSpecialPrize === true);
        if (allSpecialPrize && slotGame.prizedAssigned && slotGame.prizedAssigned.length > 0) {
            specialPrizeWon = true;
            specialPrizeName = slotGame.prizedAssigned[0].prizeName || 'Special Prize';
            // Jackpot win - highest points
            pointsWon = 100;
        } 
        // Check for three of a kind
        else if (symbolIds[0] === symbolIds[1] && symbolIds[1] === symbolIds[2]) {
            // Triple match - give 3x the symbol value
            pointsWon = symbolValues[0] * 3;
        } 
        // Check for two of a kind
        else if (symbolIds[0] === symbolIds[1] || symbolIds[1] === symbolIds[2] || symbolIds[0] === symbolIds[2]) {
            // Double match - give 2x the highest matched symbol value
            if (symbolIds[0] === symbolIds[1]) {
                pointsWon = symbolValues[0] * 2;
            } else if (symbolIds[1] === symbolIds[2]) {
                pointsWon = symbolValues[1] * 2;
            } else {
                pointsWon = symbolValues[0] * 2;
            }
        }
        
        // Update user points
        user.points = (user.points || 0) + pointsWon;
        await user.save();
        
        // Return the result
        return res.status(200).json({
            success: true,
            pointsWon,
            totalPoints: user.points,
            specialPrizeWon,
            specialPrizeName,
            message: specialPrizeWon 
                ? `Congratulations! You won the ${specialPrizeName}!` 
                : pointsWon > 0 
                    ? `You won ${pointsWon} points!` 
                    : 'Better luck next time!'
        });
        
    } catch (error) {
        console.error('Error processing slot machine spin:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while processing slot machine spin' 
        });
    }
});

module.exports = router; 