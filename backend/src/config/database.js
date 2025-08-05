const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use SQLite for demo when PostgreSQL is not available
const usePostgreSQL = process.env.DB_HOST && process.env.DB_PASSWORD;

const sequelize = usePostgreSQL ? new Sequelize(
  process.env.DB_NAME || 'pancakes_analytics',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
) : new Sequelize({
  dialect: 'sqlite',
  storage: './pancakes_demo.db',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

module.exports = sequelize;