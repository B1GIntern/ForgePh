// const express = require('express');
// const router = express.Router();
// const FlashPromo = require('../models/FlashPromo');
// const auth = require('../middleware/auth');

// // Create a new flash promo
// router.post('/', auth, async (req, res) => {
//   try {
//     const flashPromo = new FlashPromo({
//       ...req.body,
//       currentParticipants: 0,
//       participants: []
//     });
//     await flashPromo.save();
//     res.status(201).send(flashPromo);
//   } catch (error) {
//     res.status(400).send({ error: error.message });
//   }
// });

// // Get all flash promos
// router.get('/', async (req, res) => {
//   try {
//     const flashPromos = await FlashPromo.find().sort({ createdAt: -1 });
//     res.send(flashPromos);
//   } catch (error) {
//     res.status(500).send({ error: error.message });
//   }
// });

// // Get active flash promos
// router.get('/active', async (req, res) => {
//   try {
//     const now = new Date();
//     const activePromos = await FlashPromo.find({
//       isActive: true,
//       startDate: { $lte: now },
//       endDate: { $gte: now }
//     }).sort({ createdAt: -1 });
//     res.send(activePromos);
//   } catch (error) {
//     res.status(500).send({ error: error.message });
//   }
// });

// // Update flash promo status
// router.patch('/:id/status', auth, async (req, res) => {
//   try {
//     const flashPromo = await FlashPromo.findById(req.params.id);
//     if (!flashPromo) {
//       return res.status(404).send({ error: 'Flash promo not found' });
//     }

//     flashPromo.isActive = req.body.isActive;
//     await flashPromo.save();
//     res.send(flashPromo);
//   } catch (error) {
//     res.status(400).send({ error: error.message });
//   }
// });

// // Delete flash promo
// router.delete('/:id', auth, async (req, res) => {
//   try {
//     const flashPromo = await FlashPromo.findByIdAndDelete(req.params.id);
//     if (!flashPromo) {
//       return res.status(404).send({ error: 'Flash promo not found' });
//     }
//     res.send(flashPromo);
//   } catch (error) {
//     res.status(500).send({ error: error.message });
//   }
// });

// // Join flash promo
// router.post('/:id/join', auth, async (req, res) => {
//   try {
//     const flashPromo = await FlashPromo.findById(req.params.id);
//     if (!flashPromo) {
//       return res.status(404).send({ error: 'Flash promo not found' });
//     }

//     await flashPromo.addParticipant(req.user._id);
//     res.send(flashPromo);
//   } catch (error) {
//     res.status(400).send({ error: error.message });
//   }
// });

// // Leave flash promo
// router.post('/:id/leave', auth, async (req, res) => {
//   try {
//     const flashPromo = await FlashPromo.findById(req.params.id);
//     if (!flashPromo) {
//       return res.status(404).send({ error: 'Flash promo not found' });
//     }

//     await flashPromo.removeParticipant(req.user._id);
//     res.send(flashPromo);
//   } catch (error) {
//     res.status(400).send({ error: error.message });
//   }
// });

// module.exports = router; 