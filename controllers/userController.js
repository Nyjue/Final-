const User = require('../models/User');
const Track = require('../models/Track');

const userController = {
  // Get all users
  async getAllUsers(req, res, next) {
    try {
      const { role, limit = 50, offset = 0 } = req.query;
      const where = {};
      
      if (role) where.role = role;
      
      const users = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      res.json({
        total: users.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        users: users.rows
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Get single user by ID
  async getUserById(req, res, next) {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password'] },
        include: [{
          model: Track,
          as: 'tracks',
          where: { is_published: true },
          required: false
        }]
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      next(error);
    }
  },
  
  // Create new user (register)
  async createUser(req, res, next) {
    try {
      const user = await User.create(req.body);
      const userResponse = user.toJSON();
      delete userResponse.password;
      
      res.status(201).json(userResponse);
    } catch (error) {
      next(error);
    }
  },
  
  // Update user
  async updateUser(req, res, next) {
    try {
      const user = await User.findByPk(req.params.id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Don't allow role updates through this endpoint for security
      delete req.body.role;
      
      await user.update(req.body);
      const userResponse = user.toJSON();
      delete userResponse.password;
      
      res.json(userResponse);
    } catch (error) {
      next(error);
    }
  },
  
  // Delete user
  async deleteUser(req, res, next) {
    try {
      const user = await User.findByPk(req.params.id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      await user.destroy();
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
  
  // Get user's dashboard (for artists)
  async getUserDashboard(req, res, next) {
    try {
      const user = await User.findByPk(req.params.id, {
        include: [{
          model: Track,
          as: 'tracks'
        }]
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const dashboard = {
        user: {
          id: user.id,
          name: user.name,
          role: user.role
        },
        stats: {}
      };
      
      if (user.role === 'artist') {
        const trackStats = user.tracks.reduce((acc, track) => {
          acc.total_plays += track.play_count;
          acc.total_likes += track.like_count;
          acc.total_tracks += 1;
          return acc;
        }, { total_plays: 0, total_likes: 0, total_tracks: 0 });
        
        dashboard.stats = trackStats;
        dashboard.tracks = user.tracks;
      }
      
      res.json(dashboard);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;