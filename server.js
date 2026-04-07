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

// Routes
app.use('/api/t