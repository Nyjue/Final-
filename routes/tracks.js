const express = require('express');
const router = express.Router();
const trackController = require('../controllers/trackController');
const { validateTrack, validateIdParam } = require('../middleware/validation');

// GET /api/tracks - Get all tracks
router.get('/', trackController.getAllTracks);

// GET /api/tracks/:id - Get track by ID
router.get('/:id', validateIdParam, trackController.getTrackById);

// GET /api/tracks/:id/stats - Get track statistics
router.get('/:id/stats', validateIdParam, trackController.getTrackStats);

// POST /api/tracks - Create new track
router.post('/', validateTrack, trackController.createTrack);

// PUT /api/tracks/:id - Update track
router.put('/:id', validateIdParam, validateTrack, trackController.updateTrack);

// DELETE /api/tracks/:id - Delete track
router.delete('/:id', validateIdParam, trackController.deleteTrack);

module.exports = router;