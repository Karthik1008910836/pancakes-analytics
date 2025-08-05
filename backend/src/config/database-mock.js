// Mock database for demo purposes when PostgreSQL is not accessible
const { DataTypes } = require('sequelize');
const { Sequelize } = require('sequelize');

// Use SQLite in-memory database for demonstration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: console.log,
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

module.exports = sequelize;