const Game = require('../models/Game');

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

module.exports = {
    getAllGames,
    featureGame,
    unfeatureGame
}; 