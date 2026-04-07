require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./database/db');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const trackRoutes = require('./routes/tracks');
const userRoutes = require('./routes/users');
const interactionRoutes = require('./routes/interactions');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Routes - THIS IS THE IMPORTANT PART
app.use('/api/tracks', trackRoutes);
app.use('/api/users', userRoutes);
app.use('/api/interactions', interactionRoutes);

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'Music Artist Platform API is running!' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Database connected`);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
});