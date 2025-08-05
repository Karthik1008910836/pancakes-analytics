const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Outlet = sequelize.define('Outlet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 100]
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  pincode: {
    type: DataTypes.STRING(10),
    allowNull: true,
    validate: {
      len: [5, 10]
    }
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true,
    validate: {
      is: /^[0-9+\-\s()]+$/
    }
  },
  manager_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'outlets',
  indexes: [
    {
      unique: true,
      fields: ['name']
    }
  ]
});

module.exports = Outlet;