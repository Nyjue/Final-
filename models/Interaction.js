const { sequelize, DataTypes } = require('../database/db');

const Interaction = sequelize.define('Interaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  track_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tracks',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('play', 'like', 'comment', 'purchase', 'share'),
    allowNull: false
  },
  comment_text: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  purchase_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional interaction data'
  }
}, {
  tableName: 'interactions',
  indexes: [
    {
      fields: ['user_id', 'track_id']
    },
    {
      fields: ['track_id']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Interaction;