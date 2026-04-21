const { Track, User, Interaction } = require('../models');
const { sequelize } = require('../database/db');

const trackController = {
  // Get all tracks (public, with optional filtering)
  async getAllTracks(req, res, next) {
    try {
      const { genre, artist_id, limit = 50, offset = 0 } = req.query;
      const where = {};
      
      if (genre) where.genre = genre;
      if (artist_id) where.artist_id = artist_id;
      
      // Only show published tracks to non-artists
      if (!req.user || req.user.role !== 'admin') {
        where.is_published = true;
      }
      
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
  
  // Get single track by ID (with optional play recording)
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
      
      // Record play if requested (and user is authenticated)
      if (req.query.record_play === 'true' && req.user) {
        // Use transaction to ensure consistency
        const transaction = await sequelize.transaction();
        try {
          await track.increment('play_count', { transaction });
          await Interaction.create({
            user_id: req.user.id,
            track_id: track.id,
            type: 'play',
            metadata: { source: 'api_stream', timestamp: new Date() }
          }, { transaction });
          await transaction.commit();
        } catch (error) {
          await transaction.rollback();
          console.error('Failed to record play:', error);
        }
      }
      
      res.json(track);
    } catch (error) {
      next(error);
    }
  },
  
  // Create new track (artists only)
  async createTrack(req, res, next) {
    try {
      // Only artists and admins can create tracks
      if (req.user.role !== 'artist' && req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Only artists can upload tracks' 
        });
      }
      
      const trackData = {
        ...req.body,
        artist_id: req.user.role === 'admin' ? (req.body.artist_id || req.user.id) : req.user.id
      };
      
      const track = await Track.create(trackData);
      res.status(201).json(track);
    } catch (error) {
      next(error);
    }
  },
  
  // Update track (owner or admin only)
  async updateTrack(req, res, next) {
    try {
      const track = await Track.findByPk(req.params.id);
      
      if (!track) {
        return res.status(404).json({ error: 'Track not found' });
      }
      
      // Check ownership
      if (req.user.role !== 'admin' && track.artist_id !== req.user.id) {
        return res.status(403).json({ 
          error: 'You can only edit your own tracks' 
        });
      }
      
      await track.update(req.body);
      res.json(track);
    } catch (error) {
      next(error);
    }
  },
  
  // Delete track (owner or admin only)
  async deleteTrack(req, res, next) {
    try {
      const track = await Track.findByPk(req.params.id);
      
      if (!track) {
        return res.status(404).json({ error: 'Track not found' });
      }
      
      // Check ownership
      if (req.user.role !== 'admin' && track.artist_id !== req.user.id) {
        return res.status(403).json({ 
          error: 'You can only delete your own tracks' 
        });
      }
      
      await track.destroy();
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
  
  // Get track statistics (public)
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