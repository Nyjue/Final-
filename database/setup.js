const { sequelize, User, Track, Interaction } = require('../models');

async function setupDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync all models (force: true drops existing tables)
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