const Track = require('../models/Track');
const User = require('../models/User');
const Interaction = require('../models/Interaction');
const { sequelize } = require('../database/db');

const trackController = {
  // Get all tracks with optional filtering
  async getAllTracks(req, res, next) {
    try {
      const { genre, artist_id, limit = 50, offset = 0 } = req.query;
      const where = {};
      
      if (genre) where.genre = genre;
      if (artist_id) where.artist_id = artist_id;
      where.is_published = true;
      
      const tracks = await Track.findAndCountAll({
        where,
        include: [{
          model: User,
          as: 'artist',
          attributes: ['id', 'name', 'avatar_url']
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });
      
      res.json({
        total: tracks.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        tracks: tracks.rows
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Get single track by ID
  async getTrackById(req, res, next) {
    try {
      const track = await Track.findByPk(req.params.id, {
        include: [{
          model: User,
          as: 'artist',
          attributes: ['id', 'name', 'bio', 'avatar_url']
        }]
      });
      
      if (!track) {
        return res.status(404).json({ error: 'Track not found' });
      }
      
      // Increment play count when track is fetched (for streaming)
      if (req.query.record_play === 'true') {
        await track.increment('play_count');
        // Record interaction if user is authenticated
        if (req.user) {
          await Interaction.create({
            user_id: req.user.id,
            track_id: track.id,
            type: 'play',
            metadata: { source: 'api_stream', timestamp: new Date() }
          });
        }
      }
      
      res.json(track);
    } catch (error) {
      next(error);
    }
  },
  
  // Create new track
  async createTrack(req, res, next) {
    try {
      // For MVP, we'll assume user ID 1 for artists
      // In production with auth, this would come from req.user.id
      const trackData = {
        ...req.body,
        artist_id: req.body.artist_id || 1 // Temporary for MVP
      };
      
      const track = await Track.create(trackData);
      res.status(201).json(track);
    } catch (error) {
      next(error);
    }
  },
  
  // Update track
  async updateTrack(req, res, next) {
    try {
      const track = await Track.findByPk(req.params.id);
      
      if (!track) {
        return res.status(404).json({ error: 'Track not found' });
      }
      
      // Only artist or admin can update
      // For MVP, allow any update
      await track.update(req.body);
      res.json(track);
    } catch (error) {
      next(error);
    }
  },
  
  // Delete track
  async deleteTrack(req, res, next) {
    try {
      const track = await Track.findByPk(req.params.id);
      
      if (!track) {
        return res.status(404).json({ error: 'Track not found' });
      }
      
      await track.destroy();
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
  
  // Get track statistics
  async getTrackStats(req, res, next) {
    try {
      const track = await Track.findByPk(req.params.id);
      
      if (!track) {
        return res.status(404).json({ error: 'Track not found' });
      }
      
      const stats = await Interaction.findAll({
        where: { track_id: track.id },
        attributes: [
          'type',
          [sequelize.fn('COUNT', sequelize.col('type')), 'count'],
          [sequelize.fn('SUM', sequelize.col('purchase_amount')), 'total_revenue']
        ],
        group: ['type']
      });
      
      res.json({
        track: {
          id: track.id,
          title: track.title,
          play_count: track.play_count,
          like_count: track.like_count
        },
        interactions: stats
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = trackController;