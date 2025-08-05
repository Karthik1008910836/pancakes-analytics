const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MonthlyTarget = sequelize.define('MonthlyTarget', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  outlet_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'outlets',
      key: 'id'
    }
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 2020,
      max: 2050
    }
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12
    }
  },
  target_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  daily_target: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'monthly_targets',
  indexes: [
    {
      unique: true,
      fields: ['outlet_id', 'year', 'month']
    },
    {
      fields: ['outlet_id']
    },
    {
      fields: ['year', 'month']
    }
  ]
});

MonthlyTarget.prototype.getDaysInMonth = function() {
  return new Date(this.year, this.month, 0).getDate();
};

MonthlyTarget.prototype.getCalculatedDailyTarget = function() {
  const daysInMonth = this.getDaysInMonth();
  return daysInMonth > 0 ? (this.target_amount / daysInMonth).toFixed(2) : 0;
};

module.exports = MonthlyTarget;