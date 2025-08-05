const sequelize = require('../config/database');
const User = require('./User');
const Outlet = require('./Outlet');
const DailySales = require('./DailySales');
const MonthlyTarget = require('./MonthlyTarget');
const EditRequest = require('./EditRequest');

User.belongsTo(Outlet, { foreignKey: 'outlet_id', as: 'outlet' });
Outlet.hasMany(User, { foreignKey: 'outlet_id', as: 'users' });

DailySales.belongsTo(Outlet, { foreignKey: 'outlet_id', as: 'outlet' });
DailySales.belongsTo(User, { foreignKey: 'entered_by', as: 'enteredBy' });
Outlet.hasMany(DailySales, { foreignKey: 'outlet_id', as: 'dailySales' });
User.hasMany(DailySales, { foreignKey: 'entered_by', as: 'salesEntries' });

MonthlyTarget.belongsTo(Outlet, { foreignKey: 'outlet_id', as: 'outlet' });
MonthlyTarget.belongsTo(User, { foreignKey: 'created_by', as: 'createdBy' });
Outlet.hasMany(MonthlyTarget, { foreignKey: 'outlet_id', as: 'monthlyTargets' });
User.hasMany(MonthlyTarget, { foreignKey: 'created_by', as: 'createdTargets' });

// Edit Request associations
EditRequest.belongsTo(DailySales, { foreignKey: 'daily_sales_id', as: 'dailySales' });
EditRequest.belongsTo(User, { foreignKey: 'requested_by', as: 'requestedBy' });
EditRequest.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewedBy' });
DailySales.hasMany(EditRequest, { foreignKey: 'daily_sales_id', as: 'editRequests' });
User.hasMany(EditRequest, { foreignKey: 'requested_by', as: 'sentEditRequests' });
User.hasMany(EditRequest, { foreignKey: 'reviewed_by', as: 'reviewedEditRequests' });

const models = {
  User,
  Outlet,
  DailySales,
  MonthlyTarget,
  EditRequest,
  sequelize
};

module.exports = models;