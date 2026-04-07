const { sequelize } = require('./db');
const User = require('../models/User');
const Track = require('../models/Track');
const Interaction = require('../models/Interaction');

// Define associations
User.hasMany(Track, { foreignKey: 'artist_id', as: 'tracks' });
Track.belongsTo(User, { foreignKey: 'artist_id', as: 'artist' });

User.hasMany(Interaction, { foreignKey: 'user_id', as: 'interactions' });
Interaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Track.hasMany(Interaction, { foreignKey: 'track_id', as: 'interactions' });
Interaction.belongsTo(Track, { foreignKey: 'track_id', as: 'track' });

async function setupDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync all models
    await sequelize.sync({ force: true });
    console.log('All models synchronized successfully.');
    
    console.log('Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Unable to set up database:', error);
    process.exit(1);
  }
}

setupDatabase();