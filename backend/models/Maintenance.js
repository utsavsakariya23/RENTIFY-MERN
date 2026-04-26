const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Maintenance = sequelize.define('Maintenance', {
  maintenance_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  car_id: { type: DataTypes.INTEGER, allowNull: false },
  issue_description: { type: DataTypes.TEXT, allowNull: false },
  maintenance_type: {
    type: DataTypes.STRING(50),
    defaultValue: 'General' // General, Engine, Tyre, Electrical, Body, AC, Brakes, Other
  },
  scheduled_date: { type: DataTypes.DATEONLY, allowNull: false },
  completed_date: { type: DataTypes.DATEONLY, allowNull: true },
  next_maintenance_date: { type: DataTypes.DATEONLY, allowNull: true },
  cost: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'Scheduled' // Scheduled, In Progress, Completed
  },
  technician_notes: { type: DataTypes.TEXT, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'maintenance_records', timestamps: false });

module.exports = Maintenance;
