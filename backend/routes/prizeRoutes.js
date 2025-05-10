// routes/prizeRoutes.js:   
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const prizecontroller = require('../controllers/prizeController');
// Get all prizes
router.get('/', prizecontroller.getAllPrizes);

// Create new prize (protected)
router.post('/', prizecontroller.addPrize);

// Delete prize (protected)
router.delete('/:id', prizecontroller.deletePrize);

module.exports = router;
