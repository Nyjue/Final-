const Interaction = require('../models/Interaction');
const Track = require('../models/Track');
const User = require('../models/User');

const interactionController = {
  // Get all interactions (admin only in production)
  async getAllInteractions(req, res, next) {
    try {
      const { type, track_id, user_id, limit = 50, offset = 0 } = req.query;
      const where = {};
      
      if (type) where.type = type;
      if (track_id) where.track_id = track_id;
      if (user_id) where.user_id = user_id;
      
      const interactions = await Interaction.findAndCountAll({
        where,
        include: [
          { model: User, as: 'user', attributes: ['id', 'name'] },
          { model: Track, as: 'track', attributes: ['id', 'title'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });
      
      res.json({
        total: interactions.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        interactions: interactions.rows
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Get single interaction
  async getInteractionById(req, res, next) {
    try {
      const interaction = await Interaction.findByPk(req.params.id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'name'] },
          { model: Track, as: 'track', attributes: ['id', 'title'] }
        ]
      });
      
      if (!interaction) {
        return res.status(404).json({ error: 'Interaction not found' });
      }
      
      res.json(interaction);
    } catch (error) {
      next(error);
    }
  },
  
  // Create interaction (like, play, comment, purchase)
  async createInteraction(req, res, next) {
    try {
      const { track_id, type, comment_text, purchase_amount } = req.body;
      
      // Check if track exists
      const track = await Track.findByPk(track_id);
      if (!track) {
        return res.status(404).json({ error: 'Track not found' });
      }
      
      // Create interaction
      const interaction = await Interaction.create({
        user_id: req.body.user_id || 3, // Temporary for MVP
        track_id,
        type,
        comment_text,
        purchase_amount
      });
      
      // Update track counts based on interaction type
      if (type === 'play') {
        await track.increment('play_count');
      } else if (type === 'like') {
        await track.increment('like_count');
      }
      
      res.status(201).json(interaction);
    } catch (error) {
      next(error);
    }
  },
  
  // Update interaction (e.g., edit comment)
  async updateInteraction(req, res, next) {
    try {
      const interaction = await Interaction.findByPk(req.params.id);
      
      if (!interaction) {
        return res.status(404).json({ error: 'Interaction not found' });
      }
      
      // Only allow updating comments
      if (interaction.type !== 'comment') {
        return res.status(400).json({ error: 'Only comments can be updated' });
      }
      
      await interaction.update({ comment_text: req.body.comment_text });
      res.json(interaction);
    } catch (error) {
      next(error);
    }
  },
  
  // Delete interaction
  async deleteInteraction(req, res, next) {
    try {
      const interaction = await Interaction.findByPk(req.params.id);
      
      if (!interaction) {
        return res.status(404).json({ error: 'Interaction not found' });
      }
      
      // Update track counts if needed
      if (interaction.type === 'like') {
        await Track.decrement('like_count', { where: { id: interaction.track_id } });
      }
      
      await interaction.destroy();
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
  
  // Get interactions for a specific track
  async getTrackInteractions(req, res, next) {
    try {
      const { track_id } = req.params;
      const { type } = req.query;
      
      const where = { track_id };
      if (type) where.type = type;
      
      const interactions = await Interaction.findAll({
        where,
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar_url'] }],
        order: [['created_at', 'DESC']]
      });
      
      res.json(interactions);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = interactionController;