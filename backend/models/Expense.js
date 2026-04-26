const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Expense = sequelize.define('Expense', {
  expense_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  expense_type: { type: DataTypes.STRING(50), allowNull: false }, // Maintenance, Salary, Insurance, Marketing, Utilities, Other
  description: { type: DataTypes.STRING(255), allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  receipt_url: { type: DataTypes.STRING(500), allowNull: true },
  expense_date: { type: DataTypes.DATEONLY, allowNull: false },
  admin_notes: { type: DataTypes.TEXT, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'expenses', timestamps: false });

module.exports = Expense;
