const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const gameController = require('../controllers/gameController');

// Get all games
router.get('/', gameController.getAllGames);

// Feature a game and update its configuration
router.patch('/:id/feature',  gameController.featureGame);

// Unfeature a game
router.patch('/:id/unfeature', gameController.unfeatureGame);

module.exports = router; 