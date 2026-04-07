const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');
const { validateInteraction, validateIdParam } = require('../middleware/validation');

// GET /api/interactions - Get all interactions
router.get('/', interactionController.getAllInteractions);

// GET /api/interactions/:id - Get interaction by ID
router.get('/:id', validateIdParam, interactionController.getInteractionById);

// GET /api/tracks/:track_id/interactions - Get interactions for a track
router.get('/tracks/:track_id/interactions', interactionController.getTrackInteractions);

// POST /api/interactions - Create new interaction
router.post('/', validateInteraction, interactionController.createInteraction);

// PUT /api/interactions/:id - Update interaction
router.put('/:id', validateIdParam, interactionController.updateInteraction);

// DELETE /api/interactions/:id - Delete interaction
router.delete('/:id', validateIdParam, interactionController.deleteInteraction);

module.exports = router;