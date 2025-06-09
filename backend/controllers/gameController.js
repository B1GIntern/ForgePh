const Game = require('../models/Game');
const { User } = require('../models/Users');

// @desc    Get all games
const getAllGames = async (req, res) => {
    try {
        const games = await Game.find();
        res.status(200).json(games);
    } catch (error) {
        console.error('Error in getAllGames:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching games' });
    }
};

// @desc    Get a single game by ID
const getGameById = async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);
        
        if (!game) {
            return res.status(404).json({ success: false, message: 'Game not found' });
        }
        
        res.status(200).json(game);
    } catch (error) {
        console.error('Error in getGameById:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching game' });
    }
};

// @desc    Update a game (general purpose)
const updateGame = async (req, res) => {
    try {
        const game = await Game.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!game) {
            return res.status(404).json({ success: false, message: 'Game not found' });
        }

        res.status(200).json(game);
    } catch (error) {
        console.error('Error in updateGame:', error);
        res.status(500).json({ success: false, message: 'Server error while updating game' });
    }
};

// @desc    Feature a game and update its configuration
const featureGame = async (req, res) => {
    try {
        const { points, prizedAssigned, config } = req.body;
        const game = await Game.findByIdAndUpdate(
            req.params.id,
            {
                featured: true,
                points,
                prizedAssigned,
                config
            },
            { new: true }
        );

        if (!game) {
            return res.status(404).json({ success: false, message: 'Game not found' });
        }

        res.status(200).json(game);
    } catch (error) {
        console.error('Error in featureGame:', error);
        res.status(500).json({ success: false, message: 'Server error while featuring game' });
    }
};

// @desc    Unfeature a game
const unfeatureGame = async (req, res) => {
    try {
        const game = await Game.findByIdAndUpdate(
            req.params.id,
            {
                featured: false,
                prizedAssigned: []
            },
            { new: true }
        );

        if (!game) {
            return res.status(404).json({ success: false, message: 'Game not found' });
        }

        res.status(200).json(game);
    } catch (error) {
        console.error('Error in unfeatureGame:', error);
        res.status(500).json({ success: false, message: 'Server error while unfeaturing game' });
    }
};

// @desc    Record a slot machine spin result
const recordSlotMachineSpin = async (req, res) => {
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
};

// Export controller functions
module.exports = {
    getAllGames,
    getGameById,
    updateGame,
    featureGame,
    unfeatureGame,
    recordSlotMachineSpin
}; 