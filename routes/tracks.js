const express = require('express');
const router = express.Router();
const trackController = require('../controllers/trackController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validateTrack, validateIdParam } = require('../middleware/validation');

// Public routes (with optional auth for play tracking)
router.get('/', optionalAuth, trackController.getAllTracks);
router.get('/:id', optionalAuth, validateIdParam, trackController.getTrackById);
router.get('/:id/stats', validateIdParam, trackController.getTrackStats);

// Protected routes (require authentication)
router.post('/', authenticate, validateTrack, trackController.createTrack);
router.put('/:id', authenticate, validateIdParam, validateTrack, trackController.updateTrack);
router.delete('/:id', authenticate, validateIdParam, trackController.deleteTrack);

module.exports = router;