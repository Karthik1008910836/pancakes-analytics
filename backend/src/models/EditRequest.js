const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EditRequest = sequelize.define('EditRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  daily_sales_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'daily_sales',
      key: 'id'
    }
  },
  requested_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [10, 500] // Minimum 10 characters, maximum 500
    }
  },
  proposed_changes: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'JSON object containing the proposed field changes'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  review_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: () => {
      const date = new Date();
      date.setDate(date.getDate() + 7); // Request expires in 7 days
      return date;
    }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'edit_requests',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['daily_sales_id']
    },
    {
      fields: ['requested_by']
    },
    {
      fields: ['status']
    },
    {
      fields: ['reviewed_by']
    }
  ]
});

module.exports = EditRequest;