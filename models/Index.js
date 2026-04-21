const { sequelize } = require('../database/db');
const User = require('./User');
const Track = require('./Track');
const Interaction = require('./Interaction');

// User - Track associations (with CASCADE delete)
User.hasMany(Track, { 
  foreignKey: 'artist_id', 
  as: 'tracks',
  onDelete: 'CASCADE',
  hooks: true
});
Track.belongsTo(User, { foreignKey: 'artist_id', as: 'artist' });

// User - Interaction associations
User.hasMany(Interaction, { 
  foreignKey: 'user_id', 
  as: 'interactions',
  onDelete: 'CASCADE',
  hooks: true
});
Interaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Track - Interaction associations (with CASCADE delete)
Track.hasMany(Interaction, { 
  foreignKey: 'track_id', 
  as: 'interactions',
  onDelete: 'CASCADE',
  hooks: true
});
Interaction.belongsTo(Track, { foreignKey: 'track_id', as: 'track' });

module.exports = { sequelize, User, Track, Interaction };